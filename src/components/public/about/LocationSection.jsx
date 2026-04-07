import { useLanguage } from "@/hooks/useLanguage";
import { getResponsiveSrcSet } from "@/hooks/useImagePreview";
import env from "@/config/env";

const LOCATION_WIDTHS = [640, 1024, 1600];

const LOCATION_FILE_ID = "69d3ddd100364abb45c8"; // Yoga al amanecer en Puerto Vallarta

export default function LocationSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed image */}
      <div className="relative h-[50vh] min-h-[360px] max-h-[560px]">
        {(() => {
          const { src, srcSet, sizes } = getResponsiveSrcSet(LOCATION_FILE_ID, {
            bucketId: env.bucketPublicResources,
            quality: 82,
            widths: LOCATION_WIDTHS,
          });
          return (
            <img
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              alt="Puerto Vallarta coastline at sunrise"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          );
        })()}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-cream" />
      </div>

      {/* Text block overlapping the image bottom */}
      <div className="relative -mt-12 sm:-mt-16 md:-mt-20 z-10">
        <div className="container-shell max-w-3xl mx-auto">
          <div className="bg-white rounded-card shadow-premium p-6 sm:p-8 md:p-14">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-sage">
              {t("about.location.eyebrow")}
            </span>
            <h2 className="mt-4 font-display text-2xl sm:text-3xl md:text-4xl font-bold text-charcoal leading-tight">
              {t("about.location.title")}
            </h2>
            <div className="mt-6 space-y-4 text-base md:text-lg text-charcoal-muted leading-relaxed">
              <p>{t("about.location.body1")}</p>
              <p>{t("about.location.body2")}</p>
              <p className="font-medium text-charcoal">
                {t("about.location.body3")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div className="h-16 md:h-24 bg-cream" />
    </section>
  );
}
