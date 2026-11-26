import type { ScoreBreakdown } from "@/lib/ranking";
import type { RankingConfig } from "@/lib/ranking";

/** Shows score with a transparent breakdown: 2×M + W + B. */
export function ScoreTooltip({ b, silentCycles, cfg }: { b: ScoreBreakdown; silentCycles: number; cfg: RankingConfig }) {
  return (
    <span className="group relative inline-block">
      <button
        type="button"
        className="rounded-fib2 px-2 py-0.5 font-mono text-sm font-bold underline decoration-dotted underline-offset-4 transition-colors duration-200 hover:bg-green-dark hover:text-white"
        aria-label={`Score ${b.total}. Show breakdown`}
      >
        {b.total}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none invisible absolute right-0 z-20 mt-1 w-56 rounded-fib4 bg-ink p-3 text-left text-xs leading-relaxed text-white opacity-0 shadow-xl group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
      >
        <b className="block">Score = {cfg.wSilent}×M + W + B</b>
        M (silent cycles) = {silentCycles} → {b.silent}
        <br />W (status) → {b.status}
        <br />B (no contact bonus) → {b.visitBonus}
        <br />
        <b>Total = {b.total}</b>
      </span>
    </span>
  );
}
