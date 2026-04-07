import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import env from "@/config/env";
import { getPreviewUrl } from "@/hooks/useImagePreview";
import { getPublicationPreviewUrl } from "@/hooks/usePublicationBySlug";
import { useLanguage, localizedField } from "@/hooks/useLanguage";

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;

/**
 * Build SEOHead props from an experience entity.
 */
export function useExperienceSEO(
  experience,
  { slots = [], pricingTiers = [] } = {},
) {
  const location = useLocation();
  const { language } = useLanguage();

  return useMemo(() => {
    if (!experience) return {};

    const title =
      localizedField(experience, "seoTitle", language) ||
      localizedField(experience, "publicName", language);
    const description =
      localizedField(experience, "seoDescription", language) ||
      localizedField(experience, "shortDescription", language) ||
      "";
    const ogImageId = experience.ogImageId || experience.heroImageId;
    const ogImage = ogImageId
      ? String(getPreviewUrl(ogImageId, { width: OG_WIDTH, height: OG_HEIGHT }))
      : undefined;
    const canonical = `${env.siteUrl}/experiences/${experience.slug}`;

    // ── JSON-LD Event structured data ──
    const nextSlot = slots.find(
      (s) => s.status === "published" && new Date(s.startDatetime) > new Date(),
    );

    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: experience.publicName,
      description:
        experience.shortDescription || experience.shortDescriptionEs || "",
      ...(ogImage && { image: ogImage }),
      ...(nextSlot && {
        startDate: nextSlot.startDatetime,
        ...(nextSlot.endDatetime && { endDate: nextSlot.endDatetime }),
      }),
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      organizer: {
        "@type": "Organization",
        name: env.siteName,
        url: env.siteUrl,
      },
      location: {
        "@type": "Place",
        name: "OMZONE — Puerto Vallarta",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Puerto Vallarta",
          addressRegion: "Jalisco",
          addressCountry: "MX",
        },
      },
    };

    // Offers
    if (pricingTiers.length > 0) {
      const prices = pricingTiers.map((t) => t.basePrice).filter(Boolean);
      if (prices.length > 0) {
        structuredData.offers = {
          "@type": "AggregateOffer",
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          priceCurrency: pricingTiers[0].currency || "MXN",
          availability: nextSlot
            ? "https://schema.org/InStock"
            : "https://schema.org/SoldOut",
        };
      }
    }

    return {
      title,
      description,
      ogImage,
      ogType: "event",
      canonical,
      structuredData,
    };
  }, [experience, slots, pricingTiers, location.pathname, language]);
}

/**
 * Build SEOHead props from a publication entity.
 */
export function usePublicationSEO(publication) {
  const location = useLocation();
  const { language } = useLanguage();

  return useMemo(() => {
    if (!publication) return {};

    const title =
      localizedField(publication, "seoTitle", language) ||
      localizedField(publication, "title", language);
    const description =
      localizedField(publication, "seoDescription", language) ||
      localizedField(publication, "excerpt", language) ||
      "";
    const ogImageId = publication.ogImageId || publication.heroImageId;
    const ogImage = ogImageId
      ? String(
          getPublicationPreviewUrl(ogImageId, {
            width: OG_WIDTH,
            height: OG_HEIGHT,
          }),
        )
      : undefined;
    const canonical = `${env.siteUrl}/p/${publication.slug}`;

    return { title, description, ogImage, ogType: "article", canonical };
  }, [publication, location.pathname, language]);
}
