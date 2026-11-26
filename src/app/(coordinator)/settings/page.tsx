import type { Metadata } from "next";
import { SettingsClient } from "@/components/SettingsClient";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <SettingsClient />;
}
