# src/components

| Folder | Isi | Boleh diubah? |
|---|---|---|
| `ui/` | Primitive shadcn: `button`, `card`, `dialog`, `input`, `badge`, `tooltip`, dll. Nama file huruf kecil. | Hati-hati. Perubahan menyasar semua halaman. |
| `common/` | Komponen aplikasi milik sendiri: `StatusBadge`, `DeliveryBadge`, `WasteIcon`, `SyntheticBanner`, `ScrollTopButton`, `ScoreTooltip`, `EmptyState`, `icons`. | Ya. |
| `landing/` | Section halaman depan. `content.tsx` berisi semua teks/data, sisanya komponen tampilan. | Ya. |
| `coordinator/` | Layar internal: dasbor, Pesan WA, detail unit, navigasi. Client component. | Ya. |
| `manager/` | Layar pengurus: check-in satu ketukan dan tombol besar. | Ya. |

Aturan penting:
- Ikon pakai `lucide-react` atau `WasteIcon` (CSS mask dari `public/icons`). Jangan emoji sistem.
- Komponen yang memakai state/hook diberi `"use client"` di baris pertama.
- Jalankan `npm run typecheck` setelah memindahkan file, karena import memakai alias `@/`.
