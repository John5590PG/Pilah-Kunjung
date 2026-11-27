# ADR 0001 — Pilihan stack (STATUS: DITERIMA, 27 November 2026)
Pilihan final tim RumaSynapse Corp.: Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui + Zod + Prisma 6 + PostgreSQL 16 (dengan fallback demo `localStorage` tanpa konfigurasi). Alasan: satu bahasa di seluruh stack, mudah dideploy ke Vercel maupun fallback lokal via `docker-compose`, dan mudah diserahterimakan ke operator daerah.
Alternatif yang sempat dipertimbangkan: Supabase (auth+DB terkelola; lebih cepat dibangun, namun lebih terikat vendor) dan SQLite (paling ringan, namun kurang fleksibel untuk hosting demo serverless multi-request).
Keputusan: Disetujui oleh tim RumaSynapse Corp. (27 November 2026) untuk implementasi branch `feat/development` dan Proposal Semifinal bagian 4.1.
