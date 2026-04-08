// =====================
// VENUE INTERIOR — venue.js
// =====================

let venueData   = null;
let currentTrack = null;

document.addEventListener('DOMContentLoaded', async () => {

  venueData = JSON.parse(sessionStorage.getItem('currentVenue') || 'null');
  const searchedSong = JSON.parse(sessionStorage.getItem('searchedSong') || 'null');

  if (!venueData) { showError('No venue data found.'); return; }

  // ── Apply theme ──────────────────────────────────────────
  document.body.classList.add(venueData.venueClass);
  document.documentElement.style.setProperty('--accent', venueData.accentColor);
  document.title = `Timbre — ${venueData.name}`;

  // Venue identity header
  const nameEl = document.getElementById('venueIdentityName');
  const locEl  = document.getElementById('venueIdentityLocation');
  if (nameEl) nameEl.textContent = venueData.name;
  if (locEl)  locEl.textContent  = venueData.location;

  // Save last visit for returning user message
  localStorage.setItem('timbre_lastVenue', JSON.stringify(venueData));

  // ── Wire audio callbacks ─────────────────────────────────
  AudioManager.onTrackChange = (track, index) => {
    currentTrack = track;
    updateNowPlaying(track);
    updateQueueHighlight(index);
    applyAlbumColor(track);
  };

  AudioManager.onPlayStateChange = (playing) => {
    const btn = document.getElementById('playPauseBtn');
    if (btn) btn.innerHTML = playing
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>';
  };

  AudioManager.onProgress = (pct) => {
    const fill = document.getElementById('progressFill');
    if (fill) fill.style.width = (pct * 100) + '%';
  };

  // ── Load queue ───────────────────────────────────────────
  showQueueSkeleton();

  let tracks = [];
  try {
    tracks = await API.getVenueQueue(venueData.artists, 24);
  } catch (e) {
    console.warn('Queue load failed:', e);
  }

  if (!tracks.length) {
    document.getElementById('queueList').innerHTML =
      '<p class="queue-empty">No previews available for this venue right now.</p>';
    return;
  }

  // If the user searched a specific song, put it at the front
  let startIndex = 0;
  if (searchedSong && searchedSong.previewUrl) {
    const exists = tracks.findIndex(t => t.trackId === searchedSong.trackId);
    if (exists >= 0) {
      startIndex = exists;
    } else {
      tracks.unshift(searchedSong);
      startIndex = 0;
    }
  }

  renderQueue(tracks);
  AudioManager.setQueue(tracks, startIndex);

  // ── Wire controls ─────────────────────────────────────────
  document.getElementById('playPauseBtn')?.addEventListener('click', () => AudioManager.toggle());
  document.getElementById('skipBtn')?.addEventListener('click',      () => AudioManager.skip());
  document.getElementById('recordBtn')?.addEventListener('click',    recordMemory);
});


// ── Now-playing card ──────────────────────────────────────────────

function updateNowPlaying(track) {
  const art    = document.getElementById('nowPlayingArt');
  const name   = document.getElementById('nowPlayingName');
  const artist = document.getElementById('nowPlayingArtist');
  const year   = document.getElementById('nowPlayingYear');
  const fill   = document.getElementById('progressFill');

  const artUrl = (track.artworkUrl100 || track.artworkUrl60 || '')
    .replace('100x100', '300x300');

  if (art)    { art.src = artUrl; art.style.opacity = '0'; }
  if (name)   name.textContent   = track.trackName   || 'Unknown';
  if (artist) artist.textContent = track.artistName  || '';
  if (year)   year.textContent   = track.releaseDate
    ? new Date(track.releaseDate).getFullYear() : '';
  if (fill)   fill.style.width   = '0%';

  // Fade art in after load
  if (art) {
    art.onload = () => {
      art.style.transition = 'opacity 0.6s ease';
      art.style.opacity = '1';
    };
  }
}


// ── Album colour extraction ───────────────────────────────────────

async function applyAlbumColor(track) {
  const artUrl = (track.artworkUrl100 || track.artworkUrl60 || '')
    .replace('100x100', '300x300');
  if (!artUrl) return;

  const color = await ColorExtractor.extractWithFallback(artUrl, venueData.accentColor);

  document.documentElement.style.setProperty('--song-color', color);
  document.documentElement.style.setProperty(
    '--song-color-glow',
    ColorExtractor.toRgba(color, 0.22)
  );

  // Animate the art glow
  const glow = document.getElementById('artGlow');
  if (glow) glow.style.background = color;
}


// ── Queue ─────────────────────────────────────────────────────────

function showQueueSkeleton() {
  const list = document.getElementById('queueList');
  if (!list) return;
  list.innerHTML = Array(5).fill(0).map(() => `
    <div class="queue-item queue-item--skeleton">
      <div class="queue-skeleton__art"></div>
      <div class="queue-skeleton__lines">
        <div class="queue-skeleton__line queue-skeleton__line--long"></div>
        <div class="queue-skeleton__line queue-skeleton__line--short"></div>
      </div>
    </div>
  `).join('');
}

function renderQueue(tracks) {
  const list = document.getElementById('queueList');
  if (!list) return;
  list.innerHTML = '';

  tracks.slice(0, 8).forEach((track, i) => {
    const item = document.createElement('div');
    item.className = 'queue-item';
    item.dataset.index = i;

    const artUrl = (track.artworkUrl60 || '').replace('60x60', '100x100');

    item.innerHTML = `
      <img class="queue-item__art" src="${artUrl}" alt=""
           onerror="this.style.opacity='0'">
      <div class="queue-item__info">
        <div class="queue-item__name">${track.trackName || 'Unknown'}</div>
        <div class="queue-item__artist">${track.artistName || ''}</div>
      </div>
      <div class="queue-item__indicator"></div>
    `;

    item.addEventListener('click', () => AudioManager.jumpTo(i));
    list.appendChild(item);
  });
}

function updateQueueHighlight(activeIndex) {
  document.querySelectorAll('.queue-item').forEach((el, i) => {
    el.classList.toggle('queue-item--active', i === activeIndex);
  });
}


// ── Record This ───────────────────────────────────────────────────

function recordMemory() {
  if (!currentTrack || !venueData) return;

  const memory = {
    id:          Date.now().toString(),
    songName:    currentTrack.trackName,
    artist:      currentTrack.artistName,
    albumArt:    (currentTrack.artworkUrl100 || currentTrack.artworkUrl60 || '')
                   .replace('100x100', '300x300'),
    previewUrl:  currentTrack.previewUrl,
    venueName:   venueData.name,
    era:         venueData.era,
    venueClass:  venueData.venueClass,
    accentColor: venueData.accentColor,
    location:    venueData.location,
    recordedAt:  new Date().toISOString()
  };

  saveMemory(memory);
  flyCardToCorner();
  showToast(`Recorded in ${venueData.name}`);
}

function flyCardToCorner() {
  const card = document.getElementById('nowPlayingCard');
  const icon = document.querySelector('.memories-icon');
  if (!card || !icon) return;

  const clone     = card.cloneNode(true);
  const cardRect  = card.getBoundingClientRect();
  const iconRect  = icon.getBoundingClientRect();

  Object.assign(clone.style, {
    position:   'fixed',
    top:        cardRect.top  + 'px',
    left:       cardRect.left + 'px',
    width:      cardRect.width  + 'px',
    height:     cardRect.height + 'px',
    margin:     '0',
    zIndex:     '9000',
    pointerEvents: 'none',
    transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.65s ease',
  });

  document.body.appendChild(clone);

  const tx = (iconRect.left + iconRect.width  / 2) - (cardRect.left + cardRect.width  / 2);
  const ty = (iconRect.top  + iconRect.height / 2) - (cardRect.top  + cardRect.height / 2);

  requestAnimationFrame(() => requestAnimationFrame(() => {
    clone.style.transform = `translate(${tx}px,${ty}px) scale(0.06)`;
    clone.style.opacity   = '0';
  }));

  setTimeout(() => clone.remove(), 700);

  // Bounce the icon
  const vinyl = document.querySelector('.memories-icon__vinyl');
  if (vinyl) {
    vinyl.style.animation = 'none';
    requestAnimationFrame(() => {
      vinyl.style.animation = 'badgeBounce 0.45s ease';
    });
  }
}

function showToast(message) {
  document.getElementById('venueToast')?.remove();

  const toast = document.createElement('div');
  toast.id        = 'venueToast';
  toast.className = 'venue-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('venue-toast--visible'));

  setTimeout(() => {
    toast.classList.remove('venue-toast--visible');
    setTimeout(() => toast.remove(), 400);
  }, 2600);
}


// ── Error state ───────────────────────────────────────────────────

function showError(msg) {
  const name = document.getElementById('venueIdentityName');
  if (name) name.textContent = msg || 'Something went wrong.';
}