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
