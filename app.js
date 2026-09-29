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

  function stackLine(stack, target, setDef, ok) {
    const unit = setDef.unitLabel === 'mm' ? 'mm' : 'in';
    const parts = stack.map((s) => formatSize(s, setDef)).join(' + ');
    const sum = stack.reduce((a, b) => a + Number(b), 0);
    const sumStr = formatSize(sum, setDef);
    const mark = ok ? ' ✓' : '';
    return parts + ' = ' + sumStr + ' ' + unit + mark;
  }

  function shareText(stack, target, setDef, ok) {
    const unit = setDef.unitLabel === 'mm' ? 'mm' : 'in';
    const targetStr = formatSize(target, setDef);
    return (
      'Gage block stack — target ' +
      targetStr +
      ' ' +
      unit +
      ' (' +
      setDef.name +
      ')\n' +
      stackLine(stack, target, setDef, ok)
    );
  }

  function flashCopied(btn) {
    const prev = btn.textContent;
    btn.textContent = 'Copied';
    btn.classList.add('copied');
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = prev;
      btn.classList.remove('copied');
      btn.disabled = false;
    }, 1200);
  }

  async function copyText(text, btn) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      if (btn) flashCopied(btn);
    } catch (e) {
      console.warn('Copy failed', e);
      if (btn) {
        btn.textContent = 'Failed';
        setTimeout(() => {
          btn.textContent = 'Copy';
        }, 1200);
      }
    }
  }

  async function shareStack(stack, target, setDef, ok, btn) {
    const text = shareText(stack, target, setDef, ok);
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Gage Block Stack', text: text });
        return;
      } catch (e) {
        if (e && e.name === 'AbortError') return;
      }
    }
    await copyText(text, btn);
  }

  function formatTicketDate(d) {
    try {
      return d.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch (_) {
      return d.toISOString();
    }
  }

  function printTicket(stack, target, setDef, ok) {
    const unit = setDef.unitLabel === 'mm' ? 'mm' : 'in';
    const ticket = $('#printTicket');
    if (!ticket) {
      window.print();
      return;
    }
    const line = stackLine(stack, target, setDef, ok);
    const blocks = stack
      .map((s) => '<li>' + formatSize(s, setDef) + ' ' + unit + '</li>')
      .join('');
    ticket.innerHTML =
      '<div class="ticket-inner">' +
      '<h2>Gage Block Ticket</h2>' +
      '<dl>' +
      '<dt>Target</dt><dd>' +
      formatSize(target, setDef) +
      ' ' +
      unit +
      '</dd>' +
      '<dt>Set</dt><dd>' +
      setDef.name +
      '</dd>' +
      '<dt>Date</dt><dd>' +
      formatTicketDate(new Date()) +
      '</dd>' +
      '<dt>Blocks</dt><dd><ul class="ticket-blocks">' +
      blocks +
      '</ul></dd>' +
      '<dt>Stack</dt><dd class="ticket-stack">' +
      line +
      '</dd>' +
      '</dl>' +
      '<p class="ticket-footer">Made by Nicholas Duncan 2026</p>' +
      '</div>';
    document.body.classList.add('printing-ticket');
    const cleanup = () => {
      document.body.classList.remove('printing-ticket');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
    // Fallback if afterprint never fires
    setTimeout(cleanup, 2000);
  }


  function setShopHref() {
    const A = globalThis.GageBlockAffiliate;
    if (!A) return '#';
    const setDef = currentSet();
    if (typeof A.setShopUrl === 'function') {
      return A.setShopUrl(setDef.id || state.setId, setDef.name);
    }
    return A.amazonSearchUrl(A.gageBlockSetQuery(setDef.name, setDef.id || state.setId));
  }

  function updateAffiliatePanel() {
    const A = globalThis.GageBlockAffiliate;
    if (!A) return;
    const setDef = currentSet();
    const wearQ = A.wearBlocksQuery(setDef.unitLabel);
    const accQ = A.accessoriesQuery();

    const setLink = $('#affSetLink');
    const wearLink = $('#affWearLink');
    const accLink = $('#affAccessoriesLink');
    const dealerLink = $('#affDealerLink');
    const note = $('#affiliateNote');
    const panelTitle = $('#affiliatePanelTitle');

    if (panelTitle) {
      panelTitle.textContent = 'Shop gage blocks for this set';
    }
    if (setLink) {
      setLink.href = setShopHref();
      setLink.textContent = 'Buy ' + setDef.name + ' set on Amazon →';
    }
    if (wearLink) {
      wearLink.href = typeof A.wearShopUrl === 'function'
        ? A.wearShopUrl(setDef.unitLabel)
        : A.amazonSearchUrl(wearQ);
      wearLink.textContent =
        setDef.unitLabel === 'mm'
          ? 'Buy 1 mm wear / protection blocks on Amazon →'
          : 'Buy 0.050" wear / protection blocks on Amazon →';
    }
    if (accLink) {
      accLink.href = A.amazonSearchUrl(accQ);
      accLink.textContent = 'Buy a gage block stone (wringing) on Amazon →';
    }
    if (dealerLink) {
      const dealerUrl = (A.dealerUrl || '').trim();
      if (!dealerUrl) {
        dealerLink.hidden = true;
        dealerLink.removeAttribute('href');
      } else {
        dealerLink.hidden = false;
        dealerLink.href = dealerUrl;
        dealerLink.textContent =
          'Shop ' + (A.dealerLabel || 'Precision Engineering Supply') + ' →';
        dealerLink.rel = 'noopener';
      }
    }
    if (note) {
      const tag = (A.amazonTag || '').trim();
      note.textContent = tag
        ? 'As an Amazon Associate I earn from qualifying purchases. Calculator stays free.'
        : 'Amazon search links (Associates tag not set yet). Calculator stays free.';
    }
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
          (stacks.length > 1 ? 's' : '') +
          ' · fewest blocks first';
        frag.appendChild(meta);

        stacks.forEach((stack, i) => {
          const sum = stack.reduce((a, b) => a + Number(b), 0);
          const ok = verifyStack(stack, target, setDef.verifyTol, setDef.unitScale);
          const parts = stack.map((s) => formatSize(s, setDef)).join(' + ');
          const sumStr = formatSize(sum, setDef);
          const isPrimary = i === 0;
          const div = document.createElement('div');
          div.className = 'combination' + (isPrimary ? ' primary' : '');
          div.dataset.index = String(i);

          const head =
            '<div class="combo-head">' +
            (isPrimary
              ? '<span class="badge primary-badge">Primary</span>'
              : '<strong>#' + (i + 1) + '</strong>') +
            '<span class="badge">' +
            stack.length +
            ' block' +
            (stack.length === 1 ? '' : 's') +
            '</span>' +
            '<span class="verify ' +
            (ok ? 'ok' : 'bad') +
            '">' +
            (ok ? '✓ Verified' : '✗ Error') +
            '</span></div>';

          const body =
            '<div class="combo-body">' +
            parts +
            ' = <strong>' +
            sumStr +
            ' ' +
            unit +
            '</strong></div>';

          const actions = document.createElement('div');
          actions.className = 'combo-actions';

          const copyBtn = document.createElement('button');
          copyBtn.type = 'button';
          copyBtn.className = 'button button-tiny';
          copyBtn.textContent = 'Copy';
          copyBtn.setAttribute('aria-label', 'Copy stack to clipboard');
          copyBtn.addEventListener('click', () => {
            copyText(stackLine(stack, target, setDef, ok), copyBtn);
          });
          actions.appendChild(copyBtn);

          const shareBtn = document.createElement('button');
          shareBtn.type = 'button';
          shareBtn.className = 'button button-tiny button-secondary';
          shareBtn.textContent = 'Share';
          shareBtn.setAttribute(
            'aria-label',
            isPrimary ? 'Share primary stack' : 'Share stack'
          );
          shareBtn.addEventListener('click', () => {
            shareStack(stack, target, setDef, ok, shareBtn);
          });
          actions.appendChild(shareBtn);

          const printBtn = document.createElement('button');
          printBtn.type = 'button';
          printBtn.className = 'button button-tiny button-secondary';
          printBtn.textContent = 'Print';
          printBtn.setAttribute('aria-label', 'Print shop ticket');
          printBtn.addEventListener('click', () => {
            printTicket(stack, target, setDef, ok);
          });
          actions.appendChild(printBtn);

          div.innerHTML = head + body;
          div.appendChild(actions);
          frag.appendChild(div);
        });

        const A = globalThis.GageBlockAffiliate;
        if (A && stacks.length) {
          const cta = document.createElement('p');
          cta.className = 'result-shop-cta no-print';
          const a = document.createElement('a');
          a.href = setShopHref();
          a.target = '_blank';
          a.rel = 'noopener sponsored';
          a.textContent = 'Need this set? Buy ' + setDef.name + ' on Amazon →';
          cta.appendChild(a);
          frag.appendChild(cta);
        }

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
    updateAffiliatePanel();
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
    updateAffiliatePanel();
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
        navigator.serviceWorker
          .register('/sw.js', { scope: '/' })
          .catch(function () {});
      });
    }

    setupInstallUX();

    const initial = parseFloat($('#target').value);
    if (initial > 0) renderResults(initial);
    else
      $('#results').innerHTML =
        '<div class="hint">Enter a target dimension in ' + currentSet().unitName + '</div>';
  }

  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      window.navigator.standalone === true
    );
  }

  function isIos() {
    const ua = window.navigator.userAgent || '';
    const iOS = /iPad|iPhone|iPod/.test(ua);
    const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    return iOS || iPadOS;
  }

  function setupInstallUX() {
    const bar = $('#installPrompt');
    const btn = $('#installBtn');
    const dismiss = $('#installDismiss');
    const iosBar = $('#iosTip');
    const iosDismiss = $('#iosTipDismiss');
    const IOS_KEY = 'gageblockcalc-ios-tip-dismissed';
    const INSTALL_KEY = 'gageblockcalc-install-dismissed';

    if (!bar || !iosBar) return;
    if (isStandalone()) {
      bar.hidden = true;
      iosBar.hidden = true;
      return;
    }

    let deferredPrompt = null;

    function showBar(el) {
      el.hidden = false;
      el.classList.add('visible');
    }

    function hideBar(el) {
      el.hidden = true;
      el.classList.remove('visible');
    }

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (localStorage.getItem(INSTALL_KEY) === '1') return;
      hideBar(iosBar);
      showBar(bar);
    });

    window.addEventListener('appinstalled', () => {
      deferredPrompt = null;
      hideBar(bar);
      hideBar(iosBar);
    });

    if (btn) {
      btn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        try {
          await deferredPrompt.userChoice;
        } catch (_) {}
        deferredPrompt = null;
        hideBar(bar);
      });
    }

    if (dismiss) {
      dismiss.addEventListener('click', () => {
        hideBar(bar);
        try {
          localStorage.setItem(INSTALL_KEY, '1');
        } catch (_) {}
      });
    }

    // iOS Safari has no beforeinstallprompt — show a short Share tip
    if (isIos() && !isStandalone()) {
      let dismissed = false;
      try {
        dismissed = localStorage.getItem(IOS_KEY) === '1';
      } catch (_) {}
      if (!dismissed) {
        // Delay slightly so it does not fight the first paint
        setTimeout(() => {
          if (deferredPrompt) return; // Chromium already showing install
          showBar(iosBar);
        }, 1200);
      }
    }

    if (iosDismiss) {
      iosDismiss.addEventListener('click', () => {
        hideBar(iosBar);
        try {
          localStorage.setItem(IOS_KEY, '1');
        } catch (_) {}
      });
    }

    // Hide if user later opens in standalone
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      if (e.matches) {
        hideBar(bar);
        hideBar(iosBar);
      }
    });
  }

  init();
})();
