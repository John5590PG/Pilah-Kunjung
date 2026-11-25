import type { Metadata } from "next";
import { UnitDetailClient } from "@/components/coordinator/UnitDetailClient";

export const metadata: Metadata = { title: "Unit" };

export default function Page() {
  return <UnitDetailClient />;
}
