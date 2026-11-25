# 07 — Rundown Pengerjaan per Role
Role (USULAN, tim yang memutuskan): **A** Janerson = Lead/Arsitektur & penulis proposal. **B** Farritz = Frontend & UI/UX. **C** Farras = Backend & Database. **D** Hieronimus = Validasi, data sintetis, video.
Proposal saat ini mengklaim "clickable flow sudah dibangun" dan "dataset sintetis 30 unit" per 30 Nov. Keduanya HARUS benar-benar ada saat unggah.

## Fase 1 — Semifinal (25–30 Nov): fokus prototipe + dokumen, bukan backend penuh
| Tanggal | A | B | C | D |
|---------|---|---|---|---|
| Rab 25 | Putuskan stack, role, ambang status; buat repo | Pilih alat (Figma / halaman statis), baca docs 01 & 05 | Baca 02 & 03; finalkan ERD | Mulai dataset sintetis 30 unit (seed/units.csv) |
| Kam 26 | Tulis bagian 1–3 proposal (Inggris) | Wireframe lo-fi 4 layar | Finalkan prisma/schema.prisma + gambar ERD untuk proposal | Cek portal SIMBA publik & profil Gunungpati; wawancara singkat bila memungkinkan |
| Jum 27 | Tulis bagian 4–6; sinkronkan dengan ERD | Hi-fi + clickable flow (4 layar) | Gambar arsitektur; (opsional) inisialisasi proyek + migrasi | Storyboard + naskah video 2 menit |
| Sab 28 | Gabungkan proposal, cek ≤10 halaman | Final prototipe, ekspor tangkapan layar berlabel | Tinjau bagian teknis agar sesuai ERD & keamanan | Rekam layar + narasi (1080p) |
| Min 29 | Pengungkapan AI, referensi, Declaration of Originality (tanda tangan semua) | Perbaikan visual dari umpan balik | Cek konsistensi proposal-vs-prototipe | Sunting video, takarir Inggris |
| Sen 30 | Ekspor PDF, unggah SIANG hari, simpan bukti & cadangan | Siaga perbaikan | Siaga | Unggah video, cek izin akses tautan |
Gerbang kualitas: semua klaim "sudah" punya bukti (tangkapan layar/berkas).

## Fase 2 — Menunggu pengumuman Top 10 (1–6 Des)
Siapkan repo kosong berstruktur (folder di README), `.env.example`, docker-compose, migrasi awal. Jangan menganggap lolos.

## Fase 3 — Perbaikan produk (7–16 Des, jika lolos)
| Hari | Tugas | Pemilik |
|------|-------|---------|
| 7–8 | Setup proyek, DB, seed 30 unit, layout dasar | C + B |
| 8–10 | Token + endpoint check-in (POST, hash, rate limit) + halaman /c/[token] | C + B |
| 10–12 | Login + RBAC + dasbor baca-saja (tabel unit) | C + B |
| 12–13 | Pembuat pesan wa.me + halaman /cycles | A + B |
| 13–14 | Tes keamanan dasar (tests/security), uji simulasi | D + C |
| 14–15 | README (setup, batasan, bantuan AI), fallback lokal, cadangan demo | A + D |
| 15–16 | Latihan pitch, catat commit awal, daftar fitur selesai vs belum | semua |
Catatan: langganan Claude habis 8 Des; seluruh arahan ada di docs/ dan AGENTS.md agar tidak bergantung pada satu asisten.
