"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAppData } from "@/lib/appdata/provider";
import {
  canUndo, findByToken, latestActiveSignal, latestVisit, UNDO_WINDOW_MS, type DemoSignal,
} from "@/lib/demo/state";
import { periodLabelId } from "@/lib/whatsapp/build-link";
import { dateId, timeId } from "@/lib/format";
import { STATUS_ID, type ReportedStatus } from "@/lib/status";
import { StatusBadge } from "@/components/common/StatusBadge";
import { CheckIcon, PauseIcon, XIcon } from "@/components/common/icons";
import { PageSkeleton } from "@/components/common/EmptyState";
import { BigChoiceButton } from "./BigChoiceButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, CheckCircle2, Shield, AlertCircle } from "lucide-react";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-dvh max-w-md bg-paper text-[18px] leading-relaxed shadow-lg border-x border-line/40">
      <div className="bg-amber-100/90 border-b border-amber-200 px-4 py-2 text-xs text-amber-950 flex items-center justify-between">
        <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-900 text-amber-50 px-2 py-0.5 rounded">
          Data Sintetis
        </span>
        <span className="text-muted">Prototipe Simulasi Lomba</span>
      </div>
      <div className="px-5 pb-12 pt-6">{children}</div>
    </main>
  );
}

export function CheckinClient() {
  const params = useParams<{ token: string }>();
  const token = decodeURIComponent(params.token ?? "");
  const { state, mode, actions, busy, error, tokenView } = useAppData(token);
  const [now, setNow] = useState(() => new Date());
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);

  if (!state || (mode === "api" && tokenView === undefined)) return <Shell><PageSkeleton /></Shell>;

  // Same neutral page for wrong / expired / revoked links (docs/01 §D).
  // API mode finds the unit by the id returned from the hashed-token lookup;
  // the demo keeps matching the deterministic seed token locally.
  const unit =
    mode === "api"
      ? tokenView
        ? state.units.find((u) => u.id === tokenView.id)
        : undefined
      : findByToken(state, token);
  if (!unit) {
    return (
      <Shell>
        <div className="rounded-fib5 border border-line bg-white p-6 text-center space-y-3">
          <AlertCircle className="h-10 w-10 text-un mx-auto" />
          <h1 className="text-xl font-black text-ink">Tautan Tidak Berlaku</h1>
          <p className="text-sm text-muted">
            Tautan check-in ini tidak dapat dipakai. Silakan hubungi koordinator kecamatan untuk meminta tautan baru via WhatsApp.
          </p>
        </div>
      </Shell>
    );
  }

  const apiSignal: DemoSignal | undefined =
    mode === "api" && tokenView?.signalAt && tokenView.cycle === state.cycle
      ? {
          id: "api-signal",
          unitId: unit.id,
          cycle: state.cycle,
          status: tokenView.status as ReportedStatus,
          at: tokenView.signalAt,
          undoneAt: null,
          before: {
            status: unit.status,
            silentCycles: unit.silentCycles,
            lastSignalAt: unit.lastSignalAt,
            signaledThisCycle: unit.signaledThisCycle,
          },
        }
      : undefined;

  const signal = mode === "api" ? apiSignal : latestActiveSignal(state, unit.id);
  const thisCycleSignal = signal && signal.cycle === state.cycle ? signal : undefined;
  const undoable = canUndo(thisCycleSignal, now);
  const undoUntil = thisCycleSignal ? new Date(Date.parse(thisCycleSignal.at) + UNDO_WINDOW_MS) : null;
  const apiVisit = mode === "api" && tokenView?.visit
    ? {
        id: "api-visit",
        unitId: unit.id,
        mode: tokenView.visit.mode,
        verifiedStatus: tokenView.visit.verifiedStatus as DemoSignal["status"],
        note: tokenView.visit.note ?? "",
        at: tokenView.visit.at,
      }
    : undefined;
  const visit = mode === "api" ? apiVisit : latestVisit(state, unit.id);
  const showChoices = !thisCycleSignal || changing;

  const choose = async (status: ReportedStatus) => {
    try {
      await actions.checkIn(token, status);
      setChanging(false);
    } catch {
      // Error is displayed in the banner above.
    }
  };

  const undo = async () => {
    try {
      await actions.undo(token);
    } catch {
      // Error is displayed in the banner above.
    }
  };

  return (
    <Shell>
      {error && (
        <p role="alert" className="mb-4 rounded-fib3 border border-un/40 bg-un-bg px-3 py-2 text-sm font-semibold text-un">
          {error}
        </p>
      )}
      {/* Header Info */}
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">Pilah &amp; Kunjung</p>
        <h1 className="text-2xl font-black tracking-tight text-ink leading-tight">{unit.name}</h1>
        <p className="text-sm text-muted font-medium">{unit.kelurahan}</p>
      </div>

      <section className="mt-6" aria-labelledby="q">
        <h2 id="q" className="text-lg font-bold text-ink leading-snug">
          Bagaimana kondisi aktivitas bank sampah bulan ini?
        </h2>
        <p className="text-xs text-muted font-medium mt-0.5">
          Periode Laporan: <b>{periodLabelId(state.cycle)}</b>
        </p>

        {thisCycleSignal && (
          <div className="mt-4 rounded-fib5 border-2 border-op/80 bg-op-bg/80 p-5 shadow-xs" role="status">
            <p className="flex items-center gap-2 text-xl font-black text-op">
              <CheckCircle2 className="h-6 w-6" /> Terima kasih!
            </p>
            <p className="mt-1 text-sm text-ink leading-normal">
              Status yang Anda laporkan bulan ini: <b className="text-op font-bold text-base">{STATUS_ID[thisCycleSignal.status]}</b>
            </p>
            {undoable && undoUntil && (
              <div className="mt-4 flex flex-wrap items-center gap-3 pt-3 border-t border-op/20">
                <Button
                  type="button"
                  variant="outline"
                  disabled={busy}
                  onClick={() => void undo()}
                  className="h-11 rounded-fib3 border-2 border-ink bg-white px-4 text-sm font-bold text-ink hover:bg-ink hover:text-white cursor-pointer shadow-xs gap-1.5 transition-all duration-200 disabled:opacity-60"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Batalkan</span>
                </Button>
                <span className="text-xs text-muted font-medium">
                  Bisa dibatalkan sampai pukul {timeId(undoUntil)}
                </span>
              </div>
            )}
            {!changing && (
              <button
                type="button"
                onClick={() => setChanging(true)}
                className="mt-3 block rounded-fib2 px-1.5 -mx-1.5 text-xs font-bold text-brand underline-offset-4 cursor-pointer transition-colors hover:bg-green-dark hover:text-white hover:no-underline"
              >
                Salah pencet? Ketuk untuk ubah jawaban
              </button>
            )}
          </div>
        )}

        {showChoices && (
          <div className="mt-4 space-y-3">
            <BigChoiceButton
              tone="OPERATING"
              icon={<CheckIcon className="h-6 w-6 text-op" />}
              label="Beroperasi"
              hint="Bulan ini aktif melayani nasabah & penimbangan"
              selected={thisCycleSignal?.status === "OPERATING"}
              onClick={() => choose("OPERATING")}
            />
            <BigChoiceButton
              tone="PAUSED"
              icon={<PauseIcon className="h-6 w-6 text-pa" />}
              label="Dijeda"
              hint="Libur atau berhenti sementara, berencana aktif lagi"
              selected={thisCycleSignal?.status === "PAUSED"}
              onClick={() => choose("PAUSED")}
            />
            <BigChoiceButton
              tone="CLOSED"
              icon={<XIcon className="h-6 w-6 text-cl" />}
              label="Tutup"
              hint="Sudah berhenti beroperasi sepenuhnya"
              selected={thisCycleSignal?.status === "CLOSED"}
              onClick={() => choose("CLOSED")}
            />
          </div>
        )}
      </section>

      {/* Follow-up Note from Coordinator Card */}
      <Card className="mt-8 rounded-fib5 border-line bg-white shadow-2xs transition-shadow duration-200 hover:shadow-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-line/60 pb-2.5">
            <h2 className="text-sm font-bold text-ink">Catatan dari Koordinator Kecamatan</h2>
            <StatusBadge status={unit.status} lang="id" />
          </div>

          {visit ? (
            <div className="text-xs space-y-1.5 text-ink leading-relaxed">
              <p className="text-muted">
                <b>{dateId(visit.at)}</b>: Koordinator telah {visit.mode === "CALL" ? "menghubungi lewat telepon" : "mengunjungi lokasi unit"}.
              </p>
              <p>
                Status terverifikasi: <b className="text-ink">{STATUS_ID[visit.verifiedStatus]}</b>
              </p>
              {visit.note && (
                <div className="mt-2 rounded-lg bg-paper p-2.5 text-xs text-ink font-medium italic border border-line/60">
                  "{visit.note}"
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted">
              Belum ada catatan tindak lanjut dari petugas lapangan pada siklus ini.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 pt-4 border-t border-line/60 flex items-center justify-center gap-1.5 text-xs text-muted">
        <Shield className="h-3.5 w-3.5 text-brand" />
        <span>Hanya status unit yang dicatat. Tanpa data nasabah atau NIK.</span>
      </div>
    </Shell>
  );
}
