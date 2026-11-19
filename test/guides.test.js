// node test/guides.test.js — shop how-to pages, JSON-LD, stacks, and shop-calcs.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
new Function(fs.readFileSync(path.join(root, 'algorithm.js'), 'utf8'))();
const A = globalThis.GageBlockAlgo;
const sets = A.buildSets();
const shop = require('../js/shop-calcs.js');
const entry = require('../entry.js');
let fail = 0;
function bad(msg) { fail++; console.error('FAIL', msg); }

const pages = [
  'about.html',
  'contact.html',
  'guides/how-to-wring-gage-blocks.html',
  'guides/gage-block-grades.html',
  'guides/check-calipers-with-gage-blocks.html',
  'guides/verify-height-gage-with-gage-blocks.html',
  'guides/sine-plate-setup.html',
  'guides/gage-block-care-and-storage.html',
  'guides/ceramic-vs-steel-vs-carbide-gage-blocks.html',
  'calculators/sine-bar-angle-table.html',
  'calculators/gage-block-temperature-correction.html',
  'calculators/inch-mm-gage-block-conversion.html'
];

const allowedAsk = new Set([
  'https://askmachinist.com/',
  'https://askmachinist.com/guides/how-to-wring-gage-blocks',
  'https://askmachinist.com/guides/how-to-choose-a-gage-block-set',
  'https://askmachinist.com/guides/how-to-build-a-gage-block-stack',
  'https://askmachinist.com/tools/gage-block-temperature-correction',
  'https://askmachinist.com/guides/metric-gage-block-stacks',
  'https://askmachinist.com/guides/carbide-vs-steel-gage-blocks',
  'https://askmachinist.com/guides/gage-block-calibration-interval',
  'https://askmachinist.com/guides/gage-block-accessories',
  'https://askmachinist.com/guides/how-to-check-a-micrometer-with-gage-blocks',
  'https://askmachinist.com/guides/how-to-check-calipers-with-gage-blocks',
  'https://askmachinist.com/guides/how-to-check-a-height-gage-with-gage-blocks',
  'https://askmachinist.com/guides/how-to-check-squareness',
  'https://askmachinist.com/tools/sine-bar-calculator',
  'https://askmachinist.com/guides/how-to-use-a-sine-bar-with-gage-blocks',
  'https://askmachinist.com/guides/gage-block-care-wear-blocks',
  'https://askmachinist.com/guides/machinist-christmas-gift-guide'
]);

const titles = new Set();
const descriptions = new Set();
pages.forEach(function (rel) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  const title = (html.match(/<title>([^<]+)<\/title>/) || [])[1];
  const desc = (html.match(/<meta name="description" content="([^"]+)"/) || [])[1];
  const canon = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1];
  if (!title) bad(rel + ' missing title');
  else if (titles.has(title)) bad(rel + ' duplicate title ' + title);
  else titles.add(title);
  if (!desc) bad(rel + ' missing description');
  else if (descriptions.has(desc)) bad(rel + ' duplicate description');
  else descriptions.add(desc);
  const expectCanon = 'https://gageblockcalc.com/' + rel;
  if (canon !== expectCanon) bad(rel + ' canonical ' + canon);
  if (!/<h1>[^<]+<\/h1>/.test(html)) bad(rel + ' missing h1');
  if (!html.includes('href="/about.html"') || !html.includes('href="/contact.html"')) bad(rel + ' legal links');
  if (!html.includes('href="/privacy.html"') || !html.includes('href="/terms.html"')) bad(rel + ' privacy/terms');
  if (!html.includes('js/season-boot.js') && !html.includes("if(document.getElementById('gbc-season'))return;")) bad(rel + ' missing seasonal boot');
  if (!html.includes('src="/seasonal.js"') && !/src="\/seasonal\.js\?/.test(html)) bad(rel + ' missing seasonal.js');
  if (rel !== 'about.html' && rel !== 'contact.html') {
    if (!html.includes('<h2>FAQ</h2>')) bad(rel + ' missing FAQ');
    if ((html.match(/<details>/g) || []).length < 3) bad(rel + ' fewer than 3 FAQ items');
  }
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!blocks.length) bad(rel + ' missing JSON-LD');
  let types = [];
  blocks.forEach(function (m) {
    let data;
    try { data = JSON.parse(m[1]); } catch (e) { bad(rel + ' JSON-LD ' + e.message); return; }
    const list = Array.isArray(data) ? data : [data];
    list.forEach(function (node) { if (node && node['@type']) types.push(node['@type']); });
  });
  if (!types.includes('BreadcrumbList')) bad(rel + ' missing BreadcrumbList');
  if (rel !== 'about.html' && rel !== 'contact.html') {
    if (!types.includes('FAQPage')) bad(rel + ' missing FAQPage');
    if (!types.includes('HowTo')) bad(rel + ' missing HowTo');
  }
  const main = (html.split('<main>')[1] || '').split('</main>')[0];
  const asks = [...main.matchAll(/https:\/\/askmachinist\.com[^"'\s]*/g)].map(function (m) { return m[0].replace(/&amp;/g, '&'); });
  if (asks.length < 1 || asks.length > 3) bad(rel + ' askmachinist link count ' + asks.length);
  asks.forEach(function (url) {
    const clean = url.replace(/[),.;]+$/, '');
    if (!allowedAsk.has(clean)) bad(rel + ' unverified askmachinist url ' + clean);
  });
  const queries = [...html.matchAll(/href="(\/\?[^"]+)"/g)].map(function (m) { return m[1].replace(/&amp;/g, '&'); });
  queries.forEach(function (href) {
    const parsed = entry.parseEntryQuery(href.replace(/^\//, ''));
    if (!parsed.target || !parsed.setId || typeof parsed.wear !== 'boolean') bad(rel + ' bad calculator link ' + href);
  });
  if (/<form[\s>]/i.test(html)) bad(rel + ' has a form');
});

const contact = fs.readFileSync(path.join(root, 'contact.html'), 'utf8');
if (!contact.includes('mailto:support@gageblockcalc.com')) bad('contact missing mailto');
if (!contact.includes('href="/#feedback"') || !contact.includes('href="/#chat"')) bad('contact missing calculator channels');
if (/precisionengineeringsupply/.test(contact)) bad('contact invented a partner mailbox');

const about = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
if (!/Amazon Associate/i.test(about)) bad('about missing affiliate disclosure');
if (!about.includes('https://askmachinist.com/')) bad('about missing sister site');
if (!/no login/i.test(about) || !/offline/i.test(about)) bad('about missing free/offline');

const delta = shop.deltaL(4, shop.STEEL, 23, 'C');
if (!delta || Math.abs(delta.dL - 0.000138) > 1e-12) bad('steel 4 in at 23 C');
const mm = shop.deltaL(100, shop.STEEL, 21, 'C');
if (!mm || Math.abs(mm.dL - 0.00115) > 1e-12) bad('100 mm steel 1 C');
const half = shop.convertLength(0.5, 'in');
if (!half || Math.abs(half.mm - 12.7) > 1e-9) bad('0.5 in to mm');
if (shop.stackHref(12.7, 'metric-112') !== '/?target=12.7&set=metric-112&wear=0') bad('12.7 href');
if (shop.stackHref(1, 'inch-81') !== '/?target=1&set=inch-81&wear=0') bad('1 in href');
const oneMm = shop.convertLength(1, 'mm');
if (!oneMm || shop.queryNumber(oneMm.inches) !== '0.03937') bad('1 mm query ' + (oneMm && shop.queryNumber(oneMm.inches)));

function stackOf(setId, target) {
  const set = sets[setId];
  const av = A.applyWearAvailability(A.defaultAvailability(set), set, false);
  const found = A.findStacks(target, set, av, false, null);
  return found.stacks[0].map(function (size) { return A.formatSize(size, set); }).join(' + ');
}

const table = fs.readFileSync(path.join(root, 'calculators/sine-bar-angle-table.html'), 'utf8');
const rows = [...table.matchAll(/data-length="([^"]+)" data-unit="([^"]+)" data-angle="([^"]+)" data-round="([^"]+)" data-set="([^"]+)">(?:(?!<\/tr>)[\s\S])*?<td>[^<]*<\/td><td>[^<]*<\/td><td>([^<]+)<\/td>/g)];
if (rows.length !== 18) bad('sine table rows ' + rows.length);
rows.forEach(function (m) {
  const length = Number(m[1]);
  const unit = m[2];
  const angle = Number(m[3]);
  const rounded = m[4];
  const setId = m[5];
  const blocks = m[6];
  const exact = length * Math.sin(angle * Math.PI / 180);
  const step = unit === 'in' ? 0.0001 : 0.001;
  const decimals = unit === 'in' ? 4 : 3;
  const expect = (Math.round(exact / step) * step).toFixed(decimals);
  if (expect !== rounded) bad('round ' + length + ' ' + angle + ' ' + rounded + ' != ' + expect);
  const got = stackOf(setId, Number(rounded));
  if (got !== blocks) bad('stack ' + setId + ' ' + rounded + ' ' + got + ' != ' + blocks);
});

const index = fs.readFileSync(path.join(root, 'calculators/index.html'), 'utf8');
pages.forEach(function (rel) {
  if (rel === 'about.html' || rel === 'contact.html') return;
  if (!index.includes('/' + rel) && !index.includes(rel)) bad('calculators index missing ' + rel);
});
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
pages.forEach(function (rel) {
  const url = 'https://gageblockcalc.com/' + rel;
  if (!llms.includes(url)) bad('llms.txt missing ' + url);
  if (!sitemap.includes(url)) bad('sitemap missing ' + url);
});

const widget = fs.readFileSync(path.join(root, 'widget.html'), 'utf8');
const embed = fs.readFileSync(path.join(root, 'embed.html'), 'utf8');
if (widget.includes('about.html') || widget.includes('contact.html')) bad('widget.html was edited');
if (embed.includes('about.html') || embed.includes('contact.html')) bad('embed.html was edited');
const arcade = fs.readFileSync(path.join(root, 'arcade/index.html'), 'utf8');
if (!arcade.includes("frame-src https://oppsgo.com")) bad('arcade CSP changed');
if (!arcade.includes('href="/about.html"')) bad('arcade missing about');

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
