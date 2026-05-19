import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Plus, Pencil, Calendar, Users } from "lucide-react";
import { useEditions } from "@/hooks/useEditions";
import { useExperience } from "@/hooks/useExperiences";
import { useArchive } from "@/hooks/useArchive";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import AdminSelect from "@/components/common/AdminSelect";
import ArchiveActionsMenu from "@/components/admin/ArchiveActionsMenu";
import ConfirmHardDeleteModal from "@/components/admin/ConfirmHardDeleteModal";
import env from "@/config/env";
import { cn } from "@/lib/utils";

const STATUS_MAP = {
  draft: { i18nKey: "admin.statuses.draft", variant: "warm" },
  open: { i18nKey: "admin.statuses.open", variant: "success" },
  closed: { i18nKey: "admin.statuses.closed", variant: "warning" },
  completed: { i18nKey: "admin.statuses.completed", variant: "sage" },
  cancelled: { i18nKey: "admin.statuses.cancelled", variant: "danger" },
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TableSkeleton() {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-warm-gray/60 text-left text-charcoal-muted">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Dates</th>
            <th className="px-4 py-3 font-medium text-center">Capacity</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-dark">
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              {[1, 2, 3, 4, 5].map((j) => (
                <td key={j} className="px-4 py-3">
                  <div
                    className="h-4 rounded bg-warm-gray animate-pulse"
                    style={{ width: `${50 + j * 9}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="md:hidden space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 animate-pulse space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 rounded bg-warm-gray" />
            <div className="h-5 w-16 rounded-full bg-warm-gray" />
          </div>
          <div className="flex gap-4">
            <div className="h-3 w-28 rounded bg-warm-gray" />
            <div className="h-3 w-12 rounded bg-warm-gray" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ experienceId, t }) {
  return (
    <Card className="p-10 text-center">
      <Calendar className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-charcoal mb-1">
        {t("admin.editions.emptyTitle")}
      </h2>
      <p className="text-sm text-charcoal-muted mb-4">
        {t("admin.editions.emptyMessage")}
      </p>
      <Link to={`/admin/experiences/${experienceId}/editions/new`}>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          {t("admin.editions.emptyButton")}
        </Button>
      </Link>
    </Card>
  );
}

export default function EditionListPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, isRoot } = useAuth();
  const { data: experience, loading: expLoading } = useExperience(id);
  const { t } = useLanguage();

  const [showArchived, setShowArchived] = useState("");
  const [hardDeleteDoc, setHardDeleteDoc] = useState(null);
  const [actionError, setActionError] = useState(null);

  const isArchivedView = showArchived === "__archived__";

  const ARCHIVE_OPTIONS = [
    { value: "", label: t("admin.statuses.active") },
    { value: "__archived__", label: t("admin.archive.archivedTab") },
  ];

  const {
    data: editions,
    loading,
    error,
    refetch,
  } = useEditions(id, { onlyArchived: isArchivedView });

  const {
    archive,
    restore,
    hardDelete,
    loading: archiving,
    error: archiveError,
  } = useArchive(env.collectionEditions, () => {
    setActionError(null);
    refetch();
  });

  const handleArchive = useCallback(
    ({ documentId }) => archive({ documentId, cascade: false }),
    [archive],
  );

  const handleRestore = useCallback(
    ({ documentId }) => restore({ documentId }),
    [restore],
  );

  const handleHardDelete = useCallback(({ document }) => {
    setHardDeleteDoc(document);
  }, []);

  const handleHardDeleteConfirm = useCallback(
    async ({ documentId, confirmationId, reason }) => {
      await hardDelete({ documentId, confirmationId, reason });
      setHardDeleteDoc(null);
    },
    [hardDelete],
  );

  const isLoading = loading || expLoading;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            {t("admin.editions.title")}
          </h1>
          {experience && (
            <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
              {experience.publicName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <AdminSelect
            value={showArchived}
            onChange={setShowArchived}
            options={ARCHIVE_OPTIONS}
            fullWidth={false}
          />
          {!isArchivedView && (
            <Link to={`/admin/experiences/${id}/editions/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("admin.editions.newEdition")}
                </span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      <ExperienceDetailTabs />

      {(error || actionError || archiveError) && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error || actionError || archiveError}
          </p>
        </div>
      )}

      {/* Empty */}
      {!isLoading &&
        !error &&
        editions.length === 0 &&
        (isArchivedView ? (
          <Card className="p-10 text-center">
            <p className="text-sm text-charcoal-muted">
              {t("admin.editions.noArchived")}
            </p>
          </Card>
        ) : (
          <EmptyState experienceId={id} t={t} />
        ))}

      {/* Loading skeleton */}
      {isLoading && (
        <>
          <TableSkeleton />
          <CardSkeleton />
        </>
      )}

      {/* Desktop table */}
      {!isLoading && editions.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-warm-gray/60 border-b border-sand-dark text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.editions.name")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.editions.dates")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted text-center">
                  {t("admin.editions.capacity")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.editions.status")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted text-right">
                  {t("admin.editions.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-dark">
              {editions.map((ed) => {
                const st = STATUS_MAP[ed.status] || STATUS_MAP.draft;
                const editUrl = `/admin/experiences/${id}/editions/${ed.$id}/edit`;
                return (
                  <tr
                    key={ed.$id}
                    className={cn(
                      "group hover:bg-warm-gray/30 transition-colors",
                      isArchivedView && "opacity-70",
                    )}
                  >
                    <td className="px-4 py-3">
                      {isArchivedView ? (
                        <span className="font-medium text-charcoal">
                          {ed.name}
                        </span>
                      ) : (
                        <Link
                          to={editUrl}
                          className="font-medium text-charcoal hover:text-sage-dark hover:underline underline-offset-2 transition-colors"
                        >
                          {ed.name}
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted whitespace-nowrap">
                      {formatDate(ed.startDate)} — {formatDate(ed.endDate)}
                    </td>
                    <td className="px-4 py-3 text-center text-charcoal-muted">
                      {ed.capacity ?? "∞"}
                    </td>
                    <td className="px-4 py-3">
                      {isArchivedView ? (
                        <Badge variant="warm">
                          {t("admin.archive.archivedBadge")}
                        </Badge>
                      ) : (
                        <Badge variant={st.variant}>{t(st.i18nKey)}</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isArchivedView && (
                          <Link
                            to={editUrl}
                            className="inline-flex p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors opacity-0 group-hover:opacity-100 focus-within:opacity-100"
                            aria-label={t("admin.editions.editAriaLabel")}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        )}
                        {(isAdmin || isRoot) && (
                          <ArchiveActionsMenu
                            document={ed}
                            onArchive={handleArchive}
                            onRestore={handleRestore}
                            onHardDelete={handleHardDelete}
                            canArchive={isAdmin}
                            canHardDelete={isRoot}
                            loading={archiving}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {!isLoading && editions.length > 0 && (
        <div className="md:hidden space-y-3">
          {editions.map((ed) => {
            const st = STATUS_MAP[ed.status] || STATUS_MAP.draft;
            return (
              <Card
                key={ed.$id}
                className={cn("p-4 space-y-2", isArchivedView && "opacity-70")}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-charcoal truncate">
                    {ed.name}
                  </span>
                  {isArchivedView ? (
                    <Badge variant="warm">
                      {t("admin.archive.archivedBadge")}
                    </Badge>
                  ) : (
                    <Badge variant={st.variant}>{t(st.i18nKey)}</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-charcoal-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(ed.startDate)} — {formatDate(ed.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {ed.capacity ?? "∞"}
                  </span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-sand">
                  {!isArchivedView && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/admin/experiences/${id}/editions/${ed.$id}/edit`,
                        )
                      }
                      className="flex-1 justify-center"
                    >
                      <Pencil className="h-3.5 w-3.5" />{" "}
                      {t("admin.editions.editAriaLabel")}
                    </Button>
                  )}
                  {(isAdmin || isRoot) && (
                    <div className={cn(!isArchivedView ? "" : "ml-auto")}>
                      <ArchiveActionsMenu
                        document={ed}
                        onArchive={handleArchive}
                        onRestore={handleRestore}
                        onHardDelete={handleHardDelete}
                        canArchive={isAdmin}
                        canHardDelete={isRoot}
                        loading={archiving}
                      />
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmHardDeleteModal
        open={!!hardDeleteDoc}
        document={hardDeleteDoc}
        collectionId={env.collectionEditions}
        loading={archiving}
        onConfirm={handleHardDeleteConfirm}
        onCancel={() => setHardDeleteDoc(null)}
      />
    </div>
  );
}
