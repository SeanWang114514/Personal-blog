/* ==========================================================================
   Sean Wang Blog — Site runtime
   Vanilla, dependency-free. Every block is guarded so a missing element on
   any given page never throws.
   ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };
  var BASE = (window.SW && window.SW.baseurl) || "";

  /* ----------------------------------------------------------------------
     1. Theme (dark default, persisted)
     ---------------------------------------------------------------------- */
  var Theme = {
    KEY: "sw-theme",

    get: function () {
      try {
        var saved = localStorage.getItem(this.KEY);
        if (saved === "light" || saved === "dark") return saved;
      } catch (e) { /* storage blocked — fall through */ }
      return "dark";
    },

    apply: function (theme) {
      var root = document.documentElement;
      root.setAttribute("data-theme", theme);
      try { localStorage.setItem(this.KEY, theme); } catch (e) { /* ignore */ }

      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", theme === "light" ? "#f7f8fc" : "#0b0f19");

      // Tell Giscus (and anything else listening) about the change.
      var frame = $("iframe.giscus-frame");
      if (frame && frame.contentWindow) {
        frame.contentWindow.postMessage(
          { giscus: { setConfig: { theme: theme === "light" ? "light" : "dark_dimmed" } } },
          "https://giscus.app"
        );
      }
    },

    toggle: function () {
      this.apply(this.get() === "dark" ? "light" : "dark");
    },

    init: function () {
      var self = this;
      this.apply(this.get());

      $$(".theme-toggle").forEach(function (btn) {
        btn.addEventListener("click", function () { self.toggle(); });
      });

      // Follow the OS only while the visitor has not made an explicit choice.
      if (window.matchMedia) {
        var mq = window.matchMedia("(prefers-color-scheme: light)");
        var onChange = function (e) {
          var saved = null;
          try { saved = localStorage.getItem(self.KEY); } catch (err) { /* ignore */ }
          if (!saved) self.apply(e.matches ? "light" : "dark");
        };
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else if (mq.addListener) mq.addListener(onChange);
      }
    }
  };
  Theme.init();

  /* ----------------------------------------------------------------------
     2. Sticky topbar state + scroll progress + back-to-top
     ---------------------------------------------------------------------- */
  (function () {
    var bar = $(".topbar");
    var progress = $(".scroll-progress");
    var toTop = $(".to-top");
    var ticking = false;

    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop;

      if (bar) bar.classList.toggle("is-stuck", y > 12);
      if (toTop) toTop.classList.toggle("is-visible", y > 600);

      if (progress) {
        var h = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + "%";
      }
      ticking = false;
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    if (toTop) {
      toTop.addEventListener("click", function () {
        var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      });
    }
  })();

  /* ----------------------------------------------------------------------
     3. Mobile drawer
     ---------------------------------------------------------------------- */
  (function () {
    var drawer = $("#sw-drawer");
    if (!drawer) return;

    var openBtn = $(".nav-toggle");
    var lastFocus = null;

    function open() {
      lastFocus = document.activeElement;
      drawer.classList.add("is-open");
      drawer.removeAttribute("aria-hidden");
      document.body.style.overflow = "hidden";
      var first = drawer.querySelector("a, button");
      if (first) first.focus();
    }

    function close() {
      drawer.classList.remove("is-open");
      drawer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (openBtn) openBtn.focus();
    }

    if (openBtn) openBtn.addEventListener("click", open);
    $$("[data-drawer-close]", drawer).forEach(function (el) {
      el.addEventListener("click", close);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
    });
    // Close after navigating within the drawer.
    $$("a", drawer).forEach(function (a) { a.addEventListener("click", close); });
  })();

  /* ----------------------------------------------------------------------
     4. Reveal-on-scroll
     ---------------------------------------------------------------------- */
  (function () {
    var items = $$("[data-reveal]");
    if (!items.length) return;

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
        setTimeout(function () { el.classList.add("is-in"); }, delay);
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ----------------------------------------------------------------------
     5. Animated counters
     ---------------------------------------------------------------------- */
  (function () {
    var nums = $$("[data-count]");
    if (!nums.length) return;

    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var suffix = el.getAttribute("data-count-suffix") || "";
      if (reduce) { el.textContent = target + suffix; return; }

      var start = performance.now();
      var dur = 1100;
      function step(now) {
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) { nums.forEach(run); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        run(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.4 });

    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ----------------------------------------------------------------------
     6. Skill bars
     ---------------------------------------------------------------------- */
  (function () {
    var bars = $$(".skill__fill");
    if (!bars.length) return;

    function fill(el) {
      el.style.width = (el.getAttribute("data-level") || "0") + "%";
    }

    if (!("IntersectionObserver" in window)) { bars.forEach(fill); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        fill(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.3 });

    bars.forEach(function (el) { io.observe(el); });
  })();

  /* ----------------------------------------------------------------------
     7. Blog list: live filter by tag + free-text query
     ---------------------------------------------------------------------- */
  (function () {
    var root = $("#sw-blog-list");
    if (!root) return;

    var cards = $$("[data-post]", root);
    var chips = $$("[data-filter-tag]");
    var input = $("#sw-blog-search");
    var empty = $("#sw-blog-empty");
    var state = { tag: "all", q: "" };

    function apply() {
      var q = state.q.trim().toLowerCase();
      // Tag comparison must be case-insensitive on BOTH sides: data-tags is
      // lowercased above, so the selected chip has to be too.
      var tag = state.tag.toLowerCase();
      var shown = 0;

      cards.forEach(function (card) {
        var tags = (card.getAttribute("data-tags") || "").toLowerCase();
        var hay = (card.getAttribute("data-search") || "").toLowerCase();
        var tagOk = tag === "all" || tags.split(",").indexOf(tag) !== -1;
        var qOk = !q || hay.indexOf(q) !== -1;
        var ok = tagOk && qOk;

        card.classList.toggle("hidden", !ok);
        if (ok) shown++;
      });

      if (empty) empty.classList.toggle("hidden", shown > 0);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("is-active");
        chip.setAttribute("aria-pressed", "true");
        state.tag = chip.getAttribute("data-filter-tag");
        apply();
      });
    });

    if (input) {
      var timer = null;
      input.addEventListener("input", function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          state.q = input.value;
          apply();
        }, 140);
      });
    }

    // Deep link: /blog/?tag=AI
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("tag");
    if (initial) {
      var match = chips.filter(function (c) {
        return c.getAttribute("data-filter-tag") === initial;
      })[0];
      if (match) match.click();
    }
  })();

  /* ----------------------------------------------------------------------
     8. Software / download / drive / tool filters (generic)
     ---------------------------------------------------------------------- */
  (function () {
    $$("[data-filter-group]").forEach(function (group) {
      var targetSel = group.getAttribute("data-filter-target");
      var target = targetSel ? $(targetSel) : null;
      if (!target) return;

      var items = $$("[data-cat]", target);
      var chips = $$("[data-filter]", group);
      var input = group.getAttribute("data-filter-search")
        ? $(group.getAttribute("data-filter-search"))
        : null;
      var empty = group.getAttribute("data-filter-empty")
        ? $(group.getAttribute("data-filter-empty"))
        : null;
      var state = { cat: "all", q: "" };

      function apply() {
        var q = state.q.trim().toLowerCase();
        var cat = state.cat.toLowerCase();   // keep in sync with the lowercased data-cat
        var shown = 0;
        items.forEach(function (item) {
          var cats = (item.getAttribute("data-cat") || "").toLowerCase();
          var hay = (item.getAttribute("data-search") || "").toLowerCase();
          var catOk = cat === "all" || cats.split(",").indexOf(cat) !== -1;
          var qOk = !q || hay.indexOf(q) !== -1;
          var ok = catOk && qOk;
          item.classList.toggle("hidden", !ok);
          if (ok) shown++;
        });
        if (empty) empty.classList.toggle("hidden", shown > 0);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          chips.forEach(function (c) {
            c.classList.remove("is-active");
            c.setAttribute("aria-pressed", "false");
          });
          chip.classList.add("is-active");
          chip.setAttribute("aria-pressed", "true");
          state.cat = chip.getAttribute("data-filter");
          apply();
        });
      });

      if (input) {
        var t = null;
        input.addEventListener("input", function () {
          clearTimeout(t);
          t = setTimeout(function () { state.q = input.value; apply(); }, 140);
        });
      }

      var p = new URLSearchParams(window.location.search).get("cat");
      if (p) {
        var m = chips.filter(function (c) { return c.getAttribute("data-filter") === p; })[0];
        if (m) m.click();
      }
    });
  })();

  /* ----------------------------------------------------------------------
     9. Instant search (hero + topbar) via /search.json
     ---------------------------------------------------------------------- */
  (function () {
    var inputs = $$("[data-instant-search]");
    if (!inputs.length) return;

    var index = null;
    var loading = false;

    function load(cb) {
      if (index) return cb(index);
      if (loading) return;
      loading = true;
      fetch(BASE + "/search.json")
        .then(function (r) { return r.ok ? r.json() : []; })
        .then(function (data) { index = Array.isArray(data) ? data : []; cb(index); })
        .catch(function () { index = []; cb(index); })
        .then(function () { loading = false; });
    }

    function score(item, q) {
      var t = (item.title || "").toLowerCase();
      var s = (item.subtitle || "").toLowerCase();
      var tg = (item.tags || "").toLowerCase();
      if (t.indexOf(q) === 0) return 100;
      if (t.indexOf(q) !== -1) return 80;
      if (s.indexOf(q) !== -1) return 60;
      if (tg.indexOf(q) !== -1) return 40;
      return 0;
    }

    inputs.forEach(function (input) {
      var box = input.parentElement.querySelector(".search-results");
      if (!box) return;
      var cursor = -1;

      function close() {
        box.classList.remove("is-open");
        cursor = -1;
      }

      function render(list, q) {
        if (!list.length) {
          box.innerHTML = '<div class="search-results__empty">没有找到与 “' +
            q.replace(/[<>&]/g, "") + '” 相关的内容</div>';
          box.classList.add("is-open");
          return;
        }
        box.innerHTML = list.map(function (item) {
          return '<a class="search-results__item" href="' + item.url + '">' +
            '<div class="search-results__title">' + (item.title || "") + '</div>' +
            '<div class="search-results__meta">' + (item.date || "") +
            (item.tags ? ' · ' + item.tags : "") + '</div></a>';
        }).join("");
        box.classList.add("is-open");
      }

      var timer = null;
      input.addEventListener("input", function () {
        var q = input.value.trim().toLowerCase();
        if (q.length < 1) { close(); return; }
        clearTimeout(timer);
        timer = setTimeout(function () {
          load(function (data) {
            var hits = data
              .map(function (it) { return { it: it, s: score(it, q) }; })
              .filter(function (x) { return x.s > 0; })
              .sort(function (a, b) { return b.s - a.s; })
              .slice(0, 8)
              .map(function (x) { return x.it; });
            render(hits, input.value.trim());
          });
        }, 160);
      });

      input.addEventListener("keydown", function (e) {
        var links = $$(".search-results__item", box);
        if (!links.length) {
          if (e.key === "Escape") { input.blur(); close(); }
          return;
        }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          e.preventDefault();
          cursor += e.key === "ArrowDown" ? 1 : -1;
          if (cursor < 0) cursor = links.length - 1;
          if (cursor >= links.length) cursor = 0;
          links.forEach(function (l, i) { l.classList.toggle("is-cursor", i === cursor); });
        } else if (e.key === "Enter") {
          if (cursor >= 0 && links[cursor]) {
            e.preventDefault();
            window.location.href = links[cursor].getAttribute("href");
          }
        } else if (e.key === "Escape") {
          input.blur();
          close();
        }
      });

      document.addEventListener("click", function (e) {
        if (!input.parentElement.contains(e.target)) close();
      });
    });

    // "/" focuses the first search box.
    document.addEventListener("keydown", function (e) {
      var tag = (e.target.tagName || "").toLowerCase();
      if (e.key === "/" && tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        inputs[0].focus();
      }
    });
  })();

  /* ----------------------------------------------------------------------
     10. Copy-to-clipboard buttons
     ---------------------------------------------------------------------- */
  (function () {
    $$("[data-copy]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var text = btn.getAttribute("data-copy");
        var done = function () {
          var original = btn.innerHTML;
          btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
          btn.setAttribute("aria-label", "已复制");
          setTimeout(function () {
            btn.innerHTML = original;
            btn.setAttribute("aria-label", "复制");
          }, 1600);
        };
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(done).catch(function () { /* ignore */ });
        } else {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); done(); } catch (err) { /* ignore */ }
          document.body.removeChild(ta);
        }
      });
    });
  })();

  /* ----------------------------------------------------------------------
     11. Post table of contents with scroll-spy
     ---------------------------------------------------------------------- */
  (function () {
    var toc = $(".toc__list");
    if (!toc) return;

    var content = $(".post-content");
    if (!content) { toc.parentElement.classList.add("hidden"); return; }

    var heads = $$("h2, h3", content).filter(function (h) { return h.id; });
    if (heads.length < 2) { toc.parentElement.classList.add("hidden"); return; }

    toc.innerHTML = heads.map(function (h) {
      var cls = h.tagName === "H3" ? "toc__link toc__link--h3" : "toc__link";
      return '<li><a class="' + cls + '" href="#' + h.id + '">' +
        h.textContent.replace(/¶|#/g, "").trim() + "</a></li>";
    }).join("");

    var links = $$(".toc__link", toc);
    if (!("IntersectionObserver" in window)) return;

    var visible = new Set();
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      });
      var activeId = null;
      for (var i = 0; i < heads.length; i++) {
        if (visible.has(heads[i].id)) { activeId = heads[i].id; break; }
      }
      if (!activeId) return;
      links.forEach(function (l) {
        l.classList.toggle("is-active", l.getAttribute("href") === "#" + activeId);
      });
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });

    heads.forEach(function (h) { io.observe(h); });
  })();

  /* ----------------------------------------------------------------------
     12. Reading progress → estimated reading time + local view counter
     ---------------------------------------------------------------------- */
  (function () {
    var meta = $("[data-reading-meta]");
    if (meta) {
      var content = $(".post-content");
      if (content) {
        var text = content.textContent || "";
        var cjk = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
        var words = text.replace(/[\u4e00-\u9fa5]/g, " ").split(/\s+/).filter(Boolean).length;
        // CJK ≈ 350 chars/min, latin ≈ 200 words/min
        var mins = Math.max(1, Math.round(cjk / 350 + words / 200));
        var el = $("[data-reading-time]", meta);
        if (el) el.textContent = mins + " 分钟";
      }
    }

    // Local-only view counter (no network, no tracking).
    if (window.SW && window.SW.localStats && window.SW.path) {
      try {
        var KEY = "sw-views";
        var map = JSON.parse(localStorage.getItem(KEY) || "{}");
        map[window.SW.path] = (map[window.SW.path] || 0) + 1;
        localStorage.setItem(KEY, JSON.stringify(map));

        var out = $("[data-view-count]");
        if (out) out.textContent = map[window.SW.path];
      } catch (e) { /* storage unavailable */ }
    }
  })();

  /* ----------------------------------------------------------------------
     13. Toolbox live clock
     ---------------------------------------------------------------------- */
  (function () {
    var el = $("[data-clock-time]");
    if (!el) return;

    var dateEl = $("[data-clock-date]");
    var week = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

    function pad(n) { return n < 10 ? "0" + n : "" + n; }

    function tick() {
      var d = new Date();
      el.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
      if (dateEl) {
        dateEl.textContent = d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " +
          d.getDate() + " 日 · " + week[d.getDay()];
      }
    }
    tick();
    setInterval(tick, 1000);
  })();

  /* ----------------------------------------------------------------------
     14. Local-storage backed link favorites (toolbox / bookmarks)
     ---------------------------------------------------------------------- */
  (function () {
    var KEY = "sw-pins";
    var pins;
    try { pins = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { pins = []; }
    if (!Array.isArray(pins)) pins = [];

    function save() {
      try { localStorage.setItem(KEY, JSON.stringify(pins)); } catch (e) { /* ignore */ }
    }

    $$("[data-pin]").forEach(function (btn) {
      var id = btn.getAttribute("data-pin");
      function paint() {
        var on = pins.indexOf(id) !== -1;
        btn.classList.toggle("is-pinned", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.setAttribute("aria-label", on ? "取消收藏" : "收藏");
      }
      paint();
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var i = pins.indexOf(id);
        if (i === -1) pins.push(id);
        else pins.splice(i, 1);
        save();
        paint();
      });
    });

    // "只看收藏" toggle
    var only = $("[data-pins-only]");
    if (only) {
      only.addEventListener("click", function () {
        var on = only.classList.toggle("is-active");
        only.setAttribute("aria-pressed", on ? "true" : "false");
        $$("[data-pin]").forEach(function (btn) {
          var tile = btn.closest("[data-cat], .tool-tile, .friend-card");
          if (!tile) return;
          var pinned = pins.indexOf(btn.getAttribute("data-pin")) !== -1;
          if (on && !pinned) tile.classList.add("hidden");
          else tile.classList.remove("hidden");
        });
      });
    }
  })();

  /* ----------------------------------------------------------------------
     15. External links → new tab + rel hardening
     ---------------------------------------------------------------------- */
  (function () {
    var host = window.location.hostname;
    $$('a[href^="http"]').forEach(function (a) {
      if (a.hostname && a.hostname !== host) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      }
    });
  })();

})();
