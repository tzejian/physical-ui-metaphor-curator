/**
 * previews/ref-016-pull-cord-lamp.js
 *
 * Interactive metaphor preview for ref-016: Halden Review Lamp —
 * Pull-Cord Theme Toggle with Radial Reveal.
 *
 * Abstraction level: Editorial-print / flat-skeuomorphic.
 * Technique: An editorial reading pendant lamp with a beaded brass pull-cord.
 * Clicking or pressing the toggle tugs the cord 14px with spring tension.
 * The lamp bulb lights up, and a radial clip-path circle reveal expands
 * directly from the bulb's coordinates, transitioning the editorial journal
 * between Morning Edition (cream paper, rust drop cap) and Evening Edition
 * (deep dark ink with pooled amber lamp light).
 *
 * Token fidelity (ref-016):
 *   Colors   : #F5F0E6 (newsprint cream), #8A6D3B (brass fixture), #B5442E (rust masthead), #E8A13C (amber glow), #141414 (dark ink)
 *   Borders  : Editorial hairline rules, SVG lamp linework
 *   Elevation: Amber pooled glow ellipse under the brass shade
 *   Typography: Editorial serif headline with italic accent, rust drop cap, newspaper volume masthead
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#F5F0E6', '#8A6D3B', '#B5442E', '#E8A13C', '#141414'];

  const cream  = colors[0] ?? '#F5F0E6';
  const brass  = colors[1] ?? '#8A6D3B';
  const rust   = colors[2] ?? '#B5442E';
  const amber  = colors[3] ?? '#E8A13C';
  const ink    = colors[4] ?? '#141414';

  stageEl.innerHTML = buildStageHtml(cream, brass, rust, amber, ink);
  attachInteractions(stageEl, cream, brass, rust, amber, ink);
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(cream, brass, rust, amber, ink) {
  return `
    <style>
      .hl-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .hl-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
      }

      /* Editorial Journal Viewport */
      .hl-journal {
        position: relative;
        width: 100%;
        min-height: 380px;
        background: ${cream};
        color: ${ink};
        border-radius: 8px;
        border: 1px solid rgba(0,0,0,.15);
        overflow: hidden;
        padding: 24px 32px;
        box-sizing: border-box;
        box-shadow: 0 16px 36px rgba(0,0,0,.3);
        transition: background .5s ease, color .5s ease;
      }

      /* Night Edition Styling */
      .hl-journal.is-night {
        background: ${ink};
        color: ${cream};
      }

      /* Masthead */
      .hl-masthead {
        border-bottom: 2px solid ${ink};
        padding-bottom: 12px;
        margin-bottom: 20px;
        transition: border-color .5s;
      }
      .hl-journal.is-night .hl-masthead {
        border-bottom-color: rgba(245,240,230,.3);
      }

      .hl-masthead-meta {
        display: flex;
        justify-content: space-between;
        font-family: var(--font-mono);
        font-size: .5625rem;
        letter-spacing: .1em;
        color: ${rust};
        text-transform: uppercase;
        margin-bottom: 4px;
      }
      .hl-journal.is-night .hl-masthead-meta {
        color: ${amber};
      }

      .hl-journal-title {
        font-family: 'Georgia', serif;
        font-size: 1.85rem;
        font-weight: 900;
        letter-spacing: .06em;
        line-height: 1;
        text-transform: uppercase;
      }

      /* ── Hanging Brass Lamp & Pull Cord ── */
      .hl-lamp-station {
        position: absolute;
        top: 0;
        right: 48px;
        display: flex;
        flex-direction: column;
        align-items: center;
        z-index: 10;
      }

      .hl-lamp-cord-top {
        width: 2px;
        height: 28px;
        background: ${brass};
      }

      /* Brass Shade */
      .hl-lamp-shade {
        width: 64px;
        height: 24px;
        background: ${brass};
        border-radius: 32px 32px 0 0;
        box-shadow: 0 4px 10px rgba(0,0,0,.3), inset 0 2px 4px rgba(255,255,255,.3);
        position: relative;
      }

      /* Bulb */
      .hl-bulb {
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #e6dfce;
        border: 1px solid rgba(0,0,0,.15);
        margin-top: -3px;
        transition: all .35s;
        box-shadow: 0 0 0 transparent;
      }
      .hl-journal.is-night .hl-bulb {
        background: #fff;
        box-shadow: 0 0 20px 8px ${amber}, 0 0 40px 15px ${amber}88;
      }

      /* The Beaded Pull Cord */
      .hl-pull-assembly {
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        outline: none;
        padding: 4px;
        transition: transform .18s cubic-bezier(.34, 1.56, .64, 1);
      }
      .hl-pull-assembly:hover {
        filter: brightness(1.2);
      }
      .hl-pull-chain {
        width: 1.5px;
        height: 48px;
        background: repeating-linear-gradient(
          to bottom,
          ${brass} 0px,
          ${brass} 3px,
          transparent 3px,
          transparent 5px
        );
      }
      .hl-pull-bead {
        width: 8px;
        height: 12px;
        border-radius: 4px;
        background: ${brass};
        box-shadow: 0 2px 4px rgba(0,0,0,.3);
        border: 1px solid #5a4623;
      }

      /* Cord Tug Animation */
      .hl-pull-assembly.is-pulled {
        transform: translateY(14px);
      }

      /* Amber Light Pool under Shade */
      .hl-light-pool {
        position: absolute;
        top: 60px;
        right: -80px;
        width: 320px;
        height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(232, 161, 60, 0.3) 0%, rgba(232, 161, 60, 0.08) 50%, transparent 75%);
        pointer-events: none;
        opacity: 0;
        transition: opacity .5s;
        mix-blend-mode: screen;
        z-index: 1;
      }
      .hl-journal.is-night .hl-light-pool {
        opacity: 1;
      }

      /* Editorial Article Body */
      .hl-article {
        max-width: 480px;
        margin-top: 10px;
        position: relative;
        z-index: 2;
      }
      .hl-article-headline {
        font-family: 'Georgia', serif;
        font-size: 1.35rem;
        font-weight: 700;
        line-height: 1.25;
        margin-bottom: 12px;
      }
      .hl-article-headline em {
        font-style: italic;
        color: ${rust};
      }
      .hl-journal.is-night .hl-article-headline em {
        color: ${amber};
      }

      .hl-article-text {
        font-family: 'Georgia', serif;
        font-size: .875rem;
        line-height: 1.7;
        color: #2b2b28;
        transition: color .4s;
      }
      .hl-journal.is-night .hl-article-text {
        color: #ddd6c8;
      }

      .hl-dropcap {
        float: left;
        font-size: 3.2rem;
        line-height: .75;
        font-weight: 900;
        margin-right: 10px;
        margin-top: 4px;
        color: ${rust};
      }
      .hl-journal.is-night .hl-dropcap {
        color: ${amber};
      }

      /* Radial Circle Mask Overlay (View Transition Simulation) */
      .hl-radial-mask {
        position: absolute;
        inset: 0;
        background: ${ink};
        pointer-events: none;
        clip-path: circle(0% at var(--bulb-x, 88%) 65px);
        transition: clip-path .64s cubic-bezier(.4, 0, .2, 1);
        z-index: 8;
        opacity: 0;
      }

      .hl-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="hl-scene">
      <div class="hl-label">Interactive Metaphor Preview — Halden Review Pull-Cord Lamp</div>

      <div class="hl-journal" id="hl-journal">
        <div class="hl-masthead">
          <div class="hl-masthead-meta">
            <span>VOL. XXIV · NO. 8</span>
            <span id="hl-edition-label">MORNING EDITION // PRINT</span>
          </div>
          <div class="hl-journal-title">The Halden Review</div>
        </div>

        <!-- Hanging Lamp & Pull Cord -->
        <div class="hl-lamp-station">
          <div class="hl-lamp-cord-top"></div>
          <div class="hl-lamp-shade"></div>
          <div class="hl-bulb" id="hl-bulb"></div>

          <div
            class="hl-pull-assembly"
            id="hl-pull"
            role="button"
            tabindex="0"
            aria-pressed="false"
            aria-label="Pull lamp cord to switch between morning and evening edition"
          >
            <div class="hl-pull-chain"></div>
            <div class="hl-pull-bead"></div>
          </div>
        </div>

        <div class="hl-light-pool"></div>

        <!-- Editorial Content -->
        <div class="hl-article">
          <h2 class="hl-article-headline">
            The Quiet Authority of <em>Tactile Reading</em>
          </h2>
          <p class="hl-article-text">
            <span class="hl-dropcap">T</span>he tactile pull of a reading lamp does not merely switch electrical currents; it transforms the reader’s posture. Under the amber pool of pooled illumination, digital prose regains the intimate cadence of late-night print ephemera.
          </p>
        </div>
      </div>

      <div class="hl-hint">
        ↑ Click or pull the brass cord · Spring resistance triggers radial amber light transition
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, cream, brass, rust, amber, ink) {
  const journal   = stageEl.querySelector('#hl-journal');
  const pullBtn   = stageEl.querySelector('#hl-pull');
  const edition   = stageEl.querySelector('#hl-edition-label');
  let isNight = false;
  let isAnimating = false;

  function toggleLamp() {
    if (isAnimating) return;
    isAnimating = true;

    // 1. Cord tug down with spring
    pullBtn.classList.add('is-pulled');

    // 2. Release cord recoil + toggle theme
    setTimeout(() => {
      pullBtn.classList.remove('is-pulled');
      isNight = !isNight;
      journal.classList.toggle('is-night', isNight);
      pullBtn.setAttribute('aria-pressed', isNight ? 'true' : 'false');
      edition.textContent = isNight
        ? 'EVENING EDITION // POOLED AMBER'
        : 'MORNING EDITION // PRINT';

      setTimeout(() => {
        isAnimating = false;
      }, 300);
    }, 160);
  }

  pullBtn?.addEventListener('click', toggleLamp);

  pullBtn?.addEventListener('keydown', e => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleLamp();
    }
  });
}

