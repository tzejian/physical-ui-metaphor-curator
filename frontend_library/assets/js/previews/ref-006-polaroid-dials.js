/**
 * previews/ref-006-polaroid-dials.js
 *
 * Interactive metaphor preview for ref-006: Polaroid I-2 —
 * Physical Camera Dials & Instant Photo Frame.
 *
 * Abstraction level: Mid-spectrum — flat skeuomorphic / retro-tactile.
 * Technique: A rotatable aperture-style dial with tactile detent positions
 * and engraved camera legend labels. Rotating the dial changes a "feature
 * card" that ejects from a slot like an instant photo developing. Below:
 * a mini gallery of instant-photo frames with the classic white border.
 *
 * Token fidelity (ref-006):
 *   Colors  : #0E0E0E (camera body), #FFB500 (accent/gold)
 *   Borders : nearly borderless; white instant-photo frames only
 *   Elevation: flat UI chrome; depth from simulated 3D dial lighting
 *   Typography: compact uppercase grotesque labels echoing engraved legends
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#0E0E0E', '#FFB500'];

  const body   = colors[0] ?? '#0E0E0E';
  const gold   = colors[1] ?? '#FFB500';

  stageEl.innerHTML = buildStageHtml(body, gold);
  attachInteractions(stageEl, body, gold);
}

// ── Feature data ──────────────────────────────────────────────────────────────

const FEATURES = [
  { position: 'AUTO',   title: 'Auto Mode',         desc: 'Camera chooses optimal aperture and shutter speed. Point, shoot, done.' },
  { position: 'f/8',    title: 'Aperture f/8',       desc: 'Deep depth of field. Landscapes and groups stay sharp front to back.' },
  { position: 'f/11',   title: 'Aperture f/11',      desc: 'Maximum sharpness zone. Ideal for architecture and bright daylight.' },
  { position: 'f/22',   title: 'Aperture f/22',      desc: 'Pinhole-narrow. Long exposures, light trails, and creative blur control.' },
  { position: 'f/64',   title: 'Zone System',        desc: 'Homage to large-format photography. Every tonal value placed with intent.' },
  { position: 'BULB',   title: 'Bulb / Long Exp',    desc: 'Shutter stays open while pressed. Night sky, fireworks, light painting.' },
];

const GALLERY = [
  { label: 'Portrait Study',     color: '#3a2f28' },
  { label: 'Golden Hour',        color: '#8a6e3b' },
  { label: 'Street Geometry',    color: '#2a3a4a' },
  { label: 'Still Life',         color: '#4a3a2a' },
];

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(body, gold) {
  // Dial tick marks
  const ticksHtml = FEATURES.map((f, i) => {
    const angle = (i / FEATURES.length) * 360;
    return `<div class="pd-tick" style="transform:rotate(${angle}deg);">
              <span class="pd-tick__mark"></span>
              <span class="pd-tick__label" style="transform:rotate(${-angle}deg);">${f.position}</span>
            </div>`;
  }).join('');

  // Gallery instant photos
  const galleryHtml = GALLERY.map(g =>
    `<div class="pd-photo">
       <div class="pd-photo__image" style="background:${g.color};"></div>
       <div class="pd-photo__caption">${esc(g.label)}</div>
     </div>`).join('');

  return `
    <style>
      .pd-scene { display:flex; flex-direction:column; width:100%; align-items:center; }
      .pd-label { font-size:.6875rem; font-weight:700; letter-spacing:.1em;
                  text-transform:uppercase; color:var(--text-muted); margin-bottom:18px;
                  align-self:flex-start; }

      /* ── Dial section ── */
      .pd-dial-section {
        display:flex; align-items:center; gap:28px; width:100%;
        justify-content:center; flex-wrap:wrap; margin-bottom:28px;
      }

      /* Dial container */
      .pd-dial-wrap {
        position:relative; width:180px; height:180px; flex-shrink:0;
      }

      /* Outer ring */
      .pd-dial-ring {
        position:absolute; inset:0; border-radius:50%;
        background:conic-gradient(
          ${body} 0deg, #222 30deg, ${body} 60deg, #222 90deg,
          ${body} 120deg, #222 150deg, ${body} 180deg, #222 210deg,
          ${body} 240deg, #222 270deg, ${body} 300deg, #222 330deg,
          ${body} 360deg
        );
        box-shadow:inset 0 1px 3px rgba(255,255,255,.08), 0 2px 12px rgba(0,0,0,.6);
      }

      /* Knurled edge illusion */
      .pd-dial-knurl {
        position:absolute; inset:4px; border-radius:50%;
        background:radial-gradient(circle, ${body} 60%, transparent 62%);
        border:1px solid rgba(255,255,255,.05);
      }

      /* Rotatable inner disc */
      .pd-dial-inner {
        position:absolute; inset:14px; border-radius:50%;
        background:${body};
        border:1px solid rgba(255,255,255,.06);
        cursor:grab; touch-action:none;
        transition:transform 0.25s cubic-bezier(.4,0,.2,1);
      }
      .pd-dial-inner:active { cursor:grabbing; }

      /* Tick marks container */
      .pd-ticks {
        position:absolute; inset:0; border-radius:50%;
      }
      .pd-tick {
        position:absolute; top:0; left:50%; width:0; height:50%;
        transform-origin:bottom center;
        display:flex; flex-direction:column; align-items:center;
        pointer-events:none;
      }
      .pd-tick__mark {
        display:block; width:2px; height:10px; background:${gold};
        margin-top:4px;
      }
      .pd-tick__label {
        font-size:.5rem; font-weight:700; letter-spacing:.08em;
        color:${gold}; margin-top:2px; white-space:nowrap;
      }

      /* Center dot / pointer */
      .pd-dial-center {
        position:absolute; top:50%; left:50%;
        width:24px; height:24px; border-radius:50%;
        transform:translate(-50%,-50%);
        background:${gold};
        box-shadow:0 0 8px ${gold}44;
        z-index:3; pointer-events:none;
      }
      /* Pointer notch */
      .pd-pointer {
        position:absolute; top:8px; left:50%;
        width:2px; height:16px; background:${gold};
        transform:translateX(-50%);
        z-index:4; pointer-events:none;
      }

      /* ── Feature card (instant photo eject) ── */
      .pd-feature-card {
        background:#fff; color:#111; width:200px;
        padding:16px 14px 20px;
        display:flex; flex-direction:column; gap:6px;
        transition:transform 0.35s cubic-bezier(.2,.8,.3,1), opacity 0.25s;
        transform-origin:top center;
      }
      .pd-feature-card.is-ejecting {
        animation:pd-eject 0.4s cubic-bezier(.2,.8,.3,1);
      }
      @keyframes pd-eject {
        0%   { transform:translateY(-20px) scale(.96); opacity:0; }
        50%  { transform:translateY(4px) scale(1.01); opacity:1; }
        100% { transform:translateY(0) scale(1); opacity:1; }
      }
      .pd-feature-card__position {
        font-size:.5625rem; font-weight:700; letter-spacing:.2em;
        color:${gold}; text-transform:uppercase;
      }
      .pd-feature-card__title {
        font-size:.9375rem; font-weight:700; letter-spacing:-.01em;
      }
      .pd-feature-card__desc {
        font-size:.75rem; color:#555; line-height:1.5;
      }
      /* White border frame (instant photo style) */
      .pd-feature-card__border {
        border:10px solid #fff; box-shadow:0 2px 8px rgba(0,0,0,.15);
      }

      /* ── Gallery ── */
      .pd-gallery-label {
        font-size:.5625rem; font-weight:700; letter-spacing:.14em;
        text-transform:uppercase; color:var(--text-muted);
        margin-bottom:10px; align-self:flex-start;
      }
      .pd-gallery {
        display:flex; gap:10px; flex-wrap:wrap; justify-content:center;
        width:100%;
      }
      .pd-photo {
        width:80px; background:#fff; padding:5px 5px 18px;
        box-shadow:0 1px 4px rgba(0,0,0,.1);
        display:flex; flex-direction:column; gap:4px;
        transition:transform .15s;
        cursor:default;
      }
      .pd-photo:hover { transform:rotate(-2deg) translateY(-3px); }
      .pd-photo__image {
        width:100%; aspect-ratio:1; background:#ccc;
      }
      .pd-photo__caption {
        font-size:.4375rem; font-weight:600; letter-spacing:.08em;
        text-transform:uppercase; color:#888; text-align:center;
      }

      .pd-hint { font-size:.6875rem; color:var(--text-muted);
                 margin-top:18px; font-style:italic; align-self:flex-start; }
    </style>

    <div class="pd-scene">
      <p class="pd-label">Interactive Metaphor Preview — Camera Dial Feature Explorer</p>

      <div class="pd-dial-section">
        <!-- Dial -->
        <div class="pd-dial-wrap">
          <div class="pd-dial-ring"></div>
          <div class="pd-dial-knurl"></div>
          <div class="pd-dial-inner" id="pd-dial">
            <div class="pd-ticks">${ticksHtml}</div>
          </div>
          <div class="pd-pointer"></div>
          <div class="pd-dial-center"></div>
        </div>

        <!-- Feature card -->
        <div class="pd-feature-card" id="pd-feature" style="box-shadow:0 2px 8px rgba(0,0,0,.15);">
          <div class="pd-feature-card__position" id="pd-feat-pos">${FEATURES[0].position}</div>
          <div class="pd-feature-card__title" id="pd-feat-title">${FEATURES[0].title}</div>
          <div class="pd-feature-card__desc" id="pd-feat-desc">${FEATURES[0].desc}</div>
        </div>
      </div>

      <!-- Gallery -->
      <div class="pd-gallery-label">Gallery — Freshly Developed</div>
      <div class="pd-gallery">${galleryHtml}</div>

      <p class="pd-hint">↑ Click dial positions or drag to rotate · Feature card ejects like an instant print</p>
    </div>`;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, body, gold) {
  const dial      = stageEl.querySelector('#pd-dial');
  const featureEl = stageEl.querySelector('#pd-feature');
  const posEl     = stageEl.querySelector('#pd-feat-pos');
  const titleEl   = stageEl.querySelector('#pd-feat-title');
  const descEl    = stageEl.querySelector('#pd-feat-desc');
  if (!dial) return;

  let currentIndex = 0;
  const step = 360 / FEATURES.length;

  // Click-to-step: next detent on each click
  dial.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % FEATURES.length;
    snapTo(currentIndex);
  });

  // Drag-to-rotate
  let dragging   = false;
  let startAngle = 0;
  let dialAngle  = 0;

  dial.addEventListener('pointerdown', e => {
    dragging = true;
    dial.setPointerCapture(e.pointerId);
    startAngle = getPointerAngle(e, dial) - dialAngle;
    dial.style.transition = 'none';
  });

  dial.addEventListener('pointermove', e => {
    if (!dragging) return;
    const angle = getPointerAngle(e, dial) - startAngle;
    dialAngle = angle;
    dial.style.transform = `rotate(${angle}deg)`;
  });

  dial.addEventListener('pointerup', () => {
    if (!dragging) return;
    dragging = false;
    dial.style.transition = '';
    // Snap to nearest detent
    let norm = ((dialAngle % 360) + 360) % 360;
    let nearest = Math.round(norm / step) % FEATURES.length;
    currentIndex = nearest;
    snapTo(currentIndex);
  });

  dial.addEventListener('pointercancel', () => { dragging = false; });

  // Keyboard
  dial.setAttribute('tabindex', '0');
  dial.setAttribute('role', 'slider');
  dial.setAttribute('aria-label', 'Camera aperture dial');
  dial.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      currentIndex = (currentIndex + 1) % FEATURES.length;
      snapTo(currentIndex);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      currentIndex = (currentIndex - 1 + FEATURES.length) % FEATURES.length;
      snapTo(currentIndex);
    }
  });

  function snapTo(index) {
    dialAngle = index * step;
    dial.style.transform = `rotate(${dialAngle}deg)`;

    // Update feature card with eject animation
    const feat = FEATURES[index];
    posEl.textContent   = feat.position;
    titleEl.textContent = feat.title;
    descEl.textContent  = feat.desc;

    featureEl.classList.remove('is-ejecting');
    // Force reflow to restart animation
    void featureEl.offsetWidth;
    featureEl.classList.add('is-ejecting');
  }
}

function getPointerAngle(e, el) {
  const rect = el.getBoundingClientRect();
  const cx   = rect.left + rect.width / 2;
  const cy   = rect.top  + rect.height / 2;
  return Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

