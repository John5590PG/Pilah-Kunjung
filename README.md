# Pilah & Kunjung: A Lightweight Activity Check-In for Semarang's Waste Banks
Tim: RumaSynapse Corp. | STACK 2026 (Case 2) | Pilot: Kecamatan Gunungpati

> **Semua data = SINTETIS (simulasi).** Tidak ada bank sampah asli, tidak ada data warga. Tidak ada AI/ML di dalam produk.

## Status jujur (per 27 Nov 2026)
| Bagian | Status |
|---|---|
| Alur 4 layar yang bisa diklik (pesan WA → check-in 1 ketukan → dasbor → catat kunjungan → umpan balik) | **Berfungsi (Dual-Mode):** memakai API PostgreSQL bila `DATABASE_URL` aktif, atau otomatis fallback ke simulasi browser (`localStorage`) |
| 4 status unit, Batalkan 10 menit, konfirmasi dua langkah untuk Closed, ekspor CSV (klien & server), simulasi pergantian siklus | **Berfungsi** di mode demo maupun PostgreSQL |
| Peringkat kunjungan `src/lib/ranking`, token `src/lib/security`, pembuat tautan wa.me, rate limiter | Pustaka + tes (`npm test`, 28 tes); rate limiter aktif pada endpoint backend |
| Header `Referrer-Policy: no-referrer` pada `/c/*`, `noindex` | Ada (`next.config.ts`) |
| Database PostgreSQL/Prisma (10 model), login `scrypt` & sesi HMAC + RBAC, 14 endpoint server, rotasi/cabut tautan, rollover siklus, editor bobot `/settings` | **Berfungsi** bila `DATABASE_URL` tersedia. Rollover masih dipicu manual oleh admin (cron otomatis belum) |
| Integrasi produksi lanjutan (rotasi token sekali-tampil di alur `/cycles` + CRUD unit UI, cutoff otomatis, tampilan lintas-kecamatan ADVISOR & inspektor AuditLog) | **Planned (Tugas Final Day 16 Des, lihat `docs/08-FINAL-DAY-TASKS.md`)** |
| Kirim WhatsApp sungguhan (WhatsApp Business API) | **Out-of-Scope / Planned jangka panjang:** tetap memakai tautan `wa.me` |

Catatan: token di UI demo adalah token DEMO deterministik (`seed/README.md`). Di backend, token acak 128-bit dibuat saat rotasi dan hanya **hash SHA-256(+pepper)** yang disimpan; token mentah dikembalikan sekali. GET `/c/[token]` tidak mengubah data; perubahan hanya saat tombol diketuk.

## Menjalankan
```bash
npm install        # juga menjalankan prisma generate (postinstall)
npm run dev        # http://localhost:3000
npm test           # 28 tes: ranking, token, wa.me, state demo, auth, siklus
npm run build      # build produksi (sama seperti di Vercel)
npm run docs:build # regenerate docs/TECHNICAL-DESIGN.md (gabungan docs, siap PDF)
```
Tanpa `.env`, UI demo tetap berjalan penuh (localStorage). Tombol "Reset demo data" ada di bilah atas. Tip demo: buka `/c/<token>` di tab kedua (lebar ponsel); dasbor ikut berubah.

## Backend PostgreSQL (aktif otomatis bila `DATABASE_URL` tersedia)
```bash
cp .env.example .env        # isi AUTH_SECRET & TOKEN_PEPPER (min. 16 karakter)
docker compose up -d        # PostgreSQL 16 di localhost:5432
npm run db:migrate          # buat tabel dari prisma/migrations
npm run db:seed             # 30 unit sintetis + akun demo (SEMUA SINTETIS)
npm run dev
```
Akun seed (bisa diubah lewat variabel `SEED_*`): `admin@demo.local` (ADMIN), `korcam@demo.local` (COORDINATOR, Kecamatan Gunungpati), `advisor@demo.local` (ADVISOR). Kata sandi default tercetak saat `db:seed`.

Endpoint yang sudah berfungsi (semua memvalidasi input dengan Zod):
| Endpoint | Akses | Fungsi |
|---|---|---|
| `POST /api/auth/login` · `POST /api/auth/logout` · `GET /api/auth/me` | publik / sesi | Login (scrypt), sesi httpOnly bertanda tangan HMAC |
| `GET /api/units` | korcam/advisor/admin | Daftar unit + skor prioritas dari PostgreSQL |
| `POST /api/units/[id]/token` | korcam/admin | Rotasi tautan; token mentah dikembalikan **sekali** |
| `POST /api/units/[id]/archive` | korcam/admin | Arsipkan unit + cabut semua tautan |
| `GET/POST /api/visits` | korcam/advisor/admin | Riwayat & catat kunjungan/kontak |
| `GET/POST /api/checkin` | publik (token) | Baca status (GET aman) & kirim konfirmasi |
| `POST /api/checkin/undo` | publik (token) | Batalkan dalam 10 menit |
| `GET/POST /api/cycles` | sesi / admin | Siklus aktif & rollover manual |
| `GET/POST /api/settings` | sesi / admin | Bobot per kecamatan (form admin di `/settings`) |
| `GET /api/export` | sesi | CSV daftar prioritas kunjungan |

Dengan database aktif, halaman `/login` menampilkan login sungguhan; `/dashboard`, `/cycles`, `/units/[id]`, dan `/c/[token]` dilindungi proxy serta membaca/menulis ke PostgreSQL. Tanpa database, semua layar tetap memakai state demo localStorage seperti sebelumnya.

Catatan jujur: tautan check-in di Pesan WA masih memakai token DEMO dari seed agar pratinjau tidak mengubah data. Untuk produksi, panggil `POST /api/units/[id]/token` (rotasi; token mentah dikembalikan sekali). Form edit bobot tersedia di `/settings`: di mode demo ia berupa visualisasi POV DLH yang tersimpan hanya di browser; di mode DB hanya ADMIN yang bisa menulis ke `ranking_settings`. Bobot tetap **belum divalidasi lapangan**. Penjadwalan cron rollover belum dibuat.

## Struktur
Peta lengkap dan "di mana mengubah apa" ada di **`STRUCTURE.md`**. Ringkasnya: `src/app` (halaman + Route Handlers), `src/components/{ui,common,landing,coordinator,manager}`, `src/lib/{ranking,services,auth,db,api,security,demo,whatsapp,appdata}`, `prisma/` (schema + migrasi + seed), `seed/units.csv`, `docs/` (baca 00 → 10), `docs/TECHNICAL-DESIGN.md` (gabungan siap PDF), `prototype/screenshots`. Panduan folder juga ada di `src/components/README.md`, `src/lib/README.md`, dan `prisma/README.md`.

## Deploy
Lihat `docs/10-GIT-DAN-VERCEL.md`.
