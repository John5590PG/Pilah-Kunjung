# 04 — Keamanan dari sudut UI/UX (berurutan mengikuti ERD)
Prinsip: kontrol keamanan tidak boleh menambah beban pengurus (relawan, ada yang lansia).
| # | Ancaman | Kontrol teknis | Dampak UI/UX | Tabel terkait |
|---|---------|----------------|--------------|---------------|
| 1 | Tautan ditebak | Token acak 128-bit; simpan hash SHA-256 (+pepper) | Tautan panjang, dikirim lewat tombol WA, tidak diketik | unit_tokens |
| 2 | Tautan bocor di grup | Kirim per pesan langsung, bukan grup; tombol "Kirim" per unit; rotasi/cabut token | Korcam punya tombol "Cabut tautan" di /units/[id] | unit_tokens |
| 3 | Pratinjau WhatsApp/bot membuka tautan | GET tidak mengubah data; perubahan hanya lewat POST | Pengurus tetap harus mengetuk tombol | checkin_signals |
| 4 | Salah ketuk | Batalkan 10 menit (undone_at) | Toast "Batalkan" besar | checkin_signals |
| 5 | Kebocoran URL via referrer/mesin pencari | Referrer-Policy: no-referrer, X-Robots-Tag: noindex | Tidak terlihat | - |
| 6 | Brute force token | Rate limit per IP + per token; respons seragam | Halaman "tautan tidak berlaku" yang netral | audit_logs |
| 7 | Akun korcam diambil alih | Hash kata sandi scrypt (Node.js crypto, timing-safe), cookie sesi httpOnly bertanda tangan HMAC-SHA256 (8 jam) | Login sederhana, pesan galat umum | users |
| 8 | Akses lintas kecamatan | RBAC: korcam hanya sub_district miliknya; admin lintas | Dasbor otomatis terfilter | users, sub_districts |
| 9 | Perubahan tidak terlacak | Audit log tindakan korcam/admin | Riwayat terlihat di /units/[id] | audit_logs, visit_confirmations |
| 10 | Data pribadi warga | Tidak ada tabel nasabah; nomor WA pengurus hanya untuk korcam/admin | Nomor disamarkan di layar pengurus | units |
| 11 | Salah mengarsipkan unit | Konfirmasi dua langkah untuk Closed | Dialog "Yakin tutup unit ini?" | units, visit_confirmations |
| 12 | Data simulasi terbaca sebagai nyata | Kolom is_synthetic + lencana | Lencana "SIMULATED DATA" di semua layar demo | units |
| 13 | Rahasia bocor di repo | .env, secret scanning, pesan commit bersih | - | - |
Catatan jujur: ini rancangan. Jangan tulis "aman" di proposal; tulis "dirancang dengan" dan sebutkan kontrol yang benar-benar sudah dibuat per tanggal itu.
