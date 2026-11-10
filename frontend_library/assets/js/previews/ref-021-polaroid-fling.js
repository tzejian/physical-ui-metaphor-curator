/**
 * previews/ref-021-polaroid-fling.js
 *
 * Interactive metaphor preview for ref-021: DVR Labs Polaroid Stack —
 * Fling-to-Shuffle Photo Pile.
 *
 * Abstraction level: Retro-tactile modern / flat-skeuomorphic.
 * Technique: A gallery structured as an untidy desk pile of instant photos.
 * The top photo can be grabbed and flung aside: velocity physics carries it off
 * the screen, tucks it behind the stack, and promotes the next photo to the top.
 * Paging occurs via tactile reshuffling rather than standard carousel arrows.
 *
 * Token fidelity (ref-021):
 *   Colors   : #F2EAD3 (cream photo border), #1A1A1A (dark shadow / ink), #B5442E (accent stamp), #4A6741 (vintage tint)
 *   Borders  : White instant-photo frames with casual per-item resting rotations (2-6°)
 *   Elevation: Layered z-index stack with soft cast shadows separating layers
 *   Typography: Handwritten photo captions, minimal supporting telemetry
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#F2EAD3', '#1A1A1A', '#B5442E', '#4A6741'];

  const cream   = colors[0] ?? '#F2EAD3';
  const dark    = colors[1] ?? '#1A1A1A';
  const red     = colors[2] ?? '#B5442E';
  const green   = colors[3] ?? '#4A6741';

  stageEl.innerHTML = buildStageHtml(cream, dark, red, green);
  attachInteractions(stageEl, cream, dark, red, green);
}

// ── Photo Deck ────────────────────────────────────────────────────────────────

const DECK = [
  { id: 'p1', title: 'COSTA BRAVA COVE', date: 'AUG 1984', icon: '🌊', bg: '#2B4A6F', rot: -4 },
  { id: 'p2', title: 'TYPEWRITER DRAFT', date: 'OCT 1989', icon: '⌨️', bg: '#4A3B2C', rot: 5 },
  { id: 'p3', title: 'PINEWOOD CABIN', date: 'DEC 1991', icon: '🌲', bg: '#2F4835', rot: -6 },
  { id: 'p4', title: 'ANALOG SYNTH LAB', date: 'MAY 1995', icon: '🎛️', bg: '#5B3248', rot: 3 },
  { id: 'p5', title: 'VALLEY OBSERVATORY', date: 'JUL 1998', icon: '🔭', bg: '#1F2A38', rot: -2 }
];

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(cream, dark, red, green) {
  return `
    <style>
      .ps-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .ps-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
        display: flex;
        justify-content: space-between;
      }

      /* Desk Stage */
      .ps-desk {
        position: relative;
        width: 100%;
        min-height: 380px;
        background: #151618;
        border-radius: 8px;
        border: 2px solid #242528;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
        box-sizing: border-box;
        box-shadow: 0 16px 40px rgba(0,0,0,.6);
      }

      /* ── The Polaroid Stack Container ── */
      .ps-stack-area {
        position: relative;
        width: 220px;
        height: 270px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Individual Polaroid Card */
      .ps-card {
        position: absolute;
        width: 200px;
        height: 250px;
        background: ${cream};
        color: ${dark};
        border-radius: 3px;
        padding: 10px 10px 24px;
        box-sizing: border-box;
        box-shadow: 0 10px 24px rgba(0,0,0,.45);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: grab;
        touch-action: none;
        transition: transform .22s cubic-bezier(.2, .8, .2, 1), box-shadow .2s;
        will-change: transform;
      }
      .ps-card:active {
        cursor: grabbing;
      }

      .ps-photo-frame {
        width: 100%;
        height: 175px;
        border-radius: 2px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2.75rem;
        box-shadow: inset 0 0 16px rgba(0,0,0,.35);
      }

      .ps-caption-box {
        display: flex;
        flex-direction: column;
        gap: 2px;
        text-align: center;
        padding-top: 6px;
      }
      .ps-caption-title {
        font-family: 'Georgia', serif;
        font-size: .8125rem;
        font-weight: 700;
        letter-spacing: .04em;
      }
      .ps-caption-date {
        font-family: var(--font-mono);
        font-size: .5625rem;
        color: #777;
        letter-spacing: .08em;
      }

      /* Fling State Animation */
      .ps-card.is-flinging {
        transition: transform .4s cubic-bezier(.2, .8, .2, 1), opacity .4s;
      }

      /* Controls & Status */
      .ps-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        max-width: 320px;
        margin-top: 20px;
        z-index: 10;
      }
      .ps-btn-action {
        background: transparent;
        border: 1px solid rgba(255,255,255,.2);
        border-radius: 4px;
        color: rgba(255,255,255,.8);
        font-family: var(--font-mono);
        font-size: .625rem;
        font-weight: 700;
        padding: 5px 12px;
        cursor: pointer;
        transition: all .12s;
      }
      .ps-btn-action:hover {
        border-color: ${red};
        color: ${red};
      }

      .ps-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="ps-scene">
      <div class="ps-label">
        <span>Interactive Metaphor Preview — DVR Labs Polaroid Stack Fling</span>
        <span id="ps-counter" style="font-family:var(--font-mono); color:${red};">CARD 1 OF 5</span>
      </div>

      <div class="ps-desk">
        <div class="ps-stack-area" id="ps-stack">
          <!-- Cards populated dynamically -->
        </div>

        <div class="ps-controls">
          <button class="ps-btn-action" id="ps-btn-shuffle">↺ RESHUFFLE STACK</button>
          <button class="ps-btn-action" id="ps-btn-fling">FLING TOP →</button>
        </div>
      </div>

      <div class="ps-hint">
        ↑ Drag and fling the top photo with throw momentum · Cards cycle and tuck naturally behind the stack
      </div>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, cream, dark, red, green) {
  const stackArea  = stageEl.querySelector('#ps-stack');
  const counter    = stageEl.querySelector('#ps-counter');
  const btnShuffle = stageEl.querySelector('#ps-btn-shuffle');
  const btnFling   = stageEl.querySelector('#ps-btn-fling');

  let cardsData = [...DECK];
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let currentDX = 0;
  let currentDY = 0;
  let topCardEl = null;

  function renderStack() {
    stackArea.innerHTML = '';

    cardsData.forEach((item, index) => {
      const zIndex = cardsData.length - index;
      const isTop = index === 0;

      const card = document.createElement('div');
      card.className = 'ps-card';
      card.dataset.id = item.id;
      card.style.zIndex = zIndex;
      card.style.transform = `rotate(${item.rot}deg) translateY(${index * 2}px)`;

      card.innerHTML = `
        <div class="ps-photo-frame" style="background:${item.bg};">
          ${item.icon}
        </div>
        <div class="ps-caption-box">
          <span class="ps-caption-title">${item.title}</span>
          <span class="ps-caption-date">${item.date}</span>
        </div>
      `;

      if (isTop) {
        topCardEl = card;
        bindDrag(card);
      }

      stackArea.appendChild(card);
    });

    counter.textContent = `CARD 1 OF ${cardsData.length} // TOP: ${cardsData[0].title}`;
  }

  function flingTop(targetDX = 260) {
    if (!topCardEl) return;

    topCardEl.classList.add('is-flinging');
    const rot = targetDX > 0 ? 25 : -25;
    topCardEl.style.transform = `translate(${targetDX * 1.5}px, -20px) rotate(${rot}deg)`;
    topCardEl.style.opacity = '0';

    setTimeout(() => {
      // Move first item to the end
      const first = cardsData.shift();
      cardsData.push(first);
      renderStack();
    }, 380);
  }

  function bindDrag(el) {
    el.addEventListener('pointerdown', e => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      currentDX = 0;
      currentDY = 0;
      el.setPointerCapture(e.pointerId);
      el.style.transition = 'none';
    });

    el.addEventListener('pointermove', e => {
      if (!isDragging) return;
      currentDX = e.clientX - startX;
      currentDY = e.clientY - startY;

      const rot = (currentDX / 20);
      el.style.transform = `translate(${currentDX}px, ${currentDY}px) rotate(${rot}deg) scale(1.04)`;
    });

    function endDrag() {
      if (!isDragging) return;
      isDragging = false;

      // Check fling threshold (80px horizontal drag)
      if (Math.abs(currentDX) > 80) {
        flingTop(currentDX > 0 ? 280 : -280);
      } else {
        // Snap back
        el.style.transition = 'transform .22s cubic-bezier(.2, .8, .2, 1)';
        el.style.transform = `rotate(${cardsData[0].rot}deg)`;
      }
    }

    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
  }

  btnFling?.addEventListener('click', () => flingTop(260));

  btnShuffle?.addEventListener('click', () => {
    // Shuffle cards array
    cardsData = [...DECK].sort(() => Math.random() - 0.5);
    renderStack();
  });

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') flingTop(260);
    if (e.key === 'ArrowLeft') flingTop(-260);
  });

  renderStack();
}

