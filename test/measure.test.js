// node test/measure.test.js
const fs = require('fs');
const path = require('path');
const M = require('../measure.js');
let fail = 0;
const bad = (m) => { fail++; console.log('FAIL', m); };

function keysOf(payload) {
  return Object.keys(payload).sort().join(',');
}

const ok = M.calculatorSuccess({ unit: 'in', set_type: 'inch-81', block_count: 3, target: 1.2345, email: 'a@b.co', blocks: [1, 0.1] });
if (!ok || ok.sent !== false) bad('success should not be sent');
if (!ok || ok.reason !== 'no_custom_event_collector') bad('reason ' + (ok && ok.reason));
if (!ok || ok.meaning !== 'calculation_completed') bad('success meaning');
if (!ok || keysOf(ok.payload) !== 'block_count,event,set_type,unit') bad('success keys ' + (ok && keysOf(ok.payload)));
if (!ok || ok.payload.unit !== 'in' || ok.payload.set_type !== 'inch-81' || ok.payload.block_count !== 3) bad('success fields');
if (ok && JSON.stringify(ok).includes('1.2345')) bad('target leaked into the record');
if (ok && JSON.stringify(ok).toLowerCase().includes('email')) bad('email leaked');

if (M.calculatorSuccess({ unit: 'cm', set_type: 'inch-81', block_count: 3 })) bad('bad unit accepted');
if (M.calculatorSuccess({ unit: 'in', set_type: 'shop-set', block_count: 3 })) bad('bad set accepted');
if (M.calculatorSuccess({ unit: 'mm', set_type: 'metric-112', block_count: 0 })) bad('zero blocks accepted');
if (M.calculatorSuccess({ unit: 'mm', set_type: 'metric-112', block_count: 1.5 })) bad('fractional blocks accepted');
if (M.calculatorSuccess({ unit: 'in', set_type: 'inch-28', block_count: 4 }).payload.unit !== 'in') bad('inch-28');

const click = M.affiliateClickFromAnchor({
  getAttribute: (k) => ({
    href: 'https://www.amazon.com/dp/B0C4GDDX4W?tag=gageblockcalc-20',
    'data-affiliate-placement': 'shop_panel',
    'data-affiliate-category': 'gage_block_set',
  })[k],
});
if (!click || click.sent !== false) bad('click should not be sent');
if (!click || click.meaning !== 'outbound_click') bad('click meaning is not a purchase');
if (!click || click.payload.event !== 'affiliate_click') bad('click event name');
if (!click || click.payload.domain !== 'amazon.com' || click.payload.merchant !== 'amazon') bad('click merchant');
if (!click || click.payload.placement !== 'shop_panel' || click.payload.destination_category !== 'gage_block_set') bad('click placement');
if (click && JSON.stringify(click).includes('B0C4GDDX4W')) bad('asin leaked');
if (click && JSON.stringify(click).includes('gageblockcalc-20')) bad('tag does not belong in the payload');
if (JSON.stringify(click).match(/commission|purchase/)) bad('click labeled as commission or purchase');

if (M.affiliateClickFromAnchor({
  getAttribute: (k) => ({
    href: 'https://www.amazon.com/s?k=gage+block+set',
    'data-affiliate-placement': 'faq_shop',
    'data-affiliate-category': 'gage_block_set',
  })[k],
})) bad('untagged amazon click counted');

if (M.affiliateClickFromAnchor({
  getAttribute: (k) => ({
    href: 'https://measurementsupply.com/product-catalog/gage-blocks',
    'data-affiliate-placement': 'shop_panel',
    'data-affiliate-category': 'gage_block_set',
  })[k],
})) bad('dealer catalog counted as affiliate');

if (M.affiliateClickFromAnchor({
  getAttribute: (k) => ({
    href: 'https://www.amazon.com/s?k=wear&tag=gageblockcalc-20',
    'data-affiliate-placement': 'shop_panel',
    'data-affiliate-category': 'mystery',
  })[k],
})) bad('unknown category counted');

const root = path.join(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const faq = fs.readFileSync(path.join(root, 'faq.html'), 'utf8');
const aff = fs.readFileSync(path.join(root, 'affiliate-config.js'), 'utf8');
if (!aff.includes("amazonTag: 'gageblockcalc-20'")) bad('amazon tag changed');
if (!aff.includes('https://measurementsupply.com/product-catalog/gage-blocks')) bad('dealer url changed');
const tagged = (index.match(/tag=gageblockcalc-20/g) || []).length;
if (tagged < 3) bad('index lost tagged fallbacks ' + tagged);
if (!/tag=gageblockcalc-20/.test(faq)) bad('faq lost affiliate tag');
if (!index.includes('data-measure="affiliate"')) bad('shop links not marked');
if (/halloween/i.test(index)) bad('halloween footer still present');
if (!index.includes('https://oppsgo.com/')) bad('evergreen games link missing');
if ((index.match(/Free Online Games/g) || []).length !== 1) bad('games link duplicated or missing');
if (!faq.includes('data-measure="affiliate"')) bad('faq shop link not marked');
if (index.includes('data-measure="affiliate"') && /id="affDealerLink"[^>]*data-measure="affiliate"/.test(index)) bad('dealer marked affiliate');
if (index.includes('data-measure="affiliate"') && /id="affGiftLink"[^>]*data-measure="affiliate"/.test(index)) bad('gift guide marked affiliate');

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
