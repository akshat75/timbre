// =====================
// AUDIO MANAGER — audio.js
// =====================

const AudioManager = {
  _audio: new Audio(),
  queue: [],
  currentIndex: 0,
  isPlaying: false,

  // Callbacks — set these in venue.js
  onTrackChange: null,
  onPlayStateChange: null,
  onProgress: null,

  init() {
    this._audio.volume = 0.7;

    this._audio.addEventListener('ended', () => {
      this._advance();
    });

    this._audio.addEventListener('error', () => {
      console.warn('Audio error on track, skipping...');
      setTimeout(() => this._advance(), 600);
    });

    this._audio.addEventListener('timeupdate', () => {
      if (this.onProgress && this._audio.duration) {
        const pct  = this._audio.currentTime / this._audio.duration;
        const cur  = this._audio.currentTime;
        const dur  = this._audio.duration;
        this.onProgress(pct, cur, dur);
      }
    });
  },

  // Load an array of tracks and start playing from startIndex
  setQueue(tracks, startIndex = 0) {
    this.queue = tracks.filter(t => t && t.previewUrl);
    this.currentIndex = Math.max(0, Math.min(startIndex, this.queue.length - 1));
    if (this.queue.length === 0) return;
    this._loadTrack(this.queue[this.currentIndex]);
    this.play();
  },

  play() {
    if (!this._audio.src) return;
    this._audio.play().then(() => {
      this.isPlaying = true;
      if (this.onPlayStateChange) this.onPlayStateChange(true);
    }).catch(() => {});
  },

  pause() {
    this._audio.pause();
    this.isPlaying = false;
    if (this.onPlayStateChange) this.onPlayStateChange(false);
  },

  toggle() {
    this.isPlaying ? this.pause() : this.play();
  },

  skip() {
    this._advance();
  },

  jumpTo(index) {
    if (index < 0 || index >= this.queue.length) return;
    this.currentIndex = index;
    this._loadTrack(this.queue[this.currentIndex]);
    this.play();
  },

  getCurrentTrack() {
    return this.queue[this.currentIndex] || null;
  },

  _loadTrack(track) {
    this._audio.src = track.previewUrl;
    this._audio.load();
    if (this.onTrackChange) this.onTrackChange(track, this.currentIndex);
  },

  _advance() {
    if (this.queue.length === 0) return;
    this.currentIndex = (this.currentIndex + 1) % this.queue.length;
    this._loadTrack(this.queue[this.currentIndex]);
    this.play();
  }
};

AudioManager.init();