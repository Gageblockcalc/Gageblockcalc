// node test/stacks.test.js — generated recipes match the solver and stay crawlable.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

let fail = 0;
const bad = (m) => { fail++; console.log('FAIL', m); };

execFileSync('node', ['scripts/build-stacks.js', '--check'], { cwd: root, stdio: 'inherit' });

new Function(fs.readFileSync(path.join(root, 'algorithm.js'), 'utf8'))();
const A = globalThis.GageBlockAlgo;
const sets = A.buildSets();
const recipes = require('../scripts/stack-recipes.js');

const HUB = [
  ['inch-81', '0.4375'], ['inch-81', '0.5625'], ['inch-81', '1.2345'], ['inch-81', '1.3750'],
  ['inch-81', '1.8125'], ['inch-81', '2.1875'], ['inch-81', '3.4567'], ['inch-81', '5.6789'],
  ['metric-88', '12.345'], ['metric-88', '25.4'], ['metric-88', '47.625'], ['metric-88', '63.5'],
  ['metric-88', '99.995'], ['metric-88', '150.123'],
];

if (recipes.length < 25 || recipes.length > 48) bad('recipe count ' + recipes.length);
const uses = new Set();
recipes.forEach((recipe) => {
  const set = sets[recipe.set];
  const units = A.toUnits(Number(recipe.target), set.unitScale);
  if (HUB.some(([id, t]) => id === recipe.set && A.toUnits(Number(t), sets[id].unitScale) === units)) {
    bad(recipe.slug + ' duplicates an AskMachinist size');
  }
  if (uses.has(recipe.use)) bad('duplicate shop use ' + recipe.slug);
  uses.add(recipe.use);
  const htmlPath = path.join(root, 'calculators', 'stacks', recipe.slug + '.html');
  if (!fs.existsSync(htmlPath)) { bad('missing ' + recipe.slug); return; }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const av = A.applyWearAvailability(A.defaultAvailability(set), set, !!recipe.wear);
  const found = A.findStacks(Number(recipe.target), set, av, !!recipe.wear, null);
  if (!found.stacks.length) { bad(recipe.slug + ' unsolved'); return; }
  const labels = found.stacks[0].map((x) => A.formatSize(x, set));
  const blockUnits = found.stacks[0].map((x) => A.toUnits(x, set.unitScale));
  const sum = blockUnits.reduce((a, b) => a + b, 0);
  if (sum !== units) bad(recipe.slug + ' sum mismatch');
  const sizeUnits = new Set(set.sizes.map((s) => A.toUnits(s, set.unitScale)));
  const wearUnits = A.toUnits(set.wearSize, set.unitScale);
  const used = new Map();
  blockUnits.forEach((u) => {
    if (!sizeUnits.has(u)) bad(recipe.slug + ' block not in set ' + u);
    used.set(u, (used.get(u) || 0) + 1);
  });
  used.forEach((count, u) => {
    const allowed = recipe.wear && u === wearUnits ? 2 : 1;
    if (count > allowed) bad(recipe.slug + ' reuses a block (' + u + ' x' + count + ')');
  });
  const joined = labels.join(' + ');
  if (!html.includes('data-stack="' + joined + '"')) bad(recipe.slug + ' table does not match solver ' + joined);
  const href = '/?target=' + recipe.target + '&amp;set=' + recipe.set + '&amp;wear=' + (recipe.wear ? '1' : '0');
  if (!html.includes('href="' + href + '"')) bad(recipe.slug + ' missing calculator link ' + href);
  const tableAt = html.indexOf('<table class="stack">');
  const shopAt = html.indexOf('gageblockcalc-20');
  const discAt = html.indexOf('As an Amazon Associate I earn from qualifying purchases.');
  if (tableAt < 0 || shopAt < tableAt) bad(recipe.slug + ' affiliate is not below the stack table');
  if (discAt < shopAt) bad(recipe.slug + ' disclosure is not with the shop links');
  if (!html.includes('FAQPage') || !html.includes('HowTo') || !html.includes('BreadcrumbList')) bad(recipe.slug + ' missing JSON-LD');
  if (!html.includes(recipe.use)) bad(recipe.slug + ' missing shop use');
  if (!html.includes('<h1>')) bad(recipe.slug + ' missing h1');
  const before = html.slice(0, tableAt);
  if (before.includes('amazon.com')) bad(recipe.slug + ' has an Amazon link above the table');
});

const llms = fs.readFileSync(path.join(root, 'llms.txt'), 'utf8');
if (!llms.includes('https://gageblockcalc.com/calculators/sine-bar-gage-block-stack.html')) bad('llms.txt missing sine bar');
if (!llms.includes('https://gageblockcalc.com/calculators/stacks/')) bad('llms.txt missing stacks index');
if (!llms.includes('https://askmachinist.com/guides/how-to-wring-gage-blocks')) bad('llms.txt missing wring guide');
recipes.forEach((recipe) => {
  if (!llms.includes('/calculators/stacks/' + recipe.slug + '.html')) bad('llms.txt missing ' + recipe.slug);
});

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('https://gageblockcalc.com/calculators/sine-bar-gage-block-stack.html')) bad('sitemap missing sine bar');
if (!sitemap.includes('https://gageblockcalc.com/calculators/stacks/</loc>')) bad('sitemap missing stacks index');
recipes.forEach((recipe) => {
  if (!sitemap.includes('https://gageblockcalc.com/calculators/stacks/' + recipe.slug + '.html')) bad('sitemap missing ' + recipe.slug);
});

const calcIndex = fs.readFileSync(path.join(root, 'calculators/index.html'), 'utf8');
if (!calcIndex.includes('href="/calculators/stacks/"')) bad('calculators index missing stacks link');
if (!calcIndex.includes('href="/llms.txt"')) bad('calculators index missing llms.txt');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (!home.includes('href="/calculators/stacks/">Common sizes</a>')) bad('calculator footer missing Common sizes');
if (fs.existsSync(path.join(root, 'calculators/stacks/0.9999-in-81.html'))) bad('typo slug should not exist');
if (fs.existsSync(path.join(root, 'calculators/stacks/1.2345-in-81.html'))) bad('hub size was generated');

const alias = fs.readFileSync(path.join(root, 'calculators/inch-81-gage-block-stack.html'), 'utf8');
if (!alias.includes('rel="canonical" href="https://gageblockcalc.com/calculators/inch-gage-block-stack.html"')) bad('alias canonical');
if (!/name="robots" content="noindex"/.test(alias)) bad('alias noindex');
if (!/http-equiv="refresh" content="0; url=\/calculators\/inch-gage-block-stack\.html"/.test(alias)) bad('alias meta refresh');
if (!alias.includes("location.search") || !alias.includes('location.replace')) bad('alias js redirect does not keep the query string');
if (!alias.includes('href="/calculators/inch-gage-block-stack.html"')) bad('alias fallback link');
if (sitemap.includes('inch-81-gage-block-stack.html')) bad('alias must stay out of sitemap.xml');
if (llms.includes('inch-81-gage-block-stack.html')) bad('alias must stay out of llms.txt');

const indexHtml = fs.readFileSync(path.join(root, 'calculators/stacks/index.html'), 'utf8');
['#inch-81', '#inch-36', '#inch-28', '#metric-112', '#metric-88', '#wear'].forEach((id) => {
  if (!indexHtml.includes('href="' + id + '"') || !indexHtml.includes('id="' + id.slice(1) + '"')) bad('stacks index missing jump ' + id);
});
const names = [];
const ld = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
JSON.parse(ld[1]).itemListElement.forEach((item) => names.push(item.name));
if (new Set(names).size !== names.length) bad('stacks index JSON-LD names are not unique');

const landings = {
  'calculators/inch-gage-block-stack.html': ['81-piece-inch-gage-block-set', '0.420-in-81.html', '4.0000-in-81.html'],
  'calculators/inch-36-gage-block-stack.html': ['36-piece-inch-gage-block-set', '0.250-in-36.html', '0.375-in-36.html'],
  'calculators/inch-28-gage-block-stack.html': ['28-piece-inch-gage-block-set', '0.100-in-28.html', '0.125-in-28.html'],
  'calculators/metric-112-gage-block-stack.html': ['112-piece-metric-gage-block-set', '12.70-mm-112.html', '30.00-mm-112.html'],
  'calculators/metric-88-gage-block-stack.html': ['88-piece-metric-gage-block-set', '12.70-mm-88.html', '15.00-mm-88.html'],
  'calculators/wear-block-stack.html': ['gage-block-care-wear-blocks', '0.7500-in-81-wear.html'],
  'calculators/sine-bar-gage-block-stack.html': ['how-to-use-a-sine-bar-with-gage-blocks', '0.8682-in-81.html', '17.365-mm-88.html'],
};
Object.entries(landings).forEach(([file, bits]) => {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  bits.forEach((bit) => { if (!html.includes(bit)) bad(file + ' missing ' + bit); });
  if (file.indexOf('sine-bar') < 0) {
    if ((html.match(/>Shop this gage block set</g) || []).length !== 1) bad(file + ' shop link count');
    if (!html.includes('rel="sponsored nofollow noopener"')) bad(file + ' shop rel');
    if (!html.includes('As an Amazon Associate I earn from qualifying purchases.')) bad(file + ' disclosure');
  }
});

recipes.forEach((recipe) => {
  const html = fs.readFileSync(path.join(root, 'calculators', 'stacks', recipe.slug + '.html'), 'utf8');
  const near = html.split('<h2>Nearby sizes</h2>')[1].split('</nav>')[0];
  const count = (near.match(/\/calculators\/stacks\//g) || []).length;
  if (count < 3 || count > 4) bad(recipe.slug + ' related count ' + count);
  const desc = (html.match(/name="description" content="([^"]*)"/) || [])[1] || '';
  if (desc.length < 80 || desc.length > 160 || !/[.!?]$/.test(desc)) bad(recipe.slug + ' description ' + desc.length);
  const blocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  const data = JSON.parse(blocks[1]);
  const types = data.map((d) => d['@type']);
  if (types.indexOf('FAQPage') < 0 || types.indexOf('HowTo') < 0 || types.indexOf('BreadcrumbList') < 0) bad(recipe.slug + ' JSON-LD types');
  if ((html.match(/>Shop this gage block set</g) || []).length !== 1) bad(recipe.slug + ' shop count');
  if ((html.match(/amazon\.com/g) || []).length !== 1) bad(recipe.slug + ' amazon count');
  if (!html.includes('More from Nick: <a href="https://oppsgo.com">OppsGo</a> free browser games')) bad(recipe.slug + ' OppsGo');
});

console.log(fail ? fail + ' FAILURES' : 'ALL PASS (' + recipes.length + ' recipes)');
process.exit(fail ? 1 : 0);
