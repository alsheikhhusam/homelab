import json
import os
import re
import ssl
import time
import urllib.error
import urllib.request

GROUPS = [[s for s in g.split(",") if s] for g in os.environ["FEED_GROUPS"].split(";") if g]
CONFIGMAP = os.environ["CONFIGMAP_NAME"]
LIMIT = int(os.environ.get("FEED_LIMIT", "15"))
GROUP_LIMIT = int(os.environ.get("GROUP_LIMIT", "100"))
SPACING = int(os.environ.get("FETCH_SPACING", "60"))
RETRIES = int(os.environ.get("FETCH_RETRIES", "2"))
RETRY_WAIT = int(os.environ.get("RETRY_WAIT", "60"))
USER_AGENT = os.environ.get("FEED_USER_AGENT", "glance-homelab-feeds/1.0")
TIME_BUDGET = int(os.environ.get("TIME_BUDGET", "900"))
REQUEST_TIMEOUT = int(os.environ.get("REQUEST_TIMEOUT", "40"))

START = time.monotonic()


def remaining():
    return TIME_BUDGET - (time.monotonic() - START)

SA = "/var/run/secrets/kubernetes.io/serviceaccount"
API = "https://kubernetes.default.svc"

with open(SA + "/namespace") as fh:
    NAMESPACE = fh.read().strip()
with open(SA + "/token") as fh:
    TOKEN = fh.read().strip()

K8S_CTX = ssl.create_default_context(cafile=SA + "/ca.crt")
CM_PATH = "/api/v1/namespaces/%s/configmaps" % NAMESPACE

ENTRY_RE = re.compile(r"<entry>.*?</entry>", re.S)
CATEGORY_RE = re.compile(r"<category[^>]*term=\"([^\"]+)\"")
FEED_OPEN_RE = re.compile(r"<feed[^>]*>")
CONTENT_RE = re.compile(r"<content type=\"html\">.*?</content>", re.S)


def k8s(method, path, body=None, content_type="application/json"):
    req = urllib.request.Request(
        API + path,
        method=method,
        headers={"Authorization": "Bearer " + TOKEN, "Content-Type": content_type},
    )
    data = json.dumps(body).encode() if body is not None else None
    with urllib.request.urlopen(req, data=data, context=K8S_CTX, timeout=30) as resp:
        return json.load(resp)


def fetch(group):
    url = "https://www.reddit.com/r/%s/hot/.rss?limit=%d" % ("+".join(group), GROUP_LIMIT)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(RETRIES + 1):
        left = remaining()
        if left < 10:
            raise TimeoutError("time budget exhausted")
        try:
            with urllib.request.urlopen(req, timeout=min(REQUEST_TIMEOUT, left)) as resp:
                return resp.read().decode("utf-8")
        except urllib.error.HTTPError as err:
            retriable = err.code in (403, 429) and attempt < RETRIES
            if retriable and remaining() > RETRY_WAIT + 10:
                print("  %s %d, retrying in %ds" % ("+".join(group), err.code, RETRY_WAIT), flush=True)
                time.sleep(RETRY_WAIT)
                continue
            raise


def split_group(xml, group):
    feed_open = FEED_OPEN_RE.search(xml)
    if not feed_open:
        raise ValueError("no <feed> element in response")
    header = feed_open.group(0)

    wanted = {name.lower(): name for name in group}
    buckets = {name: [] for name in group}

    for entry in ENTRY_RE.findall(xml):
        term = CATEGORY_RE.search(entry)
        if not term:
            continue
        name = wanted.get(term.group(1).lower())
        if name is None:
            continue
        if len(buckets[name]) < LIMIT:
            buckets[name].append(CONTENT_RE.sub("", entry))

    return header, buckets


def build_feed(header, name, entries):
    return "".join([
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n",
        header,
        "<title>r/%s</title>" % name,
        "".join(entries),
        "</feed>",
    ])


def load_existing():
    try:
        return k8s("GET", CM_PATH + "/" + CONFIGMAP).get("data") or {}
    except urllib.error.HTTPError as err:
        if err.code == 404:
            return None
        raise


existing = load_existing()
data = dict(existing or {})
updated, kept = [], []

skipped = []

for index, group in enumerate(GROUPS):
    if index:
        if remaining() < SPACING + 15:
            skipped = [name for rest in GROUPS[index:] for name in rest]
            print("  time budget reached, skipping: %s" % " ".join(skipped), flush=True)
            kept.extend(skipped)
            break
        time.sleep(SPACING)
    label = "+".join(group)
    try:
        header, buckets = split_group(fetch(group), group)
    except Exception as err:
        print("  %s FAILED: %s" % (label, err), flush=True)
        kept.extend(group)
        continue
    for name in group:
        entries = buckets[name]
        if not entries:
            print("  r/%s no entries in group response" % name, flush=True)
            kept.append(name)
            continue
        data["%s.xml" % name] = build_feed(header, name, entries)
        updated.append("%s(%d)" % (name, len(entries)))

if existing is None:
    k8s("POST", CM_PATH, {
        "apiVersion": "v1",
        "kind": "ConfigMap",
        "metadata": {"name": CONFIGMAP, "namespace": NAMESPACE},
        "data": data,
    })
else:
    k8s("PATCH", CM_PATH + "/" + CONFIGMAP, {"data": data},
        content_type="application/merge-patch+json")

print("updated: %s" % (" ".join(updated) or "none"), flush=True)
print("kept previous: %s" % (" ".join(kept) or "none"), flush=True)
print("elapsed: %ds of %ds budget" % (time.monotonic() - START, TIME_BUDGET), flush=True)

if not updated:
    raise SystemExit(1)
