// =====================
// STREET PAGE — street.js

// =====================

document.addEventListener('DOMContentLoaded', () => {

  const era   = sessionStorage.getItem('currentEra');
  const grid  = document.getElementById('venueGrid');
  if (!era || !grid) return;

  const venues = Object.values(WORLD[era]);
  if (!venues.length) {
    grid.innerHTML = '<p style="color:rgba(255,255,255,0.2);font-style:italic">No venues found for this era.</p>';
    return;
  }

  venues.forEach(venue => {
    const card = document.createElement('div');
    card.className = 'venue-card';
    card.style.setProperty('--card-accent', venue.accentColor);

    card.innerHTML = `
      <div class="venue-card__glow"></div>
      <div class="venue-card__body">
        <p class="venue-card__location">${venue.location}</p>
        <h3 class="venue-card__name">${venue.name}</h3>
        <p class="venue-card__desc">${venue.description}</p>
        <div class="venue-card__artists">${venue.artists.slice(0, 3).join(' · ')}</div>
      </div>
      <button class="venue-card__enter">Enter</button>
    `;

    card.querySelector('.venue-card__enter').addEventListener('click', (e) => {
      e.stopPropagation();
      Navigation.goToVenue(venue, 'venue.html');
    });

    // Clicking anywhere on the card also works
    card.addEventListener('click', () => {
      Navigation.goToVenue(venue, 'venue.html');
    });

    grid.appendChild(card);
  });

});