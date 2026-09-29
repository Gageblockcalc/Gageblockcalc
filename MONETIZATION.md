# Monetization — Gage Block Calculator

Affiliate UI is live (Recommended gear panel + Amazon disclosure). Calculator stays free and ungated.

## This week’s actions

### 1. Amazon Associates
1. Sign up: https://affiliate-program.amazon.com/
2. After approval, copy your tracking ID (e.g. `gageblockcalc-20`).
3. Set it in `affiliate-config.js`:
   ```js
   amazonTag: 'gageblockcalc-20',  // was ''
   ```
4. Redeploy / bump SW cache so clients pick up the new file.
5. Until `amazonTag` is set, Amazon search links still open without `tag=` (no commission).

### 2. Precision Engineering Supply partner
- Partner page: https://precisionengineeringsupply.com/pages/partner-with-us
- Email: support@precisionengineeringsupply.com
- Ask about affiliate / dealer referral for gage blocks and accessories.
- When you have a partner URL, put it in `affiliate-config.js` as `dealerUrl` (label is already `Precision Engineering Supply`).

### 3. Industrial affiliate networks
Apply to programs that often carry Mitutoyo, Starrett, Fowler, etc.:
- **CJ Affiliate** — https://www.cj.com/
- **Impact** — https://impact.com/
- **FlexOffers** — https://www.flexoffers.com/
- **Awin** — https://www.awin.com/

Use approved creatives / deep links later; keep the compact 2–3 link panel (no popups, no calc gating).

## How to set `amazonTag`

File: `affiliate-config.js` (loaded before `app.js`).

```js
amazonTag: '',              // empty → Amazon search with no tag
amazonTag: 'gageblockcalc-20',   // after Associates approval → links include &tag=
```

Helper: `GageBlockAffiliate.amazonSearchUrl(keywords)` builds the URL.

## Pro pricing (later — not built yet)

Possible paid tier once traffic justifies it:
- **$29/year** or **$49 lifetime**
- Features to consider: saved jobs, PDF export, extra sets / history

Do not gate the core calculator behind paywall.

## Compliance notes
- Footer must keep: *As an Amazon Associate I earn from qualifying purchases.*
- Affiliate links use `target="_blank"` and `rel="noopener sponsored"`.
- No popups, no forced click-through before calculate.
