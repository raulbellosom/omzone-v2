import { Link } from "react-router-dom";
import TypeChip from "./TypeChip";
import SaleModeChip from "./SaleModeChip";
import StatusBadge from "./StatusBadge";
import ExperienceActionsMenu from "./ExperienceActionsMenu";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import env from "@/config/env";

function CoverImage({ heroImageId }) {
  if (!heroImageId) {
    return (
      <div className="w-full aspect-video bg-warm-gray flex items-center justify-center">
        <span className="text-charcoal-subtle/40 text-xs select-none">No image</span>
      </div>
    );
  }
  const src = `${env.appwriteEndpoint}/storage/buckets/${env.bucketExperienceMedia}/files/${heroImageId}/preview?project=${env.appwriteProjectId}&width=400&height=225`;
  return (
    <img
      src={src}
      alt=""
      className="w-full aspect-video object-cover"
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-sand-dark/30 bg-white animate-pulse">
      <div className="aspect-video bg-warm-gray" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 rounded-lg bg-warm-gray" />
        <div className="h-3 w-1/2 rounded-lg bg-warm-gray" />
        <div className="h-5 w-16 rounded-full bg-warm-gray mt-3" />
      </div>
    </div>
  );
}

export default function ExperienceGridView({
  experiences,
  loading,
  onStatusChange,
  canAdmin,
}) {
  const { language } = useLanguage();

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      {experiences.map((exp) => {
        const editUrl = ROUTES.ADMIN_EXPERIENCE_EDIT.replace(":id", exp.$id);
        return (
          <div
            key={exp.$id}
            className="group rounded-2xl overflow-hidden border border-sand-dark/30 bg-white shadow-card hover:shadow-hover transition-shadow flex flex-col"
          >
            {/* Cover image with overlaid chips */}
            <Link to={editUrl} className="relative block overflow-hidden flex-shrink-0">
              <CoverImage heroImageId={exp.heroImageId} />
              <span className="absolute top-2 left-2">
                <TypeChip type={exp.type} />
              </span>
              <span className="absolute top-2 right-2">
                <StatusBadge status={exp.status} />
              </span>
            </Link>

            {/* Card body */}
            <div className="p-3 flex flex-col flex-1 gap-1">
              <Link
                to={editUrl}
                className="font-medium text-charcoal text-sm leading-snug line-clamp-2 hover:text-sage-dark transition-colors"
              >
                {localizedField(exp, "publicName", language)}
              </Link>
              <p className="text-xs text-charcoal-subtle truncate">
                {localizedField(exp, "name", language)}
              </p>

              <div className="flex items-center justify-between pt-2 mt-auto">
                <SaleModeChip saleMode={exp.saleMode} />
                <ExperienceActionsMenu
                  experience={exp}
                  onStatusChange={onStatusChange}
                  canAdmin={canAdmin}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
