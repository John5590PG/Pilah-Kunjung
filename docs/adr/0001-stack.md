# ADR 0001 — Pilihan stack (STATUS: USULAN, tim konfirmasi)
Pilihan: Next.js + TypeScript + Tailwind + Prisma + PostgreSQL. Alasan: satu bahasa, mudah dideploy, mudah diserahterimakan.
Alternatif: Supabase (auth+DB terkelola; lebih cepat, lebih bergantung vendor); SQLite (paling ringan, tapi hosting demo kurang fleksibel).
Keputusan: ______ (isi tanggal & nama penentu).
Pastikan proposal bagian 4.1 sama persis dengan keputusan ini.

Catatan 25 Nov 2026: prototipe 30 Nov dibangun dengan Next.js 16 + TypeScript + Tailwind 4 TANPA database (state di browser). Pilihan database (PostgreSQL/Neon vs Supabase vs SQLite) tetap menunggu keputusan tim; sinkronkan proposal 4.1.
