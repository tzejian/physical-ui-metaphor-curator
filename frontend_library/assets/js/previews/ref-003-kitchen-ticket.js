/**
 * previews/ref-003-kitchen-ticket.js
 *
 * Interactive metaphor preview for ref-003: Madeline's Mobile —
 * Kitchen Ticket Scroll Layout.
 *
 * Abstraction level: Left of spectrum — pure graphic/typographic homage.
 * Technique: A narrow (~300px) vertical scroll frame styled as a continuously
 * printing thermal receipt. Single monospaced typeface, ASCII-rule section
 * separators (====, ----, ····), no CSS borders. A sticky top bar collapses
 * to a single highlighted line that tracks scroll position and updates its
 * label to the current section name.
 *
 * Token fidelity (ref-003):
 *   Colors  : #FAFAF7 (paper), #111111 (ink), #B5442E (accent/stamp)
 *   Borders : ASCII characters only — no CSS border properties
 *   Elevation: completely flat; paper illusion through typography & spacing
 *   Typography: single monospace weight throughout; scribble annotation at foot
 */

/** @param {object} entry  @param {HTMLElement} stageEl */
export function mount(entry, stageEl) {
  const tokens = entry.design_tokens ?? {};
  const colors = tokens.dominant_colors ?? ['#FAFAF7', '#111111', '#B5442E'];

  const paper  = colors[0] ?? '#FAFAF7';
  const ink    = colors[1] ?? '#111111';
  const accent = colors[2] ?? '#B5442E';

  stageEl.innerHTML = buildStageHtml(paper, ink, accent);
  attachInteractions(stageEl, ink, accent);
}

// ── HTML ──────────────────────────────────────────────────────────────────────

function buildStageHtml(paper, ink, accent) {
  const sections = buildSections(ink, accent);
  const sectionsHtml = sections.map(s => buildSectionHtml(s)).join('');

  const navItems = sections.map((s, i) =>
    `<span class="kt-nav-item ${i === 0 ? 'is-active' : ''}"
           data-section="${s.id}">${s.navLabel}</span>`).join('');

  return `
    <style>
      /* ── Scene wrapper ── */
      .kt-scene {
        display:flex; flex-direction:column; align-items:center; width:100%;
        font-family:var(--font-mono); background:var(--bg-page);
      }
      .kt-label {
        font-size:.6875rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
        color:var(--text-muted); margin-bottom:14px; align-self:flex-start;
      }

      /* ── Ticket frame ── */
      .kt-frame-wrap {
        position:relative;
        width:100%; max-width:320px;
      }

      /* Sticky nav bar */
      .kt-nav {
        position:sticky; top:0; z-index:10;
        background:${paper}; border-bottom:1px solid ${ink};
        padding:7px 14px 5px;
        display:flex; flex-direction:column; gap:1px;
      }
      .kt-nav-header {
        font-size:.5rem; letter-spacing:.18em; text-transform:uppercase;
        color:${accent}; margin-bottom:3px;
      }
      .kt-nav-row {
        display:flex; gap:0; flex-wrap:nowrap; overflow:hidden;
      }
      .kt-nav-item {
        font-size:.6875rem; padding:1px 6px; cursor:pointer;
        color:${ink}; opacity:.4; transition:opacity .15s, background .15s;
        white-space:nowrap;
      }
      .kt-nav-item.is-active {
        opacity:1; background:${ink}; color:${paper};
      }

      /* ── Scroll area ── */
      .kt-scroll {
        background:${paper}; color:${ink};
        height:280px; overflow-y:auto; overflow-x:hidden;
        padding:0;
        scroll-behavior:smooth;
        /* Thin scrollbar */
        scrollbar-width:thin;
        scrollbar-color:${ink}33 transparent;
      }
      .kt-scroll::-webkit-scrollbar       { width:4px; }
      .kt-scroll::-webkit-scrollbar-thumb { background:${ink}44; border-radius:2px; }

      /* ── Ticket inner ── */
      .kt-ticket {
        padding:14px 18px 24px;
        display:flex; flex-direction:column; gap:0;
        font-size:.75rem; line-height:1.6; color:${ink};
      }

      /* Header block */
      .kt-header {
        text-align:center; padding-bottom:12px;
      }
      .kt-header-name {
        font-size:1rem; font-weight:400; letter-spacing:.12em; text-transform:uppercase;
      }
      .kt-header-sub  { font-size:.625rem; letter-spacing:.08em; opacity:.55; }
      .kt-header-stamp{
        display:inline-block; border:2px solid ${accent};
        color:${accent}; font-size:.5rem; letter-spacing:.2em;
        padding:2px 7px; margin-top:6px; transform:rotate(-2deg);
      }

      /* ASCII rules */
      .kt-rule-eq  { letter-spacing:-.05em; opacity:.5; white-space:pre; overflow:hidden; font-size:.6875rem; }
      .kt-rule-dash{ letter-spacing:-.05em; opacity:.35; white-space:pre; overflow:hidden; font-size:.6875rem; }
      .kt-rule-dot { letter-spacing:-.05em; opacity:.25; white-space:pre; overflow:hidden; font-size:.6875rem; }

      /* Section */
      .kt-section     { padding:10px 0; }
      .kt-section-ttl {
        font-size:.6rem; letter-spacing:.2em; text-transform:uppercase;
        color:${accent}; margin-bottom:6px;
      }

      /* Menu rows */
      .kt-row {
        display:flex; justify-content:space-between; align-items:baseline;
        padding:1px 0;
      }
      .kt-row-name  { font-size:.75rem; }
      .kt-row-dots  { flex:1; border-bottom:1px dotted ${ink}44; margin:0 6px; min-width:12px; }
      .kt-row-price { font-size:.75rem; white-space:nowrap; }

      /* Note rows */
      .kt-note      { font-size:.625rem; opacity:.5; padding-left:12px; }

      /* Signature block */
      .kt-signature {
        margin-top:14px; padding-top:12px; border-top:1px solid ${ink}33;
        font-size:.625rem; opacity:.5;
      }
      .kt-sig-line  { font-size:.5625rem; letter-spacing:.04em; }
      .kt-sig-scrawl{
        font-family:cursive; font-size:.8125rem; letter-spacing:.06em;
        color:${ink}; opacity:.7; margin-top:4px;
      }

      .kt-hint {
        font-size:.6875rem; color:var(--text-muted); margin-top:12px; font-style:italic;
        align-self:flex-start;
      }
    </style>

    <div class="kt-scene">
      <p class="kt-label">Interactive Metaphor Preview — Kitchen Ticket Scroll Layout</p>

      <div class="kt-frame-wrap">
        <!-- Sticky nav -->
        <div class="kt-nav">
          <div class="kt-nav-header">▸ SECTION</div>
          <div class="kt-nav-row" id="kt-nav-row">${navItems}</div>
        </div>

        <!-- Scrollable ticket -->
        <div class="kt-scroll" id="kt-scroll">
          <div class="kt-ticket" id="kt-ticket">

            <!-- Ticket header -->
            <div class="kt-header">
              <div class="kt-header-name">Madeline's</div>
              <div class="kt-header-sub">Kitchen · Est. 1991</div>
              <div class="kt-header-sub" style="margin-top:2px;">ORDER #0042 · TABLE 7</div>
              <div class="kt-header-stamp">DINE-IN</div>
            </div>

            ${sectionsHtml}

            <!-- Signature footer -->
            <div class="kt-rule-eq">${repeat('=', 34)}</div>
            <div class="kt-signature">
              <div class="kt-sig-line">Thank you for dining with us.</div>
              <div class="kt-sig-line" style="margin-top:4px;">Served by: M. Lefebvre</div>
              <div class="kt-sig-scrawl">Madeline ♡</div>
            </div>

          </div>
        </div>
      </div>

      <p class="kt-hint">↑ Scroll the ticket · Nav tracks your position</p>
    </div>`;
}

function buildSections(ink, accent) {
  return [
    {
      id:       'starters',
      navLabel: 'STARTERS',
      title:    'STARTERS',
      rule:     'eq',
      items: [
        { name: 'Soup du Jour',          price: '8.00',  note: 'ask server for today\'s selection' },
        { name: 'Marinated Olives',      price: '6.50',  note: null },
        { name: 'Charcuterie Board (s)', price: '14.00', note: 'serves 2' },
      ],
    },
    {
      id:       'mains',
      navLabel: 'MAINS',
      title:    'MAIN COURSE',
      rule:     'eq',
      items: [
        { name: 'Roast Half Chicken',    price: '24.00', note: 'with seasonal vegetables' },
        { name: 'Pan Seared Sole',       price: '28.00', note: 'lemon beurre blanc' },
        { name: 'Mushroom Risotto',      price: '19.00', note: 'v · add truffle +3' },
        { name: 'Steak Frites',          price: '34.00', note: '250g hanger, house fries' },
      ],
    },
    {
      id:       'sides',
      navLabel: 'SIDES',
      title:    'ACCOMPANIMENTS',
      rule:     'dash',
      items: [
        { name: 'House Salad',           price: '6.00',  note: null },
        { name: 'Pommes Frites',         price: '5.00',  note: null },
        { name: 'Gratin Dauphinois',     price: '7.00',  note: null },
      ],
    },
    {
      id:       'desserts',
      navLabel: 'DESSERTS',
      title:    'DESSERTS',
      rule:     'dot',
      items: [
        { name: 'Crème Brûlée',          price: '9.00',  note: null },
        { name: 'Chocolate Fondant',     price: '10.00', note: 'warm, 12 min wait' },
        { name: 'Cheese Selection',      price: '12.00', note: '3 choices, house chutney' },
      ],
    },
  ];
}

function buildSectionHtml(s) {
  const ruleClass = `kt-rule-${s.rule}`;
  const ruleChar  = s.rule === 'eq' ? '=' : s.rule === 'dash' ? '-' : '·';

  const itemsHtml = s.items.map(item => `
    <div class="kt-row">
      <span class="kt-row-name">${esc(item.name)}</span>
      <span class="kt-row-dots"></span>
      <span class="kt-row-price">${esc(item.price)}</span>
    </div>
    ${item.note ? `<div class="kt-note">* ${esc(item.note)}</div>` : ''}`).join('');

  return `
    <div class="kt-section" data-section-id="${s.id}" id="kt-sec-${s.id}">
      <div class="${ruleClass}">${repeat(ruleChar, 34)}</div>
      <div class="kt-section-ttl">${esc(s.title)}</div>
      ${itemsHtml}
    </div>`;
}

// ── Interactions ──────────────────────────────────────────────────────────────

function attachInteractions(stageEl, ink, accent) {
  const scrollEl = stageEl.querySelector('#kt-scroll');
  const navRow   = stageEl.querySelector('#kt-nav-row');
  if (!scrollEl || !navRow) return;

  // Click on nav item → scroll to section
  navRow.addEventListener('click', e => {
    const item = e.target.closest('.kt-nav-item');
    if (!item) return;
    const id  = item.dataset.section;
    const sec = scrollEl.querySelector(`#kt-sec-${id}`);
    if (sec) {
      // Offset for the sticky nav bar
      scrollEl.scrollTo({ top: sec.offsetTop - 44, behavior: 'smooth' });
    }
  });

  // Scroll → update active nav item using IntersectionObserver
  const sections = scrollEl.querySelectorAll('.kt-section[data-section-id]');
  const navItems = navRow.querySelectorAll('.kt-nav-item');

  if (typeof IntersectionObserver !== 'undefined') {
    let currentActive = null;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.dataset.sectionId;
          if (id !== currentActive) {
            currentActive = id;
            navItems.forEach(n => {
              n.classList.toggle('is-active', n.dataset.section === id);
            });
          }
        }
      });
    }, {
      root:       scrollEl,
      rootMargin: '-20% 0px -60% 0px',
      threshold:  0,
    });

    sections.forEach(sec => observer.observe(sec));
  }
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function repeat(char, n) { return char.repeat(n); }

function esc(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

