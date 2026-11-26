import { STATUS_EN, STATUS_ID, type UnitStatus } from "@/lib/status";
import { CheckIcon, HelpIcon, PauseIcon, XIcon } from "./icons";
import { cn } from "@/lib/utils";

const STYLE: Record<UnitStatus, { base: string; hover: string }> = {
  OPERATING: { base: "border-op/20 bg-op-bg text-op", hover: "hover:border-op hover:bg-op hover:text-white" },
  PAUSED: { base: "border-pa/20 bg-pa-bg text-pa", hover: "hover:border-pa hover:bg-pa hover:text-white" },
  CLOSED: { base: "border-cl/20 bg-cl-bg text-cl", hover: "hover:border-cl hover:bg-cl hover:text-white" },
  UNCONFIRMED: { base: "border-un/20 bg-un-bg text-un", hover: "hover:border-un hover:bg-un hover:text-white" },
};
const ICON = { OPERATING: CheckIcon, PAUSED: PauseIcon, CLOSED: XIcon, UNCONFIRMED: HelpIcon };

/**
 * Never colour-only: dot + icon + text on every badge.
 * Hover inverts the badge to its solid status colour with white text,
 * so the change is visible even for colour-blind readers.
 */
export function StatusBadge({
  status,
  lang = "en",
  large = false,
  className,
}: {
  status: UnitStatus;
  lang?: "en" | "id";
  large?: boolean;
  className?: string;
}) {
  const Icon = ICON[status];
  const tone = STYLE[status];
  return (
    <span
      className={cn(
        "group/badge contrast-badge inline-flex items-center gap-1.5 whitespace-nowrap rounded-fib3 border font-semibold tracking-wide transition-colors duration-200",
        tone.base,
        tone.hover,
        large ? "px-4 py-1.5 text-sm" : "px-2.5 py-1 text-[11px]",
        className,
      )}
    >
      <span className={cn("shrink-0 rounded-full bg-current opacity-70", large ? "h-2 w-2" : "h-1.5 w-1.5")} aria-hidden="true" />
      <Icon className={large ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {lang === "en" ? STATUS_EN[status] : STATUS_ID[status]}
    </span>
  );
}
