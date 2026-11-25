// node test/knoop.test.js — Knoop HK, case depth, stop rule, and page wiring.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const K = require('../js/knoop-case.js');
let fail = 0;
function bad(msg) { fail++; console.error('FAIL', msg); }

const hk = K.knoopHK(500, 95);
const fromUm = 14229 * 500 / (95 * 95);
const fromMm = 14.229 * 0.5 / (0.095 * 0.095);
if (hk === null || Math.abs(hk - fromUm) > 1e-6) bad('HK formula ' + hk + ' != ' + fromUm);
if (Math.abs(hk - fromMm) > 1e-6) bad('gf/µm and kgf/mm forms disagree ' + hk + ' vs ' + fromMm);
if (!(hk > 788 && hk < 789)) bad('500 g at 95 µm should be about 788, got ' + hk);
if (K.formatHK(hk) !== '788.3') bad('display HK ' + K.formatHK(hk));

const defaults = K.reading({ zero: '0.0000', mark: '0.0020', drum: '190', stop: '229', scaleUnits: '190', scaleUm: '95', load: '500' });
if (Math.abs(defaults.umPerUnit - 0.5) > 1e-12) bad('µm per unit ' + defaults.umPerUnit);
if (Math.abs(defaults.diagonalUm - 95) > 1e-9) bad('diagonal ' + defaults.diagonalUm);
if (Math.abs(defaults.hk - hk) > 1e-6) bad('default HK ' + defaults.hk);
if (K.formatIn(defaults.distance) !== '0.0020') bad('distance ' + defaults.distance);
if (K.formatIn(defaults.depth) !== '0.0030') bad('depth ' + defaults.depth);
if (defaults.statusText !== 'Keep going - next mark at about 0.0040 in') bad('default status ' + defaults.statusText);
if (defaults.status.state !== 'continue') bad('default state');

[228, 228.9].forEach(function (drum) {
  const going = K.reading({ zero: 0, mark: 0.002, drum: drum, stop: 229, scaleUnits: 190, scaleUm: 95, load: 500 });
  if (!going.status || going.status.state !== 'continue') bad('drum ' + drum + ' should keep going');
});
[229, 230, 229.0].forEach(function (drum) {
  const stopped = K.reading({ zero: 0, mark: 0.002, drum: drum, stop: 229, scaleUnits: 190, scaleUm: 95, load: 500 });
  if (!stopped.status || stopped.status.state !== 'stop') bad('drum ' + drum + ' should stop');
  if (stopped.statusText !== 'Stop reached - effective case depth = 0.0030 in') bad('stop text ' + drum + ' ' + stopped.statusText);
});

const inward = K.reading({ zero: 0.5, mark: 0.496, drum: 100, stop: 229, scaleUnits: 190, scaleUm: 95, load: 500 });
if (inward.statusText !== 'Keep going - next mark at about 0.4940 in') bad('negative direction ' + inward.statusText);
if (K.formatIn(inward.distance) !== '0.0040') bad('abs distance ' + inward.distance);
if (K.formatIn(inward.depth) !== '0.0050') bad('abs depth ' + inward.depth);

const onZero = K.nextMarkIn(0, 0);
if (K.formatIn(onZero) !== '0.0020') bad('on-zero step ' + onZero);
const neg = K.reading({ zero: 0, mark: -0.004, drum: 10, stop: 229, scaleUnits: 190, scaleUm: 95, load: 500 });
if (neg.statusText !== 'Keep going - next mark at about -0.0060 in') bad('negative mark ' + neg.statusText);

if (K.knoopHK(500, 0) !== null) bad('zero diagonal should not have an HK');
if (K.knoopHK(-1, 95) !== null) bad('negative load');
if (K.umPerUnit(0, 95) !== null) bad('zero scale units');
if (K.reading({ drum: '', stop: 229, zero: 0, mark: 0.002, scaleUnits: 190, scaleUm: 95, load: 500 }).status !== null) bad('blank drum');

const rows = [{ stage: '0.002', drum: '100' }, { stage: '0.006', drum: '228' }, { stage: '0.008', drum: '229' }, { stage: '0.010', drum: '300' }];
if (K.firstStopIndex(rows, 229) !== 2) bad('first stop row ' + K.firstStopIndex(rows, 229));
const found = K.logCase(rows, 229, 0);
if (found.index !== 2 || K.formatIn(found.depth) !== '0.0090') bad('log depth ' + JSON.stringify(found));
if (K.firstStopIndex([{ drum: '228' }, { drum: '' }], 229) !== -1) bad('below stop should miss');
const metrics = K.rowMetrics({ stage: '0.002', drum: '190' }, 0, 190, 95, 500);
if (K.formatHK(metrics.hk) !== '788.3' || K.formatIn(metrics.distance) !== '0.0020') bad('row metrics');

const page = fs.readFileSync(path.join(root, 'knoop-case-depth-calculator.html'), 'utf8');
if (!page.includes('<title>Knoop Case Depth Calculator - HK &amp; Effective Case Depth | GageBlockCalc</title>')) bad('title');
if (!page.includes('name="description" content="Free Knoop case depth calculator for HK and effective case depth from stage and filar readings. Runs in the browser. No login."')) bad('description');
if (!page.includes('rel="canonical" href="https://gageblockcalc.com/knoop-case-depth-calculator.html"')) bad('canonical');
if (!page.includes('property="og:title"')) bad('og title');
if (!page.includes('property="og:url" content="https://gageblockcalc.com/knoop-case-depth-calculator.html"')) bad('og url');
['knoopZero', 'knoopMark', 'knoopDrum', 'knoopStop', 'knoopScaleUnits', 'knoopScaleUm', 'knoopLoad'].forEach(function (id) {
  if (!page.includes('for="' + id + '"')) bad('missing label ' + id);
  if (!page.includes('id="' + id + '"')) bad('missing input ' + id);
});
if (!page.includes('id="knoopDrum" type="number" inputmode="decimal" step="any" value="190"')) bad('default drum');
if (!page.includes('id="knoopStop" type="number" inputmode="decimal" step="any" value="229"')) bad('default stop');
if (!page.includes('value="190"') || !page.includes('value="95"') || !page.includes('value="500"')) bad('scale or load default');
if (!page.includes('>788.3</dd>')) bad('default HK text');
if (!page.includes('Keep going - next mark at about 0.0040 in')) bad('default status text');
if (!page.includes('Calculated HK is approximate. Your shop\'s conversion table or the part spec governs.')) bad('approximation note');
if (/norris/i.test(page + fs.readFileSync(path.join(root, 'js/knoop-case.js'), 'utf8'))) bad('page mentions an employer');
if ((page.match(/<details>/g) || []).length < 4) bad('faq count');
const blocks = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
if (blocks.length !== 1) bad('json-ld blocks ' + blocks.length);
let types = [];
blocks.forEach(function (m) {
  let data;
  try { data = JSON.parse(m[1]); } catch (e) { bad('json-ld ' + e.message); return; }
  data.forEach(function (node) { types.push(node['@type']); });
});
['WebApplication', 'HowTo', 'FAQPage'].forEach(function (t) {
  if (types.indexOf(t) < 0) bad('missing ' + t);
});
const scripts = page.match(/<script[^>]*src="([^"]+)"/g) || [];
scripts.forEach(function (tag) {
  const src = (tag.match(/src="([^"]+)"/) || [])[1];
  if (/^https?:|^\/\//.test(src)) bad('external script ' + src);
});
if (!/src="\/js\/knoop-case\.js/.test(page)) bad('calculator script');
if (page.includes('google-analytics') || page.includes('gtag(') || page.includes('googletagmanager')) bad('tracker');

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!index.includes('id="knoopCase"')) bad('home card');
if (!index.includes('href="/knoop-case-depth-calculator.html"')) bad('home link');
const calcIndex = fs.readFileSync(path.join(root, 'calculators/index.html'), 'utf8');
if ((calcIndex.match(/href="\/knoop-case-depth-calculator\.html"/g) || []).length < 2) bad('calculators index links');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('https://gageblockcalc.com/knoop-case-depth-calculator.html')) bad('sitemap');
const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
if (!llms.includes('https://gageblockcalc.com/knoop-case-depth-calculator.html')) bad('llms.txt');
const version = fs.readFileSync(path.join(root, 'version.js'), 'utf8');
if (!version.includes('version:"1.0.143"')) bad('version stamp is not 1.0.143');
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
if (!sw.includes("const CACHE = 'gbc-1.0.143';")) bad('service worker cache');

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
