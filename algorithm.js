/* Browser build of algorithm.mjs — keep in sync when editing the algorithm. */
(function (global) {
/**
 * Gage block stack algorithm — classic digit-by-digit / minimum-block method.
 * Shared by the web app and Node tests.
 */

function roundUnits(n) {
  return Math.round(n);
}

function trailingZeros(n) {
  if (n === 0) return 15;
  let z = 0;
  while (n % 10 === 0) {
    z++;
    n = Math.floor(n / 10);
  }
  return z;
}

function buildSets() {
  const inch81 = [];
  for (let i = 1; i <= 9; i++) inch81.push(+(0.1 + i * 0.0001).toFixed(4));
  for (let i = 1; i <= 49; i++) inch81.push(+(0.1 + i * 0.001).toFixed(3));
  for (let i = 1; i <= 19; i++) inch81.push(+(i * 0.05).toFixed(2));
  inch81.push(1.0, 2.0, 3.0, 4.0);
  const inch81Unique = [...new Set(inch81.map((x) => +x.toFixed(4)))];

  const inch36 = [0.05];
  for (let i = 1; i <= 9; i++) inch36.push(+(0.1 + i * 0.0001).toFixed(4));
  for (let i = 1; i <= 9; i++) inch36.push(+(0.1 + i * 0.001).toFixed(3));
  for (let i = 1; i <= 9; i++) inch36.push(+(0.1 + i * 0.01).toFixed(2));
  for (let i = 1; i <= 5; i++) inch36.push(+(i * 0.1).toFixed(1));
  inch36.push(1.0, 2.0, 3.0);
  const inch36Unique = [...new Set(inch36.map((x) => +x.toFixed(4)))];

  // Mitutoyo Series 516 metric 112-piece (1 mm base)
  const metric112 = [1.0005];
  for (let i = 1; i <= 9; i++) metric112.push(+(1 + i * 0.001).toFixed(3));
  for (let i = 1; i <= 49; i++) metric112.push(+(1 + i * 0.01).toFixed(2));
  for (let i = 1; i <= 49; i++) metric112.push(+(i * 0.5).toFixed(1));
  metric112.push(25, 50, 75, 100);
  const metric112Unique = [...new Set(metric112.map((x) => +x.toFixed(4)))];

  return {
    'inch-81': {
      id: 'inch-81',
      name: 'Inch 81-piece',
      note: 'Standard 81-pc set; some catalogs list 83 with 2×0.050" wear blocks',
      unitLabel: 'in',
      unitName: 'inches',
      decimals: 4,
      unitScale: 10000,
      sizes: inch81Unique,
      wearSize: 0.05,
      verifyTol: 0.0001,
    },
    'inch-36': {
      id: 'inch-36',
      name: 'Inch 36-piece',
      note: 'Common 36-pc shop set (.050, .1001–.1009, .101–.109, .110–.190, .100–.500, 1–3")',
      unitLabel: 'in',
      unitName: 'inches',
      decimals: 4,
      unitScale: 10000,
      sizes: inch36Unique,
      wearSize: 0.05,
      verifyTol: 0.0001,
    },
    'metric-112': {
      id: 'metric-112',
      name: 'Metric 112-piece',
      note: 'Mitutoyo-style 1 mm base: 1.0005, 1.001–1.009, 1.01–1.49, 0.5–24.5, 25–100',
      unitLabel: 'mm',
      unitName: 'mm',
      decimals: 4,
      unitScale: 10000,
      sizes: metric112Unique,
      wearSize: 1.0,
      verifyTol: 0.001,
    },
  };
}

function toUnits(size, scale) {
  return roundUnits(size * scale);
}

function fromUnits(units, scale) {
  return units / scale;
}

function defaultAvailability(setDef) {
  const avail = {};
  for (const s of setDef.sizes) avail[keyOf(s)] = 1;
  return avail;
}

function keyOf(size) {
  return String(+Number(size).toFixed(4));
}

function applyWearAvailability(avail, setDef, useWear) {
  const out = { ...avail };
  if (!useWear || setDef.wearSize == null) return out;
  const k = keyOf(setDef.wearSize);
  if ((out[k] || 0) < 2) out[k] = 2;
  return out;
}

/**
 * Digit-eliminating candidates for rem, scored by:
 * 1) trailing zeros in remainder (more = better)
 * 2) Starrett "0 or 5" niceness at next place
 * 3) larger block
 */
function digitCandidates(remUnits, unitSizes, counts) {
  if (remUnits <= 0) return [];

  for (const u of unitSizes) {
    if (u === remUnits && (counts.get(u) || 0) > 0) return [u];
  }

  let place = 1;
  let r = remUnits;
  while (r % 10 === 0) {
    place *= 10;
    r = Math.floor(r / 10);
  }
  const needDigit = r % 10;

  const candidates = [];
  for (const u of unitSizes) {
    if (u > remUnits || (counts.get(u) || 0) <= 0) continue;
    if (Math.floor(u / place) % 10 === needDigit) candidates.push(u);
  }

  // Soft fallback: same residue mod place
  if (candidates.length === 0) {
    for (const u of unitSizes) {
      if (u > remUnits || (counts.get(u) || 0) <= 0) continue;
      if (u % place === remUnits % place) candidates.push(u);
    }
  }

  const next = place * 10;
  const five = 5 * next;

  candidates.sort((a, b) => {
    const za = trailingZeros(remUnits - a);
    const zb = trailingZeros(remUnits - b);
    if (zb !== za) return zb - za;
    const niceA = five > 0 && (remUnits - a) % five === 0 ? 1 : 0;
    const niceB = five > 0 && (remUnits - b) % five === 0 ? 1 : 0;
    if (niceB !== niceA) return niceB - niceA;
    return b - a;
  });

  return candidates;
}

function buildCounts(setDef, availability) {
  const scale = setDef.unitScale;
  const counts = new Map();
  for (const s of setDef.sizes) {
    const u = toUnits(s, scale);
    const c = availability[keyOf(s)] || 0;
    counts.set(u, (counts.get(u) || 0) + c);
  }
  return counts;
}

/**
 * Greedy classic solve. On failure at a step, backtrack over a few
 * alternate digit-candidates at that step only (shallow).
 */
function classicSolveUnits(rem0, unitSizes, counts) {
  function greedyFrom(rem, skipAtDepth = new Map()) {
    const stack = [];
    const used = new Map(); // track decrements to restore — we mutate counts
    let depth = 0;
    let r = rem;
    while (r > 0 && depth < 16) {
      const cands = digitCandidates(r, unitSizes, counts);
      if (cands.length === 0) {
        // restore
        for (const [u, n] of used) counts.set(u, (counts.get(u) || 0) + n);
        return null;
      }
      const skip = skipAtDepth.get(depth) || 0;
      if (skip >= cands.length) {
        for (const [u, n] of used) counts.set(u, (counts.get(u) || 0) + n);
        return null;
      }
      const pick = cands[skip];
      stack.push(pick);
      counts.set(pick, counts.get(pick) - 1);
      used.set(pick, (used.get(pick) || 0) + 1);
      r -= pick;
      depth++;
    }
    if (r !== 0) {
      for (const [u, n] of used) counts.set(u, (counts.get(u) || 0) + n);
      return null;
    }
    // success — counts already depleted for this path; restore for caller reuse
    for (const [u, n] of used) counts.set(u, (counts.get(u) || 0) + n);
    return stack;
  }

  // Try pure greedy first
  let best = greedyFrom(rem0);
  if (best) return best;

  // Shallow backtrack: at each depth, try next candidates
  for (let d = 0; d < 6; d++) {
    for (let skip = 1; skip < 6; skip++) {
      const skips = new Map([[d, skip]]);
      const trial = greedyFrom(rem0, skips);
      if (trial && (!best || trial.length < best.length)) best = trial;
    }
  }
  return best;
}

function classicStack(target, setDef, avail, useWear = false) {
  const scale = setDef.unitScale;
  const targetUnits = toUnits(target, scale);
  if (targetUnits <= 0) return null;

  const wearUnits = setDef.wearSize != null ? toUnits(setDef.wearSize, scale) : null;
  const uniqueUnits = [...new Set(setDef.sizes.map((s) => toUnits(s, scale)))].sort((a, b) => a - b);

  if (useWear && wearUnits != null && targetUnits >= 2 * wearUnits) {
    const counts = buildCounts(setDef, avail);
    if ((counts.get(wearUnits) || 0) >= 2) {
      counts.set(wearUnits, counts.get(wearUnits) - 2);
      const inner = classicSolveUnits(targetUnits - 2 * wearUnits, uniqueUnits, counts);
      if (inner) {
        return [setDef.wearSize, ...inner.map((u) => fromUnits(u, scale)), setDef.wearSize];
      }
    }
  }

  const counts = buildCounts(setDef, avail);
  const solved = classicSolveUnits(targetUnits, uniqueUnits, counts);
  if (!solved) return null;
  return solved.map((u) => fromUnits(u, scale));
}

function verifyStack(stack, target, tol, scale = null) {
  const sum = stack.reduce((a, b) => a + Number(b), 0);
  // Prefer integer-unit equality when scale known; else half-tolerance
  if (scale) {
    return toUnits(sum, scale) === toUnits(target, scale);
  }
  return Math.abs(sum - target) < tol / 2 + 1e-12 || Math.abs(sum - target) < 1e-9;
}

/**
 * Short alternative search — iterative deepening, limited pool.
 * Used when classic fails (missing blocks) or to list a few alternatives.
 */
function searchShortStacks(target, setDef, avail, { maxBlocks = 6, maxResults = 8, exclude = [] } = {}) {
  const scale = setDef.unitScale;
  const targetUnits = toUnits(target, scale);
  const tolUnits = 0; // exact match in working units

  // Unique sizes with counts (prefer larger first)
  const items = [];
  for (const s of setDef.sizes) {
    const c = avail[keyOf(s)] || 0;
    if (c > 0) items.push({ u: toUnits(s, scale), c });
  }
  items.sort((a, b) => b.u - a.u);

  const excludeKeys = new Set(
    exclude.map((stack) =>
      [...stack]
        .map((x) => toUnits(x, scale))
        .sort((a, b) => b - a)
        .join(',')
    )
  );

  const results = [];
  const seen = new Set();

  function dfsClean(idx, rem, path, maxDepth, remainingCounts) {
    if (results.length >= maxResults) return;
    if (Math.abs(rem) <= tolUnits && path.length > 0) {
      const key = [...path].sort((a, b) => b - a).join(',');
      if (!seen.has(key) && !excludeKeys.has(key)) {
        seen.add(key);
        results.push(path.map((u) => fromUnits(u, scale)));
      }
      return;
    }
    if (path.length >= maxDepth || rem <= 0 || idx >= items.length) return;

    const { u } = items[idx];
    const maxTake = remainingCounts[idx];

    // Option: take 0
    dfsClean(idx + 1, rem, path, maxDepth, remainingCounts);

    // Option: take 1..maxTake
    for (let n = 1; n <= maxTake; n++) {
      const need = u * n;
      if (need > rem + tolUnits) break;
      for (let k = 0; k < n; k++) path.push(u);
      remainingCounts[idx] -= n;
      dfsClean(idx + 1, rem - need, path, maxDepth, remainingCounts);
      remainingCounts[idx] += n;
      for (let k = 0; k < n; k++) path.pop();
      if (results.length >= maxResults) return;
    }
  }

  const countsArr = items.map((it) => it.c);
  // Iterative deepening by block count keeps this fast
  for (let depth = 1; depth <= maxBlocks && results.length < maxResults; depth++) {
    dfsClean(0, targetUnits, [], depth, countsArr.slice());
  }

  results.sort((a, b) => a.length - b.length);
  return results.slice(0, maxResults);
}

function findStacks(target, setDef, avail, useWear = false) {
  const tol = setDef.verifyTol;
  const scale = setDef.unitScale;
  const stacks = [];
  const classic = classicStack(target, setDef, avail, useWear);

  if (classic && verifyStack(classic, target, tol, scale)) {
    stacks.push(classic);
  }

  if (stacks.length === 0 && useWear) {
    const classicNoWear = classicStack(target, setDef, avail, false);
    if (classicNoWear && verifyStack(classicNoWear, target, tol, scale)) {
      stacks.push(classicNoWear);
    }
  }

  if (stacks.length === 0) {
    const alts = searchShortStacks(target, setDef, avail, { maxBlocks: 6, maxResults: 5 });
    for (const a of alts) {
      if (verifyStack(a, target, tol, scale)) stacks.push(a);
    }
  } else {
    // A couple of alternatives only — keep search cheap
    const alts = searchShortStacks(target, setDef, avail, {
      maxBlocks: Math.min(5, (stacks[0].length || 4) + 1),
      maxResults: 3,
      exclude: stacks,
    });
    for (const a of alts) {
      if (verifyStack(a, target, tol, scale)) stacks.push(a);
    }
  }

  const uniq = [];
  const keys = new Set();
  for (const s of stacks) {
    const k = [...s]
      .map((x) => +Number(x).toFixed(4))
      .sort((a, b) => b - a)
      .join(',');
    if (!keys.has(k)) {
      keys.add(k);
      uniq.push(s);
    }
  }
  uniq.sort((a, b) => a.length - b.length);
  return {
    stacks: uniq,
    method: classic && verifyStack(classic, target, tol, scale) ? 'classic' : stacks.length ? 'search' : 'none',
  };
}

function formatSize(size, setDef) {
  const n = Number(size);
  if (setDef.unitLabel === 'mm') {
    if (Math.abs(n - 1.0005) < 1e-9) return '1.0005';
    let s = n.toFixed(4).replace(/\.?0+$/, '');
    return s;
  }
  const fixed = n.toFixed(4);
  if (/\.\d{3}[1-9]$/.test(fixed)) return fixed;
  if (/\.\d{2}[1-9]0$/.test(fixed)) return n.toFixed(3);
  if (Number.isInteger(n)) return n.toFixed(3);
  if (Math.abs(n * 20 - Math.round(n * 20)) < 1e-9) return n.toFixed(3);
  if (Math.abs(n * 100 - Math.round(n * 100)) < 1e-9) return n.toFixed(2);
  return fixed.replace(/0+$/, '').replace(/\.$/, '');
}

global.GageBlockAlgo = {
  buildSets,
  defaultAvailability,
  applyWearAvailability,
  classicStack,
  findStacks,
  verifyStack,
  formatSize,
  keyOf,
  toUnits,
  fromUnits,
  digitCandidates,
  searchShortStacks,
  trailingZeros,
  roundUnits,
};
})(typeof globalThis !== 'undefined' ? globalThis : window);
