import type { ReactNode } from "react";

const TONE = {
  OPERATING: "border-op bg-op-bg text-op hover:bg-green-200",
  PAUSED: "border-pa bg-pa-bg text-pa hover:bg-amber-200",
  CLOSED: "border-cl bg-cl-bg text-cl hover:bg-slate-300",
} as const;

/** Large tap target (≥56px), icon + text, plain Indonesian. */
export function BigChoiceButton({
  tone, icon, label, hint, selected, onClick,
}: {
  tone: keyof typeof TONE; icon: ReactNode; label: string; hint: string; selected?: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-[72px] w-full items-center gap-4 rounded-2xl border-2 px-5 py-3 text-left transition active:scale-[0.99] ${TONE[tone]} ${
        selected ? "ring-4 ring-brand/40" : ""
      }`}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/70">{icon}</span>
      <span>
        <span className="block text-xl font-bold">{label}</span>
        <span className="block text-base font-normal opacity-90">{hint}</span>
      </span>
    </button>
  );
}
