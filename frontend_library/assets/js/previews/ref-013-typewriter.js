/**
 * previews/ref-013-typewriter.js
 *
 * Interactive metaphor preview for ref-013: Yannick Gregoire Portfolio —
 * Typewriter & Command Line Grid.
 *
 * Abstraction level: Monospace-editorial / Swiss-minimalist.
 * Technique: A fixed-pitch 16-character unit grid where layout, typography,
 * and interactions mirror typewriter mechanics and a command-line terminal.
 * Includes a typewriter-reveal text engine, interactive command prompt,
 * and a canvas mapping pixel matrices into ASCII-art glyphs ('x/c=;+,.').
 *
 * Token fidelity (ref-013):
 *   Colors   : #111111 (ink black), #EDEDE6 (parchment white), #FF3D1F (accent red)
 *   Borders  : No borders — layout carried entirely by monospace spatial alignment
 *   Elevation: Completely flat 2D; hierarchy purely typographic
 *   Typography: Monospace fixed-pitch 16-char unit system, character-by-character reveal
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#111111', '#EDEDE6', '#FF3D1F'];

  const ink    = colors[0] ?? '#111111';
  const paper  = colors[1] ?? '#EDEDE6';
  const accent = colors[2] ?? '#FF3D1F';

  stageEl.innerHTML = buildStageHtml(ink, paper, accent);
  attachInteractions(stageEl, ink, paper, accent);
}

// ── Sample Editorial Snippets (Multiples of 16 Characters) ───────────────────

const SNIPPETS = [
  {
    title: 'ARCHITECTURE.SYS',
    body: 'EVERY COMPONENT OCCUPIES A STRICT MULTIPLICATION OF 16 CHARACTERS. THIS CREATES A DIGITAL HARMONY DERIVED DIRECTLY FROM MECHANICAL TYPEWRITER CARRIAGE PITCH.'
  },
  {
    title: 'SWISS_EDITORIAL',
    body: 'UNCOMPROMISING ASYMMETRICAL BALANCE. NO BORDERS OR SHADOWS: WHITESPACE AND ALIGNMENT FORM ALL STRUCTURAL BOUNDARIES.'
  },
  {
    title: 'ASCII_BOOT_0202',
    body: 'VIDEO RAYS CONVERTED INTO ASCII CHARACTERS FROM DARK TO LIGHT: X/C=;+,. GIVING COMMAND-LINE TEXTURE TO DYNAMIC MOTION.'
  }
];

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(ink, paper, accent) {
  return `
    <style>
      .tw-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-mono);
        color: ${ink};
        background: ${paper};
        border-radius: 8px;
        padding: 24px;
        box-sizing: border-box;
        user-select: none;
      }
      .tw-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: ${accent};
        margin-bottom: 16px;
      }

      /* 16-Char Grid Header */
      .tw-grid-header {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding-bottom: 10px;
        border-bottom: 1px dashed rgba(17,17,17,.25);
        font-size: .6875rem;
        letter-spacing: .06em;
      }
      .tw-grid-col-guide {
        color: rgba(17,17,17,.4);
      }

      /* Main Stage Grid: Text Engine + ASCII Canvas */
      .tw-stage-body {
        display: grid;
        grid-template-columns: 1fr;
        gap: 24px;
        margin: 20px 0;
      }
      @media (min-width: 640px) {
        .tw-stage-body {
          grid-template-columns: 1.2fr .8fr;
        }
      }

      /* Typewriter Display Area */
      .tw-type-area {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .tw-type-heading {
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: .08em;
        min-height: 1.5em;
        display: flex;
        align-items: center;
      }
      .tw-cursor {
        display: inline-block;
        width: .55em;
        height: 1.1em;
        background: ${accent};
        margin-left: 4px;
        animation: tw-blink .75s infinite steps(1);
        vertical-align: middle;
      }
      @keyframes tw-blink {
        50% { opacity: 0; }
      }

      .tw-type-body {
        font-size: .8125rem;
        line-height: 1.7;
        letter-spacing: .02em;
        min-height: 90px;
        color: #222;
      }

      /* Interactive Input Prompt */
      .tw-prompt-box {
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(17,17,17,.05);
        padding: 8px 12px;
        border-radius: 4px;
        margin-top: 10px;
      }
      .tw-prompt-prefix {
        color: ${accent};
        font-weight: 700;
        font-size: .75rem;
      }
      .tw-prompt-input {
        flex: 1;
        background: transparent;
        border: none;
        outline: none;
        font-family: var(--font-mono);
        font-size: .75rem;
        color: ${ink};
        letter-spacing: .04em;
      }
      .tw-prompt-input::placeholder {
        color: rgba(17,17,17,.35);
      }

      /* ASCII Art Generator Area */
      .tw-ascii-panel {
        display: flex;
        flex-direction: column;
        align-items: center;
        background: ${ink};
        color: ${paper};
        padding: 14px;
        border-radius: 6px;
        gap: 10px;
      }
      .tw-ascii-title {
        font-size: .5625rem;
        letter-spacing: .16em;
        color: ${accent};
        align-self: flex-start;
      }
      .tw-ascii-canvas {
        font-size: .55rem;
        line-height: .95;
        letter-spacing: .15em;
        white-space: pre;
        color: ${paper};
        font-weight: 700;
        min-height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Controls */
      .tw-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
        padding-top: 12px;
        border-top: 1px dashed rgba(17,17,17,.25);
      }
      .tw-btn-group {
        display: flex;
        gap: 6px;
      }
      .tw-btn {
        background: transparent;
        border: 1px solid ${ink};
        color: ${ink};
        font-family: var(--font-mono);
        font-size: .625rem;
        font-weight: 700;
        padding: 4px 10px;
        cursor: pointer;
        transition: all .12s;
        border-radius: 2px;
      }
      .tw-btn:hover {
        background: ${ink};
        color: ${paper};
      }
      .tw-btn.is-active {
        background: ${accent};
        border-color: ${accent};
        color: #fff;
      }

      .tw-hint {
        font-size: .6875rem;
        color: rgba(17,17,17,.6);
        font-style: italic;
      }
    </style>

    <div class="tw-scene">
      <div class="tw-label">Interactive Metaphor Preview — Typewriter &amp; Monospace Grid</div>

      <div class="tw-grid-header">
        <div>GRID_UNIT = 16_CH // YANNICK_GREGOIRE</div>
        <div class="tw-grid-col-guide">0123456789ABCDEF</div>
      </div>

      <div class="tw-stage-body">
        <!-- Typewriter Text Output Engine -->
        <div class="tw-type-area">
          <div class="tw-type-heading">
            <span id="tw-heading-target"></span><span class="tw-cursor"></span>
          </div>
          <div class="tw-type-body" id="tw-body-target"></div>

          <!-- Live Typing Prompt -->
          <div class="tw-prompt-box">
            <span class="tw-prompt-prefix">&gt;</span>
            <input
              type="text"
              class="tw-prompt-input"
              id="tw-user-input"
              placeholder="Type anything to test character pitch..."
              maxlength="48"
              aria-label="Direct typewriter keystroke input"
            />
          </div>
        </div>

        <!-- ASCII Canvas Stream -->
        <div class="tw-ascii-panel">
          <div class="tw-ascii-title">ASCII_RAYS_01 [x/c=;+,.]</div>
          <div class="tw-ascii-canvas" id="tw-ascii-canvas"></div>
        </div>
      </div>

      <div class="tw-actions">
        <div class="tw-btn-group" id="tw-presets">
          <button class="tw-btn is-active" data-idx="0">PROJECT 01</button>
          <button class="tw-btn" data-idx="1">SWISS 02</button>
          <button class="tw-btn" data-idx="2">BOOT 03</button>
        </div>
        <button class="tw-btn" id="tw-btn-replay">↻ REPLAY TYPE</button>
      </div>

      <div class="tw-hint" style="margin-top: 12px;">
        ↑ Click project presets or type directly into prompt · Characters type out with typewriter cadence
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, ink, paper, accent) {
  const headingTarget = stageEl.querySelector('#tw-heading-target');
  const bodyTarget    = stageEl.querySelector('#tw-body-target');
  const asciiCanvas   = stageEl.querySelector('#tw-ascii-canvas');
  const userInput     = stageEl.querySelector('#tw-user-input');
  const presets       = stageEl.querySelector('#tw-presets');
  const btnReplay     = stageEl.querySelector('#tw-btn-replay');

  let currentIdx = 0;
  let typeTimer = null;

  // Typewriter reveal function
  function typeOut(headingText, bodyText) {
    if (typeTimer) clearInterval(typeTimer);

    headingTarget.textContent = '';
    bodyTarget.textContent = '';

    let hPos = 0;
    let bPos = 0;

    // Type heading first
    typeTimer = setInterval(() => {
      if (hPos < headingText.length) {
        headingTarget.textContent += headingText.charAt(hPos);
        hPos++;
      } else if (bPos < bodyText.length) {
        bodyTarget.textContent += bodyText.charAt(bPos);
        bPos++;
      } else {
        clearInterval(typeTimer);
        typeTimer = null;
      }
    }, 24);
  }

  // Load snippet
  function loadSnippet(idx) {
    currentIdx = idx;
    const item = SNIPPETS[idx];
    typeOut(item.title, item.body);

    presets.querySelectorAll('.tw-btn').forEach(btn => {
      btn.classList.toggle('is-active', parseInt(btn.dataset.idx, 10) === idx);
    });
  }

  // Generate ASCII dynamic wave art on canvas
  const ASCII_CHARS = [' ', '.', ',', '+', ';', '=', 'c', 'x', '#'];
  let asciiFrame = 0;

  function renderAscii() {
    const rows = 9;
    const cols = 18;
    let out = '';

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const wave = Math.sin((c / 3) + (asciiFrame * 0.15)) * Math.cos((r / 3) + (asciiFrame * 0.1));
        const norm = (wave + 1) / 2;
        const charIdx = Math.floor(norm * (ASCII_CHARS.length - 1));
        out += ASCII_CHARS[charIdx];
      }
      out += '\n';
    }

    if (asciiCanvas) asciiCanvas.textContent = out;
    asciiFrame++;
  }

  const asciiInterval = setInterval(renderAscii, 120);

  // User direct typing
  userInput?.addEventListener('input', e => {
    if (typeTimer) clearInterval(typeTimer);
    const val = e.target.value.toUpperCase();
    headingTarget.textContent = val || SNIPPETS[currentIdx].title;
    bodyTarget.textContent = val
      ? `CHAR_COUNT: ${val.length} // CELL_OCCUPANCY: ${(val.length / 16).toFixed(2)} UNITS.`
      : SNIPPETS[currentIdx].body;
  });

  // Preset buttons
  presets?.addEventListener('click', e => {
    const btn = e.target.closest('.tw-btn');
    if (btn && btn.dataset.idx !== undefined) {
      if (userInput) userInput.value = '';
      loadSnippet(parseInt(btn.dataset.idx, 10));
    }
  });

  // Replay button
  btnReplay?.addEventListener('click', () => {
    if (userInput) userInput.value = '';
    loadSnippet(currentIdx);
  });

  // Initial display
  loadSnippet(0);
}

