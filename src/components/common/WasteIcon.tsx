import { cn } from "@/lib/utils";

export type WasteIconName =
  | "bottle-plastic"
  | "community-trust"
  | "organic-leaf"
  | "paper-box"
  | "recycle-loop"
  | "scale-weighing";

/**
 * Renders the SVG files kept in public/icons/waste-bank as a CSS mask so they
 * inherit `currentColor` and therefore follow the same hover contrast as text.
 */
export function WasteIcon({ name, className }: { name: WasteIconName; className?: string }) {
  const url = `url(/icons/waste-bank/${name}.svg)`;
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block shrink-0 bg-current", className)}
      style={{
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}
