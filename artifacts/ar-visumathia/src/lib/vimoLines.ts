/**
 * Pre-recorded Vimo voice lines.
 *
 * Each phrase is mapped to a slug → /public/voice/vimo/{slug}.mp3
 *
 * To regenerate the audio:
 *   1. Open https://www.freetts.com/ or https://play.ht/
 *   2. Pick a child voice (e.g. "Indonesian — Female — Child" / "Anak")
 *   3. Paste each phrase, generate, and save the MP3 with the slug name below
 *   4. Drop the files into  artifacts/ar-visumathia/public/voice/vimo/
 *
 * The runtime tries the MP3 first; if missing it falls back to Web Speech.
 */

export const VIMO_LINES: Record<string, string> = {
  // ── Counting numbers ──
  'satu': '1',
  'dua': '2',
  'tiga': '3',
  'empat': '4',
  'lima': '5',
  'enam': '6',

  // ── Scene 1: portals ──
  'portal-1': 'Satu! Portal pertama terbuka!',
  'portal-2': 'Dua! Satu lagi!',
  'portal-3': 'Tiga! Semua portal terbuka! Ayo bertualang!',

  // ── Scene 2: bedroom ──
  'bola-tempat': 'Bola sudah di tempatnya!',
  'boneka-ketemu': 'Boneka ketemu!',
  'buku-rapi': 'Buku sudah rapi!',
  'aduh': 'Aduh!',

  // ── Scene 3 & 4: counting (uses 1-6 above) ──
  'buah-terkumpul': 'Semua buah terkumpul!',

  // ── Scene 5: classroom ──
  'pola-salah': 'Hmm, bukan itu polanya! Coba lagi!',
  'pola-benar': 'Benar! Polanya tepat!',

  // ── Scene 6: market ──
  'merah-saja': 'Bukan yang itu! Yang merah ya!',

  // ── Scene 7: road ──
  'arah-salah': 'Aduh! Bukan arah itu. Coba lagi!',
  'belok-kiri': 'Belok kiri! Benar!',
  'belok-kanan': 'Belok kanan! Tepat!',

  // ── Scene 9: TV quiz ──
  'kuis-salah': 'Hmm, hitung lagi ya! Coba sekali lagi!',

  // ── Scene 10: final ──
  'kristal-1': 'Kristal 1 terkumpul!',
  'kristal-2': 'Kristal 2 terkumpul!',
  'kristal-3': 'Kristal 3 terkumpul!',
  'kristal-4': 'Kristal 4 terkumpul!',
  'kristal-5': 'Kristal 5 terkumpul!',
  'petualang-hebat': 'Semua kristal terkumpul! Kamu Petualang Hebat VisuMathia!',

  // ── Celebrations (per scene) ──
  'cel-1': 'Hebat! Portal terbuka! Petualangan dimulai!',
  'cel-2': 'Kamar sudah rapi! Kamu pintar sekali!',
  'cel-3': 'Semua bola terkumpul! Kamu jago menghitung!',
  'cel-4': 'Semua buah terhitung! Matematika itu seru!',
  'cel-5': 'Polanya benar semua! Kamu sangat teliti!',
  'cel-6': 'Belanja selesai! Kamu kasir yang hebat!',
  'cel-7': 'Sampai di sekolah! Navigasimu luar biasa!',
  'cel-8': 'Bangunan selesai! Kamu arsitek cilik yang hebat!',
  'cel-9': 'Kuis selesai! Kamu pintar menghitung!',
  'cel-10': 'Semua kristal terkumpul! Kamu Petualang Hebat VisuMathia!',
  'cel-default': 'Luar biasa! Kamu hebat sekali!',

  // ── UI ──
  'ayo-mulai': 'Ayo mulai!',
  'siap-mulai': 'Siap mulai!',
};

/**
 * Reverse lookup: phrase text → slug (for runtime resolution).
 * Whitespace and punctuation are normalized so minor differences match.
 */
function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9 ]+/g, '').replace(/\s+/g, ' ').trim();
}

const REVERSE: Record<string, string> = {};
for (const [slug, text] of Object.entries(VIMO_LINES)) {
  REVERSE[normalize(text)] = slug;
}

/** Resolve a phrase to a recorded slug, or null if not found. */
export function resolvePhraseSlug(text: string): string | null {
  return REVERSE[normalize(text)] ?? null;
}

/** All slugs that need MP3 files generated. */
export function getAllSlugs(): string[] {
  return Object.keys(VIMO_LINES);
}
