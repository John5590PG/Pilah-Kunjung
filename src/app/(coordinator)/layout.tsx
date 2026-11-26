import { AppNav } from "@/components/coordinator/AppNav";
import { SyntheticBanner } from "@/components/common/SyntheticBanner";

export default function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SyntheticBanner />
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
