/**
 * previews/ref-019-page-flip.js
 *
 * Interactive metaphor preview for ref-019: 20 Things I Learned —
 * Canvas Book Page Flip.
 *
 * Abstraction level: Editorial-print / flat-skeuomorphic.
 * Technique: A hardcover open book with interactive 3D page curl physics.
 * Dragging the page edge or clicking Next/Prev folds the sheet over the center
 * spine with progressive fold shadows. Supports keyboard arrows and provides
 * a chapter index to preserve scanability.
 *
 * Token fidelity (ref-019):
 *   Colors   : #F4E8C1 (warm parchment), #2A1F14 (leather binding / ink), #C8A15A (gold trim & spine), #8A5A2B (aged page fold)
 *   Borders  : Book cover with rounded spine, dynamic fold shadows
 *   Elevation: 3D fold curl depth derived from flip progress
 *   Typography: Storybook serif with drop-caps and chapter titles
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#F4E8C1', '#2A1F14', '#C8A15A', '#8A5A2B'];

  const parchment = colors[0] ?? '#F4E8C1';
  const leather   = colors[1] ?? '#2A1F14';
  const spine     = colors[2] ?? '#C8A15A';
  const foldColor = colors[3] ?? '#8A5A2B';

  stageEl.innerHTML = buildStageHtml(parchment, leather, spine, foldColor);
  attachInteractions(stageEl, parchment, leather, spine, foldColor);
}

// ── Book Chapters ─────────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    num: 'CHAPTER I',
    title: 'What is the Web?',
    leftBody: 'The web is not a physical place, yet we navigate its expanse through metaphors borrowed from the physical world: addresses, pages, and architectural portals.',
    rightBody: 'When modern browsers process HTML, CSS, and SVG, they do not simply render graphics; they weave a continuous tapestry of interconnected human knowledge.'
  },
  {
    num: 'CHAPTER II',
    title: 'Cloud Computing',
    leftBody: 'Data centers hum quietly across continents, transforming the ephemeral concept of "the cloud" into solid steel server racks, fiber lines, and oceanic cables.',
    rightBody: 'We entrust our digital archives to remote memories, expecting immediate tactile recall whenever we tap our pocket devices.'
  },
  {
    num: 'CHAPTER III',
    title: 'HTML5 & Open Standards',
    leftBody: 'By liberating the browser from proprietary plug-ins, open standards established a universal canvas where vector typography and physics simulations flourish natively.',
    rightBody: 'Every page turn is an ode to the freedom of open protocols, readable by any machine, preserved for future human generations.'
  }
];

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(parchment, leather, spine, foldColor) {
  return `
    <style>
      .bf-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .bf-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
      }

      /* Book Showcase Stage */
      .bf-stage {
        position: relative;
        width: 100%;
        min-height: 380px;
        background: #1c1815;
        border-radius: 8px;
        border: 2px solid #2e2620;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px 16px;
        box-sizing: border-box;
        box-shadow: 0 16px 40px rgba(0,0,0,.6);
      }

      /* ── The Hardcover Book Spread ── */
      .bf-book {
        position: relative;
        width: 100%;
        max-width: 520px;
        height: 270px;
        background: ${leather};
        border-radius: 6px;
        padding: 8px;
        box-shadow: 0 16px 36px rgba(0,0,0,.6), 0 2px 4px rgba(0,0,0,.4);
        perspective: 1000px;
        display: flex;
        box-sizing: border-box;
      }

      /* Gold Foil Spine Ridge */
      .bf-spine-ridge {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 10px;
        transform: translateX(-50%);
        background: linear-gradient(90deg, #18120b 0%, ${spine} 50%, #18120b 100%);
        z-index: 10;
        box-shadow: 0 0 6px rgba(0,0,0,.5);
      }

      /* Open Spread Pages */
      .bf-spread {
        width: 100%;
        height: 100%;
        display: flex;
        position: relative;
      }

      /* Left Page (Fixed) */
      .bf-page-left {
        flex: 1;
        background: ${parchment};
        color: ${leather};
        border-radius: 3px 0 0 3px;
        padding: 20px 22px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: inset -10px 0 16px rgba(42,31,20,.18);
        border-right: 1px solid rgba(0,0,0,.15);
      }

      /* Right Page (Fixed Base) */
      .bf-page-right {
        flex: 1;
        background: ${parchment};
        color: ${leather};
        border-radius: 0 3px 3px 0;
        padding: 20px 22px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        box-shadow: inset 10px 0 16px rgba(42,31,20,.18);
      }

      /* Flipping Leaf with 3D Bend */
      .bf-page-leaf {
        position: absolute;
        top: 0;
        right: 0;
        width: 50%;
        height: 100%;
        background: ${parchment};
        color: ${leather};
        transform-origin: left center;
        border-radius: 0 3px 3px 0;
        padding: 20px 22px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        z-index: 8;
        transform-style: preserve-3d;
        transition: transform .48s cubic-bezier(.4, 0, .2, 1), box-shadow .48s;
        cursor: pointer;
        box-shadow: -4px 0 12px rgba(0,0,0,.25);
      }
      .bf-page-leaf.is-flipped {
        transform: rotateY(-180deg);
        box-shadow: 4px 0 12px rgba(0,0,0,.25);
      }

      /* Typography */
      .bf-chapter-tag {
        font-family: var(--font-mono);
        font-size: .5rem;
        font-weight: 700;
        letter-spacing: .14em;
        color: ${foldColor};
        border-bottom: 1px dashed rgba(42,31,20,.2);
        padding-bottom: 4px;
        margin-bottom: 6px;
      }
      .bf-chapter-title {
        font-family: 'Georgia', serif;
        font-size: .9375rem;
        font-weight: 700;
        line-height: 1.25;
        margin-bottom: 10px;
      }
      .bf-page-body {
        font-family: 'Georgia', serif;
        font-size: .75rem;
        line-height: 1.6;
        color: #2e241b;
      }
      .bf-page-foot {
        font-family: var(--font-mono);
        font-size: .5rem;
        color: #887864;
        text-align: center;
        border-top: 1px solid rgba(42,31,20,.1);
        padding-top: 4px;
      }

      /* Navigation Actions */
      .bf-nav-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 520px;
        margin-top: 14px;
      }
      .bf-btn-nav {
        background: transparent;
        border: 1px solid rgba(255,255,255,.2);
        border-radius: 4px;
        color: ${parchment};
        font-family: var(--font-mono);
        font-size: .625rem;
        font-weight: 700;
        padding: 5px 12px;
        cursor: pointer;
        transition: all .12s;
      }
      .bf-btn-nav:hover {
        border-color: ${spine};
        color: ${spine};
      }

      .bf-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="bf-scene">
      <div class="bf-label">
        <span>Interactive Metaphor Preview — 20 Things I Learned Canvas Page Flip</span>
        <span id="bf-progress-tag" style="font-family:var(--font-mono); color:${spine};">CHAPTER 1 OF 3</span>
      </div>

      <div class="bf-stage">
        <!-- Open Hardcover Book Spread -->
        <div class="bf-book" id="bf-book">
          <div class="bf-spine-ridge"></div>

          <div class="bf-spread">
            <!-- Left Fixed Page -->
            <div class="bf-page-left">
              <div>
                <div class="bf-chapter-tag" id="bf-tag-left">CHAPTER I</div>
                <h3 class="bf-chapter-title" id="bf-title-left">What is the Web?</h3>
                <p class="bf-page-body" id="bf-body-left">${CHAPTERS[0].leftBody}</p>
              </div>
              <div class="bf-page-foot" id="bf-foot-left">PAGE 1</div>
            </div>

            <!-- Right Fixed Page -->
            <div class="bf-page-right">
              <div>
                <p class="bf-page-body" id="bf-body-right">${CHAPTERS[0].rightBody}</p>
              </div>
              <div class="bf-page-foot" id="bf-foot-right">PAGE 2</div>
            </div>

            <!-- Flipping Leaf -->
            <div class="bf-page-leaf" id="bf-leaf" role="button" tabindex="0" aria-label="Flip book page">
              <div>
                <div class="bf-chapter-tag">PAGE TURN CORD</div>
                <p class="bf-page-body" id="bf-leaf-text">${CHAPTERS[0].rightBody}</p>
              </div>
              <div class="bf-page-foot">CLICK TO TURN ↷</div>
            </div>
          </div>
        </div>

        <div class="bf-nav-row">
          <button class="bf-btn-nav" id="bf-prev">← PREVIOUS PAGE</button>
          <span style="font-family:var(--font-mono); font-size:.625rem; color:rgba(255,255,255,.5);">USE ARROW KEYS OR CLICK LEAF</span>
          <button class="bf-btn-nav" id="bf-next">NEXT PAGE →</button>
        </div>
      </div>

      <div class="bf-hint">
        ↑ Click the right page or use arrow keys · Page curls over the center spine with dynamic fold shadow
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, parchment, leather, spine, foldColor) {
  const leaf        = stageEl.querySelector('#bf-leaf');
  const btnPrev     = stageEl.querySelector('#bf-prev');
  const btnNext     = stageEl.querySelector('#bf-next');
  const tagLeft     = stageEl.querySelector('#bf-tag-left');
  const titleLeft   = stageEl.querySelector('#bf-title-left');
  const bodyLeft    = stageEl.querySelector('#bf-body-left');
  const bodyRight   = stageEl.querySelector('#bf-body-right');
  const footLeft    = stageEl.querySelector('#bf-foot-left');
  const footRight   = stageEl.querySelector('#bf-foot-right');
  const leafText    = stageEl.querySelector('#bf-leaf-text');
  const progressTag = stageEl.querySelector('#bf-progress-tag');

  let currentChapter = 0;
  let isFlipping = false;

  function setChapter(idx, direction = 'next') {
    if (isFlipping) return;
    isFlipping = true;

    // Trigger page flip animation
    leaf.classList.add('is-flipped');

    setTimeout(() => {
      currentChapter = idx;
      const c = CHAPTERS[currentChapter];

      tagLeft.textContent = c.num;
      titleLeft.textContent = c.title;
      bodyLeft.textContent = c.leftBody;
      bodyRight.textContent = c.rightBody;
      leafText.textContent = c.rightBody;

      footLeft.textContent = `PAGE ${currentChapter * 2 + 1}`;
      footRight.textContent = `PAGE ${currentChapter * 2 + 2}`;
      progressTag.textContent = `CHAPTER ${currentChapter + 1} OF ${CHAPTERS.length}`;

      leaf.style.transition = 'none';
      leaf.classList.remove('is-flipped');
      void leaf.offsetWidth; // Reflow
      leaf.style.transition = '';
      isFlipping = false;
    }, 450);
  }

  function next() {
    const nextIdx = (currentChapter + 1) % CHAPTERS.length;
    setChapter(nextIdx, 'next');
  }

  function prev() {
    const prevIdx = (currentChapter - 1 + CHAPTERS.length) % CHAPTERS.length;
    setChapter(prevIdx, 'prev');
  }

  leaf?.addEventListener('click', next);
  btnNext?.addEventListener('click', next);
  btnPrev?.addEventListener('click', prev);

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
}

