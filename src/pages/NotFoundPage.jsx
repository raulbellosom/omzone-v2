import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Container from "@/components/common/Container";
import { Button } from "@/components/common/Button";

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — OMZONE</title>
      </Helmet>
      <section className="py-24 md:py-32">
        <Container className="text-center max-w-lg mx-auto">
          <span className="font-display text-[8rem] md:text-[10rem] font-bold text-sage/15 leading-none select-none block">
            404
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-charcoal mb-3 -mt-6">
            Page not found
          </h1>
          <p className="text-charcoal-muted mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>
          <Button asChild size="lg">
            <Link to="/">Back to Home</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
