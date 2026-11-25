/** WhatsApp click-to-chat helpers (wa.me). No paid Business API (proposal §3.4). */

const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

/** "2026-11" -> "November 2026" */
export function periodLabelId(period: string): string {
  const [y, m] = period.split("-").map(Number);
  return `${MONTHS_ID[(m ?? 1) - 1] ?? period} ${y}`;
}

export function buildCheckinUrl(baseUrl: string, token: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/c/${encodeURIComponent(token)}`;
}

export function buildReminderMessage(opts: { unitName: string; period: string; url: string }): string {
  return [
    `Halo, pengurus ${opts.unitName}.`,
    `Pengingat bulan ${periodLabelId(opts.period)}: mohon ketuk satu tombol untuk memberi tahu kondisi bank sampah bulan ini (tanpa login, kurang dari 10 detik).`,
    opts.url,
    "Terima kasih. — Korcam Gunungpati",
  ].join("\n\n");
}

/** `phone` may contain +, spaces or dashes; wa.me needs digits only. */
export function buildWaLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
