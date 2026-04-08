
const LASTFM_KEY = 'f0ca6bb10f9491abe1aede60063bf87b'; 

const API = {

  // Search songs as user types : used for the search dropdown
  async searchSongs(term, limit = 20) {
    try {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=${limit}&country=US&callback=?`;
      // iTunes requires JSONP on some setups, but fetch works on localhost
      const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&media=music&limit=${limit}&country=US`);
      const data = await res.json();
      return data.results || [];
    } catch (err) {
      console.error('iTunes search failed:', err);
      return [];
    }
  },

  // Get songs for a venue queue using an artist name
  async getVenueQueue(artists, limit = 20) {
    try {
      // Pick a random artist from the venue's artist list
      const artist = artists[Math.floor(Math.random() * artists.length)];
      const res = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&media=music&limit=${limit}&country=US`
      );
      const data = await res.json();
      // Only keep tracks that have a preview URL
      return (data.results || []).filter(t => t.previewUrl);
    } catch (err) {
      console.error('iTunes venue queue failed:', err);
      return [];
    }
  },

  // Get top tracks for a genre tag from Last.fm
  async getTagTopTracks(tag, limit = 20) {
    try {
      const res = await fetch(
        `https://ws.audioscrobbler.com/2.0/?method=tag.gettoptracks&tag=${encodeURIComponent(tag)}&api_key=${LASTFM_KEY}&format=json&limit=${limit}`
      );
      const data = await res.json();
      return data.tracks?.track || [];
    } catch (err) {
      console.error('Last.fm fetch failed:', err);
      return [];
    }
  },

  // Cross-reference a Last.fm track with iTunes to get the preview URL
  async getItunesTrack(artist, songName) {
    try {
      const results = await this.searchSongs(`${artist} ${songName}`, 3);
      return results.find(t => t.previewUrl) || null;
    } catch (err) {
      return null;
    }
  },

  // Get 3 sample songs for the venue preview panel (Day 6, but set it up now)
  async getVenuePreviewSongs(artists) {
    const artist = artists[0];
    const results = await this.searchSongs(artist, 5);
    return results.filter(t => t.previewUrl).slice(0, 3);
  }
  
};
