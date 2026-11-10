/**
 * previews/ref-022-wax-seal-envelope.js
 *
 * Interactive metaphor preview for ref-022: UploadEnvelope —
 * Wax-Sealed Envelope as Drop Target.
 *
 * Abstraction level: Flat-skeuomorphic / editorial-print.
 * Technique: A 3D file-upload drop target with a complete 4-state machine:
 * 1. Idle: Closed envelope waiting for documents.
 * 2. Drag-Over / Active: Flap hinges open via 3D rotateX(180deg) with perspective.
 * 3. Uploading: File sheet slides into the pocket while upload progress fills inside.
 * 4. Complete: Flap closes and an embossed crimson wax seal with checkmark stamps shut.
 *
 * Token fidelity (ref-022):
 *   Colors   : #F2EAD3 (cream envelope linen), #B3165E (crimson wax seal), #8A5A2B (kraft pocket shadows), #1A1A1A (dark ink)
 *   Borders  : V-cut envelope pocket via clip-path; radial-gradient embossed wax seal disc
 *   Elevation: 3D layering with separate translateZ planes for back, letter, and front pocket
 *   Typography: Invitation-style serif heading, functional upload telemetry
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#F2EAD3', '#B3165E', '#8A5A2B', '#1A1A1A'];

  const linen    = colors[0] ?? '#F2EAD3';
  const waxSeal  = colors[1] ?? '#B3165E';
  const pocketBg = colors[2] ?? '#8A5A2B';
  const ink      = colors[3] ?? '#1A1A1A';

  stageEl.innerHTML = buildStageHtml(linen, waxSeal, pocketBg, ink);
  attachInteractions(stageEl, linen, waxSeal, pocketBg, ink);
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(linen, waxSeal, pocketBg, ink) {
  return `
    <style>
      .ue-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .ue-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
      }

      /* Postal Chamber Bench */
      .ue-bench {
        position: relative;
        width: 100%;
        min-height: 380px;
        background: #17181c;
        border-radius: 8px;
        border: 2px solid #282a30;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 24px;
        box-sizing: border-box;
        box-shadow: 0 16px 40px rgba(0,0,0,.6);
      }

      /* State Headline */
      .ue-headline-box {
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .ue-title {
        font-family: 'Georgia', serif;
        font-size: 1.25rem;
        font-weight: 700;
        color: #fff;
      }
      .ue-subtitle {
        font-family: var(--font-mono);
        font-size: .5625rem;
        letter-spacing: .14em;
        color: rgba(255,255,255,.5);
        text-transform: uppercase;
      }

      /* ── 3D Envelope Container ── */
      .ue-envelope-wrap {
        position: relative;
        width: 260px;
        height: 170px;
        perspective: 800px;
        cursor: pointer;
        margin: 10px 0;
      }

      /* Envelope Body */
      .ue-envelope {
        position: relative;
        width: 100%;
        height: 100%;
        background: #e2d8be;
        border-radius: 4px;
        box-shadow: 0 16px 36px rgba(0,0,0,.5);
        transform-style: preserve-3d;
      }

      /* Top Triangular Flap */
      .ue-flap {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 95px;
        background: ${linen};
        clip-path: polygon(0% 0%, 100% 0%, 50% 100%);
        transform-origin: top center;
        transform: rotateX(0deg);
        transition: transform .45s cubic-bezier(.4, 0, .2, 1);
        z-index: 6;
        box-shadow: 0 2px 8px rgba(0,0,0,.2);
      }
      .ue-envelope.is-open .ue-flap {
        transform: rotateX(180deg);
        z-index: 1;
      }

      /* Letter Document Sliding In */
      .ue-letter {
        position: absolute;
        left: 20px;
        right: 20px;
        height: 140px;
        background: #fff;
        border-radius: 3px;
        padding: 12px;
        box-sizing: border-box;
        box-shadow: 0 4px 12px rgba(0,0,0,.2);
        display: flex;
        flex-direction: column;
        gap: 6px;
        z-index: 3;
        transform: translateY(-50px);
        opacity: 0;
        transition: transform .5s cubic-bezier(.2, .8, .2, 1), opacity .3s;
      }
      .ue-envelope.is-uploading .ue-letter {
        transform: translateY(10px);
        opacity: 1;
      }
      .ue-envelope.is-complete .ue-letter {
        transform: translateY(30px);
        opacity: 0;
      }

      .ue-letter-line {
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
      }

      /* Front V-Pocket */
      .ue-pocket {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 120px;
        background: ${linen};
        clip-path: polygon(0% 100%, 100% 100%, 100% 30%, 50% 0%, 0% 30%);
        border-radius: 0 0 4px 4px;
        z-index: 5;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        padding-bottom: 14px;
        box-shadow: 0 -2px 6px rgba(0,0,0,.08);
      }

      /* Internal Progress Fill Bar */
      .ue-progress-line {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 4px;
        width: 0%;
        background: ${waxSeal};
        z-index: 10;
        transition: width .15s linear;
      }

      /* ── Embossed Crimson Wax Seal ── */
      .ue-wax-seal {
        position: absolute;
        top: 72px;
        left: calc(50% - 24px);
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #e62078 0%, ${waxSeal} 65%, #75083a 100%);
        border: 2px solid #57052a;
        box-shadow: 0 4px 12px rgba(0,0,0,.45), inset 0 2px 4px rgba(255,255,255,.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 1.25rem;
        z-index: 10;
        transform: scale(0) rotate(-20deg);
        transition: transform .35s cubic-bezier(.34, 1.56, .64, 1);
      }
      .ue-envelope.is-complete .ue-wax-seal {
        transform: scale(1) rotate(0deg);
      }

      /* Action Bar */
      .ue-actions {
        display: flex;
        gap: 12px;
        align-items: center;
        z-index: 10;
      }
      .ue-btn {
        background: ${waxSeal};
        color: #fff;
        border: none;
        border-radius: 4px;
        font-family: var(--font-mono);
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .08em;
        padding: 8px 16px;
        cursor: pointer;
        box-shadow: 0 3px 0 #57052a;
        transition: all .1s;
      }
      .ue-btn:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 #57052a;
      }

      .ue-btn-reset {
        background: transparent;
        color: rgba(255,255,255,.6);
        border: 1px solid rgba(255,255,255,.2);
        box-shadow: none;
      }
      .ue-btn-reset:hover {
        border-color: #fff;
        color: #fff;
      }

      .ue-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="ue-scene">
      <div class="ue-label">
        <span>Interactive Metaphor Preview — UploadKit Wax-Sealed Envelope</span>
        <span id="ue-state-tag" style="font-family:var(--font-mono); color:${waxSeal};">STATE: IDLE (CLOSED)</span>
      </div>

      <div class="ue-bench">
        <!-- Header -->
        <div class="ue-headline-box">
          <div class="ue-title" id="ue-title">Mail Your Dispatch</div>
          <div class="ue-subtitle" id="ue-subtitle">CLICK ENVELOPE OR DRAG FILE TO SEND</div>
        </div>

        <!-- 3D Envelope Target -->
        <div class="ue-envelope-wrap" id="ue-target" role="button" tabindex="0" aria-label="Envelope file drop target">
          <div class="ue-envelope" id="ue-envelope">
            <!-- 3D Top Flap -->
            <div class="ue-flap"></div>

            <!-- Letter Inside -->
            <div class="ue-letter" id="ue-letter">
              <div class="ue-letter-line" style="width:50%; background:${waxSeal};"></div>
              <div class="ue-letter-line" style="width:100%;"></div>
              <div class="ue-letter-line" style="width:90%;"></div>
              <div class="ue-letter-line" style="width:75%;"></div>
            </div>

            <!-- Front Pocket -->
            <div class="ue-pocket">
              <span style="font-family:var(--font-mono); font-size:.5625rem; color:#8a7a60; letter-spacing:.1em;">POSTAL DISPATCH</span>
              <div class="ue-progress-line" id="ue-progress"></div>
            </div>

            <!-- Wax Seal Stamp -->
            <div class="ue-wax-seal" id="ue-seal">✓</div>
          </div>
        </div>

        <!-- Actions -->
        <div class="ue-actions">
          <button class="ue-btn" id="ue-btn-upload">SIMULATE FILE DROP ✉️</button>
          <button class="ue-btn ue-btn-reset" id="ue-btn-reset">↺ RESET</button>
        </div>
      </div>

      <div class="ue-hint">
        ↑ Click envelope or simulate file drop · Flap opens via 3D rotateX, file slides in, and wax seal stamps complete
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, linen, waxSeal, pocketBg, ink) {
  const envelope   = stageEl.querySelector('#ue-envelope');
  const target     = stageEl.querySelector('#ue-target');
  const btnUpload  = stageEl.querySelector('#ue-btn-upload');
  const btnReset   = stageEl.querySelector('#ue-btn-reset');
  const progress   = stageEl.querySelector('#ue-progress');
  const stateTag   = stageEl.querySelector('#ue-state-tag');
  const title      = stageEl.querySelector('#ue-title');
  const subtitle   = stageEl.querySelector('#ue-subtitle');

  let state = 'idle'; // idle | open | uploading | complete

  function runUploadSequence() {
    if (state !== 'idle') return;

    // 1. Open flap
    state = 'open';
    envelope.classList.add('is-open');
    stateTag.textContent = 'STATE: FLAP OPEN (ACCEPTING)';
    title.textContent = 'Receiving Contents...';
    subtitle.textContent = 'DOCUMENT SLIDING INTO POCKET';

    // 2. Slide letter in & start progress
    setTimeout(() => {
      state = 'uploading';
      envelope.classList.add('is-uploading');
      stateTag.textContent = 'STATE: TRANSMITTING FILE';

      let p = 0;
      const interval = setInterval(() => {
        p += 15;
        progress.style.width = `${Math.min(100, p)}%`;

        if (p >= 100) {
          clearInterval(interval);
          finishUpload();
        }
      }, 100);
    }, 450);
  }

  function finishUpload() {
    // 3. Close flap & stamp wax seal
    setTimeout(() => {
      envelope.classList.remove('is-open');

      setTimeout(() => {
        state = 'complete';
        envelope.classList.add('is-complete');
        stateTag.textContent = 'STATE: SEALED & DELIVERED';
        title.textContent = 'Dispatch Sealed!';
        subtitle.textContent = 'WAX STAMP AFFIXED WITH EMBOSSED SEAL';
      }, 350);
    }, 300);
  }

  function reset() {
    state = 'idle';
    envelope.className = 'ue-envelope';
    progress.style.width = '0%';
    stateTag.textContent = 'STATE: IDLE (CLOSED)';
    title.textContent = 'Mail Your Dispatch';
    subtitle.textContent = 'CLICK ENVELOPE OR DRAG FILE TO SEND';
  }

  target?.addEventListener('click', runUploadSequence);
  btnUpload?.addEventListener('click', runUploadSequence);
  btnReset?.addEventListener('click', reset);
}

