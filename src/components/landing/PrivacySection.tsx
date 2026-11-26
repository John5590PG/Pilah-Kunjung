import { Ban, Building2, Calculator, Hash, ShieldCheck, UserX } from "lucide-react";
import { WasteIcon } from "@/components/common/WasteIcon";

const PRIVACY_POINTS = [
  { icon: UserX, label: "Zero data pribadi warga" },
  { icon: Calculator, label: "Rumus deterministik terbuka" },
  { icon: Hash, label: "Token hash SHA-256" },
  { icon: Ban, label: "Tanpa AI / machine learning" },
];

export function PrivacySection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="group relative overflow-hidden rounded-fib5 shadow-xl">
            <img
              src="/images/unit-fisik-bank-sampah.jpg"
              alt="Fasilitas fisik shelter bank sampah dengan sekat pemilahan"
              className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] sm:h-96"
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg bg-green-dark/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Building2 className="h-3.5 w-3.5" />
              Infrastruktur Bank Sampah
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-pale px-4 py-1.5 text-sm font-semibold text-green-dark mb-5">
              <ShieldCheck className="h-4 w-4" /> Privasi &amp; Transparansi
            </span>
            <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-ink sm:text-4xl">
              Privasi Warga Terlindungi Penuh
            </h2>
            <p className="mt-4 text-base text-muted leading-relaxed">
              Sistem ini hanya mencatat <strong className="text-ink">status operasional unit bank sampah</strong>,
              bukan data pribadi warga seperti nama, NIK, alamat, atau saldo tabungan sampah.
              Semua perhitungan dilakukan dengan rumus matematika terbuka yang bisa diaudit siapa pun.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {([
                ["bottle-plastic", "Botol plastik"],
                ["paper-box", "Kertas & kardus"],
                ["organic-leaf", "Sampah organik"],
              ] as const).map(([name, label]) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-fib3 border border-green-light/60 bg-white/70 px-2.5 py-1 text-[11px] font-semibold text-green-dark transition-colors duration-200 hover:border-green-mid hover:bg-green-mid hover:text-white"
                >
                  <WasteIcon name={name} className="h-3.5 w-3.5" />
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {PRIVACY_POINTS.map(({ icon: Icon, label }) => (
                <div key={label} className="group/privacy flex items-center gap-2.5 rounded-fib4 bg-green-mist p-3 text-sm font-medium text-ink transition-colors duration-200 hover:bg-green-dark hover:text-white">
                  <Icon className="h-4 w-4 shrink-0 text-green-brand transition-colors duration-200 group-hover/privacy:text-white" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
