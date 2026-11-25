# Pilah & Kunjung — A Lightweight Activity Check-In for Semarang's Waste Banks
Tim: RumaSynapse Corp. | STACK 2026 (Case 2) | Pilot: Kecamatan Gunungpati

> **Semua data = SINTETIS (simulasi).** Tidak ada bank sampah asli, tidak ada data warga. Tidak ada AI/ML di dalam produk.

## Status jujur (per 25 Nov 2026)
| Bagian | Status |
|---|---|
| Alur 4 layar yang bisa diklik (pesan WA → check-in 1 ketukan → dasbor → catat kunjungan → umpan balik) | **Berfungsi, tersimulasi** — state disimpan di browser (localStorage), tanpa server |
| 4 status unit, Batalkan 10 menit, konfirmasi dua langkah untuk Closed, ekspor CSV (sisi klien), simulasi pergantian siklus | Berfungsi, tersimulasi |
| Peringkat kunjungan `src/lib/ranking`, token `src/lib/security`, pembuat tautan wa.me, rate limiter | Pustaka + tes (`npm test`); token/rate limiter **belum dipakai** UI |
| Header `Referrer-Policy: no-referrer` pada `/c/*`, `noindex` | Ada (`next.config.ts`) |
| Database PostgreSQL/Prisma, login & RBAC, endpoint POST server, rotasi/cabut tautan, rollover otomatis, kirim WA sungguhan | **Planned** (`/api/*` mengembalikan 501) |

Catatan: token di prototipe adalah token DEMO deterministik (`seed/README.md`), bukan token acak 128-bit yang di-hash. GET `/c/[token]` tidak mengubah data; perubahan hanya saat tombol diketuk.

## Menjalankan
```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 21 tes: ranking, token, wa.me, state demo
npm run build      # build produksi (sama seperti di Vercel)
```
Tidak perlu `.env` untuk prototipe. Buka `/` untuk alur 4 langkah. Tombol "Reset demo data" ada di bilah atas. Tip demo: buka `/c/<token>` di tab kedua (lebar ponsel); dasbor ikut berubah.

## Struktur
`src/app` halaman (`/`, `/cycles`, `/dashboard`, `/units/[id]`, `/c/[token]`, `/login`, `/settings`) · `src/components` · `src/lib/{ranking,security,whatsapp,demo}` · `seed/units.csv` (30 unit sintetis) · `prisma/schema.prisma` (rancangan backend) · `docs/` (urutan baca: 00 → 10) · `prototype/screenshots` (tangkapan layar berlabel)

## Deploy
Lihat `docs/10-GIT-DAN-VERCEL.md`.
