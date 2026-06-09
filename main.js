/* rougvie.com — landing interactions
   - footer year stamp
   - scroll reveals
   - reduced-motion guard
   - a single hidden Konami-code route to /classic/ (no visible footprint)
*/
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- footer year ---------- */
  var y = document.querySelector("[data-year]");
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- scroll reveals ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduced || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- hidden door: Konami code → /classic/ ----------
     The only route to the retro site. Zero visible footprint. */
  var SEQ = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];
  var pos = 0;
  document.addEventListener("keydown", function (ev) {
    var want = SEQ[pos];
    var got = ev.key.length === 1 ? ev.key.toLowerCase() : ev.key;
    if (got === want) {
      pos++;
      if (pos === SEQ.length) { window.location = "classic/"; }
    } else {
      // allow a fresh start if the mismatched key is the sequence's first key
      pos = (got === SEQ[0]) ? 1 : 0;
    }
  });
})();
