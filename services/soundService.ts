
const CORRECT_SOUND_URL = 'https://tiengdong.com/download/?file=true&id=2407.2394';
const INCORRECT_SOUND_URL = 'https://tiengdong.com/download/?file=true&id=11501.1952';
const ACHIEVEMENT_SOUND_URL = 'https://cdn.pixabay.com/download/audio/2025/07/29/audio_61ec3d0456.mp3?filename=kids-baby-children-music-382060.mp3';


let correctSound: HTMLAudioElement | null = null;
let incorrectSound: HTMLAudioElement | null = null;
let achievementSound: HTMLAudioElement | null = null;
let isAudioUnlocked = false;

// Initialize audio elements once in a browser environment to improve reliability.
if (typeof window !== 'undefined') {
    correctSound = new Audio(CORRECT_SOUND_URL);
    incorrectSound = new Audio(INCORRECT_SOUND_URL);
    achievementSound = new Audio(ACHIEVEMENT_SOUND_URL);

    // Preloading can help, but browsers handle this differently.
    correctSound.preload = 'auto';
    incorrectSound.preload = 'auto';
    achievementSound.preload = 'auto';
}

// Create a reusable audio context
let audioContext: AudioContext;
const getAudioContext = () => {
    if (!audioContext && typeof window !== 'undefined') {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContext;
};

// Function to unlock audio on user interaction
export const unlockAudio = async () => {
  if (isAudioUnlocked || typeof window === 'undefined') return;
  const context = getAudioContext();
  if (context && context.state === 'suspended') {
    await context.resume();
  }
  // Play a silent sound to unlock audio on all platforms
  if (context) {
    const buffer = context.createBuffer(1, 1, 22050);
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    source.start(0);
  }
  // Also explicitly load the main audio elements after the first user gesture.
  correctSound?.load();
  incorrectSound?.load();
  achievementSound?.load();
  
  isAudioUnlocked = true;
  console.log("Audio unlocked and sound effects preloaded.");
};

const playSound = async (audioElement: HTMLAudioElement | null) => {
  if (!isAudioUnlocked) {
      console.warn("Audio is not unlocked. Call unlockAudio() on first user interaction.");
      await unlockAudio();
  }
  if (audioElement) {
    // Rewind to the start before playing, allowing rapid re-triggering.
    audioElement.currentTime = 0;
    audioElement.play().catch(error => console.error("Error playing sound:", error));
  }
};

export const playCorrectSound = () => {
  playSound(correctSound);
};

export const playIncorrectSound = () => {
  playSound(incorrectSound);
};

export const playAchievementSound = () => {
  playSound(achievementSound);
};