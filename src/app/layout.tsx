import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Pilah & Kunjung — Prototype", template: "%s · Pilah & Kunjung" },
  description:
    "Prototype (simulated data) of a lightweight activity check-in for Semarang's waste banks. STACK 2026 — RumaSynapse Corp.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
