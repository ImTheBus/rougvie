/* rougvie.com — landing interactions
   - scroll reveals
   - "The Cartographer's Door": a 4-stage hidden-door puzzle to /retro/
     (replaces the old footer-d20 click + Konami shortcut — that route is gone)
*/
(function () {
  "use strict";

  var DEST = "/retro/";
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

  /* =========================================================
     THE CARTOGRAPHER'S DOOR
     Stage 0  hook: footer ✦ → pulse → micro-copy + reveal spark stone
     Stage 1  acrostic: razor surnames Hanlon/Occam/Newton/Einstein → HONE
     Stage 2  cipher: Caesar +4, "WLEVTIR..." → "SHARPEN THE BLADE ROLL ONE"
     Stage 3  dice: four hidden stones sum to 21 (5+6+4+6)
     Stage 4  unlock: type HONE + roll (nat 20) → reveals /retro/ link
     ========================================================= */

  var WATCHWORD = "hone";
  var TARGET = 21;

  /* ---------- Stage 0: the footer spark hook ---------- */
  var sparkEgg = document.querySelector(".spark-egg");
  var sparkCopy = document.querySelector(".spark-copy");
  var sparkStone = document.querySelector(".stone-spark");
  if (sparkEgg) {
    sparkEgg.addEventListener("click", function () {
      if (!reduced) {
        sparkEgg.classList.remove("pulse");
        // force reflow so the animation re-triggers on repeat clicks
        void sparkEgg.offsetWidth;
        sparkEgg.classList.add("pulse");
      }
      if (sparkCopy) sparkCopy.hidden = false;
      if (sparkStone) sparkStone.hidden = false; // the 4th whetstone becomes findable
    });
  }

  /* ---------- Stage 3: the whetstone marks (dice) ---------- */
  var stones = document.querySelectorAll(".stone");
  var total = 0;
  var tally = null;

  function ensureTally() {
    if (tally) return tally;
    tally = document.createElement("span");
    tally.className = "stone-tally";
    var band = document.querySelector(".phil-razors");
    if (band) band.appendChild(tally);
    return tally;
  }

  function renderTally() {
    var t = ensureTally();
    if (total >= TARGET) {
      t.textContent = "Twenty-one. The blade is sharp. Now roll.";
    } else {
      t.textContent = "Found a stone. (" + total + "/" + TARGET + ") — keep honing.";
    }
    // reveal only after the first mark is found
    t.classList.add("show");
  }

  function foundStone(el) {
    if (el.getAttribute("data-found") === "true") return; // idempotent
    el.setAttribute("data-found", "true");
    el.classList.add("found");
    total += parseInt(el.getAttribute("data-roll"), 10) || 0;
    renderTally();
    if (total >= TARGET) openPrompt();
  }

  stones.forEach(function (el) {
    el.addEventListener("click", function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      foundStone(el);
    });
    el.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        foundStone(el);
      }
    });
  });

  /* ---------- Stage 4: the unlock prompt + door ---------- */
  var door = document.getElementById("cartographer-door");
  var promptBuilt = false;

  function buildArchiveLink() {
    var a = document.createElement("a");
    a.className = "archive-link";
    a.href = DEST;
    a.innerHTML = "→ enter the archive";
    return a;
  }

  function openPrompt() {
    if (!door || promptBuilt) return;
    promptBuilt = true;
    door.hidden = false;
    door.classList.add("seam-open");
    door.innerHTML =
      '<div class="seam">' +
        '<div class="door-prompt">' +
          '<p>The door is cut by a single word — the one the four razors&rsquo; makers spelled out. ' +
          'Speak it, and roll.</p>' +
        '</div>' +
        '<div class="door-form">' +
          '<input class="door-input" type="text" maxlength="12" autocomplete="off" ' +
            'spellcheck="false" aria-label="the watchword" placeholder="· · · ·">' +
          '<button class="door-roll" type="button" disabled>Roll</button>' +
        '</div>' +
        '<div class="door-fail" role="status" aria-live="polite"></div>' +
        '<div class="door-reveal" hidden></div>' +
      '</div>';

    var input = door.querySelector(".door-input");
    var rollBtn = door.querySelector(".door-roll");
    var fail = door.querySelector(".door-fail");
    var revealBox = door.querySelector(".door-reveal");

    function ready() {
      var ok = input.value.trim().toLowerCase() === WATCHWORD && total >= TARGET;
      rollBtn.disabled = !ok;
      return ok;
    }

    input.addEventListener("input", function () {
      fail.textContent = "";
      ready();
    });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); attempt(); }
    });
    rollBtn.addEventListener("click", attempt);

    function attempt() {
      var word = input.value.trim().toLowerCase();
      if (word !== WATCHWORD || total < TARGET) {
        if (!reduced) {
          input.classList.remove("shake");
          void input.offsetWidth;
          input.classList.add("shake");
        }
        fail.textContent =
          "That word doesn’t fit the lock. Read the razors again — the makers’ names, top to bottom.";
        return;
      }
      reveal(rollBtn, revealBox);
    }

    // focus the field so a keyboard solver lands in it
    try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
    ready();
  }

  function reveal(rollBtn, revealBox) {
    try { localStorage.setItem("cartographer", "true"); } catch (e) { /* private mode */ }

    function show() {
      var form = door.querySelector(".door-form");
      var fail = door.querySelector(".door-fail");
      if (form) form.hidden = true;
      if (fail) fail.textContent = "";
      revealBox.hidden = false;
      revealBox.innerHTML =
        '<span class="nat20">20</span>' +
        '<p class="reveal-copy">Natural twenty. The door was always drawn — you just had to read the edges. ' +
        '<strong>Welcome to the old map.</strong></p>';
      revealBox.appendChild(buildArchiveLink());
    }

    if (reduced) { show(); return; }
    rollBtn.classList.add("tumbling");
    var done = false;
    var fire = function () { if (done) return; done = true; show(); };
    rollBtn.addEventListener("animationend", fire, { once: true });
    setTimeout(fire, 1100); // fallback
  }

  /* ---------- Returning solver: discreet permanent footer link ---------- */
  function rememberedSolver() {
    try { return localStorage.getItem("cartographer") === "true"; } catch (e) { return false; }
  }
  if (rememberedSolver()) {
    var bar = document.querySelector(".foot-right");
    if (bar && !bar.querySelector(".returning-link")) {
      var link = document.createElement("a");
      link.className = "returning-link";
      link.href = DEST;
      link.textContent = "the old map";
      link.title = "You’ve been here before.";
      bar.appendChild(link);
    }
  }
})();
