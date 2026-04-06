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

  for (let i = 0; i < 150; i++) {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    drop.style.left = Math.random() * 100 + 'vw';
    drop.style.top = Math.random() * -160 + 'px';
    drop.style.animationDuration = (0.5 + Math.random() * 0.55) + 's';
    drop.style.animationDelay = (Math.random() * 2) + 's';
    drop.style.opacity = (0.3 + Math.random() * 0.45).toString();
    container.appendChild(drop);
  }
}