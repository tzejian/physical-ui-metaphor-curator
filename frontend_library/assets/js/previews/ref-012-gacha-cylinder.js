/**
 * previews/ref-012-gacha-cylinder.js
 *
 * Interactive metaphor preview for ref-012: Shaky Gotcha —
 * Rotating Gacha Capsule Cylinder.
 *
 * Abstraction level: Playful brutalist / flat-skeuomorphic.
 * Technique: An arcade gachapon cylinder drum. Users rotate the drum to browse
 * capsule tiers and pull a draw. Dispensed capsules drop down a chute and pop open
 * into collectible character tokens ("Shakys") that stack on the prize shelf.
 * A toggleable "Rage Mode" switches the arcade cabinet into neon overdrive state.
 *
 * Token fidelity (ref-012):
 *   Colors   : #FF3D6E (hot pink), #FFC400 (arcade yellow), #3B7DDD (cyan), #111111 (cabinet black), #F2EAD3 (cream)
 *   Borders  : chunky arcade bezels, molded capsule hemispheres
 *   Elevation: 3D rotating cylinder ribs with arcade button drop shadows
 *   Typography: arcade poster display type, collectible creature tags
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#FF3D6E', '#FFC400', '#3B7DDD', '#111111', '#F2EAD3'];

  const pink   = colors[0] ?? '#FF3D6E';
  const yellow = colors[1] ?? '#FFC400';
  const blue   = colors[2] ?? '#3B7DDD';
  const dark   = colors[3] ?? '#111111';
  const cream  = colors[4] ?? '#F2EAD3';

  stageEl.innerHTML = buildStageHtml(pink, yellow, blue, dark, cream);
  attachInteractions(stageEl, pink, yellow, blue, dark, cream);
}

// ── Collectibles Pool ─────────────────────────────────────────────────────────

const CHARACTERS = [
  { name: 'PIXEL BOT', rarity: 'SUPER RARE', icon: '🤖', color: '#3B7DDD' },
  { name: 'NEON KITTEN', rarity: 'COMMON', icon: '🐱', color: '#FF3D6E' },
  { name: 'LASER DINO', rarity: 'LEGENDARY', icon: '🦖', color: '#FFC400' },
  { name: 'COSMIC GHOST', rarity: 'RARE', icon: '👻', color: '#9B51E0' },
  { name: 'CYBER TOAD', rarity: 'COMMON', icon: '🐸', color: '#00D18F' },
];

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(pink, yellow, blue, dark, cream) {
  return `
    <style>
      .sg-scene {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .sg-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
      }

      /* Arcade Cabinet Chassis */
      .sg-cabinet {
        background: ${dark};
        border: 4px solid #252525;
        border-radius: 12px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        gap: 20px;
        position: relative;
        overflow: hidden;
        box-shadow: 0 12px 36px rgba(0,0,0,.6);
        transition: border-color .3s, box-shadow .3s;
      }
      .sg-cabinet.is-rage {
        border-color: ${pink};
        box-shadow: 0 0 30px ${pink}88, inset 0 0 40px ${pink}33;
      }

      /* Marquee */
      .sg-marquee {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #2a2a2a;
        padding-bottom: 12px;
      }
      .sg-marquee-title {
        font-size: 1.25rem;
        font-weight: 900;
        letter-spacing: .12em;
        color: ${yellow};
        text-shadow: 0 0 10px ${yellow}88;
      }
      .sg-cabinet.is-rage .sg-marquee-title {
        color: ${pink};
        text-shadow: 0 0 15px ${pink};
      }

      /* Rage Mode Button */
      .sg-btn-rage {
        background: transparent;
        border: 2px solid ${pink};
        color: ${pink};
        font-family: var(--font-mono);
        font-size: .625rem;
        font-weight: 800;
        letter-spacing: .12em;
        padding: 4px 10px;
        border-radius: 4px;
        cursor: pointer;
        transition: all .15s;
      }
      .sg-btn-rage:hover,
      .sg-cabinet.is-rage .sg-btn-rage {
        background: ${pink};
        color: #fff;
        box-shadow: 0 0 12px ${pink};
      }

      /* Main Stage Grid */
      .sg-stage-grid {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-around;
        gap: 24px;
      }

      /* ── The Rotating Cylinder Drum ── */
      .sg-cylinder-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .sg-cylinder-housing {
        width: 170px;
        height: 140px;
        background: #1b1b1f;
        border: 3px solid #333;
        border-radius: 20px;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 0 30px rgba(0,0,0,.8);
      }

      /* Cylinder drum */
      .sg-drum {
        width: 130px;
        height: 110px;
        position: relative;
        perspective: 400px;
        transform-style: preserve-3d;
        cursor: grab;
      }
      .sg-drum:active {
        cursor: grabbing;
      }

      /* Rotating Capsule Ribs */
      .sg-rib {
        position: absolute;
        width: 100%;
        height: 38px;
        border-radius: 19px;
        border: 2px solid ${dark};
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        box-sizing: border-box;
        box-shadow: 0 2px 6px rgba(0,0,0,.5);
        transition: transform .3s cubic-bezier(.2, .8, .2, 1);
      }
      .sg-rib-capsule {
        display: flex;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        overflow: hidden;
        border: 1.5px solid ${dark};
      }
      .sg-rib-half-a { flex: 1; background: ${pink}; }
      .sg-rib-half-b { flex: 1; background: ${cream}; }

      /* Control CTA */
      .sg-btn-draw {
        background: ${yellow};
        color: ${dark};
        border: 2px solid ${dark};
        font-family: var(--font-mono);
        font-size: .75rem;
        font-weight: 800;
        letter-spacing: .08em;
        padding: 8px 18px;
        border-radius: 6px;
        cursor: pointer;
        box-shadow: 0 4px 0 #997500;
        transition: all .1s;
      }
      .sg-btn-draw:active {
        transform: translateY(3px);
        box-shadow: 0 1px 0 #997500;
      }

      /* ── Dispenser Reveal Box ── */
      .sg-reveal-box {
        min-width: 200px;
        max-width: 240px;
        background: #18181c;
        border: 2px solid #282830;
        border-radius: 8px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 10px;
      }
      .sg-drawn-capsule {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        border: 2.5px solid ${dark};
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        background: ${pink};
        box-shadow: 0 4px 12px rgba(0,0,0,.4);
        transition: transform .35s cubic-bezier(.34, 1.56, .64, 1);
      }
      .sg-drawn-capsule.is-revealing {
        animation: sg-pop .4s cubic-bezier(.34, 1.56, .64, 1);
      }
      @keyframes sg-pop {
        0%   { transform: scale(0.4) rotate(-45deg); opacity: 0; }
        60%  { transform: scale(1.25) rotate(15deg); opacity: 1; }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }

      .sg-drawn-name {
        font-size: .875rem;
        font-weight: 800;
        color: #fff;
      }
      .sg-drawn-rarity {
        font-family: var(--font-mono);
        font-size: .5625rem;
        font-weight: 700;
        letter-spacing: .1em;
        color: ${yellow};
      }

      /* ── Prize Shelf (Collection) ── */
      .sg-shelf-area {
        border-top: 1px dashed rgba(255,255,255,.1);
        padding-top: 14px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .sg-shelf-label {
        font-family: var(--font-mono);
        font-size: .5625rem;
        font-weight: 700;
        letter-spacing: .12em;
        color: rgba(255,255,255,.4);
        text-transform: uppercase;
      }
      .sg-shelf-row {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        min-height: 38px;
        align-items: center;
      }
      .sg-shelf-item {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        background: #25252e;
        border: 1px solid rgba(255,255,255,.15);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1rem;
        box-shadow: 0 2px 4px rgba(0,0,0,.3);
        transition: transform .15s;
      }
      .sg-shelf-item:hover {
        transform: scale(1.15) translateY(-2px);
      }

      .sg-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
      }
    </style>

    <div class="sg-scene">
      <p class="sg-label">Interactive Metaphor Preview — Shaky Gotcha Arcade Cylinder</p>

      <div class="sg-cabinet" id="sg-cabinet">
        <div class="sg-marquee">
          <div class="sg-marquee-title">SHAKY GOTCHA // ARCADE</div>
          <button class="sg-btn-rage" id="sg-btn-rage">⚡ RAGE MODE</button>
        </div>

        <div class="sg-stage-grid">
          <!-- Cylinder drum station -->
          <div class="sg-cylinder-box">
            <div class="sg-cylinder-housing">
              <div class="sg-drum" id="sg-drum">
                <div class="sg-rib" style="top:6px; background:${blue};">
                  <div class="sg-rib-capsule"><div class="sg-rib-half-a" style="background:${pink};"></div><div class="sg-rib-half-b"></div></div>
                  <span style="font-size:.5625rem; font-weight:800; color:#fff;">CHANCE DROP</span>
                </div>
                <div class="sg-rib" style="top:50px; background:${pink};">
                  <div class="sg-rib-capsule"><div class="sg-rib-half-a" style="background:${yellow};"></div><div class="sg-rib-half-b"></div></div>
                  <span style="font-size:.5625rem; font-weight:800; color:#fff;">RARE TIER</span>
                </div>
              </div>
            </div>
            <button class="sg-btn-draw" id="sg-btn-draw">PULL GACHA 🎰</button>
          </div>

          <!-- Dispensed Reveal -->
          <div class="sg-reveal-box">
            <div class="sg-drawn-rarity" id="sg-rarity">STATUS: READY</div>
            <div class="sg-drawn-capsule" id="sg-capsule">✨</div>
            <div class="sg-drawn-name" id="sg-name">Pull to Draw</div>
          </div>
        </div>

        <!-- Prize Shelf -->
        <div class="sg-shelf-area">
          <div class="sg-shelf-label">Collected Shakys Shelf</div>
          <div class="sg-shelf-row" id="sg-shelf">
            <div class="sg-shelf-item" title="Starter Bot">🤖</div>
          </div>
        </div>
      </div>

      <p class="sg-hint">↑ Pull gacha to rotate cylinder drum and dispense collectibles · Toggle Rage Mode for overdrive palette</p>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, pink, yellow, blue, dark, cream) {
  const cabinet  = stageEl.querySelector('#sg-cabinet');
  const btnRage  = stageEl.querySelector('#sg-btn-rage');
  const btnDraw  = stageEl.querySelector('#sg-btn-draw');
  const drum     = stageEl.querySelector('#sg-drum');
  const capsule  = stageEl.querySelector('#sg-capsule');
  const nameEl   = stageEl.querySelector('#sg-name');
  const rarityEl = stageEl.querySelector('#sg-rarity');
  const shelf    = stageEl.querySelector('#sg-shelf');

  let isRage = false;
  let isSpinning = false;
  let drumRot = 0;

  // Toggle Rage Mode
  btnRage?.addEventListener('click', () => {
    isRage = !isRage;
    cabinet.classList.toggle('is-rage', isRage);
    btnRage.textContent = isRage ? '⚡ RAGE ACTIVE' : '⚡ RAGE MODE';
  });

  // Pull Gacha
  function drawGacha() {
    if (isSpinning) return;
    isSpinning = true;

    // Spin cylinder
    drumRot += 360;
    drum.style.transition = 'transform .5s cubic-bezier(.34, 1.56, .64, 1)';
    drum.style.transform = `rotateX(${drumRot}deg)`;

    rarityEl.textContent = 'DISPENSING...';
    nameEl.textContent = 'Tumbling...';

    setTimeout(() => {
      const char = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];

      capsule.style.background = char.color;
      capsule.textContent = char.icon;
      capsule.classList.remove('is-revealing');
      void capsule.offsetWidth;
      capsule.classList.add('is-revealing');

      nameEl.textContent = char.name;
      rarityEl.textContent = char.rarity;
      rarityEl.style.color = char.color;

      // Add to shelf
      const shelfItem = document.createElement('div');
      shelfItem.className = 'sg-shelf-item';
      shelfItem.title = `${char.name} (${char.rarity})`;
      shelfItem.textContent = char.icon;
      shelf.appendChild(shelfItem);

      isSpinning = false;
    }, 550);
  }

  btnDraw?.addEventListener('click', drawGacha);
}

