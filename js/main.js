// =====================
// LANDING PAGE — main.js
// =====================

document.addEventListener('DOMContentLoaded', () => {

  // --- Enter button ---
  const enterBtn = document.getElementById('enterBtn');
  enterBtn.addEventListener('click', () => {
    window.location.href = 'world.html';
  });

  // --- Memories badge ---
  const memories = JSON.parse(localStorage.getItem('timbre_memories') || '[]');
  const badge = document.getElementById('memoriesBadge');
  if (memories.length > 0) {
    badge.textContent = memories.length;
    badge.style.display = 'flex';
  }

  // --- Returning user message ---
  const lastVisit = localStorage.getItem('timbre_lastVenue');
  if (lastVisit) {
    const info = JSON.parse(lastVisit);
    const el = document.getElementById('returningUser');
    el.style.display = 'block';
    el.textContent = `Welcome back. Your last visit was ${info.venueName}, ${info.era}.`;
    el.onclick = () => {
      sessionStorage.setItem('currentEra', info.era);
      sessionStorage.setItem('currentVenue', JSON.stringify(info));
      window.location.href = 'venue.html';
    };
  }

  // --- Rain effect ---
  generateRain();

  // --- Search bar (placeholder for Day 2 wiring) ---
  const input = document.getElementById('searchInput');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      sessionStorage.setItem('searchQuery', input.value.trim());
      // Full search logic comes on Day 2
      alert('Search wiring coming on Day 2!');
    }
  });

});

function generateRain() {
  const container = document.getElementById('rainContainer');
  if (!container) return;

  for (let i = 0; i < 80; i++) {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = Math.random() * 100 + 'vw';
    drop.style.top = Math.random() * -100 + 'px';
    drop.style.animationDuration = (0.6 + Math.random() * 0.8) + 's';
    drop.style.animationDelay = (Math.random() * 2) + 's';
    drop.style.opacity = (0.1 + Math.random() * 0.25).toString();
    container.appendChild(drop);
  }
}


let searchTimeout = null;  // used to debounce — don't fire API on every keystroke
let previewAudio = null;   // for the dropdown song previews

const searchInput    = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');

// --- Search input listener ---
searchInput.addEventListener('input', () => {
  const term = searchInput.value.trim();

  // Clear any pending search
  clearTimeout(searchTimeout);

  if (term.length < 2) {
    closeDropdown();
    return;
  }

  // Wait 300ms after user stops typing, then search
  searchTimeout = setTimeout(async () => {
    const results = await API.searchSongs(term, 8);
    renderDropdown(results);
  }, 100);
});

// Close dropdown if user clicks outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-container')) {
    closeDropdown();
  }
});

// --- Render the dropdown ---
function renderDropdown(tracks) {
  if (!tracks.length) {
    searchDropdown.innerHTML = `<div class="search-empty">No results found</div>`;
    searchDropdown.classList.add('search-dropdown--open');
    return;
  }

  searchDropdown.innerHTML = tracks.map((track, i) => `
    <div class="search-result" data-index="${i}" tabindex="0">
      <img 
        class="search-result-art" 
        src="${track.artworkUrl60 || ''}" 
        alt="${track.trackName}"
        onerror="this.style.display='none'"
      />
      <div class="search-result-info">
        <div class="search-result-name">${track.trackName || 'Unknown'}</div>
        <div class="search-result-artist">${track.artistName || ''} · ${track.releaseDate ? new Date(track.releaseDate).getFullYear() : ''}</div>
      </div>
      <div class="search-result-genre">${track.primaryGenreName || ''}</div>
    </div>
  `).join('');

  // Store results on the dropdown element so click handlers can access them
  searchDropdown._results = tracks;

  // Hover to preview
  searchDropdown.querySelectorAll('.search-result').forEach((el, i) => {
    el.addEventListener('mouseenter', () => playPreview(tracks[i].previewUrl));
    el.addEventListener('mouseleave', stopPreview);
    el.addEventListener('click', () => selectSong(tracks[i]));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') selectSong(tracks[i]);
    });
  });

  searchDropdown.classList.add('search-dropdown--open');
}

function closeDropdown() {
  searchDropdown.classList.remove('search-dropdown--open');
  stopPreview();
}

// --- Song preview on hover ---
function playPreview(url) {
  if (!url) return;
  stopPreview();
  previewAudio = new Audio(url);
  previewAudio.volume = 0.4;
  previewAudio.play().catch(() => {}); // catch autoplay block silently
}

function stopPreview() {
  if (previewAudio) {
    previewAudio.pause();
    previewAudio = null;
  }
}

// --- User picks a song ---
async function selectSong(track) {
  stopPreview();
  closeDropdown();

  // Detect which venue this song belongs to
  const venue = mapSongToVenue(track);

  // Show loading screen and navigate
  await Navigation.goToVenue(venue, 'venue.html', track);
}

// --- Returning user message ---
// Check localStorage for last visited venue and show it on the landing
function showReturningUserMessage() {
  const memories = JSON.parse(localStorage.getItem('timbre_memories') || '[]');
  if (!memories.length) return;

  const last = memories[memories.length - 1];
  const msg = document.getElementById('returningUserMsg');
  if (!msg) return;

  msg.textContent = `Welcome back. Your last visit: ${last.venueName}, ${last.era}`;
  msg.style.display = 'block';
  msg.addEventListener('click', () => {
    const venue = findVenueByClass(last.venueClass);
    if (venue) Navigation.goToVenue(venue, 'venue.html');
  });
}

function findVenueByClass(venueClass) {
  for (const era of Object.values(WORLD)) {
    for (const venue of Object.values(era)) {
      if (venue.venueClass === venueClass) return venue;
    }
  }
  return null;
}

// Run on page load
showReturningUserMessage();