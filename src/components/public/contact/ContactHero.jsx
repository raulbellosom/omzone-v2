import { useLanguage } from "@/hooks/useLanguage";
import { getResponsiveSrcSet } from "@/hooks/useImagePreview";
import env from "@/config/env";

const HERO_WIDTHS = [640, 1024, 1600];

const HERO_FILE_ID = "69d3de18001b95256dfe"; // Charla tranquila en un espacio wellness

export default function ContactHero() {
  const { t } = useLanguage();

  return (
    <section className="relative h-[45vh] min-h-[340px] max-h-[520px] flex items-center justify-center overflow-hidden -mt-20">
      {/* Background */}
      <div className="absolute inset-0">
        {(() => {
          const { src, srcSet, sizes } = getResponsiveSrcSet(HERO_FILE_ID, {
            bucketId: env.bucketPublicResources,
            quality: 82,
            widths: HERO_WIDTHS,
          });
          return (
            <img
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              alt=""
              role="presentation"
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              className="h-full w-full object-cover"
            />
          );
        })()}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/35 to-charcoal/65" />

      {/* Content */}
      <div className="relative z-10 container-shell text-center px-6 pt-20">
        <span className="text-xs font-semibold tracking-[0.2em] uppercase text-white/70">
          {t("contact.hero.eyebrow")}
        </span>
        <h1 className="mt-4 font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-[1.1] tracking-tight max-w-3xl mx-auto">
          {t("contact.hero.title")}
        </h1>
        <p className="mt-4 md:mt-5 text-base md:text-lg text-white/80 max-w-xl mx-auto leading-relaxed font-light">
          {t("contact.hero.subtitle")}
        </p>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
