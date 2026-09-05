import json
import os
import re
import ssl
import time
import urllib.error
import urllib.request

SUBS = [s.strip() for s in os.environ["SUBREDDITS"].split(",") if s.strip()]
CONFIGMAP = os.environ["CONFIGMAP_NAME"]
LIMIT = int(os.environ.get("FEED_LIMIT", "15"))
SPACING = int(os.environ.get("FETCH_SPACING", "45"))
RETRIES = int(os.environ.get("FETCH_RETRIES", "2"))
RETRY_WAIT = int(os.environ.get("RETRY_WAIT", "60"))
USER_AGENT = os.environ.get("FEED_USER_AGENT", "glance-homelab-feeds/1.0")

SA = "/var/run/secrets/kubernetes.io/serviceaccount"
API = "https://kubernetes.default.svc"

with open(SA + "/namespace") as fh:
    NAMESPACE = fh.read().strip()
with open(SA + "/token") as fh:
    TOKEN = fh.read().strip()

K8S_CTX = ssl.create_default_context(cafile=SA + "/ca.crt")
CM_PATH = "/api/v1/namespaces/%s/configmaps" % NAMESPACE


def k8s(method, path, body=None, content_type="application/json"):
    req = urllib.request.Request(
        API + path,
        method=method,
        headers={"Authorization": "Bearer " + TOKEN, "Content-Type": content_type},
    )
    data = json.dumps(body).encode() if body is not None else None
    with urllib.request.urlopen(req, data=data, context=K8S_CTX, timeout=30) as resp:
        return json.load(resp)


def fetch(sub):
    url = "https://www.reddit.com/r/%s/hot/.rss?limit=%d" % (sub, LIMIT)
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    for attempt in range(RETRIES + 1):
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.read().decode("utf-8")
        except urllib.error.HTTPError as err:
            if err.code in (403, 429) and attempt < RETRIES:
                print("  r/%s %d, retrying in %ds" % (sub, err.code, RETRY_WAIT), flush=True)
                time.sleep(RETRY_WAIT)
                continue
            raise


def strip_content(xml):
    return re.sub(r"<content type=\"html\">.*?</content>", "", xml, flags=re.S)


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

for index, sub in enumerate(SUBS):
    if index:
        time.sleep(SPACING)
    try:
        xml = strip_content(fetch(sub))
        entries = xml.count("<entry>")
        if entries == 0:
            raise ValueError("feed returned 0 entries")
        data["%s.xml" % sub] = xml
        updated.append("%s(%d)" % (sub, entries))
    except Exception as err:
        print("  r/%s FAILED: %s" % (sub, err), flush=True)
        kept.append(sub)

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

if not updated:
    raise SystemExit(1)
