"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

const LINKS = [
  { href: "/cycles", label: "Messages" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const path = usePathname();
  const { reset } = useDemo();
  const [confirm, setConfirm] = useState(false);

  return (
    <header className="border-b border-line bg-brand text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="text-lg font-extrabold tracking-tight">
          Pilah &amp; Kunjung
        </Link>
        <nav aria-label="Main" className="flex flex-1 flex-wrap gap-1">
          {LINKS.map((l) => {
            const active = path === l.href || (l.href === "/dashboard" && path.startsWith("/units"));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${active ? "bg-white text-brand" : "hover:bg-white/15"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <span className="hidden text-xs text-white/80 sm:inline">Kec. Gunungpati · demo coordinator</span>
        <button
          type="button"
          onClick={() => setConfirm(true)}
          className="rounded-lg border border-white/40 px-3 py-1.5 text-xs font-semibold hover:bg-white/15"
        >
          Reset demo data
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Reset demo data?"
        body="All check-ins, visits and message drafts made in this browser will be erased and the 30 simulated units restored."
        confirmLabel="Reset"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={() => { reset(); setConfirm(false); }}
      />
    </header>
  );
}
