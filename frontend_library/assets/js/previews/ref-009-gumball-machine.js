/**
 * previews/ref-009-gumball-machine.js
 *
 * Interactive metaphor preview for ref-009: Wonderful Weekends —
 * Physics-Based 3D Gumball Machine.
 *
 * Abstraction level: Playful brutalist / flat-skeuomorphic.
 * Technique: A retro countertop gumball machine with a translucent globe,
 * colorful tumbling gumballs, a rotary turn crank, and a delivery chute.
 * Cranking the handle rattles the balls, dispenses a sphere down the spiral chute,
 * and opens the dispensed capsule into an instant reward reveal.
 *
 * Token fidelity (ref-009):
 *   Colors   : #E8412C (machine red), #FFC400 (yellow), #3B7DDD (blue), #FFFFFF (globe/white), #1A1A1A (chassis)
 *   Borders  : toy-like molded silhouettes, translucent globe highlights
 *   Elevation: 3D mechanical layered depth with bouncy spring drop
 *   Typography: rounded playful display type matching toy iconography
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#E8412C', '#FFC400', '#3B7DDD', '#FFFFFF', '#1A1A1A'];

  const red    = colors[0] ?? '#E8412C';
  const yellow = colors[1] ?? '#FFC400';
  const blue   = colors[2] ?? '#3B7DDD';
  const white  = colors[3] ?? '#FFFFFF';
  const dark   = colors[4] ?? '#1A1A1A';

  stageEl.innerHTML = buildStageHtml(red, yellow, blue, white, dark);
  attachInteractions(stageEl, red, yellow, blue, white, dark);
}

// ── Rewards Pool ──────────────────────────────────────────────────────────────

const PRIZES = [
  { title: 'GOLDEN TICKET', type: 'VIP Weekend Pass', color: '#FFC400' },
  { title: 'COSMIC JAWBREAKER', type: 'Rare Sound Pack', color: '#3B7DDD' },
  { title: 'CHERRY POPPER', type: '50% Merch Voucher', color: '#E8412C' },
  { title: 'NEON SPEARMINT', type: 'Secret Afterparty Invite', color: '#00D18F' },
  { title: 'MYSTERY SURPRISE', type: 'Digital Collectible #042', color: '#9B51E0' }
];

const BALL_COLORS = ['#E8412C', '#FFC400', '#3B7DDD', '#00D18F', '#9B51E0', '#FF7A00', '#FFFFFF'];

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(red, yellow, blue, white, dark) {
  // Generate balls inside the glass globe
  const globeBallsHtml = Array.from({ length: 18 }, (_, i) => {
    const color = BALL_COLORS[i % BALL_COLORS.length];
    const x = 18 + (i % 6) * 16 + (Math.sin(i * 2.3) * 6);
    const y = 30 + Math.floor(i / 6) * 18 + (Math.cos(i * 1.7) * 4);
    return `<div class="gm-globe-ball" data-ball-idx="${i}" style="left:${x}px; top:${y}px; background:${color};"></div>`;
  }).join('');

  return `
    <style>
      .gm-scene {
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
      }
      .gm-label {
        font-size: .6875rem;
        font-weight: 700;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
        align-self: flex-start;
      }

      .gm-wrapper {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        gap: 36px;
        width: 100%;
      }

      /* ── The Gumball Machine ── */
      .gm-machine {
        position: relative;
        width: 180px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      /* Cap */
      .gm-cap {
        width: 100px;
        height: 18px;
        background: ${red};
        border-radius: 12px 12px 0 0;
        border: 2px solid ${dark};
        box-shadow: inset 0 3px 0 rgba(255,255,255,.3);
        position: relative;
        z-index: 4;
      }
      .gm-cap-finial {
        width: 18px;
        height: 12px;
        background: ${yellow};
        border: 2px solid ${dark};
        border-radius: 50% 50% 0 0;
        margin: 0 auto -2px;
      }

      /* Glass Globe */
      .gm-globe {
        width: 140px;
        height: 130px;
        background: radial-gradient(circle at 35% 30%, rgba(255,255,255,.3) 0%, rgba(255,255,255,.05) 55%, rgba(0,0,0,.15) 100%);
        border: 3px solid ${dark};
        border-radius: 50%;
        position: relative;
        overflow: hidden;
        margin-top: -6px;
        box-shadow: inset 0 0 20px rgba(255,255,255,.3), 0 8px 16px rgba(0,0,0,.25);
        z-index: 3;
      }
      .gm-globe-highlight {
        position: absolute;
        top: 14px;
        left: 20px;
        width: 32px;
        height: 50px;
        border-radius: 50%;
        border-left: 4px solid rgba(255,255,255,.6);
        transform: rotate(-30deg);
        pointer-events: none;
      }

      .gm-globe-ball {
        position: absolute;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 1.5px solid rgba(0,0,0,.4);
        box-shadow: inset -3px -3px 0 rgba(0,0,0,.25), inset 3px 3px 0 rgba(255,255,255,.4);
        transition: transform .15s ease-out;
      }

      /* Base Chassis */
      .gm-base {
        width: 150px;
        background: ${red};
        border: 3px solid ${dark};
        border-radius: 8px 8px 18px 18px;
        margin-top: -16px;
        padding: 24px 14px 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,.4), inset 0 3px 0 rgba(255,255,255,.3);
        position: relative;
        z-index: 2;
      }

      /* Crank station */
      .gm-crank-station {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      .gm-coin-slot {
        width: 24px;
        height: 4px;
        background: ${dark};
        border-radius: 2px;
      }
      .gm-crank-housing {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: #eee;
        border: 2px solid ${dark};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 2px 4px rgba(0,0,0,.2);
      }
      .gm-crank-handle {
        width: 38px;
        height: 12px;
        background: ${yellow};
        border: 2px solid ${dark};
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 2px;
        transition: transform .4s cubic-bezier(.4, 0, .2, 1);
        transform-origin: center center;
        box-shadow: 0 2px 4px rgba(0,0,0,.25);
      }
      .gm-crank-knob {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: ${red};
        border: 1.5px solid ${dark};
      }

      /* Chute flap */
      .gm-chute {
        width: 48px;
        height: 32px;
        background: ${dark};
        border-radius: 0 0 10px 10px;
        border: 2px solid #555;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }
      .gm-chute-door {
        width: 100%;
        height: 100%;
        background: #333;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: .5rem;
        color: rgba(255,255,255,.5);
        transform-origin: top center;
        transition: transform .2s ease-out;
      }
      .gm-chute.is-dispensing .gm-chute-door {
        transform: rotateX(75deg);
      }

      /* Dispensed Ball */
      .gm-dispensed-ball {
        position: absolute;
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid ${dark};
        box-shadow: inset -4px -4px 0 rgba(0,0,0,.3), inset 3px 3px 0 rgba(255,255,255,.5);
        z-index: 10;
        bottom: 24px;
        left: calc(50% - 13px);
        opacity: 0;
        pointer-events: none;
      }
      .gm-dispensed-ball.is-rolling {
        animation: gm-roll 0.7s cubic-bezier(.25, .8, .25, 1) forwards;
      }
      @keyframes gm-roll {
        0%   { transform: translateY(-40px) scale(0.6); opacity: 1; }
        40%  { transform: translateY(0px) scale(1); opacity: 1; }
        70%  { transform: translateY(30px) scale(1.1) rotate(180deg); opacity: 1; }
        100% { transform: translateY(60px) scale(1.2) rotate(360deg); opacity: 1; pointer-events: auto; }
      }

      /* ── Reward Reveal Card ── */
      .gm-prize-card {
        background: #202028;
        border: 2px solid rgba(255,255,255,.1);
        border-radius: 12px;
        padding: 20px 24px;
        min-width: 220px;
        max-width: 260px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        text-align: center;
        box-shadow: 0 8px 32px rgba(0,0,0,.5);
        transition: transform .3s cubic-bezier(.2, .8, .2, 1), opacity .3s;
      }
      .gm-prize-capsule {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: ${yellow};
        border: 3px solid ${dark};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,.3);
        transition: transform .3s cubic-bezier(.34, 1.56, .64, 1);
      }
      .gm-prize-tag {
        font-size: .5625rem;
        font-weight: 800;
        letter-spacing: .15em;
        text-transform: uppercase;
        color: ${yellow};
      }
      .gm-prize-title {
        font-size: 1rem;
        font-weight: 800;
        letter-spacing: -.01em;
        color: #fff;
      }
      .gm-prize-sub {
        font-size: .75rem;
        color: var(--text-secondary);
      }

      .gm-btn-spin {
        background: ${red};
        color: #fff;
        border: 2px solid ${dark};
        border-radius: 6px;
        font-size: .75rem;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
        padding: 8px 16px;
        cursor: pointer;
        box-shadow: 0 3px 0 ${dark};
        transition: all .1s;
      }
      .gm-btn-spin:active {
        transform: translateY(2px);
        box-shadow: 0 1px 0 ${dark};
      }

      .gm-hint {
        font-size: .6875rem;
        color: var(--text-muted);
        margin-top: 14px;
        font-style: italic;
        align-self: flex-start;
      }
    </style>

    <div class="gm-scene">
      <p class="gm-label">Interactive Metaphor Preview — Gumball Dispenser Ritual</p>

      <div class="gm-wrapper">
        <!-- Machine -->
        <div class="gm-machine">
          <div class="gm-cap-finial"></div>
          <div class="gm-cap"></div>
          <div class="gm-globe" id="gm-globe">
            <div class="gm-globe-highlight"></div>
            ${globeBallsHtml}
          </div>
          <div class="gm-base">
            <div class="gm-crank-station">
              <div class="gm-coin-slot"></div>
              <div class="gm-crank-housing">
                <div class="gm-crank-handle" id="gm-crank" role="button" tabindex="0" aria-label="Turn gumball dispenser crank">
                  <div class="gm-crank-knob"></div>
                </div>
              </div>
            </div>
            <div class="gm-chute" id="gm-chute">
              <div class="gm-chute-door">PUSH</div>
            </div>
          </div>
          <!-- Falling ball -->
          <div class="gm-dispensed-ball" id="gm-ball"></div>
        </div>

        <!-- Reward Reveal Box -->
        <div class="gm-prize-card" id="gm-prize-card">
          <div class="gm-prize-tag">INSTANT REWARD</div>
          <div class="gm-prize-capsule" id="gm-prize-icon">🍬</div>
          <div class="gm-prize-title" id="gm-prize-title">Turn the Crank!</div>
          <div class="gm-prize-sub" id="gm-prize-sub">Rotate handle to dispense your prize capsule.</div>
          <button class="gm-btn-spin" id="gm-btn-spin">TURN CRANK ↻</button>
        </div>
      </div>

      <p class="gm-hint">↑ Click the crank handle or press button to trigger the reward cascade</p>
    </div>
  `;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, red, yellow, blue, white, dark) {
  const crank     = stageEl.querySelector('#gm-crank');
  const btnSpin   = stageEl.querySelector('#gm-btn-spin');
  const chute     = stageEl.querySelector('#gm-chute');
  const ball      = stageEl.querySelector('#gm-ball');
  const globe     = stageEl.querySelector('#gm-globe');
  const globeBalls = stageEl.querySelectorAll('.gm-globe-ball');
  const prizeIcon = stageEl.querySelector('#gm-prize-icon');
  const prizeTitle = stageEl.querySelector('#gm-prize-title');
  const prizeSub  = stageEl.querySelector('#gm-prize-sub');

  let isDispensing = false;
  let crankRotation = 0;

  function dispense() {
    if (isDispensing) return;
    isDispensing = true;

    // 1. Rotate the crank 360 deg
    crankRotation += 360;
    crank.style.transform = `rotate(${crankRotation}deg)`;

    // 2. Shake balls in the globe
    globeBalls.forEach(b => {
      const rx = (Math.random() - 0.5) * 14;
      const ry = (Math.random() - 0.5) * 14;
      b.style.transform = `translate(${rx}px, ${ry}px)`;
    });

    // 3. Open chute and roll ball
    setTimeout(() => {
      chute.classList.add('is-dispensing');
      const randomColor = BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)];
      ball.style.background = randomColor;
      ball.classList.remove('is-rolling');
      void ball.offsetWidth; // Reflow
      ball.classList.add('is-rolling');
    }, 200);

    // 4. Reveal reward
    setTimeout(() => {
      chute.classList.remove('is-dispensing');
      const prize = PRIZES[Math.floor(Math.random() * PRIZES.length)];

      prizeIcon.style.background = prize.color;
      prizeIcon.style.transform = 'scale(1.2) rotate(15deg)';
      prizeTitle.textContent = prize.title;
      prizeSub.textContent = prize.type;

      setTimeout(() => {
        prizeIcon.style.transform = 'scale(1) rotate(0deg)';
        isDispensing = false;
      }, 300);

      // Settle globe balls
      globeBalls.forEach(b => {
        b.style.transform = 'translate(0px, 0px)';
      });
    }, 900);
  }

  crank?.addEventListener('click', dispense);
  btnSpin?.addEventListener('click', dispense);

  crank?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dispense();
    }
  });
}

