// =====================
// STREET PAGE — street.js
// =====================

document.addEventListener('DOMContentLoaded', () => {

  const era  = sessionStorage.getItem('currentEra');
  const grid = document.getElementById('venueGrid');

  // ── Venue cards ──────────────────────────────────────────
  if (era && grid) {
    const venues = Object.values(WORLD[era] || {});
    if (!venues.length) {
      grid.innerHTML = '<p style="color:rgba(255,255,255,0.2);font-style:italic;text-align:center">No venues found.</p>';
    } else {
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
            <div class="venue-card__artists">${venue.artists.slice(0,3).join(' · ')}</div>
          </div>
          <button class="venue-card__enter">Enter</button>
        `;

        card.querySelector('.venue-card__enter').addEventListener('click', (e) => {
          e.stopPropagation();
          Navigation.goToVenue(venue);
        });
        card.addEventListener('click', () => Navigation.goToVenue(venue));

        grid.appendChild(card);
      });
    }
  }

  // ── Scene FX ─────────────────────────────────────────────
  initStreetScene(era);
});


// ════════════════════════════════════════════════
// SCENE INITIALIZATION — era-specific animations
// ════════════════════════════════════════════════

function initStreetScene(era) {
  const fx = document.getElementById('streetFx');
  if (!fx) return;

  if (era === '1970s') {
    generateMoon(fx);
    generateStreetRain(fx, 60);
  } else if (era === '1990s') {
    generateMoon2(fx);
    generateCar(fx);
    generateCar2(fx);
    generateStreetRain(fx, 60);
  } else if (era === '2020s') {
    generateParticles(fx, 22);
    generateDrone(fx);
  }
}

// Moon 
function generateMoon(container) {
  const moon = document.createElement('div');
  moon.className = 'moon';
  container.appendChild(moon);
}
function generateMoon2(container) {
  const moon2 = document.createElement('div');
  moon2.className = 'moon2';
  container.appendChild(moon2);
}


// ── Rain — 1970s ──────────────────────────────────────────
function generateStreetRain(container, count) {
  for (let i = 0; i < count; i++) {
    const drop = document.createElement('div');
    drop.className = 'street-rain';
    drop.style.cssText = `
      left: ${Math.random() * 110 - 5}vw;
      top: ${Math.random() * -80}px;
      height: ${12 + Math.random() * 10}px;
      animation-duration: ${0.55 + Math.random() * 0.5}s;
      animation-delay: ${Math.random() * 2.5}s;
      opacity: ${0.12 + Math.random() * 0.25};
    `;
    container.appendChild(drop);
  }
}

// ── Car — 1990s ───────────────────────────────────────────
function generateCar(container) {
  // Main car body
  const car = document.createElement('div');
  car.className = 'street-car';

  const headlight = document.createElement('div');
  headlight.className = 'car-headlight';


  car.appendChild(headlight);

  const bottomPx = 22;  // px above pavement top
  car.style.cssText = `
   
    animation: carDriveRL 10s linear infinite;
  `;

  container.appendChild(car);
}
function generateCar2(container) {
  // Main car body
  const car2 = document.createElement('div');
  car2.className = 'street-car';

  // Headlight (front, left side since driving R→L)
  const headlight = document.createElement('div');
  headlight.className = 'car-headlight';


  car2.appendChild(headlight);

  const bottomPx = 22;  // px above pavement top
  car2.style.cssText = `
    
    animation: carDriveRL 8s linear infinite;
  `;

  container.appendChild(car2);
}

  


// ── Digital particles — 2020s ─────────────────────────────
function generateParticles(container, count) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'street-particle';

    const height = 20 + Math.random() * 50;
    p.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: ${Math.random() * 60}%;
      height: ${height}px;
      animation: particleFall ${3 + Math.random() * 5}s linear ${Math.random() * 6}s infinite;
      opacity: ${0.15 + Math.random() * 0.35};
    `;
    container.appendChild(p);
  }
}


// ── Drone — 2020s ─────────────────────────────────────────
function generateDrone(container) {
  const drone = document.createElement('div');
  drone.className = 'street-drone';

  const body = document.createElement('div');
  body.className = 'drone-body';
  drone.appendChild(body);

  drone.style.cssText = `
    top: ${8 + Math.random() * 15}%;
    animation: droneFly 20s linear 1s infinite;
  `;
  container.appendChild(drone);
}
