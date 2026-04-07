import { Mail, MapPin } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";

export default function ContactPage() {
  return (
    <section className="py-20 md:py-28">
      <SEOHead
        title="Contact"
        description="Get in touch with OMZONE in Puerto Vallarta. We'd love to hear from you about our wellness experiences."
        canonical={`${env.siteUrl}/contact`}
      />

      <div className="container-shell text-center max-w-2xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4">
          Contact
        </h1>
        <p className="text-lg text-charcoal-muted leading-relaxed mb-10">
          We&rsquo;d love to hear from you. Reach out and we&rsquo;ll get back
          to you as soon as possible.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-charcoal-muted">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-sage" />
            <span className="text-sm">hello@omzone.com</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-sage" />
            <span className="text-sm">Location coming soon</span>
          </div>
        </div>

        <p className="mt-12 text-sm text-charcoal-subtle">
          Full contact form coming soon.
        </p>
      </div>
    </section>
  );
}
