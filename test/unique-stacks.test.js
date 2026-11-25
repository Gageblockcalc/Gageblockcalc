// node test/unique-stacks.test.js — min block count first; no repeated size at the same count.
const fs = require('fs');
const path = require('path');
new Function(fs.readFileSync(path.join(__dirname, '../algorithm.js'), 'utf8'))();
const A = globalThis.GageBlockAlgo;
const sets = A.buildSets();
let fail = 0;
const bad = (m) => { fail++; console.log('FAIL', m); };

function qtyAvail(set, qty, excl) {
  const av = A.defaultAvailability(set);
  for (const k of Object.keys(av)) av[k] = qty;
  for (const e of excl || []) av[A.keyOf(e)] = 0;
  return av;
}

function extras(stack, set, wear, framed) {
  const sc = set.unitScale;
  const c = new Map();
  for (const x of stack) {
    const u = A.toUnits(x, sc);
    c.set(u, (c.get(u) || 0) + 1);
  }
  if (framed && wear && set.wearSize != null) {
    const wu = A.toUnits(set.wearSize, sc);
    const n = c.get(wu) || 0;
    if (n >= 2) c.set(wu, n - 2);
  }
  let n = 0;
  for (const v of c.values()) if (v > 1) n += v - 1;
  return n;
}

function minBlocks(T, units) {
  const INF = 1e9, d = new Array(T + 1).fill(INF); d[0] = 0;
  for (const u of units) for (let s = T; s >= u; s--) if (d[s - u] + 1 < d[s]) d[s] = d[s - u] + 1;
  return d[T] >= INF ? null : d[T];
}

function unitsFromAvail(set, av) {
  const units = [];
  for (const [k, c] of Object.entries(av)) {
    const u = A.toUnits(+k, set.unitScale);
    for (let i = 0; i < c; i++) units.push(u);
  }
  return units;
}

function bestCount(set, target, av, wear) {
  const sc = set.unitScale;
  const T = A.toUnits(target, sc);
  const units = unitsFromAvail(set, av);
  if (T > 2e5) return undefined;
  let best = minBlocks(T, units);
  if (wear && set.wearSize != null && best != null) {
    const w = A.toUnits(set.wearSize, sc);
    const rest = units.slice();
    const i1 = rest.indexOf(w); if (i1 >= 0) rest.splice(i1, 1);
    const i2 = rest.indexOf(w); if (i2 >= 0) rest.splice(i2, 1);
    const inner = T > 2 * w ? minBlocks(T - 2 * w, rest) : null;
    if (inner != null) best = inner + 2;
  }
  return best;
}

function solve(setId, target, wear, qty, excl) {
  const set = sets[setId];
  const av = A.applyWearAvailability(qtyAvail(set, qty, excl), set, wear);
  return { set, av, r: A.findStacks(target, set, av, wear, null) };
}

function labels(stack, set) {
  return stack.map((x) => A.formatSize(x, set));
}

function expectStack(label, setId, target, wear, qty, excl, want) {
  const { set, r } = solve(setId, target, wear, qty, excl);
  const got = r.stacks[0] ? labels(r.stacks[0], set) : null;
  if (JSON.stringify(got) !== JSON.stringify(want)) {
    bad(label + ' got ' + JSON.stringify(got) + ' expected ' + JSON.stringify(want));
  } else {
    console.log('ok', label, got.join(' + '));
  }
}

// Pinned default-set examples must stay the same (qty=1, no extra copies).
expectStack('1.2345 in 81', 'inch-81', 1.2345, false, 1, [], ['1.000', '0.134', '0.1005']);
expectStack('2.3456 in 81 wear', 'inch-81', 2.3456, true, 1, [], ['2.000', '0.145', '0.1006', '0.050', '0.050']);
expectStack('0.250 in 36 wear', 'inch-36', 0.25, true, 1, [], ['0.150', '0.050', '0.050']);
expectStack('41.125 mm 88', 'metric-88', 41.125, false, 1, [], ['30', '9', '1.12', '1.005']);
expectStack('41.125 mm 88 wear', 'metric-88', 41.125, true, 1, [], ['30', '7', '1.12', '1.005', '1', '1']);
expectStack('0.12345 in 28', 'inch-28', 0.12345, false, 1, [], ['0.060', '0.023', '0.0204', '0.02005']);

// Same-count unique alternative must beat a repeat (qty=2, wear inner 0.5+0.5).
expectStack('23 mm 88 wear qty2', 'metric-88', 23, true, 2, [], ['10', '9.5', '1.5', '1', '1']);
expectStack('43 mm 88 wear qty2', 'metric-88', 43, true, 2, [], ['30', '9.5', '1.5', '1', '1']);
expectStack('53 mm 112 wear qty2', 'metric-112', 53, true, 2, [], ['25', '24.5', '1.5', '1', '1']);

// Repeat is kept when it is strictly shorter than every no-repeat stack.
expectStack('8.000 in 81 qty2', 'inch-81', 8, false, 2, [], ['4.000', '4.000']);
expectStack('6.000 in 36 qty2', 'inch-36', 6, false, 2, [], ['3.000', '3.000']);
expectStack('0.18 in 28 qty2', 'inch-28', 0.18, false, 2, [], ['0.090', '0.090']);
expectStack('2.000 in 81 excl 2 qty2', 'inch-81', 2, false, 2, [2], ['1.000', '1.000']);

// Unique single / pair still wins when both are possible.
expectStack('0.300 in 81 qty2', 'inch-81', 0.3, false, 2, [], ['0.300']);
expectStack('0.300 in 81 excl 0.300 qty2', 'inch-81', 0.3, false, 2, [0.3], ['0.250', '0.050']);

// Baseline first-stacks that used a necessary repeat stay at that count.
const necessary = [
  { setId: 'inch-81', t: 8.8888, wear: false, qty: 2, n: 5, stack: ['4.000', '4.000', '0.650', '0.138', '0.1008'] },
  { setId: 'inch-81', t: 8.8888, wear: true, qty: 2, n: 7, stack: ['4.000', '4.000', '0.550', '0.138', '0.1008', '0.050', '0.050'] },
];
necessary.forEach((c) => {
  const { set, r } = solve(c.setId, c.t, c.wear, c.qty, []);
  const got = r.stacks[0] ? labels(r.stacks[0], set) : null;
  if (!got || got.length !== c.n) bad('necessary count ' + c.setId + ' ' + c.t + ' ' + JSON.stringify(got));
  if (JSON.stringify(got) !== JSON.stringify(c.stack)) bad('necessary stack ' + c.setId + ' ' + c.t + ' got ' + JSON.stringify(got));
  else console.log('ok necessary', c.setId, c.t, got.join(' + '));
});

// Broad sweep: min count never increases (still equals the DP minimum),
// and a repeated size appears in the first stack only when every
// unique-size solution needs more blocks.
const setIds = ['inch-81', 'inch-36', 'inch-28', 'metric-88', 'metric-112'];
let rnd = 1;
const R = () => (rnd = (rnd * 48271) % 2147483647) / 2147483647;
let N = 0, keptRepeat = 0, avoided = 0;
for (let i = 0; i < 700; i++) {
  const setId = setIds[i % 5];
  const set = sets[setId];
  const metric = setId.startsWith('metric');
  const max = metric ? 150 : setId === 'inch-36' ? 6 : setId === 'inch-28' ? 0.24 : 10;
  const min = setId === 'inch-28' ? 0.03 : metric ? 0.5 : 0.15;
  const t = +(min + R() * (max - min)).toFixed(metric ? 3 : (setId === 'inch-28' ? 5 : 4));
  const wear = i % 5 === 0;
  const qty = [1, 1, 2, 5][i % 4];
  const excl = i % 3 === 0 ? set.sizes.filter(() => R() < 0.12) : [];
  const av = A.applyWearAvailability(qtyAvail(set, qty, excl), set, wear);
  const r = A.findStacks(t, set, av, wear, null);
  N++;
  if (!r.stacks.length) {
    const best = bestCount(set, t, av, wear);
    if (best != null) bad('unsolved but DP min=' + best + ' ' + setId + ' ' + t);
    continue;
  }
  const first = r.stacks[0];
  const T = A.toUnits(t, set.unitScale);
  const sum = first.reduce((a, b) => a + A.toUnits(b, set.unitScale), 0);
  if (sum !== T) bad('bad sum ' + setId + ' ' + t);
  const best = bestCount(set, t, av, wear);
  if (best != null && first.length !== best) {
    bad('min count rose ' + setId + ' ' + t + ' wear=' + wear + ' qty=' + qty + ' got ' + first.length + ' min ' + best);
  }
  const framed = wear && set.wearSize != null && first.length >= 2 &&
    first.filter((x) => A.toUnits(x, set.unitScale) === A.toUnits(set.wearSize, set.unitScale)).length >= 2 &&
    // wear framing is used when the stack includes both wear blocks as the mode requested
    av[A.keyOf(set.wearSize)] >= 2 && T > 2 * A.toUnits(set.wearSize, set.unitScale);
  // Detect framing the same way findStacks does: if wear was requested and
  // the result contains both wear blocks, treat them as the required pair
  // only when a wear-framed solve was possible. Conservative: if extras
  // ignoring the pair is 0, it is fine either way.
  const dFramed = extras(first, set, wear, true);
  const dPlain = extras(first, set, wear, false);
  const dups = (wear && dPlain > 0 && dFramed === dPlain - 1) || (wear && dFramed < dPlain) ? dFramed : dPlain;
  // Prefer the wear-pair-excluded score when wear is on and at least two wear blocks are present.
  const usedWearPair = wear && set.wearSize != null &&
    first.filter((x) => A.toUnits(x, set.unitScale) === A.toUnits(set.wearSize, set.unitScale)).length >= 2;
  const firstExtras = usedWearPair ? dFramed : dPlain;
  if (firstExtras > 0) {
    const av1 = {};
    for (const [k, c] of Object.entries(av)) av1[k] = Math.min(c, 1);
    if (usedWearPair) av1[A.keyOf(set.wearSize)] = 2; // unique inner, required wear pair
    const u = A.findStacks(t, set, av1, usedWearPair, null);
    const uLen = u.stacks[0] ? u.stacks[0].length : Infinity;
    const uExtras = u.stacks[0] ? extras(u.stacks[0], set, usedWearPair, usedWearPair) : 0;
    if (u.stacks[0] && uLen < first.length) {
      bad('unique shorter than chosen repeat ' + setId + ' ' + t + ' ' + labels(first, set).join('+') + ' vs ' + labels(u.stacks[0], set).join('+'));
    } else if (u.stacks[0] && uLen === first.length && uExtras === 0) {
      bad('repeat chosen when same-count unique exists ' + setId + ' ' + t + ' ' + labels(first, set).join('+') + ' vs ' + labels(u.stacks[0], set).join('+'));
    } else {
      keptRepeat++;
    }
  } else {
    avoided++;
  }
}

console.log('sweep', N, 'kept-necessary-repeat', keptRepeat, 'no-extra-repeat', avoided);
console.log(fail ? fail + ' FAILURES' : 'ALL PASS');
process.exit(fail ? 1 : 0);
