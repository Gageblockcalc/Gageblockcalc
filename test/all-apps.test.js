// node test/all-apps.test.js — the retiring All apps host is not linked from any page.
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

walk(root, []).forEach(function (file) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(root, file);
  if (/nick-apk-test/i.test(html)) bad(rel + ' still mentions nick-apk-test');
  if (/>\s*All apps\s*</i.test(html)) bad(rel + ' still has an All apps link');
});

const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
if (index.includes('id="get-app"') || index.includes('get-app.js')) bad('get-app widget still on the home page');
if (!index.includes('href="/privacy.html"') || !index.includes('© 2026 GageBlockCalc')) bad('legal footer was removed with the All apps link');

console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
