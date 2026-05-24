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
        title="Experiences in Puerto Vallarta"
        description="Discover experiences in Puerto Vallarta — sound healing, breathwork, immersions, retreats and transformative stays in Bahía de Banderas."
        canonical={env.siteUrl}
        ogImage={`${env.siteUrl}/og-home.jpg`}
      />

      <HeroSection />
      <DiscoverSection />
      <WhySection />
      <CTASection />
    </>
  );
}
