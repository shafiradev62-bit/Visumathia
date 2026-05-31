import { Howl } from 'howler';
import { resolvePhraseSlug } from './vimoLines';

/**
 * Audio manager for AR-VisuMathia.
 * Vimo voice strategy:
 *   1. If a pre-recorded MP3 exists in /voice/vimo/{slug}.mp3, play it
 *      (this is the best option — real child voice).
 *   2. Otherwise, fall back to the Web Speech API tuned for a young
 *      female Indonesian voice.
 */

// === SFX Sounds (short UI sounds) ===
const SFX_URLS: Record<string, string> = {
  tap: 'https://cdn.freesound.org/previews/614/614087_5674468-lq.mp3',
  success: 'https://cdn.freesound.org/previews/341/341695_5858296-lq.mp3',
  star: 'https://cdn.freesound.org/previews/270/270402_5123851-lq.mp3',
  pop: 'https://cdn.freesound.org/previews/566/566384_12517093-lq.mp3',
  whoosh: 'https://cdn.freesound.org/previews/527/527647_7724935-lq.mp3',
  complete: 'https://cdn.freesound.org/previews/456/456966_6142149-lq.mp3',
  click: 'https://cdn.freesound.org/previews/588/588236_12911518-lq.mp3',
  wrong: 'https://cdn.freesound.org/previews/331/331912_3248244-lq.mp3',
  combo: 'https://cdn.freesound.org/previews/320/320655_5260872-lq.mp3',
  countdown: 'https://cdn.freesound.org/previews/536/536420_4921277-lq.mp3',
  cheer: 'https://cdn.freesound.org/previews/462/462362_8694723-lq.mp3',
};

// === Background Music ===
let bgMusic: Howl | null = null;

export function playBgMusic() {
  if (bgMusic) {
    if (!bgMusic.playing()) bgMusic.play();
    return;
  }
  bgMusic = new Howl({
    src: ['/voice/bgm.mp3'],
    volume: 0.3,
    loop: true,
    preload: false,
    onplayerror: () => {
      const unlock = () => {
        bgMusic?.play();
        document.removeEventListener('click', unlock);
        document.removeEventListener('touchstart', unlock);
      };
      document.addEventListener('click', unlock, { once: true });
      document.addEventListener('touchstart', unlock, { once: true });
    },
  });
  bgMusic.play();
}

export function stopBgMusic() {
  if (bgMusic) { bgMusic.stop(); }
}

const sfxCache: Record<string, Howl> = {};

function getSfx(name: string): Howl | null {
  if (!SFX_URLS[name]) return null;
  if (!sfxCache[name]) {
    sfxCache[name] = new Howl({
      src: [SFX_URLS[name]],
      volume: 0.5,
      preload: false,
    });
  }
  return sfxCache[name];
}

/**
 * Haptic feedback — fires device vibration where supported (Android Chrome).
 * Pattern is a duration in ms or an array of [vibrate, pause, vibrate, ...].
 */
export function triggerHaptic(pattern: number | number[] = 28) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern); } catch { /* ignore if blocked */ }
  }
}

/** Play a UI sound. Certain sounds also trigger haptic feedback. */
export function playSfx(name: keyof typeof SFX_URLS) {
  const sound = getSfx(name);
  if (sound) sound.play();

  // Haptic: short pulse for taps, double-tap for success/complete
  switch (name) {
    case 'tap':
    case 'pop':
      triggerHaptic(25);
      break;
    case 'success':
    case 'star':
      triggerHaptic([40, 20, 40]);
      break;
    case 'complete':
    case 'cheer':
      triggerHaptic([50, 30, 80, 30, 50]);
      break;
    case 'wrong':
      triggerHaptic([60, 20, 60]);
      break;
    default:
      break;
  }
}

/* ──────────────────────────────────────────────────────────────
   SCENE NARRATION
   Per-scene intro voiceover stored at /voice/narration/scene-N.m4a
─────────────────────────────────────────────────────────────── */

const narrationCache: Record<number, Howl> = {};
let activeNarration: Howl | null = null;

export function playSceneNarration(sceneId: number): void {
  if (activeNarration) {
    activeNarration.stop();
    activeNarration = null;
  }
  if (!narrationCache[sceneId]) {
    const url = `${VOICE_DIR}voice/narration/scene-${sceneId}.m4a`.replace('//', '/');
    narrationCache[sceneId] = new Howl({
      src: [url],
      volume: 1.0,
      preload: false,
      onloaderror: () => {
        delete narrationCache[sceneId];
      },
    });
  }
  const howl = narrationCache[sceneId];
  if (howl) {
    activeNarration = howl;
    howl.play();
  }
}

export function stopSceneNarration(): void {
  if (activeNarration) {
    activeNarration.stop();
    activeNarration = null;
  }
}

/* ──────────────────────────────────────────────────────────────
   PRE-RECORDED VOICE LINES
─────────────────────────────────────────────────────────────── */

const recordedCache: Record<string, Howl> = {};
const recordedMissing = new Set<string>();
let activeRecorded: Howl | null = null;

const VOICE_DIR =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.BASE_URL
    ? (import.meta as any).env.BASE_URL
    : '/');

function getRecorded(slug: string): Howl | null {
  if (recordedMissing.has(slug)) return null;
  if (recordedCache[slug]) return recordedCache[slug];
  const url = `${VOICE_DIR}voice/vimo/${slug}.mp3`.replace('//', '/');
  const howl = new Howl({
    src: [url],
    volume: 1.0,
    preload: false,
    onloaderror: () => {
      recordedMissing.add(slug);
      delete recordedCache[slug];
    },
  });
  recordedCache[slug] = howl;
  return howl;
}

function playRecorded(slug: string): Promise<boolean> {
  return new Promise((resolve) => {
    const howl = getRecorded(slug);
    if (!howl) { resolve(false); return; }
    let resolved = false;
    const fail = () => { if (!resolved) { resolved = true; resolve(false); } };
    const ok = () => { if (!resolved) { resolved = true; resolve(true); } };
    howl.once('loaderror', fail);
    howl.once('playerror', fail);
    howl.once('end', ok);
    howl.once('stop', ok);
    try {
      activeRecorded?.stop();
      activeRecorded = howl;
      howl.play();
      setTimeout(() => {
        if (recordedMissing.has(slug)) fail();
      }, 600);
    } catch {
      fail();
    }
  });
}

function stopRecorded() {
  if (activeRecorded) {
    activeRecorded.stop();
    activeRecorded = null;
  }
}

let selectedVoice: SpeechSynthesisVoice | null = null;
let voicesLoaded = false;

function scoreVoice(v: SpeechSynthesisVoice): number {
  let score = 0;
  const name = v.name.toLowerCase();
  const lang = v.lang.toLowerCase();

  if (lang.startsWith('id')) score += 200;
  else if (lang.startsWith('ms')) score += 100;
  else return 0;

  if (name.includes('female')) score += 100;
  if (name.includes('wanita') || name.includes('perempuan')) score += 100;
  if (name.includes('gadis')) score += 150;
  if (name.includes('damayanti')) score += 150;
  if (name.includes('siti')) score += 130;
  if (name.includes('amira')) score += 120;
  if (name.includes('adinda')) score += 120;
  if (name.includes('rifka')) score += 120;
  if (name.includes('andika')) score -= 80;
  if (name.includes('male')) score -= 80;
  if (name.includes('pria') || name.includes('laki')) score -= 80;
  if (name.includes('neural')) score += 60;
  if (name.includes('online')) score += 40;
  if (!v.localService) score += 30;
  if (name.includes('google')) score += 25;
  if (name.includes('microsoft')) score += 20;

  return score;
}

function pickBestVoice(): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices();
  if (!voices.length) return null;
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const v of voices) {
    const s = scoreVoice(v);
    if (s > bestScore) { bestScore = s; best = v; }
  }
  return best;
}

function initVoices() {
  selectedVoice = pickBestVoice();
  voicesLoaded = true;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  if (speechSynthesis.getVoices().length > 0) {
    initVoices();
  }
  speechSynthesis.onvoiceschanged = initVoices;
}

/**
 * Speak text — DISABLED. All voice now comes from scene narration files only.
 */
export function speakVimo(_text: string): Promise<void> {
  return Promise.resolve();
}

/**
 * Speak a counting number — DISABLED.
 */
export function speakNumber(_n: number): Promise<void> {
  return Promise.resolve();
}

function speakWithTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) { resolve(); return; }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    if (!voicesLoaded || !selectedVoice) {
      selectedVoice = pickBestVoice();
      voicesLoaded = true;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.pitch = 1.28;
    utterance.rate = 1.08;
    utterance.volume = 1.0;
    utterance.lang = selectedVoice?.lang ?? 'id-ID';

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    speechSynthesis.speak(utterance);

    let started = false;
    utterance.onstart = () => { started = true; };
    setTimeout(() => {
      if (!started) {
        speechSynthesis.cancel();
        const retry = new SpeechSynthesisUtterance(text);
        if (selectedVoice) retry.voice = selectedVoice;
        retry.pitch = 1.28;
        retry.rate = 1.08;
        retry.volume = 1.0;
        retry.lang = selectedVoice?.lang ?? 'id-ID';
        retry.onend = () => resolve();
        retry.onerror = () => resolve();
        speechSynthesis.speak(retry);
      }
    }, 800);
  });
}

export function stopVimo() {
  stopSceneNarration();
}

// === Preload common SFX ===
export function preloadAudio() {
  Object.keys(SFX_URLS).forEach(name => getSfx(name));
}
