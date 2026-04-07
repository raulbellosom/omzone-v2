import { Mail, MapPin } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";

export default function ContactPage() {
  const { t } = useLanguage();

  return (
    <section className="py-20 md:py-28">
      <SEOHead
        title={t("contact.seoTitle")}
        description={t("contact.seoDescription")}
        canonical={`${env.siteUrl}/contact`}
      />

      <div className="container-shell text-center max-w-2xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4">
          {t("contact.title")}
        </h1>
        <p className="text-lg text-charcoal-muted leading-relaxed mb-10">
          {t("contact.intro")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-charcoal-muted">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-sage" />
            <span className="text-sm">{t("contact.email")}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-sage" />
            <span className="text-sm">{t("contact.locationPlaceholder")}</span>
          </div>
        </div>

        <p className="mt-12 text-sm text-charcoal-subtle">
          {t("contact.formPlaceholder")}
        </p>
      </div>
    </section>
  );
}
