# AR-VisuMathia — Scene V0 Spec

Singkat per scene. 1-4 kalimat masing-masing. Tujuan: pegangan
implementasi minimum tanpa overengineering.

## Scene 1 — Intro Portal
Vimo turun dari portal cahaya di ruang main. Pemain tap 3 portal yang
bersinar untuk dibuka. Tiap portal dibuka, Vimo bilang angka (1, 2, 3)
dan portal pecah jadi sparkle. Setelah 3 portal, layar fade ke menu
pilih dunia.

## Scene 2 — Kamar Anak
Tujuan: rapikan 3 benda (bola, boneka, buku) ke posisi target. Vimo
menunjuk benda terangnya dan ucap kalimat target ("LETAKKAN BOLA DI
BAWAH MEJA!"). Pemain tap benda → benda terbang ke tangan Vimo →
diletakkan di zona target yang menyala hijau saat benar.

## Scene 3 — Taman Bermain
4 bola warna-warni di rumput; pemain tap bola random satu per satu
sambil Vimo hitung (1, 2, 3, 4). Tidak ada urutan wajib — kanak-kanak
bebas pilih. Setelah semua, Vimo nari celebrate dan scene selesai.

## Scene 4 — Dapur Ceria
6 buah di meja (apel/pisang/jeruk). Pemain tap satu per satu sambil
Vimo hitung. Buah yang ditap terbang ke tangan Vimo dan dimakan
(animasi shrink). Selesai = "Semua buah terkumpul!".

## Scene 5 — Sekolahku
Papan tulis menampilkan pola warna 4 blok dengan 1 kosong di akhir.
3 pilihan warna muncul di bawah; pemain tap warna yang melengkapi pola.
Salah → Vimo "Hmm, bukan itu polanya!" + papan getar. Benar → bintang
muncul, scene selesai.

## Scene 6 — Pasar Mini
Rak berisi item merah dan hijau campur. Pemain ambil semua item
**merah** saja ke keranjang (tap → terbang ke keranjang Vimo). Tap
hijau = penalty (Vimo "Bukan yang itu!"). Selesai saat semua merah
masuk keranjang.

## Scene 7 — Jalan Raya
Vimo di persimpangan, ada panah KIRI dan KANAN. Caption suruh pilih
arah ke sekolah ("Belok kiri ya!"). 3 ronde dengan arah random. Salah
= ditabrak (shake) dan ulang. Benar 3x = sampai sekolah.

## Scene 8 — Rak Mainan
Gambar panduan susunan blok di sebelah; rak punya 5 slot target yang
bersinar. Pemain tap target satu per satu sambil Vimo hitung. Setelah
kelima target ditap, struktur "selesai" muncul efek bintang.

## Scene 9 — Video AR (TV Kuis)
TV menampilkan N bola emas (random 2-5). 3 pilihan angka muncul; pemain
tap angka yang benar. Salah = TV getar, ulang. 3 soal benar berturut =
selesai.

## Scene 10 — Misi Akhir
5 zona kecil (kamar/taman/dapur/jalan/rak) muncul di sekitar peta. Tiap
zona ditap = 1 kristal masuk inventory. Setelah 5 kristal, Vimo nari
final dan layar pesta + caption "Petualang Hebat VisuMathia!".

---

## Komponen reusable per scene
- Vimo karakter (idle/walk/point/grab/celebrate)
- TapIndicator pada object target
- PickupAnimation (object terbang ke tangan)
- CinematicCamera (locked, sedikit shake on wrong)
- VimoBubble dialog di awal scene (3-5 kalimat)
- FailScreen on max wrong
- Completion popup dengan bintang 1-3

## Aturan umum
- Maksimum 3 salah → fail screen
- Tiap benar: SFX success + voice line + animasi grab
- Tiap salah: SFX wrong + camera shake + Vimo think + Vimo voice koreksi
- Selesai: voice celebrate + bintang explosion + transisi ke peta
