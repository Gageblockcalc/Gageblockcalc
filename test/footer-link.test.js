// node test/footer-link.test.js — More from Nick games link, and the hub-catalog swap.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let fail = 0;
function bad(msg) { fail++; console.error('FAIL', msg); }

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const faq = fs.readFileSync(path.join(root, 'faq.html'), 'utf8');
const boot = fs.readFileSync(path.join(root, 'boot.js'), 'utf8');
const faqBoot = fs.readFileSync(path.join(root, 'faq-boot.js'), 'utf8');

if (/free-halloween-games\.pages\.dev|oppsgo\.com\/halloween-games|Free Halloween Games/i.test(index)) bad('index still has a halloween games link');
if (!index.includes('href="https://oppsgo.com/christmas-games"')) bad('christmas href missing');
if (!index.includes('>Free Christmas Games</a>')) bad('christmas label missing');
if (!index.includes('href="https://oppsgo.com/" target="_blank" rel="noopener">Free Online Games</a>')) bad('evergreen games link changed');
if (!index.includes('>Dance Coach</a>')) bad('dance coach missing');
if (!index.includes('>Machinist Hub</a>')) bad('Machinist Hub missing');
if (!index.includes('>Ask a machinist</a>')) bad('Ask a machinist missing');
if (!index.includes('>SnapMatch</a>')) bad('SnapMatch missing');
if (!index.includes('>Jeep Guides</a>')) bad('Jeep Guides missing');
if (!index.includes('>St. Pete Web Co</a>')) bad('studio link missing');
if (!index.includes('id="nick-hub-also"')) bad('Also-by-Nick footer missing');
if (!index.includes('More from Nick: <a href="https://oppsgo.com">OppsGo</a> free browser games')) bad('OppsGo anchor missing');
if (!faq.includes('More from Nick: <a href="https://oppsgo.com">OppsGo</a> free browser games')) bad('FAQ OppsGo anchor missing');
if (!faq.includes('Also by Nick:')) bad('FAQ Also by Nick missing');
if (!faq.includes('href="https://oppsgo.com/"')) bad('FAQ evergreen games link missing');
if (!faq.includes('>SnapMatch</a>')) bad('FAQ SnapMatch missing');

function extract(src, name) {
  const start = src.indexOf('function ' + name);
  if (start < 0) { bad(name + ' missing'); return ''; }
  let i = src.indexOf('{', start), depth = 0;
  for (let j = i; j < src.length; j++) {
    if (src[j] === '{') depth++;
    else if (src[j] === '}' && --depth === 0) return src.slice(start, j + 1);
  }
  bad(name + ' unclosed');
  return '';
}
const swapA = extract(boot, 'swapHalloweenGamesLinks');
const swapB = extract(faqBoot, 'swapHalloweenGamesLinks');
if (!swapA || swapA !== swapB) bad('home and FAQ swaps diverged');

function fakeLink(href, text) {
  const el = {
    href,
    textContent: text,
    parent: null,
    getAttribute(n) { return n === 'href' ? this.href : null; },
    setAttribute(n, v) { if (n === 'href') this.href = v; if (n === 'data-hub-ssr') this.ssr = v; },
    closest() { return this.parent; },
  };
  return el;
}
function runSwap(links) {
  const doc = { querySelectorAll() { return links; } };
  const fn = new Function('document', swapA + '\nreturn swapHalloweenGamesLinks;');
  fn(doc)(doc);
}

const pages = fakeLink('https://free-halloween-games.pages.dev/', 'Free Halloween Games');
const opps = fakeLink('https://oppsgo.com/halloween-games/', 'Free Halloween Games');
const box = { ssr: '', setAttribute(n, v) { if (n === 'data-hub-ssr') this.ssr = v; } };
opps.parent = box;
const evergreen = fakeLink('https://oppsgo.com/', 'Free Online Games');
const dance = fakeLink('https://dancecoach.pages.dev/', 'Dance Coach');
const hub = fakeLink('https://askmachinist.com/', 'Machinist Hub');
const labeled = fakeLink('https://example.com/old', 'Free Halloween Games');
runSwap([pages, opps, evergreen, dance, hub, labeled]);

function expectChristmas(el, name) {
  if (el.href !== 'https://oppsgo.com/christmas-games' || el.textContent !== 'Free Christmas Games') bad(name + ' not swapped: ' + el.href + ' ' + el.textContent);
}
expectChristmas(pages, 'pages.dev');
expectChristmas(opps, 'oppsgo halloween');
expectChristmas(labeled, 'label only');
if (box.ssr !== '1') bad('swapped block was not locked');
if (evergreen.href !== 'https://oppsgo.com/' || evergreen.textContent !== 'Free Online Games') bad('evergreen link mutated');
if (dance.href !== 'https://dancecoach.pages.dev/' || dance.textContent !== 'Dance Coach') bad('dance coach mutated');
if (hub.textContent !== 'Machinist Hub') bad('hub mutated');

runSwap([evergreen]);
if (evergreen.href !== 'https://oppsgo.com/') bad('second pass mutated evergreen');

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
