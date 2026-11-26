import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { STEPS } from "./content";

export function HowItWorks() {
  return (
    <section id="alur" className="bg-green-mist py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="inline-block rounded-full bg-green-pale px-4 py-1.5 text-sm font-semibold text-green-dark mb-4">
            Bagaimana Cara Kerjanya?
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Alur Kerja 4 Langkah
          </h2>
          <p className="mt-3 text-base text-muted max-w-2xl mx-auto leading-relaxed">
            Simulasi interaktif lengkap dari pengiriman pesan WhatsApp bulanan hingga pencatatan hasil verifikasi lapangan. Klik tiap langkah untuk mencoba langsung.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.num}
                href={step.href}
                className="group/step lift-soft relative flex flex-col rounded-fib5 border border-green-100 bg-white p-6 shadow-sm transition-colors duration-200 hover:border-green-dark hover:bg-green-dark"
              >
                <div className="flex items-center justify-between mb-5">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-fib4 text-lg font-bold shadow-sm transition-colors duration-200 group-hover/step:bg-white group-hover/step:text-green-dark ${step.iconBg}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-green-mist px-2.5 py-1 text-xs font-bold text-muted transition-colors duration-200 group-hover/step:bg-white/15 group-hover/step:text-white">
                    Langkah {i + 1}
                  </span>
                </div>

                <h3 className="mb-2 text-base font-bold text-ink transition-colors duration-200 group-hover/step:text-white">
                  {step.title}
                </h3>
                <p className="flex-1 text-sm text-muted leading-relaxed transition-colors duration-200 group-hover/step:text-green-pale">
                  {step.desc}
                </p>

                <div className="mt-5 pt-4 border-t border-green-100 flex items-center justify-between transition-colors duration-200 group-hover/step:border-white/20">
                  <span className="rounded-full bg-green-mist px-2 py-0.5 text-xs font-semibold text-green-brand transition-colors duration-200 group-hover/step:bg-white/15 group-hover/step:text-white">
                    {step.tag}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-green-mid transition-all duration-200 group-hover/step:translate-x-1 group-hover/step:text-green-light">
                    Coba <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
