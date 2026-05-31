import { create } from 'zustand';

export interface ParticleState {
  id: string;
  x: number;
  y: number;
  color: string;
}

interface GameState {
  currentScene: number | null;
  isARMode: boolean;
  soundEnabled: boolean;
  particles: ParticleState[];
  setScene: (sceneId: number | null) => void;
  toggleAR: () => void;
  toggleSound: () => void;
  addParticleBurst: (x: number, y: number) => void;
  removeParticle: (id: string) => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentScene: null,
  isARMode: true,
  soundEnabled: true,
  particles: [],
  setScene: (sceneId) => set({ currentScene: sceneId }),
  toggleAR: () => set((state) => ({ isARMode: !state.isARMode })),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  addParticleBurst: (x, y) => {
    const newParticles = Array.from({ length: 10 }).map((_, i) => ({
      id: `particle-${Date.now()}-${i}`,
      x: x + (Math.random() - 0.5) * 50,
      y: y + (Math.random() - 0.5) * 50,
      color: ['#4ECDC4', '#FFE66D', '#FF6B6B'][Math.floor(Math.random() * 3)],
    }));
    set((state) => ({ particles: [...state.particles, ...newParticles] }));
  },
  removeParticle: (id) =>
    set((state) => ({ particles: state.particles.filter((p) => p.id !== id) })),
}));
