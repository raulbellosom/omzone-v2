import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";

export default function TermsPage() {
  return (
    <section className="py-20 md:py-28">
      <SEOHead
        title="Terms of Service"
        description="Review the terms and conditions for using the OMZONE platform."
        canonical={`${env.siteUrl}/terms`}
      />

      <div className="container-shell max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
          Terms of Service
        </h1>
        <p className="text-center text-charcoal-muted mb-10">
          Please review our terms before using the platform.
        </p>
        <div className="prose prose-neutral mx-auto text-charcoal-muted text-sm leading-relaxed">
          <p>
            These terms of service will be updated with full details about the
            conditions of use for the OMZONE platform.
          </p>
          <p className="mt-4 text-charcoal-subtle italic">
            Full terms coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}
