import type { Metadata } from "next";
import { DashboardClient } from "@/components/coordinator/DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default function Page() {
  return <DashboardClient />;
}
