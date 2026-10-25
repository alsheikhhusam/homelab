// Jobs widget: renders into [data-jobs-widget] from the host's webhook
// (/jobs/status, routed by Cloudflare to homelab-jobs-webhook on the host).
// Toggles start/stop long-running units (green = running, gray = off);
// buttons start one-off units and show the last run's result.
(function () {
  "use strict";
  var IDLE_MS = 10000, BUSY_MS = 3000;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function ago(ts) {
    var s = Math.max(0, Math.floor(Date.now() / 1000 - ts));
    if (s < 60) return s + "s";
    if (s < 3600) return Math.floor(s / 60) + "m";
    if (s < 86400) return Math.floor(s / 3600) + "h";
    return Math.floor(s / 86400) + "d";
  }
  function since(ts) {
    var s = el("span", null, ago(ts));
    s.dataset.ts = ts;
    return s;
  }
  function busy(j) {
    return j.state === "activating" || j.state === "deactivating" ||
      (j.kind === "button" && j.state === "active");
  }

  function addStyle() {
    if (document.getElementById("jw-style")) return;
    var s = el("style"); s.id = "jw-style";
    s.textContent =
      ".jw-row{display:flex;align-items:center;justify-content:space-between;gap:1rem;}" +
      ".jw-dot{display:inline-block;width:.8rem;height:.8rem;border-radius:50%;margin-right:.8rem;background:var(--color-text-subdue);opacity:.6;flex-shrink:0;}" +
      ".jw-dot.on{background:var(--color-positive);opacity:1;box-shadow:0 0 .6rem var(--color-positive);}" +
      ".jw-dot.bad{background:var(--color-negative);opacity:1;}" +
      ".jw-toggle{position:relative;width:3.8rem;height:2.1rem;border-radius:2rem;border:none;cursor:pointer;flex-shrink:0;background:var(--color-widget-background-highlight);outline:1px solid var(--color-widget-content-border);transition:background .2s;}" +
      ".jw-toggle::after{content:'';position:absolute;top:.3rem;left:.3rem;width:1.5rem;height:1.5rem;border-radius:50%;background:var(--color-text-subdue);transition:transform .2s,background .2s;}" +
      ".jw-toggle.on{background:var(--color-positive);outline-color:var(--color-positive);}" +
      ".jw-toggle.on::after{transform:translateX(1.7rem);background:var(--color-widget-background);}" +
      ".jw-btn{flex-shrink:0;cursor:pointer;font:inherit;font-size:1.2rem;padding:.3rem 1.2rem;border-radius:var(--border-radius);color:var(--color-text-highlight);background:var(--color-widget-background-highlight);border:1px solid var(--color-widget-content-border);}" +
      ".jw-btn:hover:not(:disabled){border-color:var(--color-primary);color:var(--color-primary);}" +
      ".jw-toggle:disabled,.jw-btn:disabled{cursor:default;opacity:.55;}";
    document.head.appendChild(s);
  }

  function build(root) {
    var jobs = [], pending = {}, timer = null, error = "";

    function schedule() {
      clearTimeout(timer);
      var fast = jobs.some(busy) || Object.keys(pending).length > 0;
      timer = setTimeout(refresh, fast ? BUSY_MS : IDLE_MS);
    }
    function accept(data) {
      if (data && data.jobs) { jobs = data.jobs; error = ""; }
      else error = (data && data.error) || "Jobs agent error";
    }
    function refresh() {
      if (document.hidden) { schedule(); return; }
      fetch("/jobs/status", { cache: "no-store", credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(accept, function () { error = "Jobs agent unreachable"; })
        .then(function () { render(); schedule(); });
    }
    function act(job, action) {
      pending[job.id] = true; render();
      fetch("/jobs/run?job=" + encodeURIComponent(job.id) + "&action=" + action, {
        method: "POST", cache: "no-store", credentials: "same-origin",
        headers: { "X-Requested-With": "glance" }
      })
        .then(function (r) { return r.json(); })
        .then(accept, function () { error = "Couldn't reach the jobs agent"; })
        .then(function () { delete pending[job.id]; render(); schedule(); });
    }

    function status(j) {
      var line = el("div", "size-h6 color-subdue");
      if (j.kind === "toggle") {
        if (j.state === "active") {
          line.className = "size-h6 color-positive";
          line.textContent = "Running";
          if (j.started) line.append(" · ", since(j.started));
          if (j.url) {
            line.appendChild(document.createTextNode(" · "));
            var a = el("a", "color-positive", "open ↗");
            a.href = j.url; a.target = "_blank"; a.rel = "noreferrer";
            line.appendChild(a);
          }
        } else if (j.state === "activating") line.textContent = "Starting…";
        else if (j.state === "deactivating") line.textContent = "Stopping…";
        else if (j.state === "failed") { line.className = "size-h6 color-negative"; line.textContent = "Failed"; }
        else line.textContent = "Off";
      } else if (busy(j)) {
        line.className = "size-h6 color-primary";
        line.textContent = "Running…";
        if (j.started) line.append(" ", since(j.started));
      } else if (!j.finished) line.textContent = "Never run";
      else if (j.result === "success") line.append("✓ ", since(j.finished), " ago");
      else { line.className = "size-h6 color-negative"; line.append("✗ failed ", since(j.finished), " ago"); }
      return line;
    }

    function control(j) {
      var wait = !!pending[j.id] || busy(j);
      if (j.kind === "toggle") {
        var on = j.state === "active" || j.state === "activating";
        var t = el("button", "jw-toggle" + (on ? " on" : ""));
        t.title = on ? "Turn off" : "Turn on";
        t.setAttribute("role", "switch");
        t.setAttribute("aria-checked", on ? "true" : "false");
        t.disabled = wait;
        t.addEventListener("click", function () { act(j, on ? "stop" : "start"); });
        return t;
      }
      var b = el("button", "jw-btn", wait ? "Running" : "Run");
      b.disabled = wait;
      b.addEventListener("click", function () { act(j, "start"); });
      return b;
    }

    function render() {
      root.innerHTML = "";
      if (error) root.appendChild(el("div", "color-negative size-h5 margin-bottom-10", error));
      var ul = el("ul", "list list-gap-14");
      jobs.forEach(function (j) {
        var li = el("li", "jw-row");
        var left = el("div", "flex items-center min-width-0");
        var dot = el("span", "jw-dot");
        if (j.state === "active" || j.state === "activating") dot.classList.add("on");
        else if (j.state === "failed" || (j.kind === "button" && j.finished && j.result !== "success")) dot.classList.add("bad");
        var text = el("div", "min-width-0");
        text.appendChild(el("div", "color-highlight text-truncate", j.label));
        text.appendChild(status(j));
        left.appendChild(dot); left.appendChild(text);
        li.appendChild(left); li.appendChild(control(j));
        ul.appendChild(li);
      });
      root.appendChild(ul);
    }

    addStyle();
    refresh();
    setInterval(function () {
      var spans = root.querySelectorAll("[data-ts]");
      for (var i = 0; i < spans.length; i++) spans[i].textContent = ago(Number(spans[i].dataset.ts));
    }, 1000);
    document.addEventListener("visibilitychange", function () { if (!document.hidden) refresh(); });
  }

  function init(node) {
    if (node.dataset.jobsInit) return;
    node.dataset.jobsInit = "1";
    try { build(node); } catch (e) { node.textContent = "Jobs unavailable"; }
  }
  function scan() {
    var nodes = document.querySelectorAll("[data-jobs-widget]");
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }
  if (document.readyState !== "loading") scan();
  document.addEventListener("DOMContentLoaded", scan);
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
