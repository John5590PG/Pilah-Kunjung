# 05 — Spesifikasi Layar
## 1. /c/[token] — Check-in pengurus (mobile-first)
- Header: nama unit, kelurahan. Lencana "SIMULATED DATA" bila demo.
- Pertanyaan: "Bagaimana kondisi bank sampah bulan ini?"
- 3 tombol besar (min 56px, ikon + teks): Beroperasi / Dijeda / Tutup.
- Setelah ketuk: "Terima kasih. Status bulan ini: Beroperasi." + [Batalkan] 10 menit.
- Bagian "Tindak lanjut": status terverifikasi korcam + catatan singkat + tanggal (umpan balik untuk pengurus).
- Keadaan: valid, sudah check-in, token tidak berlaku (netral), offline (pesan sederhana).
- Aksesibilitas: font >=18px, kontras tinggi, tanpa istilah teknis.
## 2. /login
Email + kata sandi, galat umum, tanpa pendaftaran mandiri (akun dibuat admin).
## 3. /dashboard
- Ringkasan: jumlah per status (Operating, Paused, Closed, Unconfirmed).
- Tabel: peringkat, nama unit, kelurahan, status, bulan diam, terakhir sinyal, terakhir dikunjungi, skor.
- Filter status, cari nama. Urut default = skor prioritas. Tooltip skor: "2×M + W + B" dengan rincian.
- Aksi per baris: Kirim pengingat WA, Catat kontak/kunjungan.
## 4. /units/[id]
Profil unit, riwayat sinyal, riwayat kunjungan, formulir catat (mode: Telepon/Kunjungan, status terverifikasi, catatan), tombol cabut/rotasi tautan.
## 5. /cycles
Buka siklus baru, daftar unit + tombol "Kirim via WhatsApp" (membuka wa.me terisi), penanda terkirim, ekspor CSV daftar kunjungan.
## 6. /settings (admin)
Bobot rumus, cutoff_days, daftar unit (tambah/arsip), pengguna.
## Komponen
StatusBadge, BigChoiceButton, UnitRow, ScoreTooltip, ConfirmDialog, SyntheticBanner, EmptyState.

Token radius Fibonacci, header kaca, badge status modern, smooth scroll, dan perilaku hover kontras dijelaskan di `docs/03-ARCHITECTURE.md` bagian "Technical design — lapisan presentasi & interaksi".
