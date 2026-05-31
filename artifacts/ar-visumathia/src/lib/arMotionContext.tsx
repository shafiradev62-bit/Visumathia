import { createContext, useContext } from 'react';
import type { useDeviceMotionAR } from '@/hooks/useDeviceMotionAR';

export type ARMotionApi = ReturnType<typeof useDeviceMotionAR>;

export const ARMotionContext = createContext<ARMotionApi | null>(null);

export function useARMotion() {
  const ctx = useContext(ARMotionContext);
  if (!ctx) {
    throw new Error('useARMotion must be used inside ARMotionContext.Provider');
  }
  return ctx;
}
