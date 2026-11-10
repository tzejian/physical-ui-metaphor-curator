/**
 * previews/ref-015-day-night-switch.js
 *
 * Interactive metaphor preview for ref-015: ERA Residence —
 * Day-Night Light Switch as Hero Control.
 *
 * Abstraction level: Swiss-minimalist / flat-skeuomorphic.
 * Technique: A short slider toggle ("BY DAY / BY NIGHT") positioned as the primary
 * optical hero control. Moving the switch re-lights the architectural scene:
 * shifting sky gradients from bright azure daylight into twilight navy with
 * illuminated terraces, glowing windows, and warm ambient lanterns.
 *
 * Token fidelity (ref-015):
 *   Colors   : #87B4E0 (sky blue), #F4EFE6 (limestone white), #1F3A5F (dusk navy), #E8A13C (terrace lantern amber), #2A2A28 (charcoal)
 *   Borders  : Hairline letterspaced wordmark, minimal slider track
 *   Elevation: Flat architectural rendering; lighting transitions over shadow tricks
 *   Typography: Letterspaced uppercase caps for switch states, elegant serif headline
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#87B4E0', '#F4EFE6', '#1F3A5F', '#E8A13C', '#2A2A28'];

  const skyBlue   = colors[0] ?? '#87B4E0';
  const limestone = colors[1] ?? '#F4EFE6';
  const duskNavy  = colors[2] ?? '#1F3A5F';
  const amber     = colors[3] ?? '#E8A13C';
  const charcoal  = colors[4] ?? '#2A2A28';

  stageEl.innerHTML = buildStageHtml(skyBlue, limestone, duskNavy, amber, charcoal);
  attachInteractions(stageEl, skyBlue, limestone, duskNavy, amber, charcoal);
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(skyBlue, limestone, duskNavy, amber, charcoal) {
  return `
    <style>
      .er-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .er-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
      }

      /* Hero Stage Container */
      .er-hero {
        position: relative;
        width: 100%;
        min-height: 380px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,.1);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 24px;
        box-sizing: border-box;
        box-shadow: 0 16px 40px rgba(0,0,0,.4);
        transition: background .6s cubic-bezier(.4, 0, .2, 1);
        background: linear-gradient(180deg, ${skyBlue} 0%, #D4E5F7 60%, ${limestone} 100%);
      }
      .er-hero.is-night {
        background: linear-gradient(180deg, #0d1a2d 0%, ${duskNavy} 60%, #152233 100%);
      }

      /* Masthead */
      .er-top-bar {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        position: relative;
        z-index: 5;
      }
      .er-wordmark {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .er-title {
        font-size: 1.125rem;
        font-weight: 800;
        letter-spacing: .24em;
        color: ${charcoal};
        transition: color .5s;
      }
      .er-hero.is-night .er-title {
        color: ${limestone};
      }
      .er-sub {
        font-size: .5625rem;
        font-weight: 700;
        letter-spacing: .18em;
        color: ${charcoal}99;
        transition: color .5s;
      }
      .er-hero.is-night .er-sub {
        color: ${limestone}88;
      }

      /* ── The Hero Day/Night Slider Switch ── */
      .er-switch-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        position: relative;
        z-index: 5;
      }
      .er-switch-track {
        width: 170px;
        height: 34px;
        background: rgba(255,255,255,.45);
        border: 1.5px solid rgba(42,42,40,.2);
        backdrop-filter: blur(8px);
        border-radius: 17px;
        display: flex;
        align-items: center;
        padding: 3px;
        box-sizing: border-box;
        cursor: pointer;
        position: relative;
        transition: all .4s;
      }
      .er-hero.is-night .er-switch-track {
        background: rgba(20,30,45,.75);
        border-color: rgba(232,161,60,.4);
      }

      .er-switch-thumb {
        position: absolute;
        width: 82px;
        height: 26px;
        background: ${charcoal};
        border-radius: 13px;
        left: 4px;
        top: 3px;
        transition: transform .35s cubic-bezier(.34, 1.25, .64, 1), background .4s;
        box-shadow: 0 2px 8px rgba(0,0,0,.25);
      }
      .er-hero.is-night .er-switch-thumb {
        transform: translateX(78px);
        background: ${amber};
      }

      .er-switch-labels {
        width: 100%;
        display: flex;
        justify-content: space-around;
        font-family: var(--font-mono);
        font-size: .5625rem;
        font-weight: 800;
        letter-spacing: .1em;
        position: relative;
        z-index: 2;
        pointer-events: none;
      }
      .er-label-day {
        color: #fff;
        transition: color .3s;
      }
      .er-label-night {
        color: ${charcoal};
        transition: color .3s;
      }
      .er-hero.is-night .er-label-day {
        color: ${limestone}aa;
      }
      .er-hero.is-night .er-label-night {
        color: ${charcoal};
      }

      /* Architectural Terrace Illustration */
      .er-scene-canvas {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 220px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        z-index: 2;
        pointer-events: none;
      }

      /* Terraced Villa Blocks */
      .er-villa {
        position: relative;
        width: 320px;
        height: 180px;
      }
      .er-villa-block {
        position: absolute;
        background: ${limestone};
        border-radius: 2px;
        box-shadow: 0 10px 24px rgba(0,0,0,.15);
        transition: all .6s;
      }
      .er-block-main {
        width: 180px;
        height: 110px;
        left: 30px;
        bottom: 20px;
      }
      .er-block-terrace {
        width: 140px;
        height: 70px;
        right: 10px;
        bottom: 20px;
        background: #ebdcc8;
      }
      .er-block-cantilever {
        width: 120px;
        height: 40px;
        left: 80px;
        bottom: 120px;
        background: ${limestone};
      }

      /* Windows & Glass Sliders */
      .er-window {
        position: absolute;
        background: #a9c7e8;
        border-radius: 1px;
        transition: all .5s;
      }
      .er-win-1 { width: 50px; height: 70px; left: 45px; bottom: 30px; }
      .er-win-2 { width: 60px; height: 50px; right: 25px; bottom: 30px; }
      .er-win-3 { width: 70px; height: 24px; left: 95px; bottom: 128px; }

      /* Night Lighting: Windows illuminate with warm amber radiance */
      .er-hero.is-night .er-villa-block {
        background: #253347;
      }
      .er-hero.is-night .er-block-terrace {
        background: #1c2738;
      }
      .er-hero.is-night .er-window {
        background: ${amber};
        box-shadow: 0 0 24px ${amber}, inset 0 0 8px #fff;
      }

      /* Terrace Lantern Light Pools */
      .er-lantern-pool {
        position: absolute;
        bottom: 16px;
        right: 40px;
        width: 90px;
        height: 35px;
        border-radius: 50%;
        background: radial-gradient(ellipse, rgba(232,161,60,.7) 0%, transparent 70%);
        opacity: 0;
        transition: opacity .6s;
      }
      .er-hero.is-night .er-lantern-pool {
        opacity: 1;
      }

      /* Editorial Headline */
      .er-headline-box {
        position: relative;
        z-index: 5;
        max-width: 380px;
      }
      .er-headline {
        font-family: 'Georgia', serif;
        font-size: 1.35rem;
        font-weight: 700;
        line-height: 1.3;
        color: ${charcoal};
        transition: color .5s;
      }
      .er-hero.is-night .er-headline {
        color: ${limestone};
      }
      .er-headline span {
        font-style: italic;
        color: ${amber};
      }

      .er-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="er-scene">
      <div class="er-label">Interactive Metaphor Preview — ERA Residence Day/Night Switch</div>

      <div class="er-hero" id="er-hero">
        <div class="er-top-bar">
          <div class="er-wordmark">
            <span class="er-title">ERA RESIDENCE</span>
            <span class="er-sub">SECOND HOMES // COSTA BRAVA</span>
          </div>

          <!-- Hero Switch Control -->
          <div class="er-switch-box">
            <div class="er-switch-track" id="er-switch" role="switch" aria-checked="false" tabindex="0" aria-label="Toggle residence day and night lighting">
              <div class="er-switch-thumb"></div>
              <div class="er-switch-labels">
                <span class="er-label-day">BY DAY</span>
                <span class="er-label-night">BY NIGHT</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Architectural Illustration Canvas -->
        <div class="er-scene-canvas">
          <div class="er-villa">
            <div class="er-villa-block er-block-main"></div>
            <div class="er-villa-block er-block-terrace"></div>
            <div class="er-villa-block er-block-cantilever"></div>
            <div class="er-window er-win-1"></div>
            <div class="er-window er-win-2"></div>
            <div class="er-window er-win-3"></div>
            <div class="er-lantern-pool"></div>
          </div>
        </div>

        <!-- Editorial Headline -->
        <div class="er-headline-box">
          <div class="er-headline">
            Buying a second home is <span>buying light</span>.
          </div>
        </div>
      </div>

      <div class="er-hint">
        ↑ Click or toggle switch to re-light the architectural scene between daylight and night illumination
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, skyBlue, limestone, duskNavy, amber, charcoal) {
  const hero   = stageEl.querySelector('#er-hero');
  const sw     = stageEl.querySelector('#er-switch');
  let isNight = false;

  function toggle() {
    isNight = !isNight;
    hero.classList.toggle('is-night', isNight);
    sw.setAttribute('aria-checked', isNight ? 'true' : 'false');
  }

  sw?.addEventListener('click', toggle);

  sw?.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggle();
    }
  });
}

