"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useAppData } from "@/lib/appdata/provider";
import { buildCheckinUrl, buildReminderMessage, buildWaLink, periodLabelId } from "@/lib/whatsapp/build-link";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DeliveryBadge } from "@/components/common/DeliveryBadge";
import { PageSkeleton } from "@/components/common/EmptyState";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Send,
  Copy,
  ExternalLink,
  Check,
  Calendar,
  MessageCircle,
  Clock,
  Wifi,
  Battery,
  Signal,
  ChevronLeft,
  Video,
  Phone,
  MoreVertical,
  Smile,
  Paperclip,
  Camera,
  Mic,
  CheckCheck,
} from "lucide-react";
import { dateTimeEn } from "@/lib/format";

export function CyclesClient() {
  const { state, actions, busy, error } = useAppData();
  const params = useSearchParams();
  const [picked, setPicked] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [confirmRoll, setConfirmRoll] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!state) return <PageSkeleton />;

  const candidates = state.units.filter((u) => u.status !== "CLOSED");
  const filteredCandidates = candidates.filter((u) =>
    u.name.toLowerCase().includes(q.trim().toLowerCase()) ||
    u.kelurahan.toLowerCase().includes(q.trim().toLowerCase())
  );

  const selId = picked ?? params.get("unit") ?? candidates[0]?.id;
  const unit = state.units.find((u) => u.id === selId) ?? candidates[0];
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const url = unit ? buildCheckinUrl(base, unit.token) : "";
  const text = unit ? buildReminderMessage({ unitName: unit.name, period: state.cycle, url }) : "";
  const waLink = unit ? buildWaLink(unit.contact, text) : "";
  const sentCount = candidates.filter((u) => u.draftSentAt).length;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <p role="alert" className="rounded-fib3 border border-un/40 bg-un-bg px-3 py-2 text-sm font-semibold text-un">
          {error}
        </p>
      )}
      {/* Top Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand">Layar 1 · Pesan Check-In Bulanan</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-ink">
            Siklus {periodLabelId(state.cycle)}
          </h1>
          <p className="text-sm text-muted">
            Draf pesan WhatsApp otomatis dengan tautan check-in unik untuk setiap bank sampah.{" "}
            <b className="text-ink">{sentCount}</b> dari <b>{candidates.length}</b> unit sudah ditandai terkirim.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setConfirmRoll(true)}
          className="border-line bg-white/80 hover:bg-green-dark hover:text-white hover:border-green-dark text-ink font-semibold gap-2 shadow-2xs rounded-fib3 transition-all duration-200"
        >
          <Calendar className="h-4 w-4 text-brand group-hover/button:text-white transition-colors" />
          <span>Simulasi Tutup Buku &amp; Buka Siklus Baru</span>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_390px]">
        {/* Left Column: Units List */}
        <section aria-label="Units" className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari unit atau kelurahan…"
              className="pl-9 h-10 bg-white/85 border-line text-sm rounded-fib3 hover:border-brand/60 focus-visible:border-brand transition-colors"
            />
          </div>

          <Card className="rounded-fib4 border-line bg-white overflow-hidden shadow-2xs">
            <ul className="max-h-[660px] divide-y divide-line overflow-auto">
              {filteredCandidates.map((u) => {
                const isSelected = u.id === unit?.id;
                return (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => setPicked(u.id)}
                      aria-current={isSelected}
                      className={`wa-row flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3.5 text-left cursor-pointer ${
                        isSelected
                          ? "bg-brand-soft/70 border-l-4 border-l-brand"
                          : "border-l-4 border-l-transparent"
                      }`}
                    >
                      <div>
                        <span className="block font-bold text-sm text-ink">{u.name}</span>
                        <span className="text-xs text-muted">{u.kelurahan}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={u.status} />
                        <DeliveryBadge sent={!!u.draftSentAt} compact />
                      </div>
                    </button>
                  </li>
                );
              })}
              {filteredCandidates.length === 0 && (
                <li className="p-6 text-center text-sm text-muted">
                  Tidak ada unit yang sesuai kata kunci.
                </li>
              )}
            </ul>
          </Card>
        </section>

        {/* Right Column: Realistic Smartphone WhatsApp Preview */}
        {unit && (
          <aside className="space-y-4 lg:sticky lg:top-18 lg:self-start" aria-label="Message preview">
            {/* Realistic iPhone Chassis — 9:19.5 hardware aspect ratio */}
            <div className="relative mx-auto w-full max-w-[310px] select-none">
              {/* Hardware Side Buttons (left: mute + volume, right: power) */}
              <div className="absolute -left-[3px] top-[15%] h-[24px] w-[3px] rounded-l-md bg-gradient-to-b from-zinc-600 via-zinc-400 to-zinc-600 shadow-sm" />
              <div className="absolute -left-[3px] top-[23%] h-[44px] w-[3px] rounded-l-md bg-gradient-to-b from-zinc-600 via-zinc-400 to-zinc-600 shadow-sm" />
              <div className="absolute -left-[3px] top-[32%] h-[44px] w-[3px] rounded-l-md bg-gradient-to-b from-zinc-600 via-zinc-400 to-zinc-600 shadow-sm" />
              <div className="absolute -right-[3px] top-[24%] h-[62px] w-[3px] rounded-r-md bg-gradient-to-b from-zinc-600 via-zinc-400 to-zinc-600 shadow-sm" />

              {/* Titanium rail + black bezel (two layers, like real hardware) */}
              <div className="relative aspect-[9/19.5] rounded-[58px] bg-[linear-gradient(145deg,#b8b8bd_0%,#4a4a4d_14%,#1c1c1e_50%,#4a4a4d_86%,#b8b8bd_100%)] p-[6px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)]">
                <div className="pointer-events-none absolute inset-0 rounded-[58px] ring-1 ring-white/20" />

                {/* Black glass bezel */}
                <div className="relative h-full w-full rounded-[52px] bg-black p-[4px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)]">
                  {/* Screen */}
                  <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[48px] bg-[#efeae2]">
                    {/* Dynamic Island */}
                    <div className="absolute left-1/2 top-[11px] z-30 flex h-[25px] w-[86px] -translate-x-1/2 items-center justify-end rounded-full bg-black pr-2.5 shadow-sm">
                      <span className="h-[7px] w-[7px] rounded-full bg-[#101014] ring-1 ring-zinc-800/70" />
                    </div>

                    {/* 1. iOS Status Bar + WhatsApp app bar share one green surface */}
                    <div className="relative z-10 shrink-0 bg-[#075e54] px-5 pb-1.5 pt-2 text-white">
                      {/* Status bar (time left, icons right; island sits between) */}
                      <div className="flex h-[22px] items-center justify-between text-[11px] font-semibold">
                        <span className="tracking-tight">09:41</span>
                        <div className="flex items-center gap-1.5">
                          <Signal className="h-3 w-3" />
                          <Wifi className="h-3 w-3" />
                          <Battery className="h-3.5 w-3.5" />
                        </div>
                      </div>

                      {/* WhatsApp top app bar */}
                      <div className="mt-1 flex items-center justify-between">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <ChevronLeft className="-ml-1 h-5 w-5 shrink-0 text-white/90" />
                          <div className="relative shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-xs font-bold text-white ring-1 ring-white/30">
                              {unit.name.charAt(0)}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-1 ring-white" />
                          </div>
                          <div className="min-w-0 pl-0.5">
                            <div className="truncate text-xs font-bold leading-tight">{unit.name}</div>
                            <div className="text-[10px] leading-tight text-emerald-200/90">Pengurus Unit · online</div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-3 pl-2 text-white/90">
                          <Video className="h-4 w-4" />
                          <Phone className="h-3.5 w-3.5" />
                          <MoreVertical className="h-4 w-4" />
                        </div>
                      </div>
                    </div>

                    {/* 2. Chat canvas */}
                    <div className="relative flex-1 overflow-hidden px-3 py-3">
                      {/* Faint WhatsApp doodle texture */}
                      <div
                        className="pointer-events-none absolute inset-0 opacity-[0.07]"
                        style={{
                          backgroundImage: "radial-gradient(#0b3d2e 1px, transparent 1px)",
                          backgroundSize: "18px 18px",
                        }}
                      />
                      <div className="relative flex h-full flex-col text-[13px] leading-relaxed">
                        <div className="my-1 text-center">
                          <span className="inline-block rounded-full bg-white/85 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 shadow-2xs">
                            Hari Ini
                          </span>
                        </div>

                        {/* Outgoing message bubble */}
                        <div className="ml-auto mt-2 max-w-[94%] space-y-1.5 rounded-2xl rounded-tr-xs border border-emerald-300/40 bg-[#d9fdd3] p-2.5 text-[#111b21] shadow-xs">
                          <p className="text-xs font-semibold text-emerald-950">
                            Halo, pengurus <b>{unit.name}</b>.
                          </p>
                          <p className="text-[12px] leading-relaxed text-zinc-800">
                            Pengingat bulan <b>{periodLabelId(state.cycle)}</b>: mohon ketuk satu tombol untuk konfirmasi kondisi bank sampah bulan ini (tanpa login, &lt;10 detik).
                          </p>

                          {/* WhatsApp link preview */}
                          <div className="space-y-1 rounded-lg border border-emerald-200/80 bg-white/90 p-2 shadow-2xs">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                              <MessageCircle className="h-3 w-3 text-emerald-600" />
                              <span>Pilah &amp; Kunjung Check-In</span>
                            </div>
                            <a
                              href={`/c/${unit.token}`}
                              target="_blank"
                              rel="noreferrer"
                              className="block break-all rounded-fib1 font-mono text-[10.5px] text-[#027eb5] underline underline-offset-2 transition-colors hover:bg-[#075e54] hover:text-white"
                            >
                              {url}
                            </a>
                          </div>

                          <p className="text-[11px] text-zinc-700">
                            Terima kasih, <i>Korcam Gunungpati</i>
                          </p>

                          <div className="flex items-center justify-end gap-1 pt-0.5 text-[10px] text-zinc-500">
                            <span>09:42</span>
                            <CheckCheck className="h-3.5 w-3.5 text-[#53bdeb]" />
                          </div>
                        </div>

                        <div className="flex-1" />
                      </div>
                    </div>

                    {/* 3. Bottom input bar (extra bottom padding for home indicator) */}
                    <div className="relative z-10 flex shrink-0 items-center gap-1.5 border-t border-zinc-200 bg-[#f0f2f5] px-2 pb-6 pt-2">
                      <Smile className="h-5 w-5 shrink-0 text-zinc-500" />
                      <div className="flex flex-1 items-center justify-between rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-400 shadow-2xs">
                        <span>Ketik pesan...</span>
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Paperclip className="h-3.5 w-3.5" />
                          <Camera className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white shadow-xs">
                        <Mic className="h-4 w-4" />
                      </div>
                    </div>

                    {/* Home indicator overlays the content, like a real iPhone */}
                    <div className="pointer-events-none absolute bottom-[7px] left-1/2 z-20 h-[4px] w-[104px] -translate-x-1/2 rounded-full bg-black/80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Card Below Phone */}
            <Card className="rounded-fib5 border-line bg-white shadow-2xs">
              <CardContent className="p-4 space-y-3">
                <Button
                  type="button"
                  onClick={() => void actions.markDraftSent(unit.id)}
                  className="w-full rounded-fib3 bg-[#25D366] hover:bg-[#075e54] text-white font-bold h-11 gap-2 cursor-pointer shadow-xs transition-all duration-200 hover:-translate-y-[3px]"
                >
                  <Send className="h-4 w-4" />
                  <span>Tandai Terkirim via WhatsApp</span>
                </Button>

                {unit.draftSentAt && (
                  <p className="flex items-center justify-center gap-1.5 text-center text-xs font-bold text-op">
                    <Check className="h-3.5 w-3.5 shrink-0" />
                    Sudah ditandai terkirim pada {dateTimeEn(unit.draftSentAt)}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Link
                    href={`/c/${unit.token}`}
                    target="_blank"
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-fib3 border-line text-xs font-bold h-9 gap-1.5 inline-flex items-center justify-center hover:bg-green-dark hover:text-white hover:border-green-dark transition-all duration-200")}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Buka Tautan</span>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={copy}
                    className="border-line text-xs font-bold h-9 gap-1.5 cursor-pointer rounded-fib3 hover:bg-green-dark hover:text-white hover:border-green-dark transition-all duration-200"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-op group-hover/button:text-white transition-colors" />
                        <span className="text-op font-bold group-hover/button:text-white transition-colors">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Salin Link</span>
                      </>
                    )}
                  </Button>
                </div>

                <details className="pt-2 border-t border-line/60 text-xs text-muted">
                  <summary className="cursor-pointer font-bold text-ink rounded-fib2 px-1.5 -mx-1.5 transition-colors hover:bg-green-dark hover:text-white">
                    Lihat URL Asli wa.me
                  </summary>
                  <code className="mt-2 block break-all rounded-md bg-paper p-2 font-mono text-[11px] text-ink border border-line">
                    {waLink}
                  </code>
                  <p className="mt-1 text-[11px] text-muted">
                    Nomor telepon pada prototipe adalah sintetis sehingga tidak mengirim pesan fisik ke WhatsApp pengguna sungguhan.
                  </p>
                </details>
              </CardContent>
            </Card>
          </aside>
        )}
      </div>

      <Dialog open={confirmRoll} onOpenChange={setConfirmRoll}>
        <DialogContent className="sm:max-w-md rounded-fib5 bg-paper border-line text-ink shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Simulasi Tutup Buku &amp; Buka Siklus?</DialogTitle>
            <DialogDescription className="text-muted text-sm pt-2">
              Unit yang belum check-in pada siklus ini akan otomatis berubah status menjadi <b>Unconfirmed</b> (+1 siklus diam), dan periode kalender akan berganti ke bulan berikutnya. Fitur ini hanya untuk kebutuhan demo simulasi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setConfirmRoll(false)} className="border-line rounded-fib3 hover:bg-green-dark hover:text-white hover:border-green-dark">
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => {
                void actions.rollover().finally(() => setConfirmRoll(false));
              }}
              disabled={busy}
              className="bg-green-mid text-white rounded-fib3 hover:bg-green-dark disabled:opacity-60"
            >
              {busy ? "Memproses…" : "Simulasikan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
