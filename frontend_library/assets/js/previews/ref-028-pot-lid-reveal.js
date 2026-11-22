/**
 * previews/ref-028-pot-lid-reveal.js
 *
 * Interactive metaphor preview for ref-028: Dutch Oven Lid Reveal.
 *
 * Faithfully authored to the physical & digital mechanics of ref-028:
 * - Real Raised 3/4 Perspective ("looking down into an open oval, NOT a side silhouette").
 * - Authentic Japanese flat-skeuomorphic aesthetic inspired by @noa1008xx's illustration:
 *   wide elliptical opening with thick cast-iron rim bevel, enameled terracotta exterior,
 *   recessed interior chamber looking down onto content, and oval lid with brass knob.
 * - Long hard-edged cast shadow on the ground plane (as stated in design_tokens.elevation).
 * - "Small pot holding a whole panel of content is part of the idea" — rich interactive
 *   UI panel (tabs, metrics, action toggles) framed inside the oval pot opening.
 * - 5 Distinct Proposed Mechanic Variations (selectable via tab bar):
 *   1. Micro-Lift Cue (hover/focus tilt & lift affordance cue)
 *   2. Ease-Out Flyaway Reveal (lid lifts up & sideways out of frame; interior scales from 0.96)
 *   3. Hovering Lid Frame (lid hovers directly above opening casting shadow on rim)
 *   4. Accessible Instant Swap (instantaneous swap with no motion; full button & keyboard semantics)
 *   5. Printed Texture & Grain (SVG feTurbulence fractal noise overlay)
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#E2583E', '#2C3539', '#F8F5EE', '#1E2326', '#C88A35'];

  const potRed     = colors[0] ?? '#E2583E';
  const castIron   = colors[1] ?? '#2C3539';
  const interiorBg = colors[2] ?? '#F8F5EE';
  const potDark    = colors[3] ?? '#1E2326';
  const brassKnob  = colors[4] ?? '#C88A35';

  stageEl.innerHTML = buildStageHtml(potRed, castIron, interiorBg, potDark, brassKnob);
  attachInteractions(stageEl);
}

// ── HTML & Styles ─────────────────────────────────────────────────────────────

function buildStageHtml(potRed, castIron, interiorBg, potDark, brassKnob) {
  return `
    <style>
      .pot-suite {
        display: flex;
        flex-direction: column;
        width: 100%;
        font-family: var(--font-sans);
        user-select: none;
        gap: var(--space-md);
      }

      /* ── Variant Switcher Bar ── */
      .pot-variant-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-sm);
        flex-wrap: wrap;
        padding-bottom: var(--space-sm);
        border-bottom: 1px solid var(--border-subtle);
      }

      .pot-variant-tabs {
        display: inline-flex;
        gap: 4px;
        background: var(--bg-surface);
        padding: 3px;
        border-radius: var(--radius-pill);
        border: 1px solid var(--border-subtle);
        overflow-x: auto;
        max-width: 100%;
      }

      .pot-variant-tab {
        padding: 5px 12px;
        font-size: 0.75rem;
        font-weight: 500;
        font-family: var(--font-sans);
        color: var(--text-secondary);
        background: transparent;
        border: none;
        border-radius: var(--radius-pill);
        cursor: pointer;
        transition: all var(--transition-fast);
        white-space: nowrap;
      }

      .pot-variant-tab:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.05);
      }

      .pot-variant-tab.is-active {
        background: var(--accent);
        color: #0d0d0f;
        font-weight: 600;
      }

      /* Variant Description Banner */
      .pot-variant-desc {
        font-size: 0.8125rem;
        color: var(--text-secondary);
        line-height: 1.5;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
      }
      .pot-variant-desc strong {
        color: var(--text-primary);
      }

      /* ── 3D Viewport & Countertop ── */
      .pot-stage {
        position: relative;
        min-height: 520px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: radial-gradient(circle at 50% 20%, #1e1b19 0%, #0d0c0b 100%);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-subtle);
        padding: 40px 20px 30px 20px;
        box-sizing: border-box;
        overflow: hidden;
      }

      /* Metaphor Header Cue */
      .pot-header-cue {
        position: absolute;
        top: 14px;
        left: 20px;
        right: 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.6875rem;
        font-family: var(--font-mono);
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        z-index: 30;
      }

      .pot-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 8px;
        border-radius: var(--radius-pill);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-subtle);
        font-size: 0.6875rem;
        color: var(--text-secondary);
      }

      .pot-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--text-muted);
        transition: background var(--transition-fast), box-shadow var(--transition-fast);
      }
      .pot-status-dot.is-active {
        background: ${potRed};
        box-shadow: 0 0 8px ${potRed};
      }

      /* SVG Filter overlay for printed grain texture */
      .pot-grain-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        opacity: 0;
        mix-blend-mode: overlay;
        z-index: 25;
        border-radius: var(--radius-lg);
        transition: opacity 0.3s ease;
      }
      .pot-stage.mode-grain .pot-grain-overlay {
        opacity: 0.28;
      }

      /* ═════════════════════════════════════════════════════════════════════════
         TRUE RAISED 3/4 THREE-QUARTER VIEW GEOMETRY
         ═════════════════════════════════════════════════════════════════════════ */
      .pot-workbench {
        position: relative;
        width: 380px;
        max-width: 100%;
        height: 310px;
        display: flex;
        align-items: center;
        justify-content: center;
        perspective: 800px;
        perspective-origin: 50% 20%;
        margin-top: 10px;
      }

      /* Hard-Edged Ground Cast Shadow (Design Tokens: elevation) */
      .pot-cast-shadow {
        position: absolute;
        bottom: 12px;
        left: 20px;
        width: 340px;
        height: 48px;
        background: radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.45) 55%, transparent 75%);
        transform: rotate(-3deg) skewX(-20deg);
        filter: blur(4px);
        z-index: 1;
        transition: transform 380ms ease, opacity 380ms ease;
      }
      .pot-workbench.is-open .pot-cast-shadow {
        transform: rotate(-3deg) skewX(-20deg) scale(0.96);
        opacity: 0.7;
      }

      /* The Pot Vessel Container (tilted forward in 3D) */
      .pot-vessel {
        position: relative;
        width: 320px;
        height: 250px;
        transform-style: preserve-3d;
        z-index: 5;
      }

      /* Cast Iron Loop Handles (positioned at 3/4 angle) */
      .pot-ear-handle {
        position: absolute;
        width: 38px;
        height: 22px;
        border: 7px solid ${castIron};
        border-radius: 8px;
        z-index: 2;
        box-shadow: 0 6px 12px rgba(0,0,0,0.65);
      }
      .pot-ear-handle--left {
        left: -22px;
        top: 60px;
        transform: rotate(-12deg);
      }
      .pot-ear-handle--right {
        right: -22px;
        top: 60px;
        transform: rotate(12deg);
      }

      /* Front Enamel Body Basin */
      .pot-body-wall {
        position: absolute;
        top: 60px;
        left: 0;
        width: 320px;
        height: 160px;
        background: linear-gradient(180deg, #b33924 0%, ${potRed} 24%, #992815 65%, #63180b 100%);
        border-radius: 0 0 160px 160px / 0 0 90px 90px;
        box-shadow: inset 0 -18px 30px rgba(0, 0, 0, 0.5),
                    inset 0 6px 12px rgba(0, 0, 0, 0.25),
                    0 16px 36px rgba(0, 0, 0, 0.75);
        z-index: 3;
        overflow: hidden;
      }

      /* Subtle vertical enamel specular sheen on 3/4 curve */
      .pot-body-wall::before {
        content: '';
        position: absolute;
        top: 0;
        left: 30px;
        width: 70px;
        height: 100%;
        background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.14) 50%, transparent 100%);
        transform: skewX(-8deg);
      }

      /* ── The 3/4 Oval Opening Rim (Looking Down Into) ── */
      .pot-oval-mouth {
        position: absolute;
        top: 0;
        left: 0;
        width: 320px;
        height: 124px;
        border-radius: 50%;
        background: ${castIron};
        padding: 8px;
        box-sizing: border-box;
        box-shadow: 0 4px 14px rgba(0,0,0,0.6), inset 0 2px 4px rgba(255,255,255,0.2);
        z-index: 4;
      }

      /* Thin lighter rim line on the opening (Tokens: borders) */
      .pot-oval-mouth::after {
        content: '';
        position: absolute;
        inset: 4px;
        border-radius: 50%;
        border: 1.5px solid rgba(255, 255, 255, 0.28);
        pointer-events: none;
      }

      /* Recessed Interior Cavity (Deep Bowl seen from above) */
      .pot-cavity {
        position: relative;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: radial-gradient(ellipse at 50% 25%, ${interiorBg} 0%, #e0d8ca 65%, #c2b9a7 100%);
        overflow: hidden;
        /* Thick inner rim and soft inner shadow so it reads as inside the pot */
        box-shadow: inset 0 16px 26px rgba(18, 15, 13, 0.65),
                    inset 0 -8px 16px rgba(18, 15, 13, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* ── "Small pot holding a whole panel of content" ── */
      .pot-embedded-panel {
        width: 90%;
        height: 86%;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        padding: 10px 24px 12px 24px;
        box-sizing: border-box;
        text-align: center;
        opacity: 0;
        transform: scale(0.96) translateY(4px);
        pointer-events: none;
        transition: opacity 360ms cubic-bezier(0, 0, 0.2, 1),
                    transform 360ms cubic-bezier(0, 0, 0.2, 1);
        z-index: 6;
      }

      .pot-workbench.is-open .pot-embedded-panel {
        opacity: 1;
        transform: scale(1) translateY(0);
        pointer-events: auto;
      }

      .panel-masthead {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        border-bottom: 1px dashed rgba(44, 53, 57, 0.3);
        padding-bottom: 3px;
      }

      .panel-title {
        font-size: 0.75rem;
        font-weight: 700;
        color: #1a1918;
        letter-spacing: -0.01em;
      }

      .panel-chip {
        font-size: 0.5625rem;
        font-family: var(--font-mono);
        color: #8f2613;
        background: rgba(226, 88, 62, 0.14);
        padding: 1px 5px;
        border-radius: var(--radius-sm);
        font-weight: 700;
      }

      /* Micro UI Data Grid inside pot */
      .panel-data-row {
        display: flex;
        justify-content: space-between;
        width: 100%;
        gap: 6px;
      }

      .panel-metric {
        flex: 1;
        background: rgba(44, 53, 57, 0.06);
        border: 1px solid rgba(44, 53, 57, 0.12);
        border-radius: 4px;
        padding: 3px 4px;
        display: flex;
        flex-direction: column;
      }

      .metric-k {
        font-size: 0.5rem;
        font-family: var(--font-mono);
        text-transform: uppercase;
        color: var(--text-muted);
      }

      .metric-v {
        font-size: 0.6875rem;
        font-weight: 700;
        color: #1c2124;
      }

      .panel-actions {
        display: flex;
        width: 100%;
        gap: 6px;
      }

      .panel-btn {
        flex: 1;
        padding: 4px 6px;
        font-size: 0.625rem;
        font-weight: 600;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: background var(--transition-fast);
      }

      .panel-btn--dark {
        background: #2c3539;
        color: #ffffff;
      }
      .panel-btn--dark:hover {
        background: #1e2326;
      }

      .panel-btn--soft {
        background: rgba(44, 53, 57, 0.14);
        color: #2c3539;
      }
      .panel-btn--soft:hover {
        background: rgba(44, 53, 57, 0.22);
      }

      /* Rising Steam wisps */
      .pot-steam {
        position: absolute;
        top: -10px;
        left: 25%;
        right: 25%;
        height: 40px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 350ms ease 120ms;
        z-index: 8;
      }
      .pot-workbench.is-open .pot-steam {
        opacity: 0.75;
      }

      .steam-puff {
        position: absolute;
        width: 14px;
        height: 28px;
        background: rgba(255, 255, 255, 0.5);
        border-radius: 50%;
        filter: blur(6px);
        animation: steamRise 2s infinite ease-out;
      }
      .steam-puff:nth-child(1) { left: 10%; }
      .steam-puff:nth-child(2) { left: 45%; animation-delay: 0.65s; width: 18px; }
      .steam-puff:nth-child(3) { left: 80%; animation-delay: 1.2s; width: 13px; }

      @keyframes steamRise {
        0%   { transform: translateY(0) scaleX(0.8); opacity: 0; }
        40%  { opacity: 0.7; }
        100% { transform: translateY(-44px) scaleX(1.4); opacity: 0; }
      }

      /* ═════════════════════════════════════════════════════════════════════════
         THE RAISED 3/4 FITTED OVAL LID (The Trigger Button)
         ═════════════════════════════════════════════════════════════════════════ */
      .pot-lid-button {
        position: absolute;
        top: 0;
        left: 0;
        width: 320px;
        height: 124px;
        cursor: pointer;
        z-index: 20;
        background: none;
        border: none;
        padding: 0;
        outline: none;
        transform-origin: 50% 50%;
        transition: transform 380ms cubic-bezier(0, 0, 0.2, 1),
                    filter 380ms cubic-bezier(0, 0, 0.2, 1);
      }

      .pot-lid-button:focus-visible .pot-lid-dome {
        outline: 2px solid var(--accent);
        outline-offset: 4px;
      }

      /* Convex Oval Lid Dome */
      .pot-lid-dome {
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: radial-gradient(ellipse at 50% 30%, #f4694f 0%, ${potRed} 42%, #942512 85%, #59160a 100%);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6),
                    inset 0 3px 6px rgba(255, 255, 255, 0.4),
                    inset 0 -6px 12px rgba(0, 0, 0, 0.45);
        border: 2.5px solid rgba(44, 53, 57, 0.7);
      }

      /* Cast Iron Rim on Lid Perimeter */
      .pot-lid-dome::after {
        content: '';
        position: absolute;
        inset: 5px;
        border-radius: 50%;
        border: 1px solid rgba(255, 255, 255, 0.2);
        pointer-events: none;
      }

      /* Brass Lid Handle Knob (Raised 3/4 top view) */
      .pot-brass-knob {
        position: absolute;
        top: 36px;
        left: 50%;
        transform: translateX(-50%);
        width: 40px;
        height: 26px;
        background: radial-gradient(ellipse at 40% 30%, #fae0a0 0%, ${brassKnob} 55%, #6e410b 100%);
        border-radius: 50%;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6), inset 0 2px 3px rgba(255, 255, 255, 0.5);
      }

      /* Hovering Lid Rim Shadow (Projects onto pot opening in Variation 3) */
      .pot-hovering-shadow {
        position: absolute;
        top: 14px;
        left: 10px;
        width: 300px;
        height: 100px;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.55);
        filter: blur(12px);
        opacity: 0;
        pointer-events: none;
        transition: opacity 380ms ease, transform 380ms ease;
        z-index: 10;
      }

      /* ═════════════════════════════════════════════════════════════════════════
         5 DEDICATED PROPOSED MECHANIC VARIATIONS
         ═════════════════════════════════════════════════════════════════════════ */

      /* VARIATION 1: Micro-Lift Cue (Affordance on hover/focus) */
      .pot-stage.mode-microlift .pot-workbench:not(.is-open) .pot-lid-button:hover,
      .pot-stage.mode-microlift .pot-workbench:not(.is-open) .pot-lid-button:focus-visible {
        transform: translateY(-12px) rotate(-2deg);
        filter: drop-shadow(0 16px 22px rgba(0,0,0,0.6));
      }
      .pot-stage.mode-microlift .pot-workbench.is-open .pot-lid-button {
        transform: translate(120px, -130px) rotate(22deg);
        filter: drop-shadow(0 26px 32px rgba(0, 0, 0, 0.75));
      }

      /* VARIATION 2: Ease-Out Flyaway Reveal (Up & sideways out of frame) */
      .pot-stage.mode-flyaway .pot-workbench:not(.is-open) .pot-lid-button:hover {
        transform: translateY(-4px);
      }
      .pot-stage.mode-flyaway .pot-workbench.is-open .pot-lid-button {
        transform: translate(180px, -170px) rotate(30deg);
        filter: drop-shadow(0 32px 40px rgba(0, 0, 0, 0.8));
        transition-duration: 380ms;
        transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }
      .pot-stage.mode-flyaway .pot-embedded-panel {
        transition-duration: 380ms;
        transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
      }

      /* VARIATION 3: Hovering Lid Frame (Lid hovers above opening with shadow) */
      .pot-stage.mode-hovering .pot-workbench.is-open .pot-lid-button {
        transform: translateY(-80px) rotate(-1deg);
        filter: drop-shadow(0 22px 28px rgba(0, 0, 0, 0.7));
      }
      .pot-stage.mode-hovering .pot-workbench.is-open .pot-hovering-shadow {
        opacity: 0.7;
        transform: translateY(8px) scale(0.94);
      }

      /* VARIATION 4: Accessible Instant Swap (Zero drift / prefers-reduced-motion) */
      .pot-stage.mode-accessible .pot-lid-button,
      .pot-stage.mode-accessible .pot-embedded-panel,
      .pot-stage.mode-accessible .pot-cast-shadow,
      .pot-stage.mode-accessible .steam-puff {
        transition: none !important;
        animation: none !important;
      }
      .pot-stage.mode-accessible .pot-workbench.is-open .pot-lid-button {
        transform: translate(100px, -90px) rotate(16deg);
      }

      /* VARIATION 5: Printed Texture & Grain (SVG Filter) */
      .pot-stage.mode-grain .pot-body-wall,
      .pot-stage.mode-grain .pot-lid-dome {
        filter: contrast(1.06) brightness(0.98);
      }
      .pot-stage.mode-grain .pot-workbench.is-open .pot-lid-button {
        transform: translate(120px, -130px) rotate(22deg);
        filter: drop-shadow(0 26px 32px rgba(0, 0, 0, 0.75));
      }

      /* Exterior Controls */
      .pot-controls {
        margin-top: 26px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 15;
      }

      .pot-trigger-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 18px;
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid var(--border-subtle);
        border-radius: var(--radius-pill);
        color: var(--text-primary);
        font-size: 0.8125rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--transition-fast);
      }

      .pot-trigger-btn:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: var(--accent-muted);
      }

      .pot-key-hint {
        font-family: var(--font-mono);
        font-size: 0.6875rem;
        color: var(--text-muted);
      }
    </style>

    <!-- SVG feTurbulence Filter for Variation 5 -->
    <svg style="position: absolute; width: 0; height: 0; overflow: hidden;" aria-hidden="true">
      <defs>
        <filter id="pot-grain-filter" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" />
        </filter>
      </defs>
    </svg>

    <div class="pot-suite">
      <!-- 5 Dedicated Mechanic Variations -->
      <div class="pot-variant-bar">
        <div class="pot-variant-tabs" role="tablist" aria-label="Interactive mechanic variations">
          <button class="pot-variant-tab is-active" data-mode="microlift" role="tab" aria-selected="true">
            1. Micro-Lift Cue
          </button>
          <button class="pot-variant-tab" data-mode="flyaway" role="tab" aria-selected="false">
            2. Flyaway Reveal
          </button>
          <button class="pot-variant-tab" data-mode="hovering" role="tab" aria-selected="false">
            3. Hovering Lid Frame
          </button>
          <button class="pot-variant-tab" data-mode="accessible" role="tab" aria-selected="false">
            4. Accessible Instant
          </button>
          <button class="pot-variant-tab" data-mode="grain" role="tab" aria-selected="false">
            5. Printed Grain
          </button>
        </div>
      </div>

      <!-- Explanatory note per variant -->
      <div class="pot-variant-desc" id="pot-variant-desc">
        <strong>Mechanic 1 — Micro-Lift Cue:</strong> On hover or focus the closed lid lifts a few pixels and tilts slightly, providing a tactile physical cue that it opens.
      </div>

      <!-- Main Stage Container -->
      <div class="pot-stage mode-microlift" id="pot-stage">
        <div class="pot-grain-overlay" style="filter: url(#pot-grain-filter);"></div>

        <div class="pot-header-cue">
          <span id="pot-mode-tag">Variation // 01 Micro-Lift Cue</span>
          <div class="pot-status-badge">
            <span class="pot-status-dot" id="pot-status-dot"></span>
            <span id="pot-status-text">Closed (Hover lid to test cue)</span>
          </div>
        </div>

        <!-- ════ 3D Raised 3/4 View Assembly ════ -->
        <div class="pot-workbench" id="pot-workbench">
          <!-- Hard-edged cast shadow on countertop plane -->
          <div class="pot-cast-shadow" aria-hidden="true"></div>

          <!-- The Pot Vessel -->
          <div class="pot-vessel">
            <!-- 3/4 Side Loop Handles -->
            <div class="pot-ear-handle pot-ear-handle--left" aria-hidden="true"></div>
            <div class="pot-ear-handle pot-ear-handle--right" aria-hidden="true"></div>

            <!-- Front Enameled Basin -->
            <div class="pot-body-wall" aria-hidden="true"></div>

            <!-- The Oval Opening Mouth (Looking down into) -->
            <div class="pot-oval-mouth" aria-hidden="true">
              <div class="pot-cavity">
                <!-- Steam wisps rising from within -->
                <div class="pot-steam">
                  <div class="steam-puff"></div>
                  <div class="steam-puff"></div>
                  <div class="steam-puff"></div>
                </div>

                <!-- Recessed UI Content Panel -->
                <div class="pot-embedded-panel" id="pot-interior" role="region" aria-label="Dutch oven interior panel">
                  <div class="panel-masthead">
                    <span class="panel-title">Braised Boeuf Bourguignon</span>
                    <span class="panel-chip">Simmering 3h</span>
                  </div>

                  <div class="panel-data-row">
                    <div class="panel-metric">
                      <span class="metric-k">Prime Cut</span>
                      <span class="metric-v">800g</span>
                    </div>
                    <div class="panel-metric">
                      <span class="metric-k">Burgundy</span>
                      <span class="metric-v">350ml</span>
                    </div>
                    <div class="panel-metric">
                      <span class="metric-k">Temp</span>
                      <span class="metric-v">95°C</span>
                    </div>
                  </div>

                  <div class="panel-actions">
                    <button class="panel-btn panel-btn--dark" id="btn-taste">Taste Broth</button>
                    <button class="panel-btn panel-btn--soft" id="btn-season">+ Herbs</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cast Shadow of Hovering Lid (Variation 3) -->
            <div class="pot-hovering-shadow" aria-hidden="true"></div>

            <!-- The Fitted Oval Lid Trigger -->
            <button class="pot-lid-button" id="pot-lid-btn" aria-expanded="false" aria-controls="pot-interior" title="Lift lid to reveal contents">
              <div class="pot-lid-dome">
                <div class="pot-brass-knob"></div>
              </div>
            </button>
          </div>
        </div>

        <!-- Exterior Controls -->
        <div class="pot-controls">
          <button class="pot-trigger-btn" id="pot-toggle-btn" aria-controls="pot-interior">
            <span id="pot-btn-icon">▲</span>
            <span id="pot-btn-label">Lift Dutch Oven Lid</span>
          </button>
          <span class="pot-key-hint">or press <kbd>Enter</kbd> / <kbd>Esc</kbd></span>
        </div>
      </div>
    </div>
  `;
}

// ── Interactive Logic ─────────────────────────────────────────────────────────

function attachInteractions(stageEl) {
  const stage         = stageEl.querySelector('#pot-stage');
  const workbench     = stageEl.querySelector('#pot-workbench');
  const lidBtn        = stageEl.querySelector('#pot-lid-btn');
  const toggleBtn     = stageEl.querySelector('#pot-toggle-btn');
  const statusDot     = stageEl.querySelector('#pot-status-dot');
  const statusText    = stageEl.querySelector('#pot-status-text');
  const btnLabel      = stageEl.querySelector('#pot-btn-label');
  const btnIcon       = stageEl.querySelector('#pot-btn-icon');
  const variantDesc   = stageEl.querySelector('#pot-variant-desc');
  const modeTag       = stageEl.querySelector('#pot-mode-tag');
  const variantTabs   = stageEl.querySelectorAll('.pot-variant-tab');
  const btnTaste      = stageEl.querySelector('#btn-taste');
  const btnSeason     = stageEl.querySelector('#btn-season');

  if (!stage || !workbench || !lidBtn || !toggleBtn) return;

  let isOpen = false;
  let activeMode = 'microlift';

  const DESCRIPTIONS = {
    microlift: '<strong>Mechanic 1 — Micro-Lift Cue:</strong> On hover or focus the closed lid lifts a few pixels and tilts slightly, as a cue that it opens.',
    flyaway: '<strong>Mechanic 2 — Ease-Out Flyaway Reveal:</strong> On click or Enter the lid lifts up and sideways away from the opening (380ms ease-out) while the interior content fades and scales up from about 0.96.',
    hovering: '<strong>Mechanic 3 — Hovering Lid Frame:</strong> While open, keeps the lid hovering above the opening with a cast shadow, so the oval opening stays visible as the frame for the content.',
    accessible: '<strong>Mechanic 4 — Accessible Instant:</strong> Uses real button semantics with aria-expanded, closes on second click or Escape, and swaps state instantly without motion.',
    grain: '<strong>Mechanic 5 — Printed Texture & Grain:</strong> SVG feTurbulence fractal noise overlay active, reproducing the tactile printed look over flat fills.'
  };

  const TAGS = {
    microlift: 'Variation // 01 Micro-Lift Cue',
    flyaway: 'Variation // 02 Ease-Out Flyaway Reveal',
    hovering: 'Variation // 03 Hovering Lid Frame',
    accessible: 'Variation // 04 Accessible Instant Swap',
    grain: 'Variation // 05 Printed Texture & Grain'
  };

  function setOpen(open) {
    isOpen = open;
    workbench.classList.toggle('is-open', isOpen);
    lidBtn.setAttribute('aria-expanded', String(isOpen));
    toggleBtn.setAttribute('aria-expanded', String(isOpen));

    if (isOpen) {
      statusDot?.classList.add('is-active');
      if (statusText) statusText.textContent = 'Revealed (Press Esc or Click to Close)';
      if (btnLabel) btnLabel.textContent = 'Replace Pot Lid';
      if (btnIcon) btnIcon.textContent = '▼';
    } else {
      statusDot?.classList.remove('is-active');
      if (statusText) statusText.textContent = 'Closed (Click lid or press Enter)';
      if (btnLabel) btnLabel.textContent = 'Lift Dutch Oven Lid';
      if (btnIcon) btnIcon.textContent = '▲';
    }
  }

  // Variant tab switching
  variantTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      if (!mode || mode === activeMode) return;

      activeMode = mode;
      variantTabs.forEach(t => {
        const isCurrent = t === tab;
        t.classList.toggle('is-active', isCurrent);
        t.setAttribute('aria-selected', String(isCurrent));
      });

      // Update stage class
      stage.className = `pot-stage mode-${mode}`;
      if (variantDesc) variantDesc.innerHTML = DESCRIPTIONS[mode] || '';
      if (modeTag) modeTag.textContent = TAGS[mode] || '';

      // Reset to closed state when switching variations
      setOpen(false);
    });
  });

  // Toggle handlers
  lidBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setOpen(!isOpen);
  });

  toggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    setOpen(!isOpen);
  });

  // Keyboard accessibility
  const keyHandler = (e) => {
    if (e.key === 'Escape' && isOpen) {
      setOpen(false);
      lidBtn.focus();
    }
  };
  document.addEventListener('keydown', keyHandler);

  // Interior interactive buttons
  if (btnTaste) {
    btnTaste.addEventListener('click', () => {
      const original = btnTaste.textContent;
      btnTaste.textContent = 'Rich & Savory!';
      setTimeout(() => { btnTaste.textContent = original; }, 1500);
    });
  }

  if (btnSeason) {
    btnSeason.addEventListener('click', () => {
      const original = btnSeason.textContent;
      btnSeason.textContent = 'Seasoned!';
      setTimeout(() => { btnSeason.textContent = original; }, 1500);
    });
  }
}
