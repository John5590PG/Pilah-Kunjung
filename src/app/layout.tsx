import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppDataProvider } from "@/lib/appdata/provider";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: "Pilah & Kunjung", template: "%s · Pilah & Kunjung" },
  description:
    "Prototype (simulated data) of a lightweight activity check-in for Semarang's waste banks. STACK 2026, RumaSynapse Corp.",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={cn("font-sans", geist.variable)}>
      <body className="min-h-dvh antialiased">
        <AppDataProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </AppDataProvider>
      </body>
    </html>
  );
}
