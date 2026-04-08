// =====================
// COLOR EXTRACTOR — colorExtractor.js
// Finds the dominant vivid colour in album art using Canvas API
// =====================

const ColorExtractor = {

  async extract(imageUrl) {
    return new Promise((resolve) => {
      const img   = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const SIZE = 48;
          const canvas = document.createElement('canvas');
          canvas.width  = SIZE;
          canvas.height = SIZE;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, SIZE, SIZE);

          const { data } = ctx.getImageData(0, 0, SIZE, SIZE);
          const freq = {};

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            // Skip near-black, near-white, and near-grey pixels
            const brightness  = (r + g + b) / 3;
            const saturation  = Math.max(r, g, b) - Math.min(r, g, b);
            if (brightness < 25 || brightness > 230) continue;
            if (saturation < 40) continue; // skip grey/neutral

            // Quantise into buckets of 24
            const key = `${Math.round(r / 24) * 24},${Math.round(g / 24) * 24},${Math.round(b / 24) * 24}`;
            freq[key] = (freq[key] || 0) + 1;
          }

          const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
          if (!sorted.length) { resolve(null); return; }

          const [rStr, gStr, bStr] = sorted[0][0].split(',');
          resolve(`rgb(${rStr},${gStr},${bStr})`);
        } catch {
          resolve(null);
        }
      };

      img.onerror = () => resolve(null);
      img.src = imageUrl;
    });
  },

  // Returns color string, or a CSS variable fallback
  async extractWithFallback(imageUrl, fallbackHex = '#D97706') {
    const color = await this.extract(imageUrl);
    return color || fallbackHex;
  },

  // Converts rgb(r,g,b) to rgba(r,g,b,alpha)
  toRgba(rgbStr, alpha) {
    if (!rgbStr) return `rgba(217,119,6,${alpha})`;
    return rgbStr.replace('rgb(', 'rgba(').replace(')', `,${alpha})`);
  }
};