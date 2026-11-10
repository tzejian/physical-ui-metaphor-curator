/**
 * app.js — Gallery Controller
 * Fetches manifest.json, renders reference cards, handles search & tab navigation.
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

/** @type {string} active category tab */
let currentTab = 'all';

/** @type {{ category: string, value: string }} active filter */
let activeFilter = { category: 'all', value: 'all' };

// ── Tab Definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: 'all',           label: 'All',        key: null },
  { id: 'metaphors',     label: 'Metaphors',  key: 'metaphors' },
  { id: 'art_styles',    label: 'Styles',     key: 'art_styles' },
  { id: 'ui_components', label: 'Component',  key: 'ui_components' },
  { id: 'materials',     label: 'Material',   key: 'materials' },
];

// ── DOM refs ──────────────────────────────────────────────────────────────────
const gallery        = document.getElementById('gallery');
const searchInput    = document.getElementById('search-input');
const categoryTabs   = document.getElementById('category-tabs');
const subFilterRow   = document.getElementById('sub-filter-row');
const subFilterTitle = document.getElementById('sub-filter-title');
const filterBar      = document.getElementById('filter-pills');
const resultsCount   = document.getElementById('results-count');

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

  buildCategoryTabs();
  renderGallery();

  searchInput?.addEventListener('input', e => {
    searchQuery = e.target.value.trim().toLowerCase();
    renderGallery();
  });
});

// ── Category Tabs Navigation (Tier 1) ─────────────────────────────────────────
function buildCategoryTabs() {
  if (!categoryTabs) return;

  // Compute tag counts per category
  const tagCounts = {
    metaphors:    new Set(),
    art_styles:   new Set(),
    ui_components:new Set(),
    materials:    new Set(),
  };

  allEntries.forEach(entry => {
    Object.keys(tagCounts).forEach(cat => {
      (entry.tags?.[cat] || []).forEach(v => tagCounts[cat].add(v));
    });
  });

  categoryTabs.innerHTML = TABS.map(tab => {
    const count = tab.id === 'all'
      ? allEntries.length
      : (tagCounts[tab.key]?.size || 0);

    const isActive = tab.id === currentTab ? ' is-active' : '';

    return `
      <button
        class="tab-btn${isActive}"
        data-tab="${tab.id}"
        role="tab"
        aria-selected="${tab.id === currentTab}"
      >
        <span>${escapeHtml(tab.label)}</span>
        <span class="tab-count">(${count})</span>
      </button>
    `;
  }).join('');

  categoryTabs.addEventListener('click', e => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    const tabId = btn.dataset.tab;
    if (tabId === currentTab) return;

    switchTab(tabId);
  });
}

function switchTab(tabId) {
  currentTab = tabId;

  // Update tab buttons visual state
  categoryTabs.querySelectorAll('.tab-btn').forEach(btn => {
    const isSelected = btn.dataset.tab === tabId;
    btn.classList.toggle('is-active', isSelected);
    btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
  });

  if (tabId === 'all') {
    activeFilter = { category: 'all', value: 'all' };
    if (subFilterRow) subFilterRow.style.display = 'none';
    renderGallery();
    return;
  }

  // Show sub-filter row for selected category
  const tabConfig = TABS.find(t => t.id === tabId);
  if (subFilterTitle && tabConfig) {
    subFilterTitle.textContent = `Filter by ${tabConfig.label}`;
  }
  if (subFilterRow) subFilterRow.style.display = 'block';

  // Reset active filter to all within this category
  activeFilter = { category: tabId, value: 'all' };
  renderSubFilterPills(tabId);
  renderGallery();
}

// ── Contextual Sub-Filter Pills (Tier 2) ──────────────────────────────────────
function renderSubFilterPills(categoryKey) {
  if (!filterBar) return;

  // Count occurrences of each tag in the current category
  const tagFrequency = {};
  allEntries.forEach(entry => {
    (entry.tags?.[categoryKey] || []).forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });
  });

  // Sort tags alphabetically for clean scanning
  const sortedTags = Object.keys(tagFrequency).sort((a, b) => a.localeCompare(b));

  const tabConfig = TABS.find(t => t.id === categoryKey);
  const allLabel = `All ${tabConfig?.label || ''}`.trim();

  const allPillHtml = `
    <button class="pill is-active" data-value="all">
      <span>${escapeHtml(allLabel)}</span>
      <span class="tab-count">(${allEntries.length})</span>
    </button>
  `;

  const tagPillsHtml = sortedTags.map(tag => `
    <button class="pill" data-value="${escapeHtml(tag)}">
      <span>${escapeHtml(tag)}</span>
      <span class="tab-count">(${tagFrequency[tag]})</span>
    </button>
  `).join('');

  filterBar.innerHTML = allPillHtml + tagPillsHtml;

  // Attach sub-pill click listener (re-delegated cleanly)
  filterBar.onclick = e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;

    const val = pill.dataset.value;

    // Toggle: if clicking the active specific pill, reset to 'all'
    if (activeFilter.value === val && val !== 'all') {
      activeFilter = { category: currentTab, value: 'all' };
    } else {
      activeFilter = { category: currentTab, value: val };
    }

    // Update pill active classes
    filterBar.querySelectorAll('.pill').forEach(p => {
      p.classList.toggle('is-active', p.dataset.value === activeFilter.value);
    });

    renderGallery();
  };
}

// ── Filtering ─────────────────────────────────────────────────────────────────
function getFilteredEntries() {
  return allEntries.filter(entry => {
    // 1. Text search filter
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

    // 2. Tab + Sub-pill filter
    if (currentTab !== 'all') {
      const tagsInCat = entry.tags?.[currentTab] || [];
      if (activeFilter.value !== 'all') {
        if (!tagsInCat.includes(activeFilter.value)) return false;
      }
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
        ? `${allEntries.length} entries`
        : `${filtered.length} of ${allEntries.length}`;
  }

  if (!filtered.length) {
    gallery.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">🔍</div>
        <p class="empty-state__message">No references match your filter criteria.</p>
      </div>`;
    return;
  }

  gallery.innerHTML = filtered.map(buildCardHTML).join('');
}

function buildCardHTML(entry) {
  const colors   = entry.design_tokens?.dominant_colors || [];
  const strip    = buildColorStrip(colors);
  const badges   = buildAllBadges(entry.tags || {}, 2);
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
