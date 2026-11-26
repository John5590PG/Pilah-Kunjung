import Link from "next/link";
import { ArrowRight, ClipboardList, Eye, Landmark, UsersRound } from "lucide-react";
import { demo, GUIDE_KOORDINATOR, GUIDE_PENGURUS } from "./content";

export function Guidelines() {
  return (
    <section className="bg-green-dark py-20 sm:py-28 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white/90 mb-4 backdrop-blur-sm">
            <ClipboardList className="h-4 w-4" />
            Panduan Penggunaan
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Panduan Singkat untuk Semua Pengguna
          </h2>
          <p className="mt-3 text-base text-white/70 max-w-xl mx-auto">
            Pilah &amp; Kunjung dirancang agar mudah digunakan oleh semua kalangan, dari ibu-ibu PKK hingga petugas DLH.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="lift-soft rounded-fib5 border border-white/15 bg-white/10 p-7 backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/15">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-fib4 bg-green-light/20 text-white">
                <UsersRound className="h-5 w-5" />
              </span>
              <div>
                <div className="text-xs font-semibold text-green-light uppercase tracking-wider mb-0.5">Untuk</div>
                <h3 className="text-lg font-bold text-white">Pengurus Bank Sampah</h3>
              </div>
            </div>
            <ol className="space-y-4">
              {GUIDE_PENGURUS.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-light/20 text-xs font-bold text-green-light">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/80 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <Link
              href={`/c/${demo.token}`}
              className="mt-7 inline-flex items-center gap-2 rounded-fib2 px-1.5 -mx-1.5 text-sm font-semibold text-green-light transition-colors hover:bg-white/15 hover:text-white"
            >
              Coba Check-In Pengurus <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="lift-soft rounded-fib5 border border-white/15 bg-white/10 p-7 backdrop-blur-sm transition-colors hover:border-white/35 hover:bg-white/15">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-11 w-11 items-center justify-center rounded-fib4 bg-green-light/20 text-white">
                <Landmark className="h-5 w-5" />
              </span>
              <div>
                <div className="text-xs font-semibold text-green-light uppercase tracking-wider mb-0.5">Untuk</div>
                <h3 className="text-lg font-bold text-white">Koordinator DLH Kecamatan</h3>
              </div>
            </div>
            <ol className="space-y-4">
              {GUIDE_KOORDINATOR.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-light/20 text-xs font-bold text-green-light">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/80 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
            <Link
              href="/dashboard"
              className="mt-7 inline-flex items-center gap-2 rounded-fib2 px-1.5 -mx-1.5 text-sm font-semibold text-green-light transition-colors hover:bg-white/15 hover:text-white"
            >
              Buka Dasbor Koordinator <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-fib5 border border-white/15 bg-white/8 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-fib4 bg-green-light/20">
            <Eye className="h-6 w-6 text-green-light" />
          </div>
          <div>
            <div className="font-bold text-white mb-1">Transparansi Penuh: Bukan AI, Bukan Black Box</div>
            <div className="text-sm text-white/70 leading-relaxed">
              Setiap keputusan prioritas dihasilkan dari rumus matematika sederhana yang bisa diperiksa, diaudit, dan diperdebatkan oleh siapa pun.
              Tidak ada model machine learning, tidak ada prediksi probabilistik, hanya logika deterministik yang terbuka.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
