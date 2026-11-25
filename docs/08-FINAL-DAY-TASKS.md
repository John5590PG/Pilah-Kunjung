# 08 — Tugas Substantif Final Day (16 Des)
Handbook: tim datang dengan prototipe sebagian jadi lalu menyelesaikan 2–3 tugas besar.
1. **Siklus konfirmasi dua arah:** korcam mencatat kontak/kunjungan -> status unit berubah -> pengurus melihat umpan balik di /c/[token]. (visit_confirmations, current_status)
2. **Mesin peringkat langsung:** `lib/ranking` terhubung ke dasbor, filter status, penyesuaian manual, bobot dari settings. (tests/ranking hijau)
3. **Rollover siklus + ekspor CSV:** siklus baru memicu Unconfirmed otomatis; ekspor daftar kunjungan.
## Yang HARUS sudah ada sebelum Final Day
Skema+migrasi, seed sintetis, /c/[token] (check-in berfungsi), login, dasbor baca-saja. Catat commit awal.
## Definisi selesai
Satu alur lengkap berjalan dari pesan WA -> ketuk -> dasbor -> kunjungan -> umpan balik, dengan data sintetis berlabel.
