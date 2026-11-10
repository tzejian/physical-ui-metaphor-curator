/**
 * ref-025: The Turn of the Screw - Curtain Overlay Menu for Opera
 * Heavy velvet drapes that part to reveal playbill act navigation and scenography.
 */

export function mount(entry, stageEl) {
  const colors = {
    black: '#000000',
    velvet: '#7A1024',
    velvetDark: '#420712',
    gold: '#C9A227',
    goldLight: '#E8CA65',
    cream: '#F2EAD3',
    charcoal: '#161314'
  };

  const acts = [
    { num: 'PROLOGUE', title: 'The Journey to Bly House', subtitle: 'A strange commission in London', duration: '12 min' },
    { num: 'ACT I', title: 'The Welcome & The Tower', subtitle: 'A glimpse of Peter Quint upon the ramparts', duration: '28 min' },
    { num: 'ACT II', title: 'The Lake & Miss Jessel', subtitle: 'Flora plays beside the silent water', duration: '34 min' },
    { num: 'ACT III', title: 'The Bedroom at Night', subtitle: 'A candle flickers out in the cold wind', duration: '22 min' },
    { num: 'FINALE', title: "Miles' Confession", subtitle: 'The final struggle for a young soul', duration: '19 min' }
  ];

  let isOpen = false;
  let selectedAct = 0;
  let audioCtx = null;

  function playTone(freq, type = 'sine', dur = 0.5) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch (_) {}
  }

  stageEl.innerHTML = `
    <div class="tot-container" style="
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
      background: ${colors.charcoal};
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(201, 162, 39, 0.35);
      box-shadow: 0 16px 40px rgba(0,0,0,0.85);
      font-family: 'Georgia', serif;
      color: ${colors.cream};
      user-select: none;
    ">
      <!-- Proscenium Arch Header -->
      <div style="
        width: 100%;
        background: linear-gradient(180deg, #1f050b 0%, #0d0205 100%);
        padding: 12px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid ${colors.gold};
        box-shadow: inset 0 -2px 6px rgba(0,0,0,0.6);
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 18px; color: ${colors.gold};">✦</span>
          <div>
            <div style="font-size: 13px; font-weight: 700; letter-spacing: 0.16em; color: ${colors.goldLight}; text-transform: uppercase;">
              THE TURN OF THE SCREW
            </div>
            <div style="font-size: 10px; font-family: sans-serif; letter-spacing: 0.1em; color: #a89f91; text-transform: uppercase;">
              Benjamin Britten • Opera North Trailer
            </div>
          </div>
        </div>

        <button id="tot-curtain-toggle" style="
          background: linear-gradient(135deg, ${colors.goldLight} 0%, ${colors.gold} 100%);
          color: #111;
          border: none;
          font-family: sans-serif;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.08em;
          padding: 7px 16px;
          border-radius: 20px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(201, 162, 39, 0.4);
          transition: transform 0.15s ease, background 0.2s ease;
        ">
          PART CURTAIN ⤢
        </button>
      </div>

      <!-- Stage & Drape Viewport -->
      <div id="tot-stage" style="
        position: relative;
        width: 100%;
        height: 380px;
        background: radial-gradient(ellipse at 50% 40%, #1e1b18 0%, #070707 90%);
        overflow: hidden;
      ">
        <!-- Stage Background / Revealed Content -->
        <div id="tot-stage-content" style="
          position: absolute;
          inset: 0;
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          z-index: 1;
        ">
          <!-- Playbill Act Selector -->
          <div>
            <div style="
              text-align: center;
              font-size: 11px;
              font-family: sans-serif;
              letter-spacing: 0.24em;
              color: ${colors.gold};
              text-transform: uppercase;
              margin-bottom: 4px;
            ">
              SCENOGRAPHY & ACT NAVIGATION
            </div>
            <div style="
              text-align: center;
              font-size: 22px;
              font-style: italic;
              color: ${colors.cream};
              margin-bottom: 16px;
              text-shadow: 0 2px 8px rgba(0,0,0,0.9);
            ">
              Select an Act to Stage
            </div>

            <!-- Acts List -->
            <div id="tot-acts-list" style="
              display: flex;
              flex-direction: column;
              gap: 8px;
              max-width: 480px;
              margin: 0 auto;
            ">
              ${acts.map((act, i) => `
                <div class="tot-act-card" data-idx="${i}" style="
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 8px 14px;
                  background: ${i === 0 ? 'rgba(122, 16, 36, 0.35)' : 'rgba(255, 255, 255, 0.04)'};
                  border: 1px solid ${i === 0 ? colors.gold : 'rgba(201, 162, 39, 0.2)'};
                  border-radius: 6px;
                  cursor: pointer;
                  transition: all 0.2s ease;
                ">
                  <div style="display: flex; align-items: baseline; gap: 10px;">
                    <span style="font-family: sans-serif; font-size: 10px; font-weight: 700; color: ${colors.gold}; letter-spacing: 0.1em; width: 64px;">${act.num}</span>
                    <span style="font-size: 14px; color: ${colors.cream}; font-weight: 600;">${act.title}</span>
                  </div>
                  <span style="font-family: sans-serif; font-size: 11px; color: #a09789;">${act.duration}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Active Scene Synopsis -->
          <div id="tot-act-synopsis" style="
            text-align: center;
            font-size: 12px;
            font-style: italic;
            color: #d1c8b8;
            border-top: 1px dashed rgba(201, 162, 39, 0.3);
            padding-top: 10px;
          ">
            “${acts[0].subtitle}”
          </div>
        </div>

        <!-- Left Curtain Drape -->
        <div id="tot-curtain-left" style="
          position: absolute;
          top: 0;
          left: 0;
          width: 50.5%;
          height: 100%;
          z-index: 10;
          background: repeating-linear-gradient(
            90deg,
            #420712 0px,
            #7A1024 16px,
            #941931 28px,
            #580b19 44px,
            #30040c 56px
          );
          box-shadow: inset -10px 0 25px rgba(0,0,0,0.8), 8px 0 20px rgba(0,0,0,0.7);
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1);
          transform: translateX(0);
          display: flex;
          align-items: flex-end;
          cursor: pointer;
        ">
          <!-- Gold fringe bottom hem -->
          <div style="
            width: 100%;
            height: 16px;
            background: repeating-linear-gradient(
              90deg,
              ${colors.gold} 0px,
              ${colors.goldLight} 4px,
              #806212 8px
            );
            box-shadow: 0 -2px 4px rgba(0,0,0,0.5);
          "></div>
        </div>

        <!-- Right Curtain Drape -->
        <div id="tot-curtain-right" style="
          position: absolute;
          top: 0;
          right: 0;
          width: 50.5%;
          height: 100%;
          z-index: 10;
          background: repeating-linear-gradient(
            90deg,
            #30040c 0px,
            #580b19 12px,
            #941931 28px,
            #7A1024 40px,
            #420712 56px
          );
          box-shadow: inset 10px 0 25px rgba(0,0,0,0.8), -8px 0 20px rgba(0,0,0,0.7);
          transition: transform 0.85s cubic-bezier(0.25, 1, 0.5, 1);
          transform: translateX(0);
          display: flex;
          align-items: flex-end;
          cursor: pointer;
        ">
          <!-- Gold fringe bottom hem -->
          <div style="
            width: 100%;
            height: 16px;
            background: repeating-linear-gradient(
              90deg,
              ${colors.gold} 0px,
              ${colors.goldLight} 4px,
              #806212 8px
            );
            box-shadow: 0 -2px 4px rgba(0,0,0,0.5);
          "></div>
        </div>

        <!-- Center Golden Tassel Pull Cord -->
        <div id="tot-tassel-pull" style="
          position: absolute;
          top: 30%;
          left: 50%;
          transform: translateX(-50%);
          z-index: 15;
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transition: opacity 0.4s ease, transform 0.2s ease;
        " title="Click or pull to part curtains">
          <div style="
            width: 4px;
            height: 60px;
            background: linear-gradient(180deg, ${colors.goldLight} 0%, ${colors.gold} 100%);
            box-shadow: 0 0 6px rgba(201, 162, 39, 0.6);
          "></div>
          <div style="
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: radial-gradient(circle at 35% 35%, ${colors.goldLight} 0%, #806212 100%);
            border: 1px solid #ffe894;
            box-shadow: 0 4px 10px rgba(0,0,0,0.8);
          "></div>
          <div style="
            width: 14px;
            height: 32px;
            background: repeating-linear-gradient(
              90deg,
              ${colors.gold} 0px,
              ${colors.goldLight} 2px,
              #61490d 4px
            );
            border-radius: 0 0 6px 6px;
            margin-top: -2px;
          "></div>
          <div style="
            margin-top: 10px;
            font-family: sans-serif;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.12em;
            color: ${colors.goldLight};
            background: rgba(0,0,0,0.7);
            padding: 4px 10px;
            border-radius: 12px;
            border: 1px solid rgba(201, 162, 39, 0.4);
            white-space: nowrap;
          ">
            CLICK TO OPEN
          </div>
        </div>
      </div>

      <!-- Velvet Footer Bar -->
      <div style="
        width: 100%;
        background: #0d0205;
        padding: 10px 18px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: sans-serif;
        font-size: 11px;
        color: #999;
        border-top: 1px solid rgba(201, 162, 39, 0.2);
      ">
        <span id="tot-status">STAGE STATUS: DRAPES DRAWN CLOSED</span>
        <span style="color: ${colors.gold};">AWWWARDS SOTD 7.59 • LUSION</span>
      </div>
    </div>
  `;

  const btnToggle = stageEl.querySelector('#tot-curtain-toggle');
  const curtainLeft = stageEl.querySelector('#tot-curtain-left');
  const curtainRight = stageEl.querySelector('#tot-curtain-right');
  const tassel = stageEl.querySelector('#tot-tassel-pull');
  const statusEl = stageEl.querySelector('#tot-status');
  const actCards = stageEl.querySelectorAll('.tot-act-card');
  const synopsisEl = stageEl.querySelector('#tot-act-synopsis');

  function updateCurtains() {
    if (isOpen) {
      curtainLeft.style.transform = 'translateX(-86%)';
      curtainRight.style.transform = 'translateX(86%)';
      tassel.style.opacity = '0';
      tassel.style.pointerEvents = 'none';
      btnToggle.textContent = 'CLOSE CURTAIN ✕';
      btnToggle.style.background = 'linear-gradient(135deg, #e05260 0%, #991425 100%)';
      btnToggle.style.color = '#fff';
      statusEl.textContent = `STAGE STATUS: CURTAIN PARTED — ${acts[selectedAct].num}`;
      playTone(196, 'sine', 0.8); // G3 opera bass resonance
    } else {
      curtainLeft.style.transform = 'translateX(0)';
      curtainRight.style.transform = 'translateX(0)';
      tassel.style.opacity = '1';
      tassel.style.pointerEvents = 'auto';
      btnToggle.textContent = 'PART CURTAIN ⤢';
      btnToggle.style.background = `linear-gradient(135deg, ${colors.goldLight} 0%, ${colors.gold} 100%)`;
      btnToggle.style.color = '#111';
      statusEl.textContent = 'STAGE STATUS: DRAPES DRAWN CLOSED';
      playTone(146.8, 'triangle', 0.7); // D3 drape close swish
    }
  }

  btnToggle.addEventListener('click', () => {
    isOpen = !isOpen;
    updateCurtains();
  });

  tassel.addEventListener('click', () => {
    isOpen = true;
    updateCurtains();
  });

  curtainLeft.addEventListener('click', () => {
    if (!isOpen) {
      isOpen = true;
      updateCurtains();
    }
  });

  curtainRight.addEventListener('click', () => {
    if (!isOpen) {
      isOpen = true;
      updateCurtains();
    }
  });

  actCards.forEach((card) => {
    card.addEventListener('click', () => {
      const idx = parseInt(card.dataset.idx, 10);
      selectedAct = idx;
      actCards.forEach((c, i) => {
        c.style.background = i === idx ? 'rgba(122, 16, 36, 0.45)' : 'rgba(255, 255, 255, 0.04)';
        c.style.borderColor = i === idx ? colors.gold : 'rgba(201, 162, 39, 0.2)';
      });
      synopsisEl.textContent = `“${acts[idx].subtitle}”`;
      statusEl.textContent = `STAGE STATUS: CURTAIN PARTED — ${acts[idx].num}`;
      playTone(392 + idx * 44, 'sine', 0.4);
    });
  });
}

