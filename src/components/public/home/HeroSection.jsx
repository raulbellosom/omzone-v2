import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import { Button } from "@/components/common/Button";
import {
  getResponsiveSrcSet,
  getPlaceholderUrl,
} from "@/hooks/useImagePreview";
import { useHeroSlides } from "@/hooks/useHeroSlides";
import env from "@/config/env";

const HERO_WIDTHS = [640, 1024, 1600];
const INTERVAL = 6000;

// Fallback slides — kept hardcoded so the home never renders empty if the
// hero_slides collection is empty or unreachable. These match the original
// curated set from the launch.
const FALLBACK_SLIDES = [
  {
    $id: "fb-1",
    mediaFileId: "69d3ddd100364abb45c8",
    bucketId: env.bucketPublicResources,
  },
  {
    $id: "fb-2",
    mediaFileId: "69d3dde10018007e19f4",
    bucketId: env.bucketPublicResources,
  },
  {
    $id: "fb-3",
    mediaFileId: "69d3de0e00004f880284",
    bucketId: env.bucketPublicResources,
  },
  {
    $id: "fb-4",
    mediaFileId: "69d3de31001d508809b0",
    bucketId: env.bucketPublicResources,
  },
  {
    $id: "fb-5",
    mediaFileId: "69d3de3500234a1f7eb9",
    bucketId: env.bucketPublicResources,
  },
];

export default function HeroSection() {
  const { t, language } = useLanguage();
  const { data: slidesFromDB, loading: slidesLoading } = useHeroSlides();
  const [current, setCurrent] = useState(0);
  const [firstLoaded, setFirstLoaded] = useState(false);

  // While the DB fetch is in-flight, return an empty array so the stale
  // fallback slides never flash before the real content arrives.
  // Only once loading resolves do we pick DB slides (or fall back if empty).
  const slides = useMemo(() => {
    if (slidesLoading) return [];
    if (slidesFromDB && slidesFromDB.length > 0) return slidesFromDB;
    return FALLBACK_SLIDES;
  }, [slidesFromDB, slidesLoading]);

  const advance = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Reset index if slide source changes (e.g. when DB data hydrates after fallback).
  useEffect(() => {
    setCurrent(0);
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const id = setInterval(advance, INTERVAL);
    return () => clearInterval(id);
  }, [advance, slides.length]);

  // Build LQIP placeholder URL for the first slide (~300 bytes WebP at 20px)
  const firstSlide = slides[0];
  const firstSlideBucket = firstSlide?.bucketId || env.bucketPublicResources;
  const lqipSrc = firstSlide
    ? getPlaceholderUrl(firstSlide.mediaFileId, { bucketId: firstSlideBucket })
    : null;

  return (
    <section className="relative min-h-svh flex items-center justify-center overflow-hidden bg-charcoal">
      {/* LQIP blur-up: tiny placeholder shows during first-slide load, ~300 bytes */}
      {!firstLoaded && lqipSrc && (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <img
            src={lqipSrc}
            alt=""
            className="h-full w-full object-cover scale-110"
            style={{ filter: "blur(20px)" }}
          />
        </div>
      )}

      {/* Crossfade image layers */}
      {slides.map((slide, i) => {
        const fileId = slide.mediaFileId;
        const bucketId = slide.bucketId || env.bucketPublicResources;
        const { src, srcSet, sizes } = getResponsiveSrcSet(fileId, {
          bucketId,
          quality: 82,
          widths: HERO_WIDTHS,
        });
        const altRaw = localizedField(slide, "altText", language);
        const alt = altRaw && altRaw.trim() ? altRaw : "";
        return (
          <div
            key={slide.$id || fileId}
            className="absolute inset-0 transition-opacity duration-1800 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
            aria-hidden={i !== current}
          >
            <img
              src={src}
              srcSet={srcSet}
              sizes={sizes}
              alt={alt}
              role={alt ? undefined : "presentation"}
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : undefined}
              decoding={i === 0 ? "sync" : "async"}
              onLoad={i === 0 ? () => setFirstLoaded(true) : undefined}
              className="h-full w-full object-cover scale-105"
            />
          </div>
        );
      })}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-charcoal/55 via-charcoal/35 to-charcoal/65" />

      {/* Per-slide caption overlay — hidden on mobile, visible sm+ */}
      {slides.map((slide, i) => {
        const eyebrow = localizedField(slide, "eyebrow", language);
        const caption = localizedField(slide, "caption", language);
        const ctaLabel = localizedField(slide, "ctaLabel", language);
        const ctaHref = slide.ctaHref;
        const hasContent = eyebrow || caption;
        if (!hasContent) return null;
        return (
          <div
            key={`caption-${slide.$id}`}
            className="absolute bottom-28 left-0 right-0 z-20 hidden sm:block pointer-events-none transition-opacity duration-1800 ease-in-out"
            style={{ opacity: i === current ? 1 : 0 }}
            aria-hidden={i !== current}
          >
            <div className="container-shell px-6">
              <div className="max-w-sm">
                {eyebrow && (
                  <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/65 mb-2">
                    {eyebrow}
                  </p>
                )}
                {caption && (
                  <p className="text-lg md:text-xl font-light text-white/90 leading-snug mb-3">
                    {caption}
                  </p>
                )}
                {ctaLabel && ctaHref && (
                  <Link
                    to={ctaHref}
                    className="pointer-events-auto text-sm text-white/80 hover:text-white underline underline-offset-4 transition-colors duration-200"
                  >
                    {ctaLabel} →
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Centered global content — H1, subtitle, CTA (always constant for SEO) */}
      <div className="relative z-30 container-shell text-center px-6 py-32 md:py-40">
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
      </div>

      {/* Slide indicators — fixed at bottom center, above the cream fade */}
      {slides.length > 1 && (
        <div className="absolute bottom-28 left-0 right-0 z-30 flex items-center justify-center gap-2">
          {slides.map((_, i) => (
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
      )}

      {/* Bottom fade to cream */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-cream to-transparent" />
    </section>
  );
}
