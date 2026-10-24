// Lets group-widget tabs (e.g. the subreddit tabs) be reordered by dragging,
// with the same feel as Glance's to-do list: the grabbed tab follows the
// cursor, a dashed decoy marks its slot and neighbours slide out of the way.
// The order is saved per browser in localStorage and applied to titles +
// panels before Glance wires up the group, because Glance switches tabs by
// index. While dragging only the titles move; the panels keep their order, so
// Glance's index-based click handlers stay correct.
(function () {
  "use strict";
  var PREFIX = "glance-tab-order:";
  var THRESHOLD = 5;
  var EDGE = 30;
  var EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
  var press = null;
  var drag = null;
  var suppressClick = false;
  var nativeAnimate = Element.prototype.animate;

  function titlesOf(header) { return Array.prototype.slice.call(header.children); }
  function label(title) { return title.textContent.trim(); }

  function load(key) {
    try { return JSON.parse(localStorage.getItem(PREFIX + key)) || []; } catch (e) { return []; }
  }
  function save(header) {
    try { localStorage.setItem(PREFIX + header.dataset.tabOrderKey, JSON.stringify(titlesOf(header).map(label))); } catch (e) {}
  }

  function setCurrent(title, panel, on) {
    title.classList.toggle("widget-group-title-current", on);
    title.setAttribute("aria-selected", String(on));
    panel.classList.toggle("widget-group-content-current", on);
    panel.setAttribute("aria-hidden", String(!on));
  }

  function applySavedOrder(header, panels) {
    var saved = load(header.dataset.tabOrderKey);
    if (!saved.length) return;
    var titles = titlesOf(header);
    var tabs = Array.prototype.slice.call(panels.children);
    if (tabs.length !== titles.length) return;
    function rank(i) { var r = saved.indexOf(label(titles[i])); return r < 0 ? saved.length + i : r; }
    var order = titles.map(function (_, i) { return i; }).sort(function (a, b) { return rank(a) - rank(b); });
    order.forEach(function (i) { header.appendChild(titles[i]); panels.appendChild(tabs[i]); });
    setCurrent(titles[0], tabs[0], false);
    setCurrent(titles[order[0]], tabs[order[0]], true);
  }

  function animateReposition(element, onEnd) {
    var before = element.getBoundingClientRect();
    return function () {
      var after = element.getBoundingClientRect();
      var anim = nativeAnimate.call(element,
        [{ transform: "translate(" + (before.x - after.x) + "px, " + (before.y - after.y) + "px)" }, { transform: "none" }],
        { duration: 400, easing: EASE }
      );
      if (onEnd) anim.onfinish = onEnd;
    };
  }

  function grab(e) {
    var title = press.title;
    var rect = title.getBoundingClientRect();
    var style = getComputedStyle(title);
    var decoy = document.createElement("div");
    decoy.className = "drag-and-drop-decoy";
    decoy.style.cssText = "flex-shrink:0;outline-offset:-1px;width:" + style.width + ";height:" + style.height;

    var floater = document.createElement("div");
    floater.className = "drag-and-drop-draggable";
    floater.style.cssText = "position:fixed;z-index:100;left:0;top:" + rect.top + "px;font-size:" + style.fontSize;
    title.replaceWith(decoy);
    floater.appendChild(title);
    document.body.appendChild(floater);
    nativeAnimate.call(decoy, [{ transform: "scale(.9)", opacity: 0 }, { transform: "none" }], { duration: 300, easing: "ease" });
    document.body.style.cursor = "grabbing";

    drag = { header: press.header, title: title, decoy: decoy, floater: floater, offsetX: press.x - rect.left, width: rect.width, x: e.clientX };
    press = null;
  }

  function reposition() {
    var header = drag.header;
    var scroller = header.parentNode;
    var box = scroller.getBoundingClientRect();
    var left = Math.min(Math.max(drag.x - drag.offsetX, box.left - drag.width / 2), box.right - drag.width / 2);
    drag.floater.style.transform = "translateX(" + left + "px)";

    if (drag.x < box.left + EDGE) scroller.scrollLeft -= 10;
    else if (drag.x > box.right - EDGE) scroller.scrollLeft += 10;

    var right = left + drag.width;
    var prev = drag.decoy.previousElementSibling;
    var next = drag.decoy.nextElementSibling;
    var sibling = null;
    if (next && !next.animating) {
      var n = next.getBoundingClientRect();
      if (right > n.left + n.width / 2) sibling = next;
    }
    if (!sibling && prev && !prev.animating) {
      var p = prev.getBoundingClientRect();
      if (left < p.left + p.width / 2) sibling = prev;
    }
    if (!sibling) return;

    var moveDecoy = animateReposition(drag.decoy);
    var moveSibling = animateReposition(sibling, function () {
      sibling.animating = false;
      if (drag) reposition();
    });
    sibling.animating = true;
    if (sibling === next) drag.decoy.before(sibling); else drag.decoy.after(sibling);
    moveDecoy();
    moveSibling();
  }

  function release() {
    var d = drag;
    drag = null;
    var settle = animateReposition(d.title);
    d.decoy.replaceWith(d.title);
    d.floater.remove();
    document.body.style.cursor = "";
    settle();
    save(d.header);
    suppressClick = true;
    setTimeout(function () { suppressClick = false; }, 0);
  }

  function init(header) {
    var panels = header.closest(".widget-type-group").querySelector(".widget-group-contents");
    if (!panels || !header.firstElementChild) return;
    header.dataset.tabOrderKey = label(header.firstElementChild);
    applySavedOrder(header, panels);

    var from = 0;
    header.addEventListener("mousedown", function (e) {
      var title = e.target.closest(".widget-group-title");
      if (e.button !== 0 || !title || drag) return;
      e.preventDefault();
      press = { header: header, title: title, x: e.clientX };
    });
    header.addEventListener("click", function (e) {
      if (suppressClick) {
        suppressClick = false;
        e.stopPropagation();
        e.preventDefault();
        return;
      }
      from = titlesOf(header).findIndex(function (t) { return t.classList.contains("widget-group-title-current"); });
    }, true);
    header.addEventListener("click", function (e) {
      var title = e.target.closest(".widget-group-title");
      var panel = title && document.getElementById(title.getAttribute("aria-controls"));
      var to = titlesOf(header).indexOf(title);
      if (panel && to !== from) panel.dataset.direction = from < to ? "right" : "left";
    });
  }

  document.addEventListener("mousemove", function (e) {
    if (press && Math.abs(e.clientX - press.x) >= THRESHOLD) grab(e);
    if (!drag) return;
    e.preventDefault();
    drag.x = e.clientX;
    reposition();
  });
  document.addEventListener("mouseup", function () {
    press = null;
    if (drag) release();
  });
  window.addEventListener("scroll", function () {
    if (drag) drag.floater.style.top = drag.decoy.getBoundingClientRect().top + "px";
  }, true);

  function scan() {
    document.querySelectorAll(".widget-group-header > .widget-header:not([data-tab-order-key])").forEach(init);
  }
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
