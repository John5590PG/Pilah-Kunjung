"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { advanceCycle, markDraftSent } from "@/lib/demo/state";
import { buildCheckinUrl, buildReminderMessage, buildWaLink, periodLabelId } from "@/lib/whatsapp/build-link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageSkeleton } from "@/components/ui/EmptyState";
import { ArrowIcon, SendIcon } from "@/components/ui/icons";
import { dateTimeEn } from "@/lib/format";

export function CyclesClient() {
  const { state, update } = useDemo();
  const params = useSearchParams();
  const [picked, setPicked] = useState<string | null>(null);
  const [confirmRoll, setConfirmRoll] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!state) return <PageSkeleton />;

  const candidates = state.units.filter((u) => u.status !== "CLOSED");
  const selId = picked ?? params.get("unit") ?? candidates[0]?.id;
  const unit = state.units.find((u) => u.id === selId) ?? candidates[0];
  const base = window.location.origin;
  const url = unit ? buildCheckinUrl(base, unit.token) : "";
  const text = unit ? buildReminderMessage({ unitName: unit.name, period: state.cycle, url }) : "";
  const waLink = unit ? buildWaLink(unit.contact, text) : "";
  const sentCount = candidates.filter((u) => u.draftSentAt).length;

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand">Screen 1 · Monthly check-in message</p>
          <h1 className="text-3xl font-extrabold">Cycle {periodLabelId(state.cycle)}</h1>
          <p className="text-muted">
            Auto-prepared WhatsApp drafts with a personal link for each unit — {sentCount}/{candidates.length} marked sent.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setConfirmRoll(true)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold hover:bg-brand-soft"
        >
          Demo: simulate cutoff &amp; open next cycle
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section aria-label="Units" className="rounded-2xl border border-line bg-white">
          <ul className="max-h-[640px] divide-y divide-line overflow-auto">
            {candidates.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  onClick={() => setPicked(u.id)}
                  aria-current={u.id === unit?.id}
                  className={`flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left hover:bg-brand-soft/60 ${
                    u.id === unit?.id ? "bg-brand-soft" : ""
                  }`}
                >
                  <span>
                    <span className="block font-semibold">{u.name}</span>
                    <span className="text-xs text-muted">{u.kelurahan}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <StatusBadge status={u.status} />
                    <span className={`text-xs font-semibold ${u.draftSentAt ? "text-op" : "text-muted"}`}>
                      {u.draftSentAt ? "Sent ✓" : "Draft ready"}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {unit && (
          <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start" aria-label="Message preview">
            <div className="mx-auto w-[320px] overflow-hidden rounded-[2rem] border-[7px] border-ink bg-[#ece6da] shadow-xl">
              <div className="bg-brand px-4 py-3 text-sm font-semibold text-white">
                {unit.name} — manager
                <span className="block text-[11px] font-normal opacity-80">message preview (simulated)</span>
              </div>
              <div className="min-h-[300px] space-y-2 p-3 text-[13px] leading-relaxed">
                <div className="ml-auto max-w-[92%] rounded-xl rounded-tr-sm bg-[#d6ecd2] p-3 shadow-sm">
                  <p>Halo, pengurus {unit.name}.</p>
                  <p className="mt-2">
                    Pengingat bulan {periodLabelId(state.cycle)}: mohon ketuk satu tombol untuk memberi tahu kondisi bank sampah bulan ini (tanpa login, kurang dari 10 detik).
                  </p>
                  <p className="mt-2">
                    <a href={`/c/${unit.token}`} target="_blank" rel="noreferrer" className="break-all text-blue-700 underline">
                      {url}
                    </a>
                  </p>
                  <p className="mt-2">Terima kasih. — Korcam Gunungpati</p>
                  <p className="mt-1 text-right text-[10px] text-muted">{unit.draftSentAt ? "Terkirim ✓✓" : "draf"}</p>
                </div>
              </div>
              <p className="bg-amber-100 px-3 py-1.5 text-center text-[11px] font-semibold text-amber-950">
                Prototype mockup (simulated data)
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-white p-4 text-sm">
              <button
                type="button"
                onClick={() => update((s) => markDraftSent(s, unit.id, new Date()))}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3 font-bold text-white hover:bg-teal-950"
              >
                <SendIcon className="h-5 w-5" /> Send via WhatsApp (simulated)
              </button>
              {unit.draftSentAt && <p className="mt-2 text-op">Marked as sent {dateTimeEn(unit.draftSentAt)}</p>}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  href={`/c/${unit.token}`}
                  target="_blank"
                  className="flex items-center justify-center gap-1 rounded-lg border border-line px-3 py-2 font-semibold hover:bg-brand-soft"
                >
                  Open manager’s link <ArrowIcon className="h-4 w-4" />
                </Link>
                <button type="button" onClick={copy} className="rounded-lg border border-line px-3 py-2 font-semibold hover:bg-brand-soft">
                  {copied ? "Copied ✓" : "Copy link"}
                </button>
              </div>
              <details className="mt-3 text-xs text-muted">
                <summary className="cursor-pointer font-semibold">What the real button will open (planned)</summary>
                <code className="mt-1 block break-all rounded bg-paper p-2">{waLink}</code>
                <p className="mt-1">Prototype numbers are fake, so nothing is actually sent.</p>
              </details>
            </div>
          </aside>
        )}
      </div>

      <ConfirmDialog
        open={confirmRoll}
        title="Simulate cutoff and next cycle?"
        body="Units that did not check in this cycle become Unconfirmed (+1 silent cycle) and the cycle moves to next month. Demo only — automatic rollover is planned."
        confirmLabel="Simulate"
        onCancel={() => setConfirmRoll(false)}
        onConfirm={() => { update(advanceCycle); setConfirmRoll(false); }}
      />
    </div>
  );
}
