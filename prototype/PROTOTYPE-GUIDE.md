# Panduan Prototipe untuk 30 Nov (clickable flow, tanpa backend)
Tujuan: bukti alur untuk proposal + bahan video. Boleh Figma (Prototype mode) atau halaman statis dengan JSON tetap.
## 4 layar wajib (urut klik)
1. **Pesan WhatsApp (simulasi):** pesan pengingat + tautan pribadi. Label "Prototype mockup (simulated data)".
2. **Check-in 1 ketukan (/c/token):** nama unit + 3 tombol -> layar terima kasih + Batalkan.
3. **Dasbor korcam:** ringkasan status, tabel peringkat 30 unit sintetis, lencana SIMULATED DATA.
4. **Catat kunjungan:** klik unit Unconfirmed -> formulir -> status berubah di dasbor dan muncul umpan balik di layar pengurus.
## Data sintetis (seed/units.csv — dibuat tim)
30 baris: nama fiktif (mis. "Unit Contoh 01"), kelurahan Gunungpati (isi hanya jika terverifikasi; kalau tidak, pakai "Kelurahan A–E" berlabel simulasi), status campuran, bulan diam 0–4. Kolom is_synthetic = true. Jangan memakai nama bank sampah asli.
## Storyboard video 2 menit (Inggris, 1080p)
0:00–0:15 Tim & peran | 0:15–0:40 Masalah (138/647, 4 pendamping/16 kecamatan, sumber [1]) | 0:40–1:20 Demo 4 layar | 1:20–1:45 Yang sudah selesai: prototipe, ERD, definisi status; yang belum: backend, WA link generator, ranking langsung | 1:45–2:00 Rencana & penutup.
## Tangkapan layar untuk proposal 3.4
Simpan di prototype/screenshots/ dengan keterangan "Prototype UI Mockup (Simulated Gunungpati Dataset)".
## Daftar periksa kejujuran
[ ] Setiap layar berlabel simulasi  [ ] Tidak ada klaim "berfungsi" untuk yang masih mockup  [ ] Video & proposal menyebut hal yang sama.

## Status implementasi (25 Nov)
Halaman tersedia: layar 1 `/cycles`, layar 2 `/c/[token]`, layar 3 `/dashboard`, layar 4 `/units/[id]`. Tangkapan layar berlabel ada di `prototype/screenshots/` — gunakan keterangan: "Prototype UI Mockup (Simulated Gunungpati Dataset)".
Video harus menyebut: ini prototipe tersimulasi; backend, login, WA sungguhan = planned.
