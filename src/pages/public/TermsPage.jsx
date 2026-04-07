import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28">
      <SEOHead
        title={t("terms.seoTitle")}
        description={t("terms.seoDescription")}
        canonical={`${env.siteUrl}/terms`}
      />

      <div className="container-shell max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
          {t("terms.title")}
        </h1>
        <p className="text-center text-charcoal-muted mb-10">
          {t("terms.intro")}
        </p>
        <div className="prose prose-neutral mx-auto text-charcoal-muted text-sm leading-relaxed">
          <p>
            {t("terms.body")}
          </p>
          <p className="mt-4 text-charcoal-subtle italic">
            {t("terms.placeholder")}
          </p>
        </div>
      </div>
    </section>
  );
}
