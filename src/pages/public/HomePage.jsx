import Container from "@/components/common/Container";
import SEOHead from "@/components/common/SEOHead";
import { useLanguage } from "@/hooks/useLanguage";
import env from "@/config/env";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <section className="py-20">
      <SEOHead description={t("home.headline")} canonical={env.siteUrl} />

      <Container className="text-center">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-charcoal mb-4">
          OMZONE
        </h1>
        <p className="text-lg text-charcoal-muted max-w-2xl mx-auto">
          {t("home.headline")}
        </p>
        <p className="mt-8 text-sm text-charcoal-subtle">
          {t("home.placeholder")}
        </p>
      </Container>
    </section>
  );
}
