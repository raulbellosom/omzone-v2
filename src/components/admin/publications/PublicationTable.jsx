import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/common/Badge";
import {
  Pencil,
  Archive,
  Globe,
  RotateCcw,
  MoreHorizontal,
  Layers,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/common/dropdown-menu";
import StatusBadge from "@/components/admin/experiences/StatusBadge";
import PublicationCategoryChip from "@/components/admin/publications/PublicationCategoryChip";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const CATEGORY_I18N_KEYS = {
  landing: "admin.publicationCategories.landing",
  blog: "admin.publicationCategories.blog",
  highlight: "admin.publicationCategories.highlight",
  institutional: "admin.publicationCategories.institutional",
  faq: "admin.publicationCategories.faq",
};

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}) {
  const { t } = useLanguage();
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
        <h3 className="text-base font-semibold text-charcoal">{title}</h3>
        <p className="text-sm text-charcoal-subtle">{description}</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {t("admin.common.cancel")}
          </Button>
          <Button type="button" size="sm" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ActionsMenu({
  publication,
  onStatusChange,
  onArchive,
  onRestore,
  onHardDelete,
  canAdmin,
  canHardDelete,
}) {
  const [confirm, setConfirm] = useState(null);
  const { t } = useLanguage();

  const editUrl = ROUTES.ADMIN_PUBLICATION_EDIT.replace(":id", publication.$id);
  const sectionsUrl = ROUTES.ADMIN_PUBLICATION_SECTIONS.replace(
    ":id",
    publication.$id,
  );

  function handleAction(type) {
    setConfirm({ type });
  }

  function handleConfirm() {
    const { type } = confirm;
    setConfirm(null);
    if (type === "archive") onArchive?.(publication.$id);
    else if (type === "restore") onRestore?.(publication.$id);
    else if (type === "publish") onStatusChange(publication.$id, "published");
    else if (type === "draft") onStatusChange(publication.$id, "draft");
  }

  return (
    <>
      <ConfirmDialog
        open={confirm?.type === "archive"}
        title={t("admin.publications.archive")}
        description={t("admin.publications.archiveDesc")}
        confirmLabel={t("admin.publications.archiveButton")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === "restore"}
        title={t("admin.archive.restoreTitle")}
        description={t("admin.archive.restoreDesc")}
        confirmLabel={t("admin.archive.restore")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === "publish"}
        title={t("admin.publications.publish")}
        description={t("admin.publications.publishDesc")}
        confirmLabel={t("admin.publications.publishConfirmLabel")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="flex items-center justify-end gap-1">
        <Link
          to={editUrl}
          className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-charcoal-subtle hover:text-charcoal hover:bg-warm-gray transition-colors"
          title={t("admin.publications.editButton")}
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          asChild
          title={t("admin.publications.sectionsButton")}
        >
          <Link to={sectionsUrl}>
            <Layers className="h-4 w-4" />
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={t("admin.publications.moreActions")}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canAdmin &&
              publication.status !== "published" &&
              !publication.archivedAt && (
                <DropdownMenuItem onSelect={() => handleAction("publish")}>
                  <Globe className="h-4 w-4 text-emerald-600" />
                  {t("admin.publications.publish")}
                </DropdownMenuItem>
              )}
            {publication.status !== "draft" && !publication.archivedAt && (
              <DropdownMenuItem onSelect={() => handleAction("draft")}>
                <RotateCcw className="h-4 w-4 text-amber-600" />
                {t("admin.publications.backToDraft")}
              </DropdownMenuItem>
            )}
            {canAdmin && !publication.archivedAt && (
              <DropdownMenuItem onSelect={() => handleAction("archive")}>
                <Archive className="h-4 w-4 text-charcoal-subtle" />
                {t("admin.publications.archiveButton")}
              </DropdownMenuItem>
            )}
            {publication.archivedAt && (
              <DropdownMenuItem onSelect={() => handleAction("restore")}>
                <RotateCcw className="h-4 w-4 text-sage" />
                {t("admin.archive.restore")}
              </DropdownMenuItem>
            )}
            {canHardDelete && publication.archivedAt && (
              <DropdownMenuItem
                onSelect={() => onHardDelete?.(publication)}
                className="text-red-600 hover:bg-red-50 focus:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                {t("admin.archive.hardDelete")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded bg-warm-gray animate-pulse"
            style={{ width: `${60 + i * 8}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export default function PublicationTable({
  publications,
  loading,
  onStatusChange,
  onArchive,
  onRestore,
  onHardDelete,
  canAdmin,
  canHardDelete,
}) {
  const { t } = useLanguage();
  return (
    <div className="overflow-x-auto rounded-xl border border-sand-dark">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-warm-gray/60">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.publications.titleHeader")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.publications.categoryHeader")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.publications.statusHeader")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden lg:table-cell">
              {t("admin.publications.publishedHeader")}
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.common.actions")}
            </th>
          </tr>
        </thead>
        <tbody>
          {loading &&
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}

          {!loading && publications.length === 0 && (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-12 text-center text-sm text-charcoal-subtle"
              >
                {t("admin.publications.noPublications")}
              </td>
            </tr>
          )}

          {!loading &&
            publications.map((pub) => {
              const editUrl = ROUTES.ADMIN_PUBLICATION_EDIT.replace(
                ":id",
                pub.$id,
              );
              const isArchived = Boolean(pub.archivedAt);
              return (
                <tr
                  key={pub.$id}
                  className={cn(
                    "group border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors",
                    isArchived && "opacity-60",
                  )}
                >
                  <td className="px-4 py-3">
                    {isArchived ? (
                      <span className="font-medium text-charcoal truncate max-w-60 block">
                        {pub.title}
                      </span>
                    ) : (
                      <Link
                        to={editUrl}
                        className="font-medium text-charcoal hover:text-sage-dark hover:underline underline-offset-2 transition-colors truncate max-w-60 block"
                      >
                        {pub.title}
                      </Link>
                    )}
                    <p className="text-xs text-charcoal-subtle truncate max-w-60">
                      /{pub.slug}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <PublicationCategoryChip category={pub.category} />
                  </td>
                  <td className="px-4 py-3">
                    {isArchived ? (
                      <Badge variant="warm">{t("admin.archive.archivedBadge")}</Badge>
                    ) : (
                      <StatusBadge status={pub.status} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-charcoal-subtle hidden lg:table-cell">
                    {pub.publishedAt
                      ? new Date(pub.publishedAt).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <ActionsMenu
                      publication={pub}
                      onStatusChange={onStatusChange}
                      onArchive={onArchive}
                      onRestore={onRestore}
                      onHardDelete={onHardDelete}
                      canAdmin={canAdmin}
                      canHardDelete={canHardDelete}
                    />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
