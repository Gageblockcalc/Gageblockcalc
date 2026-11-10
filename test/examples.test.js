// node test/examples.test.js — pinned stacks for the published calculator examples.
const fs = require('fs');
const path = require('path');
new Function(fs.readFileSync(path.join(__dirname, '../algorithm.js'), 'utf8'))();
const A = globalThis.GageBlockAlgo;
const sets = A.buildSets();
let fail = 0;
const bad = (m) => { fail++; console.log('FAIL', m); };

function stackOf(setId, target, wear) {
  const set = sets[setId];
  const av = A.applyWearAvailability(A.defaultAvailability(set), set, wear);
  const r = A.findStacks(target, set, av, !!wear, null);
  if (!r.stacks.length) return null;
  return r.stacks[0].map((x) => A.formatSize(x, set));
}

function expect(label, setId, target, wear, blocks) {
  const got = stackOf(setId, target, wear);
  const a = JSON.stringify(got);
  const b = JSON.stringify(blocks);
  if (a !== b) bad(label + ' got ' + a + ' expected ' + b);
  else console.log('ok', label, got.join(' + '));
}

expect('1.2345 in 81', 'inch-81', 1.2345, false, ['1.000', '0.134', '0.1005']);
expect('0.7505 in 36', 'inch-36', 0.7505, false, ['0.500', '0.150', '0.1005']);
expect('0.12345 in 28', 'inch-28', 0.12345, false, ['0.060', '0.023', '0.0204', '0.02005']);
expect('0.10005 in 28', 'inch-28', 0.10005, false, ['0.080', '0.02005']);
expect('41.125 mm 112', 'metric-112', 41.125, false, ['25', '14', '1.12', '1.005']);
expect('41.125 mm 88', 'metric-88', 41.125, false, ['30', '9', '1.12', '1.005']);
expect('25.4 mm 88', 'metric-88', 25.4, false, ['20', '4', '1.4']);
expect('41.125 mm 88 wear', 'metric-88', 41.125, true, ['30', '7', '1.12', '1.005', '1', '1']);
expect('2.3456 in wear', 'inch-81', 2.3456, true, ['2.000', '0.145', '0.1006', '0.050', '0.050']);
expect('0.250 in 36 wear', 'inch-36', 0.25, true, ['0.150', '0.050', '0.050']);
expect('0.2608 in 1/4-20', 'inch-81', 0.2608, false, ['0.110', '0.1008', '0.050']);
expect('mic 0.105', 'inch-81', 0.105, false, ['0.105']);
expect('mic 0.210', 'inch-81', 0.21, false, ['0.110', '0.100']);
expect('mic 0.315', 'inch-81', 0.315, false, ['0.200', '0.115']);
expect('sine 5 in 10 deg', 'inch-81', 0.8682, false, ['0.650', '0.118', '0.1002']);
expect('sine 100 mm 10 deg', 'metric-88', 17.365, false, ['10', '5', '1.36', '1.005']);

const page88 = fs.readFileSync(path.join(__dirname, '../calculators/metric-88-gage-block-stack.html'), 'utf8');
if (!page88.includes('30 + 9 + 1.12 + 1.005')) bad('metric-88 page missing solver stack');
if (!page88.includes('href="/?target=41.125&set=metric-88"')) bad('metric-88 page missing CTA');
if (!page88.includes('HowTo') || !page88.includes('FAQPage') || !page88.includes('BreadcrumbList')) bad('metric-88 page missing JSON-LD');
if (/amazon|tag=gageblockcalc|affiliate/i.test(page88)) bad('metric-88 page has an affiliate link');
if (!page88.includes('metric-112-gage-block-stack.html')) bad('metric-88 page missing metric-112 link');
const page112 = fs.readFileSync(path.join(__dirname, '../calculators/metric-112-gage-block-stack.html'), 'utf8');
if (!page112.includes('25 + 14 + 1.12 + 1.005')) bad('metric-112 page missing solver stack');
if (!page112.includes('24 + 1.4')) bad('metric-112 page missing 25.4 mm stack');
if (!page112.includes('href="/?target=41.125&set=metric-112"')) bad('metric-112 page missing CTA');
if (!page112.includes('HowTo') || !page112.includes('FAQPage') || !page112.includes('BreadcrumbList')) bad('metric-112 page missing JSON-LD');
if (/amazon|tag=gageblockcalc|affiliate/i.test(page112)) bad('metric-112 page has an affiliate link');
if (!page112.includes('metric-88-gage-block-stack.html') || !page112.includes('metric-gage-block-stack.html')) bad('metric-112 page missing metric cross-links');
const pageMetric = fs.readFileSync(path.join(__dirname, '../calculators/metric-gage-block-stack.html'), 'utf8');
if (!pageMetric.includes('25 + 14 + 1.12 + 1.005')) bad('combined metric page missing 112 solver stack');
if (pageMetric.includes('19 + 20')) bad('combined metric page still shows the old 19 + 20 stack');
if (!pageMetric.includes('metric-112-gage-block-stack.html') || !pageMetric.includes('metric-88-gage-block-stack.html')) bad('combined metric page missing dedicated links');
const wearPage = fs.readFileSync(path.join(__dirname, '../calculators/wear-block-stack.html'), 'utf8');
if (!wearPage.includes('href="/?target=2.3456&set=inch-81&wear=1"')) bad('wear page CTA missing wear=1');
if (!wearPage.includes('metric-88-gage-block-stack.html')) bad('wear page missing metric-88 link');
if (!wearPage.includes('metric-112-gage-block-stack.html')) bad('wear page missing metric-112 link');
const calcIndex = fs.readFileSync(path.join(__dirname, '../calculators/index.html'), 'utf8');
if (!calcIndex.includes('https://gageblockcalc.com/calculators/metric-88-gage-block-stack.html')) bad('ItemList missing metric-88');
if (!calcIndex.includes('https://gageblockcalc.com/calculators/metric-112-gage-block-stack.html')) bad('ItemList missing metric-112');
const sitemap = fs.readFileSync(path.join(__dirname, '../sitemap.xml'), 'utf8');
if (!sitemap.includes('https://gageblockcalc.com/calculators/metric-88-gage-block-stack.html')) bad('sitemap missing metric-88');
if (!sitemap.includes('https://gageblockcalc.com/calculators/metric-112-gage-block-stack.html')) bad('sitemap missing metric-112');
const sine = fs.readFileSync(path.join(__dirname, '../calculators/sine-bar-gage-block-stack.html'), 'utf8');
const sineH = 5 * Math.sin(10 * Math.PI / 180);
const sineRounded = Math.round(sineH * 10000) / 10000;
if (Math.abs(sineRounded - 0.8682) > 1e-9) bad('sine rounding drifted from 0.8682');
if (!sine.includes('0.650 + 0.118 + 0.1002')) bad('sine page missing solver stack');
if (!sine.includes('10 + 5 + 1.36 + 1.005')) bad('sine page missing metric solver stack');
if (!sine.includes('href="/?target=0.8682&amp;set=inch-81"') && !sine.includes('href="/?target=0.8682&set=inch-81"')) bad('sine page missing inch CTA');
if (!sine.includes('href="/?target=17.365&amp;set=metric-88"') && !sine.includes('href="/?target=17.365&set=metric-88"')) bad('sine page missing metric CTA');
if (!sine.includes('H = L')) bad('sine page missing formula');
if (!sine.includes('0.0001') || !sine.includes('0.001')) bad('sine page missing rounding step');
if (!sine.includes('1.0005')) bad('sine page missing honest 1.0005 mm note');
if (!sine.includes('HowTo') || !sine.includes('FAQPage') || !sine.includes('BreadcrumbList')) bad('sine page missing JSON-LD');
if (/amazon|tag=gageblockcalc|affiliate/i.test(sine)) bad('sine page has an affiliate link');
for (const rel of [
  'inch-gage-block-stack.html',
  'inch-36-gage-block-stack.html',
  'inch-28-gage-block-stack.html',
  'metric-gage-block-stack.html',
  'metric-112-gage-block-stack.html',
  'metric-88-gage-block-stack.html',
]) {
  const html = fs.readFileSync(path.join(__dirname, '../calculators', rel), 'utf8');
  if (!html.includes('sine-bar-gage-block-stack.html')) bad(rel + ' missing sine bar link');
}
if (!calcIndex.includes('https://gageblockcalc.com/calculators/sine-bar-gage-block-stack.html')) bad('ItemList missing sine bar');
if (!calcIndex.includes('/calculators/sine-bar-gage-block-stack.html')) bad('calculators index missing sine card');
if (!sitemap.includes('https://gageblockcalc.com/calculators/sine-bar-gage-block-stack.html')) bad('sitemap missing sine bar');

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
