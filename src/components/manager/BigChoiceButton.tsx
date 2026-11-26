import type { ReactNode } from "react";

const TONE = {
  OPERATING: "border-op bg-op-bg text-op hover:border-op hover:bg-op hover:text-white",
  PAUSED: "border-pa bg-pa-bg text-pa hover:border-pa hover:bg-pa hover:text-white",
  CLOSED: "border-cl bg-cl-bg text-cl hover:border-cl hover:bg-cl hover:text-white",
} as const;

/** Large tap target (≥64px), high contrast, tactile feedback, plain Indonesian. */
export function BigChoiceButton({
  tone,
  icon,
  label,
  hint,
  selected,
  onClick,
}: {
  tone: keyof typeof TONE;
  icon: ReactNode;
  label: string;
  hint: string;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group flex min-h-[76px] w-full items-center gap-4 rounded-fib4 border-2 px-5 py-3.5 text-left shadow-xs transition-all duration-200 active:scale-[0.98] hover:-translate-y-[3px] hover:shadow-md ${TONE[tone]} ${
        selected ? "ring-4 ring-brand/40" : ""
      }`}
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-fib3 bg-white shadow-2xs transition-transform duration-200 group-hover:scale-105">
        {icon}
      </span>
      <span className="flex-1">
        <span className="block text-xl font-black tracking-tight">{label}</span>
        <span className="block text-sm font-medium opacity-90 leading-snug mt-0.5">{hint}</span>
      </span>
    </button>
  );
}
