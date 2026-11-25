"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useDemo } from "@/lib/demo/store";
import {
  canUndo, checkIn, findByToken, latestActiveSignal, latestVisit, undoCheckIn, UNDO_WINDOW_MS,
} from "@/lib/demo/state";
import { periodLabelId } from "@/lib/whatsapp/build-link";
import { dateId, timeId } from "@/lib/format";
import { STATUS_ID, type ReportedStatus } from "@/lib/status";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CheckIcon, PauseIcon, XIcon } from "@/components/ui/icons";
import { PageSkeleton } from "@/components/ui/EmptyState";
import { BigChoiceButton } from "./BigChoiceButton";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-dvh max-w-md bg-paper text-[18px] leading-relaxed">
      <div className="bg-amber-100 px-4 py-2 text-sm text-amber-950">
        <b className="mr-2 rounded bg-amber-900 px-1.5 py-0.5 text-[11px] text-amber-50">SIMULATED DATA</b>
        Prototype mockup — bukan data bank sampah sungguhan.
      </div>
      <div className="px-4 pb-10 pt-5">{children}</div>
    </main>
  );
}

export function CheckinClient() {
  const params = useParams<{ token: string }>();
  const token = decodeURIComponent(params.token ?? "");
  const { state, update } = useDemo();
  const [now, setNow] = useState(() => new Date());
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);

  if (!state) return <Shell><PageSkeleton /></Shell>;

  // Same neutral page for wrong / expired / revoked links (docs/01 §D).
  const unit = findByToken(state, token);
  if (!unit) {
    return (
      <Shell>
        <h1 className="text-2xl font-bold">Tautan tidak berlaku</h1>
        <p className="mt-3">Tautan ini tidak dapat dipakai. Silakan hubungi koordinator kecamatan untuk meminta tautan baru.</p>
      </Shell>
    );
  }

  const signal = latestActiveSignal(state, unit.id);
  const thisCycleSignal = signal && signal.cycle === state.cycle ? signal : undefined;
  const undoable = canUndo(thisCycleSignal, now);
  const undoUntil = thisCycleSignal ? new Date(Date.parse(thisCycleSignal.at) + UNDO_WINDOW_MS) : null;
  const visit = latestVisit(state, unit.id);
  const showChoices = !thisCycleSignal || changing;

  const choose = (status: ReportedStatus) => {
    update((s) => checkIn(s, token, status, new Date()));
    setChanging(false);
  };

  return (
    <Shell>
      <p className="text-sm font-semibold uppercase tracking-wide text-brand">Pilah &amp; Kunjung</p>
      <h1 className="mt-1 text-3xl font-extrabold leading-tight">{unit.name}</h1>
      <p className="text-muted">{unit.kelurahan}</p>

      <section className="mt-6" aria-labelledby="q">
        <h2 id="q" className="text-xl font-bold">
          Bagaimana kondisi bank sampah bulan ini?
        </h2>
        <p className="text-sm text-muted">Periode: {periodLabelId(state.cycle)}</p>

        {thisCycleSignal && (
          <div className="mt-4 rounded-2xl border-2 border-op bg-op-bg p-4" role="status">
            <p className="flex items-center gap-2 text-xl font-bold text-op">
              <CheckIcon className="h-6 w-6" /> Terima kasih!
            </p>
            <p className="mt-1">
              Status bulan ini: <b>{STATUS_ID[thisCycleSignal.status]}</b>
            </p>
            {undoable && undoUntil && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => update((s) => undoCheckIn(s, token, new Date()))}
                  className="min-h-[52px] rounded-xl border-2 border-ink bg-white px-5 text-lg font-bold"
                >
                  Batalkan
                </button>
                <span className="text-sm text-muted">Bisa dibatalkan sampai pukul {timeId(undoUntil)}</span>
              </div>
            )}
            {!changing && (
              <button type="button" onClick={() => setChanging(true)} className="mt-3 text-base font-semibold text-brand underline underline-offset-4">
                Salah pilih? Ubah jawaban
              </button>
            )}
          </div>
        )}

        {showChoices && (
          <div className="mt-4 space-y-3">
            <BigChoiceButton
              tone="OPERATING" icon={<CheckIcon className="h-6 w-6" />} label="Beroperasi"
              hint="Bulan ini masih menimbang / melayani nasabah"
              selected={thisCycleSignal?.status === "OPERATING"} onClick={() => choose("OPERATING")}
            />
            <BigChoiceButton
              tone="PAUSED" icon={<PauseIcon className="h-6 w-6" />} label="Dijeda"
              hint="Berhenti sementara, rencana aktif lagi"
              selected={thisCycleSignal?.status === "PAUSED"} onClick={() => choose("PAUSED")}
            />
            <BigChoiceButton
              tone="CLOSED" icon={<XIcon className="h-6 w-6" />} label="Tutup"
              hint="Sudah berhenti, tidak melayani lagi"
              selected={thisCycleSignal?.status === "CLOSED"} onClick={() => choose("CLOSED")}
            />
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-white p-4" aria-labelledby="fu">
        <h2 id="fu" className="text-lg font-bold">Tindak lanjut dari koordinator</h2>
        <p className="mt-1 flex items-center gap-2 text-base">
          Status unit saat ini: <StatusBadge status={unit.status} lang="id" />
        </p>
        {visit ? (
          <div className="mt-3 border-t border-line pt-3 text-base">
            <p>
              {dateId(visit.at)} — koordinator {visit.mode === "CALL" ? "menelepon" : "mengunjungi"} unit Anda.
            </p>
            <p className="mt-1">
              Status terverifikasi: <b>{STATUS_ID[visit.verifiedStatus]}</b>
            </p>
            {visit.note && <p className="mt-1 text-muted">Catatan: “{visit.note}”</p>}
          </div>
        ) : (
          <p className="mt-3 border-t border-line pt-3 text-base text-muted">Belum ada tindak lanjut dari koordinator.</p>
        )}
      </section>

      <p className="mt-6 text-sm text-muted">
        Hanya status unit yang dicatat. Tidak ada data nasabah di sini.
      </p>
    </Shell>
  );
}
