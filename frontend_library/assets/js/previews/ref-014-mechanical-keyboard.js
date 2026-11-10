/**
 * previews/ref-014-mechanical-keyboard.js
 *
 * Interactive metaphor preview for ref-014: Achraf Kassioui Keyboard —
 * Romantic Skeuomorphism of Mechanical Input.
 *
 * Abstraction level: Flat-skeuomorphic / industrial hardware.
 * Technique: A mechanical keyboard layout (Filco Majestouch style with red Esc
 * and purple WASD keycaps). Features bidirectional synchronization: keys depress
 * with realistic mechanical switch travel when clicking onscreen OR when typing
 * on your actual physical keyboard. Caps Lock hardware LED syncs with real lock state.
 * Dragging across keys provides a piano glissando sweep.
 *
 * Token fidelity (ref-014):
 *   Colors   : #1C1C1E (chassis plate), #3A3A3C (dark grey keycaps), #B3122F (red Esc), #5B2A86 (purple WASD), #F2F2F0 (engraved legends)
 *   Borders  : 3D keycap bevels, molded profiles, and deepening switch travel shadows
 *   Elevation: Key travel indicated by collapsing bottom cast-shadows and Y-translation
 *   Typography: Compact doubleshot legends in two stacked rows
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#1C1C1E', '#3A3A3C', '#B3122F', '#5B2A86', '#F2F2F0'];

  const plate     = colors[0] ?? '#1C1C1E';
  const capGrey   = colors[1] ?? '#3A3A3C';
  const redEsc    = colors[2] ?? '#B3122F';
  const purpleWasd= colors[3] ?? '#5B2A86';
  const legends   = colors[4] ?? '#F2F2F0';

  stageEl.innerHTML = buildStageHtml(plate, capGrey, redEsc, purpleWasd, legends);
  attachInteractions(stageEl, plate, capGrey, redEsc, purpleWasd, legends);
}

// ── Keyboard Key Matrix ───────────────────────────────────────────────────────

const KEY_ROWS = [
  // Row 1: Esc, Function keys, Lock LED
  [
    { code: 'Escape', label: 'ESC', type: 'esc', width: 44 },
    { code: 'F1', label: 'F1', width: 36 },
    { code: 'F2', label: 'F2', width: 36 },
    { code: 'F3', label: 'F3', width: 36 },
    { code: 'F4', label: 'F4', width: 36 },
    { code: 'Spacer', width: 16 },
    { code: 'Backspace', label: 'BACK', width: 56 }
  ],
  // Row 2: Numbers
  [
    { code: 'Backquote', label: '~', sub: '`', width: 34 },
    { code: 'Digit1', label: '1', sub: '!', width: 34 },
    { code: 'Digit2', label: '2', sub: '@', width: 34 },
    { code: 'Digit3', label: '3', sub: '#', width: 34 },
    { code: 'Digit4', label: '4', sub: '$', width: 34 },
    { code: 'Digit5', label: '5', sub: '%', width: 34 },
    { code: 'Digit6', label: '6', sub: '^', width: 34 },
    { code: 'Digit7', label: '7', sub: '&', width: 34 },
    { code: 'Digit8', label: '8', sub: '*', width: 34 },
    { code: 'Digit9', label: '9', sub: '(', width: 34 },
    { code: 'Digit0', label: '0', sub: ')', width: 34 }
  ],
  // Row 3: Q W E R T Y
  [
    { code: 'Tab', label: 'TAB', width: 48 },
    { code: 'KeyQ', label: 'Q', width: 34 },
    { code: 'KeyW', label: 'W', type: 'wasd', width: 34 },
    { code: 'KeyE', label: 'E', width: 34 },
    { code: 'KeyR', label: 'R', width: 34 },
    { code: 'KeyT', label: 'T', width: 34 },
    { code: 'KeyY', label: 'Y', width: 34 },
    { code: 'KeyU', label: 'U', width: 34 },
    { code: 'KeyI', label: 'I', width: 34 },
    { code: 'KeyO', label: 'O', width: 34 },
    { code: 'KeyP', label: 'P', width: 34 }
  ],
  // Row 4: Home row (A S D F)
  [
    { code: 'CapsLock', label: 'CAPS', width: 54 },
    { code: 'KeyA', label: 'A', type: 'wasd', width: 34 },
    { code: 'KeyS', label: 'S', type: 'wasd', width: 34 },
    { code: 'KeyD', label: 'D', type: 'wasd', width: 34 },
    { code: 'KeyF', label: 'F', width: 34 },
    { code: 'KeyG', label: 'G', width: 34 },
    { code: 'KeyH', label: 'H', width: 34 },
    { code: 'KeyJ', label: 'J', width: 34 },
    { code: 'KeyK', label: 'K', width: 34 },
    { code: 'KeyL', label: 'L', width: 34 },
    { code: 'Enter', label: 'ENTER', width: 62 }
  ],
  // Row 5: Modifiers and Space
  [
    { code: 'ShiftLeft', label: 'SHIFT', width: 66 },
    { code: 'KeyZ', label: 'Z', width: 34 },
    { code: 'KeyX', label: 'X', width: 34 },
    { code: 'KeyC', label: 'C', width: 34 },
    { code: 'KeyV', label: 'V', width: 34 },
    { code: 'KeyB', label: 'B', width: 34 },
    { code: 'Space', label: 'SPACEBAR', width: 148 },
    { code: 'ShiftRight', label: 'SHIFT', width: 60 }
  ]
];

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(plate, capGrey, redEsc, purpleWasd, legends) {
  const rowsHtml = KEY_ROWS.map(row => {
    const keysHtml = row.map(k => {
      if (k.code === 'Spacer') {
        return `<div style="width:${k.width}px; flex-shrink:0;"></div>`;
      }

      let capColor = capGrey;
      if (k.type === 'esc') capColor = redEsc;
      if (k.type === 'wasd') capColor = purpleWasd;

      return `
        <div
          class="mk-key"
          id="mk-${k.code}"
          data-key="${k.code}"
          style="width:${k.width}px; background:${capColor}; color:${legends};"
          role="button"
          tabindex="0"
          aria-label="Key ${k.label}"
        >
          <div class="mk-key-cap">
            ${k.sub ? `<span class="mk-sub-legend">${k.sub}</span>` : ''}
            <span class="mk-main-legend">${k.label}</span>
          </div>
        </div>
      `;
    }).join('');

    return `<div class="mk-row">${keysHtml}</div>`;
  }).join('');

  return `
    <style>
      .mk-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .mk-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
        align-items: baseline;
      }
      .mk-sync-indicator {
        font-family: var(--font-mono);
        font-size: .625rem;
        color: #00D18F;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .mk-sync-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #00D18F;
        box-shadow: 0 0 6px #00D18F;
      }

      /* Keyboard Chassis */
      .mk-chassis {
        background: ${plate};
        border: 4px solid #141416;
        border-radius: 12px;
        padding: 20px 24px;
        box-shadow: 0 16px 36px rgba(0,0,0,.6), inset 0 2px 4px rgba(255,255,255,.08);
        display: flex;
        flex-direction: column;
        gap: 8px;
        overflow-x: auto;
      }

      /* Top Hardware Indicator Bar */
      .mk-indicator-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255,255,255,.06);
        margin-bottom: 6px;
      }
      .mk-brand-badge {
        font-family: var(--font-mono);
        font-size: .625rem;
        font-weight: 700;
        letter-spacing: .15em;
        color: rgba(255,255,255,.4);
      }
      .mk-led-group {
        display: flex;
        gap: 16px;
        align-items: center;
      }
      .mk-led-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-family: var(--font-mono);
        font-size: .5rem;
        letter-spacing: .1em;
        color: rgba(255,255,255,.4);
      }
      .mk-led-bulb {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #333;
        transition: all .15s;
      }
      .mk-led-bulb.is-lit {
        background: #00D18F;
        box-shadow: 0 0 8px #00D18F;
      }

      /* Row of Keys */
      .mk-row {
        display: flex;
        gap: 6px;
        align-items: center;
      }

      /* Individual Keycap (Skeuomorphic switch travel) */
      .mk-key {
        height: 38px;
        border-radius: 5px;
        position: relative;
        cursor: pointer;
        outline: none;
        box-shadow: 0 4px 0 #121214, 0 5px 6px rgba(0,0,0,.45);
        transform: translateY(0);
        transition: transform .06s ease, box-shadow .06s ease, filter .1s;
        flex-shrink: 0;
      }
      .mk-key:hover {
        filter: brightness(1.12);
        transform: translateY(-1px);
        box-shadow: 0 5px 0 #121214, 0 6px 8px rgba(0,0,0,.5);
      }
      /* Actuation State: physically pressed down */
      .mk-key.is-pressed {
        transform: translateY(3px) !important;
        box-shadow: 0 1px 0 #121214, 0 2px 3px rgba(0,0,0,.3) !important;
        filter: brightness(1.25) !important;
      }

      .mk-key-cap {
        width: 100%;
        height: 100%;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,.12);
        box-shadow: inset 0 1px 0 rgba(255,255,255,.2);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 1px;
        box-sizing: border-box;
      }
      .mk-sub-legend {
        font-size: .4375rem;
        opacity: .6;
        line-height: 1;
      }
      .mk-main-legend {
        font-family: var(--font-mono);
        font-size: .625rem;
        font-weight: 700;
        letter-spacing: .05em;
        line-height: 1;
      }

      /* Keystroke Live Log */
      .mk-terminal-readout {
        background: #141416;
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 6px;
        padding: 10px 14px;
        margin-top: 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .mk-typed-stream {
        font-family: var(--font-mono);
        font-size: .8125rem;
        color: #F2F2F0;
        letter-spacing: .06em;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .mk-btn-clear {
        background: transparent;
        border: 1px solid rgba(255,255,255,.15);
        border-radius: 3px;
        color: rgba(255,255,255,.6);
        font-family: var(--font-mono);
        font-size: .5625rem;
        padding: 3px 8px;
        cursor: pointer;
        transition: all .12s;
        flex-shrink: 0;
      }
      .mk-btn-clear:hover {
        border-color: #fff;
        color: #fff;
      }

      .mk-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 12px;
        font-style: italic;
      }
    </style>

    <div class="mk-scene">
      <div class="mk-label">
        <span>Interactive Metaphor Preview — Mechanical Keyboard Bidirectional Sync</span>
        <div class="mk-sync-indicator">
          <div class="mk-sync-dot"></div>
          <span>LIVE HARDWARE LISTENER</span>
        </div>
      </div>

      <div class="mk-chassis" id="mk-chassis">
        <div class="mk-indicator-bar">
          <div class="mk-brand-badge">FILCO MAJESTOUCH // TKL SKEUOMORPH</div>
          <div class="mk-led-group">
            <div class="mk-led-item">
              <div class="mk-led-bulb" id="mk-led-caps"></div>
              <span>CAPS LOCK</span>
            </div>
            <div class="mk-led-item">
              <div class="mk-led-bulb is-lit" id="mk-led-pwr"></div>
              <span>PWR</span>
            </div>
          </div>
        </div>

        ${rowsHtml}
      </div>

      <!-- Live Keystroke Monitor -->
      <div class="mk-terminal-readout">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-family:var(--font-mono); font-size:.625rem; color:${purpleWasd}; font-weight:800;">BUFFER &gt;</span>
          <span class="mk-typed-stream" id="mk-stream">TYPE ON YOUR KEYBOARD TO ACTUATE SWITCHES...</span>
        </div>
        <button class="mk-btn-clear" id="mk-clear">CLEAR BUFFER</button>
      </div>

      <div class="mk-hint">
        ↑ Type directly on your physical keyboard to actuate onscreen keys · Click keycaps or drag across for piano sweep
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, plate, capGrey, redEsc, purpleWasd, legends) {
  const chassis  = stageEl.querySelector('#mk-chassis');
  const stream   = stageEl.querySelector('#mk-stream');
  const btnClear = stageEl.querySelector('#mk-clear');
  const ledCaps  = stageEl.querySelector('#mk-led-caps');

  let typedText = '';

  function pressKey(code, char) {
    const keyEl = stageEl.querySelector(`#mk-${code}`);
    if (keyEl) {
      keyEl.classList.add('is-pressed');
    }

    if (code === 'Backspace') {
      typedText = typedText.slice(0, -1);
    } else if (code === 'Space') {
      typedText += ' ';
    } else if (code === 'Enter') {
      typedText += ' ↵ ';
    } else if (char && char.length === 1) {
      typedText += char.toUpperCase();
    }

    if (stream) {
      stream.textContent = typedText || 'AWAITING KEYSTROKES...';
    }
  }

  function releaseKey(code) {
    const keyEl = stageEl.querySelector(`#mk-${code}`);
    if (keyEl) {
      keyEl.classList.remove('is-pressed');
    }
  }

  // 1. Bidirectional Physical Keyboard Listeners
  function handleKeyDown(e) {
    // Check Caps Lock state
    if (e.getModifierState && ledCaps) {
      ledCaps.classList.toggle('is-lit', e.getModifierState('CapsLock'));
    }

    pressKey(e.code, e.key);
  }

  function handleKeyUp(e) {
    if (e.getModifierState && ledCaps) {
      ledCaps.classList.toggle('is-lit', e.getModifierState('CapsLock'));
    }

    releaseKey(e.code);
  }

  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);

  // 2. Onscreen Pointer Interaction (Click and Glissando Drag)
  let isGlissando = false;

  chassis?.addEventListener('pointerdown', e => {
    const key = e.target.closest('.mk-key');
    if (!key) return;
    isGlissando = true;
    const code = key.dataset.key;
    const char = key.querySelector('.mk-main-legend')?.textContent;
    pressKey(code, char);
  });

  chassis?.addEventListener('pointerover', e => {
    if (!isGlissando) return;
    const key = e.target.closest('.mk-key');
    if (!key) return;
    const code = key.dataset.key;
    const char = key.querySelector('.mk-main-legend')?.textContent;
    pressKey(code, char);
    setTimeout(() => releaseKey(code), 120);
  });

  window.addEventListener('pointerup', () => {
    if (isGlissando) {
      isGlissando = false;
      stageEl.querySelectorAll('.mk-key.is-pressed').forEach(k => k.classList.remove('is-pressed'));
    }
  });

  // Clear button
  btnClear?.addEventListener('click', () => {
    typedText = '';
    if (stream) stream.textContent = 'BUFFER CLEARED.';
  });
}

