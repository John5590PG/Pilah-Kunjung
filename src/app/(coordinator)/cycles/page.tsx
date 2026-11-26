import type { Metadata } from "next";
import { Suspense } from "react";
import { CyclesClient } from "@/components/coordinator/CyclesClient";
import { PageSkeleton } from "@/components/common/EmptyState";

export const metadata: Metadata = { title: "Cycle & messages" };

export default function Page() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CyclesClient />
    </Suspense>
  );
}
