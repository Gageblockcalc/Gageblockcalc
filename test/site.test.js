// node test/site.test.js — every anchor has an href, hub links are real, legal footer is on every page.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
let fail = 0;
function bad(msg) { fail++; console.error('FAIL', msg); }

function walk(dir, out) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach(function (ent) {
    if (ent.name === 'node_modules' || ent.name === '.git') return;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith('.html')) out.push(p);
  });
  return out;
}

const files = walk(root, []);
files.forEach(function (file) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  const tags = html.match(/<a\b[^>]*>/gi) || [];
  if (!tags.length) bad(rel + ' has no anchors');
  tags.forEach(function (tag) {
    if (!/\shref\s*=\s*["'][^"']+["']/.test(tag)) bad(rel + ' anchor lacks href: ' + tag.slice(0, 180));
  });
  if (!html.includes('href="/privacy.html"')) bad(rel + ' missing Privacy link');
  if (!html.includes('href="/terms.html"')) bad(rel + ' missing Terms link');
  if (rel !== 'widget.html' && rel !== 'embed.html') {
    if (!html.includes('href="/about.html"')) bad(rel + ' missing About link');
    if (!html.includes('href="/contact.html"')) bad(rel + ' missing Contact link');
  }
  if (!html.includes('© 2026 GageBlockCalc')) bad(rel + ' missing copyright');
});

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const hub = {
  '/#chat': 'https://askmachinist.com/#chat',
  '/': 'https://askmachinist.com/',
  '/guides/': 'https://askmachinist.com/guides/',
  '/tools/sine-bar-calculator': 'https://askmachinist.com/tools/sine-bar-calculator',
  '/guides/metric-gage-block-stacks': 'https://askmachinist.com/guides/metric-gage-block-stacks',
  '/gage-block-stacks/': 'https://askmachinist.com/gage-block-stacks/',
  '/guides/machinist-christmas-gift-guide': 'https://askmachinist.com/guides/machinist-christmas-gift-guide'
};
Object.keys(hub).forEach(function (p) {
  const re = new RegExp('<a\\b[^>]*data-hub-path="' + p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"[^>]*>');
  const tag = index.match(re);
  if (!tag) bad('missing hub path ' + p);
  else if (!tag[0].includes('href="' + hub[p] + '"')) bad('hub href for ' + p + ' ' + tag[0]);
});

const terms = fs.readFileSync(path.join(root, 'terms.html'), 'utf8');
if (!/free/i.test(terms) || !/as-is/i.test(terms) || !/no warranty/i.test(terms)) bad('terms missing the standard as-is notice');
if (!/Amazon Associate/i.test(terms)) bad('terms missing affiliate disclosure');
if (!terms.includes('href="/privacy.html"')) bad('terms missing privacy link');
if (!terms.includes('mailto:support@gageblockcalc.com')) bad('terms missing contact');
if (!terms.includes('rel="canonical" href="https://gageblockcalc.com/terms.html"')) bad('terms canonical');

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('https://gageblockcalc.com/terms.html')) bad('sitemap missing terms');
if (!sitemap.includes('https://gageblockcalc.com/about.html')) bad('sitemap missing about');
if (!sitemap.includes('https://gageblockcalc.com/contact.html')) bad('sitemap missing contact');

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
