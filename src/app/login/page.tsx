import type { Metadata } from "next";
import { LoginClient } from "@/components/LoginClient";

export const metadata: Metadata = { title: "Coordinator login" };

export default function Page() {
  return <LoginClient />;
}
