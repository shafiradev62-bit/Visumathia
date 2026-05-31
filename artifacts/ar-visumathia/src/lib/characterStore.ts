import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CharacterType = 'girl' | 'boy';

interface CharacterState {
  character: CharacterType;
  setCharacter: (c: CharacterType) => void;
}

export const useCharacterStore = create<CharacterState>()(
  persist(
    (set) => ({
      character: 'girl',
      setCharacter: (character) => set({ character }),
    }),
    { name: 'ar-visumathia-character' }
  )
);

/** Returns the correct model paths for the selected character */
export function getCharacterModels(character: CharacterType) {
  if (character === 'boy') {
    return {
      idle: '/models/boy.glb',
      wave: '/models/boy.glb',
      walk: '/models/boy.glb',
    };
  }
  return {
    idle: '/models/hai.glb',
    wave: '/models/dadah.glb',
    walk: '/models/jalan.glb',
  };
}
