import type { Metadata } from "next";
import Link from "next/link";
import { SyntheticBanner } from "@/components/ui/SyntheticBanner";

export const metadata: Metadata = { title: "Coordinator login (demo)" };

export default function Page() {
  return (
    <>
      <SyntheticBanner />
      <main className="mx-auto mt-16 max-w-sm rounded-2xl border border-line bg-white p-6">
        <h1 className="text-2xl font-extrabold">Coordinator login</h1>
        <p className="mt-2 text-sm text-muted">
          The prototype has <b>no real authentication</b> yet (planned). Continue as the demo coordinator for Kecamatan Gunungpati.
        </p>
        <Link href="/dashboard" className="mt-5 block rounded-xl bg-brand px-4 py-3 text-center font-bold text-white hover:bg-teal-950">
          Continue as demo coordinator
        </Link>
      </main>
    </>
  );
}
