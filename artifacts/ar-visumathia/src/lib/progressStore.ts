/**
 * Progress & Unlock system for AR-VisuMathia.
 * Tracks: stars earned, scenes completed, achievements, total play time.
 * Persisted to localStorage so progress survives page reload.
 * Scenes unlock sequentially — must complete scene N to unlock N+1.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SceneProgress {
  completed: boolean;
  stars: number; // 0-3
  bestScore: number;
  attempts: number;
  totalPlayTime: number; // seconds
  lastPlayed: number | null; // timestamp
}

interface Achievement {
  id: string;
  name: string;
  nameId: string;
  description: string;
  descriptionId: string;
  condition: (state: ProgressState) => boolean;
  unlocked: boolean;
  unlockedAt: number | null;
}

interface ProgressState {
  // Per-scene progress
  scenes: Record<number, SceneProgress>;

  // Global stats
  totalStars: number;
  totalScore: number;
  totalPlayTime: number;
  sessionsPlayed: number;
  currentStreak: number; // days in a row
  lastSessionDate: string | null;

  // Player profile
  playerName: string;
  playerAge: number;
  difficulty: 'easy' | 'medium' | 'hard';

  // Achievements
  achievements: Achievement[];

  // Actions
  completeScene: (sceneId: number, stars: number, score: number, playTime: number) => void;
  setPlayerInfo: (name: string, age: number) => void;
  setDifficulty: (d: 'easy' | 'medium' | 'hard') => void;
  isSceneUnlocked: (sceneId: number) => boolean;
  getHighestUnlocked: () => number;
  startSession: () => void;
}

const DEFAULT_SCENE: SceneProgress = {
  completed: false,
  stars: 0,
  bestScore: 0,
  attempts: 0,
  totalPlayTime: 0,
  lastPlayed: null,
};

const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_star', name: 'First Star', nameId: 'Bintang Pertama', description: 'Earn your first star', descriptionId: 'Dapatkan bintang pertamamu', condition: (s) => s.totalStars >= 1 },
  { id: 'five_stars', name: 'Star Collector', nameId: 'Pengumpul Bintang', description: 'Earn 5 stars', descriptionId: 'Kumpulkan 5 bintang', condition: (s) => s.totalStars >= 5 },
  { id: 'ten_stars', name: 'Star Master', nameId: 'Master Bintang', description: 'Earn 10 stars', descriptionId: 'Kumpulkan 10 bintang', condition: (s) => s.totalStars >= 10 },
  { id: 'all_stars', name: 'Perfect Explorer', nameId: 'Petualang Sempurna', description: 'Earn all 30 stars', descriptionId: 'Kumpulkan semua 30 bintang', condition: (s) => s.totalStars >= 30 },
  { id: 'first_complete', name: 'First Adventure', nameId: 'Petualangan Pertama', description: 'Complete your first scene', descriptionId: 'Selesaikan scene pertamamu', condition: (s) => Object.values(s.scenes).some(sc => sc.completed) },
  { id: 'half_complete', name: 'Halfway There', nameId: 'Setengah Jalan', description: 'Complete 5 scenes', descriptionId: 'Selesaikan 5 scene', condition: (s) => Object.values(s.scenes).filter(sc => sc.completed).length >= 5 },
  { id: 'all_complete', name: 'World Champion', nameId: 'Juara Dunia', description: 'Complete all 10 scenes', descriptionId: 'Selesaikan semua 10 scene', condition: (s) => Object.values(s.scenes).filter(sc => sc.completed).length >= 10 },
  { id: 'streak_3', name: '3-Day Streak', nameId: 'Rajin 3 Hari', description: 'Play 3 days in a row', descriptionId: 'Main 3 hari berturut-turut', condition: (s) => s.currentStreak >= 3 },
  { id: 'speed_demon', name: 'Speed Demon', nameId: 'Si Cepat', description: 'Complete a scene in under 30 seconds', descriptionId: 'Selesaikan scene dalam 30 detik', condition: (s) => Object.values(s.scenes).some(sc => sc.totalPlayTime > 0 && sc.totalPlayTime < 30) },
];

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      scenes: {},
      totalStars: 0,
      totalScore: 0,
      totalPlayTime: 0,
      sessionsPlayed: 0,
      currentStreak: 0,
      lastSessionDate: null,
      playerName: '',
      playerAge: 5,
      difficulty: 'easy',
      achievements: ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, unlockedAt: null })),

      completeScene: (sceneId, stars, score, playTime) => {
        const state = get();
        const existing = state.scenes[sceneId] || { ...DEFAULT_SCENE };
        const newStars = Math.max(existing.stars, stars);
        const starDiff = newStars - existing.stars;

        set({
          scenes: {
            ...state.scenes,
            [sceneId]: {
              completed: true,
              stars: newStars,
              bestScore: Math.max(existing.bestScore, score),
              attempts: existing.attempts + 1,
              totalPlayTime: existing.totalPlayTime + playTime,
              lastPlayed: Date.now(),
            },
          },
          totalStars: state.totalStars + starDiff,
          totalScore: state.totalScore + score,
          totalPlayTime: state.totalPlayTime + playTime,
        });

        // Check achievements
        const updatedState = get();
        const newAchievements = updatedState.achievements.map(a => {
          if (!a.unlocked && a.condition(updatedState)) {
            return { ...a, unlocked: true, unlockedAt: Date.now() };
          }
          return a;
        });
        set({ achievements: newAchievements });
      },

      setPlayerInfo: (name, age) => set({ playerName: name, playerAge: age }),
      setDifficulty: (d) => set({ difficulty: d }),

      isSceneUnlocked: (sceneId) => {
        if (sceneId === 1) return true; // First scene always unlocked
        const prev = get().scenes[sceneId - 1];
        return prev?.completed || false;
      },

      getHighestUnlocked: () => {
        const state = get();
        for (let i = 10; i >= 1; i--) {
          if (state.isSceneUnlocked(i)) return i;
        }
        return 1;
      },

      startSession: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        let streak = state.currentStreak;

        if (state.lastSessionDate) {
          const lastDate = new Date(state.lastSessionDate);
          const todayDate = new Date(today);
          const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) streak += 1;
          else if (diffDays > 1) streak = 1;
          // Same day = no change
        } else {
          streak = 1;
        }

        set({
          sessionsPlayed: state.sessionsPlayed + 1,
          currentStreak: streak,
          lastSessionDate: today,
        });
      },
    }),
    { name: 'ar-visumathia-progress' }
  )
);
