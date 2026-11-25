"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useDemo } from "@/lib/demo/store";
import { recordVisit } from "@/lib/demo/state";
import { DEFAULT_CONFIG, breakdown, rankUnits } from "@/lib/ranking";
import { STATUS_DEFINITION, STATUS_EN, type ContactMode, type ReportedStatus } from "@/lib/status";
import { dateTimeEn, monthsEn } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState, PageSkeleton } from "@/components/ui/EmptyState";
import { PhoneIcon, WalkIcon } from "@/components/ui/icons";

const VERIFIED: ReportedStatus[] = ["OPERATING", "PAUSED", "CLOSED"];

export function UnitDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { state, update } = useDemo();
  const [mode, setMode] = useState<ContactMode>("CALL");
  const [status, setStatus] = useState<ReportedStatus>("OPERATING");
  const [note, setNote] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  if (!state) return <PageSkeleton />;
  const unit = state.units.find((u) => u.id === id);
  if (!unit) return <EmptyState title="Unit not found" hint="Go back to the dashboard." />;

  const cfg = DEFAULT_CONFIG;
  const b = breakdown(unit, cfg);
  const ranked = rankUnits(state.units, cfg);
  const me = ranked.find((r) => r.id === unit.id);
  const signals = state.signals.filter((s) => s.unitId === unit.id).slice().reverse();
  const visits = state.visits.filter((v) => v.unitId === unit.id).slice().reverse();

  const save = () => {
    update((s) => recordVisit(s, unit.id, { mode, verifiedStatus: status, note }, new Date()));
    setSaved(`${mode === "CALL" ? "Call" : "Visit"} recorded — unit is now ${STATUS_EN[status]}.`);
    setNote("");
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "CLOSED") setConfirmClose(true); // two-step confirm for archiving
    else save();
  };

  return (
    <div>
      <Link href="/dashboard" className="text-sm font-semibold text-brand underline underline-offset-2">← Back to dashboard</Link>
      <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-brand">Screen 4 · Record contact / visit</p>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">{unit.name}</h1>
          <p className="text-muted">{unit.kelurahan} · contact {unit.contact} <span className="text-xs">(fake number)</span></p>
        </div>
        <StatusBadge status={unit.status} />
      </div>

      <div className="mt-5 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-4" aria-labelledby="pri">
          <h2 id="pri" className="font-bold">Priority</h2>
          {b && me ? (
            <>
              <p className="mt-1 text-4xl font-extrabold tabular-nums">{b.total}<span className="ml-2 text-base font-semibold text-muted">rank {me.rank} of {ranked.length}</span></p>
              <p className="mt-2 font-mono text-sm">{cfg.wSilent}×{unit.silentCycles} + {b.status} + {b.visitBonus} = {b.total}</p>
              <p className="text-xs text-muted">silent cycles ×{cfg.wSilent} + status weight + no-contact bonus</p>
            </>
          ) : (
            <p className="mt-1 text-muted">Closed — excluded from the active visit list.</p>
          )}
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div><dt className="text-muted">Silent cycles</dt><dd className="font-semibold">{unit.silentCycles}</dd></div>
            <div><dt className="text-muted">Last contact</dt><dd className="font-semibold">{monthsEn(unit.monthsSinceContact)}</dd></div>
            <div><dt className="text-muted">Last signal</dt><dd className="font-semibold">{unit.lastSignalAt ? dateTimeEn(unit.lastSignalAt) : "Never"}</dd></div>
            <div><dt className="text-muted">Manager link</dt><dd><Link href={`/c/${unit.token}`} target="_blank" className="font-semibold text-brand underline underline-offset-2">Open as manager ↗</Link></dd></div>
          </dl>
          <button type="button" disabled className="mt-3 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted" title="Planned">
            Revoke / rotate link (planned)
          </button>
        </section>

        <form onSubmit={submit} className="rounded-2xl border border-line bg-white p-4" aria-labelledby="rec">
          <h2 id="rec" className="font-bold">Record contact or visit</h2>

          <fieldset className="mt-3">
            <legend className="text-sm font-semibold">How did you verify?</legend>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {([["CALL", "Phone call", PhoneIcon], ["VISIT", "On-site visit", WalkIcon]] as const).map(([m, label, Icon]) => (
                <label key={m} className={`flex min-h-[48px] cursor-pointer items-center gap-2 rounded-xl border-2 px-3 font-semibold ${mode === m ? "border-brand bg-brand-soft" : "border-line"}`}>
                  <input type="radio" name="mode" value={m} checked={mode === m} onChange={() => setMode(m)} className="sr-only" />
                  <Icon className="h-5 w-5" /> {label}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4">
            <legend className="text-sm font-semibold">Verified status</legend>
            <div className="mt-1 space-y-2">
              {VERIFIED.map((s) => (
                <label key={s} className={`flex min-h-[48px] cursor-pointer items-start gap-3 rounded-xl border-2 px-3 py-2 ${status === s ? "border-brand bg-brand-soft" : "border-line"}`}>
                  <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} className="mt-1.5 h-4 w-4" />
                  <span><b>{STATUS_EN[s]}</b><span className="block text-xs text-muted">{STATUS_DEFINITION[s]}</span></span>
                </label>
              ))}
            </div>
          </fieldset>

          <label className="mt-4 block text-sm font-semibold" htmlFor="note">Short note (shown to the manager)</label>
          <textarea
            id="note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={280} rows={3}
            placeholder="e.g. Pengurus baru, aktif lagi bulan depan"
            className="mt-1 w-full rounded-xl border border-line p-3"
          />
          <p className="text-right text-xs text-muted">{note.length}/280 · no resident names or personal data</p>

          <button type="submit" className="mt-2 min-h-[48px] w-full rounded-xl bg-brand px-4 font-bold text-white hover:bg-teal-950">
            Save verification
          </button>

          {saved && (
            <div role="status" className="mt-3 rounded-xl bg-op-bg p-3 text-sm text-op">
              <b>{saved}</b> The manager now sees this under “Tindak lanjut”.{" "}
              <Link href={`/c/${unit.token}`} target="_blank" className="font-semibold underline underline-offset-2">See manager’s screen ↗</Link>
            </div>
          )}
        </form>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="font-bold">Check-in signals</h2>
          {signals.length === 0 ? <p className="mt-2 text-sm text-muted">No signals recorded in this demo session yet.</p> : (
            <ul className="mt-2 divide-y divide-line text-sm">
              {signals.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-2">
                  <span>{dateTimeEn(s.at)} · manager</span>
                  <span className="flex items-center gap-2">{s.undoneAt && <em className="text-xs text-muted">undone</em>}<StatusBadge status={s.status} /></span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-2xl border border-line bg-white p-4">
          <h2 className="font-bold">Visit confirmations</h2>
          {visits.length === 0 ? <p className="mt-2 text-sm text-muted">No contact recorded in this demo session yet.</p> : (
            <ul className="mt-2 divide-y divide-line text-sm">
              {visits.map((v) => (
                <li key={v.id} className="py-2">
                  <span className="flex flex-wrap items-center justify-between gap-2">
                    <span>{dateTimeEn(v.at)} · {v.mode === "CALL" ? "call" : "visit"}</span>
                    <StatusBadge status={v.verifiedStatus} />
                  </span>
                  {v.note && <span className="mt-1 block text-muted">“{v.note}”</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmClose}
        title="Close this unit?"
        body="Closed units are archived from the active visit list and no longer ranked. Make sure you have confirmed this directly with the manager."
        confirmLabel="Yes, close unit"
        danger
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => { setConfirmClose(false); save(); }}
      />
    </div>
  );
}
