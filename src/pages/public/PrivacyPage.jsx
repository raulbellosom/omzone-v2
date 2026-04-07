import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28">
      <SEOHead
        title={t("privacy.seoTitle")}
        description={t("privacy.seoDescription")}
        canonical={`${env.siteUrl}/privacy`}
      />

      <div className="container-shell max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
          {t("privacy.title")}
        </h1>
        <p className="text-center text-charcoal-muted mb-10">
          {t("privacy.intro")}
        </p>
        <div className="prose prose-neutral mx-auto text-charcoal-muted text-sm leading-relaxed">
          <p>
            {t("privacy.body")}
          </p>
          <p className="mt-4 text-charcoal-subtle italic">
            {t("privacy.placeholder")}
          </p>
        </div>
      </div>
    </section>
  );
}
