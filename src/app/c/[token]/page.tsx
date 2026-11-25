import type { Metadata } from "next";
import { CheckinClient } from "@/components/manager/CheckinClient";

export const metadata: Metadata = {
  title: "Check-in bulanan",
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

// GET only renders. State changes happen on button tap (POST in the real product).
export default function Page() {
  return <CheckinClient />;
}
