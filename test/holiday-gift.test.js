// node test/holiday-gift.test.js — holiday gift guide: tagged Amazon links, no prices, JSON-LD.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let fail = 0;
function bad(msg) { fail++; console.error('FAIL', msg); }

const pagePath = path.join(root, 'machinist-holiday-gift-guide.html');
const page = fs.readFileSync(pagePath, 'utf8');

if (!page.includes('As an Amazon Associate I earn from qualifying purchases.')) bad('disclosure missing');
if (!page.includes('rel="canonical" href="https://gageblockcalc.com/machinist-holiday-gift-guide.html"')) bad('canonical missing');
if (!page.includes('https://askmachinist.com/guides/machinist-christmas-gift-guide')) bad('hub gift guide missing');
if (!page.includes('href="/black-friday-machinist-tool-deals.html"')) bad('black friday cross-link missing');
if (!page.includes('href="/calculators/inch-gage-block-stack.html"')) bad('81-piece guide missing');
if (!page.includes('href="/calculators/stacks/')) bad('stack link missing');
if (!page.includes('href="/"')) bad('calculator link missing');
if (page.includes('$')) bad('dollar sign on the gift guide');
if (/\d+\s*%\s*off|countdown|hurry|limited time/i.test(page)) bad('urgency copy');

function checkTag(raw) {
  const href = raw.replace(/&amp;/g, '&');
  let url;
  try { url = new URL(href); } catch (e) { bad('bad amazon url ' + href); return; }
  const tags = url.searchParams.getAll('tag');
  if (tags.length !== 1 || tags[0] !== 'gageblockcalc-20') bad('tag ' + JSON.stringify(tags) + ' on ' + href);
  if (/[?&]tag=(?!gageblockcalc-20(?:&|$))/.test(href)) bad('other tag ' + href);
}
const amazon = page.match(/https:\/\/www\.amazon\.com\/[^"']+/g) || [];
if (amazon.length < 18) bad('too few amazon links ' + amazon.length);
amazon.forEach(checkTag);
const anchorTags = page.match(/<a\b[^>]*>/g) || [];
const amazonAnchors = anchorTags.filter(function (tag) { return /amazon\.com/.test(tag); });
if (amazonAnchors.length < 18) bad('too few amazon anchors ' + amazonAnchors.length);
amazonAnchors.forEach(function (tag) {
  if (!/rel="sponsored nofollow noopener"/.test(tag)) bad('amazon anchor missing sponsored rel ' + tag.slice(0, 180));
  const href = (tag.match(/href="([^"]+)"/) || [])[1] || '';
  checkTag(href);
});

const blocks = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
if (blocks.length < 3) bad('JSON-LD block count ' + blocks.length);
const types = [];
blocks.forEach(function (m) {
  let data;
  try { data = JSON.parse(m[1]); } catch (e) { bad('JSON-LD ' + e.message); return; }
  types.push(data['@type']);
  if (data['@type'] === 'ItemList') {
    const items = data.itemListElement || [];
    if (items.length < 18) bad('ItemList length ' + items.length);
    items.forEach(function (item, i) {
      if (!item.name || !item.url) bad('ItemList item ' + i + ' missing name or url');
      if (item.offers || item.price || item.priceCurrency) bad('ItemList item has an offer');
      if (JSON.stringify(item).includes('$')) bad('ItemList price text');
      if (!/tag=gageblockcalc-20/.test(item.url)) bad('ItemList url tag ' + item.url);
    });
  }
});
['ItemList', 'BreadcrumbList', 'FAQPage'].forEach(function (t) {
  if (types.indexOf(t) < 0) bad('missing JSON-LD ' + t);
});

function exists(href) {
  const clean = href.split('#')[0].split('?')[0];
  if (clean === '/' || clean === '') return fs.existsSync(path.join(root, 'index.html'));
  const rel = clean.replace(/^\//, '');
  const abs = path.join(root, rel);
  if (fs.existsSync(abs)) return true;
  if (fs.existsSync(path.join(abs, 'index.html'))) return true;
  return false;
}
const internal = [...page.matchAll(/href="(\/[^"]*)"/g)].map(function (m) { return m[1]; });
internal.forEach(function (href) {
  if (!exists(href)) bad('broken internal ' + href);
});

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!index.includes('id="holidayGift"')) bad('home holiday card missing');
if (!index.includes('href="/machinist-holiday-gift-guide.html"')) bad('home link missing');
const deals = fs.readFileSync(path.join(root, 'black-friday-machinist-tool-deals.html'), 'utf8');
if (!deals.includes('href="/machinist-holiday-gift-guide.html"')) bad('deals page link missing');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('https://gageblockcalc.com/machinist-holiday-gift-guide.html')) bad('sitemap missing');
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
if (!llms.includes('https://gageblockcalc.com/machinist-holiday-gift-guide.html')) bad('llms.txt missing');
const version = fs.readFileSync(path.join(root, 'version.js'), 'utf8');
if (!version.includes('version:"1.0.142"')) bad('version stamp is not 1.0.142');

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
