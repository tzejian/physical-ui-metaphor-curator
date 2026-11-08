/**
 * app.js — Gallery Controller
 * Fetches manifest.json, renders reference cards, handles search & filter.
 */

import {
  buildAllBadges,
  buildColorStrip,
  buildBadge,
  escapeHtml,
} from './utils.js';

const MANIFEST_PATH = 'assets/data/manifest.json';

/** @type {object[]} */
let allEntries = [];

/** @type {string} current search query */
let searchQuery = '';

/** @type {{ category: string, value: string } | null} active filter */
let activeFilter = { category: 'all', value: 'all' };

// ── DOM refs ──────────────────────────────────────────────────────────────────
const gallery      = document.getElementById('gallery');
const searchInput  = document.getElementById('search-input');
const filterBar    = document.getElementById('filter-pills');
const resultsCount = document.getElementById('results-count');

// ── Bootstrap ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(MANIFEST_PATH);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allEntries = await res.json();
  } catch (err) {
    renderError(`Failed to load manifest: ${err.message}`);
    return;
  }

  buildFilterPills();
  renderGallery();

  searchInput?.addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderGallery();
  });
});

// ── Filter pills ───────────────────────────────────────────────────────────────
function buildFilterPills() {
  if (!filterBar) return;

  // Gather unique values per category
  const categories = {
    metaphors:    new Set(),
    art_styles:   new Set(),
    ui_components:new Set(),
    materials:    new Set(),
  };

  allEntries.forEach(entry => {
    Object.keys(categories).forEach(cat => {
      (entry.tags?.[cat] || []).forEach(v => categories[cat].add(v));
    });
  });

  const categoryLabels = {
    metaphors:    'Metaphors',
    art_styles:   'Styles',
    ui_components:'Components',
    materials:    'Materials',
  };

  // "All" pill
  filterBar.innerHTML = `
    <button class="pill is-active" data-category="all" data-value="all">All</button>
  `;

  Object.entries(categories).forEach(([cat, values]) => {
    if (!values.size) return;

    const groupLabel = document.createElement('span');
    groupLabel.className = 'filter-pills__label';
    groupLabel.textContent = categoryLabels[cat];
    filterBar.appendChild(groupLabel);

    values.forEach(value => {
      const btn = document.createElement('button');
      btn.className = `pill`;
      btn.dataset.category = cat;
      btn.dataset.value = value;
      btn.textContent = value;
      filterBar.appendChild(btn);
    });
  });

  filterBar.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    activeFilter = { category: pill.dataset.category, value: pill.dataset.value };
    filterBar.querySelectorAll('.pill').forEach(p => p.classList.remove('is-active'));
    pill.classList.add('is-active');
    renderGallery();
  });
}

// ── Filtering ─────────────────────────────────────────────────────────────────
function getFilteredEntries() {
  return allEntries.filter(entry => {
    // Search filter: matches title, metaphors, art styles, or ui_components
    if (searchQuery) {
      const haystack = [
        entry.title,
        ...(entry.tags?.metaphors    || []),
        ...(entry.tags?.art_styles   || []),
        ...(entry.tags?.ui_components|| []),
        ...(entry.tags?.materials    || []),
      ].join(' ').toLowerCase();
      if (!haystack.includes(searchQuery)) return false;
    }

    // Pill filter
    if (activeFilter.category !== 'all') {
      const values = entry.tags?.[activeFilter.category] || [];
      if (!values.includes(activeFilter.value)) return false;
    }

    return true;
  });
}

// ── Rendering ─────────────────────────────────────────────────────────────────
function renderGallery() {
  if (!gallery) return;
  const filtered = getFilteredEntries();

  if (resultsCount) {
    resultsCount.textContent =
      filtered.length === allEntries.length
        ? `${allEntries.length} entr${allEntries.length === 1 ? 'y' : 'ies'}`
        : `${filtered.length} of ${allEntries.length}`;
  }

  if (!filtered.length) {
    gallery.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <p class="empty-state__message">No references match your search.</p>
      </div>`;
    return;
  }

  gallery.innerHTML = filtered.map(buildCardHTML).join('');
}

function buildCardHTML(entry) {
  const colors  = entry.design_tokens?.dominant_colors || [];
  const strip   = buildColorStrip(colors);
  const badges  = buildAllBadges(entry.tags || {}, 2);
  const mechanic = escapeHtml(entry.affordance_translation?.digital_mechanic || '');

  return `
    <a class="ref-card"
       href="detail.html?id=${escapeHtml(entry.id)}"
       tabindex="0"
       aria-label="View details for ${escapeHtml(entry.title)}">
      <div class="ref-card__swatch-strip" aria-hidden="true">${strip}</div>
      <div class="ref-card__body">
        <span class="ref-card__id">${escapeHtml(entry.id)}</span>
        <h2 class="ref-card__title">${escapeHtml(entry.title)}</h2>
        <p class="ref-card__affordance">${mechanic}</p>
        <div class="ref-card__tags">${badges}</div>
      </div>
    </a>`;
}

function renderError(message) {
  if (!gallery) return;
  gallery.innerHTML = `
    <div class="empty-state">
      <div class="empty-state__icon">⚠️</div>
      <p class="empty-state__message">${escapeHtml(message)}</p>
    </div>`;
}

