// "Ayah of the day" banner above the page columns. A new ayah is picked per
// calendar day (browser local time) by stepping through all 6236 ayahs with a
// stride coprime to 6236, so none repeats until every one has been shown.
// Closing it hides it until the next day; at midnight a new one appears even if
// the page stays open. Uthmani text from api.alquran.cloud.
(function () {
  "use strict";
  var KEY = "ayah-dismissed";
  var TOTAL = 6236;
  var STRIDE = 2617;
  var API = "https://api.alquran.cloud/v1/ayah/";
  var arDigits = new Intl.NumberFormat("ar-u-nu-arab");
  var closeSvg = '<svg stroke="currentColor" fill="none" viewBox="0 0 24 24" stroke-width="1.5" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12"/></svg>';
  var day = null;

  function pad(n) { return n < 10 ? "0" + n : String(n); }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }
  function ayahNumber(key) {
    var p = key.split("-");
    var n = Math.floor(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5);
    return (n * STRIDE) % TOTAL + 1;
  }
  function dismissed(key) {
    try { return localStorage.getItem(KEY) === key; } catch (e) { return false; }
  }
  function dismiss(key) {
    try { localStorage.setItem(KEY, key); } catch (e) {}
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function removeBanner() {
    var b = document.querySelector(".ayah-banner");
    if (b) b.remove();
  }

  function render(key, ar) {
    var columns = document.querySelector("#page-content .page-columns");
    if (!columns || day !== key) return;
    removeBanner();

    var banner = el("div", "widget ayah-banner");
    banner.style.marginBottom = "var(--widget-gap)";

    var header = el("div", "widget-header");
    header.appendChild(el("h2", "uppercase", "Ayah of the day"));
    var close = el("button", "color-subdue");
    close.title = "Hide until tomorrow";
    close.innerHTML = closeSvg;
    close.style.cssText = "margin-left:auto;background:none;border:none;cursor:pointer;display:flex;padding:0";
    close.addEventListener("click", function () { dismiss(key); removeBanner(); });
    header.appendChild(close);

    var content = el("div", "widget-content");
    content.style.textAlign = "center";
    var arabic = el("p", "color-highlight", ar.text.replace(/ ([\u06D6-\u06DC])/g, "$1"));
    arabic.dir = "rtl";
    arabic.lang = "ar";
    arabic.style.cssText = "font-family:'Amiri Quran',serif;font-size:3.4rem;line-height:2.1";
    var ref = el("a", "color-base", ar.surah.name + "، الآية " + arDigits.format(ar.numberInSurah));
    ref.dir = "rtl";
    ref.lang = "ar";
    ref.href = "https://quran.com/" + ar.surah.number + "/" + ar.numberInSurah;
    ref.target = "_blank";
    ref.rel = "noreferrer";
    ref.style.cssText = "display:inline-block;margin-top:0.8rem;font-family:Amiri,serif;font-size:2rem;font-weight:700";
    content.append(arabic, ref);

    banner.append(header, content);
    columns.parentNode.insertBefore(banner, columns);
  }

  function tick() {
    var key = today();
    if (key === day || !document.querySelector("#page-content .page-columns")) return;
    removeBanner();
    day = key;
    if (dismissed(key)) return;
    fetch(API + ayahNumber(key) + "/quran-uthmani")
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { render(key, j.data); })
      .catch(function () { if (day === key) day = null; });
  }

  var observer = new MutationObserver(function () {
    if (!document.querySelector("#page-content .page-columns")) return;
    observer.disconnect();
    tick();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  setInterval(tick, 60000);
  document.addEventListener("visibilitychange", function () { if (!document.hidden) tick(); });
})();
