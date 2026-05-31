import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import {
  useResetProgress,
  getGetProgressQueryKey,
  getListScenesQueryKey,
  getGetRewardsQueryKey,
  getGetStatsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useGameStore } from '@/store/gameStore';
import {
  PaintedSkyMeadow,
  ParchmentPanel,
  WoodSign,
  PaintedBackButton,
  PaintedButton,
} from '@/components/painted';

export function SettingsPage() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { soundEnabled, toggleSound } = useGameStore();
  const resetProgress = useResetProgress();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = () => {
    if (!confirmReset) { setConfirmReset(true); return; }
    resetProgress.mutate(undefined, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListScenesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetRewardsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        setResetDone(true);
        setConfirmReset(false);
        setTimeout(() => setLocation('/home'), 1500);
      },
    });
  };

  return (
    <div className="fixed inset-0 overflow-auto">
      <div className="absolute inset-0 z-0">
        <PaintedSkyMeadow />
      </div>

      <PaintedBackButton onClick={() => setLocation('/home')} />

      <div className="relative z-10 px-4 pt-4 max-w-md mx-auto">
        <div className="flex justify-center mb-3">
          <WoodSign text="Pengaturan" width={260} height={64} />
        </div>

        <div className="space-y-4">
          {/* Sound toggle */}
          <ParchmentPanel width="100%" height={120}>
            <div className="absolute inset-0 p-5 flex items-center justify-between">
              <div>
                <div
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    color: '#2a1809',
                    fontSize: 18,
                  }}
                >
                  Suara
                </div>
                <div
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 700,
                    fontSize: 12,
                    color: '#7a4a17',
                    marginTop: 2,
                  }}
                >
                  {soundEnabled ? 'Suara aktif' : 'Suara dimatikan'}
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleSound}
                style={{
                  width: 64,
                  height: 32,
                  borderRadius: 9999,
                  border: '2.5px solid #2a1809',
                  background: soundEnabled
                    ? 'linear-gradient(180deg,#a3d075 0%,#5b8a35 100%)'
                    : 'linear-gradient(180deg,#cfd6da 0%,#7a8893 100%)',
                  position: 'relative',
                  boxShadow: '2px 3px 0 #2a1809, inset 0 1.5px 0 rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                }}
              >
                <motion.div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle at 30% 28%, #fff7c4, #c69553 70%)',
                    border: '2px solid #2a1809',
                    position: 'absolute',
                    top: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  animate={{ x: soundEnabled ? 32 : 2 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {soundEnabled
                    ? <Volume2 className="w-3 h-3" style={{ color: '#3d2410' }} />
                    : <VolumeX className="w-3 h-3" style={{ color: '#3d2410' }} />}
                </motion.div>
              </motion.button>
            </div>
          </ParchmentPanel>

          {/* Reset Progress */}
          <ParchmentPanel width="100%" height={170}>
            <div className="absolute inset-0 p-5 flex flex-col">
              <div
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  color: '#2a1809',
                  fontSize: 18,
                }}
              >
                Reset Petualangan
              </div>
              <div
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  color: '#7a4a17',
                  marginTop: 2,
                  marginBottom: 14,
                }}
              >
                Hapus semua bintang, badge, dan progres dunia.
              </div>

              {resetDone ? (
                <div
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    color: '#5b8a35',
                    fontSize: 14,
                    textAlign: 'center',
                    paddingTop: 8,
                  }}
                >
                  Progres direset! Kembali ke peta…
                </div>
              ) : (
                <PaintedButton
                  variant={confirmReset ? 'red' : 'orange'}
                  size="md"
                  onClick={handleReset}
                  disabled={resetProgress.isPending}
                  icon={<RotateCcw className="w-4 h-4" />}
                  style={{ alignSelf: 'stretch' }}
                >
                  {resetProgress.isPending
                    ? 'Mereset…'
                    : confirmReset
                    ? 'Yakin reset?'
                    : 'Reset Progres'}
                </PaintedButton>
              )}

              {confirmReset && !resetDone && (
                <button
                  onClick={() => setConfirmReset(false)}
                  style={{
                    marginTop: 8,
                    background: 'transparent',
                    border: 'none',
                    color: '#7a4a17',
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: 12,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Batal
                </button>
              )}
            </div>
          </ParchmentPanel>

          {/* About */}
          <ParchmentPanel width="100%" height={120}>
            <div className="absolute inset-0 p-5 flex flex-col items-center justify-center text-center">
              <div
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  color: '#2a1809',
                  fontSize: 22,
                }}
              >
                AR-VisuMathia
              </div>
              <div
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 12,
                  color: '#7a4a17',
                  marginTop: 4,
                }}
              >
                Petualangan belajar untuk anak usia 5–8 tahun
              </div>
              <div
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  color: '#9c7a3a',
                  marginTop: 6,
                }}
              >
                Versi 1.0
              </div>
            </div>
          </ParchmentPanel>
        </div>
      </div>
    </div>
  );
}
