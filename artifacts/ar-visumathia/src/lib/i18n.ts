/**
 * Internationalization system for AR-VisuMathia.
 * Supports English (UK/US) and Indonesian.
 * Uses zustand for reactive language switching.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'en' | 'id';

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'ar-visumathia-locale' }
  )
);

// Translation dictionary
const translations: Record<Locale, Record<string, string>> = {
  en: {
    // General
    'app.name': 'AR-VisuMathia',
    'app.tagline': 'Learn Math Through Augmented Reality',

    // Connect page
    'connect.connecting': 'Connecting device...',
    'connect.connected': 'Connected!',
    'connect.skip': 'Skip',

    // Home page
    'home.title': 'CHOOSE WORLD',
    'home.subtitle': 'Pick a scene to start your adventure!',
    'home.back': 'Back',
    'home.start': 'Start',

    // Scene names
    'scene.1.name': 'VisuMathia World',
    'scene.1.desc': 'A magical garden full of numbers and shapes.',
    'scene.1.tag': 'Garden & Education',
    'scene.2.name': 'Kids Room',
    'scene.2.desc': 'Tidy up the room and find hidden objects.',
    'scene.2.tag': 'Position & Space',
    'scene.3.name': 'Playground',
    'scene.3.desc': 'Collect balls and count together.',
    'scene.3.tag': 'Counting',
    'scene.4.name': 'Happy Kitchen',
    'scene.4.desc': 'Count the fruits on the table.',
    'scene.4.tag': 'Numbers & Counting',
    'scene.5.name': 'My School',
    'scene.5.desc': 'Recognize color patterns on the board.',
    'scene.5.tag': 'Patterns & Logic',
    'scene.6.name': 'Mini Market',
    'scene.6.desc': 'Shop and sort items by color.',
    'scene.6.tag': 'Classification',
    'scene.7.name': 'City Road',
    'scene.7.desc': 'Help Vimo find the way to school.',
    'scene.7.tag': 'Direction & Navigation',
    'scene.8.name': 'Toy Shelf',
    'scene.8.desc': 'Stack blocks in the right order.',
    'scene.8.tag': 'Sequence & Order',
    'scene.9.name': 'AR Video',
    'scene.9.desc': 'Quiz: count the golden balls on screen.',
    'scene.9.tag': 'Number Quiz',
    'scene.10.name': 'Final Mission',
    'scene.10.desc': 'Collect crystals and become a great explorer!',
    'scene.10.tag': 'Final Challenge',

    // Gameplay
    'game.hint': 'Hint',
    'game.replay': 'Replay',
    'game.sound': 'Sound',
    'game.skip': 'Skip',
    'game.pause': 'PAUSE',
    'game.paused': 'Game paused',
    'game.resume': 'Resume',
    'game.restart': 'Restart Scene',
    'game.quit': 'Quit',
    'game.score': 'Score',
    'game.time': 'Time',

    // Completion
    'complete.title': 'MISSION CLEAR!',
    'complete.amazing': 'Amazing!',
    'complete.subtitle': 'World completed successfully',
    'complete.stars': 'You earned {n} stars!',
    'complete.home': 'World Map',
    'complete.next': 'Next',

    // Fail
    'fail.title': 'OOPS!',
    'fail.subtitle': "Let's try again!",
    'fail.retry': 'Retry',
    'fail.quit': 'Quit',

    // Tutorial / Cinematic
    'tutorial.scene': 'SCENE',
    'tutorial.skip': 'Skip Tutorial',
    'tutorial.watch': 'Watch Vimo on screen...',
    'tutorial.ready': 'READY GO!',

    // Vimo voice lines
    'vimo.hello': 'Hello! I am Vimo, your adventure buddy!',
    'vimo.welcome': 'Welcome to VisuMathia World!',
    'vimo.correct': 'Got it!',
    'vimo.great': 'Great job!',
    'vimo.onemore': 'One more!',
    'vimo.tryagain': 'Hmm, try again!',
    'vimo.nothat': 'Not that one!',
    'vimo.which': 'Hmm, which one?',
    'vimo.amazing': 'Amazing! You are so great!',
    'vimo.allcollected': 'All collected!',
    'vimo.left': 'Left!',
    'vimo.right': 'Right!',
    'vimo.crystal': 'Crystal {n}!',

    // Scene instructions
    'instruction.1': 'Touch the 3 glowing portals!',
    'instruction.2': 'Put objects in the right place!',
    'instruction.3': 'Collect all the balls!',
    'instruction.4': 'Count the fruits on the table!',
    'instruction.5': 'Pick the next color in the pattern!',
    'instruction.6': 'Touch the RED ones!',
    'instruction.7': 'Pick the right direction!',
    'instruction.8': 'Touch the construction targets!',
    'instruction.9': 'Count the golden balls!',
    'instruction.10': 'Collect 5 crystals!',

    // In-game labels
    'label.touchball': 'TOUCH THE BALL!',
    'label.touchteddy': 'TOUCH THE TEDDY!',
    'label.touchbook': 'TOUCH THE BOOK!',
    'label.touchorange': 'TOUCH ORANGE BALL!',
    'label.touchwhite': 'TOUCH WHITE BALL!',
    'label.touchgreen': 'TOUCH GREEN BALL!',
    'label.touchyellow': 'TOUCH YELLOW BALL!',
    'label.touchapple': 'TOUCH THE APPLE!',
    'label.touchorangefruit': 'TOUCH THE ORANGE!',
    'label.touchbanana': 'TOUCH THE BANANA!',
    'label.pickcolor': 'PICK THE NEXT COLOR!',
    'label.touchred': 'TOUCH THE RED ONES!',
    'label.goldballs': 'COUNT THE GOLD BALLS!',
    'label.left': 'LEFT!',
    'label.right': 'RIGHT!',

    // Curriculum tags (EYFS / Common Core)
    'curriculum.eyfs.counting': 'EYFS: Numbers - Counting',
    'curriculum.eyfs.shape': 'EYFS: Shape, Space & Measure',
    'curriculum.eyfs.pattern': 'EYFS: Pattern Recognition',
    'curriculum.cc.k.cc': 'CC: K.CC - Counting & Cardinality',
    'curriculum.cc.k.g': 'CC: K.G - Geometry',
    'curriculum.cc.k.md': 'CC: K.MD - Measurement & Data',

    // Settings
    'settings.language': 'Language',
    'settings.english': 'English',
    'settings.indonesian': 'Bahasa Indonesia',
    'settings.difficulty': 'Difficulty',
    'settings.easy': 'Easy',
    'settings.medium': 'Medium',
    'settings.hard': 'Hard',

    // Landscape lock
    'landscape.rotate': 'Rotate to Landscape',
    'landscape.hint': 'This game is best played in landscape mode',
  },

  id: {
    'app.name': 'AR-VisuMathia',
    'app.tagline': 'Belajar Matematika Lewat Augmented Reality',
    'connect.connecting': 'Menghubungkan perangkat...',
    'connect.connected': 'Terhubung!',
    'connect.skip': 'Lewati',
    'home.title': 'PILIH DUNIA',
    'home.subtitle': 'Pilih scene untuk memulai petualanganmu!',
    'home.back': 'Kembali',
    'home.start': 'Mulai',
    'scene.1.name': 'Dunia VisuMathia',
    'scene.1.desc': 'Taman ajaib penuh angka dan bentuk.',
    'scene.1.tag': 'Taman & Edukasi',
    'scene.2.name': 'Kamar Anak',
    'scene.2.desc': 'Bereskan kamar dan temukan benda tersembunyi.',
    'scene.2.tag': 'Posisi & Ruang',
    'scene.3.name': 'Taman Bermain',
    'scene.3.desc': 'Kumpulkan bola dan hitung bersama.',
    'scene.3.tag': 'Berhitung',
    'scene.4.name': 'Dapur Ceria',
    'scene.4.desc': 'Hitung buah-buahan di atas meja.',
    'scene.4.tag': 'Angka & Hitung',
    'scene.5.name': 'Sekolahku',
    'scene.5.desc': 'Kenali pola warna di papan tulis.',
    'scene.5.tag': 'Pola & Logika',
    'scene.6.name': 'Pasar Mini',
    'scene.6.desc': 'Belanja dan kelompokkan barang.',
    'scene.6.tag': 'Klasifikasi',
    'scene.7.name': 'Jalan Raya',
    'scene.7.desc': 'Bantu Vimo menemukan jalan ke sekolah.',
    'scene.7.tag': 'Arah & Navigasi',
    'scene.8.name': 'Rak Mainan',
    'scene.8.desc': 'Susun balok sesuai urutan yang benar.',
    'scene.8.tag': 'Urutan & Susunan',
    'scene.9.name': 'Video AR',
    'scene.9.desc': 'Kuis hitung bola emas di layar.',
    'scene.9.tag': 'Kuis Angka',
    'scene.10.name': 'Misi Akhir',
    'scene.10.desc': 'Kumpulkan kristal dan jadi petualang hebat!',
    'scene.10.tag': 'Tantangan Akhir',
    'game.hint': 'Petunjuk',
    'game.replay': 'Ulang',
    'game.sound': 'Suara',
    'game.skip': 'Lewati',
    'game.pause': 'JEDA',
    'game.paused': 'Game dijeda',
    'game.resume': 'Lanjut Main',
    'game.restart': 'Ulangi Scene',
    'game.quit': 'Keluar',
    'game.score': 'Skor',
    'game.time': 'Waktu',
    'complete.title': 'MISI SELESAI!',
    'complete.amazing': 'Luar Biasa!',
    'complete.subtitle': 'Dunia berhasil diselesaikan',
    'complete.stars': 'Kamu mendapat {n} bintang!',
    'complete.home': 'Peta Dunia',
    'complete.next': 'Lanjut',
    'fail.title': 'OOPS!',
    'fail.subtitle': 'Yah, coba lagi yuk!',
    'fail.retry': 'Ulangi',
    'fail.quit': 'Keluar',
    'tutorial.scene': 'SCENE',
    'tutorial.skip': 'Lewati Tutorial',
    'tutorial.watch': 'Perhatikan Vimo di layar...',
    'tutorial.ready': 'SIAP MULAI!',
    'vimo.hello': 'Halo! Aku Vimo, teman petualanganmu!',
    'vimo.welcome': 'Selamat datang di Dunia VisuMathia!',
    'vimo.correct': 'Dapat!',
    'vimo.great': 'Hebat!',
    'vimo.onemore': 'Satu lagi!',
    'vimo.tryagain': 'Hmm, coba lagi!',
    'vimo.nothat': 'Bukan yang itu!',
    'vimo.which': 'Hmm, yang mana ya?',
    'vimo.amazing': 'Luar biasa! Kamu hebat sekali!',
    'vimo.allcollected': 'Semua terkumpul!',
    'vimo.left': 'Kiri!',
    'vimo.right': 'Kanan!',
    'vimo.crystal': 'Kristal {n}!',
    'instruction.1': 'Sentuh 3 portal yang bersinar!',
    'instruction.2': 'Taruh benda di tempat yang benar!',
    'instruction.3': 'Kumpulkan semua bola!',
    'instruction.4': 'Hitung buah di atas meja!',
    'instruction.5': 'Pilih warna berikutnya!',
    'instruction.6': 'Sentuh yang MERAH!',
    'instruction.7': 'Pilih arah yang benar!',
    'instruction.8': 'Sentuh target konstruksi!',
    'instruction.9': 'Hitung bola emas!',
    'instruction.10': 'Kumpulkan 5 kristal!',
    'label.touchball': 'SENTUH BOLA!',
    'label.touchteddy': 'SENTUH BONEKA!',
    'label.touchbook': 'SENTUH BUKU!',
    'label.touchorange': 'SENTUH BOLA ORANYE!',
    'label.touchwhite': 'SENTUH BOLA PUTIH!',
    'label.touchgreen': 'SENTUH BOLA HIJAU!',
    'label.touchyellow': 'SENTUH BOLA KUNING!',
    'label.touchapple': 'SENTUH APEL!',
    'label.touchorangefruit': 'SENTUH JERUK!',
    'label.touchbanana': 'SENTUH PISANG!',
    'label.pickcolor': 'PILIH WARNA BERIKUTNYA!',
    'label.touchred': 'SENTUH YANG MERAH!',
    'label.goldballs': 'HITUNG BOLA EMAS!',
    'label.left': 'KIRI!',
    'label.right': 'KANAN!',
    'curriculum.eyfs.counting': 'EYFS: Angka - Berhitung',
    'curriculum.eyfs.shape': 'EYFS: Bentuk, Ruang & Ukuran',
    'curriculum.eyfs.pattern': 'EYFS: Pengenalan Pola',
    'curriculum.cc.k.cc': 'CC: K.CC - Berhitung & Kardinalitas',
    'curriculum.cc.k.g': 'CC: K.G - Geometri',
    'curriculum.cc.k.md': 'CC: K.MD - Pengukuran & Data',
    'settings.language': 'Bahasa',
    'settings.english': 'English',
    'settings.indonesian': 'Bahasa Indonesia',
    'settings.difficulty': 'Kesulitan',
    'settings.easy': 'Mudah',
    'settings.medium': 'Sedang',
    'settings.hard': 'Sulit',
    'landscape.rotate': 'Putar HP ke Landscape',
    'landscape.hint': 'Game ini paling bagus dimainkan dalam mode landscape',
  },
};

/**
 * Get translated string. Supports {n} placeholder.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const locale = useI18n.getState().locale;
  let text = translations[locale]?.[key] || translations['en']?.[key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(`{${k}}`, String(v));
    });
  }
  return text;
}

/**
 * Hook version for reactive components.
 */
export function useT() {
  const locale = useI18n(s => s.locale);
  return (key: string, params?: Record<string, string | number>): string => {
    let text = translations[locale]?.[key] || translations['en']?.[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };
}

/**
 * Curriculum alignment data per scene.
 * Maps each scene to UK EYFS and US Common Core standards.
 */
export const CURRICULUM_MAP: Record<number, { eyfs: string[]; commonCore: string[] }> = {
  1: { eyfs: ['Numbers - Counting to 3'], commonCore: ['K.CC.4 - Count objects'] },
  2: { eyfs: ['Shape, Space & Measure - Position'], commonCore: ['K.G.1 - Describe positions'] },
  3: { eyfs: ['Numbers - Counting to 4'], commonCore: ['K.CC.5 - Count to tell number of objects'] },
  4: { eyfs: ['Numbers - Counting to 5'], commonCore: ['K.CC.5 - Count to tell number of objects'] },
  5: { eyfs: ['Pattern Recognition - Repeating patterns'], commonCore: ['K.OA.1 - Represent addition'] },
  6: { eyfs: ['Shape, Space & Measure - Sorting'], commonCore: ['K.MD.3 - Classify objects into categories'] },
  7: { eyfs: ['Shape, Space & Measure - Direction'], commonCore: ['K.G.1 - Describe relative positions'] },
  8: { eyfs: ['Numbers - Ordering'], commonCore: ['K.CC.2 - Count forward from a given number'] },
  9: { eyfs: ['Numbers - Subitizing'], commonCore: ['K.CC.4 - Understand counting'] },
  10: { eyfs: ['Numbers - Counting to 5', 'Problem Solving'], commonCore: ['K.CC.5 - Count objects', 'K.OA.2 - Solve addition problems'] },
};
