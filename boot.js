/* Moved out of inline handlers so the page can run under a strict CSP (no 'unsafe-inline' scripts). */
(function () {
  'use strict';
  function bind(sel, fn) {
    var a = document.querySelector(sel);
    if (a) a.addEventListener('click', function (e) { e.preventDefault(); if (window.NickHub && window.NickHub[fn]) window.NickHub[fn](); });
  }
  bind('a[data-hub-open="feedback"]', 'openFeedback');
  bind('a[data-hub-open="chat"]', 'openChat');
  // Shared hub embed from the free Pages CDN; removed quietly if it fails to load.
  try {
    var s = document.createElement('script');
    s.src = 'https://nick-hub-static.pages.dev/embed.js';
    s.defer = true;
    s.setAttribute('data-site', 'gageblockcalc');
    s.onerror = function () { s.remove(); };
    document.body.appendChild(s);
  } catch (e) {}
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(function () {});
})();
