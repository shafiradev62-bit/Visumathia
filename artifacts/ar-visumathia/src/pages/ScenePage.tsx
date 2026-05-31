import { useState, Suspense, useEffect, useCallback } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { AdaptiveDpr, AdaptiveEvents, Bvh, useProgress, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Pause } from 'lucide-react';
import { useGetScene, useCompleteScene, getListScenesQueryKey, getGetProgressQueryKey, getGetRewardsQueryKey, getGetStatsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { RewardExplosion } from '@/components/ui/RewardExplosion';
import { WebGLErrorBoundary } from '@/components/WebGLErrorBoundary';
import { ARMotionCamera } from '@/components/ARMotionCamera';
import { ARPermissionPrompt } from '@/components/ARPermissionPrompt';
import { ARMotionHint } from '@/components/ARMotionHint';
import { CardboardStereo, CardboardOverlay } from '@/components/CardboardMode';
import { AnaglyphMode, AnaglyphOverlay } from '@/components/AnaglyphMode';
import { ARSessionContext } from '@/lib/arSession';
import { ARMotionContext } from '@/lib/arMotionContext';
import { useDeviceMotionAR } from '@/hooks/useDeviceMotionAR';
import { VimoBubble } from '@/components/VimoBubble';
import { CinematicIntro } from '@/components/CinematicIntro';
import { GameFeel } from '@/components/GameFeel';
import { SceneOverlay } from '@/components/ui/SceneOverlay';
import { FailScreen } from '@/components/ui/FailScreen';
import { HeartIcon, CoinIcon, GemIcon } from '@/components/ui/GameIcons';
import { playSfx, speakVimo, playSceneNarration, stopSceneNarration } from '@/lib/audio';
import { useGameStore } from '@/lib/gameStore';
import { VimoAvatar } from '@/components/ui/VimoAvatar';
import {
  PaintedIconButton,
  PaintedButton,
  PaintedStar,
} from '@/components/painted';
import vimoCelebrate from '@/assets/sprites/vimo_celebrate.png';
import vimoIdle from '@/assets/sprites/vimo_idle.png';

import { LazyScene } from '@/components/LazyScene';
import { prefetchSceneRoute } from '@/lib/sceneRegistry';
import { FloatingWorld } from '@/components/FloatingWorld';
import { GrandFinale } from '@/components/GrandFinale';

const SCENE_NAMES = ['Dunia VisuMathia', 'Dunia Kamar Anak', 'Dunia Taman Bermain', 'Dunia Dapur Ceria', 'Dunia Sekolahku', 'Dunia Pasar Mini', 'Dunia Jalan Raya', 'Dunia Rak Mainan', 'Video AR Interaktif', 'Petualang Hebat'];
const SCENE_COLORS = ['#5BC5F2', '#FF6B6B', '#6BCB77', '#FF9F45', '#A66CFF', '#FF6B6B', '#5BC5F2', '#FFD93D', '#45D4A8', '#FF6B9D'];

function SceneLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center pointer-events-none" style={{ width: '100vw' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border-4 border-[#2a1809] shadow-[4px_4px_0_#2a1809] flex flex-col items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border-4 border-t-blue-500 border-blue-200 animate-spin" />
            <span className="font-['Fredoka_One'] text-[#2a1809] text-lg">Memuat Dunia...</span>
          </div>
          <div className="w-48 h-4 bg-gray-200 rounded-full overflow-hidden border-2 border-[#2a1809]">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="font-['Fredoka_One'] text-[#2a1809] text-sm">{Math.round(progress)}%</span>
        </motion.div>
      </div>
    </Html>
  );
}

/** Vimo dialog per scene — sesuai storyboard narasi */
const SCENE_DIALOGS: Record<number, string[]> = {
  1: [
    'Hei, aku Vimo! Robot kecil yang suka berpetualang!',
    'Selamat datang di Dunia VisuMathia!',
    'Hari ini kita akan menjelajahi dunia sekitar kita — kamar, taman, dapur, dan banyak lagi.',
    'Lihat portal yang bersinar itu? Sentuh satu per satu ya!',
    'Siap bertualang? Ayo mulai!',
  ],
  2: [
    'Ayo bantu Vimo membereskan kamar!',
    'Letakkan benda di tempat yang benar ya!',
    'Ada bola futsal, boneka teddy, dan buku warna-warni.',
    'Sentuh benda yang bersinar, lalu taruh di tempatnya!',
    'Kalau benar, zona target akan menyala hijau!',
  ],
  3: [
    'Wah, kita di taman bermain! Banyak alat bermain di sini!',
    'Bisakah kamu menemukan benda yang paling besar?',
    'Ada bola-bola warna-warni di taman ini.',
    'Sentuh semua bola satu per satu, hitung sambil menyentuhnya!',
    'Ada berapa bola di taman ini? Ayo hitung!',
  ],
  4: [
    'Ayo kita masak matematika di dapur!',
    'Hitung buah-buahnya, lalu cocokkan dengan angkanya.',
    'Ada apel merah, pisang kuning, dan jeruk oranye di meja.',
    'Sentuh tiap buah satu per satu — hitung sampai habis!',
    'Ayo, berapa banyak buahnya?',
  ],
  5: [
    'Selamat datang di ruang kelas!',
    'Lihat polanya! Buku merah... pensil... buku merah... pensil...',
    'Lalu apa selanjutnya? Yuk bantu Vimo melengkapi!',
    'Perhatikan urutan warnanya di papan tulis.',
    'Sentuh pilihan warna yang benar untuk melanjutkan pola!',
  ],
  6: [
    'Vimo mau belanja hari ini!',
    'Tolong bantu ambilkan barang yang diminta ya!',
    'Hitung dengan teliti — ambil yang berwarna MERAH saja!',
    'Hati-hati, jangan sentuh yang hijau!',
    'Sentuh semua barang merah yang bersinar!',
  ],
  7: [
    'Vimo mau ke sekolah! Bantu Vimo jalan dengan benar ya.',
    'Di setiap persimpangan, kita harus belok ke mana?',
    'Sentuh tanda panah KIRI atau KANAN yang benar.',
    'Kalau lampu merah, berhenti dulu! Tunggu lampu hijau.',
    'Ayo sampai ke sekolah dengan selamat!',
  ],
  8: [
    'Wah, ada banyak balok dan mainan di rak!',
    'Ayo susun dan sentuh target konstruksi yang bersinar!',
    'Lihat gambar panduan di sebelah, lalu cocokkan!',
    'Sentuh satu per satu untuk menyelesaikan bangunan.',
    'Ada 5 target yang harus kamu sentuh!',
  ],
  9: [
    'Saatnya kuis interaktif!',
    'Lihat bola-bola emas yang muncul di layar.',
    'Hitung berapa jumlahnya dengan teliti.',
    'Lalu sentuh pilihan angka yang benar di bawah.',
    'Jawab 3 soal dengan benar untuk menang!',
  ],
  10: [
    'Ini misi terakhirmu, Petualang!',
    'Kumpulkan 5 kristal dengan menjawab semua tantangan.',
    'Ada 5 zona: Kamar, Taman, Dapur, Jalan, dan Rak Mainan.',
    'Sentuh zona yang bersinar untuk mendapat kristal.',
    'Kamu pasti bisa! Ayo jadi Petualang Hebat VisuMathia!',
  ],
};

export function ScenePage() {
  const [, params] = useRoute('/scene/:id');
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const sceneId = params?.id ? parseInt(params.id, 10) : 1;

  // Stop scene narration when the user leaves the scene
  useEffect(() => {
    return () => { stopSceneNarration(); };
  }, [sceneId]);

  // @ts-ignore - API client types mismatch
  const { data: sceneData } = useGetScene(sceneId, { query: { enabled: !!sceneId } });
  const completeScene = useCompleteScene();

  const [completed, setCompleted] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [showExplosion, setShowExplosion] = useState(false);
  const [timeStart] = useState(Date.now());
  const [cinematicDone, setCinematicDone] = useState(true); // skip cinematic, go straight to dialog
  const [dialogDone, setDialogDone] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHint, setShowHint] = useState(false);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const [arMode, setArMode] = useState(true); // AR passthrough + head tracking
  const [cardboardMode, setCardboardMode] = useState(false);
  const [anaglyphMode, setAnaglyphMode] = useState(false);
  const arMotion = useDeviceMotionAR(arMode);

  const setArModeOn = useCallback(() => {
    setCardboardMode(false);
    setAnaglyphMode(false);
    setArMode(true);
  }, []);

  const setCardboardOn = useCallback(() => {
    setArMode(false);
    setAnaglyphMode(false);
    setCardboardMode(true);
  }, []);

  const setAnaglyphOn = useCallback(() => {
    setArMode(false);
    setCardboardMode(false);
    setAnaglyphMode(true);
  }, []);

  const { startTimer, resetScene } = useGameStore();

  const activeSceneId = sceneId >= 1 && sceneId <= 10 ? sceneId : 1;

  useEffect(() => {
    prefetchSceneRoute(activeSceneId);
  }, [activeSceneId]);
  const sceneName = SCENE_NAMES[(sceneId - 1) % SCENE_NAMES.length];
  const sceneColor = SCENE_COLORS[(sceneId - 1) % SCENE_COLORS.length];
  const dialogs = SCENE_DIALOGS[sceneId] || SCENE_DIALOGS[1];

  const SCENE_INSTRUCTIONS: Record<number, string> = {
    1: 'Sentuh 3 portal untuk memulai petualangan!',
    2: 'Letakkan benda di tempat yang benar! (atas, bawah, dalam)',
    3: 'Sentuh dan hitung semua bola di taman!',
    4: 'Hitung buah satu per satu, cocokkan dengan angkanya!',
    5: 'Tebak pola warna selanjutnya di papan tulis!',
    6: 'Ambil barang MERAH saja ke keranjang!',
    7: 'Pilih arah KIRI atau KANAN yang benar!',
    8: 'Sentuh target konstruksi untuk menyusun bangunan!',
    9: 'Hitung bola emas, lalu pilih angka yang benar!',
    10: 'Kumpulkan 5 kristal dari semua zona tantangan!',
  };
  const instruction = SCENE_INSTRUCTIONS[sceneId] || 'Sentuh area yang bersinar!';

  const handleComplete = (stars: number, score: number) => {
    if (completed) return;
    setCompleted(true);
    setEarnedStars(stars);
    setShowExplosion(true);
    playSfx('complete');
    
    // Voice celebration — kontekstual per scene
    const CELEBRATION_MESSAGES: Record<number, string> = {
      1: 'Hebat! Portal terbuka! Petualangan dimulai!',
      2: 'Kamar sudah rapi! Kamu pintar sekali!',
      3: 'Semua bola terkumpul! Kamu jago menghitung!',
      4: 'Semua buah terhitung! Matematika itu seru!',
      5: 'Polanya benar semua! Kamu sangat teliti!',
      6: 'Belanja selesai! Kamu kasir yang hebat!',
      7: 'Sampai di sekolah! Navigasimu luar biasa!',
      8: 'Bangunan selesai! Kamu arsitek cilik yang hebat!',
      9: 'Kuis selesai! Kamu pintar menghitung!',
      10: 'Semua kristal terkumpul! Kamu Petualang Hebat VisuMathia!',
    };
    setTimeout(() => {
      speakVimo(CELEBRATION_MESSAGES[sceneId] || 'Luar biasa! Kamu hebat sekali!');
    }, 500);

    completeScene.mutate(
      // @ts-ignore - API client types
      { data: { starsEarned: stars, score, playTimeSeconds: Math.floor((Date.now() - timeStart) / 1000) }, pathParams: { sceneId } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListScenesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetProgressQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetRewardsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        },
      }
    );
    setTimeout(() => setShowExplosion(false), 3000);
  };

  return (
    <ARMotionContext.Provider value={arMotion}>
    <div
      className="fixed inset-0 overflow-hidden"
      style={{
        background: arMode
          ? 'transparent'
          : 'linear-gradient(180deg, #87CEEB 0%, #B3E5FC 40%, #E1F5FE 100%)',
      }}
    >
      <ARPermissionPrompt active={arMode} />
      <ARMotionHint active={arMode} />

      {/* 3D Canvas — passthrough AR with gyro / drag head tracking */}
      <WebGLErrorBoundary>
        <Canvas
          style={{ width: '100%', height: '100%' }}
          shadows
          gl={{
            antialias: true,
            alpha: arMode,
            powerPreference: 'high-performance',
            stencil: false,
            depth: true,
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          dpr={[1, 2]}
          frameloop="always"
          performance={{ min: 0.5 }}
          camera={{ position: [0, 1.55, 0.8], fov: 60, near: 0.1, far: 200 }}
        >
          <Bvh firstHitOnly />
          <AdaptiveDpr pixelated />
          <AdaptiveEvents />
          <ARSessionContext.Provider value={arMode}>
            {arMode && <ARMotionCamera active={arMode} />}
            <CardboardStereo active={cardboardMode && !arMode} />
            <AnaglyphMode active={anaglyphMode && !arMode && !cardboardMode} />
            <GameFeel />
            <FloatingWorld>
              <Suspense fallback={<SceneLoader />}>
                <LazyScene sceneId={activeSceneId} onComplete={handleComplete} />
              </Suspense>
            </FloatingWorld>
            {completed && sceneId === 10 && <GrandFinale />}
          </ARSessionContext.Provider>
        </Canvas>
      </WebGLErrorBoundary>

      <RewardExplosion active={showExplosion} starsEarned={earnedStars} />

      {/* === CINEMATIC INTRO (before dialog) === */}
      {!cinematicDone && (
        <CinematicIntro
          sceneName={sceneData?.name ?? sceneName}
          sceneColor={sceneColor}
          instruction={instruction}
          onComplete={() => setCinematicDone(true)}
        />
      )}

      {/* === VIMO DIALOG BUBBLE (after cinematic, before gameplay) === */}
      {cinematicDone && !dialogDone && (
        <VimoBubble
          messages={dialogs}
          vimoSrc={vimoIdle}
          onComplete={() => { setDialogDone(true); playSfx('whoosh'); resetScene(); startTimer(); playSceneNarration(sceneId); }}
          enableVoice={true}
        />
      )}

      {/* === TOP HUD — painted day-dial + round buttons === */}
      <AnimatePresence>
        {dialogDone && (
          <>
            {/* Back button — painted red round */}
            <motion.div
              className="absolute z-30"
              style={{ top: 6, left: 6 }}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            >
              <PaintedIconButton
                variant="red"
                size={32}
                onClick={() => { playSfx('click'); setLocation('/home'); }}
                data-testid="button-back"
                aria-label="Kembali"
              >
                <ChevronLeft className="w-4 h-4" style={{ color: '#fff' }} />
              </PaintedIconButton>
            </motion.div>

            {/* Stars chip — top right */}
            <motion.div
              className="absolute z-20"
              style={{ top: 8, right: 8 }}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
            >
              <div
                style={{
                  padding: '2px 8px',
                  background: '#f7e7b4',
                  border: '2px solid #2a1809',
                  borderRadius: 9999,
                  boxShadow: '2px 2px 0 #2a1809',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontFamily: "'Fredoka One', cursive",
                  color: '#2a1809',
                  fontSize: 11,
                }}
              >
                <PaintedStar size={12} />
                {sceneData?.starsEarned ?? 0}/3
              </div>
            </motion.div>

            {/* Vertical painted toolbar — left edge (hint/replay/sound/skip/pause) */}
            <motion.div
              className="absolute z-30 flex flex-col scene-toolbar"
              style={{ top: 44, left: 4 }}
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.05 }}
            >
              <PaintedIconButton
                variant="green"
                size={32}
                title="Petunjuk"
                onClick={() => {
                  playSfx('pop');
                  speakVimo(instruction);
                  setShowHint(true);
                  setTimeout(() => setShowHint(false), 3000);
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                </svg>
              </PaintedIconButton>

              <PaintedIconButton
                variant="yellow"
                size={32}
                title="Ulangi"
                onClick={() => {
                  playSfx('click');
                  setCompleted(false);
                  setDialogDone(false);
                  setCinematicDone(false);
                  setLocation(`/scene/${sceneId}`);
                  window.location.reload();
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#3d2410">
                  <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
                </svg>
              </PaintedIconButton>

              <PaintedIconButton
                variant={soundEnabled ? 'blue' : 'cream'}
                size={32}
                title="Suara"
                onClick={() => {
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  playSfx('click');
                  if (!next && 'speechSynthesis' in window) speechSynthesis.cancel();
                }}
              >
                {soundEnabled ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#3d2410">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                )}
              </PaintedIconButton>

              <PaintedIconButton
                variant="orange"
                size={32}
                title="Lewati"
                onClick={() => {
                  playSfx('click');
                  if (sceneId < 10) setLocation(`/scene/${sceneId + 1}`);
                  else setLocation('/home');
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </PaintedIconButton>

              <PaintedIconButton
                variant="cream"
                size={32}
                title="Jeda"
                onClick={() => { playSfx('click'); setPaused(true); }}
              >
                <Pause className="w-3 h-3" style={{ color: '#3d2410', fill: '#3d2410' }} />
              </PaintedIconButton>

              {/* AR Mode toggle */}
              <PaintedIconButton
                variant={arMode ? 'blue' : 'cream'}
                size={32}
                title={arMode ? 'AR nyata (gerak HP): ON' : 'AR nyata: OFF'}
                onClick={() => {
                  playSfx('click');
                  if (arMode) setArMode(false);
                  else setArModeOn();
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={arMode ? 'white' : '#3d2410'}>
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                </svg>
              </PaintedIconButton>

              {/* Cardboard VR mode */}
              <PaintedIconButton
                variant={cardboardMode ? 'purple' : 'cream'}
                size={32}
                title="Mode kacamata VR (layar terbagi 2)"
                onClick={() => {
                  playSfx('click');
                  if (cardboardMode) setCardboardMode(false);
                  else setCardboardOn();
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill={cardboardMode ? 'white' : '#3d2410'}>
                  <path d="M20.74 6H3.21C2.55 6 2 6.57 2 7.28v8.44c0 .7.54 1.28 1.23 1.28h4.79c.52 0 .98-.33 1.14-.82l1.17-3.56c.28-.86 1.07-1.44 1.97-1.44h1.4c.9 0 1.69.58 1.97 1.44l1.17 3.56c.16.49.62.82 1.14.82h4.79c.68 0 1.23-.57 1.23-1.28V7.28C22 6.57 21.43 6 20.74 6zM7.5 14.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm9 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
                </svg>
              </PaintedIconButton>

              {/* Anaglyph 3D mode — red-cyan glasses for TV */}
              <PaintedIconButton
                variant={anaglyphMode ? 'red' : 'cream'}
                size={32}
                title="Mode 3D Anaglyph (kacamata merah-biru)"
                onClick={() => {
                  playSfx('click');
                  if (anaglyphMode) setAnaglyphMode(false);
                  else setAnaglyphOn();
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="8" width="8" height="8" rx="1" fill={anaglyphMode ? '#ff6666' : '#ff4444'} opacity={anaglyphMode ? 1 : 0.6} />
                  <rect x="14" y="8" width="8" height="8" rx="1" fill={anaglyphMode ? '#66ffff' : '#00cccc'} opacity={anaglyphMode ? 1 : 0.6} />
                  <rect x="10" y="10" width="4" height="4" rx="0.5" fill={anaglyphMode ? 'white' : '#3d2410'} />
                </svg>
              </PaintedIconButton>
            </motion.div>

            {/* Scene name banner — bottom-center, painted wood */}
            <motion.div
              className="absolute z-20"
              style={{ top: 10, left: '50%', transform: 'translateX(-50%)' }}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.1 }}
            >
              <div
                style={{
                  padding: '3px 12px',
                  background:
                    'linear-gradient(180deg, #c69553 0%, #9c6b3f 60%, #5a3618 100%)',
                  border: '2.5px solid #2a1809',
                  borderRadius: 10,
                  boxShadow: '2px 3px 0 #2a1809, inset 0 1.5px 0 rgba(255,255,255,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: sceneColor,
                    border: '1.5px solid #2a1809',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    color: '#fff7c4',
                    fontSize: 11,
                    letterSpacing: '0.04em',
                    textShadow: '0 1px 0 rgba(0,0,0,0.4)',
                  }}
                >
                  {sceneData?.name ?? sceneName}
                </span>
                {/* progress dashes */}
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
                <span
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    color: '#fff7c4',
                    fontSize: 10,
                    opacity: 0.85,
                  }}
                >
                  {sceneId}/10
                </span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* === SCORE + COMBO OVERLAY === */}
      <SceneOverlay active={dialogDone && !completed && !failed} sceneColor={sceneColor} />

      {/* === FAIL SCREEN — DWTD dramatic fail === */}
      <FailScreen
        active={failed}
        onRetry={() => window.location.reload()}
        onQuit={() => setLocation('/home')}
      />

      {/* === HINT POPUP — painted speech card === */}
      <AnimatePresence>
        {showHint && dialogDone && !completed && (
          <motion.div
            className="absolute bottom-6 left-0 right-0 z-30 flex justify-center px-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
          >
            <div
              style={{
                padding: '12px 16px',
                maxWidth: 380,
                background: '#fffaf0',
                backgroundImage:
                  'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.9), rgba(247,231,180,0.55) 70%)',
                border: '2.5px solid #2a1809',
                borderRadius: 18,
                boxShadow: '3px 4px 0 #2a1809, inset 0 1.5px 0 rgba(255,255,255,0.65)',
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background:
                      'radial-gradient(circle at 30% 28%, #a3d075, #7bb24a 70%)',
                    border: '2px solid #2a1809',
                    boxShadow: '1.5px 2px 0 #2a1809',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                </div>
                <p
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    fontSize: 13,
                    color: '#2a1809',
                    margin: 0,
                  }}
                >
                  {instruction}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === PAUSE OVERLAY — painted parchment === */}
      <AnimatePresence>
        {paused && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center max-w-[300px] w-full mx-4 p-5"
              style={{
                background: '#fffaf0',
                backgroundImage:
                  'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.9), rgba(247,231,180,0.55) 70%)',
                border: '3px solid #2a1809',
                borderRadius: 18,
                boxShadow: '5px 6px 0 #2a1809, inset 0 2px 0 rgba(255,255,255,0.6)',
              }}
              initial={{ scale: 0.85, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85 }}
            >
              <h2
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  color: '#2a1809',
                  fontSize: 26,
                  margin: 0,
                  marginBottom: 4,
                  letterSpacing: '0.02em',
                }}
              >
                JEDA
              </h2>
              <p
                style={{
                  fontFamily: "'Nunito', sans-serif",
                  fontWeight: 800,
                  fontSize: 11,
                  color: '#7a4a17',
                  margin: 0,
                  marginBottom: 16,
                }}
              >
                Petualangan dijeda sebentar
              </p>

              <div className="flex flex-col gap-2">
                <PaintedButton
                  variant="green"
                  size="md"
                  onClick={() => { playSfx('click'); setPaused(false); }}
                >
                  Lanjut Bertualang
                </PaintedButton>
                <PaintedButton
                  variant="yellow"
                  size="md"
                  onClick={() => { playSfx('click'); window.location.reload(); }}
                >
                  Ulangi Dari Awal
                </PaintedButton>
                <PaintedButton
                  variant="cream"
                  size="md"
                  onClick={() => { playSfx('click'); setLocation('/home'); }}
                >
                  Kembali ke Peta
                </PaintedButton>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* === COMPLETION POPUP === */}
      <AnimatePresence>
        {completed && !showExplosion && (
          <motion.div
            className="absolute inset-0 z-40 flex items-center justify-center px-5"
            style={{ background: 'rgba(0,0,0,0.35)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-full max-w-[300px] overflow-hidden"
              style={{
                background: '#FFFFFF',
                border: '3px solid #2D1B0E',
                borderRadius: 18,
                boxShadow: '5px 6px 0 #2D1B0E',
              }}
              initial={{ scale: 0.5, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 18 }}
            >
              {/* Top colored banner */}
              <div
                className="py-2 text-center"
                style={{
                  background: sceneColor,
                  borderBottom: '3px solid #2D1B0E',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    letterSpacing: '0.08em',
                    textShadow: '1px 1px 0 rgba(45,27,14,0.4)',
                  }}
                >
                  MISI SELESAI!
                </span>
              </div>

              <div className="p-4 text-center">
                {/* Vimo celebrate */}
                <motion.div
                  className="w-14 h-14 rounded-full mx-auto mb-2 flex items-center justify-center"
                  style={{
                    background: '#FFFFFF',
                    border: '3px solid #2D1B0E',
                    boxShadow: '3px 3px 0 #2D1B0E',
                  }}
                  animate={{ y: [0, -3, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <VimoAvatar size={44} variant="celebrate" />
                </motion.div>

                <motion.h2
                  className="text-2xl mb-1"
                  style={{
                    fontFamily: "'Fredoka One', cursive",
                    color: '#2D1B0E',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                >
                  Luar Biasa!
                </motion.h2>
                <p
                  className="text-xs mb-4"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    color: '#8B5E3C',
                  }}
                >
                  {sceneName} berhasil diselesaikan!
                </p>

                {/* Stars row */}
                <div className="flex justify-center gap-2 mb-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3 + i * 0.15, type: 'spring', stiffness: 260 }}
                    >
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <polygon
                          points="20,4 25,15 37,16 28,24 30,36 20,30 10,36 12,24 3,16 15,15"
                          fill={i < earnedStars ? '#FFD93D' : 'rgba(45,27,14,0.12)'}
                          stroke="#2D1B0E"
                          strokeWidth="2.5"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  ))}
                </div>

                <p
                  className="text-xs mb-5"
                  style={{
                    fontFamily: "'Nunito', sans-serif",
                    fontWeight: 800,
                    color: '#2D1B0E',
                  }}
                >
                  Kamu mendapat {earnedStars} bintang!
                </p>

                {/* Buttons */}
                <div className="flex gap-3">
                  <PaintedButton
                    variant="cream"
                    size="md"
                    onClick={() => { playSfx('click'); setLocation('/home'); }}
                    data-testid="button-home"
                    style={{ flex: 1 }}
                  >
                    Peta Dunia
                  </PaintedButton>
                  {sceneId < 10 && (
                    <PaintedButton
                      variant="green"
                      size="md"
                      onClick={() => { playSfx('click'); setCompleted(false); setDialogDone(false); setLocation(`/scene/${sceneId + 1}`); }}
                      data-testid="button-next-scene"
                      style={{ flex: 1 }}
                    >
                      Lanjut
                    </PaintedButton>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* === CARDBOARD VR MODE — stereo overlay === */}
      <CardboardOverlay active={cardboardMode && !arMode} onExit={() => setCardboardMode(false)} />
      {/* === ANAGLYPH 3D MODE — red-cyan glasses overlay === */}
      <AnaglyphOverlay active={anaglyphMode && !arMode && !cardboardMode} onExit={() => setAnaglyphMode(false)} />
    </div>
    </ARMotionContext.Provider>
  );
}
