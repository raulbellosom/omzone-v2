import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";
import BillingRequestForm from "@/components/public/billing/BillingRequestForm";
import { FileText, CheckCircle, Send, HelpCircle } from "lucide-react";

export default function BillingRequestPage() {
  const { t } = useLanguage();

  return (
    <>
      <SEOHead
        title={t("billing.seoTitle")}
        description={t("billing.seoDescription")}
        canonical={`${env.siteUrl}/facturacion`}
      />

      {/* Hero */}
      <section className="bg-charcoal pt-24 pb-16">
        <div className="container-shell text-center max-w-2xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-sage mb-3">
            {t("billing.hero.eyebrow")}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-cream leading-tight">
            {t("billing.hero.title")}
          </h1>
          <p className="mt-4 text-charcoal-muted leading-relaxed">
            {t("billing.hero.subtitle")}
          </p>
        </div>
      </section>

      <section className="bg-cream py-16 md:py-24">
        <div className="container-shell">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-16 max-w-5xl mx-auto">
            {/* Form */}
            <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-sand/50 p-6 sm:p-8 md:p-10">
              <BillingRequestForm />
            </div>

            {/* How it works */}
            <aside className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="font-display text-lg font-semibold text-charcoal mb-5">
                  {t("billing.notice.title")}
                </h2>
                <ol className="space-y-4">
                  {[
                    { icon: FileText, text: t("billing.notice.step1") },
                    { icon: CheckCircle, text: t("billing.notice.step2") },
                    { icon: Send, text: t("billing.notice.step3") },
                  ].map(({ icon: Icon, text }, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="flex-shrink-0 h-7 w-7 rounded-full bg-sage/10 flex items-center justify-center mt-0.5">
                        <Icon className="h-3.5 w-3.5 text-sage" />
                      </span>
                      <p className="text-sm text-charcoal-muted leading-relaxed">{text}</p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-xl bg-sand/50 border border-sand p-5 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <HelpCircle className="h-4 w-4 text-charcoal-muted" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                    {t("billing.notice.help")}
                  </span>
                </div>
                <a
                  href="mailto:hello@omzone.com"
                  className="block text-sm font-medium text-sage hover:text-olive transition-colors"
                >
                  hello@omzone.com
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
