# src/lib

| Folder / file | Tanggung jawab | Catatan |
|---|---|---|
| `ranking/` | Rumus prioritas kunjungan | Fungsi murni. Tidak boleh mengimpor Prisma atau React. Diuji di `tests/ranking`. |
| `services/` | Logika bisnis database | Satu file per domain: `units`, `cycles`, `checkin`, `visits`, `tokens`, `drafts`, `settings`. Boleh memakai Prisma + transaksi. |
| `db/client.ts` | Prisma Client singleton | Dipakai service dan route handler. |
| `auth/` | Password scrypt, sesi HMAC, guard RBAC | `session-token.ts` murni (bisa dites), `session.ts` berisi cookie Next. |
| `api/` | `http.ts` (error/validasi server) dan `client.ts` (fetch browser) | Jangan campur keduanya. |
| `security/` | Hash token, rate limiter | Token mentah tidak pernah dicatat. |
| `demo/` | State localStorage + bobot demo | Dipakai hanya saat mode demo. |
| `whatsapp/` | Pembuat URL `wa.me` dan teks pesan | Tidak mengirim pesan sungguhan. |
| `appdata/provider.tsx` | Satu jembatan data untuk UI | Mendeteksi mode via `/api/health`, lalu memilih demo atau API. |
| `env.ts`, `format.ts`, `status.ts`, `utils.ts` | Utilitas lintas modul | `status.ts` berisi definisi 4 status unit. |
