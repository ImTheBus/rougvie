/* ROUGVIE · edgelands variant — minimal vanilla JS.
   1. Stamp the current year in the footer.
   2. Reveal-on-scroll for .reveal elements (IntersectionObserver),
      respecting prefers-reduced-motion. */

(function () {
  "use strict";

  // --- year stamp ---
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) { yearEl.textContent = String(new Date().getFullYear()); }

  // --- reveal on scroll ---
  var reveals = document.querySelectorAll(".reveal");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !("IntersectionObserver" in window)) {
    // Show everything immediately; no motion.
    reveals.forEach(function (el) { el.classList.add("in"); });
    return;
  }

  var io = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });

  reveals.forEach(function (el) { io.observe(el); });
})();
