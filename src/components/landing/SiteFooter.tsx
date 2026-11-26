import Link from "next/link";
import { Beaker, ShieldCheck } from "lucide-react";
import { demo } from "./content";

export function SiteFooter() {
  return (
    <footer className="bg-green-dark pt-16 pb-10 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-10 md:grid-cols-4 pb-12 border-b border-white/15 text-sm">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="" width={40} height={40} className="h-10 w-10 rounded-fib4 shadow-sm" />
              <span className="text-lg font-extrabold text-white">Pilah &amp; Kunjung</span>
            </div>
            <p className="max-w-sm text-white/70 leading-relaxed">
              Solusi tata kelola operasional bank sampah Kota Semarang berbasis komunitas.
              Ramah privasi warga, transparan, dan memprioritaskan kemudahan pengurus di lapangan.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-green-light/80 pt-1">
              <ShieldCheck className="h-4 w-4 text-green-light" />
              <span>Zero Data Pribadi Warga · Rumus Terbuka</span>
            </div>
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-bold tracking-wider text-white/50 uppercase">
              Navigasi
            </span>
            <ul className="space-y-2 text-white/75">
              <li><Link href="/cycles" className="rounded-fib2 px-1.5 -mx-1.5 transition-colors hover:bg-white/10 hover:text-white">Generator Pesan WhatsApp</Link></li>
              <li><Link href={`/c/${demo.token}`} className="rounded-fib2 px-1.5 -mx-1.5 transition-colors hover:bg-white/10 hover:text-white">Check-In Pengurus (Demo)</Link></li>
              <li><Link href="/dashboard" className="rounded-fib2 px-1.5 -mx-1.5 transition-colors hover:bg-white/10 hover:text-white">Dasbor Prioritas Kunjungan</Link></li>
              <li><Link href={`/units/${demo.id}`} className="rounded-fib2 px-1.5 -mx-1.5 transition-colors hover:bg-white/10 hover:text-white">Catat Hasil Verifikasi</Link></li>
              <li><Link href="/login" className="rounded-fib2 px-1.5 -mx-1.5 transition-colors hover:bg-white/10 hover:text-white">Login Koordinator</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="block text-xs font-bold tracking-wider text-white/50 uppercase">
              Tentang
            </span>
            <div className="text-white/75 leading-relaxed space-y-2">
              <p><strong className="text-white">Kompetisi:</strong> STACK 2026<br />Case 2: Pelayanan Publik &amp; Komunitas</p>
              <p><strong className="text-white">Wilayah Pilot:</strong><br />Kec. Gunungpati, Kota Semarang</p>
              <p><strong className="text-white">Tim:</strong> RumaSynapse Corp.</p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-wrap items-center justify-between gap-4 text-xs text-white/40">
          <span>© 2026 RumaSynapse Corp. Hak cipta dilindungi.</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 font-medium text-white/60">
            <Beaker className="h-3.5 w-3.5" />
            Semua data sintetis untuk simulasi kompetisi
          </span>
        </div>
      </div>
    </footer>
  );
}
