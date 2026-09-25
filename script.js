/* ==========================================================================
   BOMB SIGMA — script.js
   Organized in independent modules, each guarded by feature/element checks
   so the page degrades gracefully if a section is edited out.
   ========================================================================== */
"use strict";

(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ------------------------------------------------------------------ *
   * NAVBAR — scroll shadow, scroll progress, mobile menu, active link
   * ------------------------------------------------------------------ */
  const initNav = () => {
    const nav = $(".nav");
    if (!nav) return;

    const progress = $(".nav__progress", nav);
    const toggle = $(".nav__toggle", nav);
    const menu = $("#nav-menu", nav);
    const links = $$(".nav__links a[data-spy]", nav);
    const sections = links
      .map((a) => document.getElementById(a.dataset.spy))
      .filter(Boolean);

    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      nav.classList.toggle("is-scrolled", y > 8);

      if (progress) {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        progress.style.transform = `scaleX(${max > 0 ? Math.min(y / max, 1) : 0})`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    if (toggle && menu) {
      const closeMenu = () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      };
      toggle.addEventListener("click", () => {
        const open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      });
      menu.addEventListener("click", (e) => {
        if (e.target.closest("a")) closeMenu();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && nav.classList.contains("is-open")) closeMenu();
      });
    }

    if (sections.length && "IntersectionObserver" in window) {
      const spy = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const link = links.find((a) => a.dataset.spy === entry.target.id);
            if (!link) return;
            link.classList.toggle("is-active", entry.isIntersecting);
          });
        },
        { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
      );
      sections.forEach((el) => spy.observe(el));
    }
  };

  /* ------------------------------------------------------------------ *
   * SCROLL REVEAL — fade/slide sections and cards into view once
   * ------------------------------------------------------------------ */
  const initReveal = () => {
    const targets = $$("[data-reveal]");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window) || prefersReducedMotion) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    targets.forEach((el) => io.observe(el));
  };

  /* ------------------------------------------------------------------ *
   * AMBIENT CURSOR GLOW — follows the pointer, off on touch devices
   * ------------------------------------------------------------------ */
  const initCursorGlow = () => {
    const glow = $(".cursor-glow");
    if (!glow || prefersReducedMotion || matchMedia("(hover: none)").matches) return;

    let raf = null;
    window.addEventListener(
      "pointermove",
      (e) => {
        glow.classList.add("is-on");
        if (raf) return;
        raf = requestAnimationFrame(() => {
          glow.style.transform = `translate3d(${e.clientX}px, ${e.clientY + window.scrollY}px, 0)`;
          raf = null;
        });
      },
      { passive: true }
    );
  };

  /* ------------------------------------------------------------------ *
   * CARD SPOTLIGHT — CSS variables that follow the pointer per-card
   * ------------------------------------------------------------------ */
  const initCardSpotlight = () => {
    if (prefersReducedMotion) return;
    $$("[data-spotlight]").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  };

  /* ------------------------------------------------------------------ *
   * MAGNETIC BUTTONS — small pull toward the cursor on hover
   * ------------------------------------------------------------------ */
  const initMagnetic = () => {
    if (prefersReducedMotion || matchMedia("(hover: none)").matches) return;
    $$("[data-magnetic]").forEach((btn) => {
      const reset = () => {
        btn.style.setProperty("--tx", "0px");
        btn.style.setProperty("--ty", "0px");
      };
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.28;
        const y = (e.clientY - r.top - r.height / 2) * 0.5;
        btn.style.setProperty("--tx", `${x.toFixed(1)}px`);
        btn.style.setProperty("--ty", `${y.toFixed(1)}px`);
      });
      btn.addEventListener("pointerleave", reset);
      btn.addEventListener("blur", reset);
    });
  };

  /* ------------------------------------------------------------------ *
   * TILT — subtle 3D tilt on the hero editor card
   * ------------------------------------------------------------------ */
  const initTilt = () => {
    const el = $("[data-tilt]");
    const wrap = $("[data-hero-visual]");
    if (!el || !wrap || prefersReducedMotion || matchMedia("(hover: none)").matches) return;

    wrap.addEventListener("pointermove", (e) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty("--ry", `${(px * 9).toFixed(2)}deg`);
      el.style.setProperty("--rx", `${(py * -9).toFixed(2)}deg`);
    });
    wrap.addEventListener("pointerleave", () => {
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--rx", "0deg");
    });
  };

  /* ------------------------------------------------------------------ *
   * PARTICLE FIELD — lightweight canvas particles drifting behind hero
   * ------------------------------------------------------------------ */
  const initParticles = () => {
    const canvas = $("#particles");
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    let rafId = null;
    let running = true;

    const COLORS = ["139,92,246", "99,102,241", "96,165,250"];
    const density = matchMedia("(max-width: 720px)").matches ? 16000 : 10500;

    const resize = () => {
      width = window.innerWidth;
      height = Math.min(window.innerHeight, 1100);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(18, Math.min(70, Math.round((width * height) / density)));
      particles = Array.from({ length: count }, () => spawn());
    };

    function spawn(atTop) {
      return {
        x: Math.random() * width,
        y: atTop ? -10 : Math.random() * height,
        r: Math.random() * 1.6 + 0.6,
        vy: Math.random() * 0.18 + 0.05,
        vx: (Math.random() - 0.5) * 0.06,
        a: Math.random() * 0.5 + 0.25,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        tw: Math.random() * Math.PI * 2,
      };
    }

    const step = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.vy;
        p.x += p.vx;
        p.tw += 0.02;
        if (p.y < -10) Object.assign(p, spawn(false), { y: height + 10 });
        const alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${alpha.toFixed(3)})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      rafId = requestAnimationFrame(step);
    };

    resize();
    step();

    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", () => {
      running = !document.hidden;
      if (running) {
        rafId = requestAnimationFrame(step);
      } else if (rafId) {
        cancelAnimationFrame(rafId);
      }
    });
  };

  /* ------------------------------------------------------------------ *
   * CODE EDITOR — harmless demo files, typing effect, RUN/CLEAR/COPY
   * ------------------------------------------------------------------ */
  const initEditor = () => {
    const codeTarget = $("#code-target");
    const gutter = $(".editor__gutter");
    const body = $(".editor__body");
    const tabs = $$(".tab");
    const consoleEl = $("#console-lines");
    const runBtn = $("#btn-run");
    const clearBtn = $("#btn-clear");
    const copyBtn = $("#btn-copy");
    const statusEl = $("#editor-status");
    if (!codeTarget || !tabs.length) return;

    // Harmless demo snippets only — illustrative UI content, nothing executed for real.
    const FILES = {
      main: {
        label: "main.js",
        run: [
          { mark: "\u203A", cls: "c-mark--info", text: "bomb-sigma run main.js" },
          { text: "Loading modules \u2026 done" },
          { text: "Connected to workspace \u201Csigma-dev\u201D" },
          { mark: "\u2713", cls: "c-mark--ok", text: "Sigma is online! \u2192 3 features enabled" },
        ],
        code: [
          [["tok-comment", "// Bomb Sigma — demo bootstrap (harmless sample code)"]],
          [["tok-keyword", "import"], [null, " { "], ["tok-fn", "createApp"], [null, " } "], ["tok-keyword", "from"], [null, " "], ["tok-string", "\"./core.js\""], ["tok-punct", ";"]],
          [[null, ""]],
          [["tok-keyword", "const"], [null, " config "], ["tok-punct", "="], [null, " {"]],
          [[null, "  "], ["tok-prop", "name"], ["tok-punct", ":"], [null, " "], ["tok-string", "\"sigma-dev\""], ["tok-punct", ","]],
          [[null, "  "], ["tok-prop", "theme"], ["tok-punct", ":"], [null, " "], ["tok-string", "\"cyber-violet\""], ["tok-punct", ","]],
          [[null, "  "], ["tok-prop", "features"], ["tok-punct", ":"], [null, " ["], ["tok-string", "\"fast\""], ["tok-punct", ","], [null, " "], ["tok-string", "\"clean\""], ["tok-punct", ","], [null, " "], ["tok-string", "\"stable\""], ["tok-punct", "],"]],
          [[null, "};"]],
          [[null, ""]],
          [["tok-keyword", "async function"], [null, " "], ["tok-fn", "boot"], ["tok-punct", "("], [null, ") {"]],
          [[null, "  "], ["tok-keyword", "const"], [null, " app "], ["tok-punct", "="], [null, " "], ["tok-keyword", "await"], [null, " "], ["tok-fn", "createApp"], ["tok-punct", "("], [null, "config"], ["tok-punct", ");"]],
          [[null, "  app."], ["tok-fn", "on"], ["tok-punct", "("], ["tok-string", "\"ready\""], ["tok-punct", ","], [null, " "], ["tok-punct", "()"], [null, " "], ["tok-punct", "=>"], [null, " {"]],
          [[null, "    console."], ["tok-fn", "log"], ["tok-punct", "("], ["tok-string", "\"Sigma is online!\""], ["tok-punct", ");"]],
          [[null, "  "], ["tok-punct", "});"]],
          [[null, "  "], ["tok-keyword", "return"], [null, " app."], ["tok-fn", "start"], ["tok-punct", "();"]],
          [[null, "}"]],
          [[null, ""]],
          [["tok-fn", "boot"], ["tok-punct", "();"]],
        ],
      },
      config: {
        label: "config.js",
        run: [
          { mark: "\u2699", cls: "c-mark--info", text: "Validating configuration \u2026" },
          { mark: "\u2713", cls: "c-mark--ok", text: "3 settings applied, 0 warnings" },
        ],
        code: [
          [["tok-comment", "// Sigma workspace configuration (demo values)"]],
          [["tok-keyword", "export"], [null, " "], ["tok-keyword", "const"], [null, " settings "], ["tok-punct", "="], [null, " {"]],
          [[null, "  "], ["tok-prop", "performanceMode"], ["tok-punct", ":"], [null, " "], ["tok-keyword", "true"], ["tok-punct", ","]],
          [[null, "  "], ["tok-prop", "autoSync"], ["tok-punct", ":"], [null, " "], ["tok-keyword", "true"], ["tok-punct", ","]],
          [[null, "  "], ["tok-prop", "maxThreads"], ["tok-punct", ":"], [null, " "], ["tok-number", "8"], ["tok-punct", ","]],
          [[null, "  "], ["tok-prop", "refreshRateMs"], ["tok-punct", ":"], [null, " "], ["tok-number", "16"], ["tok-punct", ","]],
          [[null, "  "], ["tok-prop", "logLevel"], ["tok-punct", ":"], [null, " "], ["tok-string", "\"info\""], ["tok-punct", ","]],
          [[null, "};"]],
        ],
      },
      utils: {
        label: "utils.js",
        run: [
          { mark: "\u2192", cls: "c-mark--info", text: "clamp(120, 0, 100) \u2192 100" },
          { mark: "\u2713", cls: "c-mark--ok", text: "2 utilities tested \u00B7 all passed" },
        ],
        code: [
          [["tok-comment", "// Small shared helpers (demo)"]],
          [["tok-keyword", "export function"], [null, " "], ["tok-fn", "clamp"], ["tok-punct", "("], [null, "value, min, max"], ["tok-punct", ") {"]],
          [[null, "  "], ["tok-keyword", "return"], [null, " Math."], ["tok-fn", "min"], ["tok-punct", "("], [null, "Math."], ["tok-fn", "max"], ["tok-punct", "("], [null, "value, min"], ["tok-punct", "), max);"]],
          [[null, "}"]],
          [[null, ""]],
          [["tok-keyword", "export function"], [null, " "], ["tok-fn", "formatUptime"], ["tok-punct", "("], [null, "ms"], ["tok-punct", ") {"]],
          [[null, "  "], ["tok-keyword", "const"], [null, " s "], ["tok-punct", "="], [null, " Math."], ["tok-fn", "floor"], ["tok-punct", "("], [null, "ms "], ["tok-punct", "/"], [null, " "], ["tok-number", "1000"], ["tok-punct", ");"]],
          [[null, "  "], ["tok-keyword", "return"], [null, " "], ["tok-string", "`${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`"], ["tok-punct", ";"]],
          [[null, "}"]],
        ],
      },
    };

    let currentKey = "main";
    let typeToken = 0;

    const lineToHTML = (tokens) =>
      tokens
        .map(([cls, text]) => {
          const safe = (text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return cls ? `<span class="${cls}">${safe}</span>` : safe;
        })
        .join("");

    const renderGutter = (n) => {
      if (!gutter) return;
      gutter.textContent = Array.from({ length: n }, (_, i) => i + 1).join("\n");
    };

    const renderStatic = (key) => {
      const file = FILES[key];
      codeTarget.innerHTML = file.code.map(lineToHTML).join("\n");
      renderGutter(file.code.length);
      if (body) body.style.setProperty("--lines", file.code.length);
    };

    const typeFile = (key) => {
      const file = FILES[key];
      const myToken = ++typeToken;
      codeTarget.innerHTML = "";
      renderGutter(file.code.length);
      if (body) body.style.setProperty("--lines", file.code.length);

      if (prefersReducedMotion) {
        renderStatic(key);
        return;
      }

      let li = 0;
      const typeLine = () => {
        if (myToken !== typeToken) return; // superseded by a newer tab switch
        if (li >= file.code.length) return;

        const flat = file.code[li];
        let chars = 0;
        const total = flat.reduce((sum, [, t]) => sum + (t ? t.length : 0), 0) || 1;

        const draw = () => {
          if (myToken !== typeToken) return;
          let remaining = chars;
          const built = [];
          for (const [cls, text] of flat) {
            const t = text ?? "";
            if (remaining <= 0) break;
            const take = Math.min(remaining, t.length);
            built.push([cls, t.slice(0, take)]);
            remaining -= take;
          }
          const done = codeTarget.innerHTML.split("\n").slice(0, li);
          done.push(`${lineToHTML(built)}<span class="caret"></span>`);
          codeTarget.innerHTML = done.join("\n");
        };

        const tick = () => {
          if (myToken !== typeToken) return;
          chars += 2;
          draw();
          if (chars < total) {
            requestAnimationFrame(tick);
          } else {
            li += 1;
            setTimeout(typeLine, 16);
          }
        };
        requestAnimationFrame(tick);
      };
      typeLine();
    };

    const selectTab = (key) => {
      const file = FILES[key];
      if (!file) return;
      currentKey = key;
      tabs.forEach((t) => {
        const active = t.dataset.file === key;
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
      });
      typeFile(key);
    };

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => selectTab(tab.dataset.file));
      tab.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        const next = tabs[(i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
        next.focus();
        selectTab(next.dataset.file);
      });
    });

    selectTab("main");

    if (runBtn && consoleEl) {
      let runToken = 0;
      runBtn.addEventListener("click", () => {
        const file = FILES[currentKey];
        const myRun = ++runToken;
        runBtn.classList.add("is-busy");
        consoleEl.innerHTML = "";
        if (statusEl) statusEl.textContent = `Running ${file.label}\u2026`;

        file.run.forEach((entry, i) => {
          setTimeout(() => {
            if (myRun !== runToken) return;
            const row = document.createElement("span");
            row.className = "console__line";
            const mark = entry.mark ? `<span class="c-mark ${entry.cls || ""}">${entry.mark}</span>` : "";
            row.innerHTML = `${mark}${entry.text}`;
            consoleEl.appendChild(row);
            if (i === file.run.length - 1) {
              runBtn.classList.remove("is-busy");
              if (statusEl) statusEl.textContent = `${file.label} finished running.`;
            }
          }, 320 * i + (prefersReducedMotion ? 0 : 260));
        });
      });
    }

    if (clearBtn && consoleEl) {
      clearBtn.addEventListener("click", () => {
        consoleEl.innerHTML = '<span class="console__line console__empty">Console cleared. Press RUN to try again.</span>';
        if (statusEl) statusEl.textContent = "Console cleared.";
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        const file = FILES[currentKey];
        const text = file.code.map((line) => line.map(([, t]) => t ?? "").join("")).join("\n");
        try {
          if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
          } else {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            ta.remove();
          }
          copyBtn.classList.add("is-copied");
          const label = $(".chip__label", copyBtn);
          if (label) label.textContent = "COPIED";
          if (statusEl) statusEl.textContent = `${file.label} copied to clipboard.`;
          setTimeout(() => {
            copyBtn.classList.remove("is-copied");
            if (label) label.textContent = "COPY";
          }, 1600);
        } catch {
          if (statusEl) statusEl.textContent = "Copy failed — select the code manually.";
        }
      });
    }

    consoleEl.innerHTML = '<span class="console__line console__empty">Press RUN to execute this demo file.</span>';
  };

  /* ------------------------------------------------------------------ *
   * DASHBOARD DEMO — fictional live stats, terminal, feed, uptime bars
   * All numbers below are synthetic demo data, not real telemetry.
   * ------------------------------------------------------------------ */
  const initDashboard = () => {
    const dash = $(".dash");
    if (!dash) return;

    /* ---- sidebar view switch (relabels the breadcrumb only) ---- */
    const sideBtns = $$(".side-btn", dash);
    const crumb = $("#crumb", dash);
    sideBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        sideBtns.forEach((b) => b.removeAttribute("aria-current"));
        btn.setAttribute("aria-current", "true");
        if (crumb) crumb.textContent = btn.dataset.view;
      });
    });

    /* ---- live-ish stat counters with tiny sparkline history ---- */
    const STAT_DEFS = {
      fps: { base: 60, jitter: 1.4, min: 55, max: 61, decimals: 0 },
      lat: { base: 12, jitter: 2.2, min: 6, max: 22, decimals: 0 },
      cpu: { base: 24, jitter: 4, min: 10, max: 48, decimals: 0 },
      mem: { base: 248, jitter: 6, min: 220, max: 290, decimals: 0 },
    };
    const history = {};

    const buildPath = (values, min, max) => {
      const w = 120;
      const h = 40;
      const pad = 4;
      const range = Math.max(1, max - min);
      return values
        .map((v, i) => {
          const x = (i / (values.length - 1)) * w;
          const y = h - pad - ((v - min) / range) * (h - pad * 2);
          return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");
    };

    const tickStats = () => {
      $$(".stat", dash).forEach((card) => {
        const key = card.dataset.stat;
        const def = STAT_DEFS[key];
        if (!def) return;

        const numEl = $(".stat__num", card);
        const deltaEl = $(".stat__delta", card);
        const path = $(".spark__line", card);
        const area = $(".spark__area", card);

        const prev = history[key] || Array.from({ length: 16 }, () => def.base);
        const next = Math.min(def.max, Math.max(def.min, prev[prev.length - 1] + (Math.random() - 0.5) * def.jitter * 2));
        const series = [...prev.slice(1), next];
        history[key] = series;

        if (numEl) numEl.textContent = def.decimals ? next.toFixed(def.decimals) : Math.round(next);
        if (deltaEl) {
          const diff = ((next - def.base) / def.base) * 100;
          deltaEl.textContent = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}%`;
        }
        if (path) {
          const d = buildPath(series, def.min, def.max);
          path.setAttribute("d", d);
          if (area) area.setAttribute("d", `${d} L120,40 L0,40 Z`);
        }
      });
    };

    if ($(".stat", dash)) {
      tickStats();
      if (!prefersReducedMotion) setInterval(tickStats, 2200);
    }

    /* ---- terminal: short loop of harmless demo commands ---- */
    const term = $("#term", dash);
    if (term) {
      const SCRIPT = [
        { p: "sigma@workspace", c: "sigma status", lines: [{ tag: "OK", tagCls: "term__tag--ok", text: "3/3 services operational" }] },
        {
          p: "sigma@workspace",
          c: "sigma build --release",
          lines: [
            { text: "compiling modules\u2026", dim: true },
            { tag: "INFO", tagCls: "term__tag--info", text: "bundle size 412 KB" },
            { tag: "OK", tagCls: "term__tag--ok", text: "build finished in 1.8s" },
          ],
        },
        {
          p: "sigma@workspace",
          c: "sigma sync",
          lines: [
            { text: "syncing workspace\u2026", dim: true },
            { tag: "OK", tagCls: "term__tag--ok", text: "up to date, 0 conflicts" },
          ],
        },
      ];

      let si = 0;
      const MAX_LINES = 30;

      const appendLine = (html) => {
        const row = document.createElement("span");
        row.className = "term__line";
        row.innerHTML = html;
        term.appendChild(row);
        while (term.children.length > MAX_LINES) term.removeChild(term.firstChild);
        term.scrollTop = term.scrollHeight;
      };

      const runStep = () => {
        const step = SCRIPT[si % SCRIPT.length];
        si += 1;
        appendLine(`<span class="term__prompt">${step.p}</span> $ <span class="term__cmd">${step.c}</span>`);
        step.lines.forEach((l, i) => {
          setTimeout(() => {
            const tag = l.tag ? `<span class="term__tag ${l.tagCls}">${l.tag}</span>` : "";
            const cls = l.dim ? ' style="color:var(--dim)"' : "";
            appendLine(`${tag}<span${cls}>${l.text}</span>`);
          }, 260 * (i + 1));
        });
      };

      runStep();
      if (!prefersReducedMotion) setInterval(runStep, 3600);
    }

    /* ---- activity feed: rotating fictional log entries ---- */
    const feed = $("#feed", dash);
    if (feed) {
      const EVENTS = [
        { tag: "SYNC", cls: "tag--sync", msg: "Workspace synced across 2 devices" },
        { tag: "BUILD", cls: "tag--info", msg: "Release build completed successfully" },
        { tag: "OK", cls: "tag--ok", msg: "Health check passed on all modules" },
        { tag: "SYNC", cls: "tag--sync", msg: "Config profile \u201Csigma-dev\u201D updated" },
        { tag: "INFO", cls: "tag--info", msg: "New script template added to library" },
        { tag: "OK", cls: "tag--ok", msg: "Cache warm-up finished, 0 errors" },
      ];

      let clock = 0; // fake minute counter, purely cosmetic
      const addEvent = () => {
        const ev = EVENTS[(Math.random() * EVENTS.length) | 0];
        clock += Math.round(Math.random() * 6) + 1;
        const li = document.createElement("li");
        li.className = "feed__item is-new";
        li.innerHTML = `
          <span class="feed__time">${clock}m ago</span>
          <span class="tag ${ev.cls}">${ev.tag}</span>
          <span class="feed__msg">${ev.msg}</span>`;
        feed.prepend(li);
        while (feed.children.length > 6) feed.removeChild(feed.lastChild);
      };

      for (let i = 0; i < 5; i += 1) addEvent();
      if (!prefersReducedMotion) setInterval(addEvent, 2800);
    }

    /* ---- uptime bars: 40-day fictional uptime history ---- */
    const uptime = $("#uptime", dash);
    if (uptime) {
      const days = Array.from({ length: 40 }, () => (Math.random() > 0.94 ? 0.55 + Math.random() * 0.3 : 1));
      uptime.innerHTML = days
        .map((v, i) => `<div class="up${v < 1 ? " up--warn" : ""}" style="--i:${i};height:${Math.round(v * 100)}%" title="Day ${i + 1}: ${Math.round(v * 100)}% uptime"></div>`)
        .join("");
    }

    /* ---- progress bars + panels reveal only once the dashboard is visible ---- */
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            dash.classList.add("is-live");
            uptime?.classList.add("is-live");
            obs.disconnect();
          });
        },
        { threshold: 0.2 }
      );
      io.observe(dash);
    } else {
      dash.classList.add("is-live");
      uptime?.classList.add("is-live");
    }
  };

  /* ------------------------------------------------------------------ *
   * BOOT
   * ------------------------------------------------------------------ */
  const boot = () => {
    initNav();
    initReveal();
    initCursorGlow();
    initCardSpotlight();
    initMagnetic();
    initTilt();
    initParticles();
    initEditor();
    initDashboard();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
