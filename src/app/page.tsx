import { SyntheticBanner } from "@/components/common/SyntheticBanner";
import { ScrollTopButton } from "@/components/common/ScrollTopButton";
import { Hero } from "@/components/landing/Hero";
import { StatsBar } from "@/components/landing/StatsBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CommunitySection } from "@/components/landing/CommunitySection";
import { VerificationSection } from "@/components/landing/VerificationSection";
import { PrivacySection } from "@/components/landing/PrivacySection";
import { Guidelines } from "@/components/landing/Guidelines";
import { AuditMatrix } from "@/components/landing/AuditMatrix";
import { SiteFooter } from "@/components/landing/SiteFooter";

/**
 * Landing page composition. Copy and demo links live in
 * components/landing/content.tsx; each section is self-contained.
 */
export default function Home() {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <SyntheticBanner />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <CommunitySection />
      <VerificationSection />
      <PrivacySection />
      <Guidelines />
      <AuditMatrix />
      <SiteFooter />
      <ScrollTopButton />
    </div>
  );
}
