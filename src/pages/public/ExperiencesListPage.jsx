import { useState, useMemo } from "react";
import { usePublicExperiences } from "@/hooks/usePublicExperiences";
import { useLanguage } from "@/hooks/useLanguage";
import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";
import CatalogHero from "@/components/public/experiences/CatalogHero";
import ExperienceArticle from "@/components/public/experiences/ExperienceArticle";
import ExperienceFilters, {
  ExperienceFiltersSkeleton,
} from "@/components/public/experiences/ExperienceFilters";
import { Skeleton } from "@/components/common/Skeleton";
import Button from "@/components/common/Button";
import { Compass } from "lucide-react";

export default function ExperiencesListPage() {
  const {
    experiences,
    tags,
    experienceTagMap,
    loading,
    error,
    refetch,
  } = usePublicExperiences();

  const { t } = useLanguage();

  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedType, setSelectedType] = useState("");

  function handleToggleTag(tagId) {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId],
    );
  }

  function handleClearFilters() {
    setSelectedTags([]);
    setSelectedType("");
  }

  // Enrich experiences with tag names for display in articles
  const enriched = useMemo(() => {
    return experiences.map((exp) => {
      const tagIds = experienceTagMap[exp.$id] || [];
      const tagNames = tags
        .filter((t) => tagIds.includes(t.$id))
        .map((t) => t.name);
      return { ...exp, tagNames };
    });
  }, [experiences, experienceTagMap, tags]);

  const filtered = useMemo(() => {
    return enriched.filter((exp) => {
      if (selectedType && exp.type !== selectedType) return false;
      if (selectedTags.length > 0) {
        const expTags = experienceTagMap[exp.$id] || [];
        const hasAll = selectedTags.every((t) => expTags.includes(t));
        if (!hasAll) return false;
      }
      return true;
    });
  }, [enriched, selectedType, selectedTags, experienceTagMap]);

  const hasFilters = selectedTags.length > 0 || selectedType !== "";

  return (
    <>
      <SEOHead
        title={
          t("experienceList.title") + " — OMZONE | Wellness Puerto Vallarta"
        }
        description={t("experienceList.subtitle")}
        canonical={`${env.siteUrl}/experiences`}
      />

      {/* Hero banner */}
      <CatalogHero />

      {/* Filters bar — full-width, sticky */}
      <div className="sticky top-16 z-30 bg-cream/90 backdrop-blur-md border-b border-sand/60">
        <div className="container-shell py-4">
          {loading && <ExperienceFiltersSkeleton />}
          {!loading && experiences.length > 0 && (
            <ExperienceFilters
              tags={tags}
              selectedTags={selectedTags}
              selectedType={selectedType}
              onToggleTag={handleToggleTag}
              onSelectType={setSelectedType}
              onClear={handleClearFilters}
            />
          )}
        </div>
      </div>

      {/* Articles — full-width, no container */}
      <div className="bg-cream">
        {/* Loading skeleton */}
        {loading && (
          <div className="container-shell py-16">
            <ArticlesSkeleton />
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center py-20">
            <p className="text-charcoal-muted mb-4">
              {t("experienceList.errorLoading")}
            </p>
            <Button variant="outline" onClick={refetch}>
              {t("experienceList.tryAgain")}
            </Button>
          </div>
        )}

        {/* Empty — no experiences published */}
        {!loading && !error && experiences.length === 0 && (
          <div className="text-center py-20">
            <Compass className="mx-auto h-10 w-10 text-charcoal-subtle mb-4" />
            <p className="text-charcoal-muted text-lg">
              {t("experienceList.emptyTitle")}
            </p>
            <p className="text-charcoal-subtle text-sm mt-1">
              {t("experienceList.emptySubtitle")}
            </p>
          </div>
        )}

        {/* Empty — filters have no results */}
        {!loading &&
          !error &&
          experiences.length > 0 &&
          filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-charcoal-muted text-lg mb-4">
                {t("experienceList.noFilterResults")}
              </p>
              <Button variant="outline" onClick={handleClearFilters}>
                {t("experienceList.clearFilters")}
              </Button>
            </div>
          )}

        {/* Editorial articles — full-width, variant layouts cycle every 4 */}
        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col">
            {filtered.map((exp, i) => (
              <ExperienceArticle
                key={exp.$id}
                experience={exp}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ArticlesSkeleton() {
  return (
    <div className="flex flex-col gap-12">
      {/* Cinematic skeleton */}
      <Skeleton className="w-full h-[50vh] min-h-[400px] rounded-none" />
      {/* Split skeleton */}
      <div className="flex flex-col lg:flex-row gap-0">
        <Skeleton className="w-full lg:w-[55%] aspect-[16/10] lg:aspect-auto lg:min-h-[480px] rounded-none" />
        <div className="w-full lg:w-[45%] p-10 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      </div>
      {/* Split reverse skeleton */}
      <div className="flex flex-col lg:flex-row-reverse gap-0">
        <Skeleton className="w-full lg:w-[55%] aspect-[16/10] lg:aspect-auto lg:min-h-[480px] rounded-none" />
        <div className="w-full lg:w-[45%] p-10 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    </div>
  );
}
