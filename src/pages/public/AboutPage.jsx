import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import SEOHead from "@/components/common/SEOHead";
import Button from "@/components/common/Button";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";
import { getPreviewUrl } from "@/hooks/useImagePreview";
import AboutHero from "@/components/public/about/AboutHero";
import MissionSection from "@/components/public/about/MissionSection";
import LocationSection from "@/components/public/about/LocationSection";
import PhilosophySection from "@/components/public/about/PhilosophySection";

const CTA_FILE_ID = "69d3de3500234a1f7eb9"; // Relajación al atardecer con yoga

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead
        title={t("about.seoTitle")}
        description={t("about.seoDescription")}
        canonical={`${env.siteUrl}/about`}
      />

      <AboutHero />
      <MissionSection />
      <LocationSection />
      <PhilosophySection />

      {/* CTA Section */}
      <section className="relative h-[45vh] min-h-[340px] max-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getPreviewUrl(CTA_FILE_ID, {
              bucketId: env.bucketPublicResources,
              width: 1600,
              quality: 80,
            })}
            alt=""
            role="presentation"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/50 via-charcoal/40 to-charcoal/60" />

        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {t("about.cta.title")}
          </h2>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-white/80 leading-relaxed">
            {t("about.cta.subtitle")}
          </p>
          <Link to={ROUTES.EXPERIENCES} className="inline-block mt-6 md:mt-8">
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-charcoal"
            >
              {t("about.cta.button")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
