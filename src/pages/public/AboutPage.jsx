import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";

export default function AboutPage() {
  return (
    <section className="py-20 md:py-28">
      <SEOHead
        title="About OMZONE — Wellness in Puerto Vallarta"
        description="Premium wellness experiences in Puerto Vallarta and Bahía de Banderas. Our story, philosophy and commitment to transformation."
        canonical={`${env.siteUrl}/about`}
      />

      <div className="container-shell text-center max-w-2xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-charcoal mb-4">
          About OMZONE
        </h1>
        <p className="text-lg text-charcoal-muted leading-relaxed mb-6">
          We curate transformative wellness experiences — sessions, immersions,
          retreats and stays — designed to nurture your body, mind and spirit.
        </p>
        <p className="text-sm text-charcoal-subtle mb-8">
          Full content coming soon.
        </p>
        <Link
          to={ROUTES.EXPERIENCES}
          className="inline-flex items-center gap-2 text-sm font-medium text-sage hover:text-sage-dark transition-colors"
        >
          Explore our experiences &rarr;
        </Link>
      </div>
    </section>
  );
}
