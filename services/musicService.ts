const MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2025/07/29/audio_61ec3d0456.mp3?filename=kids-baby-children-music-382060.mp3';

let audio: HTMLAudioElement | null = null;

// Initialize audio element once in a browser environment
if (typeof window !== 'undefined') {
    audio = new Audio(MUSIC_URL);
    audio.loop = true;
    audio.volume = 0.1; // Keep volume low so it's not distracting
}

export const playMusic = () => {
  if (audio && audio.paused) {
    audio.play().catch(error => {
      // This error often happens if play() is called before any user interaction.
      // The `unlockAudio` service should handle this, but we'll log a warning just in case.
      console.warn("Music playback failed. User interaction might be required.", error);
    });
  }
};

export const pauseMusic = () => {
  if (audio && !audio.paused) {
    audio.pause();
  }
};

/**
 * Toggles music playback.
 * @returns {boolean} The new playing state (true if playing, false if paused).
 */
export const toggleMusic = (): boolean => {
  if (!audio) return false;
  
  if (audio.paused) {
    playMusic();
    return true;
  } else {
    pauseMusic();
    return false;
  }
};