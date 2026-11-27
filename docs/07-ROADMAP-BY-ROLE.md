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
Siapkan penyediaan database cloud (Neon/Supabase), mekanisme pencabutan sesi aktif, serta skrip uji integrasi/beban. Jangan menganggap lolos.
**Status 27 Nov:** skema final 10 tabel Prisma, migrasi awal, `docker-compose.yml`, seed sintetis, auth scrypt + sesi HMAC, RBAC, 14 endpoint inti bervalidasi Zod, workspace `/settings`, dan penyambungan UI dua mode via `AppDataProvider` sudah dibuat (lihat `docs/03-ARCHITECTURE.md`). Mode demo `localStorage` tetap aktif otomatis bila `DATABASE_URL` tidak dikonfigurasi.

## Fase 3 — Perbaikan produk (7–16 Des, jika lolos)
| Hari | Tugas | Pemilik |
|------|-------|---------|
| 7–9 | Penyediaan database PostgreSQL cloud (Neon/Supabase) + konfigurasi env Vercel | C + A |
| 9–11 | Mekanisme pencabutan sesi per pengguna + halaman admin manajemen pengguna | C + B |
| 11–13 | Pengujian integrasi end-to-end (mode DB & mode demo) + simulasi beban | D + C |
| 13–14 | Finalisasi fallback lokal `docker-compose`, README, dan verifikasi AI disclosure | A + D |
| 15–16 | Latihan pitch, catat commit awal Final Day, siapkan 3 tugas substantif Final Day (`docs/08`) | semua |
Catatan: langganan Claude habis 8 Des; seluruh arahan ada di docs/ dan AGENTS.md agar tidak bergantung pada satu asisten.
