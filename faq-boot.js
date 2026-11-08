/* Moved out of inline handlers so the page can run under a strict CSP (no 'unsafe-inline' scripts). */
(function () {
  'use strict';
  function bind(sel, fn) {
    var a = document.querySelector(sel);
    if (a) a.addEventListener('click', function (e) { e.preventDefault(); if (window.NickHub && window.NickHub[fn]) window.NickHub[fn](); });
  }
  bind('a[data-hub-open="feedback"]', 'openFeedback');
  bind('a[data-hub-open="chat"]', 'openChat');
  // Shared hub catalog can still paint Free Halloween Games
  // (free-halloween-games.pages.dev or oppsgo.com/halloween-games).
  // Replace only those anchors. Every other footer link stays.
  function swapHalloweenGamesLinks(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var links = scope.querySelectorAll('a[href]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      var href = a.getAttribute('href') || '';
      var label = (a.textContent || '').replace(/\s+/g, ' ').trim();
      var hrefHit = /free-halloween-games\.pages\.dev/i.test(href) || /oppsgo\.com\/halloween-games/i.test(href);
      var labelHit = /^free halloween games$/i.test(label);
      if (!hrefHit && !labelHit) continue;
      a.setAttribute('href', 'https://oppsgo.com/christmas-games');
      a.textContent = 'Free Christmas Games';
      if (a.closest) {
        var box = a.closest('#nick-hub-also, [data-nick-also]');
        if (box && box.setAttribute) box.setAttribute('data-hub-ssr', '1');
      }
    }
  }
  function watchHalloweenGames() {
    swapHalloweenGamesLinks(document);
    var mo;
    try {
      mo = new MutationObserver(function () { swapHalloweenGamesLinks(document); });
      var footers = document.querySelectorAll('footer, .footer');
      if (!footers.length && document.body) footers = [document.body];
      for (var i = 0; i < footers.length; i++) mo.observe(footers[i], { childList: true, subtree: true, characterData: true });
    } catch (e) {}
    setTimeout(function () {
      if (mo) mo.disconnect();
      swapHalloweenGamesLinks(document);
    }, 12000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchHalloweenGames);
  else watchHalloweenGames();
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
