import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Ticket, Zap, Clock, Check } from "lucide-react";
import { usePassDetail, getPassPreviewUrl } from "@/hooks/usePassDetail";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import SEOHead from "@/components/common/SEOHead";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Button } from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import NotFoundPage from "@/pages/NotFoundPage";
import { ROUTES } from "@/constants/routes";
import env from "@/config/env";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full h-[50vh] min-h-[360px] max-h-[540px] bg-sand/80" />
      <div className="container-shell py-12 space-y-6 max-w-3xl">
        <div className="h-6 w-24 rounded-full bg-sand" />
        <div className="h-10 w-2/3 rounded-xl bg-sand" />
        <div className="h-4 w-full rounded bg-sand/70" />
        <div className="h-4 w-5/6 rounded bg-sand/70" />
      </div>
    </div>
  );
}

// ─── Price formatter ──────────────────────────────────────────────────────────

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── Pass hero ────────────────────────────────────────────────────────────────

function PassHero({ pass, language }) {
  const { t } = useLanguage();
  const name = localizedField(pass, "name", language);
  const description = localizedField(pass, "description", language);

  return (
    <div className="relative w-full">
      <div className="relative w-full h-[50vh] min-h-[360px] max-h-[540px] overflow-hidden bg-charcoal">
        {pass.heroImageId ? (
          <OptimizedImage
            fileId={pass.heroImageId}
            widths={[800, 1200, 1600]}
            quality={85}
            alt={name}
            className="w-full h-full"
            eager
          />
        ) : (
          <div className="w-full h-full bg-charcoal" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

        {/* Back link */}
        <div className="absolute top-20 left-0 right-0 z-10">
          <div className="container-shell">
            <Link
              to={ROUTES.PASSES}
              className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors group backdrop-blur-sm bg-black/20 rounded-full px-3 py-1.5"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              {t("passes.allPasses")}
            </Link>
          </div>
        </div>

        {/* Content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container-shell">
            <div className="mb-3 flex gap-2">
              <Badge variant="default">
                <Ticket className="h-3.5 w-3.5 mr-1 inline" />
                {t("passes.credits", { count: pass.totalCredits })}
              </Badge>
              {pass.validityDays && (
                <Badge variant="outline" className="text-white border-white/40">
                  <Clock className="h-3.5 w-3.5 mr-1 inline" />
                  {t("passes.validDays", { days: pass.validityDays })}
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
              {name}
            </h1>
            {description && (
              <p className="mt-3 text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Eligible experiences list ────────────────────────────────────────────────

function EligibleExperiences({ experiences, language }) {
  const { t } = useLanguage();

  if (!experiences.length) return null;

  return (
    <section className="py-8 md:py-12">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-6">
        {t("passes.eligibleExperiences")}
      </h2>
      <div className="space-y-3">
        {experiences.map((exp) => {
          const name =
            localizedField(exp, "publicName", language) ||
            exp.publicName ||
            exp.name;
          const desc = localizedField(exp, "shortDescription", language);
          const slug = exp.slug || exp.$id;

          return (
            <Link
              key={exp.$id}
              to={ROUTES.EXPERIENCE.replace(":slug", slug)}
              className="flex gap-4 items-start rounded-2xl border border-warm-gray-dark/20 bg-white p-4 md:p-5 hover:border-sage/40 transition-colors group"
            >
              <div className="shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-sage-dark" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-charcoal group-hover:text-sage-dark transition-colors">
                  {name}
                </h3>
                {desc && (
                  <p className="mt-1 text-sm text-charcoal-muted leading-relaxed line-clamp-2">
                    {desc}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// ─── Pricing sidebar ──────────────────────────────────────────────────────────

function PricingSidebar({ pass }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <aside className="w-full">
      <div className="sticky top-6 rounded-2xl border border-warm-gray-dark/30 bg-white shadow-lg p-6 space-y-5">
        <div>
          <p className="text-xs text-charcoal-subtle uppercase tracking-wider mb-1">
            {t("passes.passPrice")}
          </p>
          <p className="text-3xl font-bold text-charcoal">
            {formatPrice(pass.basePrice, pass.currency)}
            <span className="text-sm font-normal text-charcoal-subtle ml-1">
              {pass.currency}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-charcoal-muted">
          <span className="flex items-center gap-1.5">
            <Zap className="h-4 w-4" />
            {t("passes.credits", { count: pass.totalCredits })}
          </span>
          {pass.validityDays && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {t("passes.validDays", { days: pass.validityDays })}
            </span>
          )}
        </div>

        <Button
          type="button"
          size="md"
          className="w-full"
          onClick={() =>
            navigate(`${ROUTES.CHECKOUT}?passId=${pass.$id}&slug=${pass.slug}`)
          }
        >
          <Ticket className="h-5 w-5" />
          {t("passes.buyPass")}
        </Button>
      </div>
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PassDetailPage() {
  const { slug } = useParams();
  const { pass, experiences, loading, error } = usePassDetail(slug);
  const { t, language } = useLanguage();

  if (loading) return <LoadingSkeleton />;
  if (error === "not_found" || !pass) return <NotFoundPage />;
  if (error) {
    return (
      <div className="container-shell py-20 text-center">
        <p className="text-charcoal-muted">{t("passes.errorLoading")}</p>
      </div>
    );
  }

  const name = localizedField(pass, "name", language);
  const description = localizedField(pass, "description", language);
  const seoImage = getPassPreviewUrl(pass.heroImageId, {
    width: 1200,
    height: 630,
  });

  return (
    <div className="min-h-screen bg-cream">
      <SEOHead
        title={`${name} — Wellness Pass`}
        description={
          description || `${name} — ${pass.totalCredits} credits wellness pass`
        }
        ogImage={seoImage}
        ogType="product"
        canonical={`${env.siteUrl}/passes/${pass.slug}`}
      />

      {/* Hero */}
      <PassHero pass={pass} language={language} />

      {/* Two-column layout */}
      <div className="container-shell py-10 md:py-14">
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-12 lg:items-start">
          {/* Main column */}
          <div className="min-w-0">
            {/* Description */}
            {description && (
              <div className="py-6 md:py-8">
                <p className="text-charcoal-muted leading-relaxed whitespace-pre-wrap text-base">
                  {description}
                </p>
              </div>
            )}

            {/* Eligible experiences */}
            <EligibleExperiences
              experiences={experiences}
              language={language}
            />

            {/* Mobile pricing */}
            <div className="lg:hidden mt-10">
              <PricingSidebar pass={pass} />
            </div>
          </div>

          {/* Sidebar (lg+) */}
          <div className="hidden lg:block mt-2">
            <PricingSidebar pass={pass} />
          </div>
        </div>
      </div>
    </div>
  );
}
