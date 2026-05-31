"""
Generate Vimo voice MP3 files using Microsoft Edge's online neural TTS.

Voice: id-ID-GadisNeural  (Indonesian female, "Gadis" = "girl")
Rate +18% and pitch +25Hz to make the voice sound younger / more like a
6-8 year old girl, without becoming chipmunk-like.

Usage:
  py scripts/generate_voice.py
"""

import asyncio
import os
import sys

import edge_tts

VOICE = "id-ID-GadisNeural"
RATE = "+15%"      # slightly faster talk
PITCH = "+30Hz"    # higher pitch -> younger feel (still natural)
VOLUME = "+0%"

# slug -> phrase (must match src/lib/vimoLines.ts)
LINES = {
    # Counting numbers
    "satu": "Satu",
    "dua": "Dua",
    "tiga": "Tiga",
    "empat": "Empat",
    "lima": "Lima",
    "enam": "Enam",

    # Scene 1: portals
    "portal-1": "Satu! Portal pertama terbuka!",
    "portal-2": "Dua! Satu lagi!",
    "portal-3": "Tiga! Semua portal terbuka! Ayo bertualang!",

    # Scene 2: bedroom
    "bola-tempat": "Bola sudah di tempatnya!",
    "boneka-ketemu": "Boneka ketemu!",
    "buku-rapi": "Buku sudah rapi!",
    "aduh": "Aduh!",

    # Scene 3 & 4: counting
    "buah-terkumpul": "Semua buah terkumpul!",

    # Scene 5: classroom
    "pola-salah": "Hmm, bukan itu polanya! Coba lagi!",
    "pola-benar": "Benar! Polanya tepat!",

    # Scene 6: market
    "merah-saja": "Bukan yang itu! Yang merah ya!",

    # Scene 7: road
    "arah-salah": "Aduh! Bukan arah itu. Coba lagi!",
    "belok-kiri": "Belok kiri! Benar!",
    "belok-kanan": "Belok kanan! Tepat!",

    # Scene 9: TV quiz
    "kuis-salah": "Hmm, hitung lagi ya! Coba sekali lagi!",

    # Scene 10: final
    "kristal-1": "Kristal 1 terkumpul!",
    "kristal-2": "Kristal 2 terkumpul!",
    "kristal-3": "Kristal 3 terkumpul!",
    "kristal-4": "Kristal 4 terkumpul!",
    "kristal-5": "Kristal 5 terkumpul!",
    "petualang-hebat": "Semua kristal terkumpul! Kamu Petualang Hebat VisuMathia!",

    # Celebrations
    "cel-1": "Hebat! Portal terbuka! Petualangan dimulai!",
    "cel-2": "Kamar sudah rapi! Kamu pintar sekali!",
    "cel-3": "Semua bola terkumpul! Kamu jago menghitung!",
    "cel-4": "Semua buah terhitung! Matematika itu seru!",
    "cel-5": "Polanya benar semua! Kamu sangat teliti!",
    "cel-6": "Belanja selesai! Kamu kasir yang hebat!",
    "cel-7": "Sampai di sekolah! Navigasimu luar biasa!",
    "cel-8": "Bangunan selesai! Kamu arsitek cilik yang hebat!",
    "cel-9": "Kuis selesai! Kamu pintar menghitung!",
    "cel-10": "Semua kristal terkumpul! Kamu Petualang Hebat VisuMathia!",
    "cel-default": "Luar biasa! Kamu hebat sekali!",

    # UI
    "ayo-mulai": "Ayo mulai!",
    "siap-mulai": "Siap mulai!",
}

OUT_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "public", "voice", "vimo",
)


async def render_one(slug: str, text: str, force: bool) -> bool:
    out = os.path.join(OUT_DIR, f"{slug}.mp3")
    if not force and os.path.exists(out) and os.path.getsize(out) > 0:
        print(f"  skip   {slug:20s}  (exists)")
        return True
    try:
        comm = edge_tts.Communicate(text, VOICE, rate=RATE, pitch=PITCH, volume=VOLUME)
        await comm.save(out)
        size = os.path.getsize(out)
        print(f"  ok     {slug:20s}  {size:>6} bytes  '{text}'")
        return True
    except Exception as exc:
        print(f"  FAIL   {slug:20s}  {exc}")
        return False


async def main() -> int:
    force = "--force" in sys.argv
    os.makedirs(OUT_DIR, exist_ok=True)
    print(f"Output dir: {OUT_DIR}")
    print(f"Voice: {VOICE}  rate={RATE}  pitch={PITCH}")
    print(f"Generating {len(LINES)} clips...\n")

    failed = 0
    # Sequential — Edge TTS rate-limits aggressive parallel calls
    for slug, text in LINES.items():
        ok = await render_one(slug, text, force)
        if not ok:
            failed += 1

    print(f"\nDone. {len(LINES) - failed}/{len(LINES)} succeeded.")
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
