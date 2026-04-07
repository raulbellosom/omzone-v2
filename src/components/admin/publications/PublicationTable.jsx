import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  Archive,
  Globe,
  RotateCcw,
  MoreHorizontal,
  Layers,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import StatusBadge from "@/components/admin/experiences/StatusBadge";
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

function ActionsMenu({ publication, onStatusChange, canAdmin }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const editUrl = ROUTES.ADMIN_PUBLICATION_EDIT.replace(":id", publication.$id);
  const sectionsUrl = ROUTES.ADMIN_PUBLICATION_SECTIONS.replace(
    ":id",
    publication.$id,
  );

  function handleAction(type) {
    setOpen(false);
    setConfirm({ type });
  }

  function handleConfirm() {
    const { type } = confirm;
    setConfirm(null);
    if (type === "archive") onStatusChange(publication.$id, "archived");
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
        open={confirm?.type === "publish"}
        title={t("admin.publications.publish")}
        description={t("admin.publications.publishDesc")}
        confirmLabel={t("admin.publications.publishConfirmLabel")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="relative flex items-center justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate(editUrl)}
          title={t("admin.publications.editButton")}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => navigate(sectionsUrl)}
          title={t("admin.publications.sectionsButton")}
        >
          <Layers className="h-4 w-4" />
        </Button>

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((p) => !p)}
            title={t("admin.publications.moreActions")}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-sand-dark bg-white shadow-lg py-1">
                {canAdmin && publication.status !== "published" && (
                  <button
                    type="button"
                    onClick={() => handleAction("publish")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-warm-gray"
                  >
                    <Globe className="h-4 w-4 text-emerald-600" />
                    {t("admin.publications.publish")}
                  </button>
                )}
                {publication.status !== "draft" && (
                  <button
                    type="button"
                    onClick={() => handleAction("draft")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-warm-gray"
                  >
                    <RotateCcw className="h-4 w-4 text-amber-600" />
                    {t("admin.publications.backToDraft")}
                  </button>
                )}
                {canAdmin && publication.status !== "archived" && (
                  <button
                    type="button"
                    onClick={() => handleAction("archive")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-warm-gray"
                  >
                    <Archive className="h-4 w-4 text-charcoal-subtle" />
                    {t("admin.publications.archiveButton")}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
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
  canAdmin,
}) {
  const { t } = useLanguage();
  return (
    <div className="overflow-x-auto rounded-xl border border-sand-dark">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-warm-gray/50">
            <th className="px-4 py-3 text-left font-medium text-charcoal-subtle">
              {t("admin.publications.titleHeader")}
            </th>
            <th className="px-4 py-3 text-left font-medium text-charcoal-subtle">
              {t("admin.publications.categoryHeader")}
            </th>
            <th className="px-4 py-3 text-left font-medium text-charcoal-subtle">
              {t("admin.publications.statusHeader")}
            </th>
            <th className="px-4 py-3 text-left font-medium text-charcoal-subtle hidden lg:table-cell">
              {t("admin.publications.publishedHeader")}
            </th>
            <th className="px-4 py-3 text-right font-medium text-charcoal-subtle">
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
            publications.map((pub) => (
              <tr
                key={pub.$id}
                className="border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors"
              >
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-charcoal truncate max-w-60">
                      {pub.title}
                    </p>
                    <p className="text-xs text-charcoal-subtle truncate max-w-60">
                      /{pub.slug}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-charcoal-subtle">
                  {CATEGORY_I18N_KEYS[pub.category]
                    ? t(CATEGORY_I18N_KEYS[pub.category])
                    : pub.category}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={pub.status} />
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
                <td className="px-4 py-3">
                  <ActionsMenu
                    publication={pub}
                    onStatusChange={onStatusChange}
                    canAdmin={canAdmin}
                  />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
