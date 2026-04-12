import { useState, useMemo } from "react";
import { usePublicPublications } from "@/hooks/usePublicPublications";
import { useLanguage } from "@/hooks/useLanguage";
import SEOHead from "@/components/common/SEOHead";
import PublicationCard from "@/components/public/publications/PublicationCard";
import Button from "@/components/common/Button";
import { Skeleton } from "@/components/common/Skeleton";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import env from "@/config/env";

const CATEGORIES = ["blog", "highlight", "landing", "institutional", "faq"];

export default function PublicationsListPage() {
  const { publications, loading, error, refetch } = usePublicPublications();
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("");

  const filtered = useMemo(() => {
    if (!selectedCategory) return publications;
    return publications.filter((p) => p.category === selectedCategory);
  }, [publications, selectedCategory]);

  // Only show category pills for categories that have at least one publication
  const availableCategories = useMemo(() => {
    const cats = new Set(publications.map((p) => p.category).filter(Boolean));
    return CATEGORIES.filter((c) => cats.has(c));
  }, [publications]);

  return (
    <>
      <SEOHead
        title={t("publications.pageTitle")}
        description={t("publications.pageDescription")}
        canonical={`${env.siteUrl}/publications`}
      />

      {/* Hero section */}
      <section className="bg-charcoal text-cream pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="container-shell text-center">
          <BookOpen className="mx-auto h-10 w-10 text-sage mb-4" />
          <h1 className="font-display text-3xl md:text-5xl font-bold mb-4">
            {t("publications.heroTitle")}
          </h1>
          <p className="text-cream/70 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
            {t("publications.heroSubtitle")}
          </p>
        </div>
      </section>

      {/* Category filter pills */}
      {!loading && availableCategories.length > 1 && (
        <div className="sticky top-16 z-30 bg-cream/90 backdrop-blur-md border-b border-sand/60">
          <div className="container-shell py-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedCategory("")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                  !selectedCategory
                    ? "bg-charcoal text-cream"
                    : "bg-warm-gray/40 text-charcoal hover:bg-warm-gray/60",
                )}
              >
                {t("publications.allCategories")}
              </button>
              {availableCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-sm font-medium transition-colors",
                    selectedCategory === cat
                      ? "bg-charcoal text-cream"
                      : "bg-warm-gray/40 text-charcoal hover:bg-warm-gray/60",
                  )}
                >
                  {t(`publications.category.${cat}`) || cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Publications grid */}
      <section className="bg-cream py-12 md:py-20">
        <div className="container-shell">
          {/* Loading */}
          {loading && <PublicationGridSkeleton />}

          {/* Error */}
          {!loading && error && (
            <div className="text-center py-16">
              <p className="text-charcoal-muted mb-4">
                {t("publications.errorLoading")}
              </p>
              <Button variant="outline" onClick={refetch}>
                {t("publications.tryAgain")}
              </Button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && publications.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-10 w-10 text-charcoal-subtle mb-4" />
              <p className="text-charcoal-muted text-lg">
                {t("publications.emptyTitle")}
              </p>
              <p className="text-charcoal-subtle text-sm mt-1">
                {t("publications.emptySubtitle")}
              </p>
            </div>
          )}

          {/* No results for filter */}
          {!loading &&
            !error &&
            publications.length > 0 &&
            filtered.length === 0 && (
              <div className="text-center py-16">
                <p className="text-charcoal-muted text-lg mb-4">
                  {t("publications.noFilterResults")}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory("")}
                >
                  {t("publications.clearFilter")}
                </Button>
              </div>
            )}

          {/* Grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filtered.map((pub) => (
                <PublicationCard key={pub.$id} publication={pub} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function PublicationGridSkeleton() {
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
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
