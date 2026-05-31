import { createContext, useContext } from 'react';

/** True when passthrough AR controls the Three.js camera (not cinematic / cardboard). */
export const ARSessionContext = createContext(false);

export function useARSession() {
  return useContext(ARSessionContext);
}
