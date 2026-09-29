# Changelog — Gage Block Calculator

Compared to the live site at https://gageblockcalc.com (single-file imperial 81-piece app).


## 2026-09-28 — Affiliate monetization UI
- Compact **Need blocks?** panel after results (Amazon search for selected set, wear blocks, wringing stone; optional Precision Engineering Supply dealer link).
- `affiliate-config.js`: empty `amazonTag` until Associates ID is set; links work without tag.
- Footer Amazon Associates disclosure; calculator remains ungated.
- See `MONETIZATION.md` for signup / partner / Pro pricing notes.
- Service worker cache bumped to `gageblockcalc-v4`.

## 2026-09-28 — Product polish
- **Copy stack** on each combination (clipboard line with ✓).
- **Share** via `navigator.share` when available, else copy; includes target + stack.
- **Print ticket** shop view: target, set name, date/time, block list + stack; `@media print` hides install bars/chrome.
- Primary (fewest-block) result highlighted with Primary badge and Copy / Share / Print.
- **Inch 28-piece** thin set (Starrett RC 28 / Mitutoyo): `.02005`, `.0201–.0209`, `.021–.029`, `.010–.090` (0.00001" units).
- **Metric 88-piece** (Mitutoyo 516-style): `1.0005`, `1.001–1.009`, `1.01–1.49`, `0.5–9.5`, `10–100×10`.

## Algorithm
- Replaced brute-force subset-sum (100k iteration cap) with the classic **digit-by-digit / minimum-block** method used for gage block stacks.
- Scores candidates by trailing-zero remainder and the Starrett “leave 0 or 5” heuristic; shallow backtrack if the greedy pick fails (e.g. missing blocks).
- Exact verification in integer working units (0.0001" / 0.0001 mm) with **✓ Verified**.
- If classic fails (missing pieces), falls back to a short exact search among remaining blocks.

## Block sets
- **Inch 81-piece** (previous set, cleaned/deduped) — note that some catalogs call related kits **83** when they add 2 wear blocks.
- **Inch 36-piece** (common shop set).
- **Metric 112-piece** (Mitutoyo Series 516–style 1 mm base: 1.0005, 1.001–1.009, 1.01–1.49, 0.5–24.5, 25/50/75/100).

## Wear / protection blocks
- Optional toggle: prefer **2×0.050"** (inch) or **2×1 mm** (metric) as outer wear blocks when enabled.

## UX
- Set dropdown, wear toggle, large tap targets, mobile-friendly layout.
- Combinations sorted by fewest blocks first; loading / error / empty hints.
- Per-size select + availability counts retained; **localStorage** remembers set choice, wear toggle, and availability per set.

## PWA
- Working `manifest.json` and `sw.js` at site root (`start_url: "/"`, `display: standalone`).
- Removed broken `/Gageblockcalc/` paths that previously 404’d on GitHub Pages.

## Project layout
- `index.html` — UI/CSS
- `algorithm.js` — stack algorithm (browser global; works with `file://`)
- `algorithm.mjs` — same algorithm as ES module for Node tests
- `app.js` — UI logic
- `manifest.json`, `sw.js` — PWA stubs
- `test-algorithm.mjs` — Node tests for known stacks

## Credits
- Footer unchanged: **Made by Nicholas Duncan 2025**
