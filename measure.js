/**
 * Privacy-safe calculator and affiliate-click events.
 *
 * calculator_success: { unit, set_type, block_count }
 * affiliate_click:    { domain, placement, merchant, destination_category }
 *
 * A click is an outbound click only. It is not a commission and not a purchase.
 * The target dimension, block list, prompts, and any contact detail are dropped.
 *
 * Delivery: nothing is sent. Cloudflare Web Analytics is already injected on
 * gageblockcalc.com and does not accept custom events
 * (https://developers.cloudflare.com/web-analytics/faq/). The visit counter
 * accepts visit pings only and has no event route. Posting this payload at
 * either endpoint would be a false claim that the event was collected.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.GageBlockMeasure = api;
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('click', function (e) {
      const t = e.target;
      const a = t && t.closest ? t.closest('a[data-measure="affiliate"]') : null;
      if (a) api.affiliateClickFromAnchor(a);
    }, true);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SETS = {
    'inch-81': true,
    'inch-36': true,
    'inch-28': true,
    'metric-112': true,
    'metric-88': true,
  };
  const PLACEMENTS = { shop_panel: true, result_cta: true, faq_shop: true };
  const CATEGORIES = { gage_block_set: true, wear_blocks: true, accessories: true };

  function sanitize(name, props) {
    const src = props && typeof props === 'object' ? props : {};
    if (name === 'calculator_success') {
      const unit = src.unit === 'mm' ? 'mm' : src.unit === 'in' ? 'in' : '';
      const setType = typeof src.set_type === 'string' ? src.set_type : '';
      const count = src.block_count;
      if (!unit || !SETS[setType]) return null;
      if (typeof count !== 'number' || !Number.isInteger(count) || count < 1 || count > 40) return null;
      return { event: 'calculator_success', unit: unit, set_type: setType, block_count: count };
    }
    if (name === 'affiliate_click') {
      const domain = typeof src.domain === 'string' ? src.domain.trim().toLowerCase() : '';
      const placement = typeof src.placement === 'string' ? src.placement : '';
      const merchant = typeof src.merchant === 'string' ? src.merchant : '';
      const category = typeof src.destination_category === 'string' ? src.destination_category : '';
      if (domain !== 'amazon.com' || merchant !== 'amazon') return null;
      if (!PLACEMENTS[placement] || !CATEGORIES[category]) return null;
      return {
        event: 'affiliate_click',
        domain: domain,
        placement: placement,
        merchant: merchant,
        destination_category: category,
      };
    }
    return null;
  }

  function publish(payload) {
    const record = {
      payload: payload,
      sent: false,
      reason: 'no_custom_event_collector',
      meaning: payload.event === 'affiliate_click' ? 'outbound_click' : 'calculation_completed',
    };
    api.last = record;
    if (typeof document !== 'undefined' && typeof document.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      try {
        document.dispatchEvent(new CustomEvent('gageblockcalc-measure', { detail: record }));
      } catch (e) { /* ignore */ }
    }
    return record;
  }

  function record(name, props) {
    const payload = sanitize(name, props);
    if (!payload) return null;
    return publish(payload);
  }

  function calculatorSuccess(props) {
    return record('calculator_success', props);
  }

  function affiliateClickFromAnchor(a) {
    if (!a || typeof a.getAttribute !== 'function') return null;
    const href = a.getAttribute('href') || '';
    let host = '';
    try {
      host = new URL(href, 'https://gageblockcalc.com').hostname.replace(/^www\./, '').toLowerCase();
    } catch (e) {
      return null;
    }
    if (!/[?&]tag=[^&#]+/.test(href)) return null;
    return record('affiliate_click', {
      domain: host,
      placement: a.getAttribute('data-affiliate-placement') || '',
      merchant: host === 'amazon.com' ? 'amazon' : '',
      destination_category: a.getAttribute('data-affiliate-category') || '',
    });
  }

  const api = {
    sanitize: sanitize,
    record: record,
    calculatorSuccess: calculatorSuccess,
    affiliateClickFromAnchor: affiliateClickFromAnchor,
    last: null,
  };
  return api;
});
