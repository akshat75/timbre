// js/memoriesPage.js
// Renders the memories page: grid, cards, filters, delete, hover-preview, click-to-venue

(function () {

  // ── Accent colours per venue class (fallback palette) ──────────────────────
  const VENUE_ACCENTS = {
    'venue--jazz-70s':       '#D97706',
    'venue--disco-70s':      '#FBBF24',
    'venue--rock-70s':       '#EF4444',
    'venue--soul-70s':       '#F59E0B',
    'venue--grunge-90s':     '#DC2626',
    'venue--hiphop-90s':     '#84CC16',
    'venue--indie-90s':      '#A78BFA',
    'venue--rnb-90s':        '#EC4899',
    'venue--hyperpop-now':   '#06B6D4',
    'venue--lofi-now':       '#818CF8',
    'venue--indie-now':      '#818CF8',
    'venue--trap-now':       '#7C3AED',
    'venue--bedroompop-now': '#F472B6',
  };

  // ── Era labels ──────────────────────────────────────────────────────────────
  const ERA_LABEL = {
    '1970s': 'The 70s',
    '1990s': 'The 90s',
    '2020s': 'Now',
  };

  // ── Shared preview audio element ───────────────────────────────────────────
  const previewAudio = document.getElementById('previewAudio');
  let hoverTimer = null;
  let activeCardEl = null;

  // ── Lookup full venue config from WORLD (defined in world.js) ──────────────
  function findVenueConfig(venueClass) {
    if (typeof WORLD === 'undefined') return null;
    for (const era of Object.values(WORLD)) {
      for (const venue of Object.values(era)) {
        if (venue.venueClass === venueClass) return venue;
      }
    }
    return null;
  }

  // ── Format timestamp ───────────────────────────────────────────────────────
  function formatDate(iso) {
    const d = new Date(iso);
    const opts = { day: 'numeric', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('en-GB', opts);
  }

  // ── Build one memory card element ──────────────────────────────────────────
  function buildCard(memory) {
    const accent = VENUE_ACCENTS[memory.venueClass] || '#D97706';
    const eraLabel = ERA_LABEL[memory.era] || memory.era || '';

    const card = document.createElement('div');
    card.className = `mem-card ${memory.venueClass || ''}`;
    card.dataset.id = memory.id;
    card.dataset.era = memory.era || '';
    card.style.setProperty('--card-accent', accent);

    card.innerHTML = `
      <div class="mem-card__art-wrap">
        <img
          class="mem-card__art"
          src="${memory.albumArt || ''}"
          alt="${memory.songName || ''}"
          loading="lazy"
          onerror="this.style.opacity='0'"
        >
        <div class="mem-card__art-overlay"></div>
        <div class="mem-card__play-hint">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21"/>
          </svg>
        </div>
      </div>

      <div class="mem-card__body">
        <div class="mem-card__song">${memory.songName || 'Unknown Song'}</div>
        <div class="mem-card__artist">${memory.artist || ''}</div>

        <div class="mem-card__meta">
          <span class="mem-card__venue">${memory.venueName || ''}</span>
          <span class="mem-card__sep">·</span>
          <span class="mem-card__era">${eraLabel}</span>
        </div>

        <div class="mem-card__date">${memory.recordedAt ? formatDate(memory.recordedAt) : ''}</div>
      </div>

      <button
        class="mem-card__delete"
        aria-label="Remove memory"
        data-id="${memory.id}"
      >✕</button>

      <div class="mem-card__glow"></div>
    `;

    // ── Hover: play preview ─────────────────────────────────────────────────
    card.addEventListener('mouseenter', () => {
      if (!memory.previewUrl) return;
      hoverTimer = setTimeout(() => {
        if (activeCardEl && activeCardEl !== card) {
          activeCardEl.classList.remove('mem-card--playing');
        }
        activeCardEl = card;
        card.classList.add('mem-card--playing');
        previewAudio.src = memory.previewUrl;
        previewAudio.currentTime = 0;
        previewAudio.volume = 0.55;
        previewAudio.play().catch(() => {});
      }, 300);
    });

    card.addEventListener('mouseleave', () => {
      clearTimeout(hoverTimer);
      card.classList.remove('mem-card--playing');
      if (activeCardEl === card) {
        previewAudio.pause();
        previewAudio.src = '';
        activeCardEl = null;
      }
    });

    // ── Click: navigate to venue with this song first ───────────────────────
    card.addEventListener('click', (e) => {
      if (e.target.closest('.mem-card__delete')) return; // don't trigger on delete
      previewAudio.pause();

      const venueConfig = findVenueConfig(memory.venueClass);
      if (!venueConfig) {
        console.warn('Could not find venue config for', memory.venueClass);
        return;
      }

      const firstSong = {
        trackId:    memory.trackId || null,
        trackName:  memory.songName,
        artistName: memory.artist,
        artworkUrl100: memory.albumArt,
        previewUrl: memory.previewUrl,
        releaseDate: memory.releaseDate || null,
      };

      Navigation.goToVenue(venueConfig, null, firstSong);
    });

    // ── Delete button ───────────────────────────────────────────────────────
    const deleteBtn = card.querySelector('.mem-card__delete');
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dissolveCard(card, memory.id);
    });

    return card;
  }

  // ── Dissolve card out, then remove from DOM & storage ─────────────────────
  function dissolveCard(cardEl, id) {
    cardEl.classList.add('mem-card--dissolving');
    cardEl.addEventListener('animationend', () => {
      cardEl.remove();
      deleteMemory(id);
      checkEmpty();
    }, { once: true });
  }

  // ── Check if grid is empty and show/hide empty state ──────────────────────
  function checkEmpty() {
    const root = document.getElementById('memoriesRoot');
    const visible = root.querySelectorAll('.mem-card:not(.mem-card--dissolving)');
    const empty   = document.getElementById('memEmpty');
    if (visible.length === 0) {
      if (!empty) renderEmpty(root);
    } else {
      if (empty) empty.remove();
    }
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  function renderEmpty(root) {
    const el = document.createElement('div');
    el.id = 'memEmpty';
    el.className = 'mem-empty';
    el.innerHTML = `
      <div class="mem-empty__vinyl">
        <div class="mem-empty__groove"></div>
        <div class="mem-empty__label"></div>
      </div>
      <p class="mem-empty__text">You have not been anywhere yet.</p>
      <p class="mem-empty__sub">The world is waiting.</p>
      <a href="index.html" class="mem-empty__cta">Enter the World</a>
    `;
    root.appendChild(el);
  }

  // ── Filters ────────────────────────────────────────────────────────────────
  function initFilters() {
    const buttons = document.querySelectorAll('.mem-filter');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        buttons.forEach(b => b.classList.remove('mem-filter--active'));
        btn.classList.add('mem-filter--active');

        const filter = btn.dataset.filter;
        document.querySelectorAll('.mem-card').forEach(card => {
          if (filter === 'all' || card.dataset.era === filter) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ── Main render ────────────────────────────────────────────────────────────
  function render() {
    const root = document.getElementById('memoriesRoot');
    if (!root) return;

    const memories = getMemories();

    if (memories.length === 0) {
      renderEmpty(root);
      return;
    }

    // Stagger card entrance
    memories.forEach((memory, i) => {
      const card = buildCard(memory);
      card.style.animationDelay = `${i * 60}ms`;
      root.appendChild(card);
    });

    initFilters();
  }

  document.addEventListener('DOMContentLoaded', render);

})();