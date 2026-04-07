import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";
import useContactForm from "@/hooks/useContactForm";
import ContactHero from "@/components/public/contact/ContactHero";
import ContactForm from "@/components/public/contact/ContactForm";
import ContactInfo from "@/components/public/contact/ContactInfo";

export default function ContactPage() {
  const { t } = useLanguage();
  const { form, errors, status, handleChange, submit, reset } = useContactForm(t);

  return (
    <>
      <SEOHead
        title={t("contact.seoTitle")}
        description={t("contact.seoDescription")}
        canonical={`${env.siteUrl}/contact`}
      />

      <ContactHero />

      {/* Form + Info */}
      <section className="bg-cream py-16 md:py-24">
        <div className="container-shell">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-10 lg:gap-16 max-w-5xl mx-auto">
            {/* Form — takes 3 of 5 cols on desktop */}
            <div className="md:col-span-1 lg:col-span-3 bg-white rounded-2xl shadow-sm border border-sand/50 p-6 sm:p-8 md:p-10">
              <ContactForm
                form={form}
                errors={errors}
                status={status}
                handleChange={handleChange}
                submit={submit}
                reset={reset}
              />
            </div>

            {/* Info — takes 2 of 5 cols */}
            <div className="lg:col-span-2">
              <ContactInfo />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
