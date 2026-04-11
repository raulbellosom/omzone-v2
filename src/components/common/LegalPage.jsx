import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";

/**
 * Shared renderer for legal pages (Terms, Privacy, Refund Policy).
 * Reads structured section arrays from i18n and renders them as headed prose.
 *
 * @param {{ i18nPrefix: string, canonical: string }} props
 *   i18nPrefix – root key in landing.json, e.g. "terms", "privacy", "refund"
 *   canonical  – path for SEOHead canonical, e.g. "/terms"
 */
export default function LegalPage({ i18nPrefix, canonical }) {
  const { t, language } = useLanguage();

  const sections = t(`${i18nPrefix}.sections`, { returnObjects: true });

  return (
    <section className="py-20 md:py-28">
      <SEOHead
        title={t(`${i18nPrefix}.seoTitle`)}
        description={t(`${i18nPrefix}.seoDescription`)}
        canonical={`${env.siteUrl}${canonical}`}
      />

      <div className="container-shell max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
          {t(`${i18nPrefix}.title`)}
        </h1>

        <p className="text-center text-charcoal-muted mb-2">
          {t(`${i18nPrefix}.intro`)}
        </p>

        <p className="text-center text-xs text-charcoal-subtle mb-10">
          {t(`${i18nPrefix}.lastUpdated`)}
          {language !== "es" && (
            <span className="block mt-1 italic">
              {t(`${i18nPrefix}.legalDisclaimer`)}
            </span>
          )}
        </p>

        <div className="prose prose-neutral mx-auto text-charcoal-muted text-sm leading-relaxed">
          {Array.isArray(sections) &&
            sections.map((section, idx) => (
              <div key={idx} className="mb-8">
                <h2 className="text-lg font-semibold text-charcoal mb-3">
                  {section.heading}
                </h2>
                {Array.isArray(section.paragraphs) ? (
                  section.paragraphs.map((p, pIdx) => (
                    <p key={pIdx} className="mb-2">
                      {p}
                    </p>
                  ))
                ) : (
                  <p>{section.paragraphs}</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
