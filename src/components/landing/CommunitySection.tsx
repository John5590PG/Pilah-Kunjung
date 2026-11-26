import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin } from "lucide-react";
import { WasteIcon } from "@/components/common/WasteIcon";
import { demo } from "./content";

export function CommunitySection() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="group relative overflow-hidden rounded-fib5 shadow-xl">
            <img
              src="/images/komunitas-pemilahan-pkk.jpg"
              alt="Komunitas ibu-ibu PKK memilah sampah bersama"
              className="h-72 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] sm:h-96"
            />
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg bg-green-dark/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <MapPin className="h-3.5 w-3.5" />
              Kota Semarang, Jawa Tengah
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-green-pale px-4 py-1.5 text-sm font-semibold text-green-dark mb-5">
              <WasteIcon name="community-trust" className="h-4 w-4 text-green-brand" /> Komunitas &amp; Gotong Royong
            </span>
            <h2 className="text-3xl font-extrabold leading-snug tracking-tight text-ink sm:text-4xl">
              Dibangun untuk Manusia Nyata di Lapangan
            </h2>
            <p className="mt-4 text-base text-muted leading-relaxed">
              Sistem ini bertumpu pada ibu-ibu kader PKK dan relawan warga yang memilah sampah secara berkala.
              <strong className="text-ink"> Pilah &amp; Kunjung tidak membebani mereka</strong> dengan aplikasi rumit.
              Cukup konfirmasi 10 detik lewat WhatsApp yang sudah mereka pakai sehari-hari.
            </p>
            <ul className="mt-5 space-y-3">
              {["Tanpa install aplikasi baru", "Tanpa login atau password", "Pesan WhatsApp biasa yang familiar", "Hanya butuh 10 detik per bulan"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-ink">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-brand" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={`/c/${demo.token}`}
              className="mt-7 inline-flex items-center gap-2 rounded-fib4 bg-green-mid px-6 py-3 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-[3px] hover:bg-green-dark hover:shadow-md"
            >
              Coba Check-In Pengurus
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
