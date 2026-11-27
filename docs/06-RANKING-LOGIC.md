# 06 — Logika Peringkat Kunjungan (deterministik, tanpa AI)
Heuristik awal usulan tim (belum divalidasi; bobot dikalibrasi bersama praktisi):
`Skor = 2 × M_diam + W_status + B_kunjungan`
- M_diam: jumlah siklus berturut-turut tanpa sinyal/verifikasi (0,1,2,...)
- W_status: Unconfirmed=3, Paused=2, Operating=0, Closed=dikecualikan
- B_kunjungan: +2 bila tidak ada kontak/kunjungan >6 bulan (atau tidak pernah); +1 bila 3–6 bulan; 0 lainnya
- Seri: last_signal_at lebih lama = peringkat lebih tinggi.
## Pseudocode
```ts
export function score(u: UnitInput, cfg: Cfg): number | null {
  if (u.status === 'CLOSED') return null;          // dikecualikan
  const w = { UNCONFIRMED: cfg.wUnconfirmed, PAUSED: cfg.wPaused, OPERATING: 0 }[u.status];
  const b = u.monthsSinceContact === null || u.monthsSinceContact > 6 ? 2
          : u.monthsSinceContact >= 3 ? 1 : 0;
  return cfg.wSilent * u.silentCycles + w + b;
}
```
## Contoh (data sintetis)
| Unit | M | Status | Kontak terakhir | Skor |
|------|---|--------|-----------------|------|
| A | 3 | Unconfirmed | tak pernah | 6+3+2 = 11 |
| B | 1 | Paused | 4 bulan | 2+2+1 = 5 |
| C | 0 | Operating | 1 bulan | 0 |
## Tes wajib (tests/ranking)
Closed dikecualikan; seri dipecah last_signal_at; bobot dari settings; batas 3 dan 6 bulan; unit tanpa riwayat.

## Mitigasi Klaim Beroperasi Semu (False-Positive Self-Reporting)
Untuk mengantisipasi pengurus yang mengetuk `Beroperasi` agar cepat selesai atau sungkan (*courtesy tap*) tanpa merusak target check-in `<10` detik (tanpa wajib unggah foto GPS tiap bulan), sistem menerapkan tiga lapis pertahanan:
1. **Insentif Sosial Tanpa Sanksi:** Pengurus bekerja sukarela tanpa honor rutin (`Noerchaisna & Marom, 2025`; `Situmeang et al., 2023`). Status `Dijeda` memicu bantuan pendampingan atau mitra pengepul (Perwalkot Semarang 103/2021 Pasal 41g), sedangkan `Tutup` menghentikan pengingat bulanan setelah konfirmasi korcam.
2. **Isolasi `monthsSinceContact` (`B_kunjungan`) dari Ketukan Pengurus:** Di `src/lib/ranking/index.ts`, ketukan pengurus hanya memperbarui `last_signal_at` (`checkin_signals`), sedangkan `last_visited_at` (`monthsSinceContact`) **hanya di-reset oleh verifikasi korcam/DLH (`visit_confirmations`)**. Unit yang terus mengetuk `Beroperasi` tanpa pernah diverifikasi `>6` bulan tetap memperoleh `B_kunjungan = +2` agar terambil untuk uji petik berkala (*spot-check*) saat antrean mendesak mereda.
3. **Pemeriksaan Silang Pasif (*Zero-Burden Cross-Check*):** Korcam (yang juga pengurus bank sampah di kecamatan sama) dan Bank Sampah Induk (BSI) kecamatan dapat mencocokkan klaim `Beroperasi` beruntun dengan catatan riwayat jemputan sampah kering serta laporan kemitraan 6-bulanan (Permen LHK No. 14/2021 Pasal 15 ayat 4 & Lampiran IV).
