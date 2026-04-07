import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Container from "@/components/common/Container";
import { Button } from "@/components/common/Button";
import { ShieldOff } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export default function ForbiddenPage() {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t("forbidden.seoTitle")}</title>
      </Helmet>
      <section className="py-24 md:py-32">
        <Container className="text-center max-w-lg mx-auto">
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-full bg-sand flex items-center justify-center">
              <ShieldOff className="w-7 h-7 text-charcoal-muted" />
            </div>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-charcoal mb-3">
            {t("forbidden.title")}
          </h1>
          <p className="text-charcoal-muted mb-8 leading-relaxed">
            {t("forbidden.description")}
          </p>
          <Button asChild size="lg">
            <Link to="/">{t("forbidden.backHome")}</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
