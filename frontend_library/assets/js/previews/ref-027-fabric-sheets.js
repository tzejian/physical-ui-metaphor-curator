/**
 * ref-027: Aralesk Collages & Motion - Draggable Fabric Sheets with Video Reveal
 * Draggable textured fabric swatches with cloth inertia and shadow scaling revealing video work underneath.
 */

export function mount(entry, stageEl) {
  const colors = {
    desk: '#14100C',
    linen: '#D9CFC0',
    linenDark: '#B8AB98',
    rust: '#B5442E',
    rustDark: '#8A2B19',
    sage: '#4A6741',
    sageDark: '#32472C',
    amber: '#FFC400',
    cream: '#F4EFE6'
  };

  const items = [
    {
      id: 'item-1',
      title: 'Kinetic Typography 2024',
      type: 'Motion Identity',
      duration: '0:45',
      color: colors.rust,
      fabricColor: '#B5442E',
      fabricTexture: 'repeating-linear-gradient(45deg, #B5442E 0px, #a83a25 2px, #c44f38 4px)',
      tag: 'COLLAGE // 01',
      bgArt: 'linear-gradient(135deg, #1b263b 0%, #0d1b2a 100%)',
      desc: 'Screen-printed serif glyphs in rotational physics.'
    },
    {
      id: 'item-2',
      title: 'Tactile Stop-Motion Showreel',
      type: 'Editorial Film',
      duration: '1:12',
      color: colors.linen,
      fabricColor: '#D9CFC0',
      fabricTexture: 'repeating-linear-gradient(135deg, #D9CFC0 0px, #ccbfad 2px, #dfd6c8 4px)',
      tag: 'LINEN // 02',
      bgArt: 'linear-gradient(135deg, #2b2d42 0%, #1a1b29 100%)',
      desc: 'Hand-torn construction paper and acetate overlays.'
    },
    {
      id: 'item-3',
      title: 'Cloth Dynamics & Weave Simulation',
      type: '3D Simulation',
      duration: '0:38',
      color: colors.sage,
      fabricColor: '#4A6741',
      fabricTexture: 'repeating-linear-gradient(90deg, #4A6741 0px, #3f5937 2px, #55754b 4px)',
      tag: 'WEAVE // 03',
      bgArt: 'linear-gradient(135deg, #3d2b1f 0%, #241912 100%)',
      desc: 'Real-time soft-body drape simulation with wind resistance.'
    }
  ];

  stageEl.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
      max-width: 680px;
      margin: 0 auto;
      background: ${colors.desk};
      border-radius: 12px;
      border: 1px solid #33281f;
      box-shadow: 0 16px 40px rgba(0,0,0,0.85);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: ${colors.cream};
      overflow: hidden;
      user-select: none;
    ">
      <!-- Desk Header -->
      <div style="
        width: 100%;
        background: #1e1712;
        padding: 12px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #3d3023;
      ">
        <div>
          <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.12em; color: ${colors.amber}; text-transform: uppercase;">
            ARALESK • COLLAGES & MOTION
          </div>
          <div style="font-size: 10px; color: #a39585; letter-spacing: 0.05em; text-transform: uppercase;">
            Drag fabric swatches aside to uncover motion work
          </div>
        </div>

        <button id="aral-reset-btn" style="
          background: rgba(255, 255, 255, 0.06);
          color: ${colors.cream};
          border: 1px solid #5a4735;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.15s ease;
        ">
          RESET SHEETS ↺
        </button>
      </div>

      <!-- Desk Canvas with 3 Showcases -->
      <div style="
        width: 100%;
        padding: 24px 20px;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 18px;
        background: radial-gradient(circle at 50% 50%, #211914 0%, ${colors.desk} 100%);
      ">
        ${items.map((item, idx) => `
          <div style="
            position: relative;
            height: 220px;
            background: #111;
            border-radius: 8px;
            overflow: visible;
            box-shadow: 0 4px 14px rgba(0,0,0,0.6);
          ">
            <!-- Underneath Video Card Revealed -->
            <div style="
              position: absolute;
              inset: 0;
              background: ${item.bgArt};
              border-radius: 8px;
              padding: 14px;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              border: 1px solid rgba(255,255,255,0.12);
              z-index: 1;
            ">
              <div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 9px; font-weight: 800; color: ${colors.amber}; letter-spacing: 0.12em;">REVEALED // 0${idx + 1}</span>
                  <span style="font-size: 10px; color: #8ecae6; font-family: monospace;">▶ ${item.duration}</span>
                </div>
                <div style="font-size: 14px; font-weight: 700; color: #fff; margin-top: 8px; line-height: 1.3;">
                  ${item.title}
                </div>
                <div style="font-size: 10px; color: #bbb; margin-top: 4px;">
                  ${item.desc}
                </div>
              </div>

              <div style="
                background: rgba(0,0,0,0.5);
                border: 1px solid rgba(255,255,255,0.15);
                border-radius: 4px;
                padding: 4px 8px;
                font-size: 9px;
                font-weight: 700;
                color: #e0e0e0;
                display: flex;
                align-items: center;
                justify-content: space-between;
              ">
                <span>MOTION WORK</span>
                <span style="color: #64dfdf;">HD 60FPS</span>
              </div>
            </div>

            <!-- Overlying Draggable Fabric Sheet -->
            <div id="aral-sheet-${idx}" class="aral-fabric-sheet" data-idx="${idx}" style="
              position: absolute;
              inset: -4px;
              background: ${item.fabricTexture};
              background-color: ${item.fabricColor};
              border-radius: 6px;
              z-index: 10;
              cursor: grab;
              box-shadow: 0 8px 18px rgba(0,0,0,0.7), inset 0 0 10px rgba(0,0,0,0.3);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              padding: 14px;
              transition: transform 0.25s cubic-bezier(0.2, 0.9, 0.3, 1), box-shadow 0.2s ease;
              color: ${idx === 1 ? '#222' : '#fff'};
            ">
              <!-- Fabric Tag & Stitches -->
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="
                  font-size: 9px;
                  font-weight: 800;
                  letter-spacing: 0.12em;
                  background: rgba(0,0,0,0.3);
                  color: #fff;
                  padding: 2px 6px;
                  border-radius: 3px;
                ">
                  ${item.tag}
                </span>
                <span style="font-size: 14px; opacity: 0.7;">⤹</span>
              </div>

              <!-- Center Affordance Hint -->
              <div style="text-align: center;">
                <div style="
                  display: inline-block;
                  font-size: 11px;
                  font-weight: 700;
                  letter-spacing: 0.08em;
                  padding: 4px 10px;
                  border-radius: 20px;
                  background: rgba(0,0,0,0.4);
                  color: #fff;
                  border: 1px dashed rgba(255,255,255,0.4);
                ">
                  DRAG ASIDE ⇄
                </div>
              </div>

              <!-- Hem edge / stitches -->
              <div style="
                border-top: 1px dashed rgba(255,255,255,0.35);
                padding-top: 6px;
                font-size: 9px;
                font-family: monospace;
                letter-spacing: 0.06em;
                opacity: 0.8;
                display: flex;
                justify-content: space-between;
              ">
                <span>HEM 100% COTTON</span>
                <span>PULL</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Desk Status Footer -->
      <div style="
        width: 100%;
        background: #110c09;
        padding: 10px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-top: 1px solid #291e14;
        font-size: 11px;
        color: #9c8e7e;
      ">
        <span id="aral-status">REVEALED 0 OF 3 PIECES UNDER FABRIC</span>
        <span style="color: ${colors.amber};">GSAP DRAGGABLE CLOTH METAPHOR</span>
      </div>
    </div>
  `;

  const sheets = stageEl.querySelectorAll('.aral-fabric-sheet');
  const statusEl = stageEl.querySelector('#aral-status');
  const resetBtn = stageEl.querySelector('#aral-reset-btn');

  const sheetStates = [
    { revealed: false, currentX: 0, currentY: 0, rot: 0 },
    { revealed: false, currentX: 0, currentY: 0, rot: 0 },
    { revealed: false, currentX: 0, currentY: 0, rot: 0 }
  ];

  function updateStatus() {
    const revealedCount = sheetStates.filter(s => s.revealed).length;
    statusEl.textContent = `REVEALED ${revealedCount} OF 3 PIECES UNDER FABRIC`;
  }

  sheets.forEach((sheet) => {
    const idx = parseInt(sheet.dataset.idx, 10);
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    sheet.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX - sheetStates[idx].currentX;
      startY = e.clientY - sheetStates[idx].currentY;
      sheet.style.cursor = 'grabbing';
      sheet.style.zIndex = '20';
      sheet.style.boxShadow = '0 16px 32px rgba(0,0,0,0.85)';
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      sheetStates[idx].currentX = dx;
      sheetStates[idx].currentY = dy;
      sheetStates[idx].rot = dx * 0.08;
      sheet.style.transform = `translate(${dx}px, ${dy}px) rotate(${sheetStates[idx].rot}deg)`;

      // If dragged sufficiently far, mark revealed
      if (Math.abs(dx) > 70 || Math.abs(dy) > 70) {
        sheetStates[idx].revealed = true;
        updateStatus();
      }
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      sheet.style.cursor = 'grab';
      sheet.style.zIndex = '10';
      sheet.style.boxShadow = '0 8px 18px rgba(0,0,0,0.7)';

      // Settle physics: if dragged far, settle off to the side with residual cloth angle
      if (Math.abs(sheetStates[idx].currentX) > 70 || Math.abs(sheetStates[idx].currentY) > 70) {
        sheetStates[idx].revealed = true;
        // Keep it offset
      } else {
        // Snap back if barely moved
        sheetStates[idx].currentX = 0;
        sheetStates[idx].currentY = 0;
        sheetStates[idx].rot = 0;
        sheetStates[idx].revealed = false;
        sheet.style.transform = 'translate(0, 0) rotate(0deg)';
      }
      updateStatus();
    });

    // Touch support for mobile / tablets
    sheet.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        startX = e.touches[0].clientX - sheetStates[idx].currentX;
        startY = e.touches[0].clientY - sheetStates[idx].currentY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      sheetStates[idx].currentX = dx;
      sheetStates[idx].currentY = dy;
      sheetStates[idx].rot = dx * 0.08;
      sheet.style.transform = `translate(${dx}px, ${dy}px) rotate(${sheetStates[idx].rot}deg)`;
      if (Math.abs(dx) > 70 || Math.abs(dy) > 70) {
        sheetStates[idx].revealed = true;
        updateStatus();
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      if (Math.abs(sheetStates[idx].currentX) > 70 || Math.abs(sheetStates[idx].currentY) > 70) {
        sheetStates[idx].revealed = true;
      } else {
        sheetStates[idx].currentX = 0;
        sheetStates[idx].currentY = 0;
        sheetStates[idx].rot = 0;
        sheetStates[idx].revealed = false;
        sheet.style.transform = 'translate(0, 0) rotate(0deg)';
      }
      updateStatus();
    });

    // Click on sheet to toggle peel
    sheet.addEventListener('dblclick', () => {
      if (!sheetStates[idx].revealed) {
        sheetStates[idx].currentX = 140;
        sheetStates[idx].currentY = 40;
        sheetStates[idx].rot = 12;
        sheetStates[idx].revealed = true;
      } else {
        sheetStates[idx].currentX = 0;
        sheetStates[idx].currentY = 0;
        sheetStates[idx].rot = 0;
        sheetStates[idx].revealed = false;
      }
      sheet.style.transform = `translate(${sheetStates[idx].currentX}px, ${sheetStates[idx].currentY}px) rotate(${sheetStates[idx].rot}deg)`;
      updateStatus();
    });
  });

  resetBtn.addEventListener('click', () => {
    sheets.forEach((sheet, idx) => {
      sheetStates[idx].currentX = 0;
      sheetStates[idx].currentY = 0;
      sheetStates[idx].rot = 0;
      sheetStates[idx].revealed = false;
      sheet.style.transform = 'translate(0, 0) rotate(0deg)';
    });
    updateStatus();
  });
}

