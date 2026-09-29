/**
 * Gage Block Calculator — UI (classic script; uses global GageBlockAlgo)
 */
(function () {
  const {
    buildSets,
    defaultAvailability,
    applyWearAvailability,
    findStacks,
    verifyStack,
    formatSize,
    keyOf,
  } = globalThis.GageBlockAlgo;

  const SETS = buildSets();
  const STORAGE_KEY = 'gageblockcalc-v2';
  const $ = (sel) => document.querySelector(sel);

  const state = {
    setId: 'inch-81',
    useWear: false,
    availability: {},
    checked: {},
  };

  function currentSet() {
    return SETS[state.setId];
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.setId && SETS[saved.setId]) state.setId = saved.setId;
      if (typeof saved.useWear === 'boolean') state.useWear = saved.useWear;
      if (saved.bySet && saved.bySet[state.setId]) {
        const s = saved.bySet[state.setId];
        state.availability = s.availability || {};
        state.checked = s.checked || {};
      }
    } catch (e) {
      console.warn('Could not load settings', e);
    }
  }

  function saveState() {
    try {
      let saved = {};
      try {
        saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      } catch (_) {
        saved = {};
      }
      if (!saved.bySet) saved.bySet = {};
      saved.setId = state.setId;
      saved.useWear = state.useWear;
      saved.bySet[state.setId] = {
        availability: state.availability,
        checked: state.checked,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    } catch (e) {
      console.warn('Could not save settings', e);
    }
  }

  function initAvailabilityForSet(setDef, preserve) {
    const defaults = defaultAvailability(setDef);
    if (!preserve) {
      state.availability = Object.assign({}, defaults);
      state.checked = {};
      for (const s of setDef.sizes) state.checked[keyOf(s)] = true;
      return;
    }
    for (const s of setDef.sizes) {
      const k = keyOf(s);
      if (!(k in state.availability)) state.availability[k] = 1;
      if (!(k in state.checked)) state.checked[k] = true;
    }
  }

  function effectiveAvailability() {
    const setDef = currentSet();
    const base = {};
    for (const s of setDef.sizes) {
      const k = keyOf(s);
      if (state.checked[k] === false) base[k] = 0;
      else base[k] = state.availability[k] ?? 1;
    }
    return applyWearAvailability(base, setDef, state.useWear);
  }

  function populateSetSelect() {
    const sel = $('#setSelect');
    sel.innerHTML = '';
    Object.keys(SETS).forEach((id) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = SETS[id].name;
      if (id === state.setId) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function updateUnitUI() {
    const setDef = currentSet();
    $('#target').placeholder = 'Target (' + setDef.unitName + ')';
    $('#target').setAttribute('aria-label', 'Target dimension in ' + setDef.unitName);
    $('#target').step = setDef.unitLabel === 'mm' ? '0.001' : '0.0001';
    $('#setNote').textContent = setDef.note;
    const wearLabel =
      setDef.unitLabel === 'mm' ? '2×1 mm wear blocks' : '2×0.050" wear blocks';
    $('#wearLabelText').textContent = 'Include ' + wearLabel;
  }

  function populateBlocks() {
    const setDef = currentSet();
    const box = $('#blockSelection');
    const unit = setDef.unitLabel === 'mm' ? 'mm' : 'in';

    box.innerHTML =
      '<div class="toolbar">' +
      '<button type="button" class="button" id="selectAllBtn">Select All</button>' +
      '<button type="button" class="button button-secondary" id="deselectAllBtn">Deselect All</button>' +
      '</div>';

    setDef.sizes.forEach((size) => {
      const k = keyOf(size);
      const checked = state.checked[k] !== false;
      const count = state.availability[k] ?? 1;
      const div = document.createElement('div');
      div.className = 'block-item';
      const label = formatSize(size, setDef);
      const opts = [1, 2, 3, 4, 5]
        .map(
          (n) =>
            '<option value="' +
            n +
            '"' +
            (count === n ? ' selected' : '') +
            '>' +
            n +
            '</option>'
        )
        .join('');
      div.innerHTML =
        '<input type="checkbox" id="block-' +
        k +
        '" data-key="' +
        k +
        '"' +
        (checked ? ' checked' : '') +
        ' aria-label="Block ' +
        label +
        ' ' +
        unit +
        '">' +
        '<label for="block-' +
        k +
        '">' +
        label +
        ' ' +
        unit +
        '</label>' +
        '<select class="block-count" id="count-' +
        k +
        '" data-key="' +
        k +
        '"' +
        (checked ? '' : ' disabled') +
        ' aria-label="Count of ' +
        label +
        ' ' +
        unit +
        '">' +
        opts +
        '</select>';
      box.appendChild(div);
    });

    $('#selectAllBtn').addEventListener('click', () => {
      setDef.sizes.forEach((size) => {
        const k = keyOf(size);
        state.checked[k] = true;
        state.availability[k] = 5;
      });
      saveState();
      populateBlocks();
      scheduleCalc();
    });

    $('#deselectAllBtn').addEventListener('click', () => {
      setDef.sizes.forEach((size) => {
        const k = keyOf(size);
        state.checked[k] = false;
        state.availability[k] = 0;
      });
      saveState();
      populateBlocks();
      scheduleCalc();
    });
  }

  function debounce(fn, wait) {
    let t;
    return function () {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(() => fn.apply(null, args), wait);
    };
  }

  function renderResults(target) {
    const results = $('#results');
    const setDef = currentSet();

    if (!target || target <= 0 || Number.isNaN(target)) {
      results.innerHTML =
        '<div class="hint">Enter a target dimension in ' + setDef.unitName + '</div>';
      return;
    }

    results.innerHTML = '<div class="loading" role="status">Calculating…</div>';

    setTimeout(() => {
      try {
        const avail = effectiveAvailability();
        const any = Object.keys(avail).some((k) => avail[k] > 0);
        if (!any) {
          results.innerHTML =
            '<div class="error">No blocks available. Select at least one block.</div>';
          return;
        }

        const found = findStacks(target, setDef, avail, state.useWear);
        const stacks = found.stacks;
        const method = found.method;

        if (!stacks.length) {
          results.innerHTML =
            '<div class="error">No exact combination found. Check missing blocks or try a different set.</div>';
          return;
        }

        const unit = setDef.unitLabel === 'mm' ? 'mm' : 'in';
        const frag = document.createDocumentFragment();

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.textContent =
          (method === 'classic'
            ? 'Classic digit-by-digit · '
            : 'Fallback search · ') +
          stacks.length +
          ' combination' +
          (stacks.length > 1 ? 's' : '');
        frag.appendChild(meta);

        stacks.forEach((stack, i) => {
          const sum = stack.reduce((a, b) => a + Number(b), 0);
          const ok = verifyStack(stack, target, setDef.verifyTol, setDef.unitScale);
          const parts = stack.map((s) => formatSize(s, setDef)).join(' + ');
          const sumStr = formatSize(sum, setDef);
          const div = document.createElement('div');
          div.className = 'combination';
          div.innerHTML =
            '<div class="combo-head">' +
            '<strong>#' +
            (i + 1) +
            '</strong>' +
            '<span class="badge">' +
            stack.length +
            ' block' +
            (stack.length === 1 ? '' : 's') +
            '</span>' +
            '<span class="verify ' +
            (ok ? 'ok' : 'bad') +
            '">' +
            (ok ? '✓ Verified' : '✗ Error') +
            '</span></div>' +
            '<div class="combo-body">' +
            parts +
            ' = <strong>' +
            sumStr +
            ' ' +
            unit +
            '</strong></div>';
          frag.appendChild(div);
        });

        results.innerHTML = '';
        results.appendChild(frag);
      } catch (e) {
        console.error(e);
        results.innerHTML =
          '<div class="error">Calculation error. Please try again.</div>';
      }
    }, 0);
  }

  const scheduleCalc = debounce(() => {
    renderResults(parseFloat($('#target').value));
  }, 280);

  function onSetChange() {
    saveState();
    state.setId = $('#setSelect').value;
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      if (saved.bySet && saved.bySet[state.setId]) {
        state.availability = saved.bySet[state.setId].availability || {};
        state.checked = saved.bySet[state.setId].checked || {};
        initAvailabilityForSet(currentSet(), true);
      } else {
        initAvailabilityForSet(currentSet(), false);
      }
    } catch (_) {
      initAvailabilityForSet(currentSet(), false);
    }
    updateUnitUI();
    populateBlocks();
    saveState();
    scheduleCalc();
  }

  function init() {
    loadState();
    if (!Object.keys(state.availability).length) initAvailabilityForSet(currentSet(), false);
    else initAvailabilityForSet(currentSet(), true);

    populateSetSelect();
    updateUnitUI();
    populateBlocks();
    $('#wearToggle').checked = state.useWear;

    $('#setSelect').addEventListener('change', onSetChange);
    $('#wearToggle').addEventListener('change', () => {
      state.useWear = $('#wearToggle').checked;
      saveState();
      scheduleCalc();
    });
    $('#target').addEventListener('input', scheduleCalc);

    $('#blockHeader').addEventListener('click', () => {
      const panel = $('#blockSelection');
      const open = panel.classList.toggle('open');
      $('#blockHeader .chevron').textContent = open ? '▲' : '▼';
      $('#blockHeader').setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    $('#blockHeader').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        $('#blockHeader').click();
      }
    });

    $('#blockSelection').addEventListener('change', (e) => {
      const t = e.target;
      const k = t.dataset.key;
      if (!k) return;
      if (t.type === 'checkbox') {
        state.checked[k] = t.checked;
        const countSel = document.getElementById('count-' + k);
        if (countSel) {
          countSel.disabled = !t.checked;
          if (!t.checked) state.availability[k] = 0;
          else if (!state.availability[k]) {
            state.availability[k] = 1;
            countSel.value = '1';
          }
        }
      } else if (t.classList.contains('block-count')) {
        const n = parseInt(t.value, 10);
        state.availability[k] = n;
        state.checked[k] = n > 0;
        const cb = document.getElementById('block-' + k);
        if (cb) cb.checked = n > 0;
        t.disabled = n <= 0;
      }
      saveState();
      scheduleCalc();
    });

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        const swUrl = new URL('sw.js', window.location.href).href;
        navigator.serviceWorker.register(swUrl).catch(function () {});
      });
    }

    const initial = parseFloat($('#target').value);
    if (initial > 0) renderResults(initial);
    else
      $('#results').innerHTML =
        '<div class="hint">Enter a target dimension in ' + currentSet().unitName + '</div>';
  }

  init();
})();
