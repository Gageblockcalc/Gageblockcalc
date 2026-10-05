## 2026-10-05 — Machinist Hub links + visitor counter (branch `hub-integration`)

- Nothing above the fold changed (desktop 1280 and mobile 390 screenshots are pixel-identical to the live site). No popups, no banners, no login, no Firebase.
- After a stack is computed: a small **Save to Hub** link next to each stack (hub `save_stack` hand-off) and a one-line "Questions about this stack? **Ask the AI Machinist** · **Machinist Hub**" under the results. The AI link opens the hub with the question typed in, not sent.
- Footer: Ask the AI Machinist · Machinist Hub · Guides, an optional **Buy Me a Coffee** button (hidden while `bmcUrl` is empty), and a visitor counter ("N visits · N online now").
- Visitor counter: one tiny `text/plain` POST to the gageblockcalc-chat worker after the page has loaded and gone idle (no CORS preflight). Its line height is reserved, so nothing shifts. Failures are silent.
- New `hub-config.js` holds the hub URL as one constant (`hubUrl`; uses the Pages URL until app.gageblockcalc.com DNS is live), the counter endpoint, and `bmcUrl`. New `hub.js` (~4 KB) holds the hand-off helpers and footer extras.
- Optional deep link: `/?target=1.2345&set=inch-81` prefills the calculator. Without params the page is unchanged.
- Service worker cache bumped to `gageblockcalc-v14`. Live counter shows 🟢 when someone is online; Buy Me a Coffee stays yellow/hidden until `bmcUrl` is set. `hub-config.js` and `hub.js` are precached.

## 2026-10-03 — Measurement Supply dealer link

- Dealer button now points at Measurement Supply's gage-block catalog (not an affiliate tracking URL).
- Service worker cache bumped to `gageblockcalc-v12`.

## 2026-10-03 — Responsive stacks, least-used tiebreak

- Stopped the main-thread freeze: the success path no longer runs an unbounded combination search one block deeper than the classic stack (that walk was tens to hundreds of millions of nodes). Fallback search, used only when the classic method fails, is an exact-length search with a hard node cap.
- Chosen stack is ordered largest block to smallest.
- When several stacks use the same number of blocks, the one with the lowest total per-block usage wins. Fewer blocks still wins even if those blocks have been used more. Usage counts live in localStorage and go up when a stack is shown.
- Service worker cache bumped to `gageblockcalc-v11`.
- Re-checked Amazon product pages: inch-36 `B0C4GDDX4W`, metric-112 `B003U9W3B2`, and 0.050" wear `B08486RF98` stay direct links. Inch-81 ASIN `B002SG7QRY` stays removed (search fallback).

## 2026-09-29 — Remove broken Amazon deep link

- Removed the unavailable inch-81 ASIN mapping so the calculator uses its tagged Amazon search fallback.
- Bumped the service-worker cache to `gageblockcalc-v10`.

# Changelog — Gage Block Calculator

## 2026-09-28 — Verified Amazon product deep links

- Added verified deep links for the HFS 36-piece inch set (`B0C4GDDX4W`), Mitutoyo 112-piece metric set (`B003U9W3B2`), and Mitutoyo 0.050" steel wear block (`B08486RF98`).
- Added wear-link builder with search fallback; 28-piece inch and 88-piece metric configurations remain search-only because no exact verified listing was found.
- Bumped service-worker cache to `gageblockcalc-v9`.

Compared to the live site at https://gageblockcalc.com (single-file imperial 81-piece app).


## 2026-09-28 — Affiliate conversion + buyer FAQ

- Stronger Amazon search queries (Mitutoyo + piece count); ASIN deep link for inch-81 (`B002SG7QRY`) with search fallback.
- Clearer shop CTAs (“on Amazon →”); button-style affiliate links; post-result “Need this set?” nudge.
- FAQ section + FAQPage JSON-LD (what set to buy, wear blocks, stone, free calculator).
- Dealer link hides if `dealerUrl` empty; disclosure echoed in panel note.
- SW cache `gageblockcalc-v8`.

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

## 2026-09-28 — Amazon Associates tag

- Set `amazonTag` to `gageblockcalc-20` in `affiliate-config.js`.
- Bump service worker cache to `gageblockcalc-v5`.

## 2026-09-28 — SEO + Search Console prep

- Stronger title/meta, canonical, Open Graph, JSON-LD WebApplication.
- Tagline + “How to build a gage block stack” section for search intent.
- Added `robots.txt`; refreshed `sitemap.xml`.
- SW cache `gageblockcalc-v6`.

## 2026-09-28 — Inch size labels

- Inch blocks now display with thousandths (e.g. `.110` not `.11`, `.050`, `1.000`).
- SW cache `gageblockcalc-v7`.
