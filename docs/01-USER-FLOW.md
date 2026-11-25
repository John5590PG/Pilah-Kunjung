# 01 — User Flow (end-to-end)
Aktor: **Pengurus** (manager, tanpa akun), **Korcam** (login), **Pendamping DLH / Admin** (login, hak lebih).

## A. Alur besar satu siklus bulanan
```mermaid
flowchart TD
  S([Awal bulan]) --> C1[Korcam login]
  C1 --> C2[Buka siklus baru: /cycles]
  C2 --> C3[Sistem membuat draf pesan WA + tautan pribadi tiap unit]
  C3 --> C4[Korcam tekan 'Kirim' per unit -> wa.me terbuka, pesan sudah terisi]
  C4 --> M1[Pengurus menerima WA via pesan langsung]
  M1 --> M2[Ketuk tautan /c/TOKEN]
  M2 --> M3{Token valid?}
  M3 -- tidak --> E1[Halaman netral: tautan tidak berlaku, hubungi korcam]
  M3 -- ya --> M4[Layar: nama unit + 3 tombol besar]
  M4 --> M5[Ketuk Operating / Paused / Closed]
  M5 --> M6[Layar terima kasih + tombol Batalkan 10 menit]
  M6 --> D1[(checkin_signals tercatat)]
  C4 --> T[7 hari berlalu]
  T --> U{Ada sinyal?}
  U -- tidak --> U1[Status otomatis Unconfirmed]
  U -- ya --> D1
  U1 --> R[Dasbor: daftar peringkat kunjungan]
  D1 --> R
  R --> V1[Korcam pilih unit teratas -> telepon/kunjungi]
  V1 --> V2[Catat status terverifikasi + catatan singkat]
  V2 --> D2[(visit_confirmations + update status unit)]
  D2 --> F[Pengurus buka tautan lagi -> melihat status terverifikasi & tindak lanjut]
  F --> S2([Siklus berikutnya])
```

## B. Rute dan layar
| # | Rute | Siapa | Tujuan |
|---|------|-------|--------|
| 1 | /c/[token] | Pengurus | Check-in 1 ketukan + lihat status/feedback |
| 2 | /login | Korcam/Admin | Masuk |
| 3 | /dashboard | Korcam/Admin | Daftar unit, status, peringkat kunjungan |
| 4 | /units/[id] | Korcam/Admin | Detail unit, riwayat sinyal & kunjungan, catat kunjungan |
| 5 | /cycles | Korcam/Admin | Buka siklus, draf WA, tandai terkirim, ekspor CSV |
| 6 | /settings | Admin | Bobot rumus, batas siklus, rotasi token |

## C. Urutan masuk pertama (onboarding korcam)
Login -> dasbor kosong (empty state: "Belum ada unit. Tambah unit pertama") -> tambah unit (nama, kelurahan, nomor WA pengurus) -> buka siklus -> kirim tautan.
Catatan: nomor WA pengurus = data kontak, bukan data warga; akses hanya korcam/admin.

## D. Alur kesalahan
- Token salah/kedaluwarsa/dicabut: halaman netral yang sama untuk semua kasus (tidak membocorkan mana yang benar).
- Pengurus ketuk dua kali: idempotent, sinyal terakhir dalam siklus yang sama menimpa, riwayat tetap tersimpan.
- Salah ketuk: tombol Batalkan 10 menit.
- Korcam mencatat status "Closed": minta konfirmasi dua langkah (tindakan arsip).
