import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Delivery state for the monthly WA draft: "Terkirim" vs "Siap Draf".
 * Mirrors StatusBadge so the dashboard and the WA screen feel like one system.
 */
export function DeliveryBadge({ sent, compact = false, className }: { sent: boolean; compact?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "contrast-badge inline-flex items-center gap-1.5 whitespace-nowrap rounded-fib3 border font-bold transition-colors duration-200",
        sent
          ? "border-op/20 bg-op-bg text-op hover:border-op hover:bg-op hover:text-white"
          : "border-line bg-paper text-muted hover:border-brand hover:bg-brand hover:text-white",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" aria-hidden="true" />
      {sent ? "Terkirim" : "Siap Draf"}
      {sent && <Check className="h-3 w-3 opacity-80" aria-hidden="true" />}
    </span>
  );
}
