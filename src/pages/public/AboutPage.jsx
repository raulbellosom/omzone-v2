import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";

export default function AboutPage() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28">
      <SEOHead
        title={t("about.seoTitle")}
        description={t("about.seoDescription")}
        canonical={`${env.siteUrl}/about`}
      />

      <div className="container-shell text-center max-w-2xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4">
          {t("about.title")}
        </h1>
        <p className="text-lg text-charcoal-muted leading-relaxed mb-6">
          {t("about.intro")}
        </p>
        <p className="text-sm text-charcoal-subtle mb-8">
          {t("about.placeholder")}
        </p>
        <Link
          to={ROUTES.EXPERIENCES}
          className="inline-flex items-center gap-2 text-sm font-medium text-sage hover:text-sage-dark transition-colors"
        >
          {t("about.exploreLink")} &rarr;
        </Link>
      </div>
    </section>
  );
}
