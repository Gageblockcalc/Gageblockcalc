/**
 * Knoop case-depth readings for the static calculator page.
 * The stack solver is not used here and is not modified.
 *
 * HK = 14229 × load(gf) / d(µm)²
 *    = 14.229 × load(kgf) / d(mm)²
 *
 * Sanity check: 500 g at 95 µm is about 788.
 *   14229 × 500 / 95² = 788.3
 *   14.229 × 0.5 / 0.095² = 788.3
 * The constant 14229 belongs with grams and micrometres. Pairing 14229
 * with kilogram-force and millimetres is 1000× high.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.GBCKnoop = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var HK_CONSTANT = 14229;
  var CASE_ALLOWANCE_IN = 0.001;
  var NEXT_STEP_IN = 0.002;
  var STORE_KEY = 'gbc-knoop-case';

  function finite(v) {
    if (typeof v === 'string') {
      var t = v.trim();
      if (t === '') return null;
      v = t;
    }
    if (typeof v === 'boolean' || v === null || typeof v === 'undefined') return null;
    var n = Number(v);
    if (!isFinite(n)) return null;
    return n;
  }

  function roundIn(n) {
    return Math.round(n * 10000) / 10000;
  }

  function formatIn(n) {
    if (n === null || !isFinite(n)) return '';
    return roundIn(n).toFixed(4);
  }

  function formatHK(n) {
    if (n === null || !isFinite(n)) return '';
    return (Math.round(n * 10) / 10).toFixed(1);
  }

  function trimNum(n, places) {
    if (n === null || !isFinite(n)) return '';
    var s = Number(n).toFixed(places);
    if (s.indexOf('.') === -1) return s;
    return s.replace(/0+$/, '').replace(/\.$/, '');
  }

  function umPerUnit(scaleUnits, scaleUm) {
    var units = finite(scaleUnits);
    var um = finite(scaleUm);
    if (units === null || um === null || !(units > 0) || !(um > 0)) return null;
    return um / units;
  }

  function diagonalUm(drumUnits, scaleUnits, scaleUm) {
    var drum = finite(drumUnits);
    var per = umPerUnit(scaleUnits, scaleUm);
    if (drum === null || per === null) return null;
    return drum * per;
  }

  function knoopHK(loadGrams, diagonalMicrometres) {
    var load = finite(loadGrams);
    var d = finite(diagonalMicrometres);
    if (load === null || d === null || !(load >= 0) || !(d > 0)) return null;
    return HK_CONSTANT * load / (d * d);
  }

  function distanceIn(zeroIn, markIn) {
    var z = finite(zeroIn);
    var m = finite(markIn);
    if (z === null || m === null) return null;
    return Math.abs(m - z);
  }

  function effectiveCaseDepthIn(zeroIn, markIn) {
    var dist = distanceIn(zeroIn, markIn);
    if (dist === null) return null;
    return dist + CASE_ALLOWANCE_IN;
  }

  // Further from the edge in the direction already taken from zero.
  // Still on the zero: step positive, the usual way when the stage count rises into the part.
  function nextMarkIn(zeroIn, markIn) {
    var z = finite(zeroIn);
    var m = finite(markIn);
    if (z === null || m === null) return null;
    var step = m < z ? -NEXT_STEP_IN : NEXT_STEP_IN;
    return m + step;
  }

  function status(drumUnits, stopUnits, zeroIn, markIn) {
    var drum = finite(drumUnits);
    var stop = finite(stopUnits);
    if (drum === null || stop === null) return null;
    if (drum >= stop) {
      var depth = effectiveCaseDepthIn(zeroIn, markIn);
      if (depth === null) return null;
      return { state: 'stop', depth: depth, next: null };
    }
    var next = nextMarkIn(zeroIn, markIn);
    if (next === null) return null;
    return { state: 'continue', depth: null, next: next };
  }

  function statusText(state) {
    if (!state) return '';
    if (state.state === 'stop') return 'Stop reached - effective case depth = ' + formatIn(state.depth) + ' in';
    return 'Keep going - next mark at about ' + formatIn(state.next) + ' in';
  }

  function reading(input) {
    input = input || {};
    var per = umPerUnit(input.scaleUnits, input.scaleUm);
    var diag = diagonalUm(input.drum, input.scaleUnits, input.scaleUm);
    var st = status(input.drum, input.stop, input.zero, input.mark);
    return {
      umPerUnit: per,
      distance: distanceIn(input.zero, input.mark),
      depth: effectiveCaseDepthIn(input.zero, input.mark),
      diagonalUm: diag,
      hk: diag === null ? null : knoopHK(input.load, diag),
      status: st,
      statusText: statusText(st)
    };
  }

  function firstStopIndex(rows, stopUnits) {
    var stop = finite(stopUnits);
    if (stop === null || !rows || !rows.length) return -1;
    for (var i = 0; i < rows.length; i++) {
      var drum = finite(rows[i] && rows[i].drum);
      if (drum !== null && drum >= stop) return i;
    }
    return -1;
  }

  function logCase(rows, stopUnits, zeroIn) {
    var index = firstStopIndex(rows, stopUnits);
    if (index < 0) return { index: -1, depth: null };
    return { index: index, depth: effectiveCaseDepthIn(zeroIn, rows[index].stage) };
  }

  function rowMetrics(row, zeroIn, scaleUnits, scaleUm, loadGrams) {
    var diag = diagonalUm(row && row.drum, scaleUnits, scaleUm);
    return {
      distance: distanceIn(zeroIn, row && row.stage),
      diagonalUm: diag,
      hk: diag === null ? null : knoopHK(loadGrams, diag)
    };
  }

  function mount() {
    var rootEl = document.getElementById('knoopCalc');
    if (!rootEl || rootEl.getAttribute('data-ready') === '1') return;
    rootEl.setAttribute('data-ready', '1');

    var zero = document.getElementById('knoopZero');
    var mark = document.getElementById('knoopMark');
    var drum = document.getElementById('knoopDrum');
    var stop = document.getElementById('knoopStop');
    var scaleUnits = document.getElementById('knoopScaleUnits');
    var scaleUm = document.getElementById('knoopScaleUm');
    var load = document.getElementById('knoopLoad');
    var scaleOut = document.getElementById('knoopScaleOut');
    var formulaOut = document.getElementById('knoopFormula');
    var distOut = document.getElementById('knoopDist');
    var depthOut = document.getElementById('knoopDepth');
    var diagOut = document.getElementById('knoopDiag');
    var hkOut = document.getElementById('knoopHK');
    var statusOut = document.getElementById('knoopStatus');
    var tbody = document.getElementById('knoopLogBody');
    var summary = document.getElementById('knoopLogSummary');
    var addBtn = document.getElementById('knoopAdd');
    var resetBtn = document.getElementById('knoopReset');
    var fields = [zero, mark, drum, stop, scaleUnits, scaleUm, load];
    if (fields.some(function (el) { return !el; }) || !tbody || !summary) return;

    function currentInput() {
      return {
        zero: zero.value,
        mark: mark.value,
        drum: drum.value,
        stop: stop.value,
        scaleUnits: scaleUnits.value,
        scaleUm: scaleUm.value,
        load: load.value
      };
    }

    function show(el, text) {
      if (el) el.textContent = text;
    }

    function readLog() {
      var out = [];
      var rows = tbody.querySelectorAll('tr');
      for (var i = 0; i < rows.length; i++) {
        var stageInput = rows[i].querySelector('.log-stage');
        var drumInput = rows[i].querySelector('.log-drum');
        out.push({
          stage: stageInput ? stageInput.value : '',
          drum: drumInput ? drumInput.value : ''
        });
      }
      return out;
    }

    function labelRows() {
      var rows = tbody.querySelectorAll('tr');
      for (var i = 0; i < rows.length; i++) {
        var n = String(i + 1);
        var stageInput = rows[i].querySelector('.log-stage');
        var drumInput = rows[i].querySelector('.log-drum');
        var rm = rows[i].querySelector('.remove');
        if (stageInput) stageInput.setAttribute('aria-label', 'Mark ' + n + ' stage reading, inches');
        if (drumInput) drumInput.setAttribute('aria-label', 'Mark ' + n + ' filar drum reading, units');
        if (rm) rm.setAttribute('aria-label', 'Remove mark ' + n);
      }
    }

    function cellText(n, format) {
      if (n === null || !isFinite(n)) return 'n/a';
      return format(n);
    }

    function paintLog() {
      var input = currentInput();
      var rows = readLog();
      var hit = firstStopIndex(rows, input.stop);
      var trs = tbody.querySelectorAll('tr');
      for (var i = 0; i < trs.length; i++) {
        var metrics = rowMetrics(rows[i], input.zero, input.scaleUnits, input.scaleUm, input.load);
        var distCell = trs[i].querySelector('.log-dist');
        var diagCell = trs[i].querySelector('.log-diag');
        var hkCell = trs[i].querySelector('.log-hk');
        var flag = trs[i].querySelector('.log-flag');
        show(distCell, cellText(metrics.distance, formatIn));
        show(diagCell, cellText(metrics.diagonalUm, function (n) { return trimNum(n, 3); }));
        show(hkCell, cellText(metrics.hk, formatHK));
        var isHit = i === hit;
        if (isHit) trs[i].classList.add('hit');
        else trs[i].classList.remove('hit');
        if (flag) flag.textContent = isHit ? 'Case depth mark' : '';
      }
      var found = logCase(rows, input.stop, input.zero);
      if (!rows.length) {
        show(summary, 'No marks logged yet.');
      } else if (found.index < 0) {
        show(summary, 'No logged drum reading has reached the stop.');
      } else if (found.depth === null) {
        show(summary, 'Row ' + (found.index + 1) + ' reached the stop. Enter its stage reading to get the effective case depth.');
      } else {
        show(summary, 'Stop reached on row ' + (found.index + 1) + ' - effective case depth = ' + formatIn(found.depth) + ' in');
      }
    }

    function render() {
      var input = currentInput();
      var result = reading(input);
      if (result.umPerUnit === null) show(scaleOut, 'Enter a scale above zero.');
      else show(scaleOut, trimNum(result.umPerUnit, 4) + ' µm per unit');

      show(distOut, result.distance === null ? 'Enter both stage readings.' : formatIn(result.distance) + ' in');
      show(depthOut, result.depth === null ? 'Enter both stage readings.' : formatIn(result.depth) + ' in');

      if (result.diagonalUm === null) {
        show(diagOut, 'Enter the drum reading and a scale above zero.');
        show(hkOut, 'HK needs a diagonal above zero.');
        show(formulaOut, 'HK = 14229 × load in grams / (long diagonal in µm)².');
      } else if (!(result.diagonalUm > 0)) {
        show(diagOut, trimNum(result.diagonalUm, 3) + ' µm');
        show(hkOut, 'Not defined for a zero diagonal.');
        show(formulaOut, 'Diagonal is ' + trimNum(result.diagonalUm, 3) + ' µm. HK is not defined at zero.');
      } else if (result.hk === null) {
        show(diagOut, trimNum(result.diagonalUm, 3) + ' µm');
        show(hkOut, 'Enter a load of zero or more.');
        show(formulaOut, 'd = ' + trimNum(result.diagonalUm, 3) + ' µm. Load has to be zero or more.');
      } else {
        show(diagOut, trimNum(result.diagonalUm, 3) + ' µm');
        show(hkOut, formatHK(result.hk));
        show(formulaOut, 'd = ' + trimNum(finite(input.drum), 4) + ' × ' + trimNum(result.umPerUnit, 4) + ' = ' + trimNum(result.diagonalUm, 3) + ' µm. HK = 14229 × ' + trimNum(finite(input.load), 4) + ' / ' + trimNum(result.diagonalUm, 3) + '² = ' + formatHK(result.hk) + '.');
      }

      if (statusOut) {
        if (finite(input.drum) === null || finite(input.stop) === null) {
          show(statusOut, 'Enter the drum reading and the stop.');
          statusOut.className = 'status';
        } else if (result.statusText) {
          show(statusOut, result.statusText);
          statusOut.className = 'status ' + (result.status.state === 'stop' ? 'is-stop' : 'is-go');
        } else {
          show(statusOut, 'Enter the zero and the mark stage reading.');
          statusOut.className = 'status';
        }
      }
      paintLog();
      save();
    }

    function addRow(stage, drumValue) {
      if (tbody.querySelectorAll('tr').length >= 100) {
        show(summary, 'The log holds 100 marks. Remove one to add another.');
        return;
      }
      var tr = document.createElement('tr');
      tr.appendChild(inputCell('Stage reading (inches)', 'log-stage', stage));
      tr.appendChild(inputCell('Filar drum (units)', 'log-drum', drumValue));
      tr.appendChild(textCell('Distance (inches)', 'log-dist'));
      tr.appendChild(textCell('Diagonal (µm)', 'log-diag'));
      tr.appendChild(textCell('HK', 'log-hk'));
      var action = document.createElement('td');
      action.setAttribute('data-label', 'Mark');
      var flag = document.createElement('span');
      flag.className = 'log-flag';
      var rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'remove';
      rm.textContent = 'Remove';
      rm.addEventListener('click', function () {
        tr.remove();
        labelRows();
        render();
      });
      action.appendChild(flag);
      action.appendChild(rm);
      tr.appendChild(action);
      tbody.appendChild(tr);
      var inputs = tr.querySelectorAll('input');
      for (var i = 0; i < inputs.length; i++) inputs[i].addEventListener('input', render);
      labelRows();
      render();
    }

    function inputCell(label, className, value) {
      var td = document.createElement('td');
      td.setAttribute('data-label', label);
      var input = document.createElement('input');
      input.type = 'number';
      input.inputMode = 'decimal';
      input.step = 'any';
      input.autocomplete = 'off';
      input.className = className;
      input.value = value == null ? '' : String(value);
      td.appendChild(input);
      return td;
    }

    function textCell(label, className) {
      var td = document.createElement('td');
      td.setAttribute('data-label', label);
      td.className = className;
      td.textContent = 'n/a';
      return td;
    }

    function snapshot() {
      return {
        zero: zero.value,
        mark: mark.value,
        drum: drum.value,
        stop: stop.value,
        scaleUnits: scaleUnits.value,
        scaleUm: scaleUm.value,
        load: load.value,
        rows: readLog()
      };
    }

    function save() {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(snapshot())); } catch (e) {}
    }

    function restore() {
      var raw = null;
      try { raw = localStorage.getItem(STORE_KEY); } catch (e) { return; }
      if (!raw) return;
      var data = null;
      try { data = JSON.parse(raw); } catch (e) { return; }
      if (!data || typeof data !== 'object') return;
      var map = { zero: zero, mark: mark, drum: drum, stop: stop, scaleUnits: scaleUnits, scaleUm: scaleUm, load: load };
      Object.keys(map).forEach(function (key) {
        var value = data[key];
        if (typeof value === 'number' && isFinite(value)) map[key].value = String(value);
        else if (typeof value === 'string' && value.length <= 40) map[key].value = value;
      });
      if (!Array.isArray(data.rows)) return;
      data.rows.slice(0, 100).forEach(function (row) {
        if (!row || typeof row !== 'object') return;
        var stage = typeof row.stage === 'number' ? String(row.stage) : row.stage;
        var drumValue = typeof row.drum === 'number' ? String(row.drum) : row.drum;
        if (typeof stage !== 'string' || typeof drumValue !== 'string') return;
        if (stage.length > 40 || drumValue.length > 40) return;
        addRow(stage, drumValue);
      });
    }

    fields.forEach(function (el) { el.addEventListener('input', render); });
    if (addBtn) {
      addBtn.addEventListener('click', function () {
        addRow(mark.value, drum.value);
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        zero.value = '0.0000';
        mark.value = '0.0020';
        drum.value = '190';
        stop.value = '229';
        scaleUnits.value = '190';
        scaleUm.value = '95';
        load.value = '500';
        tbody.textContent = '';
        try { localStorage.removeItem(STORE_KEY); } catch (e) {}
        render();
      });
    }

    restore();
    render();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
    else mount();
  }

  return {
    HK_CONSTANT: HK_CONSTANT,
    CASE_ALLOWANCE_IN: CASE_ALLOWANCE_IN,
    NEXT_STEP_IN: NEXT_STEP_IN,
    STORE_KEY: STORE_KEY,
    finite: finite,
    formatIn: formatIn,
    formatHK: formatHK,
    trimNum: trimNum,
    umPerUnit: umPerUnit,
    diagonalUm: diagonalUm,
    knoopHK: knoopHK,
    distanceIn: distanceIn,
    effectiveCaseDepthIn: effectiveCaseDepthIn,
    nextMarkIn: nextMarkIn,
    status: status,
    statusText: statusText,
    reading: reading,
    firstStopIndex: firstStopIndex,
    logCase: logCase,
    rowMetrics: rowMetrics
  };
});
