import { create } from 'zustand';

/**
 * Global game state — tracks combo, score, timer, streaks across scenes.
 * Makes the game feel premium with combo multipliers and time bonuses.
 */

interface GameState {
  // Combo system
  combo: number;
  maxCombo: number;
  lastTapTime: number;

  // Score
  totalScore: number;
  sceneScore: number;

  // Timer
  timerActive: boolean;
  timerStart: number;
  timeElapsed: number;

  // Streak voice lines
  streakMessages: string[];

  // Actions
  registerTap: (correct: boolean) => void;
  resetScene: () => void;
  startTimer: () => void;
  stopTimer: () => number;
  addScore: (points: number) => void;
}

const STREAK_MESSAGES = [
  '', // 0
  '', // 1
  'Combo 2!',
  'Combo 3! Keren!',
  'Combo 4! Luar biasa!',
  'PERFECT STREAK!',
];

export const useGameStore = create<GameState>((set, get) => ({
  combo: 0,
  maxCombo: 0,
  lastTapTime: 0,
  totalScore: 0,
  sceneScore: 0,
  timerActive: false,
  timerStart: 0,
  timeElapsed: 0,
  streakMessages: STREAK_MESSAGES,

  registerTap: (correct: boolean) => {
    const now = Date.now();
    if (correct) {
      const newCombo = get().combo + 1;
      const multiplier = Math.min(newCombo, 5);
      const bonusPoints = 10 * multiplier;
      set({
        combo: newCombo,
        maxCombo: Math.max(newCombo, get().maxCombo),
        lastTapTime: now,
        sceneScore: get().sceneScore + bonusPoints,
      });
    } else {
      // Break combo on wrong answer
      set({ combo: 0, lastTapTime: now });
    }
  },

  resetScene: () => set({
    combo: 0,
    maxCombo: 0,
    sceneScore: 0,
    timerActive: false,
    timerStart: 0,
    timeElapsed: 0,
  }),

  startTimer: () => set({ timerActive: true, timerStart: Date.now() }),

  stopTimer: () => {
    const elapsed = Date.now() - get().timerStart;
    set({ timerActive: false, timeElapsed: elapsed });
    return elapsed;
  },

  addScore: (points: number) => set({
    sceneScore: get().sceneScore + points,
    totalScore: get().totalScore + points,
  }),
}));

/**
 * Calculate star rating based on performance.
 * 3 stars: fast + no mistakes (max combo = total taps)
 * 2 stars: completed with some mistakes
 * 1 star: completed but slow or many mistakes
 */
export function calculateStars(maxCombo: number, totalTaps: number, timeMs: number, parTimeMs: number): number {
  const comboRatio = maxCombo / totalTaps;
  const timeRatio = parTimeMs / Math.max(timeMs, 1);

  if (comboRatio >= 0.9 && timeRatio >= 0.8) return 3;
  if (comboRatio >= 0.5 || timeRatio >= 0.5) return 2;
  return 1;
}
