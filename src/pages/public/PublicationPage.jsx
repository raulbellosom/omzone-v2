import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  usePublicationBySlug,
  getPublicationPreviewUrl,
} from "@/hooks/usePublicationBySlug";
import { usePublicationSEO } from "@/hooks/useSEO";
import SEOHead from "@/components/common/SEOHead";
import PublicationSectionRenderer from "@/components/public/publications/PublicationSectionRenderer";
import NotFoundPage from "@/pages/NotFoundPage";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-warm-gray" />
      <div className="container-shell py-12 space-y-6 max-w-3xl">
        <div className="h-4 w-32 rounded-full bg-warm-gray" />
        <div className="h-10 w-2/3 rounded-xl bg-warm-gray" />
        <div className="h-5 w-full rounded bg-warm-gray" />
        <div className="h-5 w-5/6 rounded bg-warm-gray" />
        <div className="h-5 w-4/6 rounded bg-warm-gray" />
        <div className="h-5 w-3/6 rounded bg-warm-gray" />
      </div>
    </div>
  );
}

// ─── Publication header (when no hero section) ────────────────────────────────

function PublicationHeader({ publication }) {
  const heroUrl = publication.heroImageId
    ? getPublicationPreviewUrl(publication.heroImageId, {
        width: 1600,
        height: 900,
      })
    : null;

  return (
    <header className="relative w-full">
      {heroUrl ? (
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden bg-warm-gray">
          <img
            src={heroUrl}
            alt={publication.title || ""}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <div className="container-shell">
              {publication.category && (
                <span className="inline-block text-xs font-semibold tracking-wider uppercase text-white/70 mb-3">
                  {publication.category}
                </span>
              )}
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
                {publication.title}
              </h1>
              {(publication.subtitle || publication.subtitleEs) && (
                <p className="mt-3 text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
                  {publication.subtitle || publication.subtitleEs}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="container-shell pt-10 pb-6 md:pt-14 md:pb-8">
          {publication.category && (
            <span className="inline-block text-xs font-semibold tracking-wider uppercase text-sage mb-3">
              {publication.category}
            </span>
          )}
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal leading-tight max-w-3xl">
            {publication.title}
          </h1>
          {(publication.subtitle || publication.subtitleEs) && (
            <p className="mt-3 text-charcoal-muted text-base md:text-lg max-w-2xl leading-relaxed">
              {publication.subtitle || publication.subtitleEs}
            </p>
          )}
        </div>
      )}
    </header>
  );
}

// ─── Experience CTA banner ───────────────────────────────────────────────────

function ExperienceBanner({ experience }) {
  const { t } = useLanguage();
  if (!experience) return null;

  return (
    <section className="py-12 md:py-16 bg-sage/10">
      <div className="container-shell text-center max-w-2xl">
        <p className="text-xs font-semibold tracking-wider uppercase text-sage mb-2">
          {t("publication.relatedExperience")}
        </p>
        <h3 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-3">
          {experience.title}
        </h3>
        {(experience.shortDescription || experience.shortDescriptionEs) && (
          <p className="text-charcoal-muted leading-relaxed mb-6">
            {experience.shortDescription || experience.shortDescriptionEs}
          </p>
        )}
        <Button asChild size="lg">
          <Link to={`/experiences/${experience.slug}`}>
            {t("publication.exploreExperience")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PublicationPage() {
  const { slug } = useParams();
  const { t } = useLanguage();
  const { publication, sections, experience, loading, error } =
    usePublicationBySlug(slug);

  if (loading) return <LoadingSkeleton />;
  if (error === "not_found" || (!loading && !publication))
    return <NotFoundPage />;

  const seo = usePublicationSEO(publication);

  const hasHeroSection = sections.some((s) => s.sectionType === "hero");
  const hasCtaSection = sections.some((s) => s.sectionType === "cta");

  return (
    <>
      <SEOHead
        title={seo.title}
        description={seo.description}
        ogImage={seo.ogImage}
        ogType={seo.ogType}
        canonical={seo.canonical}
      />

      {/* Back link */}
      <div className="container-shell pt-4 pb-0">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-subtle hover:text-charcoal transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          {t("publication.home")}
        </Link>
      </div>

      {/* Header — only if no hero section handles it */}
      {!hasHeroSection && <PublicationHeader publication={publication} />}

      {/* Excerpt (if no hero and there's an excerpt) */}
      {!hasHeroSection && (publication.excerpt || publication.excerptEs) && (
        <div className="container-shell max-w-3xl pb-4">
          <p className="text-lg text-charcoal-muted leading-relaxed italic">
            {publication.excerpt || publication.excerptEs}
          </p>
        </div>
      )}

      {/* Sections */}
      <PublicationSectionRenderer sections={sections} experience={experience} />

      {/* Experience CTA — if linked and no explicit cta section */}
      {experience && !hasCtaSection && (
        <ExperienceBanner experience={experience} />
      )}
    </>
  );
}
