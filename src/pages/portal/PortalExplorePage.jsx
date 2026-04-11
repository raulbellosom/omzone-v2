import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { usePublicExperiences } from "@/hooks/usePublicExperiences";
import { usePublicPasses } from "@/hooks/usePublicPasses";
import { usePublicPublications } from "@/hooks/usePublicPublications";
import { useLanguage } from "@/hooks/useLanguage";
import ExperienceCard from "@/components/public/experiences/ExperienceCard";
import PassCard from "@/components/public/passes/PassCard";
import PublicationCard from "@/components/public/publications/PublicationCard";
import { ArrowRight, Compass, Sparkles, BookOpen } from "lucide-react";

function SectionHeader({ icon: Icon, title, linkTo, linkLabel, count }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-sage" />
        <h2 className="font-display text-lg font-semibold text-charcoal">
          {title}
        </h2>
        {count != null && (
          <span className="text-xs text-charcoal-subtle font-medium tabular-nums">
            ({count})
          </span>
        )}
      </div>
      {linkTo && (
        <Link
          to={linkTo}
          className="text-xs text-sage font-medium hover:underline flex items-center gap-1"
        >
          {linkLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

function FilterPills({ options, selected, onSelect, allLabel }) {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1 mb-4">
      <button
        onClick={() => onSelect("")}
        className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
          !selected
            ? "bg-charcoal text-white shadow-sm"
            : "bg-warm-gray text-charcoal-muted hover:bg-sand hover:text-charcoal"
        }`}
      >
        {allLabel}
      </button>
      {options.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onSelect(selected === value ? "" : value)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
            selected === value
              ? "bg-charcoal text-white shadow-sm"
              : "bg-warm-gray text-charcoal-muted hover:bg-sand hover:text-charcoal"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function CardSkeleton({ count = 3, aspect = "aspect-4/3" }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-warm-gray-dark/10 overflow-hidden animate-pulse"
        >
          <div className={`${aspect} bg-warm-gray/30`} />
          <div className="p-5 space-y-3">
            <div className="h-4 w-20 rounded bg-warm-gray/40" />
            <div className="h-5 w-3/4 rounded bg-warm-gray/40" />
            <div className="h-3 w-full rounded bg-warm-gray/30" />
          </div>
        </div>
      ))}
    </div>
  );
}

const EXP_TYPE_OPTIONS = [
  { value: "session", labelKey: "experienceTypes.session" },
  { value: "immersion", labelKey: "experienceTypes.immersion" },
  { value: "retreat", labelKey: "experienceTypes.retreat" },
  { value: "stay", labelKey: "experienceTypes.stay" },
  { value: "private", labelKey: "experienceTypes.private" },
];

const PUB_CATEGORY_OPTIONS = [
  { value: "blog", labelKey: "publications.category.blog" },
  { value: "highlight", labelKey: "publications.category.highlight" },
  { value: "landing", labelKey: "publications.category.landing" },
  { value: "institutional", labelKey: "publications.category.institutional" },
  { value: "faq", labelKey: "publications.category.faq" },
];

export default function PortalExplorePage() {
  const { t } = useLanguage();

  const {
    experiences,
    priceMap,
    loading: loadingExp,
  } = usePublicExperiences();

  const { passes, loading: loadingPasses } = usePublicPasses();
  const { publications, loading: loadingPubs } = usePublicPublications();

  const [expType, setExpType] = useState("");
  const [pubCategory, setPubCategory] = useState("");

  // Filter experiences by type
  const filteredExp = useMemo(() => {
    if (!expType) return experiences;
    return experiences.filter((e) => e.type === expType);
  }, [experiences, expType]);

  // Filter publications by category — only show categories that exist in data
  const availableCategories = useMemo(() => {
    const cats = new Set(publications.map((p) => p.category));
    return PUB_CATEGORY_OPTIONS.filter((o) => cats.has(o.value));
  }, [publications]);

  const filteredPubs = useMemo(() => {
    if (!pubCategory) return publications;
    return publications.filter((p) => p.category === pubCategory);
  }, [publications, pubCategory]);

  // Translate type options
  const expTypeOptions = useMemo(
    () => EXP_TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) })),
    [t],
  );

  const pubCatOptions = useMemo(
    () => availableCategories.map((o) => ({ value: o.value, label: t(o.labelKey) })),
    [availableCategories, t],
  );

  return (
    <div className="space-y-10">
      {/* Hero / welcome */}
      <div className="text-center py-4">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-charcoal">
          {t("portal.explore.heading")}
        </h1>
        <p className="text-sm text-charcoal-muted mt-1 max-w-md mx-auto">
          {t("portal.explore.subtitle")}
        </p>
      </div>

      {/* Experiences section */}
      <section>
        <SectionHeader
          icon={Compass}
          title={t("portal.explore.experiences")}
          linkTo="/experiences"
          linkLabel={t("portal.explore.viewAll")}
          count={!loadingExp && experiences.length > 0 ? filteredExp.length : undefined}
        />
        {!loadingExp && experiences.length > 0 && (
          <FilterPills
            options={expTypeOptions}
            selected={expType}
            onSelect={setExpType}
            allLabel={t("portal.explore.allTypes")}
          />
        )}
        {loadingExp ? (
          <CardSkeleton count={3} />
        ) : filteredExp.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredExp.slice(0, 6).map((exp) => (
              <ExperienceCard
                key={exp.$id}
                experience={exp}
                priceInfo={priceMap[exp.$id]}
              />
            ))}
          </div>
        ) : experiences.length > 0 ? (
          <p className="text-sm text-charcoal-muted text-center py-8">
            {t("portal.explore.noFilterResults")}
          </p>
        ) : (
          <p className="text-sm text-charcoal-muted text-center py-8">
            {t("portal.explore.noExperiences")}
          </p>
        )}
      </section>

      {/* Passes section */}
      {(loadingPasses || passes.length > 0) && (
        <section>
          <SectionHeader
            icon={Sparkles}
            title={t("portal.explore.passes")}
            linkTo="/passes"
            linkLabel={t("portal.explore.viewAll")}
          />
          {loadingPasses ? (
            <CardSkeleton count={3} aspect="aspect-video" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {passes.slice(0, 6).map((pass) => (
                <PassCard key={pass.$id} pass={pass} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Publications section */}
      {(loadingPubs || publications.length > 0) && (
        <section>
          <SectionHeader
            icon={BookOpen}
            title={t("portal.explore.publications")}
            linkTo="/publications"
            linkLabel={t("portal.explore.viewAll")}
            count={!loadingPubs && publications.length > 0 ? filteredPubs.length : undefined}
          />
          {!loadingPubs && availableCategories.length > 1 && (
            <FilterPills
              options={pubCatOptions}
              selected={pubCategory}
              onSelect={setPubCategory}
              allLabel={t("portal.explore.allCategories")}
            />
          )}
          {loadingPubs ? (
            <CardSkeleton count={3} aspect="aspect-video" />
          ) : filteredPubs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPubs.slice(0, 6).map((pub) => (
                <PublicationCard key={pub.$id} publication={pub} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-charcoal-muted text-center py-8">
              {t("portal.explore.noFilterResults")}
            </p>
          )}
        </section>
      )}
    </div>
  );
}
