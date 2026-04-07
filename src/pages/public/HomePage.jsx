import SEOHead from "@/components/common/SEOHead";
import HeroSection from "@/components/public/home/HeroSection";
import DiscoverSection from "@/components/public/home/DiscoverSection";
import WhySection from "@/components/public/home/WhySection";
import CTASection from "@/components/public/home/CTASection";
import env from "@/config/env";

export default function HomePage() {
  return (
    <>
      <SEOHead
        title="Wellness Experiences in Puerto Vallarta"
        description="Curated wellness journeys in Puerto Vallarta — sessions, immersions, retreats and stays designed to reconnect you with what matters most."
        canonical={env.siteUrl}
      />

      <HeroSection />
      <DiscoverSection />
      <WhySection />
      <CTASection />
    </>
  );
}
