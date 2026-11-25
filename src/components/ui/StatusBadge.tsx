import { STATUS_EN, STATUS_ID, type UnitStatus } from "@/lib/status";
import { CheckIcon, HelpIcon, PauseIcon, XIcon } from "./icons";

const STYLE: Record<UnitStatus, string> = {
  OPERATING: "bg-op-bg text-op",
  PAUSED: "bg-pa-bg text-pa",
  CLOSED: "bg-cl-bg text-cl",
  UNCONFIRMED: "bg-un-bg text-un",
};
const ICON = { OPERATING: CheckIcon, PAUSED: PauseIcon, CLOSED: XIcon, UNCONFIRMED: HelpIcon };

/** Never colour-only: icon + text on every badge. */
export function StatusBadge({ status, lang = "en", large = false }: { status: UnitStatus; lang?: "en" | "id"; large?: boolean }) {
  const Icon = ICON[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ${STYLE[status]} ${
        large ? "px-4 py-2 text-lg" : "px-2.5 py-1 text-xs"
      }`}
    >
      <Icon className={large ? "h-5 w-5" : "h-3.5 w-3.5"} />
      {lang === "en" ? STATUS_EN[status] : STATUS_ID[status]}
    </span>
  );
}
