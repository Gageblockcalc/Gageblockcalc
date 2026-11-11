#!/usr/bin/env node
/**
 * Build static stack recipes from scripts/stack-recipes.js.
 * Runs the existing solver. Exits non-zero if any stack is missing or
 * does not sum to the target in the set's integer units.
 *
 *   node scripts/build-stacks.js          write HTML, llms.txt, sitemap, landing links
 *   node scripts/build-stacks.js --check  fail if the written files would change
 */
'use strict';

const fs = require('fs');
const path = require('path');
const recipes = require('./stack-recipes.js');

const ROOT = path.join(__dirname, '..');
const STACK_DIR = path.join(ROOT, 'calculators', 'stacks');
const CHECK = process.argv.includes('--check');

function loadIIFE(rel) {
  const code = fs.readFileSync(path.join(ROOT, rel), 'utf8');
  new Function(code)();
}
loadIIFE('algorithm.js');
loadIIFE('affiliate-config.js');
const A = globalThis.GageBlockAlgo;
const Aff = globalThis.GageBlockAffiliate;
const Explain = require('../explain.js');
const sets = A.buildSets();

const HUB = [
  { set: 'inch-81', target: '0.4375', href: 'https://askmachinist.com/gage-block-stacks/0-4375-inch-gage-block-stack', label: '0.4375 in' },
  { set: 'inch-81', target: '0.5625', href: 'https://askmachinist.com/gage-block-stacks/0-5625-inch-gage-block-stack', label: '0.5625 in' },
  { set: 'inch-81', target: '1.2345', href: 'https://askmachinist.com/gage-block-stacks/1-2345-inch-gage-block-stack', label: '1.2345 in' },
  { set: 'inch-81', target: '1.3750', href: 'https://askmachinist.com/gage-block-stacks/1-3750-inch-gage-block-stack', label: '1.3750 in' },
  { set: 'inch-81', target: '1.8125', href: 'https://askmachinist.com/gage-block-stacks/1-8125-inch-gage-block-stack', label: '1.8125 in' },
  { set: 'inch-81', target: '2.1875', href: 'https://askmachinist.com/gage-block-stacks/2-1875-inch-gage-block-stack', label: '2.1875 in' },
  { set: 'inch-81', target: '3.4567', href: 'https://askmachinist.com/gage-block-stacks/3-4567-inch-gage-block-stack', label: '3.4567 in' },
  { set: 'inch-81', target: '5.6789', href: 'https://askmachinist.com/gage-block-stacks/5-6789-inch-gage-block-stack', label: '5.6789 in' },
  { set: 'metric-88', target: '12.345', href: 'https://askmachinist.com/gage-block-stacks/12-345-mm-gage-block-stack', label: '12.345 mm' },
  { set: 'metric-88', target: '25.4', href: 'https://askmachinist.com/gage-block-stacks/25-4-mm-gage-block-stack', label: '25.4 mm' },
  { set: 'metric-88', target: '47.625', href: 'https://askmachinist.com/gage-block-stacks/47-625-mm-gage-block-stack', label: '47.625 mm' },
  { set: 'metric-88', target: '63.5', href: 'https://askmachinist.com/gage-block-stacks/63-5-mm-gage-block-stack', label: '63.5 mm' },
  { set: 'metric-88', target: '99.995', href: 'https://askmachinist.com/gage-block-stacks/99-995-mm-gage-block-stack', label: '99.995 mm' },
  { set: 'metric-88', target: '150.123', href: 'https://askmachinist.com/gage-block-stacks/150-123-mm-gage-block-stack', label: '150.123 mm' },
];

const PARENT = {
  'inch-81': { href: '/calculators/inch-gage-block-stack.html', name: 'Inch 81-piece guide' },
  'inch-36': { href: '/calculators/inch-36-gage-block-stack.html', name: 'Inch 36-piece guide' },
  'inch-28': { href: '/calculators/inch-28-gage-block-stack.html', name: 'Inch 28-piece guide' },
  'metric-112': { href: '/calculators/metric-112-gage-block-stack.html', name: 'Metric 112-piece guide' },
  'metric-88': { href: '/calculators/metric-88-gage-block-stack.html', name: 'Metric 88-piece guide' },
};

const WEAR_PARENT = { href: '/calculators/wear-block-stack.html', name: 'Wear-block guide' };

// AskMachinist set pages that already exist. Do not invent URLs.
const SET_HUB = {
  'inch-81': { href: 'https://askmachinist.com/gage-block-stacks/81-piece-inch-gage-block-set', label: '81-piece inch set on AskMachinist' },
  'inch-36': { href: 'https://askmachinist.com/gage-block-stacks/36-piece-inch-gage-block-set', label: '36-piece inch set on AskMachinist' },
  'inch-28': { href: 'https://askmachinist.com/gage-block-stacks/28-piece-inch-gage-block-set', label: '28-piece inch set on AskMachinist' },
  'metric-112': { href: 'https://askmachinist.com/gage-block-stacks/112-piece-metric-gage-block-set', label: '112-piece metric set on AskMachinist' },
  'metric-88': { href: 'https://askmachinist.com/gage-block-stacks/88-piece-metric-gage-block-set', label: '88-piece metric set on AskMachinist' },
  wear: { href: 'https://askmachinist.com/guides/gage-block-care-wear-blocks', label: 'Wear blocks on AskMachinist' },
  sine: { href: 'https://askmachinist.com/guides/how-to-use-a-sine-bar-with-gage-blocks', label: 'Sine bar with gage blocks on AskMachinist' },
};

const SINE_SLUGS = new Set(['0.8682-in-81', '2.5000-in-81', '3.5355-in-81', '17.365-mm-88']);
const AFF_REL = 'sponsored nofollow noopener';

const GROUP_ORDER = [
  { id: 'inch-81', title: 'Inch, 81-piece set', match: (r) => r.set === 'inch-81' && !r.wear },
  { id: 'inch-36', title: 'Inch, 36-piece set', match: (r) => r.set === 'inch-36' && !r.wear },
  { id: 'inch-28', title: 'Inch, 28-piece set', match: (r) => r.set === 'inch-28' && !r.wear },
  { id: 'metric-112', title: 'Metric, 112-piece set', match: (r) => r.set === 'metric-112' && !r.wear },
  { id: 'metric-88', title: 'Metric, 88-piece set', match: (r) => r.set === 'metric-88' && !r.wear },
  { id: 'wear', title: 'Wear blocks on the 81-piece inch set', match: (r) => r.wear },
];

const LANDINGS = [
  { file: 'calculators/inch-gage-block-stack.html', marker: 'inch-81', shop: 'inch-81', hubs: ['inch-81'], match: (r) => r.set === 'inch-81' && !r.wear },
  { file: 'calculators/inch-36-gage-block-stack.html', marker: 'inch-36', shop: 'inch-36', hubs: ['inch-36'], match: (r) => r.set === 'inch-36' && !r.wear },
  { file: 'calculators/inch-28-gage-block-stack.html', marker: 'inch-28', shop: 'inch-28', hubs: ['inch-28'], match: (r) => r.set === 'inch-28' && !r.wear },
  { file: 'calculators/metric-112-gage-block-stack.html', marker: 'metric-112', shop: 'metric-112', hubs: ['metric-112'], match: (r) => r.set === 'metric-112' && !r.wear },
  { file: 'calculators/metric-88-gage-block-stack.html', marker: 'metric-88', shop: 'metric-88', hubs: ['metric-88'], match: (r) => r.set === 'metric-88' && !r.wear },
  { file: 'calculators/metric-gage-block-stack.html', marker: 'metric', shop: 'metric-112', hubs: ['metric-112', 'metric-88'], match: (r) => (r.set === 'metric-112' || r.set === 'metric-88') && !r.wear },
  { file: 'calculators/wear-block-stack.html', marker: 'wear', shop: 'inch-81', hubs: ['wear'], match: (r) => r.wear },
  { file: 'calculators/sine-bar-gage-block-stack.html', marker: 'sine', shop: null, hubs: ['sine'], match: (r) => SINE_SLUGS.has(r.slug) },
];

function fail(msg) {
  console.error('FAIL', msg);
  process.exitCode = 1;
  throw new Error(msg);
}

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function jsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

function setMeta(setId) {
  const set = sets[setId];
  if (!set) fail('unknown set ' + setId);
  const code = setId.split('-')[1];
  const unit = set.unitLabel;
  const name = code + '-piece ' + (unit === 'mm' ? 'metric' : 'inch') + ' set';
  return { set, code, unit, unitWord: unit === 'mm' ? 'mm' : 'in', name };
}

function solveOne(recipe) {
  const meta = setMeta(recipe.set);
  const target = Number(recipe.target);
  if (!Number.isFinite(target) || target <= 0) fail(recipe.slug + ' bad target');
  const av = A.applyWearAvailability(A.defaultAvailability(meta.set), meta.set, !!recipe.wear);
  const found = A.findStacks(target, meta.set, av, !!recipe.wear, null);
  if (!found.stacks.length) fail(recipe.slug + ' has no stack');
  const stack = found.stacks[0];
  const scale = meta.set.unitScale;
  const labels = stack.map((x) => A.formatSize(x, meta.set));
  const units = stack.map((x) => A.toUnits(x, scale));
  const sum = units.reduce((a, b) => a + b, 0);
  const targetUnits = A.toUnits(target, scale);
  if (sum !== targetUnits) fail(recipe.slug + ' sums to ' + sum + ' not ' + targetUnits);
  if (!A.verifyStack(stack, target, meta.set.verifyTol, scale)) fail(recipe.slug + ' failed verifyStack');
  let run = 0;
  const rows = labels.map((label, i) => {
    run += units[i];
    return { order: i + 1, label, running: A.formatSize(A.fromUnits(run, scale), meta.set) };
  });
  if (run !== targetUnits) fail(recipe.slug + ' running total drifted');
  const display = A.formatSize(target, meta.set) + ' ' + meta.unitWord;
  const explained = Explain.explainStack(stack, target, meta.set, found.method, A.formatSize);
  return { meta, target, stack, labels, rows, display, explained, method: found.method, sumUnits: sum, targetUnits };
}

function sameHub(recipe) {
  const meta = setMeta(recipe.set);
  const units = A.toUnits(Number(recipe.target), meta.set.unitScale);
  return HUB.find((h) => h.set === recipe.set && A.toUnits(Number(h.target), meta.set.unitScale) === units);
}

function calcHref(recipe) {
  // Always set wear so a saved toggle cannot change the stack this page shows.
  return '/?target=' + encodeURIComponent(recipe.target) + '&set=' + encodeURIComponent(recipe.set) + '&wear=' + (recipe.wear ? '1' : '0');
}

function wringLabels(solved, recipe) {
  if (!recipe.wear) return solved.labels.slice();
  const wearLabel = A.formatSize(solved.meta.set.wearSize, solved.meta.set);
  const inner = [];
  let left = 2;
  for (const lab of solved.labels) {
    if (lab === wearLabel && left > 0) { left -= 1; continue; }
    inner.push(lab);
  }
  if (left !== 0) return solved.labels.slice();
  return [wearLabel].concat(inner, [wearLabel]);
}

function byDistance(list, target) {
  return list.slice().sort((a, b) => {
    const d = Math.abs(Number(a.recipe.target) - target) - Math.abs(Number(b.recipe.target) - target);
    if (d) return d;
    return a.recipe.slug < b.recipe.slug ? -1 : 1;
  });
}

function neighbors(recipe, solvedAll) {
  const t = Number(recipe.target);
  const sameSet = solvedAll.filter((s) => s.recipe.set === recipe.set && s.recipe.slug !== recipe.slug);
  const sameWear = sameSet.filter((s) => !!s.recipe.wear === !!recipe.wear);
  const picked = byDistance(sameWear, t).slice(0, 4);
  if (picked.length < 3) {
    const have = new Set(picked.map((s) => s.recipe.slug));
    for (const s of byDistance(sameSet, t)) {
      if (have.has(s.recipe.slug)) continue;
      picked.push(s);
      have.add(s.recipe.slug);
      if (picked.length >= 4) break;
    }
  }
  picked.sort((a, b) => Number(a.recipe.target) - Number(b.recipe.target) || (a.recipe.slug < b.recipe.slug ? -1 : 1));
  return picked;
}

function clipAtWord(text, max) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return /[.!?]$/.test(clean) ? clean : clean + '.';
  let cut = clean.slice(0, max);
  const sentence = cut.lastIndexOf('. ');
  if (sentence >= 80) return cut.slice(0, sentence + 1);
  const space = cut.lastIndexOf(' ');
  if (space >= 80) cut = cut.slice(0, space);
  return cut.replace(/[.,;: ]+$/, '') + '.';
}

function metaDescription(solved) {
  const recipe = solved.recipe;
  const m = solved.meta;
  const n = solved.labels.length;
  const kind = m.unit === 'mm' ? 'metric' : 'inch';
  const article = /^8/.test(m.code) ? 'an' : 'a';
  const wear = recipe.wear ? ' with wear blocks' : '';
  const lead = solved.display + ' on ' + article + ' ' + m.code + '-piece ' + kind + ' set' + wear
    + ' uses ' + solved.labels.join(' + ') + ' (' + n + (n === 1 ? ' block' : ' blocks') + '). ';
  return clipAtWord(lead + recipe.use, 158);
}

function pageTitle(solved) {
  const recipe = solved.recipe;
  const m = solved.meta;
  const wearBit = recipe.wear ? ', wear blocks' : '';
  return 'Gage block combination for ' + solved.display + ' (' + m.code + '-piece set' + wearBit + ')';
}

function parentFor(recipe) {
  if (recipe.wear) return WEAR_PARENT;
  return PARENT[recipe.set];
}

function shopBlock(setId) {
  const meta = setMeta(setId);
  const url = Aff.setShopUrl(setId, meta.set.name);
  if (!/tag=gageblockcalc-20(?:&|$)/.test(url)) fail('shop url missing gageblockcalc-20 for ' + setId);
  return '<aside class="shop no-print" aria-label="Shop this gage block set">\n'
    + '<p><a href="' + esc(url) + '" target="_blank" rel="' + AFF_REL + '">Shop this gage block set</a></p>\n'
    + '<p class="disclosure">As an Amazon Associate I earn from qualifying purchases.</p>\n'
    + '</aside>';
}

function pageHtml(solved, near) {
  const recipe = solved.recipe;
  const m = solved.meta;
  const n = solved.labels.length;
  const joined = solved.labels.join(' + ');
  const title = pageTitle(solved);
  const desc = metaDescription(solved);
  const href = calcHref(recipe);
  const url = 'https://gageblockcalc.com/calculators/stacks/' + recipe.slug + '.html';
  const parent = parentFor(recipe);
  const wring = wringLabels(solved, recipe);
  const wearLabel = recipe.wear ? A.formatSize(m.set.wearSize, m.set) + ' ' + m.unitWord : '';
  const faqs = [
    {
      q: 'Can I mix inch and metric blocks to make ' + solved.display + '?',
      a: 'No. This recipe uses only the ' + m.name + '. ' + solved.display + ' stays in ' + (m.unit === 'mm' ? 'millimetres' : 'inches') + '. Change the set in the calculator if your blocks are the other unit.',
    },
    {
      q: 'Do I need wear blocks for ' + solved.display + '?',
      a: recipe.wear
        ? 'This recipe includes them. Wring one ' + wearLabel + ' wear block on each end. The calculator link sets wear=1 so the same blocks come up.'
        : 'Not for this recipe. The stack is the measuring blocks only (' + joined + '). For a stack that will be wrung often, see the wear-block guide and put a wear block on each end.',
    },
    {
      q: 'How do I wring the ' + solved.display + ' stack?',
      a: recipe.wear
        ? 'Clean the faces. Wring a wear block, then the measuring blocks thickest first (' + wring.slice(1, -1).join(', then ') + '), then the other wear block on the outside. The table lists the same blocks the calculator shows, largest first.'
        : 'Clean the faces and wring thickest first: ' + joined + '. Slide each face together. Do not push a nicked face straight down onto the stack.',
    },
    {
      q: 'What if one of these blocks is out of the set?',
      a: 'Open the calculator on this size and uncheck the missing block. It searches again. The combination on this page uses each listed block once and adds to ' + solved.display + '.',
    },
    {
      q: 'Is ' + n + ' block' + (n === 1 ? '' : 's') + ' the shortest stack for ' + solved.display + '?',
      a: 'Yes for the ' + m.name + ' with every block available' + (recipe.wear ? ' and wear blocks included' : '') + '. ' + joined + ' sums to ' + solved.display + ' in the set’s integer units.',
    },
  ];
  const howSteps = solved.explained.steps.map((step, i) => ({
    '@type': 'HowToStep',
    name: 'Add the ' + step.label + ' ' + m.unitWord + ' block',
    text: step.label + ' ' + m.unitWord + ' brings the stack to ' + step.height + ', ' + step.note,
  }));
  const ld = [
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to wring a ' + solved.display + ' gage block stack',
      step: howSteps,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'GageBlockCalc', item: 'https://gageblockcalc.com/' },
        { '@type': 'ListItem', position: 2, name: 'Calculators', item: 'https://gageblockcalc.com/calculators/' },
        { '@type': 'ListItem', position: 3, name: 'Common sizes', item: 'https://gageblockcalc.com/calculators/stacks/' },
        { '@type': 'ListItem', position: 4, name: title, item: url },
      ],
    },
  ];
  const rows = solved.rows.map((row) =>
    '<tr><td>' + row.order + '</td><td>' + esc(row.label) + ' ' + m.unitWord + '</td><td>' + esc(row.running) + ' ' + m.unitWord + '</td></tr>'
  ).join('');
  const explainSteps = solved.explained.steps.map((step) =>
    '<li><b>' + esc(step.label) + ' ' + m.unitWord + '.</b> Stack so far ' + esc(step.height) + ', ' + esc(step.note) + '</li>'
  ).join('');
  const nearLinks = near.map((s) => {
    let label = s.display;
    if (s.recipe.wear) label += ' with wear';
    else if (recipe.wear) label += ' without wear';
    return '<a href="/calculators/stacks/' + s.recipe.slug + '.html">' + esc(label) + '</a>';
  }).join(' ');
  const extra = [];
  if (recipe.slug === '0.2608-in-81') {
    extra.push('<a href="https://askmachinist.com/guides/unc-unf-thread-size-chart" rel="noopener">UNC/UNF chart</a>');
    extra.push('<a href="https://askmachinist.com/tools/three-wire-thread-measurement" rel="noopener">Three-wire calculator</a>');
  }
  if (recipe.slug === '0.105-in-81' || recipe.slug === '0.210-in-81' || recipe.slug === '0.315-in-81' || recipe.slug === '0.420-in-81') {
    extra.push('<a href="https://askmachinist.com/guides/how-to-check-a-micrometer-with-gage-blocks" rel="noopener">Check a micrometer</a>');
  }
  if (recipe.slug === '0.8682-in-81' || recipe.slug === '2.5000-in-81' || recipe.slug === '3.5355-in-81' || recipe.slug === '17.365-mm-88') {
    extra.push('<a href="/calculators/sine-bar-gage-block-stack.html">Sine bar height</a>');
  }
  if (recipe.slug === '0.625-in-81') extra.push('<a href="/calculators/stacks/0.625-in-36.html">0.625 in on the 36-piece set</a>');
  if (recipe.slug === '0.625-in-36') extra.push('<a href="/calculators/stacks/0.625-in-81.html">0.625 in on the 81-piece set</a>');
  if (recipe.slug === '0.2500-in-81') extra.push('<a href="/calculators/stacks/0.250-in-36.html">0.250 in on the 36-piece set</a>');
  if (recipe.slug === '0.250-in-36') extra.push('<a href="/calculators/stacks/0.2500-in-81.html">0.250 in on the 81-piece set</a>');
  if (recipe.slug === '0.375-in-81') extra.push('<a href="/calculators/stacks/0.375-in-36.html">0.375 in on the 36-piece set</a>');
  if (recipe.slug === '0.375-in-36') extra.push('<a href="/calculators/stacks/0.375-in-81.html">0.375 in on the 81-piece set</a>');
  if (recipe.slug === '12.70-mm-112') extra.push('<a href="/calculators/stacks/12.70-mm-88.html">12.7 mm on the 88-piece set</a>');
  if (recipe.slug === '12.70-mm-88') extra.push('<a href="/calculators/stacks/12.70-mm-112.html">12.7 mm on the 112-piece set</a>');
  if (recipe.slug === '41.125-mm-112') extra.push('<a href="/calculators/stacks/41.125-mm-88.html">41.125 mm on the 88-piece set</a>');
  if (recipe.slug === '41.125-mm-88') extra.push('<a href="/calculators/stacks/41.125-mm-112.html">41.125 mm on the 112-piece set</a>');
  if (recipe.slug === '0.7500-in-81') extra.push('<a href="/calculators/stacks/0.7500-in-81-wear.html">0.750 in with wear blocks</a>');
  if (recipe.slug === '0.7500-in-81-wear') extra.push('<a href="/calculators/stacks/0.7500-in-81.html">0.750 in without wear blocks</a>');

  return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">\n' +
    '<title>' + esc(title) + ' | GageBlockCalc</title>\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<meta name="description" content="' + esc(desc) + '">\n' +
    '<link rel="canonical" href="' + url + '">\n' +
    '<meta property="og:title" content="' + esc(title) + '"><meta property="og:description" content="' + esc(desc) + '">\n' +
    '<meta property="og:url" content="' + url + '"><meta property="og:image" content="https://gageblockcalc.com/icons/og-image.png?v=2026-10-27">\n' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#0f172a">\n' +
    '<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">\n' +
    '<script type="application/ld+json">' + jsonLd(ld) + '</script>\n' +
    STYLE +
    '</head><body>\n' +
    HEADER +
    '<main data-stack="' + esc(joined) + '" data-target="' + esc(recipe.target) + '" data-set="' + esc(recipe.set) + '" data-wear="' + (recipe.wear ? '1' : '0') + '">\n' +
    '<h1>' + esc(title) + '</h1>\n' +
    '<p>Fewest-block stack on the ' + esc(m.name) + ': ' + n + ' block' + (n === 1 ? '' : 's') + ' (' + esc(joined) + ').</p>\n' +
    '<table class="stack">\n<thead><tr><th>Order</th><th>Block</th><th>Running total</th></tr></thead>\n<tbody>\n' +
    rows + '\n</tbody></table>\n' +
    '<p>The blocks add to <b>' + esc(solved.display) + '</b>. The order matches the calculator, largest block first.' +
    (recipe.wear ? ' Wring the wear blocks on the outside: ' + esc(wring.join(', then ')) + '.' : ' Wring thickest first.') + '</p>\n' +
    '<p><a class="cta" id="openCalc" href="' + esc(href) + '">Open this stack in the calculator</a></p>\n' +
    '<h2>Shop use</h2>\n<p>' + esc(recipe.use) + '</p>\n' +
    '<h2>How this was chosen</h2>\n<p>' + esc(solved.explained.how) + ' ' + esc(solved.explained.why) + '</p>\n' +
    '<p>' + esc(recipe.context) + '</p>\n<ol>' + explainSteps + '</ol>\n' +
    '<p>' + esc(solved.explained.temp) + '</p>\n' +
    shopBlock(recipe.set) + '\n' +
    '<h2>Nearby sizes</h2>\n<nav class="rel" aria-label="Related recipes">' + nearLinks + '</nav>\n' +
    '<h2>Related</h2>\n<nav class="rel"><a href="' + parent.href + '">' + esc(parent.name) + '</a> <a href="/calculators/stacks/">All common sizes</a> <a href="' + esc(href) + '">Open ' + esc(solved.display) + ' in the calculator</a> <a href="/calculators/sine-bar-gage-block-stack.html">Sine bar</a> <a href="https://askmachinist.com/guides/how-to-wring-gage-blocks" rel="noopener">How to wring</a> <a href="https://askmachinist.com/guides/how-to-choose-a-gage-block-set" rel="noopener">Choose a set</a> <a href="https://askmachinist.com/guides/how-to-build-a-gage-block-stack" rel="noopener">How to build a stack</a> <a href="https://askmachinist.com/tools/gage-block-temperature-correction" rel="noopener">Temperature correction</a> ' + extra.join(' ') + '</nav>\n' +
    '<h2>FAQ</h2>\n' +
    faqs.map((f) => '<details><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>').join('\n') + '\n' +
    '<p class="no-print">Print this page from the browser for a shop ticket. The stack table is what prints; the shop links stay on screen.</p>\n' +
    '</main>\n' + FOOTER + '</body></html>\n';
}

const STYLE = '<style>body{font-family:system-ui,sans-serif;max-width:46rem;margin:0 auto;padding:1.5rem;background:#f8fafc;color:#0f172a;line-height:1.6}a{color:#0a58ca}h1{font-size:1.6rem;line-height:1.25}h2{margin-top:2rem;font-size:1.2rem;color:#0f172a}.card{background:#fff;border:1px solid #e2e8f0;border-radius:.6rem;padding:1rem 1.2rem;margin:1rem 0}.cta{display:inline-flex;align-items:center;box-sizing:border-box;min-height:44px;background:#0a58ca;color:#fff;font-weight:700;padding:.6rem 1rem;border-radius:.45rem;text-decoration:none;margin:.25rem .5rem .25rem 0}table.stack,table.idx{border-collapse:collapse;width:100%}td,th{border-bottom:1px solid #e2e8f0;padding:.4rem .45rem;text-align:left;vertical-align:top}table.stack{font-variant-numeric:tabular-nums;background:#fff}details{margin:.6rem 0;padding:.7rem 1rem;background:#fff;border:1px solid #e2e8f0;border-radius:.5rem}summary{font-weight:600;cursor:pointer;min-height:44px;display:flex;align-items:center}nav.rel a,.card>a{display:inline-flex;align-items:center;box-sizing:border-box;min-height:44px;margin-right:.35rem}main p a:not(.cta){display:inline-flex;align-items:center;box-sizing:border-box;min-height:44px}footer a{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:44px;min-width:44px;padding:.15rem .45rem}header.gbc-brand{flex-wrap:wrap;row-gap:.4rem}header.gbc-brand>a{min-height:44px;display:inline-flex;align-items:center}footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #e2e8f0;font-size:.9rem;color:#334155}.shop{background:#fff;border:1px solid #e2e8f0;border-radius:.6rem;padding:1rem 1.2rem;margin:1rem 0}.shop ul{margin:.4rem 0;padding-left:1.1rem}.shop a{display:inline-flex;align-items:center;box-sizing:border-box;min-height:44px}.disclosure{font-size:.92rem;color:#334155}.seasonal-xlink{margin:.75rem 0 0}.calc-version{margin-top:.4rem;font-size:12px;color:#595959}main{overflow-wrap:anywhere}@media(max-width:420px){body{padding:1rem}h1{font-size:1.35rem}}@media print{.no-print,header,footer,nav,.shop{display:none !important}body{background:#fff;max-width:none;color:#000}a{color:#000;text-decoration:none}}</style>\n';

const HEADER = '<header class="gbc-brand no-print" style="display:flex;align-items:center;gap:.6rem;padding:.25rem 0 1rem;margin-bottom:1rem;border-bottom:1px solid #e2e8f0"><a href="/" style="display:flex;align-items:center;gap:.6rem;text-decoration:none;color:inherit;font-weight:700;font-size:1.15rem"><img src="/icons/favicon.svg?v=2026-10-27" width="32" height="32" alt="GageBlockCalc logo">GageBlockCalc</a><span style="opacity:.7;font-size:.9rem">Free gage block stack calculator</span></header>\n';

const FOOTER = '<footer><a href="/">Calculator</a> · <a href="/calculators/">All calculators</a> · <a href="/calculators/stacks/">Common sizes</a> · <a href="/calculators/sine-bar-gage-block-stack.html">Sine bar</a> · <a href="/llms.txt">llms.txt</a> · <a href="/faq.html">FAQ</a> · <a href="/privacy.html">Privacy</a><br>Free, no login. Always verify critical stacks against your set\'s calibration certificate.'
  + '<p class="seasonal-xlink no-print"><span aria-hidden="true">🎄</span> <a href="https://askmachinist.com/guides/machinist-christmas-gift-guide" rel="noopener">Machinist Christmas gift guide</a> · <a href="https://oppsgo.com/christmas-games" target="_blank" rel="noopener">Free Christmas Games</a></p>'
  + '<p class="nick-also no-print">More from Nick: <a href="https://oppsgo.com">OppsGo</a> free browser games</p>'
  + '<div class="calc-version no-print"><span id="calcVersion" class="notranslate" translate="no"></span></div></footer>\n'
  + '<script src="/version.js" defer></script>\n';

function indexHtml(solvedAll) {
  const jumps = '<nav class="rel" aria-label="Jump to a set">' + GROUP_ORDER.map((g) =>
    '<a href="#' + g.id + '">' + esc(g.title) + '</a>'
  ).join(' ') + '</nav>\n';
  const groups = GROUP_ORDER.map((g) => {
    const items = solvedAll.filter((s) => g.match(s.recipe))
      .sort((a, b) => Number(a.recipe.target) - Number(b.recipe.target) || (a.recipe.slug < b.recipe.slug ? -1 : 1));
    const cards = items.map((s) => {
      const first = s.recipe.use.split(/(?<=\.)\s/)[0];
      return '<div class="card"><a href="/calculators/stacks/' + s.recipe.slug + '.html"><b>' + esc(s.display) + ' · ' + esc(s.meta.code) + '-piece' + (s.recipe.wear ? ' · wear' : '') + ' · ' + s.labels.length + ' block' + (s.labels.length === 1 ? '' : 's') + '</b></a><br>' + esc(s.labels.join(' + ')) + '<br>' + esc(first) + '</div>';
    }).join('');
    return '<h2 id="' + g.id + '">' + esc(g.title) + '</h2>\n' + cards;
  }).join('\n');
  const hub = HUB.map((h) => '<a href="' + h.href + '" rel="noopener">' + esc(h.label) + '</a>').join(' ');
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: solvedAll.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: 'https://gageblockcalc.com/calculators/stacks/' + s.recipe.slug + '.html',
      name: pageTitle(s),
    })),
  };
  return '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">\n' +
    '<title>Gage Block Combinations for Common Shop Sizes | GageBlockCalc</title>\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<meta name="description" content="Precomputed fewest-block gage block stacks for common inch and metric sizes. Each page shows the blocks, why those blocks, and opens the calculator on that size.">\n' +
    '<link rel="canonical" href="https://gageblockcalc.com/calculators/stacks/">\n' +
    '<meta property="og:title" content="Gage Block Combinations for Common Shop Sizes"><meta property="og:description" content="Precomputed fewest-block gage block stacks for common inch and metric sizes.">\n' +
    '<meta property="og:url" content="https://gageblockcalc.com/calculators/stacks/"><meta property="og:image" content="https://gageblockcalc.com/icons/og-image.png?v=2026-10-27">\n' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#0f172a">\n' +
    '<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">\n' +
    '<script type="application/ld+json">' + jsonLd(itemList) + '</script>\n' +
    STYLE + '</head><body>\n' + HEADER +
    '<main>\n<h1>Gage block combinations for common shop sizes</h1>\n' +
    '<p>A stack is the fewest gage blocks that wring to a target length. These pages are the solver’s answer for sizes shops look up, written out so you can read the blocks without running JavaScript. Open the <a href="/">calculator</a> for a size that is not listed. Wringing notes are in <a href="https://askmachinist.com/guides/how-to-wring-gage-blocks" rel="noopener">how to wring gage blocks</a>.</p>\n' +
    '<p><a class="cta" href="/">Open the calculator</a> <a class="cta" href="/calculators/sine-bar-gage-block-stack.html">Sine bar height</a></p>\n' +
    jumps +
    groups + '\n' +
    '<h2>Already on AskMachinist</h2>\n' +
    '<p>AskMachinist already has a worked stack for these sizes. This library does not repeat them.</p>\n' +
    '<nav class="rel">' + hub + '</nav>\n' +
    '<h2>Related</h2>\n<nav class="rel"><a href="/calculators/">All calculators</a> <a href="/calculators/inch-gage-block-stack.html">Inch 81-piece</a> <a href="/calculators/inch-36-gage-block-stack.html">Inch 36-piece</a> <a href="/calculators/inch-28-gage-block-stack.html">Inch 28-piece</a> <a href="/calculators/metric-112-gage-block-stack.html">Metric 112-piece</a> <a href="/calculators/metric-88-gage-block-stack.html">Metric 88-piece</a> <a href="/calculators/wear-block-stack.html">Wear blocks</a> <a href="/calculators/sine-bar-gage-block-stack.html">Sine bar</a> <a href="/llms.txt">llms.txt</a></nav>\n' +
    '</main>\n' + FOOTER + '</body></html>\n';
}

function llmsText(solvedAll) {
  const lines = [];
  lines.push('# GageBlockCalc');
  lines.push('');
  lines.push('Free gage block stack calculator for inch 81-, 36-, and 28-piece sets and metric 112- and 88-piece sets. No login. Recipe pages below were built by that same solver and each stack adds up to the stated size.');
  lines.push('');
  lines.push('## Tools');
  lines.push('- Calculator: https://gageblockcalc.com/');
  lines.push('- Common shop sizes: https://gageblockcalc.com/calculators/stacks/');
  lines.push('- Sine bar stack height: https://gageblockcalc.com/calculators/sine-bar-gage-block-stack.html');
  lines.push('- Inch 81-piece guide: https://gageblockcalc.com/calculators/inch-gage-block-stack.html');
  lines.push('- Inch 36-piece guide: https://gageblockcalc.com/calculators/inch-36-gage-block-stack.html');
  lines.push('- Inch 28-piece guide: https://gageblockcalc.com/calculators/inch-28-gage-block-stack.html');
  lines.push('- Metric sets: https://gageblockcalc.com/calculators/metric-gage-block-stack.html');
  lines.push('- Metric 112-piece guide: https://gageblockcalc.com/calculators/metric-112-gage-block-stack.html');
  lines.push('- Metric 88-piece guide: https://gageblockcalc.com/calculators/metric-88-gage-block-stack.html');
  lines.push('- Wear blocks: https://gageblockcalc.com/calculators/wear-block-stack.html');
  lines.push('- Embed the widget: https://gageblockcalc.com/embed.html');
  lines.push('- FAQ: https://gageblockcalc.com/faq.html');
  lines.push('');
  lines.push('## AskMachinist');
  lines.push('- How to wring gage blocks: https://askmachinist.com/guides/how-to-wring-gage-blocks');
  lines.push('- How to choose a gage block set: https://askmachinist.com/guides/how-to-choose-a-gage-block-set');
  lines.push('- How to build a gage block stack: https://askmachinist.com/guides/how-to-build-a-gage-block-stack');
  lines.push('- Temperature correction: https://askmachinist.com/tools/gage-block-temperature-correction');
  lines.push('- Worked stacks already published: https://askmachinist.com/gage-block-stacks/');
  lines.push('');
  lines.push('## Recipes');
  solvedAll.forEach((s) => {
    const wear = s.recipe.wear ? ', wear blocks' : '';
    lines.push('- ' + s.display + ', ' + s.meta.code + '-piece' + wear + ': https://gageblockcalc.com/calculators/stacks/' + s.recipe.slug + '.html');
  });
  lines.push('');
  return lines.join('\n');
}

function sitemapBlock(solvedAll) {
  const urls = ['https://gageblockcalc.com/calculators/stacks/'].concat(
    solvedAll.map((s) => 'https://gageblockcalc.com/calculators/stacks/' + s.recipe.slug + '.html')
  );
  return urls.map((loc) =>
    '  <url>\n    <loc>' + loc + '</loc>\n    <lastmod>2026-11-11</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>'
  ).join('\n');
}

function landingNav(items, hubs) {
  const links = items.map((s) =>
    '<a href="/calculators/stacks/' + s.recipe.slug + '.html">' + esc(s.display) + (s.recipe.wear ? ' wear' : '') + '</a>'
  );
  (hubs || []).forEach((key) => {
    const hub = SET_HUB[key];
    if (!hub) fail('missing hub ' + key);
    links.push('<a href="' + hub.href + '" rel="noopener">' + esc(hub.label) + '</a>');
  });
  return '<nav class="rel">' + links.join(' ') + '</nav>';
}

function replaceSpan(text, token, inner) {
  const start = '<!-- ' + token + ' -->';
  const end = '<!-- /' + token + ' -->';
  const i = text.indexOf(start);
  const j = text.indexOf(end);
  if (i < 0 || j < i) fail('missing marker ' + token);
  return text.slice(0, i + start.length) + '\n' + inner + '\n' + text.slice(j);
}

function buildAll() {
  if (recipes.length < 25 || recipes.length > 48) fail('recipe count ' + recipes.length + ' is outside 25–48');
  const seenSlug = new Set();
  const seenUse = new Set();
  const seenContext = new Set();
  recipes.forEach((recipe) => {
    if (!recipe.slug || !/^[0-9.]+-(in|mm)-\d+(?:-wear)?$/.test(recipe.slug)) fail('bad slug ' + recipe.slug);
    if (seenSlug.has(recipe.slug)) fail('duplicate slug ' + recipe.slug);
    seenSlug.add(recipe.slug);
    if (!recipe.use || recipe.use.length < 80) fail(recipe.slug + ' shop use is too short');
    if (!recipe.context || recipe.context.length < 80) fail(recipe.slug + ' context is too short');
    if (seenUse.has(recipe.use)) fail('duplicate shop use on ' + recipe.slug);
    if (seenContext.has(recipe.context)) fail('duplicate context on ' + recipe.slug);
    seenUse.add(recipe.use);
    seenContext.add(recipe.context);
    if (sameHub(recipe)) fail(recipe.slug + ' duplicates an AskMachinist size');
    if (!/^[0-9.]+$/.test(recipe.target)) fail(recipe.slug + ' target is not a plain number');
  });

  const solvedAll = recipes.map((recipe) => {
    const solved = solveOne(recipe);
    solved.recipe = recipe;
    return solved;
  });

  const files = new Map();
  const titles = new Set();
  const descs = new Set();
  solvedAll.forEach((solved) => {
    const near = neighbors(solved.recipe, solvedAll);
    if (near.length < 3 || near.length > 4) fail(solved.recipe.slug + ' has ' + near.length + ' related recipes');
    const title = pageTitle(solved);
    const desc = metaDescription(solved);
    if (titles.has(title)) fail('duplicate title ' + title);
    if (descs.has(desc)) fail('duplicate description ' + solved.recipe.slug);
    if (desc.length < 80 || desc.length > 160 || !/[.!?]$/.test(desc)) fail(solved.recipe.slug + ' description length ' + desc.length);
    titles.add(title);
    descs.add(desc);
    const html = pageHtml(solved, near);
    const shops = (html.match(/>Shop this gage block set</g) || []).length;
    if (shops !== 1) fail(solved.recipe.slug + ' affiliate blocks ' + shops);
    if ((html.match(/amazon\.com/g) || []).length !== 1) fail(solved.recipe.slug + ' amazon link count');
    if (!html.includes('rel="' + AFF_REL + '"')) fail(solved.recipe.slug + ' affiliate rel');
    files.set(path.join(STACK_DIR, solved.recipe.slug + '.html'), html);
  });
  files.set(path.join(STACK_DIR, 'index.html'), indexHtml(solvedAll));
  files.set(path.join(ROOT, 'llms.txt'), llmsText(solvedAll));

  let sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const smStart = '<!-- stacks:start -->';
  const smEnd = '<!-- stacks:end -->';
  if (!sitemap.includes(smStart)) fail('sitemap missing stacks markers');
  sitemap = sitemap.slice(0, sitemap.indexOf(smStart) + smStart.length) + '\n' + sitemapBlock(solvedAll) + '\n  ' + sitemap.slice(sitemap.indexOf(smEnd));
  files.set(path.join(ROOT, 'sitemap.xml'), sitemap);

  LANDINGS.forEach((landing) => {
    const items = solvedAll.filter((s) => landing.match(s.recipe))
      .sort((a, b) => Number(a.recipe.target) - Number(b.recipe.target) || (a.recipe.slug < b.recipe.slug ? -1 : 1));
    if (!items.length) fail('no landing links for ' + landing.marker);
    const file = path.join(ROOT, landing.file);
    let text = replaceSpan(fs.readFileSync(file, 'utf8'), 'common-sizes:' + landing.marker, landingNav(items, landing.hubs));
    if (landing.shop) {
      text = replaceSpan(text, 'shop-set:' + landing.marker, shopBlock(landing.shop));
      const shops = (text.match(/>Shop this gage block set</g) || []).length;
      if (shops !== 1) fail(landing.marker + ' affiliate blocks ' + shops);
    }
    files.set(file, text);
  });

  return { files, solvedAll };
}

function writeOrCheck(files) {
  let dirty = 0;
  files.forEach((body, file) => {
    const prev = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    if (prev === body) return;
    dirty += 1;
    if (CHECK) {
      console.error('OUT OF DATE ' + path.relative(ROOT, file));
    } else {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, body);
      console.log('wrote ' + path.relative(ROOT, file));
    }
  });
  if (CHECK && dirty) fail(dirty + ' generated file(s) differ from disk');
  if (CHECK) console.log('stack recipes match the solver (' + recipes.length + ' pages)');
}

function main() {
  const { files, solvedAll } = buildAll();
  if (process.exitCode) return;
  writeOrCheck(files);
  if (!CHECK && !process.exitCode) console.log('built ' + solvedAll.length + ' stack recipes');
}

if (require.main === module) {
  try { main(); }
  catch (err) {
    if (!process.exitCode) process.exitCode = 1;
    if (err && err.message) console.error(err.message);
  }
  process.exit(process.exitCode || 0);
}

module.exports = { buildAll, recipes, HUB };
