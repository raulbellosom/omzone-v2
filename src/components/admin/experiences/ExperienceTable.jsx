import { Link } from "react-router-dom";
import TypeChip from "./TypeChip";
import SaleModeChip from "./SaleModeChip";
import StatusBadge from "./StatusBadge";
import ExperienceActionsMenu from "./ExperienceActionsMenu";
import { useLanguage, localizedField } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";
import env from "@/config/env";

function Thumbnail({ heroImageId }) {
  if (!heroImageId) {
    return <div className="w-12 h-9 rounded-lg bg-warm-gray shrink-0" />;
  }
  const src = `${env.appwriteEndpoint}/storage/buckets/${env.bucketExperienceMedia}/files/${heroImageId}/preview?project=${env.appwriteProjectId}&width=96&height=72`;
  return (
    <img
      src={src}
      alt=""
      className="w-12 h-9 rounded-lg object-cover bg-warm-gray shrink-0"
    />
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand">
      <td className="px-3 py-2.5 w-16">
        <div className="w-12 h-9 rounded-lg bg-warm-gray animate-pulse" />
      </td>
      {[160, 80, 80, 72, 56].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded bg-warm-gray animate-pulse"
            style={{ width: `${w}px` }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function ExperienceTable({
  experiences,
  loading,
  onStatusChange,
  canAdmin,
}) {
  const { t, language } = useLanguage();

  return (
    <div className="overflow-x-auto rounded-xl border border-sand-dark">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-warm-gray/50">
            <th className="px-3 py-3 w-16">
              <span className="sr-only">Cover</span>
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.experienceActions.tableHeaders.name")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.experienceActions.tableHeaders.type")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden sm:table-cell">
              {t("admin.experienceActions.tableHeaders.saleMode")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.experienceActions.tableHeaders.status")}
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.experienceActions.tableHeaders.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading && Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && experiences.length === 0 && (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-12 text-center text-sm text-charcoal-subtle"
              >
                {t("admin.experienceActions.noExperiences")}
              </td>
            </tr>
          )}

          {!loading &&
            experiences.map((exp) => {
              const editUrl = ROUTES.ADMIN_EXPERIENCE_EDIT.replace(":id", exp.$id);
              return (
                <tr
                  key={exp.$id}
                  className="group border-b border-sand last:border-0 hover:bg-warm-gray/40 transition-colors"
                >
                  {/* Thumbnail */}
                  <td className="px-3 py-2.5 w-16">
                    <Thumbnail heroImageId={exp.heroImageId} />
                  </td>

                  {/* Name */}
                  <td className="px-4 py-3">
                    <div>
                      <Link
                        to={editUrl}
                        className="font-medium text-charcoal hover:text-sage-dark hover:underline underline-offset-2 transition-colors truncate max-w-xs block"
                      >
                        {localizedField(exp, "publicName", language)}
                      </Link>
                      <p className="text-xs text-charcoal-subtle truncate max-w-xs mt-0.5">
                        {localizedField(exp, "name", language)}
                      </p>
                    </div>
                  </td>

                  {/* Type chip */}
                  <td className="px-4 py-3">
                    <TypeChip type={exp.type} />
                  </td>

                  {/* Sale mode chip */}
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <SaleModeChip saleMode={exp.saleMode} />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <StatusBadge status={exp.status} />
                  </td>

                  {/* Actions — visible on row hover */}
                  <td className="px-4 py-3">
                    <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex justify-end">
                      <ExperienceActionsMenu
                        experience={exp}
                        onStatusChange={onStatusChange}
                        canAdmin={canAdmin}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
