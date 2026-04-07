import { useState, useMemo } from "react";
import { usePublicExperiences } from "@/hooks/usePublicExperiences";
import SEOHead from "@/components/common/SEOHead";
import env from "@/config/env";
import ExperienceCard from "@/components/public/experiences/ExperienceCard";
import ExperienceFilters, {
  ExperienceFiltersSkeleton,
} from "@/components/public/experiences/ExperienceFilters";
import { Skeleton } from "@/components/common/skeleton";
import Button from "@/components/common/Button";
import { Compass } from "lucide-react";

export default function ExperiencesListPage() {
  const {
    experiences,
    tags,
    experienceTagMap,
    priceMap,
    loading,
    error,
    refetch,
  } = usePublicExperiences();

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

  const filtered = useMemo(() => {
    return experiences.filter((exp) => {
      if (selectedType && exp.type !== selectedType) return false;
      if (selectedTags.length > 0) {
        const expTags = experienceTagMap[exp.$id] || [];
        const hasAll = selectedTags.every((t) => expTags.includes(t));
        if (!hasAll) return false;
      }
      return true;
    });
  }, [experiences, selectedType, selectedTags, experienceTagMap]);

  const hasFilters = selectedTags.length > 0 || selectedType !== "";

  return (
    <section className="container-shell pb-16 pt-2">
      <SEOHead
        title="Wellness Experiences in Puerto Vallarta"
        description="Explore sound healing, meditation, breathwork and holistic retreats in Bahía de Banderas. Book your next transformative experience."
        canonical={`${env.siteUrl}/experiences`}
      />

      {/* Header */}
      <div className="mb-8 md:mb-10">
        <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal">
          Experiences
        </h1>
        <p className="mt-2 text-charcoal-muted text-base md:text-lg max-w-2xl">
          Discover transformative wellness experiences crafted for your mind,
          body and soul.
        </p>
      </div>

      {/* Filters — skeleton while loading, real once loaded */}
      {loading && (
        <div className="mb-8">
          <ExperienceFiltersSkeleton />
        </div>
      )}
      {!loading && experiences.length > 0 && (
        <div className="mb-8">
          <ExperienceFilters
            tags={tags}
            selectedTags={selectedTags}
            selectedType={selectedType}
            onToggleTag={handleToggleTag}
            onSelectType={setSelectedType}
            onClear={handleClearFilters}
          />
        </div>
      )}

      {/* Loading skeleton — cards */}
      {loading && <LoadingSkeleton />}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center py-16">
          <p className="text-charcoal-muted mb-4">
            We couldn't load the experiences right now.
          </p>
          <Button variant="outline" onClick={refetch}>
            Try again
          </Button>
        </div>
      )}

      {/* Empty — no experiences published */}
      {!loading && !error && experiences.length === 0 && (
        <div className="text-center py-16">
          <Compass className="mx-auto h-10 w-10 text-charcoal-subtle mb-4" />
          <p className="text-charcoal-muted text-lg">
            No experiences available at the moment.
          </p>
          <p className="text-charcoal-subtle text-sm mt-1">
            Check back soon — new experiences are always on the way.
          </p>
        </div>
      )}

      {/* Empty — filters have no results */}
      {!loading &&
        !error &&
        experiences.length > 0 &&
        filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-charcoal-muted text-lg mb-4">
              No experiences match your current filters.
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear filters
            </Button>
          </div>
        )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {filtered.map((exp) => (
            <ExperienceCard
              key={exp.$id}
              experience={exp}
              priceInfo={priceMap[exp.$id] || null}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl bg-white border border-warm-gray-dark/30 overflow-hidden"
        >
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="pt-3 border-t border-warm-gray-dark/20">
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
