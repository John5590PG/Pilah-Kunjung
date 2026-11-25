import Link from "next/link";
import seed from "@/data/seed-units.json";
import { SyntheticBanner } from "@/components/ui/SyntheticBanner";
import { ArrowIcon } from "@/components/ui/icons";

const demo = seed[0]; // Unit Contoh 01: Unconfirmed, 3 silent cycles, never contacted (docs/06 example A)

const STEPS = [
  { n: 1, title: "WhatsApp message", href: `/cycles?unit=${demo.id}`, text: "Coordinator prepares the monthly reminder with a personal link for each unit." },
  { n: 2, title: "1-tap check-in", href: `/c/${demo.token}`, text: "Manager opens the link on a basic phone and taps Operating, Paused or Closed." },
  { n: 3, title: "Priority dashboard", href: "/dashboard", text: "Coordinator sees 30 simulated units ranked by a transparent, non-AI score." },
  { n: 4, title: "Record the visit", href: `/units/${demo.id}`, text: "Verified status is saved and shown back to the manager (closes the loop)." },
];

const STATUS: { item: string; state: "Works (simulated)" | "Library + tests" | "Planned" }[] = [
  { item: "4-screen clickable flow, state kept in this browser", state: "Works (simulated)" },
  { item: "Four unit statuses, undo within 10 minutes, two-step Closed", state: "Works (simulated)" },
  { item: "Visit-priority ranking (src/lib/ranking)", state: "Library + tests" },
  { item: "Token generation/hash, wa.me link builder, rate limiter", state: "Library + tests" },
  { item: "Database, real login, server endpoints, automatic cycle rollover", state: "Planned" },
  { item: "Real WhatsApp sending (fake numbers in demo)", state: "Planned" },
];

export default function Home() {
  return (
    <>
      <SyntheticBanner />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">STACK 2026 · Case 2: Stronger Communities and Everyday Services</p>
        <h1 className="mt-2 text-4xl font-extrabold leading-tight md:text-5xl">Pilah &amp; Kunjung</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          A lightweight activity check-in for Semarang’s waste banks. Managers tap one button a month; coordinators see which units are
          active, paused or silent — and who to visit first. Pilot: Kecamatan Gunungpati.
        </p>

        <h2 className="mt-10 text-xl font-bold">Try the clickable flow</h2>
        <ol className="mt-3 grid gap-3 md:grid-cols-2">
          {STEPS.map((s) => (
            <li key={s.n}>
              <Link href={s.href} className="group flex h-full gap-4 rounded-2xl border border-line bg-white p-4 hover:border-brand hover:bg-brand-soft/50">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand font-extrabold text-white">{s.n}</span>
                <span>
                  <span className="flex items-center gap-1 font-bold">{s.title} <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                  <span className="mt-0.5 block text-sm text-muted">{s.text}</span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-muted">
          Tip: open step 2 in a second tab (phone width) and watch the dashboard update. Use “Reset demo data” in the top bar to start over.
        </p>

        <h2 className="mt-10 text-xl font-bold">What this prototype is — and is not</h2>
        <ul className="mt-3 divide-y divide-line rounded-2xl border border-line bg-white">
          {STATUS.map((r) => (
            <li key={r.item} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <span>{r.item}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.state === "Planned" ? "bg-cl-bg text-cl" : r.state === "Library + tests" ? "bg-brand-soft text-brand" : "bg-op-bg text-op"}`}>{r.state}</span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          All units, names and timestamps are synthetic, made by the team. No AI/ML runs inside the product; no resident personal data is stored.
          RumaSynapse Corp.
        </p>
        <p className="mt-2 text-sm"><Link href="/login" className="font-semibold text-brand underline underline-offset-2">Coordinator login (demo)</Link></p>
      </main>
    </>
  );
}
