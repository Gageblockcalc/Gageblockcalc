// node test/solver.test.js — loads the same algorithm.js the page uses.
const fs = require('fs'); const path = require('path');
new Function(fs.readFileSync(path.join(__dirname, '../algorithm.js'), 'utf8'))();
const A = globalThis.GageBlockAlgo; const sets = A.buildSets();
let fail = 0, times = [];
function minBlocks(T, units) { // 0/1 DP, exact minimum block count
  const INF = 1e9, d = new Array(T + 1).fill(INF); d[0] = 0;
  for (const u of units) for (let s = T; s >= u; s--) if (d[s - u] + 1 < d[s]) d[s] = d[s - u] + 1;
  return d[T] >= INF ? null : d[T];
}
function run(label, setId, target, excl = [], useWear = false, print = false) {
  const set = sets[setId], sc = set.unitScale; let av = A.defaultAvailability(set);
  for (const e of excl) av[A.keyOf(e)] = 0;
  av = A.applyWearAvailability(av, set, useWear);
  const T = A.toUnits(target, sc);
  const units = []; for (const [k, c] of Object.entries(av)) for (let i = 0; i < c; i++) units.push(A.toUnits(+k, sc));
  const t0 = process.hrtime.bigint(); const r = A.findStacks(target, set, av, useWear, null);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6; times.push(ms); if (ms > 40) console.log("slow", label, ms.toFixed(1), r.stacks.length);
  let best = T <= 2e5 ? minBlocks(T, units) : undefined;
  if (useWear && best != null) { // wear mode frames the stack with both wear blocks when possible
    const w = A.toUnits(set.wearSize, sc), rest = units.slice(); rest.splice(rest.indexOf(w), 1); rest.splice(rest.indexOf(w), 1);
    const inner = T > 2 * w ? minBlocks(T - 2 * w, rest) : null; if (inner != null) best = inner + 2;
  } const errs = [];
  if (best != null && !r.stacks.length) errs.push('no result but solvable');
  if (best != null && r.stacks.length && r.stacks[0].length !== best) errs.push(`first len ${r.stacks[0].length} != min ${best}`);
  for (const s of r.stacks) {
    const u = s.map((x) => A.toUnits(x, sc));
    if (u.reduce((a, b) => a + b, 0) !== T) errs.push('bad sum ' + s);
    const c = {}; for (const x of u) c[x] = (c[x] || 0) + 1;
    for (const [x, n] of Object.entries(c)) { const allow = units.filter((y) => y == x).length; if (n > allow) errs.push('over-used/excluded ' + x / sc); }
    for (let i = 1; i < u.length; i++) if (u[i] > u[i - 1]) errs.push('not desc');
  }
  if (errs.length) { fail++; console.log('FAIL', label, errs.slice(0, 3)); }
  if (print) { console.log(`${label}: ${r.stacks.length} stacks, ${ms.toFixed(1)} ms, min=${best}`); r.stacks.forEach((s) => console.log('   ', s.map((x) => A.formatSize(x, set)).join(' + '))); }
  return r;
}
run('2.6674 excl 1,2', 'inch-81', 2.6674, [1, 2], false, true);
run('2.6674 all', 'inch-81', 2.6674, [], false, true);
for (const t of [0.1001, 1.2345, 4.9999, 3.0, 0.1005]) run(String(t), 'inch-81', t, [], false, true);
run('47.385mm m88', 'metric-88', 47.385, [], false, true);
run('47.385mm m112', 'metric-112', 47.385, [], false, true);
run('0.2500 i36 wear', 'inch-36', 0.25, [], true, true);
run('0.1234 i28', 'inch-28', 0.1234, [], false, true);
let rnd = 1; const R = () => (rnd = (rnd * 48271) % 2147483647) / 2147483647;
let multi = 0, N = 0;
for (let i = 0; i < 600; i++) {
  const setId = ['inch-81', 'inch-81', 'inch-81', 'inch-36', 'metric-88', 'metric-112'][i % 6]; const set = sets[setId];
  const max = setId.startsWith('metric') ? 150 : setId === 'inch-36' ? 6 : 10;
  const t = +(0.2 + R() * max).toFixed(setId.startsWith('metric') ? 3 : 4);
  const excl = i % 2 ? set.sizes.filter(() => R() < 0.15) : [];
  const r = run(`rnd ${setId} ${t} excl${excl.length}`, setId, t, excl, i % 7 === 0);
  N++; if (r.stacks.length > 1) multi++;
}
times.sort((a, b) => a - b);
console.log(`random: ${N}, with >1 result: ${multi}; timing median ${times[times.length >> 1].toFixed(2)} ms, p95 ${times[Math.floor(times.length * .95)].toFixed(1)} ms, max ${times[times.length - 1].toFixed(1)} ms`);
console.log(fail ? `${fail} FAILURES` : 'ALL PASS'); process.exit(fail ? 1 : 0);
