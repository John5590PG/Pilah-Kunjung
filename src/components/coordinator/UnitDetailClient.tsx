"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAppData } from "@/lib/appdata/provider";
import { breakdown, rankUnits } from "@/lib/ranking";
import { STATUS_DEFINITION, STATUS_EN, type ContactMode, type ReportedStatus } from "@/lib/status";
import { dateTimeEn, monthsEn } from "@/lib/format";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState, PageSkeleton } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Phone,
  Footprints,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

const VERIFIED: ReportedStatus[] = ["OPERATING", "PAUSED", "CLOSED"];

export function UnitDetailClient() {
  const { id } = useParams<{ id: string }>();
  const { state, config, mode: dataMode, actions, busy, error } = useAppData();
  const [mode, setMode] = useState<ContactMode>("CALL");
  const [status, setStatus] = useState<ReportedStatus>("OPERATING");
  const [note, setNote] = useState("");
  const [confirmClose, setConfirmClose] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  if (!state) return <PageSkeleton />;
  const unit = state.units.find((u) => u.id === id);
  if (!unit) return <EmptyState title="Unit not found" hint="Kembali ke dasbor prioritas." />;

  const cfg = config;
  const b = breakdown(unit, cfg);
  const ranked = rankUnits(state.units, cfg);
  const me = ranked.find((r) => r.id === unit.id);
  const signals = state.signals.filter((s) => s.unitId === unit.id).slice().reverse();
  const visits = state.visits.filter((v) => v.unitId === unit.id).slice().reverse();

  const save = async () => {
    await actions.recordVisit(unit.id, { mode, verifiedStatus: status, note });
    setSaved(`${mode === "CALL" ? "Panggilan telepon" : "Kunjungan lapangan"} berhasil dicatat. Unit kini ${STATUS_EN[status]}.`);
    setNote("");
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "CLOSED") setConfirmClose(true); // two-step confirm for archiving
    else void save();
  };

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-fib3 border border-un/40 bg-un-bg px-3 py-2 text-sm font-semibold text-un">
          {error}
        </p>
      )}
      {/* Back button & Breadcrumb */}
      <div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-fib2 px-1.5 -mx-1.5 text-xs font-semibold text-brand underline-offset-4 transition-colors hover:bg-green-dark hover:text-white hover:no-underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Dasbor Prioritas</span>
        </Link>
        <p className="mt-2 text-xs font-bold uppercase tracking-wider text-brand">
          Layar 4 · Catat Kontak &amp; Kunjungan Lapangan
        </p>
      </div>

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink">{unit.name}</h1>
          <p className="text-sm text-muted">
            Kelurahan {unit.kelurahan} · Kontak pengurus: <span className="font-mono">{unit.contact}</span>{" "}
            <span className="text-xs text-muted/70">(nomor sintetis)</span>
          </p>
        </div>
        <StatusBadge status={unit.status} large />
      </div>

      {/* 2 Columns: Priority Score Breakdown & Record Form */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Card: Priority & Info */}
        <Card className="rounded-fib5 border-line bg-white shadow-2xs transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-ink">Skor &amp; Prioritas Kunjungan</CardTitle>
              {me && (
                <Badge variant="outline" className="border-brand/30 bg-brand-soft/50 text-brand font-bold text-xs">
                  Peringkat #{me.rank} dari {ranked.length} unit
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {b && me ? (
              <div className="rounded-fib4 border border-line bg-paper/60 p-4 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-ink tabular-nums">{b.total}</span>
                  <span className="text-xs text-muted font-medium">poin prioritas</span>
                </div>
                <div className="font-mono text-xs bg-white px-2.5 py-1.5 rounded-fib2 border border-line text-ink">
                  {cfg.wSilent}×{unit.silentCycles} (siklus) + {b.status} (status) + {b.visitBonus} (bonus) = <b>{b.total}</b>
                </div>
                <p className="text-[11px] text-muted">
                  Rumus: bobot siklus diam ({cfg.wSilent}×M) + bobot status saat ini (W) + penalti jeda kontak (B).
                </p>
              </div>
            ) : (
              <div className="rounded-fib4 border border-line bg-paper/40 p-4 text-sm text-muted">
                Unit berstatus <b>Closed</b> dikecualikan dari daftar kunjungan aktif.
              </div>
            )}

            <dl className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-line/60">
              <div className="bg-paper/30 p-2.5 rounded-fib3 border border-line/50">
                <dt className="text-muted">Siklus Diam (Tanpa Laporan)</dt>
                <dd className="font-bold text-sm text-ink mt-0.5">{unit.silentCycles} bulan</dd>
              </div>
              <div className="bg-paper/30 p-2.5 rounded-fib3 border border-line/50">
                <dt className="text-muted">Terakhir Dikontak</dt>
                <dd className="font-bold text-sm text-ink mt-0.5">{monthsEn(unit.monthsSinceContact)}</dd>
              </div>
              <div className="bg-paper/30 p-2.5 rounded-fib3 border border-line/50">
                <dt className="text-muted">Laporan Terakhir</dt>
                <dd className="font-bold text-sm text-ink mt-0.5">
                  {unit.lastSignalAt ? dateTimeEn(unit.lastSignalAt) : "Belum pernah"}
                </dd>
              </div>
              <div className="bg-paper/30 p-2.5 rounded-fib3 border border-line/50 flex flex-col justify-between">
                <dt className="text-muted">Tautan Khusus Pengurus</dt>
                <dd className="mt-0.5">
                  <Link
                    href={`/c/${unit.token}`}
                    target="_blank"
                    className="font-bold text-brand hover:underline inline-flex items-center gap-1"
                  >
                    <span>Buka Tautan</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </dd>
              </div>
            </dl>

            {/* Field Unit Physical Documentation Photo */}
            <div className="pt-2">
              <div className="relative aspect-[16/7] overflow-hidden rounded-fib3 border border-line bg-zinc-100 shadow-2xs group">
                <img
                  src="/images/unit-fisik-bank-sampah.jpg"
                  alt={`Fasilitas fisik bank sampah ${unit.name}`}
                  className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute bottom-2 left-2 bg-spruce/85 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-sm tracking-wider uppercase">
                  Titik Kumpul: Kelurahan {unit.kelurahan}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Card: Record Contact / Visit Form */}
        <Card className="border-line bg-white shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-ink flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span>Formulir Verifikasi Hasil Kunjungan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              {/* Mode Selection */}
              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">Metode Verifikasi:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("CALL")}
                    className={`flex items-center justify-center gap-2 rounded-fib4 border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                      mode === "CALL"
                        ? "border-green-mid bg-green-mid text-white ring-2 ring-brand/30 hover:bg-green-dark hover:border-green-dark"
                        : "border-line bg-white text-muted hover:bg-green-dark hover:text-white hover:border-green-dark"
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    <span>Panggilan Telepon</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("VISIT")}
                    className={`flex items-center justify-center gap-2 rounded-fib4 border p-2.5 text-xs font-bold transition-all cursor-pointer ${
                      mode === "VISIT"
                        ? "border-green-mid bg-green-mid text-white ring-2 ring-brand/30 hover:bg-green-dark hover:border-green-dark"
                        : "border-line bg-white text-muted hover:bg-green-dark hover:text-white hover:border-green-dark"
                    }`}
                  >
                    <Footprints className="h-4 w-4" />
                    <span>Kunjungan Lapangan</span>
                  </button>
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">Status Hasil Verifikasi:</label>
                <div className="space-y-1.5">
                  {VERIFIED.map((s) => {
                    const isSelected = status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`group/status flex w-full items-start gap-3 rounded-fib4 border p-2.5 text-left transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? "border-green-mid bg-brand-soft/40 ring-1 ring-brand/30 hover:bg-green-dark hover:border-green-dark"
                            : "border-line bg-white hover:bg-green-dark hover:border-green-dark"
                        }`}
                      >
                        <span className={`mt-0.5 h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? "border-green-mid bg-green-mid text-white" : "border-line bg-white"
                        } group-hover/status:border-white/60 group-hover/status:bg-white/15`}>
                          {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                        </span>
                        <div>
                          <b className="text-xs font-bold text-ink transition-colors group-hover/status:text-white">{STATUS_EN[s]}</b>
                          <span className="block text-[11px] text-muted leading-tight mt-0.5 transition-colors group-hover/status:text-green-pale">
                            {STATUS_DEFINITION[s]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Note Input */}
              <div>
                <label className="text-xs font-bold text-ink block mb-1" htmlFor="note">
                  Catatan Tindak Lanjut (Ditampilkan ke Pengurus):
                </label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={280}
                  rows={2}
                  placeholder="Misal: Pengurus baru dilantik, timbangan aktif kembali bulan depan"
                  className="w-full rounded-fib4 border border-line bg-white/90 p-2.5 text-xs focus:outline-brand text-ink hover:border-brand/60 focus-visible:border-brand transition-colors"
                />
                <p className="text-right text-[10px] text-muted mt-0.5">
                  {note.length}/280 karakter · Jangan mencantumkan nama warga atau NIK
                </p>
              </div>

              <Button
                type="submit"
                className="w-full rounded-fib3 bg-green-mid text-white hover:bg-green-dark font-bold h-10 shadow-xs cursor-pointer transition-all duration-200 hover:-translate-y-[3px]"
              >
                Simpan Hasil Verifikasi
              </Button>

              {saved && (
                <div role="status" className="rounded-fib4 border border-op/30 bg-op-bg p-3 text-xs text-op flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <b>{saved}</b> Pengurus kini dapat melihat catatan ini di bagian "Tindak lanjut".{" "}
                    <Link href={`/c/${unit.token}`} target="_blank" className="font-bold underline underline-offset-2">
                      Lihat tampilan pengurus ↗
                    </Link>
                  </div>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timelines */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-fib5 border-line bg-white shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-ink">Riwayat Sinyal Check-In Pengurus</CardTitle>
          </CardHeader>
          <CardContent>
            {signals.length === 0 ? (
              <p className="text-xs text-muted">
                {dataMode === "api"
                  ? "Belum ada sinyal check-in yang dicatat pada siklus berjalan."
                  : "Belum ada sinyal check-in yang dicatat pada sesi demo ini."}
              </p>
            ) : (
              <ul className="divide-y divide-line text-xs">
                {signals.map((s) => (
                  <li key={s.id} className="wa-row -mx-2 px-2 rounded-fib3 flex flex-wrap items-center justify-between gap-2 py-2.5">
                    <span className="text-muted">{dateTimeEn(s.at)} · Pengurus</span>
                    <div className="flex items-center gap-2">
                      {s.undoneAt && <span className="row-chip text-[10px] italic text-un bg-un-bg px-1.5 py-0.5 rounded-fib1">Dibatalkan</span>}
                      <StatusBadge status={s.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-fib5 border-line bg-white shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-ink">Riwayat Konfirmasi Kunjungan Petugas</CardTitle>
          </CardHeader>
          <CardContent>
            {visits.length === 0 ? (
              <p className="text-xs text-muted">
                {dataMode === "api"
                  ? "Belum ada riwayat kontak/kunjungan yang dicatat di basis data."
                  : "Belum ada riwayat kontak/kunjungan yang dicatat pada sesi demo ini."}
              </p>
            ) : (
              <ul className="divide-y divide-line text-xs">
                {visits.map((v) => (
                  <li key={v.id} className="wa-row -mx-2 px-2 rounded-fib3 py-2.5 space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-ink">
                        {dateTimeEn(v.at)} · {v.mode === "CALL" ? "Panggilan Telepon" : "Kunjungan Lapangan"}
                      </span>
                      <StatusBadge status={v.verifiedStatus} />
                    </div>
                    {v.note && (
                      <p className="text-xs text-muted bg-paper/60 p-2 rounded-fib2 italic">
                        "{v.note}"
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Dialog for Archiving/Closing */}
      <Dialog open={confirmClose} onOpenChange={setConfirmClose}>
        <DialogContent className="sm:max-w-md rounded-fib5 bg-paper border-line text-ink shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-un">
              <AlertTriangle className="h-5 w-5" />
              <span>Arsipkan &amp; Tutup Bank Sampah?</span>
            </DialogTitle>
            <DialogDescription className="text-muted text-sm pt-2">
              Unit yang berstatus <b>Closed</b> akan diarsipkan dari daftar kunjungan aktif dan tidak lagi masuk dalam penghitungan prioritas. Pastikan Anda telah mengonfirmasi penutupan ini langsung dengan pengurus unit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setConfirmClose(false)} className="border-line rounded-fib3 hover:bg-green-dark hover:text-white hover:border-green-dark">
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={busy}
              onClick={() => {
                setConfirmClose(false);
                void save();
              }}
              className="bg-un text-white rounded-fib3 hover:bg-ink disabled:opacity-60"
            >
              Ya, Arsipkan Unit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
