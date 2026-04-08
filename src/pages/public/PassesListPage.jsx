import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { usePublicPasses } from "@/hooks/usePublicPasses";
import { useLanguage } from "@/hooks/useLanguage";
import SEOHead from "@/components/common/SEOHead";
import PassCard from "@/components/public/passes/PassCard";
import Button from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { Ticket } from "lucide-react";
import env from "@/config/env";

export default function PassesListPage() {
  const { passes, loading, error, refetch } = usePublicPasses();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const experienceFilter = searchParams.get("experience");

  // If ?experience= is present, sort matching passes first
  const sorted = useMemo(() => {
    if (!experienceFilter || passes.length === 0) return passes;

    return [...passes].sort((a, b) => {
      const aValid = parseIds(a.validExperienceIds);
      const bValid = parseIds(b.validExperienceIds);
      const aMatch = aValid.includes(experienceFilter);
      const bMatch = bValid.includes(experienceFilter);
      if (aMatch && !bMatch) return -1;
      if (!aMatch && bMatch) return 1;
      return 0;
    });
  }, [passes, experienceFilter]);

  return (
    <>
      <SEOHead
        title={t("passes.pageTitle")}
        description={t("passes.pageDescription")}
        canonical={`${env.siteUrl}/passes`}
      />

      {/* Hero section */}
      <section className="bg-charcoal text-cream py-16 md:py-24">
        <div className="container-shell text-center">
          <Ticket className="mx-auto h-10 w-10 text-sage mb-4" />
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t("passes.heroTitle")}
          </h1>
          <p className="text-cream/70 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t("passes.heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Pass grid */}
      <section className="bg-cream py-12 md:py-20">
        <div className="container-shell">
          {/* Loading */}
          {loading && <PassGridSkeleton />}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-16">
              <p className="text-charcoal-muted mb-4">
                {t("passes.errorLoading")}
              </p>
              <Button variant="outline" onClick={refetch}>
                {t("passes.tryAgain")}
              </Button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && passes.length === 0 && (
            <div className="text-center py-16">
              <Ticket className="mx-auto h-10 w-10 text-charcoal-subtle mb-4" />
              <p className="text-charcoal-muted text-lg">
                {t("passes.emptyTitle")}
              </p>
              <p className="text-charcoal-subtle text-sm mt-1">
                {t("passes.emptySubtitle")}
              </p>
            </div>
          )}

          {/* Grid */}
          {!loading && !error && sorted.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {sorted.map((pass) => (
                <PassCard key={pass.$id} pass={pass} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function PassGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden bg-white border border-warm-gray-dark/30"
        >
          <Skeleton className="aspect-video rounded-none" />
          <div className="p-5 space-y-3">
            <div className="flex gap-2">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-3 border-t border-warm-gray-dark/20">
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function parseIds(json) {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
