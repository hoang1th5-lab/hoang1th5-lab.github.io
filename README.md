# BOMB SIGMA

A dark, futuristic landing page with a premium "cyber command center" aesthetic — glass panels, an animated grid, floating glow squares, a demo code editor, and a live-looking fictional dashboard. Pure HTML, CSS and JavaScript, no build step, no frameworks.

**Live site:** `https://<your-username>.github.io/<repo-name>/`

## Features

- Sticky glass navbar with scroll progress bar, active-section highlighting, and a mobile menu
- Hero section with animated headline, gradient sheen text, and a status indicator
- Interactive demo code editor (tabs, syntax-highlighted fake code, typing animation, RUN / CLEAR / COPY)
- Animated background: radial glow, drifting grid, floating glass squares, and a lightweight canvas particle field
- Feature cards with glassmorphism, hover glow and a cursor-tracked spotlight
- Fictional live dashboard: animated stat cards with sparklines, a scripted terminal log, a rotating activity feed, service status list, uptime chart and animated progress bars — **all data shown is demo data**, not real telemetry
- Download / GitHub call-to-action section
- Fully responsive (desktop, tablet, mobile) with a dedicated mobile nav
- Respects `prefers-reduced-motion` and is keyboard-navigable
- Self-hosted fonts (Inter + JetBrains Mono) — no external font or script requests, so it works the same offline as it does on GitHub Pages

## Project structure

```
.
├── index.html                     # Page markup (nav, hero, features, dashboard, CTA, footer)
├── style.css                      # All styling: tokens, layout, components, animations, responsive rules
├── script.js                      # All behavior: nav, reveal-on-scroll, editor demo, dashboard demo
├── assets/
│   ├── favicon.svg                # Site favicon (BOMB SIGMA mark)
│   └── fonts/
│       ├── inter-var.woff2        # Self-hosted variable font
│       └── jetbrains-mono-var.woff2
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions workflow → deploys to GitHub Pages
├── .nojekyll                      # Tells GitHub Pages to skip Jekyll processing
├── .gitignore
└── README.md
```

## Run locally

No build step or dependencies are required. Any static file server works. From the project root:

```bash
# Python 3
python3 -m http.server 8000

# or Node
npx serve .
```

Then open `http://localhost:8000` in your browser.

Opening `index.html` directly by double-clicking it also works for a quick look, but serving it over HTTP is recommended so relative paths and fonts behave exactly as they will in production.

## Deploy with GitHub Pages

This repo already includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that publishes the site automatically.

1. Push this repository to GitHub (or use the existing `hoang1th5-lab.github.io` repo — for a **user/organization** site the repo must be named exactly `<username>.github.io` and served from `main`; for any other repo name it becomes a **project** site instead).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` (or run the workflow manually from the **Actions** tab). The `deploy.yml` workflow uploads the whole repo as-is and publishes it.
5. Once the workflow finishes, the **Actions** tab and the **Settings → Pages** panel will show the live URL.

No secrets or configuration are needed — the workflow uses the built-in `GITHUB_TOKEN` and Pages' native `actions/deploy-pages` action.

## Editing content

- **Text & sections:** edit `index.html` directly — everything is plain semantic HTML.
- **Colors, spacing, fonts:** edit the tokens at the top of `style.css` (the `:root` block) — most of the design pulls from a small set of CSS variables.
- **Demo code editor content:** edit the `FILES` object near the top of the `initEditor` function in `script.js`. The code shown is illustrative-only, harmless sample JavaScript.
- **Dashboard numbers:** the stats, terminal lines, activity feed and uptime chart are generated client-side in `initDashboard` in `script.js` and are intentionally fictional — replace them with real data/API calls if you build a backend later.
- **Links:** update the Discord, Telegram, Download and "View on GitHub" URLs — they're marked with `<!-- EDIT: ... -->` comments in `index.html`.

## Browser support

Modern evergreen browsers (Chrome, Edge, Firefox, Safari — desktop and mobile). The layout, glass panels and animations use standard CSS (Grid, custom properties, `backdrop-filter`) with graceful fallbacks where a feature isn't supported.

---

© 2026 Bomb Sigma. All rights reserved.
