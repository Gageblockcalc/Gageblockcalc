/**
 * Machinist Hub hand-offs + footer extras for the Gage Block Calculator.
 * Tiny, no dependencies. Nothing here runs above the fold or blocks the calculator:
 *   - footer hub links / Buy Me a Coffee: hrefs set from GageBlockHubConfig
 *   - visitor counter: one small request after the page has loaded and gone idle;
 *     its line height is reserved in CSS so nothing shifts; any failure is silent.
 */
(function (global) {
  'use strict';
  const cfg = global.GageBlockHubConfig || {};
  const clean = (u) => (/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(String(u || '').replace(/\/+$/, '')) ? String(u).replace(/\/+$/, '') : '');
  const HUB = clean(cfg.hubUrl);
  const COUNTER = clean(cfg.counterUrl);

  function hubUrl(path) {
    return HUB ? HUB + (path || '/') : '';
  }

  /** Hub save_stack format: /?save_stack=1&set=inch-81&unit=in&target=1.2345&blocks=1.000,0.134,0.1005 */
  function saveStackUrl(o) {
    if (!HUB) return '';
    const q = new URLSearchParams({
      save_stack: '1',
      set: o.set || '',
      unit: o.unit === 'mm' ? 'mm' : 'in',
      target: String(o.target || ''),
      blocks: (o.blocks || []).join(','),
    });
    return HUB + '/?' + q.toString() + '#profile';
  }

  /** Opens the AI Machinist with the question typed in (not sent). */
  function askUrl(question) {
    if (!HUB) return '';
    if (!question) return HUB + '/#chat';
    return HUB + '/?' + new URLSearchParams({ ask: String(question).slice(0, 500) }).toString() + '#chat';
  }

  global.GageBlockHub = { enabled: !!HUB, hubUrl, saveStackUrl, askUrl };

  // ---- footer links (static markup carries data-hub-path; hide the row if no hub URL)
  const row = document.getElementById('hubFooterLinks');
  if (row) {
    if (!HUB) row.hidden = true;
    else row.querySelectorAll('a[data-hub-path]').forEach((a) => { a.href = hubUrl(a.getAttribute('data-hub-path')); });
  }

  // ---- Buy Me a Coffee (hidden unless a real BMC URL is configured)
  const bmc = document.getElementById('bmcBtn');
  const bmcUrl = String(cfg.bmcUrl || '').trim();
  if (bmc && /^https:\/\/(www\.)?(buymeacoffee\.com|coff\.ee)\/[A-Za-z0-9_.-]+\/?$/.test(bmcUrl)) {
    bmc.href = bmcUrl;
    bmc.hidden = false;
  }

  // ---- visitor counter
  const out = document.getElementById('visitCounter');
  if (!out || !COUNTER || !global.fetch) return;

  const SID_KEY = 'gageblockcalc-visit-sid';
  const BEAT_MS = 150000; // refresh "online now" every 2.5 min while the tab is visible
  const MAX_BEATS = 12;   // stop after ~30 min
  let sid = '';
  let isNew = false;
  try {
    sid = sessionStorage.getItem(SID_KEY) || '';
    if (!/^[a-z0-9]{8,32}$/.test(sid)) {
      sid = (Date.now().toString(36) + Math.random().toString(36).slice(2, 12)).slice(0, 24);
      sessionStorage.setItem(SID_KEY, sid);
      isNew = true;
    }
  } catch (_) {
    sid = (Date.now().toString(36) + Math.random().toString(36).slice(2, 12)).slice(0, 24);
    isNew = true;
  }

  function show(d) {
    if (!d || typeof d.total !== 'number' || d.total < 1) return;
    let txt = d.total.toLocaleString() + (d.total === 1 ? ' visit' : ' visits');
    if (typeof d.live === 'number' && d.live > 0) txt += ' · ' + d.live.toLocaleString() + ' online now';
    out.textContent = txt;
  }

  let beats = 0;
  function ping() {
    const body = JSON.stringify({ site: 'calc', sid: sid, new: isNew });
    isNew = false;
    // text/plain keeps this a "simple" CORS request (no preflight round trip)
    fetch(COUNTER + '/visit', { method: 'POST', body: body, credentials: 'omit', headers: { 'Content-Type': 'text/plain' } })
      .then((r) => (r.ok ? r.json() : null))
      .then(show)
      .catch(() => {});
  }

  function start() {
    ping();
    const timer = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (++beats >= MAX_BEATS) clearInterval(timer);
      ping();
    }, BEAT_MS);
  }

  function whenIdle() {
    if ('requestIdleCallback' in global) global.requestIdleCallback(start, { timeout: 4000 });
    else setTimeout(start, 1500);
  }
  if (document.readyState === 'complete') whenIdle();
  else global.addEventListener('load', whenIdle, { once: true });
})(typeof globalThis !== 'undefined' ? globalThis : window);
