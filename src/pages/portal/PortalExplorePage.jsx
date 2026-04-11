import { Link } from "react-router-dom";
import { usePublicExperiences } from "@/hooks/usePublicExperiences";
import { usePublicPasses } from "@/hooks/usePublicPasses";
import { usePublicPublications } from "@/hooks/usePublicPublications";
import { useLanguage } from "@/hooks/useLanguage";
import ExperienceCard from "@/components/public/experiences/ExperienceCard";
import PassCard from "@/components/public/passes/PassCard";
import PublicationCard from "@/components/public/publications/PublicationCard";
import { ArrowRight, Compass, Sparkles, BookOpen } from "lucide-react";

function SectionHeader({ icon: Icon, title, linkTo, linkLabel }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-sage" />
        <h2 className="font-display text-lg font-semibold text-charcoal">
          {title}
        </h2>
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

export default function PortalExplorePage() {
  const { t } = useLanguage();

  const {
    experiences,
    priceMap,
    loading: loadingExp,
  } = usePublicExperiences();

  const { passes, loading: loadingPasses } = usePublicPasses();
  const { publications, loading: loadingPubs } = usePublicPublications();

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
        />
        {loadingExp ? (
          <CardSkeleton count={3} />
        ) : experiences.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.slice(0, 6).map((exp) => (
              <ExperienceCard
                key={exp.$id}
                experience={exp}
                priceInfo={priceMap[exp.$id]}
              />
            ))}
          </div>
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
          />
          {loadingPubs ? (
            <CardSkeleton count={3} aspect="aspect-video" />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {publications.slice(0, 6).map((pub) => (
                <PublicationCard key={pub.$id} publication={pub} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
