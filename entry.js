/**
 * Deep-link parsing for the calculator entry form.
 * Absent params leave the page as it is. Values that are not a set id,
 * in/mm, a plain dimension, or wear=0|1 are ignored.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GageBlockEntry = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SETS = {
    'inch-81': true,
    'inch-36': true,
    'inch-28': true,
    'metric-112': true,
    'metric-88': true,
  };

  function parseEntryQuery(search) {
    let q;
    try {
      q = new URLSearchParams(String(search || '').replace(/^\?/, ''));
    } catch (e) {
      return {};
    }
    const out = {};
    const setId = (q.get('set') || '').trim();
    if (SETS[setId]) out.setId = setId;
    const unit = (q.get('unit') || '').trim();
    if (unit === 'in' || unit === 'mm') out.unit = unit;
    const target = (q.get('target') || '').trim();
    if (/^(\d{1,4}(\.\d{1,6})?|\.\d{1,6})$/.test(target) && parseFloat(target) > 0) {
      out.target = target;
    }
    const wear = (q.get('wear') || '').trim();
    if (wear === '1') out.wear = true;
    else if (wear === '0') out.wear = false;
    return out;
  }

  return { parseEntryQuery: parseEntryQuery };
});
