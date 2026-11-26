# Peta repositori

Tujuan: ** prototyping 4 layar + backend PostgreSQL opsional **. Semua data sintetis. Tanpa AI/ML di produk.

```text
.
├── src/
│   ├── app/
│   │   ├── page.tsx                  # landing (hanya komposisi section)
│   │   ├── (coordinator)/            # dashboard, cycles, settings, unit detail
│   │   ├── c/[token]/                # check-in pengurus (publik, token)
│   │   ├── login/                    # login demo / login DB
│   │   ├── api/                      # Route Handlers (HTTP tipis)
│   │   ├── globals.css               # token warna, radius Fibonacci, hover
│   │   └── layout.tsx                # metadata, font, provider global
│   ├── components/
│   │   ├── ui/                       # primitive shadcn (huruf kecil)
│   │   ├── common/                   # komponen aplikasi (PascalCase)
│   │   ├── landing/                  # section landing + content.tsx
│   │   ├── coordinator/              # layar internal (client)
│   │   └── manager/                  # layar pengurus (client)
│   ├── lib/
│   │   ├── ranking/                  # fungsi murni skor kunjungan (docs/06)
│   │   ├── services/                 # logika bisnis DB (transaction)
│   │   ├── auth/, db/, api/          # sesi, Prisma, helper HTTP
│   │   ├── security/                 # hash token, rate limiter
│   │   ├── demo/                     # state localStorage + bobot demo
│   │   ├── whatsapp/                 # pembuat tautan wa.me
│   │   ├── appdata/provider.tsx      # jembatan UI ↔ demo/API
│   │   └── env.ts, format.ts, status.ts, utils.ts
│   └── proxy.ts                      # proteksi area koordinator (mode DB)
├── prisma/
│   ├── schema.prisma                 # source of truth skema
│   ├── migrations/                   # SQL migrasi awal
│   └── seed.mjs                      # 30 unit sintetis + akun demo
├── docs/00 … docs/10, docs/adr/      # dokumen sumber (baca urut 00 → 10)
├── docs/TECHNICAL-DESIGN.md          #hasil generate, satu file untuk PDF
├── scripts/                          # build-seed.mjs, build-technical-design.mjs
├── seed/units.csv                    # dataset sintetis mentah
├── prototype/screenshots/            # bukti tangkapan layar kompetisi
├── public/icons, public/images       # aset lokal, bukan stok AI
└── tests/                            # vitest: demo, ranking, token, wa.me, backend
```

## Di mana mengubah apa

| Mau mengubah | Buka |
|---|---|
| Teks/gambar landing | `src/components/landing/content.tsx` + section terkait |
| Warna, radius, hover global | `src/app/globals.css` |
| Badge status, ikon sampah, banner | `src/components/common/` |
| Perilaku tombol check-in pengurus | `src/components/manager/CheckinClient.tsx`, `BigChoiceButton.tsx` |
| Perilaku dasbor / Pesan WA / detail unit | `src/components/coordinator/` |
| Cara skor dihitung | `src/lib/ranking/index.ts` (murni, ada tes) |
| Aturan bisnis DB | `src/lib/services/` |
| Endpoint HTTP | `src/app/api/**/route.ts` (tipis, validasi Zod) |
| Skema tabel | `prisma/schema.prisma` **dan** `docs/02-ERD.md` |
| Data demo awal | `seed/units.csv` → `npm run seed:build` |
| Dokumen teknis gabungan | sunting `docs/NN`, lalu `npm run docs:build` |

## Konvensi

- `components/ui/` = primitive pustaka, huruf kecil. `components/common/` = komponen aplikasi, PascalCase. Jangan campur.
- Teks UI memakai tanda baca alami, **tanpa emoji sistem dan tanpa em dash**.
- Ikon memakai `lucide-react` atau `WasteIcon` dari `public/icons/waste-bank`.
- Perubahan data hanya lewat `POST`. `GET` tidak pernah memutasi.
- Token mentah tidak pernah disimpan atau dicatat; hanya hash SHA-256(+pepper).
- Semua data contoh berlabel sintetis.

## Langkah cepat developer baru

1. `npm install` → otomatis `prisma generate`.
2. `npm test` dan `npm run build` harus hijau.
3. Tanpa `.env`, jalankan `npm run dev` untuk mode demo localStorage.
4. Untuk mode DB: `cp .env.example .env`, `docker compose up -d`, `npm run db:migrate`, `npm run db:seed`, lalu restart dev.
5. Baca `docs/03-ARCHITECTURE.md` untuk arsitektur dan `README.md` untuk status jujur fitur.

Detail aturan produk ada di `AGENTS.md`.
