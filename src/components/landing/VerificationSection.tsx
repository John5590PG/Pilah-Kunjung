import Link from "next/link";
import { ArrowUpRight, Calculator, MapPin } from "lucide-react";
import { WasteIcon } from "@/components/common/WasteIcon";

export function VerificationSection() {
  return (
    <section className="bg-green-mist py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-green-dark mb-5 shadow-sm">
              <MapPin className="h-4 w-4 text-green-brand" /> Verifikasi Lapangan
            </span>
            <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-ink sm:text-4xl">
              Koordinasi Lapangan yang Efisien
            </h2>
            <p className="mt-4 text-base text-muted leading-relaxed">
              Petugas pendamping DLH memiliki rasio kecil untuk ratusan unit.
              Dasbor prioritas membantu mereka <strong className="text-ink">fokus ke unit yang paling butuh bantuan</strong>,
              bukan mereka-reka berdasarkan ingatan.
            </p>
            <div className="mt-6 rounded-fib4 border border-green-100 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-ink">
                <WasteIcon name="scale-weighing" className="h-4 w-4 text-green-brand" />
                Rumus Prioritas Kunjungan
              </div>
              <div className="font-mono text-2xl font-black text-green-mid">
                SKOR = (2 × M) + W + B
              </div>
              <div className="text-xs text-muted space-y-1 leading-relaxed">
                <div><strong className="text-ink">M</strong> = Jumlah bulan berturut-turut tanpa laporan (silent cycles)</div>
                <div><strong className="text-ink">W</strong> = Bobot status bulan ini (Unconfirmed +3, Paused +2, Operating 0)</div>
                <div><strong className="text-ink">B</strong> = Bonus jika lama tidak dikontak (+2 lebih dari 6 bulan, +1 jika 3 sampai 6 bulan)</div>
              </div>
            </div>
            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-fib4 bg-green-mid px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-[3px] hover:bg-green-dark hover:shadow-md"
            >
              Lihat Dasbor Prioritas
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="group relative overflow-hidden rounded-fib5 shadow-xl order-1 lg:order-2">
            <img
              src="/images/verifikasi-petugas-lapangan.jpg"
              alt="Petugas lapangan mencatat dan menimbang di bank sampah"
              className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] sm:h-96"
            />
            <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-bold text-green-dark shadow-sm backdrop-blur-sm">
              <Calculator className="h-3.5 w-3.5" /> Tanpa AI / ML
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
