// node test/deals.test.js — Black Friday guide stays a search page, not a price page.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let fail = 0;
function bad(msg) { fail++; console.error('FAIL', msg); }

const page = fs.readFileSync(path.join(root, 'black-friday-machinist-tool-deals.html'), 'utf8');
if (!page.includes('As an Amazon Associate I earn from qualifying purchases.')) bad('disclosure missing');
if (!page.includes('https://askmachinist.com/')) bad('AskMachinist link missing');
if (!page.includes('rel="canonical" href="https://gageblockcalc.com/black-friday-machinist-tool-deals.html"')) bad('canonical missing');
if (!page.includes('property="og:title"')) bad('og title missing');
if (!page.includes('name="twitter:card"')) bad('twitter card missing');
if (!page.includes('"@type":"FAQPage"') || !page.includes('"@type":"ItemList"')) bad('JSON-LD types missing');
const scripts = (page.match(/<script[^>]+src="([^"]+)"/g) || []).map((s) => s.match(/src="([^"]+)"/)[1]);
if (scripts.length !== 2) bad('unexpected scripts ' + scripts.join(','));
if (!scripts.some((s) => s.indexOf('/version.js') >= 0)) bad('version.js missing');
if (!scripts.some((s) => s.indexOf('seasonal.js') >= 0)) bad('seasonal.js missing');
const amazon = page.match(/https:\/\/www\.amazon\.com\/s\?k=[^"']+/g) || [];
if (amazon.length < 12) bad('too few amazon searches ' + amazon.length);
amazon.forEach((href) => {
  if (!/tag=gageblockcalc-20/.test(href)) bad('search missing tag ' + href);
});
if ((page.match(/rel="sponsored nofollow noopener"/g) || []).length !== amazon.length) bad('sponsored rel count');
if (/\d+\s*%\s*off|\$\s*\d|countdown|hurry|limited time/i.test(page)) bad('price or urgency copy');
['/calculators/inch-gage-block-stack.html', '/calculators/inch-36-gage-block-stack.html', '/calculators/inch-28-gage-block-stack.html', '/calculators/metric-112-gage-block-stack.html', '/calculators/metric-88-gage-block-stack.html', '/calculators/sine-bar-gage-block-stack.html', '/calculators/wear-block-stack.html'].forEach((href) => {
  if (!page.includes('href="' + href + '"')) bad('missing calculator link ' + href);
});
['#gage-blocks', '#sine-bars', '#micrometers', '#calipers', '#indicators', '#height-gages', '#surface-plates', '#parallels', '#one-two-three-blocks', '#edge-finders', '#accessories', '#care'].forEach((id) => {
  if (!page.includes('id="' + id.slice(1) + '"')) bad('missing section ' + id);
});
if (!page.includes('More from Nick: <a href="https://oppsgo.com">OppsGo</a> free browser games')) bad('OppsGo footer missing');
if (!page.includes('data-gbc-games="1" href="https://oppsgo.com/thanksgiving-games"')) bad('Thanksgiving games link missing');
if (page.includes('oppsgo.com/christmas-games')) bad('static deals page should ship Thanksgiving games');
if (!page.includes('Machinist Christmas gift guide')) bad('Christmas gift guide missing');
if (!page.includes('id="calcVersion"')) bad('version footer missing');

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!index.includes('href="/black-friday-machinist-tool-deals.html"')) bad('home link missing');
const calcIndex = fs.readFileSync(path.join(root, 'calculators/index.html'), 'utf8');
if (!calcIndex.includes('href="/black-friday-machinist-tool-deals.html"')) bad('calculators index link missing');
const inch = fs.readFileSync(path.join(root, 'calculators/inch-gage-block-stack.html'), 'utf8');
if (!inch.includes('class="shop-more"')) bad('81-piece shop link missing');
if ((inch.match(/>Shop this gage block set</g) || []).length !== 1) bad('81-piece shop count changed');

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('https://gageblockcalc.com/black-friday-machinist-tool-deals.html')) bad('sitemap missing');
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
if (!llms.includes('https://gageblockcalc.com/black-friday-machinist-tool-deals.html')) bad('llms.txt missing');

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
