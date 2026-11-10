/**
 * previews/ref-007-hanging-threads.js
 *
 * Interactive metaphor preview for ref-007: DVR Labs Playful 404 —
 * Numbers Hanging on Threads.
 *
 * Abstraction level: Mid-right — playful-brutalist / industrial hardware.
 * Technique: Each "404" digit hangs from a thread (SVG line with sag)
 * as a damped pendulum. An ambient simplex-noise breeze keeps them gently
 * swaying. Mouse/pointer velocity pushes the digits proportionally.
 * Dragging a digit past the thread length snaps the thread — the digit
 * falls, bounces, and rests on a shelf, then auto re-hangs after a delay.
 *
 * Simplified physics: single pendulum per digit with damping, rendered
 * via rAF. SVG threads use a quadratic bezier for sag.
 *
 * Token fidelity (ref-007):
 *   Colors  : #F6F3EC (page), #1A1A1A (digits/thread), #FF3D1F (accent/snap)
 *   Borders : 1-2px SVG strokes; digits as solid heavy glyphs, no decorative borders
 *   Elevation: flat page; depth implied by swing amplitude and thread sag
 *   Typography: oversized display digits as physical objects
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#F6F3EC', '#1A1A1A', '#FF3D1F'];

  const pageBg = colors[0] ?? '#F6F3EC';
  const ink    = colors[1] ?? '#1A1A1A';
  const accent = colors[2] ?? '#FF3D1F';

  stageEl.innerHTML = buildStageHtml(pageBg, ink, accent);
  initPhysics(stageEl, pageBg, ink, accent);
}

// ── Config ────────────────────────────────────────────────────────────────────

const DIGITS       = ['4', '0', '4'];
const THREAD_LEN   = 80;          // px
const GRAVITY      = 0.0015;      // acceleration per frame²
const DAMPING      = 0.985;
const BREEZE_AMP   = 0.003;       // radians
const SNAP_ANGLE   = Math.PI / 3; // ~60° — angle at which thread snaps
const REHANG_DELAY = 2500;        // ms before auto re-hang

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(pageBg, ink, accent) {
  return `
    <style>
      .ht-scene {
        display:flex; flex-direction:column; width:100%;
        font-family:var(--font-sans);
      }
      .ht-label {
        font-size:.6875rem; font-weight:700; letter-spacing:.1em;
        text-transform:uppercase; color:var(--text-muted); margin-bottom:14px;
      }

      /* Hanging area */
      .ht-stage {
        position:relative; width:100%; height:260px;
        background:${pageBg}; border-radius:8px;
        overflow:hidden; touch-action:none; cursor:default;
      }

      /* Ceiling bar */
      .ht-ceiling {
        position:absolute; top:0; left:0; right:0; height:4px;
        background:${ink};
      }

      /* SVG overlay for threads */
      .ht-svg {
        position:absolute; inset:0; pointer-events:none;
      }
      .ht-thread {
        stroke:${ink}; stroke-width:1.5; fill:none;
        stroke-linecap:round;
      }
      .ht-thread--snapped {
        stroke:${accent}; opacity:.4;
      }

      /* Digit */
      .ht-digit {
        position:absolute;
        font-size:3.5rem; font-weight:900; line-height:1;
        color:${ink}; cursor:grab;
        user-select:none; touch-action:none;
        transform-origin:top center;
        transition:color .2s;
      }
      .ht-digit:active { cursor:grabbing; }
      .ht-digit--fallen {
        cursor:default;
        transition:transform .1s ease-out, color .2s;
      }

      /* Shelf */
      .ht-shelf {
        position:absolute; bottom:36px; left:10%; right:10%;
        height:3px; background:${ink};
      }

      /* Below-shelf copy */
      .ht-copy {
        position:absolute; bottom:8px; left:0; right:0;
        text-align:center; font-size:.6875rem;
        color:${ink}88;
      }
      .ht-copy a { color:${accent}; text-decoration:none; font-weight:600; }
      .ht-copy a:hover { text-decoration:underline; }

      /* Replay button */
      .ht-replay {
        position:absolute; top:12px; right:12px;
        background:transparent; border:1px solid ${ink}33; border-radius:4px;
        color:${ink}88; font-size:.5625rem; font-weight:700;
        letter-spacing:.1em; text-transform:uppercase;
        padding:4px 10px; cursor:pointer;
        transition:all .15s;
      }
      .ht-replay:hover { border-color:${accent}; color:${accent}; }

      .ht-hint {
        font-size:.6875rem; color:var(--text-muted);
        margin-top:12px; font-style:italic;
      }
    </style>

    <div class="ht-scene">
      <p class="ht-label">Interactive Metaphor Preview — 404 Hanging Threads</p>

      <div class="ht-stage" id="ht-stage">
        <div class="ht-ceiling"></div>
        <svg class="ht-svg" id="ht-svg"></svg>
        <div class="ht-shelf"></div>
        <div class="ht-copy">Page not found · <a href="#">go home</a></div>
        <button class="ht-replay" id="ht-replay">↺ Re-hang</button>
      </div>

      <p class="ht-hint">↑ Move cursor over digits to push · Drag a digit to snap its thread</p>
    </div>`;
}

// ── Physics ───────────────────────────────────────────────────────────────────

function initPhysics(stageEl, pageBg, ink, accent) {
  const stage  = stageEl.querySelector('#ht-stage');
  const svg    = stageEl.querySelector('#ht-svg');
  const replay = stageEl.querySelector('#ht-replay');
  if (!stage || !svg) return;

  const stageRect = () => stage.getBoundingClientRect();

  // Create digit elements and state
  const pendulums = DIGITS.map((ch, i) => {
    // Digit element
    const el = document.createElement('div');
    el.className = 'ht-digit';
    el.textContent = ch;
    el.setAttribute('aria-hidden', 'true');
    stage.appendChild(el);

    // Thread SVG path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.classList.add('ht-thread');
    svg.appendChild(path);

    return {
      el,
      path,
      char:      ch,
      index:     i,
      // Anchor position (fraction of stage width)
      anchorX:   0.25 + i * 0.25,
      angle:     (Math.random() - 0.5) * 0.1, // slight random start
      velocity:  0,
      hung:      true,
      fallY:     0,
      fallVelY:  0,
      fallAngle: 0,
      rehangTimer: null,
    };
  });

  let lastTime  = performance.now();
  let animFrame = null;
  let pointerX  = null;
  let pointerY  = null;
  let pointerVX = 0;
  let lastPX    = null;

  // Pointer tracking for breeze push
  stage.addEventListener('pointermove', e => {
    const r = stageRect();
    pointerX = e.clientX - r.left;
    pointerY = e.clientY - r.top;
    if (lastPX !== null) {
      pointerVX = (pointerX - lastPX) * 0.006;
    }
    lastPX = pointerX;
  });

  stage.addEventListener('pointerleave', () => {
    pointerX = null; pointerY = null; lastPX = null; pointerVX = 0;
  });

  // Drag to snap
  pendulums.forEach(p => {
    let dragging = false;
    let dragStartAngle = 0;

    p.el.addEventListener('pointerdown', e => {
      if (!p.hung) return;
      dragging = true;
      p.el.setPointerCapture(e.pointerId);
      dragStartAngle = p.angle;
      e.preventDefault();
    });

    p.el.addEventListener('pointermove', e => {
      if (!dragging || !p.hung) return;
      const r   = stageRect();
      const ax  = r.width * p.anchorX;
      const ay  = 4; // ceiling
      const mx  = e.clientX - r.left;
      const my  = e.clientY - r.top;
      const dx  = mx - ax;
      const dy  = my - ay;
      const a   = Math.atan2(dx, dy);
      p.angle    = clamp(a, -Math.PI / 2, Math.PI / 2);
      p.velocity = 0;

      if (Math.abs(p.angle) > SNAP_ANGLE) {
        snapThread(p);
        dragging = false;
      }
    });

    p.el.addEventListener('pointerup',     () => { dragging = false; });
    p.el.addEventListener('pointercancel', () => { dragging = false; });
  });

  // Replay button
  replay.addEventListener('click', () => {
    pendulums.forEach(p => {
      if (!p.hung) rehang(p);
    });
  });

  // ── Simulation loop ──────────────────────────────────────────────────────

  function tick(now) {
    const dt = Math.min(now - lastTime, 32); // cap delta
    lastTime = now;

    const r = stageRect();
    const w = r.width;
    const h = r.height;
    const shelfY = h - 36 - 3; // shelf top

    pendulums.forEach(p => {
      if (p.hung) {
        // Gravity torque
        const accel = -GRAVITY * Math.sin(p.angle) * dt;
        p.velocity += accel;

        // Breeze (simple sine wave offset by index)
        const breeze = Math.sin(now * 0.001 + p.index * 2.1) * BREEZE_AMP * 0.3;
        p.velocity += breeze * dt * 0.01;

        // Pointer push
        if (pointerX !== null) {
          const ax = w * p.anchorX;
          const digitX = ax + Math.sin(p.angle) * THREAD_LEN;
          const dist = Math.abs(pointerX - digitX);
          if (dist < 60 && pointerVX !== 0) {
            p.velocity += pointerVX * (1 - dist / 60) * 0.15;
          }
        }

        p.velocity *= DAMPING;
        p.angle    += p.velocity;
        p.angle     = clamp(p.angle, -Math.PI / 2, Math.PI / 2);

        // Position
        const ax = w * p.anchorX;
        const ay = 4;
        const dx = Math.sin(p.angle) * THREAD_LEN;
        const dy = Math.cos(p.angle) * THREAD_LEN;
        const ex = ax + dx;
        const ey = ay + dy;

        p.el.style.left = `${ex - 22}px`;
        p.el.style.top  = `${ey}px`;
        p.el.style.transform = `rotate(${p.angle * 0.3}rad)`;

        // Thread sag
        const sagX = ax + dx * 0.5 + Math.sin(p.angle) * 4;
        const sagY = ay + dy * 0.5 + 6;
        p.path.setAttribute('d', `M${ax},${ay} Q${sagX},${sagY} ${ex},${ey}`);
        p.path.classList.remove('ht-thread--snapped');

      } else {
        // Falling digit
        p.fallVelY += 0.4; // gravity
        p.fallY    += p.fallVelY;

        // Bounce off shelf
        const digitBottom = p.fallY + 52;
        if (digitBottom >= shelfY && p.fallVelY > 0) {
          p.fallY    = shelfY - 52;
          p.fallVelY = -p.fallVelY * 0.3;
          p.fallAngle += (Math.random() - 0.5) * 20;

          if (Math.abs(p.fallVelY) < 1) {
            // Settle
            p.fallVelY = 0;
            p.fallAngle = 70 + Math.random() * 20; // roll flat-ish
          }
        }

        const ax = w * p.anchorX;
        p.el.style.left = `${ax - 22 + p.fallAngle * 0.3}px`;
        p.el.style.top  = `${p.fallY}px`;
        p.el.style.transform = `rotate(${p.fallAngle}deg)`;

        // Hide thread
        p.path.setAttribute('d', '');
      }
    });

    pointerVX *= 0.9; // decay
    animFrame = requestAnimationFrame(tick);
  }

  animFrame = requestAnimationFrame(tick);

  // Pause when not visible
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (!animFrame) {
          lastTime = performance.now();
          animFrame = requestAnimationFrame(tick);
        }
      } else {
        if (animFrame) {
          cancelAnimationFrame(animFrame);
          animFrame = null;
        }
      }
    });
  }, { threshold: 0.1 });
  observer.observe(stage);

  // ── Snap / rehang helpers ─────────────────────────────────────────────────

  function snapThread(p) {
    p.hung     = false;
    const r    = stageRect();
    const ax   = r.width * p.anchorX;
    const ay   = 4;
    p.fallY    = ay + Math.cos(p.angle) * THREAD_LEN;
    p.fallVelY = 2 + Math.abs(p.velocity) * 40;
    p.fallAngle = p.angle * (180 / Math.PI) * 0.5;

    p.el.style.color = accent;
    p.path.classList.add('ht-thread--snapped');
    // Draw a short dangling stub from ceiling
    p.path.setAttribute('d', `M${ax},${ay} L${ax + Math.sin(p.angle) * 15},${ay + 15}`);

    // Auto re-hang
    p.rehangTimer = setTimeout(() => rehang(p), REHANG_DELAY);
  }

  function rehang(p) {
    if (p.rehangTimer) clearTimeout(p.rehangTimer);
    p.hung      = true;
    p.angle     = (Math.random() - 0.5) * 0.15;
    p.velocity  = 0;
    p.fallY     = 0;
    p.fallVelY  = 0;
    p.fallAngle = 0;
    p.el.style.color = '';
    p.el.classList.remove('ht-digit--fallen');
    p.path.classList.remove('ht-thread--snapped');
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

