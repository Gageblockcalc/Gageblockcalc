// "Explain this stack": deterministic, templated text built ONLY from a stack the solver already returned.
// Pure functions, no network, no solver calls. Safe to remove without touching any result.
(function (root) {
  'use strict';

  var ORD = ['whole-number', '1st', '2nd', '3rd', '4th', '5th', '6th'];

  // Finest decimal place a remaining size still needs (0 = whole number), working in integer units.
  function placesNeeded(units, scale) {
    var maxPlaces = Math.round(Math.log10(scale));
    if (units === 0) return 0;
    var p = maxPlaces, u = Math.abs(units);
    while (p > 0 && u % 10 === 0) { u = u / 10; p--; }
    return p;
  }

  function fmt(units, scale, setDef, formatSize) {
    return formatSize(units / scale, setDef);
  }

  // Returns {intro, steps:[{label, height, left, note}], count, wring:[labels], temp, method}
  function explainStack(stack, target, setDef, method, formatSize) {
    var scale = setDef.unitScale;
    var u = setDef.unitLabel === 'mm' ? ' mm' : ' in';
    var units = stack.map(function (s) { return Math.round(Number(s) * scale); });
    var T = units.reduce(function (a, b) { return a + b; }, 0);
    var n = units.length;
    var items = units.map(function (un, i) { return { un: un, label: formatSize(stack[i], setDef) }; });

    var tz = function (x) { var c = 0; while (x > 0 && x % 10 === 0) { x /= 10; c++; } return c; };
    var fine = items.slice().sort(function (a, b) { return tz(a.un) - tz(b.un) || b.un - a.un; });
    var run = 0, steps = fine.map(function (it) {
      run += it.un;
      var left = T - run, p = placesNeeded(left, scale), note;
      if (left === 0) note = 'which completes the stack.';
      else if (p === 0) note = 'and what is left to build, ' + fmt(left, scale, setDef, formatSize) + u + ', is a whole number.';
      else note = 'and what is left to build, ' + fmt(left, scale, setDef, formatSize) + u + ', now ends at the ' + ORD[p] + ' decimal place.';
      return { label: it.label, height: fmt(run, scale, setDef, formatSize) + u, note: note };
    });

    var wring = items.slice().sort(function (a, b) { return b.un - a.un; }).map(function (it) { return it.label; });

    var tstr = fmt(T, scale, setDef, formatSize);
    var lenMm = (T / scale) * (setDef.unitLabel === 'mm' ? 1 : 25.4);
    var um = lenMm * 0.0115; // micrometres per 1 deg C, steel 11.5e-6 / deg C
    var temp = 'For a steel stack of ' + tstr + u + ' the length changes by about ';
    if (setDef.unitLabel === 'mm') temp += um.toFixed(2) + ' micrometre';
    else temp += ((T / scale) * 11.5).toFixed(1) + ' microinch (' + um.toFixed(2) + ' micrometre)';
    temp += ' for every 1 \u00b0C (1.8 \u00b0F) away from the 20 \u00b0C (68 \u00b0F) reference. Typical steel coefficient 11.5 \u00d7 10\u207b\u2076 per \u00b0C.';

    var how = method === 'classic'
      ? 'The digit-by-digit method starts with the block that clears the right-hand digits, then each following block clears the next place until nothing is left.'
      : 'The digit-by-digit method could not make this size from the blocks that are available, so a wider search found it. The steps below still add up exactly.';
    var why = 'Every extra block adds a wrung joint, so the fewest-block stack gives the least stack-up error and the least handling.';
    return {
      count: n, total: tstr + u, how: how, why: why, steps: steps, wring: wring, temp: temp, method: method,
    };
  }

  var api = { explainStack: explainStack, placesNeeded: placesNeeded };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GageBlockExplain = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
