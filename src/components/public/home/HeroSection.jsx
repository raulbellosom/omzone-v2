import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/common/Button";
import { getPreviewUrl, getResponsiveSrcSet } from "@/hooks/useImagePreview";
import env from "@/config/env";

const HERO_WIDTHS = [640, 1024, 1600];

const HERO_IMAGES = [
  "69d3ddd100364abb45c8", // Yoga al amanecer en Puerto Vallarta
  "69d3dde10018007e19f4", // Yoga en el mar al amanecer
  "69d3de0e00004f880284", // Meditación en retiro rodeado de naturaleza
  "69d3de31001d508809b0", // Sesión de sanación con sonido
  "69d3de3500234a1f7eb9", // Relajación al atardecer con yoga
];

const INTERVAL = 6000;

export default function HeroSection() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % HERO_IMAGES.length);
  }, []);

  useEffect(() => {
    const id = setInterval(advance, INTERVAL);
    return () => clearInterval(id);
  }, [advance]);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Crossfade image layers */}
      {HERO_IMAGES.map((fileId, i) => {
        const { src, srcSet, sizes } = getResponsiveSrcSet(fileId, {
          bucketId: env.bucketPublicResources,
          quality: 82,
          widths: HERO_WIDTHS,
        });
        return (
        <div
          key={fileId}
          className="absolute inset-0 transition-opacity duration-[1800ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          <img
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt=""
            role="presentation"
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : undefined}
            decoding={i === 0 ? "sync" : "async"}
            className="h-full w-full object-cover scale-105"
          />
        </div>
        );
      })}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-charcoal/55 via-charcoal/35 to-charcoal/65" />

      {/* Content */}
      <div className="relative z-10 container-shell text-center px-6 py-32 md:py-40">
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight max-w-4xl mx-auto animate-fade-in-up">
          {t("home.hero.title")}
        </h1>

        <p className="mt-6 md:mt-8 text-base sm:text-lg md:text-xl text-white/85 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-up [animation-delay:0.1s]">
          {t("home.hero.subtitle")}
        </p>

        <div className="mt-10 md:mt-12 animate-fade-in-up [animation-delay:0.2s]">
          <Button size="xl" asChild>
            <Link to="/experiences">{t("home.hero.cta")}</Link>
          </Button>
        </div>

        {/* Slide indicators */}
        <div className="flex items-center justify-center gap-2 mt-12">
          {HERO_IMAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                i === current
                  ? "w-8 bg-white"
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom fade to cream */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-cream to-transparent" />
    </section>
  );
}
