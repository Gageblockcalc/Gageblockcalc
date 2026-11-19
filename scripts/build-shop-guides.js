#!/usr/bin/env node
/**
 * Writes the shop how-to and reference calculator pages.
 * Stack lists come from the existing solver. This script does not change it.
 * Run: node scripts/build-shop-guides.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
new Function(fs.readFileSync(path.join(ROOT, 'algorithm.js'), 'utf8'))();
const A = globalThis.GageBlockAlgo;
const SETS = A.buildSets();
const SEASON = fs.readFileSync(path.join(ROOT, 'js/season-boot.js'), 'utf8').trim();

function solve(setId, target, wear) {
  const set = SETS[setId];
  const av = A.applyWearAvailability(A.defaultAvailability(set), set, !!wear);
  const found = A.findStacks(target, set, av, !!wear, null);
  const stack = found.stacks && found.stacks[0];
  if (!stack) throw new Error('no stack ' + setId + ' ' + target);
  const labels = stack.map((size) => A.formatSize(size, set));
  const sum = stack.reduce((total, size) => total + A.toUnits(size, set.unitScale), 0);
  if (sum !== A.toUnits(target, set.unitScale)) throw new Error('sum mismatch ' + setId + ' ' + target);
  return labels;
}

function expectStack(setId, target, wear, labels) {
  const got = solve(setId, target, wear).join(' + ');
  const want = labels.join(' + ');
  if (got !== want) throw new Error(setId + ' ' + target + ' got ' + got + ' want ' + want);
  return want;
}

expectStack('inch-81', 0.8682, false, ['0.650', '0.118', '0.1002']);
expectStack('inch-81', 2.5, false, ['2.000', '0.500']);
expectStack('inch-81', 5, false, ['4.000', '1.000']);
expectStack('inch-81', 1, false, ['1.000']);
expectStack('inch-81', 0.25, false, ['0.250']);
expectStack('inch-81', 0.5, false, ['0.500']);
expectStack('inch-81', 4, false, ['4.000']);
expectStack('inch-81', 2, false, ['2.000']);
expectStack('inch-81', 2, true, ['1.000', '0.900', '0.050', '0.050']);
expectStack('metric-88', 17.365, false, ['10', '5', '1.36', '1.005']);
expectStack('metric-112', 12.7, false, ['11.5', '1.2']);
expectStack('metric-88', 12.7, false, ['10', '1.5', '1.2']);
expectStack('metric-112', 25.4, false, ['24', '1.4']);
expectStack('metric-88', 25.4, false, ['20', '4', '1.4']);

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function roundStep(n, step, decimals) {
  return +((Math.round(n / step) * step).toFixed(decimals));
}

function sineRows(length, unit, setId, step, decimals) {
  return [5, 10, 15, 20, 30, 45].map((angle) => {
    const exact = length * Math.sin((angle * Math.PI) / 180);
    const rounded = roundStep(exact, step, decimals);
    const blocks = solve(setId, rounded, false);
    const roundStr = rounded.toFixed(decimals);
    return {
      angle,
      exactStr: exact.toFixed(unit === 'in' ? 8 : 6),
      roundStr,
      blocks: blocks.join(' + '),
      href: '/?target=' + roundStr + '&amp;set=' + setId + '&amp;wear=0',
      length,
      unit,
      setId
    };
  });
}

const ROWS_5 = sineRows(5, 'in', 'inch-81', 0.0001, 4);
const ROWS_10 = sineRows(10, 'in', 'inch-81', 0.0001, 4);
const ROWS_100 = sineRows(100, 'mm', 'metric-88', 0.001, 3);

function row(rows, angle) {
  const found = rows.find((item) => item.angle === angle);
  if (!found) throw new Error('missing angle ' + angle);
  return found;
}

const R5_10 = row(ROWS_5, 10);
const R5_30 = row(ROWS_5, 30);
const R10_30 = row(ROWS_10, 30);
const R100_10 = row(ROWS_100, 10);
const R100_15 = row(ROWS_100, 15);
if (R5_10.blocks !== '0.650 + 0.118 + 0.1002') throw new Error('5 in 10° stack changed');
if (R100_10.blocks !== '10 + 5 + 1.36 + 1.005') throw new Error('100 mm 10° stack changed');
if (R10_30.roundStr !== '5.0000') throw new Error('10 in 30° rounding changed');

const STYLE = [
  'html{box-sizing:border-box}*,*:before,*:after{box-sizing:inherit}',
  'body{font-family:system-ui,sans-serif;max-width:46rem;margin:0 auto;padding:1.5rem;background:#f8fafc;color:#0f172a;line-height:1.6;overflow-wrap:anywhere}',
  'a{color:#0a58ca}h1{font-size:1.6rem;line-height:1.25}h2{margin-top:2rem;font-size:1.2rem;color:#0f172a}',
  '.card{background:#fff;border:1px solid #e2e8f0;border-radius:.6rem;padding:1rem 1.2rem;margin:1rem 0}',
  '.f{font-family:ui-monospace,monospace;background:#f1f5f9;padding:.6rem .8rem;border-radius:.4rem;display:block;overflow-x:auto;max-width:100%}',
  '.cta{display:inline-flex;align-items:center;box-sizing:border-box;min-height:44px;background:#0a58ca;color:#fff;font-weight:700;padding:.6rem 1rem;border-radius:.45rem;text-decoration:none;margin:.25rem .5rem .25rem 0}',
  '.table-wrap{overflow-x:auto;max-width:100%;margin:.5rem 0 1rem}',
  'table{border-collapse:collapse;width:100%;background:#fff}td,th{border-bottom:1px solid #e2e8f0;padding:.4rem .45rem;text-align:left;vertical-align:top}',
  'details{margin:.6rem 0;padding:.7rem 1rem;background:#fff;border:1px solid #e2e8f0;border-radius:.5rem}',
  'summary{font-weight:600;cursor:pointer;min-height:44px;display:flex;align-items:center}',
  'nav.rel a{display:inline-flex;align-items:center;box-sizing:border-box;min-height:44px;margin-right:.35rem;max-width:100%}',
  'main p a:not(.cta){display:inline-flex;align-items:center;box-sizing:border-box;min-height:44px;max-width:100%}',
  'header.gbc-brand{display:flex;align-items:center;gap:.6rem;flex-wrap:wrap;row-gap:.4rem;padding:.25rem 0 1rem;margin-bottom:1rem;border-bottom:1px solid #e2e8f0}',
  'header.gbc-brand>a{min-height:44px;display:inline-flex;align-items:center;gap:.6rem;text-decoration:none;color:inherit;font-weight:700;font-size:1.15rem}',
  'footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #e2e8f0;font-size:.9rem;color:#334155}',
  'footer a{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:44px;min-width:44px;max-width:100%;padding:.15rem .45rem}',
  '.legal-nav{font-weight:700}.seasonal-xlink,.nick-also{margin:.75rem 0 0}.calc-version{margin-top:.4rem;font-size:12px;color:#595959}',
  'label.lbl{font-weight:600;font-size:.92rem;display:block;margin:.7rem 0 .25rem}',
  'input,select{width:100%;max-width:100%;font:inherit;padding:.45rem .55rem;border:1px solid #cbd5e1;border-radius:.4rem;background:#fff;color:#0f172a;min-height:44px}',
  '.fields{display:grid;grid-template-columns:repeat(auto-fit,minmax(8.5rem,1fr));gap:.65rem}',
  '.note{font-size:.92rem;color:#334155}.big{font-size:1.35rem;font-weight:700;margin:.2rem 0}',
  'ol.steps{padding-left:1.2rem}ol.steps li{margin:.35rem 0}',
  '@media(max-width:420px){body{padding:1rem}h1{font-size:1.35rem}}',
  '@media print{.no-print,header,footer{display:none !important}body{background:#fff;max-width:none;color:#000}a{color:#000;text-decoration:none}}'
].join('');

const HEADER =
  '<header class="gbc-brand"><a href="/"><img src="/icons/favicon.svg?v=2026-10-27" width="32" height="32" alt="GageBlockCalc logo">GageBlockCalc</a><span style="opacity:.7;font-size:.9rem">Free gage block stack calculator</span></header>\n' +
  '<script>' + SEASON + '</script>\n';

const FOOTER =
  '<footer><a href="/">Calculator</a> · <a href="/calculators/">All calculators</a> · <a href="/calculators/stacks/">Common sizes</a> · <a href="/calculators/sine-bar-gage-block-stack.html">Sine bar</a> · <a href="/llms.txt">llms.txt</a> · <a href="/faq.html">FAQ</a><br>Free, no login. Always verify critical stacks against your set\'s calibration certificate.' +
  '<p class="legal-nav"><a href="/about.html">About</a> · <a href="/contact.html">Contact</a> · <a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a></p>' +
  '<p class="seasonal-xlink no-print"><span aria-hidden="true">🎄</span> <a href="https://askmachinist.com/guides/machinist-christmas-gift-guide" rel="noopener">Machinist Christmas gift guide</a> · <a data-gbc-games="1" href="https://oppsgo.com/thanksgiving-games" target="_blank" rel="noopener">Free Thanksgiving Games</a></p>' +
  '<p class="nick-also no-print">More from Nick: <a href="https://oppsgo.com">OppsGo</a> free browser games · <a href="/arcade/">Break Room</a></p>' +
  '<p class="gbc-legal">© 2026 GageBlockCalc</p>' +
  '<div class="calc-version no-print"><span id="calcVersion" class="notranslate" translate="no"></span></div></footer>\n' +
  '<script src="/seasonal.js" defer></script>\n' +
  '<script src="/version.js" defer></script>\n';

function crumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.item
    }))
  };
}

function homeCrumb() {
  return { name: 'GageBlockCalc', item: 'https://gageblockcalc.com/' };
}

function calcCrumb() {
  return { name: 'Calculators', item: 'https://gageblockcalc.com/calculators/' };
}

function faqLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a }
    }))
  };
}

function howToLd(name, steps) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: name,
    step: steps.map((step) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text
    }))
  };
}

function faqHtml(faqs) {
  return (
    '<h2>FAQ</h2>\n' +
    faqs
      .map((item) => '<details><summary>' + esc(item.q) + '</summary><p>' + esc(item.a) + '</p></details>')
      .join('\n')
  );
}

function rel(links) {
  return (
    '<nav class="rel">' +
    links
      .map((link) => {
        const attrs = link.ext ? ' rel="noopener"' : '';
        return '<a href="' + link.href + '"' + attrs + '>' + esc(link.text) + '</a>';
      })
      .join(' ') +
    '</nav>'
  );
}

function shell(page) {
  const ld = JSON.stringify(page.ld);
  if (ld.includes('</')) throw new Error('JSON-LD would close the script tag: ' + page.path);
  return (
    '<!doctype html>\n<html lang="en"><head><meta charset="utf-8">\n' +
    '<title>' + esc(page.title) + '</title>\n' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">\n' +
    '<meta name="description" content="' + esc(page.description) + '">\n' +
    '<link rel="canonical" href="' + esc(page.canonical) + '">\n' +
    '<meta property="og:type" content="article"><meta property="og:title" content="' + esc(page.ogTitle) + '"><meta property="og:description" content="' + esc(page.description) + '">\n' +
    '<meta property="og:url" content="' + esc(page.canonical) + '"><meta property="og:image" content="https://gageblockcalc.com/icons/og-image.png?v=2026-10-27">\n' +
    '<meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#0f172a">\n' +
    '<link rel="icon" href="/icons/favicon.svg" type="image/svg+xml">\n' +
    '<script type="application/ld+json">' + ld + '</script>\n' +
    '<style>' + STYLE + '</style>\n</head><body>\n' +
    HEADER +
    '<main>\n<h1>' + esc(page.h1) + '</h1>\n' +
    page.body +
    '\n</main>\n' +
    FOOTER +
    '</body></html>\n'
  );
}

function writePage(page) {
  const file = path.join(ROOT, page.path);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, shell(page));
  console.log('wrote', page.path);
}

function stepsHtml(steps) {
  return (
    '<ol class="steps">' +
    steps.map((step) => '<li><b>' + esc(step.name) + '.</b> ' + step.html + '</li>').join('') +
    '</ol>'
  );
}

const AM = {
  wring: { href: 'https://askmachinist.com/guides/how-to-wring-gage-blocks', text: 'How to wring gage blocks', ext: true },
  choose: { href: 'https://askmachinist.com/guides/how-to-choose-a-gage-block-set', text: 'How to choose a gage block set', ext: true },
  build: { href: 'https://askmachinist.com/guides/how-to-build-a-gage-block-stack', text: 'How to build a gage block stack', ext: true },
  temp: { href: 'https://askmachinist.com/tools/gage-block-temperature-correction', text: 'Temperature correction on Ask a Machinist', ext: true },
  metric: { href: 'https://askmachinist.com/guides/metric-gage-block-stacks', text: 'Metric gage block stacks', ext: true },
  carbide: { href: 'https://askmachinist.com/guides/carbide-vs-steel-gage-blocks', text: 'Carbide vs steel gage blocks', ext: true },
  interval: { href: 'https://askmachinist.com/guides/gage-block-calibration-interval', text: 'Calibration interval', ext: true },
  accessories: { href: 'https://askmachinist.com/guides/gage-block-accessories', text: 'Gage block accessories', ext: true },
  mic: { href: 'https://askmachinist.com/guides/how-to-check-a-micrometer-with-gage-blocks', text: 'Check a micrometer with gage blocks', ext: true },
  cal: { href: 'https://askmachinist.com/guides/how-to-check-calipers-with-gage-blocks', text: 'Check calipers on Ask a Machinist', ext: true },
  height: { href: 'https://askmachinist.com/guides/how-to-check-a-height-gage-with-gage-blocks', text: 'Check a height gage on Ask a Machinist', ext: true },
  square: { href: 'https://askmachinist.com/guides/how-to-check-squareness', text: 'How to check squareness', ext: true },
  sineTool: { href: 'https://askmachinist.com/tools/sine-bar-calculator', text: 'Sine bar calculator on Ask a Machinist', ext: true },
  sineGuide: { href: 'https://askmachinist.com/guides/how-to-use-a-sine-bar-with-gage-blocks', text: 'Use a sine bar with gage blocks', ext: true },
  wear: { href: 'https://askmachinist.com/guides/gage-block-care-wear-blocks', text: 'Wear blocks on Ask a Machinist', ext: true },
  sister: { href: 'https://askmachinist.com/', text: 'Ask a Machinist', ext: true }
};

function local(href, text) {
  return { href, text, ext: false };
}

writePage({
  path: 'about.html',
  title: 'About GageBlockCalc | Free gage block calculator',
  ogTitle: 'About GageBlockCalc',
  h1: 'About GageBlockCalc',
  description: 'GageBlockCalc is a free gage block stack calculator for machinists and inspectors. No login. It runs in the browser, including offline after you open it.',
  canonical: 'https://gageblockcalc.com/about.html',
  ld: [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: 'About GageBlockCalc',
      url: 'https://gageblockcalc.com/about.html',
      description: 'Free gage block stack calculator. No login. Browser app with offline use after the calculator has been opened.'
    },
    faqLd([
      { q: 'Does GageBlockCalc cost money or require a login?', a: 'No. The stack calculator is free. There is no account and no login.' },
      { q: 'Does the calculator work offline?', a: 'The calculator runs in the browser. After you open it, the app files are cached so you can build a stack when the network is down. A guide page you have never opened still needs a network the first time.' }
    ]),
    crumbs([homeCrumb(), { name: 'About', item: 'https://gageblockcalc.com/about.html' }])
  ],
  body: `
<p>GageBlockCalc builds a gage block stack for a length you type in. It picks blocks from a real set, uses the fewest blocks that add up to that length, and shows the list largest first.</p>
<p>The sets are the common shop sets: inch 81-piece, 36-piece, and 28-piece, and metric 112-piece and 88-piece. Wear blocks can be included on the outside of a stack. A <a href="/calculators/sine-bar-gage-block-stack.html">sine bar page</a> turns an angle into a stack height and opens the same solver.</p>
<h2>Who it is for</h2>
<p>It is for machinists, toolmakers, inspectors, and students who need a stack at the bench. You do not need an account. You do not need to install a store app. Open the <a href="/">calculator</a>, pick the set that matches the box in front of you, and type the target in that set's unit.</p>
<h2>Free, with no login</h2>
<p>The calculator stays free. There is no paywall on a stack and no login. Some pages link to Amazon. As an Amazon Associate I earn from qualifying purchases. Those links are optional. The calculator works the same if you never click one.</p>
<p>The terms are on the <a href="/terms.html">terms page</a>. Privacy for this site and for Ask a Machinist is on the <a href="/privacy.html">privacy page</a>.</p>
<h2>It runs in the browser</h2>
<p>The stack math runs on your device. After you open the calculator, the browser keeps a copy of the app files, so a stack still builds when the network drops. You can also install the site from the browser's install prompt and open it like an app. A how-to page you have not opened yet is not in that first cache. Open it once on the network and the browser can keep that copy too.</p>
<h2>Ask a Machinist</h2>
<p>Ask a Machinist (<a href="https://askmachinist.com/" rel="noopener">askmachinist.com</a>) is the sister site. It has longer shop guides, including wringing, choosing a set, and checking tools. GageBlockCalc is the calculator those jobs send you back to, plus the short pages on this site that show a formula, a worked stack, and a link that opens the solver with the size filled in.</p>
<p>Corrections and questions go to the <a href="/contact.html">contact page</a>.</p>
<h2>Related</h2>
${rel([
  local('/calculators/', 'All calculators'),
  local('/faq.html', 'FAQ'),
  local('/contact.html', 'Contact'),
  AM.sister,
  AM.choose
])}
${faqHtml([
  { q: 'Does GageBlockCalc cost money or require a login?', a: 'No. The stack calculator is free. There is no account and no login.' },
  { q: 'Does the calculator work offline?', a: 'The calculator runs in the browser. After you open it, the app files are cached so you can build a stack when the network is down. A guide page you have never opened still needs a network the first time.' }
])}`
});

writePage({
  path: 'contact.html',
  title: 'Contact GageBlockCalc',
  ogTitle: 'Contact GageBlockCalc',
  h1: 'Contact',
  description: 'Contact GageBlockCalc by email at support@gageblockcalc.com, or use Feedback and Chat on the calculator. No contact form.',
  canonical: 'https://gageblockcalc.com/contact.html',
  ld: [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact GageBlockCalc',
      url: 'https://gageblockcalc.com/contact.html',
      mainEntity: {
        '@type': 'Organization',
        name: 'GageBlockCalc',
        url: 'https://gageblockcalc.com/',
        email: 'support@gageblockcalc.com'
      }
    },
    faqLd([
      { q: 'What email reaches GageBlockCalc?', a: 'support@gageblockcalc.com. That is the address on the terms page and in the calculator footer.' },
      { q: 'Is there a contact form?', a: 'No. Email support@gageblockcalc.com, or use Feedback and Chat on the calculator page.' }
    ]),
    crumbs([homeCrumb(), { name: 'Contact', item: 'https://gageblockcalc.com/contact.html' }])
  ],
  body: `
<p>Use one of the channels already on this site. This page does not add a form, and it does not ask you to create an account.</p>
<div class="card">
<p><b>Email.</b> <a href="mailto:support@gageblockcalc.com">support@gageblockcalc.com</a></p>
<p>Write if a stack page has the wrong blocks, a link is broken, or a how-to states a fact that does not match the standard. Name the page URL and the set you used.</p>
<p><b>Feedback and chat on the calculator.</b> The <a href="/#feedback">calculator feedback control</a> and the <a href="/#chat">calculator chat control</a> are the same Feedback and Chat links in the calculator footer.</p>
</div>
<p>The <a href="/about.html">about page</a> says what the calculator is. The <a href="/terms.html">terms</a> and <a href="/privacy.html">privacy</a> pages are the legal notes. Privacy for gageblockcalc.com is the same policy as Ask a Machinist.</p>
<h2>Related</h2>
${rel([local('/about.html', 'About'), local('/', 'Open the calculator'), local('/faq.html', 'FAQ'), AM.sister])}
${faqHtml([
  { q: 'What email reaches GageBlockCalc?', a: 'support@gageblockcalc.com. That is the address on the terms page and in the calculator footer.' },
  { q: 'Is there a contact form?', a: 'No. Email support@gageblockcalc.com, or use Feedback and Chat on the calculator page.' }
])}`
});

const wringSteps = [
  { name: 'Clean the measuring faces', text: 'Wipe both faces with a clean, lint-free cloth. A light solvent such as mineral spirits is a common shop wipe. Let the faces dry. Grit left on a face will not wring, and it can scratch the block.', html: 'Wipe both faces with a clean, lint-free cloth. A light solvent such as mineral spirits is a common shop wipe. Let the faces dry. Grit left on a face will not wring, and it can scratch the block.' },
  { name: 'Stone only a raised burr', text: 'If a fingernail catches a nick, a clean gage block stone can knock that burr down. A few light passes are enough. Stoning is not a way to clean a face or to change the size.', html: 'If a fingernail catches a nick, a clean gage block stone can knock that burr down. A few light passes are enough. Stoning is not a way to clean a face or to change the size.' },
  { name: 'Leave only a trace of oil', text: 'A dry, freshly solvent-wiped face often will not wring. The usual film is the oil from clean skin, or a drop of very light oil wiped almost all the way off. A wet face wrings on the oil, and that joint is not the block length.', html: 'A dry, freshly solvent-wiped face often will not wring. The usual film is the oil from clean skin, or a drop of very light oil wiped almost all the way off. A wet face wrings on the oil, and that joint is not the block length.' },
  { name: 'Cross, slide, and twist', text: 'Set one face across the other, slide them under light pressure, and twist until the faces are in line. A good wring holds the lower block and the joint line nearly disappears. Do not hit the blocks together.', html: 'Set one face across the other, slide them under light pressure, and twist until the faces are in line. A good wring holds the lower block and the joint line nearly disappears. Do not hit the blocks together.' },
  { name: 'Separate by sliding', text: 'Slide the blocks apart. Prying with a tool chips an edge. Do not leave a stack wrung for days. A long wring can be hard to separate, and steel faces can corrode in the joint.', html: 'Slide the blocks apart. Prying with a tool chips an edge. Do not leave a stack wrung for days. A long wring can be hard to separate, and steel faces can corrode in the joint.' }
];
const wringFaq = [
  { q: 'Why will clean blocks not wring?', a: 'A face that was just washed dry, or a face with a burr or a speck of grit, will not wring. Wipe again, stone only a raised nick, and leave a trace of oil, not a wet film.' },
  { q: 'Does the length of a block include a wring?', a: 'Yes. The standardized length of a gage block includes the effect of one wring. A stack of nominal sizes is the shop length. When the last tenth matters, use the deviations on the calibration certificate instead of the nominal sizes alone.' },
  { q: 'Should wear blocks be wrung on the outside?', a: 'Yes, when the stack will touch a part, an anvil, or a surface plate. The two wear blocks go on the ends so the contact wears them, not the set. The calculator can include them when the link has wear=1.' }
];

writePage({
  path: 'guides/how-to-wring-gage-blocks.html',
  title: 'How to Wring Gage Blocks | GageBlockCalc',
  ogTitle: 'How to Wring Gage Blocks',
  h1: 'How to Wring Gage Blocks',
  description: 'Wring gage blocks so the joint disappears: clean faces, a trace of oil, a sliding twist, and a worked 0.8682 in stack from the 81-piece set.',
  canonical: 'https://gageblockcalc.com/guides/how-to-wring-gage-blocks.html',
  ld: [
    howToLd('How to wring gage blocks', wringSteps),
    faqLd(wringFaq),
    crumbs([homeCrumb(), calcCrumb(), { name: 'How to wring gage blocks', item: 'https://gageblockcalc.com/guides/how-to-wring-gage-blocks.html' }])
  ],
  body: `
<p>Wringing is how two gage blocks become one length. The faces are flat and smooth enough that a trace of oil and a sliding twist make them hold. The joint should nearly disappear. If you can see a thick line, the blocks are not wrung. They are sitting on oil or dirt.</p>
<h2>Steps</h2>
${stepsHtml(wringSteps)}
<h2>Worked example</h2>
<p>A 5 inch sine bar at 10° needs a stack of 0.8682 in on an 81-piece set. The solver, with wear blocks off, builds that size as <b>0.650 + 0.118 + 0.1002</b>. Those three blocks sum to 0.8682 in.</p>
<ol class="steps">
<li>Clean all six measuring faces. There are two faces on each of the three blocks.</li>
<li>Wring 0.650 to 0.118. The calculator lists the thickest block first, and that is a good wring order.</li>
<li>Wring 0.1002 onto the free face of 0.118.</li>
<li>The stack should hold together when you lift the 0.650 block. If 0.1002 falls off, wipe that face and wring it again.</li>
</ol>
<p><a class="cta" href="/?target=0.8682&amp;set=inch-81&amp;wear=0">Open 0.8682 in on the 81-piece set</a> <a class="cta" href="/calculators/stacks/0.8682-in-81.html">Read the 0.8682 in recipe</a></p>
<p>Hands warm a block. For a length that has to agree with a certificate, let the stack sit at the reference temperature, 20 °C (68 °F), before you trust the last digit. The <a href="/calculators/gage-block-temperature-correction.html">temperature correction</a> shows how much a steel stack grows per degree.</p>
<h2>On this site</h2>
${rel([
  local('/guides/gage-block-care-and-storage.html', 'Care and storage'),
  local('/calculators/wear-block-stack.html', 'Wear blocks'),
  local('/guides/ceramic-vs-steel-vs-carbide-gage-blocks.html', 'Ceramic, steel, and carbide')
])}
<h2>On Ask a Machinist</h2>
${rel([AM.wring, AM.build, AM.accessories])}
${faqHtml(wringFaq)}`
});

const gradeFaq = [
  { q: 'Which ASME grade is the tightest?', a: 'ASME B89.1.9 names grades 00, 0, AS-1, and AS-2. Grade 00 is the tightest of those four. AS-2 is the widest. The tolerance also depends on the nominal length, so a long grade 00 block is not held to the same inch limit as a 1 inch grade 00 block.' },
  { q: 'Is grade B an ASME gage block grade?', a: 'No. ASME B89.1.9 does not use grade B. Grade B is a name from the older Federal Specification GGG-G-15A, which listed AAA, AA, A+, A, and B. It is also not the same thing as ASME B89.3.7 grade B, which is a surface-plate grade.' },
  { q: 'Does the calculator apply the grade tolerance?', a: 'No. The calculator adds nominal block sizes. The grade is the tolerance band those blocks were made to. The calibration certificate is the measured deviation of each block you actually have.' }
];

writePage({
  path: 'guides/gage-block-grades.html',
  title: 'Gage Block Grades 00, 0, AS-1, AS-2, and B | GageBlockCalc',
  ogTitle: 'Gage Block Grades 00, 0, AS-1, AS-2, and B',
  h1: 'Gage Block Grades: 00, 0, AS-1, AS-2, and B',
  description: 'What ASME B89.1.9 grades 00, 0, AS-1, and AS-2 mean, how the older grade B differs, and the length tolerance charts list through 1 inch.',
  canonical: 'https://gageblockcalc.com/guides/gage-block-grades.html',
  ld: [
    howToLd('How to read a gage block grade', [
      { name: 'Read the grade name on the certificate', text: 'ASME B89.1.9 grades are 00, 0, AS-1, and AS-2. ISO 3650 metric grades are K, 0, 1, and 2. Grade B is an older federal name, not an ASME B89.1.9 grade.' },
      { name: 'Match the grade to the job', text: 'Grade 00 is the laboratory end of the ASME list. Grade 0 and AS-1 are the usual inspection grades. AS-2 is the usual working grade for setups. A workshop grade is the wrong master for checking other gages.' },
      { name: 'Use the certificate for the blocks you have', text: 'The calculator adds nominal sizes. A grade is the allowed departure from nominal. The measured departure is on the calibration certificate, and it is what you add when the nominal stack is not enough.' }
    ]),
    faqLd(gradeFaq),
    crumbs([homeCrumb(), calcCrumb(), { name: 'Gage block grades', item: 'https://gageblockcalc.com/guides/gage-block-grades.html' }])
  ],
  body: `
<p>A grade is the tolerance the blocks were made and certified to. It is not a different stack. A grade 00 one-inch block and an AS-2 one-inch block are both nominally 1 inch. The grade says how far the true length is allowed to sit from that nominal size, and how much the length is allowed to vary across the face.</p>
<h2>The names in use</h2>
<p><b>ASME B89.1.9</b> is the US gage block standard. It names four grades: <b>00</b>, <b>0</b>, <b>AS-1</b>, and <b>AS-2</b>. Grade 00 is the tightest. AS-2 is the widest. The length limit gets wider as the block gets longer, so you read the row for that nominal length. The B89.1.9 length tolerance applies across the measuring face, not only at the center reference point. That is a real difference from older specs that toleranced the center and then added a separate variation.</p>
<p><b>Grade B</b> is not one of those four names. Federal Specification GGG-G-15A listed AAA, AA, A+, A, and B. The later federal spec GGG-G-15C replaced that list with grades 0.5, 1, 2, and 3. Shops that still say "B blocks" are using the older commercial name for a working set. Do not confuse it with ASME B89.3.7 grade B, which is a grade of granite surface plate.</p>
<p><b>ISO 3650</b> is the metric gage block standard. Its grades are K, 0, 1, and 2. Grade K is the calibration grade. The 1998 edition of ISO 3650 withdrew grade 00. An ISO grade 0 is not a synonym for ASME grade 0, and ISO grade 2 is not a synonym for AS-2. Use the grade system printed on the certificate.</p>
<h2>Length tolerance through 1 inch</h2>
<p>Public comparison charts of ASME B89.1.9 agree on the length tolerance, in millionths of an inch, for the short rows below. One millionth of an inch is 0.000001 in. Variation in length and flatness are separate limits in the standard and are not in this table. Longer blocks have wider length limits. The certificate that came with the set is the row that applies to those blocks.</p>
<div class="table-wrap"><table>
<thead><tr><th>Nominal length</th><th>Grade 00</th><th>Grade 0</th><th>Grade AS-1</th><th>Grade AS-2</th></tr></thead>
<tbody>
<tr><td>Through 0.050 in</td><td>±4</td><td>±6</td><td>±12</td><td>±24</td></tr>
<tr><td>Through 0.400 in</td><td>±3</td><td>±5</td><td>±8</td><td>±18</td></tr>
<tr><td>Through 1.000 in</td><td>±3</td><td>±6</td><td>±12</td><td>±24</td></tr>
</tbody></table></div>
<p class="note">Values are millionths of an inch (±0.000001 in), from comparison charts of ASME B89.1.9. A block through 1 inch in grade 00 is listed at ±0.000003 in. The same size in AS-2 is listed at ±0.000024 in.</p>
<h2>What to buy for the job</h2>
<p>A stack that lives in a setup, and that you wring and take apart all day, is usually AS-2. Inspection and a check of other gages usually want grade 0 or AS-1, with a certificate. Grade 00 belongs where it is the master for other blocks, not in a machine vise. A workshop grade, including an old grade B set, is the wrong master for checking a micrometer if the job calls for an inspection grade.</p>
<h2>Worked example</h2>
<p>The 1.000 in block in an 81-piece set is one block. The calculator does not care which grade it is. Open <a href="/?target=1.000&amp;set=inch-81&amp;wear=0">1.000 in on the 81-piece set</a> and the result is the 1.000 block. If the certificate says that block is 1.000004 in, the measured length is the certificate value. The nominal stack is still 1.000 in, and the grade only tells you whether a departure of 0.000004 in was allowed.</p>
<p>On the "through 1 inch" row, ±0.000004 in is inside the grade 0 chart limit of ±0.000006 in and outside the grade 00 chart limit of ±0.000003 in. That comparison is the chart, not a calibration. The lab's reported deviation and its uncertainty are the numbers you use on a job.</p>
<h2>On this site</h2>
${rel([
  local('/calculators/inch-gage-block-stack.html', 'Inch 81-piece calculator'),
  local('/guides/gage-block-care-and-storage.html', 'Care and storage'),
  local('/guides/ceramic-vs-steel-vs-carbide-gage-blocks.html', 'Ceramic, steel, and carbide')
])}
<h2>On Ask a Machinist</h2>
${rel([AM.choose, AM.interval, AM.build])}
${faqHtml(gradeFaq)}`
});

const caliperSteps = [
  { name: 'Clean the jaws and the block', text: 'Wipe the jaw faces and the gage block. A chip on a jaw reads as part of the length.', html: 'Wipe the jaw faces and the gage block. A chip on a jaw reads as part of the length.' },
  { name: 'Check zero with the jaws closed', text: 'Close the jaws the way you will close them on a part. If zero is off, every later reading includes that error. Set zero only if the tool is meant to be zeroed, and then check a block anyway.', html: 'Close the jaws the way you will close them on a part. If zero is off, every later reading includes that error. Set zero only if the tool is meant to be zeroed, and then check a block anyway.' },
  { name: 'Measure a known block in the flat of the jaws', text: 'Use the flat measuring faces, not the knife edge at the tip, unless you are checking a groove. Approach the size the same way each time and write the reading down.', html: 'Use the flat measuring faces, not the knife edge at the tip, unless you are checking a groove. Approach the size the same way each time and write the reading down.' },
  { name: 'Repeat near the tip and deeper in the jaws', text: 'A reading that changes as you move the block along the jaws means the jaws are not parallel. That is the caliper, not the block.', html: 'A reading that changes as you move the block along the jaws means the jaws are not parallel. That is the caliper, not the block.' },
  { name: 'Check a second length', text: 'One size can hide a scale error. Check a short block and a longer one. Compare the difference to the accuracy the maker states for that caliper. The last digit on the display is the resolution, which is a smaller claim than the accuracy.', html: 'One size can hide a scale error. Check a short block and a longer one. Compare the difference to the accuracy the maker states for that caliper. The last digit on the display is the resolution, which is a smaller claim than the accuracy.' }
];
const caliperFaq = [
  { q: 'Is a caliper as accurate as a gage block?', a: 'No. A gage block is the length standard in this check. The caliper is the tool being checked. A difference inside the caliper accuracy the maker printed is what that tool is specified to do. A difference larger than that, or a difference that changes along the jaws, is a reason to stop using it for that job.' },
  { q: 'Does a good zero mean the caliper is fine?', a: 'No. Zero only shows that the jaws meet. A worn jaw or a scale error shows up at a real length. Check at least two sizes.' },
  { q: 'Which blocks should I use?', a: 'On an 81-piece inch set, 0.250 in, 1.000 in, and 4.000 in are each a single block. Use sizes that fall inside the caliper range you actually use.' }
];

writePage({
  path: 'guides/check-calipers-with-gage-blocks.html',
  title: 'How to Check Calipers with Gage Blocks | GageBlockCalc',
  ogTitle: 'How to Check Calipers with Gage Blocks',
  h1: 'How to Check Calipers with Gage Blocks',
  description: 'Check a caliper against gage blocks at more than one size, and along the jaws. Worked checks at 0.250 in, 1.000 in, and 4.000 in on an 81-piece set.',
  canonical: 'https://gageblockcalc.com/guides/check-calipers-with-gage-blocks.html',
  ld: [
    howToLd('How to check calipers with gage blocks', caliperSteps),
    faqLd(caliperFaq),
    crumbs([homeCrumb(), calcCrumb(), { name: 'Check calipers with gage blocks', item: 'https://gageblockcalc.com/guides/check-calipers-with-gage-blocks.html' }])
  ],
  body: `
<p>A caliper check compares the caliper reading to a length you already know. The gage block is that length. This is a shop check. It is not a calibration with an uncertainty budget. If the job needs a calibration, send the caliper to a lab.</p>
<h2>Steps</h2>
${stepsHtml(caliperSteps)}
<h2>Worked example</h2>
<p>On an 81-piece inch set these three lengths are each one block, so you are not stacking error on top of the caliper:</p>
<div class="table-wrap"><table>
<thead><tr><th>Length</th><th>81-piece stack</th><th>Open</th></tr></thead>
<tbody>
<tr><td>0.250 in</td><td>0.250</td><td><a href="/?target=0.250&amp;set=inch-81&amp;wear=0">Open 0.250 in</a></td></tr>
<tr><td>1.000 in</td><td>1.000</td><td><a href="/?target=1.000&amp;set=inch-81&amp;wear=0">Open 1.000 in</a></td></tr>
<tr><td>4.000 in</td><td>4.000</td><td><a href="/?target=4.000&amp;set=inch-81&amp;wear=0">Open 4.000 in</a></td></tr>
</tbody></table></div>
<p>Close the jaws and note zero. Measure the 0.250 block near the tip of the jaws and again closer to the beam. Then do the same with the 1.000 block. If both spots and both sizes agree with the blocks, within the accuracy printed for that caliper, the tool is behaving at those two lengths. The 4.000 block is the check for a longer-range caliper. A 0 to 1 inch tool never sees that block.</p>
<p>Write the readings down. "It looked close" is not a check you can repeat next month. Wear blocks are optional here. A single block has no wring in the length you are using, which keeps the check simpler. If you do stack, wring first. The <a href="/guides/how-to-wring-gage-blocks.html">wringing steps</a> are the difference between a stack and three loose blocks.</p>
<h2>On this site</h2>
${rel([
  local('/guides/verify-height-gage-with-gage-blocks.html', 'Verify a height gage'),
  local('/guides/gage-block-grades.html', 'Gage block grades'),
  local('/calculators/inch-gage-block-stack.html', 'Inch 81-piece calculator')
])}
<h2>On Ask a Machinist</h2>
${rel([AM.cal, AM.mic, AM.wring])}
${faqHtml(caliperFaq)}`
});

const heightSteps = [
  { name: 'Clean the plate, the base, and the block', text: 'The surface plate is the zero of a height measurement. Dirt under the gage base or under the block adds to the height.', html: 'The surface plate is the zero of a height measurement. Dirt under the gage base or under the block adds to the height.' },
  { name: 'Use one known height, then a second', text: 'A single block is the cleanest setting master. A second height shows a column error that one setting hides.', html: 'A single block is the cleanest setting master. A second height shows a column error that one setting hides.' },
  { name: 'Put wear blocks on the outside when the stack is rubbed', text: 'If the stack sits on the plate and the contact rubs the top, wring a wear block on each end. The calculator target then includes those two blocks.', html: 'If the stack sits on the plate and the contact rubs the top, wring a wear block on each end. The calculator target then includes those two blocks.' },
  { name: 'Touch the stack the way you will touch the part', text: 'Use the same contact, from the same direction. Zero there, or record the reading. Then move to the part without changing the setup more than the measurement needs.', html: 'Use the same contact, from the same direction. Zero there, or record the reading. Then move to the part without changing the setup more than the measurement needs.' },
  { name: 'Treat squareness as its own check', text: 'A height that matches a block at one spot does not prove the column is square to the plate. Check squareness separately if the part is tall.', html: 'A height that matches a block at one spot does not prove the column is square to the plate. Check squareness separately if the part is tall.' }
];
const heightFaq = [
  { q: 'What does wear=1 do to a 2 inch target?', a: 'The target is the finished stack, and the two 0.050 inch wear blocks are part of that 2.000 inch total. On the 81-piece set the solver builds 1.000 + 0.900 + 0.050 + 0.050. Wear off, the same 2.000 inch target is the single 2.000 block.' },
  { q: 'Can I set a height gage on one block and trust the whole column?', a: 'One block proves the reading at that height. Check a second height inside the range you use. Squareness of the column to the plate is a separate check.' },
  { q: 'Does the block need to be the same grade as the part tolerance?', a: 'The block has to be tighter than the decision you are making. An AS-2 working block is a poor master for a tolerance that is only a few ten-thousandths. The certificate, not the nominal size alone, is the length you set to when the tolerance is tight.' }
];

writePage({
  path: 'guides/verify-height-gage-with-gage-blocks.html',
  title: 'How to Verify a Height Gage with Gage Blocks | GageBlockCalc',
  ogTitle: 'How to Verify a Height Gage with Gage Blocks',
  h1: 'How to Verify a Height Gage with Gage Blocks',
  description: 'Set and check a height gage from a surface plate with gage blocks. Worked 2.000 in stack with wear blocks off and on, using the 81-piece set.',
  canonical: 'https://gageblockcalc.com/guides/verify-height-gage-with-gage-blocks.html',
  ld: [
    howToLd('How to verify a height gage with gage blocks', heightSteps),
    faqLd(heightFaq),
    crumbs([homeCrumb(), calcCrumb(), { name: 'Verify a height gage with gage blocks', item: 'https://gageblockcalc.com/guides/verify-height-gage-with-gage-blocks.html' }])
  ],
  body: `
<p>A height gage reads height above a surface plate. A gage block, or a wrung stack, is a known height you can set that reading against. Match the contact and the approach you will use on the part. A different contact, or a different direction, is a different measurement.</p>
<h2>Steps</h2>
${stepsHtml(heightSteps)}
<h2>Worked example</h2>
<p>On an 81-piece set, 2.000 in with wear blocks off is the single 2.000 block. That is the simple setting master: one block, no wring, sitting on the plate.</p>
<p><a class="cta" href="/?target=2.000&amp;set=inch-81&amp;wear=0">Open 2.000 in, wear off</a></p>
<p>If the stack will be rubbed, include the wear blocks in the 2.000 in total. Wear on, the same target is <b>1.000 + 0.900 + 0.050 + 0.050</b>. The two 0.050 blocks are the outside faces. Wring them on last, one on each end.</p>
<p><a class="cta" href="/?target=2.000&amp;set=inch-81&amp;wear=1">Open 2.000 in with wear blocks</a></p>
<p>Set the height gage on the plate. Bring the contact down onto the 2.000 block and zero, or write the reading. Then check a second height you can build, such as the 4.000 in block (<a href="/?target=4.000&amp;set=inch-81&amp;wear=0">open 4.000 in</a>), if the column reaches it. A gage that matches 2.000 and misses 4.000 has a column error the first block did not show.</p>
<p>Let the gage, the plate, and the blocks sit together before a tight check. A block just out of a warm hand is long. The reference temperature is 20 °C (68 °F). The <a href="/calculators/gage-block-temperature-correction.html">temperature page</a> computes the change.</p>
<h2>On this site</h2>
${rel([
  local('/guides/check-calipers-with-gage-blocks.html', 'Check calipers'),
  local('/calculators/wear-block-stack.html', 'Wear-block stacks'),
  local('/guides/how-to-wring-gage-blocks.html', 'How to wring')
])}
<h2>On Ask a Machinist</h2>
${rel([AM.height, AM.square, AM.wear])}
${faqHtml(heightFaq)}`
});

function sineTable(rows, unit) {
  const body = rows
    .map((item) => {
      return (
        '<tr data-length="' + item.length + '" data-unit="' + item.unit + '" data-angle="' + item.angle + '" data-round="' + item.roundStr + '" data-set="' + item.setId + '">' +
        '<th>' + item.angle + '°</th>' +
        '<td>' + item.exactStr + ' ' + unit + '</td>' +
        '<td>' + item.roundStr + ' ' + unit + '</td>' +
        '<td>' + esc(item.blocks) + '</td>' +
        '<td><a href="' + item.href + '">Open</a></td>' +
        '</tr>'
      );
    })
    .join('');
  return (
    '<div class="table-wrap"><table><thead><tr><th>Angle</th><th>L × sin(angle)</th><th>Rounded</th><th>Blocks</th><th></th></tr></thead><tbody>' +
    body +
    '</tbody></table></div>'
  );
}

const sineFaq = [
  { q: 'Why is the stack not exactly L times sin(angle)?', a: 'Gage blocks move in steps. This table rounds inch heights to 0.0001 in, the smallest step of the 81-piece set, and metric heights to 0.001 mm, the same rounding the sine bar page uses. The difference from the exact sine height is at most half a step.' },
  { q: 'Which set do the links open?', a: 'The 5 in and 10 in columns open the 81-piece inch set. The 100 mm column opens the 88-piece metric set. Wear blocks are off. The link uses the rounded height.' },
  { q: 'What if my bar is not 5 in, 10 in, or 100 mm?', a: 'Use the sine bar calculator on this site. It accepts any length and either decimal degrees or degrees, minutes, and seconds, then opens the solver on the rounded height.' }
];

writePage({
  path: 'calculators/sine-bar-angle-table.html',
  title: 'Sine Bar Angle Table (5 in, 10 in, 100 mm) | GageBlockCalc',
  ogTitle: 'Sine Bar Angle Table (5 in, 10 in, 100 mm)',
  h1: 'Sine Bar Angle Table: 5 in, 10 in, and 100 mm',
  description: 'Sine bar stack heights for 5 in, 10 in, and 100 mm bars at 5° to 45°. Each row is H = L × sin(angle), rounded, with the gage block stack.',
  canonical: 'https://gageblockcalc.com/calculators/sine-bar-angle-table.html',
  ld: [
    howToLd('How to use a sine bar angle table', [
      { name: 'Pick the bar length', text: 'Use the column that matches the roll-center distance: 5 in, 10 in, or 100 mm. The overall length of the bar is not the length in the formula.' },
      { name: 'Read H = L × sin(angle)', text: 'A 5 in bar at 10° is 0.86824089 in. A 10 in bar at 30° is 5.0000 in. A 100 mm bar at 10° is 17.364818 mm.' },
      { name: 'Build the rounded stack', text: 'Inch heights round to 0.0001 in and open the 81-piece set. Metric heights round to 0.001 mm and open the 88-piece set. The 5 in, 10° stack is 0.650 + 0.118 + 0.1002.' }
    ]),
    faqLd(sineFaq),
    crumbs([homeCrumb(), calcCrumb(), { name: 'Sine bar angle table', item: 'https://gageblockcalc.com/calculators/sine-bar-angle-table.html' }])
  ],
  body: `
<p>The stack height under a sine bar is <span class="f">H = L × sin(angle)</span>. L is the distance between the roll centers, not the overall length of the bar. The angle is in degrees. This table uses three common bars and six angles. Inch heights are rounded to 0.0001 in. Millimetre heights are rounded to 0.001 mm. The blocks are the fewest-block stack from the solver, wear blocks off.</p>
<p>For any other length or angle, use the <a href="/calculators/sine-bar-gage-block-stack.html">sine bar calculator</a>. It accepts decimal degrees or degrees, minutes, and seconds.</p>
<h2>5 inch bar</h2>
<p>Set: inch 81-piece. At 30° the height is exactly 2.5000 in, because sin(30°) is 1/2.</p>
${sineTable(ROWS_5, 'in')}
<h2>10 inch bar</h2>
<p>Set: inch 81-piece. At 30° the height is exactly 5.0000 in, built as 4.000 + 1.000.</p>
${sineTable(ROWS_10, 'in')}
<h2>100 mm bar</h2>
<p>Set: metric 88-piece. At 30° the height is exactly 50.000 mm, which is the single 50 mm block. The 1.0005 mm block in a metric set can finish one half-thousandth ending. It is not a 0.0005 mm step for every height, so these rows round to 0.001 mm. The <a href="/calculators/sine-bar-gage-block-stack.html">sine bar page</a> explains that limit.</p>
${sineTable(ROWS_100, 'mm')}
<h2>Worked stacks</h2>
<div class="card">
<p><b>5 in at 10°.</b> H = 5 × sin(10°) = ${R5_10.exactStr} in. Rounded to ${R5_10.roundStr} in. Blocks: ${esc(R5_10.blocks)}.</p>
<p><a class="cta" href="${R5_10.href}">Open ${R5_10.roundStr} in</a> <a href="/calculators/stacks/0.8682-in-81.html">0.8682 in recipe</a></p>
</div>
<div class="card">
<p><b>10 in at 30°.</b> H = 10 × sin(30°) = 5 in exactly. Blocks: ${esc(R10_30.blocks)}.</p>
<p><a class="cta" href="${R10_30.href}">Open 5.0000 in</a></p>
</div>
<div class="card">
<p><b>100 mm at 15°.</b> H = 100 × sin(15°) = ${R100_15.exactStr} mm. Rounded to ${R100_15.roundStr} mm. Blocks: ${esc(R100_15.blocks)}.</p>
<p><a class="cta" href="${R100_15.href}">Open ${R100_15.roundStr} mm</a></p>
</div>
<p>A 5 in bar at 30° is ${esc(R5_30.blocks)}, and a 100 mm bar at 10° is ${esc(R100_10.blocks)}. Both are in the tables above.</p>
<h2>On this site</h2>
${rel([
  local('/calculators/sine-bar-gage-block-stack.html', 'Sine bar calculator'),
  local('/guides/sine-plate-setup.html', 'Sine plate setup'),
  local('/guides/how-to-wring-gage-blocks.html', 'How to wring the stack')
])}
<h2>On Ask a Machinist</h2>
${rel([AM.sineGuide, AM.sineTool, AM.build])}
${faqHtml(sineFaq)}`
});

const plateSteps = [
  { name: 'Read the roll-center distance', text: 'The length in the formula is the distance from the hinge center to the gage-roll center. It is marked for that plate. It is not always 5 or 10 inches, and it is not the overall length of the plate.', html: 'The length in the formula is the distance from the hinge center to the gage-roll center. It is marked for that plate. It is not always 5 or 10 inches, and it is not the overall length of the plate.' },
  { name: 'Compute the stack height', text: 'H = L × sin(angle), with the angle in degrees. Round an inch height to 0.0001 in or a metric height to 0.001 mm, then build that size.', html: 'H = L × sin(angle), with the angle in degrees. Round an inch height to 0.0001 in or a metric height to 0.001 mm, then build that size. The <a href="/calculators/sine-bar-gage-block-stack.html">sine bar calculator</a> does this for any length.' },
  { name: 'Clean the hinge, the roll, and the plate', text: 'A chip under the roll or on the hinge changes the angle. Wipe the stack the same way.', html: 'A chip under the roll or on the hinge changes the angle. Wipe the stack the same way.' },
  { name: 'Wring the stack and set it under the free roll', text: 'The stack goes under the gage roll, the roll that is not the hinge. Do not put blocks under the hinge.', html: 'The stack goes under the gage roll, the roll that is not the hinge. Do not put blocks under the hinge. <a href="/guides/how-to-wring-gage-blocks.html">Wring</a> the blocks before they go under the roll.' },
  { name: 'Lower the plate onto the stack and lock without lifting the roll', text: 'The roll has to sit on the stack. A lock that lifts the roll, or a stack that is cocked, is a different angle than the one you calculated.', html: 'The roll has to sit on the stack. A lock that lifts the roll, or a stack that is cocked, is a different angle than the one you calculated.' }
];
const plateFaq = [
  { q: 'Is a sine plate the same formula as a sine bar?', a: 'Yes. H = L × sin(angle). On a plate, L is the hinge-to-roll distance for that plate. On a bar, L is the roll-center distance. Neither L is the overall length of the tool.' },
  { q: 'Where does the stack sit?', a: 'Under the free roll, opposite the hinge. Blocks under the hinge do not set the angle, and they can rock the plate.' },
  { q: 'What stack is a 5 inch plate at 10 degrees?', a: 'If the plate roll distance is 5.000 in, H = 0.86824089 in, which rounds to 0.8682 in. The 81-piece stack is 0.650 + 0.118 + 0.1002, wear blocks off.' }
];

writePage({
  path: 'guides/sine-plate-setup.html',
  title: 'Sine Plate Setup with Gage Blocks | GageBlockCalc',
  ogTitle: 'Sine Plate Setup with Gage Blocks',
  h1: 'Sine Plate Setup with Gage Blocks',
  description: 'Set a sine plate with H = L × sin(angle). L is the hinge-to-roll distance. Worked 5 in plate at 10°: 0.8682 in, stack 0.650 + 0.118 + 0.1002.',
  canonical: 'https://gageblockcalc.com/guides/sine-plate-setup.html',
  ld: [
    howToLd('How to set up a sine plate with gage blocks', plateSteps),
    faqLd(plateFaq),
    crumbs([homeCrumb(), calcCrumb(), { name: 'Sine plate setup', item: 'https://gageblockcalc.com/guides/sine-plate-setup.html' }])
  ],
  body: `
<p>A sine plate uses the same relation as a sine bar. The height of the stack under the free roll is</p>
<span class="f">H = L × sin(angle)</span>
<p>L is the distance from the hinge center to the center of the gage roll. Read it from the plate. Two plates that look the same length overall can have different roll distances, and they need different stacks.</p>
<h2>Steps</h2>
${stepsHtml(plateSteps)}
<h2>Worked example</h2>
<p>A plate whose roll distance is 5.000 in, set to 10°:</p>
<span class="f">H = 5 × sin(10°) = ${R5_10.exactStr} in</span>
<p>Round to the 81-piece step, 0.0001 in: <b>${R5_10.roundStr} in</b>. The stack, wear off, is <b>${esc(R5_10.blocks)}</b>. Wring that stack and set it under the free roll. The hinge end stays on the plate or on its own reference, with no blocks stuffed under the hinge pin.</p>
<p>The rounded height is ${Math.abs(Number(R5_10.exactStr) - Number(R5_10.roundStr)).toFixed(8)} in ${Number(R5_10.roundStr) < Number(R5_10.exactStr) ? 'under' : 'over'} the exact sine height. That is less than half of 0.0001 in. For a critical angle, the certificate deviations and the temperature still sit on top of that rounding. This page does not add those. It gets the nominal stack height.</p>
<p><a class="cta" href="${R5_10.href}">Open 0.8682 in on the 81-piece set</a> <a class="cta" href="/calculators/sine-bar-angle-table.html">5 in, 10 in, and 100 mm table</a></p>
<p>If the plate is 10 in between centers and the angle is 30°, sin(30°) is 1/2, so H is 5.0000 in exactly: 4.000 + 1.000. <a href="/?target=5.0000&amp;set=inch-81&amp;wear=0">Open 5.0000 in</a>.</p>
<h2>On this site</h2>
${rel([
  local('/calculators/sine-bar-gage-block-stack.html', 'Sine bar calculator'),
  local('/calculators/sine-bar-angle-table.html', 'Sine bar angle table'),
  local('/guides/how-to-wring-gage-blocks.html', 'How to wring')
])}
<h2>On Ask a Machinist</h2>
${rel([AM.sineGuide, AM.sineTool, AM.wring])}
${faqHtml(plateFaq)}`
});

const tempFaq = [
  { q: 'What temperature is a gage block length stated at?', a: '20 °C, which is 68 °F. ASME B89.1.9 uses that reference temperature. A nominal size is the length at 20 °C, not the length at shop temperature.' },
  { q: 'What coefficient should I use for steel blocks?', a: 'The nominal value for steel gage blocks is 11.5 × 10⁻⁶ per °C. NIST Monograph 180 lists 11.5 for a steel gage block under 25 mm, and 10.6 for a 500 mm steel block. ISO 3650 specifies (11.5 ± 1.0) × 10⁻⁶ per K for steel. Use the certificate value when you have one.' },
  { q: 'Does this correction matter if the part is steel too?', a: 'The block grows, and a steel part with the same coefficient grows by about the same amount. The difference between them can be near zero even though each one changed. The calculator on this page reports the block change. The difference is L × (α_part − α_block) × ΔT, and only when you enter a part coefficient.' }
];

writePage({
  path: 'calculators/gage-block-temperature-correction.html',
  title: 'Gage Block Temperature Correction Calculator | GageBlockCalc',
  ogTitle: 'Gage Block Temperature Correction Calculator',
  h1: 'Gage Block Temperature Correction',
  description: 'Gage block thermal expansion calculator. ΔL = L × α × ΔT, from the 20 °C reference. Steel, tungsten carbide, zirconia, and chrome carbide.',
  canonical: 'https://gageblockcalc.com/calculators/gage-block-temperature-correction.html',
  ld: [
    howToLd('How to correct a gage block length for temperature', [
      { name: 'Start from 20 °C', text: 'Gage block length is defined at 20 °C (68 °F). ΔT is the temperature minus 20 °C.' },
      { name: 'Multiply length by the coefficient and by ΔT', text: 'ΔL = L × α × ΔT. For a 4.000 in steel block at 23 °C, α is 11.5 × 10⁻⁶ per °C and ΔL is 0.000138 in.' },
      { name: 'Add the change to the nominal length', text: 'The length at the measured temperature is L + ΔL. A 4.000 in steel block at 23 °C is about 4.000138 in. Use the certificate coefficient when you have one.' }
    ]),
    faqLd(tempFaq),
    crumbs([homeCrumb(), calcCrumb(), { name: 'Temperature correction', item: 'https://gageblockcalc.com/calculators/gage-block-temperature-correction.html' }])
  ],
  body: `
<p>A gage block's stated length is its length at <b>20 °C (68 °F)</b>. Warm the block and it grows. The change is</p>
<span class="f">ΔL = L × α × ΔT</span>
<p>ΔT is the block temperature minus 20 °C. α is the coefficient of linear expansion per °C. The length at the shop temperature is L + ΔL. This is the block's own change. It is not automatically the error in a measurement.</p>
<h2>Coefficients</h2>
<p>These are the nominal values at 20 °C in NIST Monograph 180, Table 3.2. A certificate may list a measured coefficient for that set. Use the measured value when you have it. The presets are a starting point.</p>
<div class="table-wrap"><table>
<thead><tr><th>Material</th><th>α (10⁻⁶ / °C)</th></tr></thead>
<tbody>
<tr><td>Steel gage block, under 25 mm</td><td>11.5</td></tr>
<tr><td>Ceramic gage block (zirconia)</td><td>9.2</td></tr>
<tr><td>Chrome carbide</td><td>8.4</td></tr>
<tr><td>Tungsten carbide</td><td>4.5</td></tr>
</tbody></table></div>
<p class="note">NIST lists a 500 mm steel gage block at 10.6 × 10⁻⁶ / °C, because the core of a long steel block is not hardened the same way as the ends. ISO 3650 specifies (11.5 ± 1.0) × 10⁻⁶ per K for steel gage blocks. Do not apply 11.5 to a long steel block without looking at the certificate.</p>
<h2>Calculator</h2>
<div class="card" id="tempCalc">
<div class="fields">
<div><label class="lbl" for="len">Length at 20 °C</label><input id="len" type="number" inputmode="decimal" min="0" step="any" value="4"></div>
<div><label class="lbl" for="lenUnit">Length unit</label><select id="lenUnit"><option value="in" selected>inches</option><option value="mm">millimetres</option></select></div>
<div><label class="lbl" for="mat">Block material</label><select id="mat"><option value="11.5e-6" selected>Steel, 11.5×10⁻⁶</option><option value="4.5e-6">Tungsten carbide, 4.5×10⁻⁶</option><option value="9.2e-6">Zirconia ceramic, 9.2×10⁻⁶</option><option value="8.4e-6">Chrome carbide, 8.4×10⁻⁶</option><option value="custom">Custom α</option></select></div>
<div><label class="lbl" for="alpha">α per °C</label><input id="alpha" type="number" inputmode="decimal" min="0" step="any" value="0.0000115"></div>
<div><label class="lbl" for="temp">Block temperature</label><input id="temp" type="number" inputmode="decimal" step="any" value="23"></div>
<div><label class="lbl" for="tempUnit">Temperature unit</label><select id="tempUnit"><option value="C" selected>°C</option><option value="F">°F</option></select></div>
<div><label class="lbl" for="partAlpha">Part α per °C (optional)</label><input id="partAlpha" type="number" inputmode="decimal" min="0" step="any" placeholder="blank = block only"></div>
</div>
<p id="formulaOut" class="f"></p>
<p id="deltaOut" class="big"></p>
<p id="diffOut" class="note"></p>
<p id="linkOut"></p>
</div>
<h2>Worked example</h2>
<p>A 4.000 in steel block at 23 °C. ΔT is 3 °C. α is 11.5 × 10⁻⁶ per °C.</p>
<span class="f">ΔL = 4.000 × 11.5×10⁻⁶ × 3 = 0.000138 in</span>
<p>That is 138 millionths of an inch. The block is about 4.000138 in long at 23 °C. The form above starts on this example. <a href="/?target=4.000&amp;set=inch-81&amp;wear=0">Open the 4.000 in block</a> for the nominal stack, which is the single 4 inch block. The nominal stack does not include this temperature change.</p>
<p>NIST's own illustration of the same coefficient: a 100 mm steel block grows 1.15 µm when it warms 1 °C, because 100 × 11.5×10⁻⁶ = 0.00115 mm.</p>
<p>If the part is also steel at 11.5 × 10⁻⁶, both grow together and the first-order difference is zero. If the blocks are tungsten carbide (4.5 × 10⁻⁶) and the part is steel (11.5 × 10⁻⁶), a 100 mm length and a 5 °C rise differ by</p>
<span class="f">ΔL = 100 × (11.5 − 4.5)×10⁻⁶ × 5 = 0.0035 mm</span>
<p>That 0.0035 mm is 3.5 µm. Enter the part coefficient in the form to see the difference for your own length. Leave it blank to see only the block.</p>
<h2>On this site</h2>
${rel([
  local('/guides/ceramic-vs-steel-vs-carbide-gage-blocks.html', 'Ceramic, steel, and carbide'),
  local('/guides/how-to-wring-gage-blocks.html', 'Wringing and hand heat'),
  local('/calculators/inch-mm-gage-block-conversion.html', 'Inch and millimetre conversion')
])}
<h2>On Ask a Machinist</h2>
${rel([AM.temp, AM.carbide, AM.wring])}
${faqHtml(tempFaq)}
<script src="/js/shop-calcs.js"></script>
<script>
(function () {
  var S = window.GBCShop;
  if (!S) return;
  var len = document.getElementById('len');
  var lenUnit = document.getElementById('lenUnit');
  var mat = document.getElementById('mat');
  var alpha = document.getElementById('alpha');
  var temp = document.getElementById('temp');
  var tempUnit = document.getElementById('tempUnit');
  var partAlpha = document.getElementById('partAlpha');
  var formulaOut = document.getElementById('formulaOut');
  var deltaOut = document.getElementById('deltaOut');
  var diffOut = document.getElementById('diffOut');
  var linkOut = document.getElementById('linkOut');
  function trim(n, places) {
    var s = Number(n).toFixed(places);
    if (s.indexOf('.') === -1) return s;
    return s.replace(/0+$/, '').replace(/\\.$/, '');
  }
  function sci(a) {
    return trim(a * 1e6, 4) + '×10⁻⁶';
  }
  function render() {
    if (mat.value !== 'custom') alpha.value = String(Number(mat.value));
    var result = S.deltaL(len.value, alpha.value, temp.value, tempUnit.value);
    if (!result) {
      formulaOut.textContent = 'Enter a length above zero and a coefficient of zero or more.';
      deltaOut.textContent = '';
      diffOut.textContent = '';
      linkOut.textContent = '';
      return;
    }
    var unit = lenUnit.value;
    var dTShow = tempUnit.value === 'F' ? trim(result.dT, 4) + ' °C  (from °F)' : trim(result.dT, 4) + ' °C';
    formulaOut.textContent = 'ΔL = ' + trim(len.value, 6) + ' ' + unit + ' × ' + sci(Number(alpha.value)) + ' /°C × ' + dTShow + ' = ' + trim(result.dL, 9) + ' ' + unit;
    var micro = unit === 'in' ? trim(result.dL / 1e-6, 2) + ' millionths of an inch' : trim(result.dL / 0.001, 3) + ' µm';
    deltaOut.textContent = 'Length at temperature: ' + trim(result.lengthAtT, 8) + ' ' + unit + ' (' + micro + ' change)';
    var part = partAlpha.value.trim();
    if (part === '') {
      diffOut.textContent = 'Part coefficient is blank, so the difference against a workpiece is not computed.';
    } else {
      var pa = Number(part);
      if (!(pa >= 0) || !isFinite(pa)) {
        diffOut.textContent = 'Part coefficient has to be zero or a positive number.';
      } else {
        var diff = Number(len.value) * (pa - Number(alpha.value)) * result.dT;
        diffOut.textContent = 'Part minus block: L × (α_part − α_block) × ΔT = ' + trim(diff, 9) + ' ' + unit + '. Positive means the part grew more than the blocks.';
      }
    }
    var setId = unit === 'mm' ? 'metric-112' : 'inch-81';
    var href = S.stackHref(Number(len.value), setId);
    linkOut.textContent = '';
    if (href) {
      var a = document.createElement('a');
      a.className = 'cta';
      a.href = href;
      a.textContent = 'Open nominal ' + S.queryNumber(Number(len.value)) + ' ' + unit + ' in the calculator';
      linkOut.appendChild(a);
    }
  }
  mat.addEventListener('change', render);
  [len, lenUnit, alpha, temp, tempUnit, partAlpha].forEach(function (el) {
    el.addEventListener('input', render);
  });
  alpha.addEventListener('input', function () { mat.value = 'custom'; });
  render();
})();
</script>`
});

const convertFaq = [
  { q: 'How many millimetres are in an inch?', a: 'The international inch is exactly 25.4 mm. Multiply inches by 25.4 to get millimetres. Divide millimetres by 25.4 to get inches.' },
  { q: 'Can I mix inch and metric blocks in one stack?', a: 'No. This calculator builds a stack from one set. Convert the target, then open a set in that unit. A 0.500 in target is the 0.500 block. The same length in millimetres is 12.7 mm, which is a different stack on a metric set.' },
  { q: 'Is 1.000 in the same stack as 25.4 mm?', a: 'It is the same length. It is not the same blocks. 1.000 in is the 1 inch block on the 81-piece set. 25.4 mm on a 112-piece set is 24 + 1.4. On an 88-piece set it is 20 + 4 + 1.4.' }
];

writePage({
  path: 'calculators/inch-mm-gage-block-conversion.html',
  title: 'Inch to mm Gage Block Conversion | GageBlockCalc',
  ogTitle: 'Inch to mm Gage Block Conversion',
  h1: 'Inch and Millimetre Gage Block Conversion',
  description: 'Convert a gage block target between inches and millimetres. 1 in = 25.4 mm exactly. Worked stacks for 0.500 in = 12.7 mm and 1.000 in = 25.4 mm.',
  canonical: 'https://gageblockcalc.com/calculators/inch-mm-gage-block-conversion.html',
  ld: [
    howToLd('How to convert a gage block target between inches and millimetres', [
      { name: 'Use the exact inch', text: 'One international inch is exactly 25.4 millimetres. Multiply inches by 25.4. Divide millimetres by 25.4.' },
      { name: 'Do not mix the blocks', text: 'An inch set and a metric set are different inventories. Convert the number, then build the stack on a set of that unit.' },
      { name: 'Open the converted size', text: '0.500 in is 12.700 mm. The 112-piece stack for 12.7 mm is 11.5 + 1.2. The 88-piece stack is 10 + 1.5 + 1.2. The inch stack is the 0.500 block.' }
    ]),
    faqLd(convertFaq),
    crumbs([homeCrumb(), calcCrumb(), { name: 'Inch and millimetre conversion', item: 'https://gageblockcalc.com/calculators/inch-mm-gage-block-conversion.html' }])
  ],
  body: `
<p>Inch blocks and metric blocks are not two labels for one set. The length converts. The stack does not. The international inch is exactly 25.4 mm, so</p>
<span class="f">mm = in × 25.4</span>
<span class="f">in = mm ÷ 25.4</span>
<p>The calculator will not put an inch block and a metric block in the same stack. Convert, then open a set that uses the unit you converted to.</p>
<h2>Calculator</h2>
<div class="card" id="convCalc">
<div class="fields">
<div><label class="lbl" for="value">Length</label><input id="value" type="number" inputmode="decimal" min="0" step="any" value="0.5"></div>
<div><label class="lbl" for="from">From</label><select id="from"><option value="in" selected>inches</option><option value="mm">millimetres</option></select></div>
</div>
<p id="convFormula" class="f"></p>
<p id="convOut" class="big"></p>
<p id="convLinks"></p>
</div>
<h2>Worked example: 0.500 in</h2>
<p>0.500 × 25.4 = 12.700 mm exactly.</p>
<div class="table-wrap"><table>
<thead><tr><th>Set</th><th>Stack</th><th>Open</th></tr></thead>
<tbody>
<tr><td>Inch 81-piece, 0.500 in</td><td>0.500</td><td><a href="/?target=0.500&amp;set=inch-81&amp;wear=0">Open 0.500 in</a></td></tr>
<tr><td>Metric 112-piece, 12.7 mm</td><td>11.5 + 1.2</td><td><a href="/?target=12.7&amp;set=metric-112&amp;wear=0">Open 12.7 mm</a></td></tr>
<tr><td>Metric 88-piece, 12.7 mm</td><td>10 + 1.5 + 1.2</td><td><a href="/?target=12.7&amp;set=metric-88&amp;wear=0">Open 12.7 mm</a></td></tr>
</tbody></table></div>
<p>The recipes are <a href="/calculators/stacks/12.70-mm-112.html">12.70 mm on the 112-piece set</a> and <a href="/calculators/stacks/12.70-mm-88.html">12.70 mm on the 88-piece set</a>.</p>
<h2>Worked example: 1.000 in</h2>
<p>1 × 25.4 = 25.400 mm exactly. The inch stack is the 1.000 block. The metric stacks are not a 25.4 mm block. The sets do not contain one.</p>
<div class="table-wrap"><table>
<thead><tr><th>Set</th><th>Stack</th><th>Open</th></tr></thead>
<tbody>
<tr><td>Inch 81-piece, 1.000 in</td><td>1.000</td><td><a href="/?target=1.000&amp;set=inch-81&amp;wear=0">Open 1.000 in</a></td></tr>
<tr><td>Metric 112-piece, 25.4 mm</td><td>24 + 1.4</td><td><a href="/?target=25.4&amp;set=metric-112&amp;wear=0">Open 25.4 mm</a></td></tr>
<tr><td>Metric 88-piece, 25.4 mm</td><td>20 + 4 + 1.4</td><td><a href="/?target=25.4&amp;set=metric-88&amp;wear=0">Open 25.4 mm</a></td></tr>
</tbody></table></div>
<p>A link from this page uses at most six decimal places, which is what the calculator accepts. A millimetre value divided by 25.4 often does not stop at six places. The link is the rounded target, and the line above the buttons shows the closer product.</p>
<h2>On this site</h2>
${rel([
  local('/calculators/metric-gage-block-stack.html', 'Metric sets'),
  local('/calculators/inch-gage-block-stack.html', 'Inch 81-piece set'),
  local('/calculators/gage-block-temperature-correction.html', 'Temperature correction')
])}
<h2>On Ask a Machinist</h2>
${rel([AM.metric, AM.build, AM.choose])}
${faqHtml(convertFaq)}
<script src="/js/shop-calcs.js"></script>
<script>
(function () {
  var S = window.GBCShop;
  if (!S) return;
  var value = document.getElementById('value');
  var from = document.getElementById('from');
  var formula = document.getElementById('convFormula');
  var out = document.getElementById('convOut');
  var links = document.getElementById('convLinks');
  function trim(n, places) {
    var s = Number(n).toFixed(places);
    if (s.indexOf('.') === -1) return s;
    return s.replace(/0+$/, '').replace(/\\.$/, '');
  }
  function addLink(href, text) {
    var a = document.createElement('a');
    a.className = 'cta';
    a.href = href;
    a.textContent = text;
    links.appendChild(a);
  }
  function render() {
    var got = S.convertLength(value.value, from.value);
    links.textContent = '';
    if (!got) {
      formula.textContent = 'Enter a length above zero.';
      out.textContent = '';
      return;
    }
    if (from.value === 'in') {
      formula.textContent = trim(got.inches, 6) + ' in × 25.4 = ' + trim(got.mm, 6) + ' mm';
      out.textContent = trim(got.mm, 6) + ' mm';
      var inchHref = S.stackHref(got.inches, 'inch-81');
      var mm112 = S.stackHref(got.mm, 'metric-112');
      var mm88 = S.stackHref(got.mm, 'metric-88');
      if (inchHref) addLink(inchHref, 'Open ' + S.queryNumber(got.inches) + ' in on the 81-piece set');
      if (mm112) addLink(mm112, 'Open ' + S.queryNumber(got.mm) + ' mm on the 112-piece set');
      if (mm88) addLink(mm88, 'Open ' + S.queryNumber(got.mm) + ' mm on the 88-piece set');
    } else {
      formula.textContent = trim(got.mm, 6) + ' mm ÷ 25.4 = ' + trim(got.inches, 6) + ' in';
      out.textContent = trim(got.inches, 6) + ' in';
      var back = S.stackHref(got.mm, 'metric-112');
      var asIn = S.stackHref(got.inches, 'inch-81');
      var as88 = S.stackHref(got.mm, 'metric-88');
      if (back) addLink(back, 'Open ' + S.queryNumber(got.mm) + ' mm on the 112-piece set');
      if (as88) addLink(as88, 'Open ' + S.queryNumber(got.mm) + ' mm on the 88-piece set');
      if (asIn) addLink(asIn, 'Open ' + S.queryNumber(got.inches) + ' in on the 81-piece set');
    }
  }
  value.addEventListener('input', render);
  from.addEventListener('change', render);
  render();
})();
</script>`
});

const careFaq = [
  { q: 'Should steel blocks be oiled in the case?', a: 'Yes. After you handle steel, wipe on a light rust-preventive film before the blocks go back in the case. Wipe that film off before the next wring. A thick film adds length and stops a good wring. Ceramic and carbide do not rust the way steel does. They still need to be wiped clean so grit does not sit on the face.' },
  { q: 'Can I leave a stack wrung together in the box?', a: 'No. Take the stack apart by sliding, then oil steel faces and put each block in its pocket. A stack left wrung can be hard to separate, and steel can corrode in the joint.' },
  { q: 'How often should blocks be calibrated?', a: 'The interval belongs to your quality system and to any customer requirement. There is no single interval that fits a master set and a daily working set. The calibration guide on Ask a Machinist is the longer discussion. This calculator does not pick an interval.' }
];

writePage({
  path: 'guides/gage-block-care-and-storage.html',
  title: 'Gage Block Care and Storage | GageBlockCalc',
  ogTitle: 'Gage Block Care and Storage',
  h1: 'Gage Block Care and Storage',
  description: 'How to wipe, oil, stone, and store gage blocks. Steel needs a rust film in the case. Do not leave a stack wrung. Reference temperature is 20 °C.',
  canonical: 'https://gageblockcalc.com/guides/gage-block-care-and-storage.html',
  ld: [
    howToLd('How to care for and store gage blocks', [
      { name: 'Wipe the faces before and after use', text: 'Clean faces wring. Grit on a face scratches the next block. Wipe before the stack and again before the blocks go in the case.' },
      { name: 'Oil steel for storage, then wipe it off before the next wring', text: 'A light rust-preventive film protects steel in the case. A thick film left on for the next measurement adds length. Ceramic and carbide do not rust the way steel does.' },
      { name: 'Store blocks in the case, unwrung', text: 'Each block goes in its pocket. Do not leave a stack wrung in the drawer, and do not leave steel loose where chips and coolant can reach it.' },
      { name: 'Stone a burr, not the size', text: 'A fingernail nick can be stoned off with a few light passes of a clean gage block stone. Stoning is not lapping, and it does not replace a damaged block or a calibration.' }
    ]),
    faqLd(careFaq),
    crumbs([homeCrumb(), calcCrumb(), { name: 'Gage block care and storage', item: 'https://gageblockcalc.com/guides/gage-block-care-and-storage.html' }])
  ],
  body: `
<p>Gage blocks stay the length on the certificate only if the faces stay clean, flat, and free of rust. Most of the damage in a shop set is fingerprints, a stack left wrung, and a burr that someone kept using.</p>
<h2>Steps</h2>
<ol class="steps">
<li><b>Wipe before and after.</b> Use a clean, lint-free cloth. A chip on one face becomes a scratch on the next block you wring to it.</li>
<li><b>Oil steel when it goes away.</b> After handling, wipe a light rust-preventive film on steel faces and put the block in its pocket. Before the next wring, wipe that film back off until only a trace remains. A wet face will not wring to the block length. The <a href="/guides/how-to-wring-gage-blocks.html">wringing page</a> is the trace-of-oil step.</li>
<li><b>Do not oil ceramic or carbide to stop rust.</b> They do not rust the way steel does. Wipe them so the faces are clean. A dirty ceramic face scratches just as a dirty steel face does.</li>
<li><b>Take stacks apart.</b> Slide blocks apart. Do not pry. Store them unwrung, in the case, closed, away from chips, coolant, and a window that heats the box.</li>
<li><b>Stone only a raised burr.</b> If a fingernail catches, a few light passes on a clean stone can drop the burr. Stop when the nail no longer catches. A stone is not a way to "true up" a worn block.</li>
<li><b>Let heat leave before a tight length.</b> The stated length is at 20 °C (68 °F). A block just out of a warm hand is long. The <a href="/calculators/gage-block-temperature-correction.html">temperature calculator</a> shows how much.</li>
<li><b>Keep wear on the wear blocks.</b> When a stack touches a part or a plate, the sacrificial blocks go on the outside. The <a href="/calculators/wear-block-stack.html">wear-block page</a> and the <a href="/calculators/stacks/2.3456-in-81-wear.html">2.3456 in wear recipe</a> show how the calculator includes them.</li>
</ol>
<h2>Worked habit</h2>
<p>You built 0.8682 in as 0.650 + 0.118 + 0.1002 for a sine bar, used it, and now the job is done.</p>
<ol class="steps">
<li>Slide 0.1002 off, then slide 0.118 off 0.650.</li>
<li>Wipe each steel face. If the set is steel, put a light film on for the case.</li>
<li>Set each block in the pocket marked for that size. Close the case.</li>
<li>Next time, wipe the film off before you wring. <a href="/?target=0.8682&amp;set=inch-81&amp;wear=0">Open 0.8682 in again</a> only after the faces are ready.</li>
</ol>
<p>Calibration is a separate decision. A daily working set and a master that stays in the lab do not share one calendar. This site does not invent an interval. Read the certificate date, follow the quality system you actually work under. The calibration interval guide linked below is the longer version.</p>
<h2>On this site</h2>
${rel([
  local('/guides/how-to-wring-gage-blocks.html', 'How to wring'),
  local('/guides/gage-block-grades.html', 'Grades'),
  local('/calculators/wear-block-stack.html', 'Wear blocks')
])}
<h2>On Ask a Machinist</h2>
${rel([AM.accessories, AM.interval, AM.wear])}
${faqHtml(careFaq)}`
});

const materialFaq = [
  { q: 'Which material expands like a steel part?', a: 'Steel blocks. The nominal coefficient is 11.5 × 10⁻⁶ per °C, close to many steel workpieces, so the difference can be small when both are at the same temperature. Carbide at 4.5 × 10⁻⁶ and zirconia at 9.2 × 10⁻⁶ do not match steel as closely. Those three numbers are the NIST Monograph 180 table values at 20 °C.' },
  { q: 'Can I wring a steel block to a carbide block?', a: 'They can wring. You should not treat that stack as one material when the room is off 20 °C. Each block grows by its own coefficient. Build the stack from one material unless you are prepared to correct each block.' },
  { q: 'Do ceramic and carbide rust?', a: 'Not the way steel does. Steel needs a rust-preventive film in the case. Ceramic and carbide still need clean faces. Carbide is heavy and can chip if it is dropped. Ceramic can chip if it is struck. Steel dents and rusts more readily than it chips.' }
];

writePage({
  path: 'guides/ceramic-vs-steel-vs-carbide-gage-blocks.html',
  title: 'Ceramic vs Steel vs Carbide Gage Blocks | GageBlockCalc',
  ogTitle: 'Ceramic vs Steel vs Carbide Gage Blocks',
  h1: 'Ceramic vs Steel vs Carbide Gage Blocks',
  description: 'Steel, zirconia ceramic, and tungsten carbide gage blocks compared by expansion, rust, and wear. Coefficients from NIST Monograph 180. Do not mix materials in one stack.',
  canonical: 'https://gageblockcalc.com/guides/ceramic-vs-steel-vs-carbide-gage-blocks.html',
  ld: [
    howToLd('How to choose between ceramic, steel, and carbide gage blocks', [
      { name: 'Match expansion to the work', text: 'Steel blocks are the usual choice next to steel parts because both use a coefficient near 11.5 × 10⁻⁶ per °C. Tungsten carbide is about 4.5 × 10⁻⁶. Zirconia ceramic is about 9.2 × 10⁻⁶. Those are the NIST Monograph 180 values at 20 °C.' },
      { name: 'Match the material to the abuse', text: 'Steel rusts and needs a film in the case. Carbide wears longer and is heavier, and it can chip if dropped. Zirconia does not rust and its expansion is closer to steel than carbide is. It can chip if it is struck.' },
      { name: 'Do not mix materials in one stack', text: 'A mixed stack grows as separate pieces. Off 20 °C, the nominal sum is no longer the length of the stack. Correct each material, or build the stack from one material.' }
    ]),
    faqLd(materialFaq),
    crumbs([homeCrumb(), calcCrumb(), { name: 'Ceramic vs steel vs carbide', item: 'https://gageblockcalc.com/guides/ceramic-vs-steel-vs-carbide-gage-blocks.html' }])
  ],
  body: `
<p>The calculator treats a block as its nominal size. The material is what decides how that size moves when the room is not 20 °C, and what happens when the block is dropped, left damp, or wrung all day. These notes use the coefficients in NIST Monograph 180, Table 3.2, at 20 °C. A set's certificate overrides the table.</p>
<div class="table-wrap"><table>
<thead><tr><th>Material</th><th>α at 20 °C</th><th>What that means in the shop</th></tr></thead>
<tbody>
<tr><td>Steel, blocks under 25 mm</td><td>11.5 × 10⁻⁶ / °C</td><td>Closest of the three to most steel parts. Rusts. Needs a light film in the case and a wipe before the next wring.</td></tr>
<tr><td>Zirconia ceramic</td><td>9.2 × 10⁻⁶ / °C</td><td>Closer to steel than carbide is. Does not rust. Hard. Can chip if it is struck.</td></tr>
<tr><td>Chrome carbide</td><td>8.4 × 10⁻⁶ / °C</td><td>Between zirconia and tungsten carbide. NIST lists it separately from tungsten carbide.</td></tr>
<tr><td>Tungsten carbide</td><td>4.5 × 10⁻⁶ / °C</td><td>About a third of steel, which is how NIST describes it. Wears well. Heavy. The expansion difference against a steel part is the large one.</td></tr>
</tbody></table></div>
<p>A long steel block is not 11.5. NIST lists a 500 mm steel gage block at 10.6 × 10⁻⁶ / °C. ISO 3650 specifies steel as (11.5 ± 1.0) × 10⁻⁶ per K. The <a href="/calculators/gage-block-temperature-correction.html">temperature calculator</a> uses 11.5, 9.2, 8.4, and 4.5 as presets and lets you type the certificate value.</p>
<h2>Do not mix them in one stack</h2>
<p>Wringing a steel block to a carbide block can make a joint. It does not make one coefficient. Off 20 °C each block grows by its own α. The nominal sum is then the wrong length.</p>
<p>Worked difference, steel part against tungsten carbide blocks, 100 mm, 5 °C above 20 °C:</p>
<span class="f">ΔL = 100 × (11.5 − 4.5)×10⁻⁶ × 5 = 0.0035 mm</span>
<p>The part is 3.5 µm longer than the carbide stack, relative to how they compared at 20 °C. The same sum with steel blocks against a steel part at the same 11.5 coefficient is zero to first order. Both grew. The comparison did not. A part alloy that is not 11.5 still needs its own coefficient. Type both into the temperature page.</p>
<h2>Which one to keep at the bench</h2>
<p>Steel is the ordinary choice when the work is steel and someone will actually oil the set. Carbide earns its place as a working set that is wrung constantly, if you will correct for temperature or you work close to 20 °C. Zirconia is the corrosion-resistant choice when the expansion still needs to stay nearer steel than carbide does. None of the three is a reason to skip the certificate. Grade and material are different choices. The <a href="/guides/gage-block-grades.html">grades page</a> is the tolerance. This page is the metal, the ceramic, and the carbide.</p>
<p>The stack for a nominal 1.000 in block is the same list in the calculator whichever material the block is. <a href="/?target=1.000&amp;set=inch-81&amp;wear=0">Open 1.000 in</a>. The temperature change is not in that list.</p>
<h2>On this site</h2>
${rel([
  local('/calculators/gage-block-temperature-correction.html', 'Temperature calculator'),
  local('/guides/gage-block-grades.html', 'Grades'),
  local('/guides/gage-block-care-and-storage.html', 'Care and storage')
])}
<h2>On Ask a Machinist</h2>
${rel([AM.carbide, AM.choose, AM.temp])}
${faqHtml(materialFaq)}`
});

console.log('pages ok');

function patchOnce(file, marker, from, to) {
  const full = path.join(ROOT, file);
  let text = fs.readFileSync(full, 'utf8');
  if (text.includes(marker)) {
    console.log('skip', file, marker);
    return;
  }
  if (!text.includes(from)) throw new Error('anchor missing in ' + file);
  text = text.replace(from, to);
  fs.writeFileSync(full, text);
  console.log('patched', file);
}

const LEGAL = '<a href="/about.html">About</a> · <a href="/contact.html">Contact</a> · <a href="/privacy.html">Privacy</a>';
function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((ent) => {
    if (ent.name === 'node_modules' || ent.name === '.git') return;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  });
  return out;
}
walk(ROOT, []).forEach((file) => {
  if (file.endsWith(path.join('widget.html'))) return;
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes('href="/about.html"') && text.includes('href="/contact.html"')) return;
  const pair = '<a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a>';
  if (!text.includes(pair)) throw new Error('no legal pair in ' + path.relative(ROOT, file));
  text = text.replace(pair, LEGAL + ' · <a href="/terms.html">Terms</a>');
  fs.writeFileSync(file, text);
  console.log('footer', path.relative(ROOT, file));
});

const buildStacks = path.join(ROOT, 'scripts/build-stacks.js');
let stacksSrc = fs.readFileSync(buildStacks, 'utf8');
const stacksPair = '<a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a>';
if (!stacksSrc.includes('href="/about.html"')) {
  if (!stacksSrc.includes(stacksPair)) throw new Error('build-stacks footer pair missing');
  stacksSrc = stacksSrc.replace(stacksPair, LEGAL + ' · <a href="/terms.html">Terms</a>');
  fs.writeFileSync(buildStacks, stacksSrc);
  console.log('footer scripts/build-stacks.js');
}

const cards = [
  ['/guides/how-to-wring-gage-blocks.html', 'How to Wring Gage Blocks', 'Clean faces, a trace of oil, and a sliding twist. Worked 0.8682 in stack, 0.650 + 0.118 + 0.1002.'],
  ['/guides/gage-block-grades.html', 'Gage Block Grades 00, 0, AS-1, AS-2, and B', 'ASME B89.1.9 grades, the older grade B name, and the length tolerances comparison charts list through 1 inch.'],
  ['/guides/check-calipers-with-gage-blocks.html', 'Check Calipers with Gage Blocks', 'Zero, then check more than one size along the jaws. Worked 0.250, 1.000, and 4.000 in blocks.'],
  ['/guides/verify-height-gage-with-gage-blocks.html', 'Verify a Height Gage with Gage Blocks', 'Set a height gage from a surface plate. Worked 2.000 in block, and the same target with wear blocks on.'],
  ['/calculators/sine-bar-angle-table.html', 'Sine Bar Angle Table (5 in, 10 in, 100 mm)', 'H = L × sin(angle) at six angles, rounded, with the gage block stack and a link into the solver.'],
  ['/guides/sine-plate-setup.html', 'Sine Plate Setup', 'Same sine formula, using the hinge-to-roll distance. Worked 5 in plate at 10°.'],
  ['/calculators/gage-block-temperature-correction.html', 'Gage Block Temperature Correction', 'ΔL = L × α × ΔT from 20 °C. Steel, carbide, zirconia, and chrome carbide presets.'],
  ['/calculators/inch-mm-gage-block-conversion.html', 'Inch and Millimetre Conversion', '1 in = 25.4 mm exactly. Worked stacks for 0.500 in = 12.7 mm and 1.000 in = 25.4 mm.'],
  ['/guides/gage-block-care-and-storage.html', 'Gage Block Care and Storage', 'Wipe, oil steel for the case, store blocks unwrung, and stone only a burr.'],
  ['/guides/ceramic-vs-steel-vs-carbide-gage-blocks.html', 'Ceramic vs Steel vs Carbide Gage Blocks', 'Expansion, rust, and wear. NIST coefficients. Do not mix materials in one stack.']
];

patchOnce(
  'calculators/index.html',
  'shop-guides-cards',
  '<h2>Guides on AskMachinist</h2>',
  '<h2 id="shop-guides-cards">Shop how-tos</h2>' +
    cards
      .map(
        (card) =>
          '<div class="card"><a href="' +
          card[0] +
          '"><b>' +
          card[1] +
          '</b></a><br>' +
          card[2] +
          '</div>'
      )
      .join('') +
    '<h2>Guides on AskMachinist</h2>'
);

const indexHtmlPath = path.join(ROOT, 'calculators/index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
if (!indexHtml.includes('sine-bar-angle-table.html')) {
  indexHtml = indexHtml.replace(
    '<a href="/llms.txt">llms.txt</a></nav>',
    '<a href="/llms.txt">llms.txt</a> <a href="/calculators/sine-bar-angle-table.html">Sine bar angle table</a> <a href="/calculators/gage-block-temperature-correction.html">Temperature correction</a> <a href="/calculators/inch-mm-gage-block-conversion.html">Inch–mm conversion</a> <a href="/guides/how-to-wring-gage-blocks.html">Wring gage blocks</a> <a href="/guides/gage-block-grades.html">Grades</a></nav>'
  );
  const ldMatch = indexHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!ldMatch) throw new Error('calculators index JSON-LD missing');
  const data = JSON.parse(ldMatch[1]);
  const start = data.itemListElement.length;
  cards.forEach((card, i) => {
    data.itemListElement.push({
      '@type': 'ListItem',
      position: start + i + 1,
      url: 'https://gageblockcalc.com' + card[0],
      name: card[1]
    });
  });
  indexHtml = indexHtml.replace(ldMatch[0], '<script type="application/ld+json">' + JSON.stringify(data) + '</script>');
  fs.writeFileSync(indexHtmlPath, indexHtml);
  console.log('patched calculators/index.html links and ItemList');
}

patchOnce(
  'calculators/sine-bar-gage-block-stack.html',
  'sine-bar-angle-table.html',
  '<a href="/calculators/wear-block-stack.html">Wear blocks</a></nav>',
  '<a href="/calculators/wear-block-stack.html">Wear blocks</a> <a href="/calculators/sine-bar-angle-table.html">Angle table</a> <a href="/guides/sine-plate-setup.html">Sine plate setup</a> <a href="/calculators/gage-block-temperature-correction.html">Temperature correction</a></nav>'
);

patchOnce(
  'calculators/wear-block-stack.html',
  'gage-block-care-and-storage.html',
  '<a href="/calculators/sine-bar-gage-block-stack.html">Sine bar stack</a></nav>',
  '<a href="/calculators/sine-bar-gage-block-stack.html">Sine bar stack</a> <a href="/guides/gage-block-care-and-storage.html">Care and storage</a> <a href="/guides/how-to-wring-gage-blocks.html">How to wring</a> <a href="/guides/verify-height-gage-with-gage-blocks.html">Height gage check</a></nav>'
);

patchOnce(
  'calculators/inch-gage-block-stack.html',
  'check-calipers-with-gage-blocks.html',
  '<a href="/calculators/sine-bar-gage-block-stack.html">Sine bar stack</a></nav>',
  '<a href="/calculators/sine-bar-gage-block-stack.html">Sine bar stack</a> <a href="/guides/gage-block-grades.html">Grades</a> <a href="/calculators/inch-mm-gage-block-conversion.html">Inch–mm conversion</a> <a href="/guides/check-calipers-with-gage-blocks.html">Check calipers</a></nav>'
);

patchOnce(
  'calculators/metric-gage-block-stack.html',
  'ceramic-vs-steel-vs-carbide-gage-blocks.html',
  '<a href="/calculators/sine-bar-gage-block-stack.html">Sine bar stack</a></nav>',
  '<a href="/calculators/sine-bar-gage-block-stack.html">Sine bar stack</a> <a href="/calculators/inch-mm-gage-block-conversion.html">Inch–mm conversion</a> <a href="/calculators/gage-block-temperature-correction.html">Temperature correction</a> <a href="/guides/ceramic-vs-steel-vs-carbide-gage-blocks.html">Ceramic, steel, carbide</a></nav>'
);

patchOnce(
  'calculators/stacks/index.html',
  'how-to-wring-gage-blocks.html',
  '<a href="/llms.txt">llms.txt</a></nav>',
  '<a href="/llms.txt">llms.txt</a> <a href="/guides/how-to-wring-gage-blocks.html">How to wring</a> <a href="/calculators/sine-bar-angle-table.html">Sine bar angle table</a> <a href="/calculators/inch-mm-gage-block-conversion.html">Inch–mm conversion</a></nav>'
);

patchOnce(
  'faq.html',
  'shop-guides-faq',
  '<p>Step-by-step guides: <a href="/calculators/inch-gage-block-stack.html">inch stacks</a>',
  '<p id="shop-guides-faq">Shop how-tos: <a href="/guides/how-to-wring-gage-blocks.html">wring gage blocks</a> · <a href="/guides/gage-block-grades.html">grades</a> · <a href="/guides/check-calipers-with-gage-blocks.html">check calipers</a> · <a href="/guides/verify-height-gage-with-gage-blocks.html">height gage</a> · <a href="/guides/gage-block-care-and-storage.html">care and storage</a></p>\n<p>Step-by-step guides: <a href="/calculators/inch-gage-block-stack.html">inch stacks</a>'
);

patchOnce(
  'index.html',
  '/guides/how-to-wring-gage-blocks.html',
  '<a href="/black-friday-machinist-tool-deals.html">Black Friday machinist tool guide</a>',
  '<a href="/black-friday-machinist-tool-deals.html">Black Friday machinist tool guide</a><span class="sep" aria-hidden="true">·</span>\n        <a href="/guides/how-to-wring-gage-blocks.html">Wring gage blocks</a><span class="sep" aria-hidden="true">·</span>\n        <a href="/guides/gage-block-grades.html">Gage block grades</a><span class="sep" aria-hidden="true">·</span>\n        <a href="/guides/check-calipers-with-gage-blocks.html">Check calipers</a><span class="sep" aria-hidden="true">·</span>\n        <a href="/calculators/sine-bar-angle-table.html">Sine bar angle table</a><span class="sep" aria-hidden="true">·</span>\n        <a href="/calculators/gage-block-temperature-correction.html">Block temperature</a><span class="sep" aria-hidden="true">·</span>\n        <a href="/guides/ceramic-vs-steel-vs-carbide-gage-blocks.html">Ceramic, steel, carbide</a>'
);

patchOnce(
  'black-friday-machinist-tool-deals.html',
  'ceramic-vs-steel-vs-carbide-gage-blocks.html',
  'Ceramic and carbide resist corrosion, and they do not expand like steel, so do not mix materials in one stack when the room is off 68 °F (20 °C).',
  'Ceramic and carbide resist corrosion. They expand at a different rate than steel, so do not mix materials in one stack when the room is off 68 °F (20 °C). See <a href="/guides/ceramic-vs-steel-vs-carbide-gage-blocks.html">ceramic, steel, and carbide</a> and the <a href="/calculators/gage-block-temperature-correction.html">temperature correction</a>.'
);

const sitemapPath = path.join(ROOT, 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
const smStart = '<!-- shop-guides:start -->';
const smEnd = '<!-- shop-guides:end -->';
const smBody =
  smStart +
  '\n' +
  [
    ['https://gageblockcalc.com/about.html', '0.4'],
    ['https://gageblockcalc.com/contact.html', '0.4'],
    ['https://gageblockcalc.com/guides/how-to-wring-gage-blocks.html', '0.7'],
    ['https://gageblockcalc.com/guides/gage-block-grades.html', '0.7'],
    ['https://gageblockcalc.com/guides/check-calipers-with-gage-blocks.html', '0.7'],
    ['https://gageblockcalc.com/guides/verify-height-gage-with-gage-blocks.html', '0.7'],
    ['https://gageblockcalc.com/guides/sine-plate-setup.html', '0.7'],
    ['https://gageblockcalc.com/guides/gage-block-care-and-storage.html', '0.7'],
    ['https://gageblockcalc.com/guides/ceramic-vs-steel-vs-carbide-gage-blocks.html', '0.7'],
    ['https://gageblockcalc.com/calculators/sine-bar-angle-table.html', '0.8'],
    ['https://gageblockcalc.com/calculators/gage-block-temperature-correction.html', '0.8'],
    ['https://gageblockcalc.com/calculators/inch-mm-gage-block-conversion.html', '0.8']
  ]
    .map(
      (row) =>
        '  <url>\n    <loc>' +
        row[0] +
        '</loc>\n    <lastmod>2026-11-19</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>' +
        row[1] +
        '</priority>\n  </url>'
    )
    .join('\n') +
  '\n' +
  smEnd +
  '\n';
if (sitemap.includes(smStart)) {
  sitemap = sitemap.replace(new RegExp(smStart + '[\\s\\S]*?' + smEnd + '\\n'), smBody);
} else {
  sitemap = sitemap.replace('  <!-- stacks:start -->', smBody + '  <!-- stacks:start -->');
}
fs.writeFileSync(sitemapPath, sitemap);
console.log('sitemap');

const llmsPath = path.join(ROOT, 'llms.txt');
let llms = fs.readFileSync(llmsPath, 'utf8');
const llmsBlock = `## Shop how-tos
- About: https://gageblockcalc.com/about.html
- Contact: https://gageblockcalc.com/contact.html
- How to wring gage blocks: https://gageblockcalc.com/guides/how-to-wring-gage-blocks.html
- Gage block grades: https://gageblockcalc.com/guides/gage-block-grades.html
- Check calipers with gage blocks: https://gageblockcalc.com/guides/check-calipers-with-gage-blocks.html
- Verify a height gage: https://gageblockcalc.com/guides/verify-height-gage-with-gage-blocks.html
- Sine plate setup: https://gageblockcalc.com/guides/sine-plate-setup.html
- Gage block care and storage: https://gageblockcalc.com/guides/gage-block-care-and-storage.html
- Ceramic, steel, and carbide: https://gageblockcalc.com/guides/ceramic-vs-steel-vs-carbide-gage-blocks.html
- Sine bar angle table: https://gageblockcalc.com/calculators/sine-bar-angle-table.html
- Temperature correction: https://gageblockcalc.com/calculators/gage-block-temperature-correction.html
- Inch and millimetre conversion: https://gageblockcalc.com/calculators/inch-mm-gage-block-conversion.html
`;
if (llms.includes('## Shop how-tos')) {
  llms = llms.replace(/## Shop how-tos\n[\s\S]*?(?=\n## )/, llmsBlock.trimEnd() + '\n');
} else {
  llms = llms.replace('## AskMachinist\n', llmsBlock + '\n## AskMachinist\n');
}
fs.writeFileSync(llmsPath, llms);
console.log('llms.txt');
