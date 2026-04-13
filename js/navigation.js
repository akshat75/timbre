// js/navigation.js

const VENUE_PAGE_BY_CLASS = {
  'venue--disco-70s': 'venue-disco-70s.html',
  'venue--jazz-70s': 'venue-jazz-70s.html',
  'venue--rock-70s': 'venue-rock-70s.html',
  'venue--soul-70s': 'venue-soul-70s.html',
  'venue--grunge-90s': 'venue-grunge-90s.html',
  'venue--hiphop-90s': 'venue-hiphop-90s.html',
  'venue--indie-90s': 'venue-indie-90s.html',
  'venue--rnb-90s': 'venue-rnb-90s.html',
  'venue--hyperpop-now': 'venue-hyperpop-now.html',
  'venue--indie-now': 'venue-indie-now.html',
  'venue--trap-now': 'venue-trap-now.html',
  'venue--bedroompop-now': 'venue-bedroompop-now.html'
};

const Navigation = {

  resolveVenuePage(venue) {
    const venueClass = venue?.venueClass;
    return VENUE_PAGE_BY_CLASS[venueClass] || 'venue.html';
  },

  async goToVenue(venue, nextPage = null, firstSong = null) {
    sessionStorage.setItem('currentVenue', JSON.stringify(venue));
    sessionStorage.setItem('currentEra', venue.era);
    if (firstSong) {
      sessionStorage.setItem('searchedSong', JSON.stringify(firstSong));
    } else {
      sessionStorage.removeItem('searchedSong');
    }

    const destination = nextPage || this.resolveVenuePage(venue);

    await this.showLoadingScreen(venue);

    // Navigate while screen is still black — no flash
    window.location.href = destination;
  },

  showLoadingScreen(venue) {
    return new Promise((resolve) => {

      const overlay = document.createElement('div');
      overlay.id = 'loading-screen';
      overlay.innerHTML = `
        <div class="loading-bg"></div>
        <div class="loading-noise"></div>
        <div class="loading-vignette"></div>
        <div class="loading-content">
          <div class="loading-entering">Entering</div>
          <div class="loading-venue-name" id="loadingVenueName"></div>
          <div class="loading-location" id="loadingLocation"></div>
          <div class="loading-bar">
            <div class="loading-bar-fill"></div>
          </div>
        </div>
      `;

      const style = document.createElement('style');
      style.textContent = getLoadingScreenCSS(venue.accentColor);
      document.head.appendChild(style);
      document.body.appendChild(overlay);

      overlay.getBoundingClientRect();
      overlay.classList.add('loading-screen--visible');

      const venueNameEl = document.getElementById('loadingVenueName');
      const locationEl  = document.getElementById('loadingLocation');

      animateWords(venueNameEl, venue.name, 80, () => {
        setTimeout(() => {
          locationEl.textContent = venue.location;
          locationEl.classList.add('loading-location--visible');
        }, 200);
      });

      
      setTimeout(() => {
        resolve(); // navigate immediately while screen is still fully visible
      }, 4300);
    });
  }
};

// Animates text appearing one word at a time
function animateWords(el, text, delay, onComplete) {
  const words = text.split(' ');
  el.innerHTML = '';

  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.textContent = word + ' ';
    span.className = 'loading-word';
    span.style.animationDelay = `${i * delay}ms`;
    el.appendChild(span);
  });

  // Call onComplete after all words have appeared
  const totalTime = words.length * delay + 400;
  setTimeout(onComplete, totalTime);
}

// Returns all the CSS for the loading screen as a string
// accentColor = the venue's accent color, e.g. '#D97706'
function getLoadingScreenCSS(accentColor) {
  return `
    #loading-screen {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.4s ease;
      overflow: hidden;
    }

    #loading-screen.loading-screen--visible {
      opacity: 1;
    }

    #loading-screen.loading-screen--exit {
      opacity: 0;
      transition: opacity 0.7s ease;
    }

    /* Deep dark background */
    .loading-bg {
      position: absolute;
      inset: 0;
      background: 
        radial-gradient(ellipse at 50% 40%, rgba(30,20,10,1) 0%, #000 70%);
    }

    /* Film grain texture using CSS noise */
    .loading-noise {
      position: absolute;
      inset: 0;
      opacity: 0.06;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 200px 200px;
    }

    /* Dark vignette around the edges */
    .loading-vignette {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.9) 100%);
    }

    /* The centered text block */
    .loading-content {
      position: relative;
      z-index: 2;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }

    .loading-entering {
      font-family: 'Georgia', serif;
      font-size: 0.75rem;
      letter-spacing: 0.5em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
      opacity: 0;
      animation: loadingFadeIn 0.6s ease 0.2s forwards;
    }

    .loading-venue-name {
      font-family: 'Georgia', serif;
      font-size: clamp(2rem, 6vw, 4.5rem);
      font-weight: normal;
      font-style: italic;
      color: #fff;
      line-height: 1.1;
      letter-spacing: 0.02em;
    }

    /* Each word in the venue name fades + slides in */
    .loading-word {
      display: inline-block;
      opacity: 0;
      transform: translateY(16px);
      animation: wordReveal 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    .loading-location {
      font-family: 'Georgia', serif;
      font-size: clamp(0.8rem, 2vw, 1rem);
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: ${accentColor};
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .loading-location--visible {
      opacity: 0.9;
      transform: translateY(0);
    }

    /* The thin progress bar at the bottom */
    .loading-bar {
      width: 120px;
      height: 1px;
      background: rgba(255,255,255,0.1);
      margin-top: 20px;
      overflow: hidden;
    }

    .loading-bar-fill {
      height: 100%;
      width: 0%;
      background: ${accentColor};
      animation: loadingProgress 4s cubic-bezier(0.4, 0, 0.2, 1) 0.4s forwards; /* was 2.5s */
      box-shadow: 0 0 8px ${accentColor};
    }

    @keyframes wordReveal {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes loadingFadeIn {
      to { opacity: 1; }
    }

    @keyframes loadingProgress {
      to { width: 100%; }
    }
  `;
}