import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";

export default function PrivacyPage() {
  return (
    <section className="py-20 md:py-28">
      <SEOHead
        title="Privacy Policy"
        description="Learn how OMZONE collects, uses and protects your personal information."
        canonical={`${env.siteUrl}/privacy`}
      />

      <div className="container-shell max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4 text-center">
          Privacy Policy
        </h1>
        <p className="text-center text-charcoal-muted mb-10">
          Your privacy matters to us.
        </p>
        <div className="prose prose-neutral mx-auto text-charcoal-muted text-sm leading-relaxed">
          <p>
            This privacy policy will be updated with full details about how
            OMZONE collects, uses and protects your personal information.
          </p>
          <p className="mt-4 text-charcoal-subtle italic">
            Full policy coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}
