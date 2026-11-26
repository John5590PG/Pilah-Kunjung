import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { WasteIcon } from "@/components/common/WasteIcon";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/komunitas-pemilahan-pkk.jpg"
          alt="Ibu-ibu kader PKK memilah sampah di balai warga"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-dark/90 via-green-dark/70 to-green-mid/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-green-dark/60 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 mb-6 backdrop-blur-sm">
            <WasteIcon name="organic-leaf" className="h-4 w-4 text-green-light" />
            <span className="text-sm font-medium text-white/90">
              Pilot Kecamatan Gunungpati, Semarang
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-tight">
            Bank Sampah Lebih Aktif,{" "}
            <span className="text-green-light">Koordinasi Lebih Mudah</span>
          </h1>

          <p className="mt-5 text-lg text-white/85 leading-relaxed max-w-xl">
            Menghubungkan ratusan bank sampah warga berbasis relawan dengan koordinator DLH Kota Semarang.
            Pengurus cukup ketuk satu tombol per bulan via WhatsApp. Koordinator langsung tahu siapa yang perlu dibantu.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#alur"
              className="inline-flex items-center gap-2 rounded-fib4 bg-white px-6 py-3 text-sm font-bold text-green-dark shadow-lg transition-all duration-200 hover:-translate-y-[3px] hover:bg-green-dark hover:text-white hover:shadow-xl"
            >
              Coba Simulasi Alur
              <ArrowRight className="h-4 w-4" />
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-fib4 border-2 border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:-translate-y-[3px] hover:bg-white hover:text-green-dark"
            >
              Buka Dasbor Koordinator
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-paper to-transparent z-10" />
    </section>
  );
}
