"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Quiet back-to-top control that uses the same smooth scroll as the anchors. */
export function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Kembali ke atas"
      className="fixed right-6 bottom-6 z-50 grid h-12 w-12 place-items-center rounded-fib5 border border-green-light/60 bg-white/70 text-green-dark shadow-lg backdrop-blur-xl transition-all duration-200 hover:-translate-y-[3px] hover:border-green-dark hover:bg-green-dark hover:text-white"
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}
