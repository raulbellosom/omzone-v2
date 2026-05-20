import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Layers, Archive, RotateCcw, Trash2 } from "lucide-react";
import StatusBadge from "@/components/admin/experiences/StatusBadge";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { ROUTES } from "@/constants/routes";
import { useLanguage, localizedField } from "@/hooks/useLanguage";

const CATEGORY_KEYS = ["landing", "blog", "highlight", "institutional", "faq"];

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

export default function PublicationCard({
  publication,
  onArchive,
  onRestore,
  onHardDelete,
  canAdmin,
  canHardDelete,
}) {
  const { t, language } = useLanguage();
  const [confirm, setConfirm] = useState(null);

  const editUrl = ROUTES.ADMIN_PUBLICATION_EDIT.replace(":id", publication.$id);
  const sectionsUrl = ROUTES.ADMIN_PUBLICATION_SECTIONS.replace(
    ":id",
    publication.$id,
  );

  const isArchived = Boolean(publication.archivedAt);

  const categoryLabel = CATEGORY_KEYS.includes(publication.category)
    ? t(`admin.publicationCard.categories.${publication.category}`)
    : publication.category;

  function handleConfirm() {
    const { type } = confirm;
    setConfirm(null);
    if (type === "archive") onArchive?.(publication.$id);
    else if (type === "restore") onRestore?.(publication.$id);
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

      <Card className={`p-4 space-y-2 ${isArchived ? "opacity-70" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium text-charcoal truncate">
              {localizedField(publication, "title", language)}
            </p>
            <p className="text-xs text-charcoal-subtle truncate">
              /{publication.slug}
            </p>
          </div>
          {isArchived ? (
            <Badge variant="warm">{t("admin.archive.archivedBadge")}</Badge>
          ) : (
            <StatusBadge status={publication.status} />
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-charcoal-subtle">
          <span>{categoryLabel}</span>
          {publication.publishedAt && (
            <span>
              {new Date(publication.publishedAt).toLocaleDateString(
                language === "es" ? "es-MX" : "en-US",
                { day: "numeric", month: "short" },
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1 flex-wrap border-t border-sand">
          {!isArchived && (
            <>
              <Link
                to={editUrl}
                className="flex items-center gap-1 text-xs text-sage font-medium hover:underline"
              >
                {t("admin.publicationCard.edit")}
                <ChevronRight className="w-3 h-3" />
              </Link>
              <Link
                to={sectionsUrl}
                className="flex items-center gap-1 text-xs text-sage font-medium hover:underline"
              >
                <Layers className="w-3 h-3" />
                {t("admin.publicationCard.sections")}
              </Link>
            </>
          )}
          {canAdmin && !isArchived && (
            <button
              type="button"
              onClick={() => setConfirm({ type: "archive" })}
              className="flex items-center gap-1 text-xs text-charcoal-subtle font-medium hover:text-charcoal ml-auto"
            >
              <Archive className="w-3 h-3" />
              {t("admin.publications.archiveButton")}
            </button>
          )}
          {isArchived && (
            <button
              type="button"
              onClick={() => setConfirm({ type: "restore" })}
              className="flex items-center gap-1 text-xs text-sage font-medium hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              {t("admin.archive.restore")}
            </button>
          )}
          {canHardDelete && isArchived && (
            <button
              type="button"
              onClick={() => onHardDelete?.(publication)}
              className="flex items-center gap-1 text-xs text-red-600 font-medium hover:underline ml-auto"
            >
              <Trash2 className="w-3 h-3" />
              {t("admin.archive.hardDelete")}
            </button>
          )}
        </div>
      </Card>
    </>
  );
}
