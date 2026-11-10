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

if (recipes.length < 25 || recipes.length > 40) bad('recipe count ' + recipes.length);
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
  const sum = found.stacks[0].map((x) => A.toUnits(x, set.unitScale)).reduce((a, b) => a + b, 0);
  if (sum !== units) bad(recipe.slug + ' sum mismatch');
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

console.log(fail ? fail + ' FAILURES' : 'ALL PASS (' + recipes.length + ' recipes)');
process.exit(fail ? 1 : 0);
