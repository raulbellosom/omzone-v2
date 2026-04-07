import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Users, Package, Check } from "lucide-react";
import {
  usePackageDetail,
  getPackagePreviewUrl,
} from "@/hooks/usePackageDetail";
import { useLanguage } from "@/hooks/useLanguage";
import SEOHead from "@/components/common/SEOHead";
import OptimizedImage from "@/components/common/OptimizedImage";
import ExperienceGallery from "@/components/public/experience-detail/ExperienceGallery";
import { Button } from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import NotFoundPage from "@/pages/NotFoundPage";
import { ROUTES } from "@/constants/routes";
import env from "@/config/env";
import { cn } from "@/lib/utils";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="w-full aspect-3/4 sm:aspect-video md:aspect-21/9 bg-warm-gray" />
      <div className="container-shell py-12 space-y-6 max-w-3xl">
        <div className="h-6 w-24 rounded-full bg-warm-gray" />
        <div className="h-10 w-2/3 rounded-xl bg-warm-gray" />
        <div className="h-4 w-full rounded bg-warm-gray" />
        <div className="h-4 w-5/6 rounded bg-warm-gray" />
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

// ─── Package hero (same pattern as ExperienceHero) ────────────────────────────

function PackageHero({ pkg }) {
  const { t } = useLanguage();

  return (
    <div className="relative w-full -mt-20">
      <div className="relative w-full aspect-3/4 sm:aspect-video md:aspect-21/9 overflow-hidden bg-warm-gray">
        <OptimizedImage
          fileId={pkg.heroImageId}
          bucketId={env.bucketPackageImages}
          widths={[800, 1200, 1600]}
          quality={85}
          alt={pkg.name}
          className="w-full h-full"
          eager
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />

        {/* Back link */}
        <div className="absolute top-20 left-0 right-0 z-10">
          <div className="container-shell">
            <Link
              to={ROUTES.EXPERIENCES}
              className="inline-flex items-center gap-1.5 text-sm text-white/90 hover:text-white transition-colors group backdrop-blur-sm bg-black/20 rounded-full px-3 py-1.5"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
              {t("experienceDetail.allExperiences")}
            </Link>
          </div>
        </div>

        {/* Content over image */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container-shell">
            <div className="mb-3">
              <Badge variant="default">
                <Package className="h-3.5 w-3.5 mr-1 inline" />
                Package
              </Badge>
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight max-w-3xl">
              {pkg.name}
            </h1>
            {pkg.description && (
              <p className="mt-3 text-white/80 text-base md:text-lg max-w-2xl leading-relaxed">
                {pkg.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Package items list ───────────────────────────────────────────────────────

function PackageItemsList({ items, experiences }) {
  const { t, lang } = useLanguage();

  const expMap = new Map(experiences.map((e) => [e.$id, e]));

  return (
    <section className="py-8 md:py-12">
      <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-6">
        {lang === "es" ? "Qué incluye" : "What's Included"}
      </h2>
      <div className="space-y-3">
        {items.map((item) => {
          const exp =
            item.referenceType === "experience"
              ? expMap.get(item.referenceId)
              : null;
          const name =
            item.name || (exp && (exp.publicName || exp.name)) || "Item";
          const description =
            item.description || (exp && exp.shortDescription) || null;

          return (
            <div
              key={item.$id}
              className="flex gap-4 items-start rounded-2xl border border-warm-gray-dark/20 bg-white p-4 md:p-5"
            >
              <div className="shrink-0 mt-0.5">
                <div className="w-8 h-8 rounded-full bg-sage/10 flex items-center justify-center">
                  <Check className="h-4 w-4 text-sage-dark" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold text-charcoal">
                  {name}
                  {item.quantity > 1 && (
                    <span className="ml-2 text-sm text-charcoal-subtle font-normal">
                      × {item.quantity}
                    </span>
                  )}
                </h3>
                {description && (
                  <p className="mt-1 text-sm text-charcoal-muted leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── Pricing sidebar ──────────────────────────────────────────────────────────

function PricingSidebar({ pkg }) {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  return (
    <aside className="w-full">
      <div className="sticky top-6 rounded-2xl border border-warm-gray-dark/30 bg-white shadow-lg p-6 space-y-5">
        <div>
          <p className="text-xs text-charcoal-subtle uppercase tracking-wider mb-1">
            {lang === "es" ? "Precio del paquete" : "Package price"}
          </p>
          <p className="text-3xl font-bold text-charcoal">
            {formatPrice(pkg.totalPrice, pkg.currency)}
            <span className="text-sm font-normal text-charcoal-subtle ml-1">
              {pkg.currency}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-charcoal-muted">
          {pkg.durationDays && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {pkg.durationDays} {pkg.durationDays === 1 ? "day" : "days"}
            </span>
          )}
          {pkg.capacity && (
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {lang === "es" ? `Máx. ${pkg.capacity}` : `Max ${pkg.capacity}`}
            </span>
          )}
        </div>

        <Button
          type="button"
          size="md"
          className="w-full"
          onClick={() =>
            navigate(`${ROUTES.CHECKOUT}?packageId=${pkg.$id}&slug=${pkg.slug}`)
          }
        >
          {lang === "es" ? "Reservar paquete" : "Book Package"}
        </Button>
      </div>
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PackageDetailPage() {
  const { slug } = useParams();
  const { pkg, items, experiences, galleryImageIds, loading, error } =
    usePackageDetail(slug);
  const { t, lang } = useLanguage();

  if (loading) return <LoadingSkeleton />;
  if (error === "not_found" || !pkg) return <NotFoundPage />;
  if (error) {
    return (
      <div className="container-shell py-20 text-center">
        <p className="text-charcoal-muted">
          {t("experienceDetail.somethingWrong")}
        </p>
      </div>
    );
  }

  const seoTitle = `${pkg.name} — OMZONE`;
  const seoDescription =
    pkg.description || pkg.descriptionEs || `${pkg.name} wellness package`;
  const seoImage = getPackagePreviewUrl(pkg.heroImageId, {
    width: 1200,
    height: 630,
  });

  return (
    <div className="min-h-screen bg-cream">
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        ogImage={seoImage}
        ogType="product"
        canonical={`${env.siteUrl}/packages/${pkg.slug}`}
      />

      {/* Hero */}
      <PackageHero pkg={pkg} />

      {/* Two-column layout on lg+ */}
      <div className="container-shell py-10 md:py-14">
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-12 lg:items-start">
          {/* Main column */}
          <div className="min-w-0">
            {/* Description (ES fallback) */}
            {(pkg.description || pkg.descriptionEs) && (
              <div className="py-6 md:py-8">
                <p className="text-charcoal-muted leading-relaxed whitespace-pre-wrap text-base">
                  {(lang === "es" && pkg.descriptionEs) ||
                    pkg.description ||
                    pkg.descriptionEs}
                </p>
              </div>
            )}

            {/* Gallery images */}
            {galleryImageIds.length > 0 && (
              <ExperienceGallery
                imageIds={galleryImageIds}
                alt={pkg.name}
                bucketId={env.bucketPackageImages}
              />
            )}

            {/* Package items */}
            {items.length > 0 && (
              <PackageItemsList items={items} experiences={experiences} />
            )}

            {/* Mobile pricing */}
            <div className="lg:hidden mt-10">
              <PricingSidebar pkg={pkg} />
            </div>
          </div>

          {/* Sidebar (lg+) */}
          <div className="hidden lg:block mt-2">
            <PricingSidebar pkg={pkg} />
          </div>
        </div>
      </div>
    </div>
  );
}
