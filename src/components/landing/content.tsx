/** Landing-page copy and data. Edit text here, not inside section components. */
import seed from "@/data/seed-units.json";
import { WasteIcon } from "@/components/common/WasteIcon";
import { MessageSquare, Smartphone } from "lucide-react";

export const demo = seed[0];

const ScaleIcon = ({ className }: { className?: string }) => (
  <WasteIcon name="scale-weighing" className={className} />
);
const LoopIcon = ({ className }: { className?: string }) => (
  <WasteIcon name="recycle-loop" className={className} />
);

export const STEPS = [
  {
    num: "01",
    title: "Kirim Pesan WhatsApp",
    href: `/cycles?unit=${demo.id}`,
    desc: "Koordinator menyiapkan pesan pengingat bulanan dengan tautan unik. Dikirim langsung ke WhatsApp pengurus bank sampah, tanpa aplikasi tambahan.",
    tag: "Dispatch Bulanan",
    icon: MessageSquare,
    iconBg: "bg-green-mid text-white",
  },
  {
    num: "02",
    title: "Check-In 1 Ketukan",
    href: `/c/${demo.token}`,
    desc: "Pengurus buka tautan di ponsel, tanpa login dan tanpa password. Pilih satu status: Beroperasi, Dijeda, atau Tutup. Selesai dalam 10 detik.",
    tag: "< 10 Detik",
    icon: Smartphone,
    iconBg: "bg-green-brand text-white",
  },
  {
    num: "03",
    title: "Dasbor Prioritas",
    href: "/dashboard",
    desc: "30 unit bank sampah diurutkan otomatis berdasarkan rumus deterministik. Koordinator tahu unit mana yang paling butuh kunjungan pendampingan.",
    tag: "Transparan 100%",
    icon: ScaleIcon,
    iconBg: "bg-green-dark text-white",
  },
  {
    num: "04",
    title: "Catat Verifikasi",
    href: `/units/${demo.id}`,
    desc: "Petugas menyimpan hasil kunjungan. Catatan langsung muncul kembali ke layar pengurus unit, sehingga loop koordinasi tertutup dengan sempurna.",
    tag: "Loop Tertutup",
    icon: LoopIcon,
    iconBg: "bg-green-mid text-white",
  },
];

export const STATS = [
  { value: "30", label: "Unit Bank Sampah", sub: "Pilot Gunungpati" },
  { value: "< 10 dtk", label: "Waktu Lapor", sub: "Per pengurus per bulan" },
  { value: "0", label: "Data Pribadi Warga", sub: "Zero resident PII" },
  { value: "100%", label: "Transparan", sub: "Rumus terbuka, bukan AI" },
];

export const GUIDE_PENGURUS = [
  "Tunggu pesan WhatsApp dari koordinator setiap awal bulan",
  "Ketuk tautan dalam pesan, langsung terbuka di browser ponsel",
  "Pilih satu status: Beroperasi, Dijeda, atau Tutup",
  "Selesai! Tidak ada login, tidak ada aplikasi yang perlu diinstall",
];

export const GUIDE_KOORDINATOR = [
  "Buka dasbor, lihat ranking prioritas kunjungan unit",
  "Klik unit yang paling butuh pendampingan (skor tertinggi)",
  "Hubungi pengurus via telepon atau kunjungi langsung",
  "Catat hasil verifikasi, loop koordinasi otomatis tertutup",
];

export const AUDIT_MATRIX = [
  { spec: "Alur 4 Layar Klik Interaktif", detail: "Mode demo memakai localStorage; mode DB memakai PostgreSQL lewat API", status: "Works (Simulasi)", tier: "live" },
  { spec: "4 Status Siklus & Fitur Pembatalan", detail: "Operating, Paused, Closed (konfirmasi 2 tahap), pembatalan 10 menit", status: "Works (Simulasi)", tier: "live" },
  { spec: "Mesin Kalkulasi Prioritas Kunjungan", detail: "Algoritma deterministik 2×M + W + B diuji dengan unit test", status: "Library + Tests", tier: "tested" },
  { spec: "Keamanan Token & Idempotensi", detail: "Hash SHA-256 (128-bit entropy), rate limiter, GET aman anti-crawler WA", status: "Library + Tests", tier: "tested" },
  { spec: "Basis Data & Rollover Siklus", detail: "PostgreSQL, Prisma, sesi RBAC, rollover dipicu admin (cron belum)", status: "Works (DB)", tier: "live" },
  { spec: "Integrasi WhatsApp Business API", detail: "Tetap memakai tautan wa.me per unit; siaran massal API berbayar di luar lingkup", status: "Out of Scope (wa.me)", tier: "planned" },
];
