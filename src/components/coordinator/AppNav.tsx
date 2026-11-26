"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppData } from "@/lib/appdata/provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  LayoutDashboard,
  Settings,
  RotateCcw,
  Menu,
  X,
} from "lucide-react";

const LINKS = [
  { href: "/cycles", label: "Pesan WA", icon: MessageSquare },
  { href: "/dashboard", label: "Dasbor Prioritas", icon: LayoutDashboard },
  { href: "/settings", label: "Pengaturan", icon: Settings },
];

export function AppNav() {
  const path = usePathname();
  const { mode, actions } = useAppData();
  const [confirm, setConfirm] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Clear at the top of the page, frosted once content moves underneath.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="glass-header sticky top-0 z-50" data-scrolled={scrolled}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/logo.svg"
            alt=""
            width={36}
            height={36}
            className="h-9 w-9 rounded-fib3 shadow-sm transition-transform duration-200 group-hover:scale-105"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-bold text-green-dark tracking-tight">
              Pilah &amp; Kunjung
            </span>
            <span className="text-[10px] font-medium text-muted tracking-wide">
              DLH Kota Semarang
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => {
            const Icon = l.icon;
            const active =
              path === l.href ||
              (l.href === "/dashboard" && path.startsWith("/units"));
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2 rounded-fib3 px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-green-mid text-white font-semibold shadow-xs hover:bg-green-dark"
                    : "text-ink-mid hover:bg-green-dark hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <span className="hidden lg:inline-block text-xs font-medium text-muted bg-green-mist px-2.5 py-1 rounded-full">
            30 Unit Simulasi
          </span>

          {mode !== "api" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setConfirm(true)}
              className="border-green-light/70 text-green-mid bg-white/70 hover:bg-green-dark hover:text-white hover:border-green-dark text-sm h-9 gap-1.5 rounded-fib3 cursor-pointer hidden sm:flex transition-all duration-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Demo</span>
            </Button>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center h-9 w-9 rounded-fib3 border border-green-light/70 text-green-mid bg-white/60 hover:bg-green-dark hover:text-white hover:border-green-dark transition-all duration-200"
            aria-label="Buka menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-green-light/30 bg-white/90 backdrop-blur-xl px-4 pb-4 pt-2 shadow-lg">
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => {
              const Icon = l.icon;
              const active =
                path === l.href ||
                (l.href === "/dashboard" && path.startsWith("/units"));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-fib3 px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    active
                      ? "bg-green-mid text-white font-semibold"
                      : "text-ink-mid hover:bg-green-dark hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
            {mode !== "api" && (
              <div className="mt-2 pt-2 border-t border-green-100">
                <button
                  type="button"
                  onClick={() => { setConfirm(true); setMenuOpen(false); }}
                  className="flex items-center gap-2 text-sm text-muted px-3 py-2 rounded-fib2 hover:bg-green-dark hover:text-white transition-colors duration-200"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset Demo
                </button>
              </div>
            )}
          </nav>
        </div>
      )}

      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="sm:max-w-md rounded-fib5 bg-white border-green-line/70 text-ink shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-green-dark">Reset data demo simulasi?</DialogTitle>
            <DialogDescription className="text-muted text-sm pt-2">
              Seluruh check-in, catatan kunjungan, dan draf pesan yang disimpan di browser ini akan dikembalikan ke kondisi awal (30 unit sintetis Kecamatan Gunungpati).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirm(false)}
              className="border-green-line text-ink-mid rounded-fib3 hover:bg-green-dark hover:text-white hover:border-green-dark"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                actions.resetDemo();
                setConfirm(false);
              }}
              className="bg-un text-white rounded-fib3 hover:bg-ink hover:shadow-md"
            >
              Reset Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
