

const WORLD = {
  '1970s': {
    disco: {
      name: 'Saturday Night',
      location: 'New York, 1977',
      era: '1970s',
      genre: 'disco',
      lastfmTag: 'disco',
      venueClass: 'venue--disco-70s',
      description: 'Where the night never ends',
      artists: ['Donna Summer', 'Chic', 'Earth Wind & Fire', 'Bee Gees'],
      accentColor: '#F59E0B'
    },
    jazz: {
      name: 'The Jazz Lounge',
      location: 'New York, 1973',
      era: '1970s',
      genre: 'jazz',
      lastfmTag: 'jazz',
      venueClass: 'venue--jazz-70s',
      description: 'Smoky rooms and late-night standards',
      artists: ['Miles Davis', 'John Coltrane', 'Herbie Hancock', 'Bill Evans'],
      accentColor: '#D97706'
    },
    rock: {
      name: 'The Amphitheatre',
      location: 'London, 1974',
      era: '1970s',
      genre: 'classic rock',
      lastfmTag: 'classic rock',
      venueClass: 'venue--rock-70s',
      description: 'Fifty thousand people and one spotlight',
      artists: ['Led Zeppelin', 'Black Sabbath', 'Queen', 'Fleetwood Mac'],
      accentColor: '#EF4444'
    },
    soul: {
      name: 'Soul Records',
      location: 'Detroit, 1971',
      era: '1970s',
      genre: 'soul',
      lastfmTag: 'soul',
      venueClass: 'venue--soul-70s',
      description: 'Every record has a story',
      artists: ['Marvin Gaye', 'Stevie Wonder', 'Al Green', 'Curtis Mayfield'],
      accentColor: '#F97316'
    }
  },

  '1990s': {
    grunge: {
      name: 'The Grunge Club',
      location: 'Seattle, 1993',
      era: '1990s',
      genre: 'grunge',
      lastfmTag: 'grunge',
      venueClass: 'venue--grunge-90s',
      description: 'Loud, low, and completely real',
      artists: ['Nirvana', 'Pearl Jam', 'Soundgarden', 'Alice in Chains'],
      accentColor: '#DC2626'
    },
    hiphop: {
      name: 'The Corner',
      location: 'New York, 1994',
      era: '1990s',
      genre: 'hip-hop',
      lastfmTag: 'hip-hop',
      venueClass: 'venue--hiphop-90s',
      description: 'The block is always hot',
      artists: ['Nas', 'Jay-Z', 'Wu-Tang Clan', 'The Notorious B.I.G.'],
      accentColor: '#F59E0B'
    },
    indie: {
      name: 'The Indie Bar',
      location: 'Manchester, 1995',
      era: '1990s',
      genre: 'indie',
      lastfmTag: 'britpop',
      venueClass: 'venue--indie-90s',
      description: 'Warm lights and borrowed guitars',
      artists: ['Radiohead', 'Oasis', 'Blur', 'The Verve', 'Elliott Smith'],
      accentColor: '#84CC16'
    },
    rnb: {
      name: 'The R&B Studio',
      location: 'Atlanta, 1996',
      era: '1990s',
      genre: 'r&b',
      lastfmTag: 'rnb',
      venueClass: 'venue--rnb-90s',
      description: 'The red light is always on',
      artists: ['TLC', 'Aaliyah', "D'Angelo", 'Mary J. Blige'],
      accentColor: '#A855F7'
    }
  },

  '2020s': {
    hyperpop: {
      name: 'The Hyperpop Rave',
      location: 'Online, 2021',
      era: '2020s',
      genre: 'hyperpop',
      lastfmTag: 'hyperpop',
      venueClass: 'venue--hyperpop-now',
      description: 'Too loud. Too fast. Perfect.',
      artists: ['100 gecs', 'Charli XCX', 'SOPHIE', 'Bladee'],
      accentColor: '#EC4899'
    },
    lofi: {
      name: 'The Lo-fi Bedroom',
      location: 'Somewhere, 3am',
      era: '2020s',
      genre: 'lo-fi',
      lastfmTag: 'lo-fi',
      venueClass: 'venue--lofi-now',
      description: 'Just you, a lamp, and this song',
      artists: ['Joji', 'Rex Orange County', 'Men I Trust', 'Clairo'],
      accentColor: '#6366F1'
    },
    trap: {
      name: 'The Trap Studio',
      location: 'Atlanta, 2022',
      era: '2020s',
      genre: 'trap',
      lastfmTag: 'trap',
      venueClass: 'venue--trap-now',
      description: 'The city never sleeps',
      artists: ['Travis Scott', 'Playboi Carti', 'Drake', 'Future'],
      accentColor: '#7C3AED'
    },
    bedroompop: {
      name: 'The Bedroom Pop Cafe',
      location: 'Everywhere, 2023',
      era: '2020s',
      genre: 'bedroom pop',
      lastfmTag: 'bedroom pop',
      venueClass: 'venue--bedroompop-now',
      description: 'Songs that feel like letters',
      artists: ['Phoebe Bridgers', 'boygenius', 'Big Thief', 'Soccer Mommy'],
      accentColor: '#F59E0B'
    }
  }
};

// --- Genre detection ---
// When a user searches a song, iTunes tells us the genre.
// This maps those genre names to the right venue in WORLD.
const GENRE_MAP = [
  { keywords: ['jazz', 'blues', 'bebop'],            era: '1970s', genre: 'jazz'      },
  { keywords: ['disco', 'funk'],                      era: '1970s', genre: 'disco'     },
  { keywords: ['classic rock', 'hard rock', 'folk'],  era: '1970s', genre: 'rock'      },
  { keywords: ['soul', 'motown', 'gospel'],           era: '1970s', genre: 'soul'      },
  { keywords: ['grunge', 'metal', 'punk', 'heavy'],   era: '1990s', genre: 'grunge'    },
  { keywords: ['hip-hop', 'hip hop', 'rap'],          era: '1990s', genre: 'hiphop'    },
  { keywords: ['indie', 'alternative', 'britpop'],    era: '1990s', genre: 'indie'     },
  { keywords: ['r&b', 'rhythm and blues', 'neo soul'],era: '1990s', genre: 'rnb'       },
  { keywords: ['hyperpop', 'electronic', 'edm'],      era: '2020s', genre: 'hyperpop'  },
  { keywords: ['lo-fi', 'lofi', 'chill'],             era: '2020s', genre: 'lofi'      },
  { keywords: ['trap', 'drill'],                      era: '2020s', genre: 'trap'       },
  { keywords: ['pop', 'singer-songwriter', 'folk pop'],era: '2020s', genre: 'bedroompop'}
];

function mapSongToVenue(track) {
  const genreRaw = (track.primaryGenreName || '').toLowerCase();
  const year = track.releaseDate ? new Date(track.releaseDate).getFullYear() : null;

  // Determine era from year FIRST — this overrides genre keywords
  let forcedEra = null;
  if (year) {
    if (year >= 2010)      forcedEra = '2020s';
    else if (year >= 1988) forcedEra = '1990s';
    else                   forcedEra = '1970s';
  }

  // Genre keyword matching — but only within the forced era
  const ERA_GENRE_MAP = {
    '1970s': [
      { keywords: ['disco', 'funk'],                             genre: 'disco'  },
      { keywords: ['jazz', 'blues', 'bebop', 'swing'],          genre: 'jazz'   },
      { keywords: ['rock', 'classic rock', 'hard rock', 'folk'],genre: 'rock'   },
      { keywords: ['soul', 'motown', 'gospel', 'r&b'],          genre: 'soul'   },
    ],
    '1990s': [
      { keywords: ['grunge', 'metal', 'punk', 'heavy'],         genre: 'grunge' },
      { keywords: ['hip-hop', 'hip hop', 'rap'],                genre: 'hiphop' },
      { keywords: ['indie', 'alternative', 'britpop'],          genre: 'indie'  },
      { keywords: ['r&b', 'rhythm and blues', 'neo soul'],      genre: 'rnb'    },
    ],
    '2020s': [
      { keywords: ['electronic', 'edm', 'hyperpop'],            genre: 'hyperpop'   },
      { keywords: ['lo-fi', 'lofi', 'chill', 'ambient'],        genre: 'lofi'       },
      { keywords: ['trap', 'drill', 'rap', 'hip-hop', 'hip hop'],genre: 'trap'      },
      { keywords: ['pop', 'indie', 'alternative', 'folk',
                   'singer-songwriter', 'rock', 'psychedelic'], genre: 'bedroompop' },
    ],
  };

  if (forcedEra) {
    const entries = ERA_GENRE_MAP[forcedEra];
    for (const entry of entries) {
      if (entry.keywords.some(k => genreRaw.includes(k))) {
        return WORLD[forcedEra][entry.genre];
      }
    }
    // Year matched an era but genre didn't match anything — use era default
    const defaults = { '1970s': 'rock', '1990s': 'indie', '2020s': 'bedroompop' };
    return WORLD[forcedEra][defaults[forcedEra]];
  }

  // No year at all — fall back to genre keywords across all eras
  for (const [era, entries] of Object.entries(ERA_GENRE_MAP)) {
    for (const entry of entries) {
      if (entry.keywords.some(k => genreRaw.includes(k))) {
        return WORLD[era][entry.genre];
      }
    }
  }

  return WORLD['2020s'].bedroompop;
}