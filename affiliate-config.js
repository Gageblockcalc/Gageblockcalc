/**
 * Affiliate / monetization config for Gage Block Calculator.
 * Fill amazonTag after Amazon Associates approval (e.g. 'yoursite-20').
 * When amazonTag is empty, Amazon search links still work but carry no tag
 * (no commission expected until the tag is set).
 */
(function (global) {
  const AFFILIATE = {
    /** Amazon Associates tracking ID — leave '' until Nick fills it */
    amazonTag: 'gageblockcalc-20',

    /**
     * Optional second dealer (non-Amazon). Label shown in UI.
     * Homepage or search URL for Precision Engineering Supply (or partner link later).
     */
    dealerLabel: 'Precision Engineering Supply',
    dealerUrl: 'https://precisionengineeringsupply.com/',

    /**
     * Build an Amazon search URL for a product query.
     * Adds tag= when amazonTag is set; otherwise plain search (no commission).
     */
    amazonSearchUrl: function (keywords) {
      const q = encodeURIComponent(String(keywords || '').trim());
      let url = 'https://www.amazon.com/s?k=' + q;
      const tag = (AFFILIATE.amazonTag || '').trim();
      if (tag) url += '&tag=' + encodeURIComponent(tag);
      return url;
    },

    /** Search query for a gage block set matching the selected set name when possible. */
    gageBlockSetQuery: function (setName) {
      const name = (setName || '').trim();
      if (/metric/i.test(name)) {
        return (name || 'metric gage block set') + ' gage block set';
      }
      return (name || 'inch gage block') + ' gage block set';
    },

    wearBlocksQuery: function (unitLabel) {
      if (unitLabel === 'mm') return 'metric gage block wear protection blocks 1mm';
      return 'gage block wear protection blocks 0.050';
    },

    accessoriesQuery: function () {
      return 'gage block wringing stone';
    },
  };

  global.GageBlockAffiliate = AFFILIATE;
})(typeof globalThis !== 'undefined' ? globalThis : window);
