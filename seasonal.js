/* Local-date strip. One line, or nothing.
   Nov 18-26 Thanksgiving, Nov 27-30 Black Friday through Cyber Monday, Dec 1-31 Christmas.
   Dec 1 is Christmas. Nov 30 (Cyber Monday) still shows the deals line.
   The inline boot in js/season-boot.js paints the line during parse. This file is the
   deferred fallback and the date function the unit test loads. No layout when inactive. */
(function (root) {
  'use strict';
  var CALC = '/';
  var DEALS = '/black-friday-machinist-tool-deals.html';
  var GIFTS = 'https://askmachinist.com/guides/machinist-christmas-gift-guide';
  var TGAMES = 'https://oppsgo.com/thanksgiving-games';
  var XGAMES = 'https://oppsgo.com/christmas-games';
  var STYLE = 'box-sizing:border-box;display:block;max-width:100%;min-height:2.25rem;padding:.35rem .7rem;font-size:.875rem;line-height:1.4;text-align:left;background:#f8fafc;color:#1e293b;border:1px solid #e2e8f0;border-radius:8px;overflow-wrap:anywhere';
  var LINK_STYLE = 'color:#0a58ca;display:inline;min-height:0;text-decoration:underline;text-underline-offset:2px';

  function seasonFor(date) {
    var d = date || new Date();
    var m = d.getMonth();
    var day = d.getDate();
    if (m === 10 && day >= 18 && day <= 26) return 'thanksgiving';
    if (m === 10 && day >= 27) return 'deals';
    if (m === 11) return 'christmas';
    return null;
  }

  function banner(date) {
    var id = seasonFor(date);
    if (id === 'thanksgiving') {
      return {
        id: id,
        emoji: '🦃',
        before: 'Happy Thanksgiving from GageBlockCalc. The ',
        href: CALC,
        linkText: 'stack calculator',
        after: ' is free, with no login.',
        external: false
      };
    }
    if (id === 'deals') {
      return {
        id: id,
        emoji: '🛒',
        before: 'Black Friday and Cyber Monday: see our ',
        href: DEALS,
        linkText: 'machinist tool guide',
        after: '',
        external: false
      };
    }
    if (id === 'christmas') {
      return {
        id: id,
        emoji: '🎄',
        before: 'Merry Christmas from GageBlockCalc. ',
        href: GIFTS,
        linkText: 'Gift ideas for machinists',
        after: '',
        external: true
      };
    }
    return null;
  }

  function fill(doc, el, spec, margin) {
    el.id = 'gbc-season';
    el.className = 'gbc-season no-print';
    el.setAttribute('role', 'note');
    el.setAttribute('data-gbc-season', spec.id);
    el.style.cssText = STYLE + ';margin:' + margin;
    var em = doc.createElement('span');
    em.setAttribute('aria-hidden', 'true');
    em.textContent = spec.emoji + ' ';
    el.appendChild(em);
    el.appendChild(doc.createTextNode(spec.before));
    var a = doc.createElement('a');
    a.setAttribute('href', spec.href);
    a.textContent = spec.linkText;
    a.style.cssText = LINK_STYLE;
    if (spec.external) a.setAttribute('rel', 'noopener');
    el.appendChild(a);
    if (spec.after) el.appendChild(doc.createTextNode(spec.after));
    return el;
  }

  function gamesFor(date) {
    var d = date || new Date();
    var m = d.getMonth();
    var day = d.getDate();
    // Static HTML ships Christmas (correct from Nov 27 through Dec 31). Thanksgiving games through Nov 26.
    if ((m === 10 && day >= 27) || m === 11) return { href: XGAMES, label: 'Free Christmas Games' };
    return { href: TGAMES, label: 'Free Thanksgiving Games' };
  }

  function applyGames(doc, date) {
    if (!doc || !doc.querySelectorAll) return 0;
    var spec = gamesFor(date || new Date());
    var links = doc.querySelectorAll('a');
    var n = 0;
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = (a.getAttribute && a.getAttribute('href')) || '';
      var label = String(a.textContent || '').replace(/\s+/g, ' ').trim();
      var marked = a.hasAttribute && a.hasAttribute('data-gbc-games');
      var hrefHit = /oppsgo\.com\/(?:thanksgiving|christmas)-games\/?$/i.test(href);
      var labelHit = /^Free (?:Thanksgiving|Christmas) Games$/i.test(label);
      if (!marked && !hrefHit && !labelHit) continue;
      a.setAttribute('href', spec.href);
      a.textContent = spec.label;
      n++;
    }
    return n;
  }

  function mount(doc, date) {
    doc = doc || (typeof document !== 'undefined' ? document : null);
    if (!doc || !doc.getElementById || doc.getElementById('gbc-season')) return false;
    var spec = banner(date || new Date());
    if (!spec) return false;
    var header = doc.querySelector && doc.querySelector('header.gbc-brand');
    var tag = doc.querySelector && doc.querySelector('p.tagline');
    var anchor = header || tag;
    if (!anchor || !anchor.parentNode) return false;
    var home = anchor.parentNode.classList && anchor.parentNode.classList.contains('container');
    var el = fill(doc, doc.createElement('p'), spec, home ? '0' : '.75rem 0 0');
    anchor.parentNode.insertBefore(el, anchor.nextSibling);
    return true;
  }

  var api = { seasonFor: seasonFor, banner: banner, gamesFor: gamesFor, applyGames: applyGames, mount: mount };
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.GBCSeason = api;
  if (typeof document !== 'undefined') {
    var run = function () { mount(document); applyGames(document); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
  }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this));
