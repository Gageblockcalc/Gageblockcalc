/* Seasonal machinist puns: one small, clean line that auto-switches by date.
   Halloween Oct 1-31, Thanksgiving Nov, winter holidays Dec, New Year Jan 1-15, default otherwise. */
(function (root) {
  'use strict';
  var PUNS = {
    halloween: [
      '🎃 Trick or thread: always check your pitch before the candy.',
      '🎃 This boring bar is anything but boo-ring.',
      '🍬 Our tolerances are tighter than a kid guarding their candy bag.',
      '🎃 Costume idea: go as a gage block. Everyone will want to wring you.',
      '🍬 Sweet fits only: no candy-corn tolerances here.'
    ],
    thanksgiving: [
      '🦃 Thankful for sharp tools, square setups and parts that pass first time.',
      '🦃 Carve the turkey, not your tolerances.',
      '🥧 Pie charts are fine, but pi on a lathe is better.',
      '🦃 Grateful for every chip, as long as it isn’t in the spindle.'
    ],
    winter: [
      '❄️ Every snowflake is unique, but your parts shouldn’t be.',
      '🎁 Best gift in the shop: a fresh set of end mills.',
      '⛄ Keep the shop at 68 °F, even when it’s snowing outside.',
      '🎄 Making a list, checking it twice: that’s just good inspection.'
    ],
    newyear: [
      '🎉 New year, new zero. Re-indicate those vises.',
      '🥂 Resolution: measure twice, cut once, all year long.',
      '🎉 Starting the year right on nominal.'
    ],
    default: [
      '📏 Measure twice, cut once, wring it right.',
      '🔧 Tight tolerances, loose schedule? Never.',
      '📐 Square, flat, parallel: the shop’s love language.',
      '⚙️ Keep calm and check your offsets.'
    ]
  };
  function season(d) {
    var m = d.getMonth(), day = d.getDate();
    if (m === 9) return 'halloween';
    if (m === 10) return 'thanksgiving';
    if (m === 11) return 'winter';
    if (m === 0 && day <= 15) return 'newyear';
    return 'default';
  }
  function pick(d) {
    d = d || new Date();
    var list = PUNS[season(d)];
    // Same pun all day, rotating daily.
    var n = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5);
    return list[n % list.length];
  }
  var api = { PUNS: PUNS, season: season, pick: pick };
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.SeasonalPuns = api;
  if (typeof document !== 'undefined') {
    var run = function () {
      var els = document.querySelectorAll('[data-seasonal-pun]');
      for (var i = 0; i < els.length; i++) { els[i].textContent = pick(); els[i].hidden = false; }
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  }
})(typeof window !== 'undefined' ? window : globalThis);
