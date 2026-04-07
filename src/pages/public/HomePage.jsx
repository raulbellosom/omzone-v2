import Container from "@/components/common/Container";
import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";

export default function HomePage() {
  return (
    <section className="py-20">
      <SEOHead
        description="Discover transformative wellness experiences in Puerto Vallarta — sound healing, meditation, breathwork, retreats and immersions in Bahía de Banderas."
        canonical={env.siteUrl}
      />

      <Container className="text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal mb-4">
          OMZONE
        </h1>
        <p className="text-lg text-charcoal-muted max-w-2xl mx-auto">
          Discover transformative wellness experiences crafted for your mind,
          body and soul.
        </p>
        <p className="mt-8 text-sm text-charcoal-subtle">
          Home page placeholder — se implementa en tasks posteriores
        </p>
      </Container>
    </section>
  );
}
