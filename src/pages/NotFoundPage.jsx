import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Container from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { useLanguage } from "@/hooks/useLanguage";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t("notFound.seoTitle")}</title>
      </Helmet>
      <section className="py-24 md:py-32">
        <Container className="text-center max-w-lg mx-auto">
          <span className="font-display text-[8rem] md:text-[10rem] font-bold text-sage/15 leading-none select-none block">
            404
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-charcoal mb-3 -mt-6">
            {t("notFound.title")}
          </h1>
          <p className="text-charcoal-muted mb-8 leading-relaxed">
            {t("notFound.description")}
          </p>
          <Button asChild size="lg">
            <Link to="/">{t("notFound.backHome")}</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
