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
  // Composition: 1.0005; 1.001–1.009 ×0.001 (9); 1.01–1.49 ×0.01 (49);
  //              0.5–24.5 ×0.5 (49); 25, 50, 75, 100 (4) → 112
  const metric112 = [1.0005];
  for (let i = 1; i <= 9; i++) metric112.push(+(1 + i * 0.001).toFixed(3));
  for (let i = 1; i <= 49; i++) metric112.push(+(1 + i * 0.01).toFixed(2));
  for (let i = 1; i <= 49; i++) metric112.push(+(i * 0.5).toFixed(1));
  metric112.push(25, 50, 75, 100);
  const metric112Unique = [...new Set(metric112.map((x) => +x.toFixed(4)))];

  // Starrett / Mitutoyo common inch 28-piece thin set (RC 28 / Series 516)
  // Composition: 0.02005 (1); 0.0201–0.0209 ×0.0001 (9); 0.021–0.029 ×0.001 (9);
  //              0.010–0.090 ×0.010 (9) → 28
  // Measuring range ~0.020–0.240"; needs 0.00001" working units for .02005
  const inch28 = [0.02005];
  for (let i = 1; i <= 9; i++) inch28.push(+(0.02 + i * 0.0001).toFixed(4));
  for (let i = 1; i <= 9; i++) inch28.push(+(0.02 + i * 0.001).toFixed(3));
  for (let i = 1; i <= 9; i++) inch28.push(+(i * 0.01).toFixed(2));
  const inch28Unique = [...new Set(inch28.map((x) => +x.toFixed(5)))];

  // Mitutoyo Series 516 metric 88-piece (1 mm base)
  // Composition: 1.0005 (1); 1.001–1.009 ×0.001 (9); 1.01–1.49 ×0.01 (49);
  //              0.5–9.5 ×0.5 (19); 10–100 ×10 (10) → 88
  const metric88 = [1.0005];
  for (let i = 1; i <= 9; i++) metric88.push(+(1 + i * 0.001).toFixed(3));
  for (let i = 1; i <= 49; i++) metric88.push(+(1 + i * 0.01).toFixed(2));
  for (let i = 1; i <= 19; i++) metric88.push(+(i * 0.5).toFixed(1));
  for (let i = 1; i <= 10; i++) metric88.push(i * 10);
  const metric88Unique = [...new Set(metric88.map((x) => +x.toFixed(4)))];

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
    'inch-28': {
      id: 'inch-28',
      name: 'Inch 28-piece',
      note: 'Starrett/Mitutoyo thin set: .02005, .0201–.0209, .021–.029, .010–.090 (range ~.020–.240")',
      unitLabel: 'in',
      unitName: 'inches',
      decimals: 5,
      unitScale: 100000,
      sizes: inch28Unique,
      wearSize: 0.05,
      verifyTol: 0.00005,
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
    'metric-88': {
      id: 'metric-88',
      name: 'Metric 88-piece',
      note: 'Mitutoyo-style 1 mm base: 1.0005, 1.001–1.009, 1.01–1.49, 0.5–9.5, 10–100×10',
      unitLabel: 'mm',
      unitName: 'mm',
      decimals: 4,
      unitScale: 10000,
      sizes: metric88Unique,
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
  const n = Number(size);
  // Preserve half-tenths / half-microns that need 5 decimals
  if (Math.abs(n * 100000 - Math.round(n * 100000)) < 1e-6 &&
      Math.abs(n * 10000 - Math.round(n * 10000)) > 1e-6) {
    return String(+n.toFixed(5));
  }
  return String(+n.toFixed(4));
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


function availabilityItems(setDef, avail) {
  const scale = setDef.unitScale;
  const byU = new Map();
  for (const s of setDef.sizes) {
    const c = avail[keyOf(s)] || 0;
    if (c <= 0) continue;
    const u = toUnits(s, scale);
    byU.set(u, (byU.get(u) || 0) + c);
  }
  return [...byU.entries()].map(([u, c]) => ({ u, c }));
}

function buildUsageMap(usage, scale) {
  const map = new Map();
  if (!usage) return map;
  const entries = usage instanceof Map ? usage.entries() : Object.entries(usage);
  for (const [k, v] of entries) {
    const n = Number(k);
    const c = Number(v) || 0;
    if (!Number.isFinite(n) || c <= 0) continue;
    const u = toUnits(n, scale);
    map.set(u, (map.get(u) || 0) + c);
  }
  return map;
}

function stackUsageUnits(units, usageMap) {
  let total = 0;
  for (const u of units) total += usageMap.get(u) || 0;
  return total;
}

function stackUsage(stack, usageMap, scale) {
  let total = 0;
  for (const s of stack) total += usageMap.get(toUnits(s, scale)) || 0;
  return total;
}

function sortStackDesc(stack) {
  return [...stack].map(Number).sort((a, b) => b - a);
}

/**
 * Same-length replacement with a strictly lower cumulative usage.
 * Fewest blocks stays put: this never adds or removes a block.
 * Node-capped so a worn set cannot freeze the page. Usage is
 * non-negative, so a zero-usage stack cannot be improved and returns
 * immediately.
 */
function preferLeastUsed(stack, target, setDef, avail, useWear, usageMap) {
  const scale = setDef.unitScale;
  if (stackUsage(stack, usageMap, scale) <= 0) return null;

  let targetUnits = toUnits(target, scale);
  let length = stack.length;
  let searchAvail = avail;
  let wearSize = null;

  if (useWear && setDef.wearSize != null && stack.length >= 2) {
    const wu = toUnits(setDef.wearSize, scale);
    let removed = 0;
    const inner = [];
    for (const s of stack) {
      if (removed < 2 && toUnits(s, scale) === wu) {
        removed++;
        continue;
      }
      inner.push(s);
    }
    if (removed === 2 && length > 2) {
      const wk = keyOf(setDef.wearSize);
      searchAvail = { ...avail, [wk]: Math.max(0, (avail[wk] || 0) - 2) };
      targetUnits -= 2 * wu;
      length -= 2;
      wearSize = setDef.wearSize;
      stack = inner;
    }
  }

  if (length <= 0 || targetUnits < 0) return null;
  const seedUnits = stack.map((s) => toUnits(s, scale));
  let bestUsage = stackUsageUnits(seedUnits, usageMap);
  if (bestUsage <= 0) return null;

  const items = availabilityItems(setDef, searchAvail);
  items.sort((a, b) => {
    const d = (usageMap.get(a.u) || 0) - (usageMap.get(b.u) || 0);
    if (d) return d;
    return b.u - a.u;
  });

  let bestUnits = null;
  let nodes = 0;
  const maxNodes = 80000;
  let stop = false;
  const path = [];

  function rec(start, rem, left, usage) {
    if (stop) return;
    if (++nodes > maxNodes) {
      stop = true;
      return;
    }
    if (usage >= bestUsage) return;
    if (left === 0) {
      if (rem === 0) {
        bestUsage = usage;
        bestUnits = path.slice();
        if (bestUsage <= 0) stop = true;
      }
      return;
    }
    if (rem <= 0 || items.length - start < 1) return;
    for (let i = start; i < items.length; i++) {
      const it = items[i];
      const add = usageMap.get(it.u) || 0;
      const maxK = Math.min(it.c, left);
      for (let k = 1; k <= maxK; k++) {
        const need = it.u * k;
        if (need > rem) break;
        const nextUsage = usage + add * k;
        if (nextUsage >= bestUsage) {
          if (add > 0) break;
          continue;
        }
        for (let t = 0; t < k; t++) path.push(it.u);
        rec(i + 1, rem - need, left - k, nextUsage);
        path.length -= k;
        if (stop) return;
      }
    }
  }

  rec(0, targetUnits, length, 0);
  if (!bestUnits) return null;
  const inner = bestUnits.map((u) => fromUnits(u, scale));
  if (wearSize != null) return [wearSize, ...inner, wearSize];
  return inner;
}

function searchShortStacks(target, setDef, avail, { maxBlocks = 6, maxResults = 8, exclude = [], maxNodes = 80000 } = {}) {
  const scale = setDef.unitScale;
  const targetUnits = toUnits(target, scale);

  const items = availabilityItems(setDef, avail).sort((a, b) => b.u - a.u);

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
  let nodes = 0;
  let stop = false;
  const path = [];

  // Exact-length combinations (no "skip" recursion). The old DFS walked
  // every skip-decision and could hit 1e8+ nodes on a 4–5 block metric
  // target, which froze the main thread. Iterative deepening still
  // prefers fewer blocks; the node cap guarantees a way out.
  function rec(start, rem, left) {
    if (stop || results.length >= maxResults) return;
    if (++nodes > maxNodes) {
      stop = true;
      return;
    }
    if (left === 0) {
      if (rem === 0 && path.length > 0) {
        const key = [...path].sort((a, b) => b - a).join(',');
        if (!seen.has(key) && !excludeKeys.has(key)) {
          seen.add(key);
          results.push(path.map((u) => fromUnits(u, scale)));
        }
      }
      return;
    }
    if (rem <= 0) return;
    for (let i = start; i < items.length; i++) {
      const it = items[i];
      const maxK = Math.min(it.c, left);
      for (let k = 1; k <= maxK; k++) {
        const need = it.u * k;
        if (need > rem) break;
        for (let t = 0; t < k; t++) path.push(it.u);
        rec(i + 1, rem - need, left - k);
        path.length -= k;
        if (stop || results.length >= maxResults) return;
      }
    }
  }

  for (let depth = 1; depth <= maxBlocks && results.length < maxResults && !stop; depth++) {
    rec(0, targetUnits, depth);
  }

  results.sort((a, b) => a.length - b.length);
  return results.slice(0, maxResults);
}

/**
 * Exact, bounded stack search over the blocks still enabled.
 * Works in integer units (divided by their common factor). A small DP gives
 * the true minimum block count for every remainder, and per-block
 * reachability bitsets prune any branch that cannot finish, so excluded
 * blocks can never hide a stack the remaining blocks can make. Depth-first
 * enumeration then lists the fewest-block stacks (and one block more if
 * there are few). Node and time budgets keep it from freezing the page.
 */
function gcdInt(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
function digitSearchUnits(targetUnits, items, { collect = 40, want = 5, maxNodes = 150000, maxMs = 80, maxT = 4000000 } = {}) {
  const live = items.filter((it) => it.c > 0 && it.u > 0 && it.u <= targetUnits).sort((a, b) => b.u - a.u);
  if (targetUnits <= 0 || !live.length) return [];
  let g = targetUnits;
  for (const it of live) g = gcdInt(g, it.u);
  const T = targetUnits / g;
  if (T > maxT) return [];
  const us = live.map((it) => it.u / g);
  const cnt = live.map((it) => it.c);
  const n = us.length;
  const W = (T >>> 5) + 1;

  // reach[i]: sums 0..T makeable from blocks i..n-1
  const reach = new Array(n + 1);
  reach[n] = new Uint32Array(W);
  reach[n][0] = 1;
  for (let i = n - 1; i >= 0; i--) {
    const r = reach[i + 1].slice();
    for (let k = 0; k < cnt[i]; k++) {
      const src = r.slice();
      const ws = us[i] >>> 5, bs = us[i] & 31;
      for (let w = W - 1; w >= ws; w--) {
        let v = src[w - ws] << bs;
        if (bs && w - ws - 1 >= 0) v |= src[w - ws - 1] >>> (32 - bs);
        r[w] |= v;
      }
    }
    reach[i] = r;
  }
  const has = (bits, s) => (bits[s >>> 5] >>> (s & 31)) & 1;
  if (!has(reach[0], T)) return [];

  // within[k]: sums makeable with at most k blocks (a block may repeat here,
  // so it is a cheap lower bound on the block count, never too strict)
  const shiftOr = (dst, src, u) => {
    const ws = u >>> 5, bs = u & 31;
    for (let w = W - 1; w >= ws; w--) {
      let v = src[w - ws] << bs;
      if (bs && w - ws - 1 >= 0) v |= src[w - ws - 1] >>> (32 - bs);
      dst[w] |= v;
    }
  };
  const distinct = [...new Set(us)];
  const within = [new Uint32Array(W)];
  within[0][0] = 1;
  while (!has(within[within.length - 1], T)) {
    if (within.length > 40) return [];
    const prev = within[within.length - 1];
    const next = prev.slice();
    for (const u of distinct) shiftOr(next, prev, u);
    within.push(next);
  }
  const minLen = within.length - 1;
  const grow = (k) => {
    while (within.length <= k) {
      const prev = within[within.length - 1];
      const next = prev.slice();
      for (const u of distinct) shiftOr(next, prev, u);
      within.push(next);
    }
  };
  const okLeft = (r, left) => left >= within.length || has(within[left], r);

  const results = [];
  const path = [];
  let nodes = 0;
  let stop = false;
  const t0 = Date.now();
  function rec(i, rem, left) {
    if (rem === 0) {
      if (left === 0) {
        results.push(path.map((u) => u * g));
        if (results.length >= collect) stop = true;
      }
      return;
    }
    if (++nodes > maxNodes || ((nodes & 1023) === 0 && Date.now() - t0 > maxMs)) {
      stop = true;
      return;
    }
    for (let j = i; j < n && !stop; j++) {
      const u = us[j];
      if (u > rem) continue;
      let r = rem;
      for (let k = 1; k <= cnt[j] && k <= left; k++) {
        r -= u;
        if (r < 0) break;
        if (!okLeft(r, left - k) || !has(reach[j + 1], r)) continue;
        for (let t = 0; t < k; t++) path.push(u);
        rec(j + 1, r, left - k);
        path.length -= k;
        if (stop) break;
      }
    }
  }
  let firstLen = 0;
  for (let L = minLen; L <= minLen + 24 && !stop; L++) {
    if (firstLen && (L > firstLen + 1 || results.length >= want)) break;
    grow(L);
    rec(0, T, L);
    if (results.length && !firstLen) firstLen = L;
  }
  if (!results.length) {
    // Budget ran out: reachability alone guarantees this walk never dead-ends.
    const walk = [];
    let rem = T;
    for (let j = 0; j < n && rem > 0; j++) {
      for (let k = 0; k < cnt[j] && us[j] <= rem && has(reach[j + 1], rem - us[j]); k++) {
        rem -= us[j];
        walk.push(us[j] * g);
        if (!has(reach[j + 1], rem)) break;
      }
    }
    if (rem === 0) results.push(walk);
  }
  return results;
}

function findStacks(target, setDef, avail, useWear = false, usage = null) {
  const scale = setDef.unitScale;
  const usageMap = buildUsageMap(usage, scale);
  const targetUnits = toUnits(target, scale);
  const MAX_SHOWN = 5;
  let raw = [];
  if (targetUnits > 0) {
    if (useWear && setDef.wearSize != null) {
      const wu = toUnits(setDef.wearSize, scale);
      const wk = keyOf(setDef.wearSize);
      if ((avail[wk] || 0) >= 2 && targetUnits > 2 * wu) {
        const inner = digitSearchUnits(targetUnits - 2 * wu, availabilityItems(setDef, { ...avail, [wk]: avail[wk] - 2 }).sort((a, b) => b.u - a.u));
        raw = inner.map((s) => [wu, ...s, wu]);
      }
    }
    if (!raw.length) {
      raw = digitSearchUnits(targetUnits, availabilityItems(setDef, avail).sort((a, b) => b.u - a.u));
    }
  }
  const keys = new Set();
  const uniq = [];
  raw.forEach((s, idx) => {
    if (s.reduce((a, b) => a + b, 0) !== targetUnits) return;
    const ordered = [...s].sort((a, b) => b - a);
    const k = ordered.join(',');
    if (keys.has(k)) return;
    keys.add(k);
    uniq.push({ s: ordered, idx, use: stackUsageUnits(ordered, usageMap) });
  });
  uniq.sort((a, b) => a.s.length - b.s.length || a.use - b.use || a.idx - b.idx);
  const stacks = uniq.slice(0, MAX_SHOWN).map((x) => x.s.map((u) => fromUnits(u, scale)));
  return { stacks, method: stacks.length ? 'classic' : 'none' };
}

function formatSize(size, setDef) {
  const n = Number(size);
  const dec = setDef.decimals || 4;
  if (setDef.unitLabel === 'mm') {
    if (Math.abs(n - 1.0005) < 1e-9) return '1.0005';
    let s = n.toFixed(dec).replace(/\.?0+$/, '');
    return s;
  }
  // Inch thin-set half-tenth
  if (Math.abs(n - 0.02005) < 1e-12) return '0.02005';
  if (dec >= 5) {
    const fixed5 = n.toFixed(5);
    if (/\.\d{4}[1-9]$/.test(fixed5)) return fixed5;
  }
  // .1001–.1009 style (needs 4 decimals)
  const fixed4 = n.toFixed(4);
  if (/\.\d{3}[1-9]$/.test(fixed4)) return fixed4;
  // Standard inch gage-block marking: keep thousandths (.110 not .11, .050, 1.000)
  return n.toFixed(3);
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
  digitSearchUnits,
  trailingZeros,
  roundUnits,
};
})(typeof globalThis !== 'undefined' ? globalThis : window);
