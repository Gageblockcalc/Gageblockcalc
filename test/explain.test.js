// node test/explain.test.js — explainStack is text-only; check it never disagrees with the solver's stack.
const fs = require('fs'); const path = require('path');
new Function(fs.readFileSync(path.join(__dirname, '../algorithm.js'), 'utf8'))();
const A = globalThis.GageBlockAlgo, X = require('../explain.js'); const sets = A.buildSets();
let fail = 0, n = 0;
const bad = (m) => { fail++; console.log('FAIL', m); };
const ids = Object.keys(sets);
for (const id of ids) {
  const set = sets[id], sc = set.unitScale;
  for (let k = 0; k < 150; k++) {
    const t = set.unitLabel === 'mm' ? +(1 + Math.random() * 120).toFixed(3) : +(0.1 + Math.random() * 6).toFixed(4);
    const av = A.defaultAvailability(set);
    const r = A.findStacks(t, set, av, false, null);
    if (!r.stacks.length) continue; n++;
    const before = JSON.stringify(r.stacks);
    const e = X.explainStack(r.stacks[0], t, set, r.method, A.formatSize);
    if (JSON.stringify(r.stacks) !== before) bad('mutated stack ' + id + ' ' + t);
    if (e.steps.length !== r.stacks[0].length) bad('step count ' + id + ' ' + t);
    if (!/completes the stack\.$/.test(e.steps[e.steps.length - 1].note)) bad('last step ' + id + ' ' + t);
    if (e.steps.slice(0, -1).some((s) => /completes/.test(s.note))) bad('early complete ' + id + ' ' + t);
    if (e.wring.length !== e.count) bad('wring count');
    if (/NaN|undefined|Infinity/.test(JSON.stringify(e))) bad('bad token ' + id + ' ' + t);
  }
}
// Pinned example, must match the hub page for 1.2345 in: 1.0005... (finest first)
const set = sets['inch-81'], r = A.findStacks(1.2345, set, A.defaultAvailability(set), false, null);
const e = X.explainStack(r.stacks[0], 1.2345, set, r.method, A.formatSize);
console.log(e.steps.map((s) => s.label + ' -> ' + s.height + ' | ' + s.note).join('\n'));
console.log('wring:', e.wring.join(', then '));
console.log(e.temp);
if (e.total !== '1.2345 in') bad('total ' + e.total);
if (!/^For a steel stack of 1\.2345 in the length changes by about 14\.2 microinch \(0\.36 micrometre\)/.test(e.temp)) bad('temp text');
console.log(fail ? 'FAILURES ' + fail : 'ALL PASS (' + n + ' random stacks)'); process.exit(fail ? 1 : 0);
