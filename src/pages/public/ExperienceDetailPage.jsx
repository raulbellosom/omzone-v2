import { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, Users } from "lucide-react";
import { useExperienceDetail } from "@/hooks/useExperienceDetail";
import { useExperienceSEO } from "@/hooks/useSEO";
import { useLanguage } from "@/hooks/useLanguage";
import SEOHead from "@/components/common/SEOHead";
import StructuredData from "@/components/common/StructuredData";
import ExperienceHero from "@/components/public/experience-detail/ExperienceHero";
import SectionRenderer from "@/components/public/experience-detail/SectionRenderer";
import PricingSection from "@/components/public/experience-detail/PricingSection";
import AgendaSection from "@/components/public/experience-detail/AgendaSection";
import AddonsSection from "@/components/public/experience-detail/AddonsSection";
import ExperienceGallery from "@/components/public/experience-detail/ExperienceGallery";
import ExperienceCTA from "@/components/public/experience-detail/ExperienceCTA";
import BookingRequestForm from "@/components/public/experience-detail/BookingRequestForm";
import NotFoundPage from "@/pages/NotFoundPage";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Hero skeleton */}
      <div className="w-full aspect-[16/9] md:aspect-[21/9] bg-warm-gray" />

      {/* Content skeleton */}
      <div className="container-shell py-12 space-y-6 max-w-3xl">
        <div className="h-6 w-24 rounded-full bg-warm-gray" />
        <div className="h-10 w-2/3 rounded-xl bg-warm-gray" />
        <div className="h-4 w-full rounded bg-warm-gray" />
        <div className="h-4 w-5/6 rounded bg-warm-gray" />
        <div className="h-4 w-4/6 rounded bg-warm-gray" />
      </div>

      {/* Pricing skeleton */}
      <div className="container-shell py-12">
        <div className="h-8 w-32 rounded-xl bg-warm-gray mb-6" />
        <div className="grid sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-warm-gray" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Long description block (no publication) ─────────────────────────────────

function LongDescriptionBlock({ experience }) {
  const text = experience.longDescription || experience.longDescriptionEs;
  if (!text) return null;
  return (
    <div className="py-10 md:py-14">
      <div className="text-charcoal-muted leading-relaxed whitespace-pre-wrap text-base">
        {text}
      </div>
    </div>
  );
}

// ─── Pricing sidebar (desktop sticky) ────────────────────────────────────────

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function PricingSidebar({ tiers, experience, selectedAddonIds = [] }) {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const CTA_CONFIG = {
    direct: { label: t("experienceDetail.bookNow"), variant: "default" },
    request: {
      label: t("experienceDetail.requestInformation"),
      variant: "outline",
    },
    assisted: {
      label: t("experienceDetail.checkAvailability"),
      variant: "outline",
    },
    pass: { label: t("experienceDetail.viewPasses"), variant: "outline" },
  };
  const cta = CTA_CONFIG[experience.saleMode] ?? CTA_CONFIG.direct;

  const minTier =
    tiers.length > 0
      ? tiers.reduce(
          (min, t) => (t.basePrice < min.basePrice ? t : min),
          tiers[0],
        )
      : null;

  return (
    <aside className="w-full">
      <div className="sticky top-6 rounded-2xl border border-warm-gray-dark/30 bg-white shadow-lg p-6 space-y-5">
        {/* Request mode: show form instead of pricing */}
        {experience.saleMode === "request" ? (
          <BookingRequestForm experience={experience} />
        ) : (
          <>
            {minTier && (
              <div>
                <p className="text-xs text-charcoal-subtle uppercase tracking-wider mb-1">
                  {t("experienceDetail.from")}
                </p>
                <p className="text-3xl font-bold text-charcoal">
                  {formatPrice(minTier.basePrice, minTier.currency)}
                  <span className="text-sm font-normal text-charcoal-subtle ml-1">
                    {minTier.currency}
                  </span>
                </p>
              </div>
            )}

            {tiers.length > 0 && (
              <div className="space-y-2">
                {tiers.map((tier) => (
                  <div
                    key={tier.$id}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2.5 text-sm",
                      tier.isHighlighted
                        ? "bg-sage/10 border border-sage/30"
                        : "bg-warm-gray/50",
                    )}
                  >
                    <span
                      className={cn(
                        "font-medium",
                        tier.isHighlighted ? "text-sage-dark" : "text-charcoal",
                      )}
                    >
                      {tier.name}
                      {tier.badge && (
                        <span className="ml-2 text-xs bg-sage text-white rounded-full px-2 py-0.5">
                          {tier.badge}
                        </span>
                      )}
                    </span>
                    <span className="font-semibold text-charcoal">
                      {formatPrice(tier.basePrice, tier.currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button
              type="button"
              variant={cta.variant}
              size="md"
              className="w-full"
              onClick={() => {
                if (experience.saleMode === "direct") {
                  const addonParam =
                    selectedAddonIds.length > 0
                      ? `&addonIds=${selectedAddonIds.join(",")}`
                      : "";
                  navigate(
                    `${ROUTES.CHECKOUT}?experienceId=${experience.$id}&slug=${experience.slug}${addonParam}`,
                  );
                }
              }}
            >
              {cta.label}
            </Button>

            {tiers.length === 0 && (
              <p className="text-sm text-charcoal-muted text-center italic">
                {t("experienceDetail.inquireForPricing")}
              </p>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExperienceDetailPage() {
  const { slug } = useParams();
  const { experience, pricingTiers, slots, addons, sections, loading, error } =
    useExperienceDetail(slug);
  const { t } = useLanguage();
  const seo = useExperienceSEO(experience, { slots, pricingTiers });

  // ─── Addon selection state ────────────────────────────────────────────
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const toggleAddon = useCallback((addonId) => {
    setSelectedAddonIds((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId],
    );
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error === "not_found" || !experience) return <NotFoundPage />;
  if (error) {
    return (
      <div className="container-shell py-20 text-center">
        <p className="text-charcoal-muted">
          {t("experienceDetail.somethingWrong")}
        </p>
      </div>
    );
  }

  const hasPublication = sections.length > 0;
  const showAgenda = experience.requiresSchedule && slots.length > 0;

  // Parse gallery image IDs (stored as JSON string)
  let galleryImageIds = [];
  if (experience.galleryImageIds) {
    try {
      const parsed = JSON.parse(experience.galleryImageIds);
      if (Array.isArray(parsed)) galleryImageIds = parsed.filter(Boolean);
    } catch {
      // invalid JSON — skip gallery
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <SEOHead
        title={seo.title}
        description={seo.description}
        ogImage={seo.ogImage}
        ogType={seo.ogType}
        canonical={seo.canonical}
      />
      <StructuredData data={seo.structuredData} />

      {/* Hero — full width, extends under navbar */}
      <ExperienceHero experience={experience} />

      {/* ── Two-column layout on lg+: main content | pricing sidebar ── */}
      <div className="container-shell py-10 md:py-14">
        <div className="lg:grid lg:grid-cols-[1fr_360px] lg:gap-12 lg:items-start">
          {/* ── Main column ── */}
          <div className="min-w-0">
            {/* Editorial sections */}
            {hasPublication && <SectionRenderer sections={sections} />}
            {!hasPublication && (
              <LongDescriptionBlock experience={experience} />
            )}

            {/* Gallery images */}
            {galleryImageIds.length > 0 && (
              <ExperienceGallery
                imageIds={galleryImageIds}
                alt={experience.publicName}
              />
            )}

            {/* Agenda — inside main column */}
            {showAgenda && (
              <div className="-mx-4 md:mx-0">
                <AgendaSection slots={slots} />
              </div>
            )}

            {/* Addons — inside main column, selectable */}
            <AddonsSection
              addons={addons}
              selectedAddonIds={selectedAddonIds}
              onToggleAddon={toggleAddon}
            />

            {/* Pricing full-width on mobile (hidden on lg where sidebar shows) */}
            <div className="lg:hidden mt-10">
              {experience.saleMode === "request" ? (
                <div className="rounded-2xl border border-warm-gray-dark/30 bg-white shadow-lg p-6">
                  <BookingRequestForm experience={experience} />
                </div>
              ) : (
                <PricingSection tiers={pricingTiers} />
              )}
            </div>
          </div>

          {/* ── Sidebar: pricing (lg+) ── */}
          <div className="hidden lg:block mt-2">
            <PricingSidebar
              tiers={pricingTiers}
              experience={experience}
              selectedAddonIds={selectedAddonIds}
            />
          </div>
        </div>
      </div>

      {/* CTA full-width */}
      <ExperienceCTA
        experience={experience}
        selectedAddonIds={selectedAddonIds}
      />
    </div>
  );
}
