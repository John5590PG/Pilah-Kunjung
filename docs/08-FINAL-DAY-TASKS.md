# 08 — Tugas Substantif Final Day (16 Des)
Handbook: tim datang dengan prototipe sebagian jadi lalu menyelesaikan 2 hingga 3 tugas besar secara langsung selama sesi membangun.
1. **Distribusi Token Produksi Sekali-Tampil & Manajemen CRUD Unit di UI (`/units` & `/cycles`):** menghubungkan endpoint rotasi/pencabutan token (`POST /api/units/[id]/token`) serta formulir tambah dan arsip unit langsung ke alur pengiriman pesan WhatsApp korcam (menggantikan token pratinjau seed statis).
2. **Evaluasi Cutoff Siklus Otomatis & Komparasi Tren Antar-Siklus Bulanan:** deteksi otomatis unit yang melewati `cutoff_at` tanpa pemicu manual admin, disertai ringkasan tren perubahan status antar-bulan di dasbor.
3. **Tampilan Agregasi Lintas-Kecamatan untuk Pembina DLH (`ADVISOR`) & Peninjau Jejak Audit (`AuditLog`) di Aplikasi:** membangun pemilih serta rekapitulasi lintas kecamatan bagi peran `ADVISOR` dan tabel inspeksi `audit_logs` di antarmuka web.
## Yang HARUS sudah ada sebelum Final Day
Skema 10 tabel Prisma + migrasi SQL, seed 30 unit sintetis, autentikasi `scrypt` + RBAC, UI 4 layar dual-mode (`AppDataProvider`), 14 endpoint Route Handler inti, serta 28 unit test hijau. Catat commit awal saat check-in Final Day.
## Definisi selesai
Seluruh alur produksi berjalan tanpa token demo statis: tambah unit -> rotasi token acak 128-bit -> kirim WA -> check-in pengurus -> evaluasi cutoff otomatis -> tindak lanjut kunjungan -> peninjauan lintas kecamatan oleh pembina DLH dan audit log, dengan seluruh data sintetis berlabel jelas.
