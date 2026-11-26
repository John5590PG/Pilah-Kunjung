# prisma

```text
schema.prisma              source of truth model PostgreSQL
migrations/                SQL hasil generate, dijalankan dengan prisma migrate deploy
  20261127000000_init/     migrasi awal
seed.mjs                   30 unit sintetis + 3 akun + siklus berjalan
```

## Alur kerja

```bash
# lokal
docker compose up -d
npm run db:migrate        # development, membuat migrasi baru bila skema berubah
npm run db:seed           # idempoten, aman dijalankan ulang
npm run db:studio         # opsional

# produksi / Vercel
npm run db:deploy         # hanya menjalankan migrasi yang sudah ada
```

## Aturan

- Setiap perubahan model HARUS mengubah `prisma/schema.prisma` **dan** `docs/02-ERD.md` bersamaan.
- Jalankan `npx prisma generate` bila skema berubah (`npm run db:generate`). `npm install` juga menjalankannya lewat `postinstall`.
- `DATABASE_URL` dipakai runtime, `DIRECT_URL` dipakai migrasi (di Neon: host non-pooled).
- Seed hanya data SINTETIS. Kata sandi demo bisa diganti lewat variabel `SEED_*` di `.env`.
- Token disimpan sebagai hash `SHA-256(TOKEN_PEPPER + token)` di tabel `UnitToken`.
