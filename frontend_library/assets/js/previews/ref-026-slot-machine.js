/**
 * ref-026: Fernet-Branca US - Slot Machine Serve Randomizer
 * 3-reel mechanical slot randomizer with lever ritual and staggered stops.
 */

export function mount(entry, stageEl) {
  const colors = {
    green: '#1A5E3A',
    greenDark: '#0e3822',
    cream: '#E8E4DC',
    red: '#C8102E',
    gold: '#FFC400',
    dark: '#111111',
    brass: '#b89035'
  };

  const reel1Items = ['BEER + SHOT', 'FERNET & COLA', 'ON THE ROCKS', 'FERNET SOUR', 'NEAT SHOT', 'HOT TODDY'];
  const reel2Items = ['WITH BRIAN', 'AFTER SHIFT', 'ROUND OF 4', 'LATE NIGHT', 'ROOFTOP HOUR', 'SOLO STUDY'];
  const reel3Items = ['ORANGE TWIST', 'MINT SPRIG', 'CHILLED GLASS', 'DOUBLE MEASURE', 'CLEAR ICE', 'COFFEE BEANS'];

  let isSpinning = false;
  let reel1Idx = 0;
  let reel2Idx = 0;
  let reel3Idx = 0;
  let audioCtx = null;

  function playTick(pitch = 500) {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (_) {}
  }

  function playWin() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const now = audioCtx.currentTime;
      [440, 554, 659, 880].forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.08, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.35);
      });
    } catch (_) {}
  }

  stageEl.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 660px;
      margin: 0 auto;
      background: ${colors.dark};
      border-radius: 14px;
      border: 3px solid ${colors.gold};
      box-shadow: 0 16px 40px rgba(0,0,0,0.85);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: ${colors.cream};
      overflow: hidden;
      user-select: none;
    ">
      <!-- Slot Machine Header / Brand Plaque -->
      <div style="
        width: 100%;
        background: linear-gradient(180deg, ${colors.green} 0%, ${colors.greenDark} 100%);
        padding: 14px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid ${colors.gold};
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: ${colors.red};
            border: 2px solid ${colors.gold};
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 14px;
            color: #fff;
          ">FB</div>
          <div>
            <div style="font-size: 14px; font-weight: 800; letter-spacing: 0.14em; color: ${colors.gold}; text-transform: uppercase;">
              FERNET-BRANCA US
            </div>
            <div style="font-size: 11px; letter-spacing: 0.06em; color: ${colors.cream}; opacity: 0.85;">
              SERVE SELECTOR & RITUAL RANDOMIZER
            </div>
          </div>
        </div>

        <div style="
          background: rgba(0,0,0,0.4);
          border: 1px solid ${colors.gold};
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 11px;
          font-weight: 700;
          color: ${colors.gold};
          letter-spacing: 0.1em;
        ">
          3-REEL DECELERATION
        </div>
      </div>

      <!-- Main Slot Area with Lever -->
      <div style="
        width: 100%;
        padding: 24px 20px;
        background: radial-gradient(circle at 50% 20%, #1f2a22 0%, #0d120f 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
      ">
        <!-- 3-Reel Cabinet Frame -->
        <div style="
          flex: 1;
          background: #080b09;
          border: 2px solid #2f3e33;
          border-radius: 10px;
          padding: 16px;
          box-shadow: inset 0 4px 15px rgba(0,0,0,0.9);
          display: flex;
          flex-direction: column;
          gap: 12px;
        ">
          <!-- Reel Labels -->
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
            text-align: center;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 0.12em;
            color: ${colors.gold};
            text-transform: uppercase;
          ">
            <span>I • SERVE FORMAT</span>
            <span>II • OCCASION</span>
            <span>III • THE TWIST</span>
          </div>

          <!-- Reel Windows -->
          <div style="
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
          ">
            <!-- Reel 1 Window -->
            <div class="fb-reel-window" style="
              height: 100px;
              background: #fff;
              border-radius: 6px;
              overflow: hidden;
              position: relative;
              box-shadow: inset 0 12px 14px rgba(0,0,0,0.6), inset 0 -12px 14px rgba(0,0,0,0.6);
              border: 2px solid ${colors.gold};
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <!-- Center Payline marker -->
              <div style="position: absolute; width: 100%; height: 2px; background: rgba(200, 16, 46, 0.4); z-index: 5;"></div>
              <div id="fb-reel-1" style="
                font-size: 13px;
                font-weight: 900;
                color: ${colors.dark};
                text-align: center;
                padding: 4px 8px;
                letter-spacing: 0.05em;
                transition: transform 0.1s ease;
              ">
                ${reel1Items[0]}
              </div>
            </div>

            <!-- Reel 2 Window -->
            <div class="fb-reel-window" style="
              height: 100px;
              background: #fff;
              border-radius: 6px;
              overflow: hidden;
              position: relative;
              box-shadow: inset 0 12px 14px rgba(0,0,0,0.6), inset 0 -12px 14px rgba(0,0,0,0.6);
              border: 2px solid ${colors.gold};
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="position: absolute; width: 100%; height: 2px; background: rgba(200, 16, 46, 0.4); z-index: 5;"></div>
              <div id="fb-reel-2" style="
                font-size: 13px;
                font-weight: 900;
                color: ${colors.dark};
                text-align: center;
                padding: 4px 8px;
                letter-spacing: 0.05em;
                transition: transform 0.1s ease;
              ">
                ${reel2Items[0]}
              </div>
            </div>

            <!-- Reel 3 Window -->
            <div class="fb-reel-window" style="
              height: 100px;
              background: #fff;
              border-radius: 6px;
              overflow: hidden;
              position: relative;
              box-shadow: inset 0 12px 14px rgba(0,0,0,0.6), inset 0 -12px 14px rgba(0,0,0,0.6);
              border: 2px solid ${colors.gold};
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="position: absolute; width: 100%; height: 2px; background: rgba(200, 16, 46, 0.4); z-index: 5;"></div>
              <div id="fb-reel-3" style="
                font-size: 13px;
                font-weight: 900;
                color: ${colors.dark};
                text-align: center;
                padding: 4px 8px;
                letter-spacing: 0.05em;
                transition: transform 0.1s ease;
              ">
                ${reel3Items[0]}
              </div>
            </div>
          </div>
        </div>

        <!-- Mechanical Lever Arm on Right -->
        <div id="fb-lever-area" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          padding: 8px;
        " title="Pull lever to spin!">
          <!-- Lever Knob Ball -->
          <div id="fb-lever-knob" style="
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: radial-gradient(circle at 35% 35%, #ff4d64 0%, ${colors.red} 60%, #5e0513 100%);
            border: 2px solid #ffccd2;
            box-shadow: 0 4px 10px rgba(0,0,0,0.6);
            transition: transform 0.15s ease;
          "></div>
          <!-- Lever Shaft -->
          <div id="fb-lever-shaft" style="
            width: 8px;
            height: 80px;
            background: linear-gradient(90deg, #e0e0e0 0%, #ffffff 50%, #888888 100%);
            box-shadow: 2px 2px 5px rgba(0,0,0,0.5);
            transform-origin: bottom center;
            transition: transform 0.15s ease;
          "></div>
          <!-- Lever Base Socket -->
          <div style="
            width: 28px;
            height: 20px;
            background: #2a2a2a;
            border: 2px solid ${colors.gold};
            border-radius: 4px;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.8);
          "></div>
          <span style="
            margin-top: 6px;
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.1em;
            color: ${colors.gold};
          ">PULL</span>
        </div>
      </div>

      <!-- Result Banner & Action Button -->
      <div style="
        width: 100%;
        background: #090c0a;
        padding: 14px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid rgba(255, 196, 0, 0.2);
        gap: 16px;
      ">
        <div style="flex: 1;">
          <div style="font-size: 10px; font-weight: 700; color: ${colors.gold}; letter-spacing: 0.12em; text-transform: uppercase;">
            SELECTED SERVE PAIRING
          </div>
          <div id="fb-result-text" style="font-size: 14px; font-weight: 700; color: #fff; margin-top: 2px;">
            ${reel1Items[0]} • ${reel2Items[0]} • ${reel3Items[0]}
          </div>
        </div>

        <button id="fb-spin-btn" style="
          background: linear-gradient(135deg, ${colors.red} 0%, #8c0a1f 100%);
          color: #fff;
          border: 1px solid ${colors.gold};
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 0.1em;
          padding: 8px 20px;
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(200, 16, 46, 0.4);
          transition: transform 0.1s ease, filter 0.15s ease;
        ">
          SPIN WHEEL 🎲
        </button>
      </div>
    </div>
  `;

  const reel1El = stageEl.querySelector('#fb-reel-1');
  const reel2El = stageEl.querySelector('#fb-reel-2');
  const reel3El = stageEl.querySelector('#fb-reel-3');
  const resultEl = stageEl.querySelector('#fb-result-text');
  const leverEl = stageEl.querySelector('#fb-lever-area');
  const leverKnob = stageEl.querySelector('#fb-lever-knob');
  const leverShaft = stageEl.querySelector('#fb-lever-shaft');
  const spinBtn = stageEl.querySelector('#fb-spin-btn');

  function triggerSpin() {
    if (isSpinning) return;
    isSpinning = true;

    // Lever animation pull
    leverKnob.style.transform = 'translateY(40px) scale(0.9)';
    leverShaft.style.transform = 'scaleY(0.5)';
    setTimeout(() => {
      leverKnob.style.transform = 'translateY(0) scale(1)';
      leverShaft.style.transform = 'scaleY(1)';
    }, 220);

    resultEl.textContent = 'Decelerating reels...';
    resultEl.style.color = colors.gold;
    spinBtn.disabled = true;
    spinBtn.style.opacity = '0.5';

    // Randomize targets
    const target1 = Math.floor(Math.random() * reel1Items.length);
    const target2 = Math.floor(Math.random() * reel2Items.length);
    const target3 = Math.floor(Math.random() * reel3Items.length);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      playTick(400 + (step % 4) * 80);

      // Reel 1 spins until step 10 (~800ms)
      if (step <= 10) {
        reel1Idx = (reel1Idx + 1) % reel1Items.length;
        reel1El.textContent = reel1Items[reel1Idx];
        reel1El.style.transform = `translateY(${(step % 2 === 0 ? -4 : 4)}px)`;
      } else if (step === 11) {
        reel1Idx = target1;
        reel1El.textContent = reel1Items[target1];
        reel1El.style.transform = 'translateY(0)';
        playTick(750);
      }

      // Reel 2 spins until step 18 (~1440ms)
      if (step <= 18) {
        reel2Idx = (reel2Idx + 1) % reel2Items.length;
        reel2El.textContent = reel2Items[reel2Idx];
        reel2El.style.transform = `translateY(${(step % 2 === 0 ? -4 : 4)}px)`;
      } else if (step === 19) {
        reel2Idx = target2;
        reel2El.textContent = reel2Items[target2];
        reel2El.style.transform = 'translateY(0)';
        playTick(850);
      }

      // Reel 3 spins until step 26 (~2080ms)
      if (step <= 26) {
        reel3Idx = (reel3Idx + 1) % reel3Items.length;
        reel3El.textContent = reel3Items[reel3Idx];
        reel3El.style.transform = `translateY(${(step % 2 === 0 ? -4 : 4)}px)`;
      } else if (step === 27) {
        reel3Idx = target3;
        reel3El.textContent = reel3Items[target3];
        reel3El.style.transform = 'translateY(0)';
        clearInterval(interval);
        isSpinning = false;
        spinBtn.disabled = false;
        spinBtn.style.opacity = '1';
        resultEl.textContent = `${reel1Items[target1]} • ${reel2Items[target2]} • ${reel3Items[target3]}`;
        resultEl.style.color = '#fff';
        playWin();
      }
    }, 80);
  }

  leverEl.addEventListener('click', triggerSpin);
  spinBtn.addEventListener('click', triggerSpin);
}

