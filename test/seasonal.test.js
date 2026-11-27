// node test/seasonal.test.js — local-date strip windows. Solver math is not involved.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const season = require('../seasonal.js');
let fail = 0;
function bad(msg) { fail++; console.error('FAIL', msg); }

function at(y, m, d, hh, mm) {
  return new Date(y, m - 1, d, hh == null ? 12 : hh, mm == null ? 0 : mm, 0);
}

const cases = [
  ['Nov 17', at(2026, 11, 17), null],
  ['Nov 18', at(2026, 11, 18), 'thanksgiving'],
  ['Nov 26', at(2026, 11, 26), 'thanksgiving'],
  ['Nov 27', at(2026, 11, 27), 'deals'],
  ['Nov 30', at(2026, 11, 30), 'deals'],
  ['Dec 1', at(2026, 12, 1), 'christmas'],
  ['Dec 31', at(2026, 12, 31), 'christmas'],
  ['Jan 1', at(2027, 1, 1), null]
];

cases.forEach(function (row) {
  const got = season.seasonFor(row[1]);
  if (got !== row[2]) bad(row[0] + ' seasonFor ' + got + ' expected ' + row[2]);
});

if (season.seasonFor(at(2026, 11, 26, 23, 59)) !== 'thanksgiving') bad('Nov 26 23:59 left Thanksgiving');
if (season.seasonFor(at(2026, 11, 27, 0, 0)) !== 'deals') bad('Nov 27 00:00 did not start deals');
if (season.seasonFor(at(2026, 11, 30, 23, 59)) !== 'deals') bad('Nov 30 23:59 dropped the deals line');
if (season.seasonFor(at(2026, 12, 1, 0, 0)) !== 'christmas') bad('Dec 1 00:00 did not start Christmas');
if (season.seasonFor(at(2026, 10, 31, 12)) !== null) bad('Oct 31 is not hidden');
if (season.seasonFor(at(2026, 12, 31, 23, 59)) !== 'christmas') bad('Dec 31 23:59 dropped Christmas');
if (season.seasonFor(at(2027, 1, 1, 0, 0)) !== null) bad('Jan 1 00:00 still shows a strip');

const tg = season.banner(at(2026, 11, 18));
const deals = season.banner(at(2026, 11, 28));
const xmas = season.banner(at(2026, 12, 5));
const hidden = season.banner(at(2026, 11, 17));
if (!tg || tg.href !== '/' || tg.linkText !== 'stack calculator') bad('thanksgiving link ' + JSON.stringify(tg));
if (!tg || tg.before + tg.linkText + tg.after !== 'Happy Thanksgiving from GageBlockCalc. The stack calculator is free, with no login.') bad('thanksgiving copy');
if (!deals || deals.href !== '/black-friday-machinist-tool-deals.html' || deals.linkText !== 'machinist tool guide') bad('deals link');
if (!deals || (deals.before + deals.linkText) !== 'Black Friday and Cyber Monday: see our machinist tool guide') bad('deals copy');
if (!xmas || xmas.href !== 'https://askmachinist.com/guides/machinist-christmas-gift-guide' || !xmas.external) bad('christmas link');
if (!xmas || (xmas.before + xmas.linkText) !== 'Merry Christmas from GageBlockCalc. Gift ideas for machinists') bad('christmas copy');
if (hidden) bad('Nov 17 banner should be null');
[tg, deals, xmas].forEach(function (b) {
  const text = b.emoji + b.before + b.linkText + b.after;
  if (/\d+\s*%|%\s*off|\$\s*\d/.test(text)) bad('price copy in ' + b.id);
});

const boot = fs.readFileSync(path.join(root, 'js/season-boot.js'), 'utf8').trim();
if (!boot.includes('m===10&&day>=18&&day<=26')) bad('boot lost Thanksgiving window');
if (!boot.includes('m===10&&day>=27')) bad('boot lost deals window');
if (!boot.includes('m===11')) bad('boot lost Christmas window');
if (/halloween|pumpkin|spooky|jack-o|trick or treat/i.test(boot + fs.readFileSync(path.join(root, 'seasonal.js'), 'utf8'))) bad('seasonal source still has Halloween copy');

function paint(when, className) {
  const made = [];
  function node() {
    return {
      id: '',
      className: '',
      style: {},
      attrs: {},
      children: [],
      textContent: '',
      setAttribute: function (k, v) { this.attrs[k] = v; },
      appendChild: function (c) { this.children.push(c); }
    };
  }
  const script = { nextSibling: null, parentNode: null };
  const parent = {
    className: className || '',
    classList: { contains: function (n) { return this.className === n; }.bind(null) },
    insertBefore: function (el) { made.push(el); }
  };
  parent.classList.contains = function (n) { return parent.className === n; };
  script.parentNode = parent;
  const document = {
    currentScript: script,
    getElementById: function () { return null; },
    createElement: function () { return node(); },
    createTextNode: function (t) { return { text: t }; }
  };
  const Orig = Date;
  function MockDate() {
    if (arguments.length === 0) return new Orig(when.getTime());
    return new Orig(...arguments);
  }
  MockDate.prototype = Orig.prototype;
  MockDate.now = function () { return when.getTime(); };
  MockDate.parse = Orig.parse;
  MockDate.UTC = Orig.UTC;
  new Function('document', 'Date', boot)(document, MockDate);
  return made;
}

function textOf(el) {
  if (!el) return '';
  if (el.text) return el.text;
  if (el.textContent && !el.children.length) return el.textContent;
  return (el.children || []).map(textOf).join('');
}

cases.forEach(function (row) {
  const made = paint(row[1], '');
  if (!row[2]) {
    if (made.length) bad(row[0] + ' boot reserved a strip');
    return;
  }
  if (made.length !== 1) bad(row[0] + ' boot strip count ' + made.length);
  const el = made[0];
  const spec = season.banner(row[1]);
  const expect = spec.emoji + ' ' + spec.before + spec.linkText + spec.after;
  if (textOf(el) !== expect) bad(row[0] + ' boot text ' + JSON.stringify(textOf(el)));
  if (el.attrs['data-gbc-season'] !== row[2]) bad(row[0] + ' boot id ' + el.attrs['data-gbc-season']);
  const link = (el.children || []).filter(function (c) { return c.attrs && c.attrs.href; })[0];
  if (!link || link.attrs.href !== spec.href) bad(row[0] + ' boot href');
  if (el.style.cssText.indexOf('min-height:2.25rem') < 0) bad(row[0] + ' missing min-height');
});

const homePaint = paint(at(2026, 11, 18), 'container');
if (!homePaint.length || homePaint[0].style.cssText.indexOf('margin:0') < 0) bad('home strip margin should not add to the column gap');
const pagePaint = paint(at(2026, 11, 18), '');
if (!pagePaint.length || pagePaint[0].style.cssText.indexOf('margin:.75rem 0 0') < 0) bad('page strip margin');

function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (ent) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  });
  return out;
}
const targets = [path.join(root, 'index.html'), path.join(root, 'black-friday-machinist-tool-deals.html'), path.join(root, 'knoop-case-depth-calculator.html')]
  .concat(walk(path.join(root, 'calculators'), []));
targets.forEach(function (file) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  if (!html.includes(boot)) bad(rel + ' missing the sync seasonal boot');
  if (!/src="[^"]*seasonal\.js/.test(html)) bad(rel + ' missing deferred seasonal.js');
  const n = html.split(boot).length - 1;
  if (n !== 1) bad(rel + ' boot count ' + n);
});

['faq.html', 'embed.html', 'privacy.html', 'widget.html', 'offline.html', 'terms.html'].forEach(function (rel) {
  const html = fs.readFileSync(path.join(root, rel), 'utf8');
  if (html.includes('gbc-season') || html.includes('Happy Thanksgiving from GageBlockCalc')) bad(rel + ' should not carry the strip');
});

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (index.includes('data-seasonal-pun') || index.includes('seasonal-pun')) bad('old pun line still on the home page');
if (!index.includes('data-gbc-games="1" href="https://oppsgo.com/christmas-games"') || !index.includes('>Free Christmas Games</a>')) bad('Free Christmas Games footer link missing');
if (index.includes('oppsgo.com/thanksgiving-games') || index.includes('Free Thanksgiving Games')) bad('static HTML should ship Christmas games, not Thanksgiving');
if (!index.includes('More from Nick: <a href="https://oppsgo.com">OppsGo</a> free browser games')) bad('OppsGo link missing');

function gamesAt(y, m, d) { return season.gamesFor(new Date(y, m - 1, d, 12, 0, 0)); }
[['Nov 18', 2026, 11, 18], ['Nov 26', 2026, 11, 26], ['Jan 1', 2027, 1, 1]].forEach(function (row) {
  const g = gamesAt(row[1], row[2], row[3]);
  if (!g || g.href !== 'https://oppsgo.com/thanksgiving-games' || g.label !== 'Free Thanksgiving Games') bad(row[0] + ' games ' + JSON.stringify(g));
});
[['Nov 27', 2026, 11, 27], ['Nov 30', 2026, 11, 30], ['Dec 1', 2026, 12, 1], ['Dec 5', 2026, 12, 5], ['Dec 31', 2026, 12, 31]].forEach(function (row) {
  const g = gamesAt(row[1], row[2], row[3]);
  if (!g || g.href !== 'https://oppsgo.com/christmas-games' || g.label !== 'Free Christmas Games') bad(row[0] + ' games ' + JSON.stringify(g));
});

function anchor(href, text, marked) {
  return {
    href: href,
    textContent: text,
    marked: !!marked,
    getAttribute: function (n) { return n === 'href' ? this.href : null; },
    setAttribute: function (n, v) { if (n === 'href') this.href = v; },
    hasAttribute: function (n) { return n === 'data-gbc-games' && this.marked; }
  };
}
const opps = anchor('https://oppsgo.com', 'OppsGo', false);
const online = anchor('https://oppsgo.com/', 'Free Online Games', false);
const games = anchor('https://oppsgo.com/thanksgiving-games', 'Free Thanksgiving Games', true);
season.applyGames({ querySelectorAll: function () { return [opps, online, games]; } }, new Date(2026, 11, 1, 12));
if (games.href !== 'https://oppsgo.com/christmas-games' || games.textContent !== 'Free Christmas Games') bad('Dec 1 did not swap the games link');
if (opps.href !== 'https://oppsgo.com' || opps.textContent !== 'OppsGo') bad('OppsGo link was changed');
if (online.textContent !== 'Free Online Games') bad('Free Online Games was changed');
season.applyGames({ querySelectorAll: function () { return [games]; } }, new Date(2026, 10, 26, 12));
if (games.href !== 'https://oppsgo.com/thanksgiving-games' || games.textContent !== 'Free Thanksgiving Games') bad('Nov 26 did not keep Thanksgiving games');
season.applyGames({ querySelectorAll: function () { return [games]; } }, new Date(2026, 10, 27, 12));
if (games.href !== 'https://oppsgo.com/christmas-games' || games.textContent !== 'Free Christmas Games') bad('Nov 27 did not start Christmas games');

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
