/**
 * Affiliate / monetization config for Gage Block Calculator.
 * Fill amazonTag after Amazon Associates approval (e.g. 'yoursite-20').
 * When amazonTag is empty, Amazon search links still work but carry no tag
 * (no commission expected until the tag is set).
 */
(function (global) {
  const AFFILIATE = {
    /** Amazon Associates tracking ID */
    amazonTag: 'gageblockcalc-20',

    /**
     * Optional second dealer (non-Amazon). Label shown in UI.
     * Homepage until a partner / affiliate URL is confirmed.
     */
    dealerLabel: 'Precision Engineering Supply',
    dealerUrl: 'https://precisionengineeringsupply.com/',

    /**
     * Optional product ASINs (Amazon product pages convert better than search).
     * Leave empty or remove an ASIN if a listing goes away — search is the fallback.
     * Verified listings (re-check stock periodically):
     *   inch-81: B002SG7QRY (existing Mitutoyo 516-902-26 Grade 0, 81 pc)
     *   inch-36: B0C4GDDX4W (HFS 36 PC inch set, NIST-traceable, ASME B89.1.9-2023)
     *   metric-112: B003U9W3B2 (Mitutoyo 516-938-26 Grade 0, 112 pc)
     *   wear-in: B08486RF98 (Mitutoyo 0.050" steel square block, ASME Grade 0)
     *   No exact verified Amazon listings found for the calculator's 28-piece inch or
     *   88-piece metric configurations; those continue to use search fallback.
     */
    asins: {
      // Deep-link only to listings verified against their Amazon product pages.
      'inch-81': 'B002SG7QRY',
      'inch-36': 'B0C4GDDX4W',
      'metric-112': 'B003U9W3B2',
      'wear-in': 'B08486RF98',
    },

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

    /**
     * Build an Amazon product URL for an ASIN (with tag when set).
     * Returns null if asin is empty.
     */
    amazonProductUrl: function (asin) {
      const id = String(asin || '').trim();
      if (!id) return null;
      let url = 'https://www.amazon.com/dp/' + encodeURIComponent(id);
      const tag = (AFFILIATE.amazonTag || '').trim();
      if (tag) url += '?tag=' + encodeURIComponent(tag);
      return url;
    },

    /**
     * Best Amazon URL for a gage block set: ASIN deep link when mapped, else search.
     * setId is preferred (e.g. 'inch-81'); setName is used for the search query.
     */
    setShopUrl: function (setId, setName) {
      const asin = (AFFILIATE.asins && AFFILIATE.asins[setId]) || '';
      const product = AFFILIATE.amazonProductUrl(asin);
      if (product) return product;
      return AFFILIATE.amazonSearchUrl(AFFILIATE.gageBlockSetQuery(setName, setId));
    },

    /**
     * Search queries tuned for Amazon catalog relevance (brand + piece count).
     * Avoids redundant "Inch 81-piece gage block set gage block set" phrasing.
     */
    gageBlockSetQuery: function (setName, setId) {
      const id = String(setId || '').trim();
      const byId = {
        'inch-81': 'Mitutoyo 81 piece rectangular gage block set',
        'inch-36': 'HFS 36 PC inch gauge block set',
        'inch-28': 'Mitutoyo 28 piece rectangular gage block set',
        'metric-112': 'Mitutoyo 112 piece metric gage block set',
        'metric-88': 'Mitutoyo 88 piece metric gage block set',
      };
      if (byId[id]) return byId[id];

      const name = String(setName || '').trim();
      if (/metric/i.test(name)) {
        return (name || 'metric') + ' Mitutoyo gage block set';
      }
      if (name) return name + ' Mitutoyo rectangular gage block set';
      return 'Mitutoyo rectangular gage block set';
    },

    wearBlocksQuery: function (unitLabel) {
      if (unitLabel === 'mm') {
        return 'Mitutoyo metric wear gage block 1mm carbide';
      }
      return 'Mitutoyo 0.050 wear gage block set';
    },

    wearShopUrl: function (unitLabel) {
      const asin = unitLabel === 'mm' ? '' : (AFFILIATE.asins && AFFILIATE.asins['wear-in']) || '';
      const product = AFFILIATE.amazonProductUrl(asin);
      return product || AFFILIATE.amazonSearchUrl(AFFILIATE.wearBlocksQuery(unitLabel));
    },

    accessoriesQuery: function () {
      return 'gage block stone wringing serrated';
    },
  };

  global.GageBlockAffiliate = AFFILIATE;
})(typeof globalThis !== 'undefined' ? globalThis : window);
