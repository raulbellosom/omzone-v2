import SEOHead from "@/components/common/SEOHead";
import HeroSection from "@/components/public/home/HeroSection";
import DiscoverSection from "@/components/public/home/DiscoverSection";
import WhySection from "@/components/public/home/WhySection";
import CTASection from "@/components/public/home/CTASection";
import { useHomeContent } from "@/hooks/useHomeContent";
import { useLanguage } from "@/hooks/useLanguage";
import { homePresentation } from "@/lib/homeContent";

export default function HomePage() {
  const { data, config } = useHomeContent();
  const { language } = useLanguage();
  const home = homePresentation(data, language, config);
  return (
    <>
      <SEOHead
        title={home.seoTitle}
        description={home.seoDescription}
        canonical={home.canonical}
        ogImage={home.ogImage}
        noindex={config.noindex}
      >
        <html lang={language} />
        {Object.entries(home.alternates).map(([lang, href]) => (
          <link key={lang} rel="alternate" hrefLang={lang} href={href} />
        ))}
      </SEOHead>

      <HeroSection title={home.title} description={home.description} />
      <DiscoverSection />
      <WhySection />
      <CTASection />
    </>
  );
}
