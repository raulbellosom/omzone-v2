import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Pencil,
  Archive,
  Globe,
  RotateCcw,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/common/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";
import { ROUTES } from "@/constants/routes";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
  danger,
  cancelLabel,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4 space-y-4">
        <h3 className="text-base font-semibold text-charcoal">{title}</h3>
        <p className="text-sm text-charcoal-subtle">{description}</p>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? "destructive" : "default"}
            size="sm"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ExperienceActionsMenu({
  experience,
  onStatusChange,
  onArchive,
  onRestore,
  canAdmin,
}) {
  const [confirm, setConfirm] = useState(null);
  const { t } = useLanguage();

  const editUrl = ROUTES.ADMIN_EXPERIENCE_EDIT.replace(":id", experience.$id);

  function handleAction(type) {
    setConfirm({ type });
  }

  function handleConfirm() {
    const { type } = confirm;
    setConfirm(null);
    if (type === "archive") onArchive?.(experience.$id);
    else if (type === "restore") onRestore?.(experience.$id);
    else if (type === "publish") onStatusChange(experience.$id, "published");
    else if (type === "draft") onStatusChange(experience.$id, "draft");
  }

  return (
    <>
      <ConfirmDialog
        open={confirm?.type === "archive"}
        title={t("admin.experienceActions.archiveTitle")}
        description={t("admin.experienceActions.archiveDescription")}
        confirmLabel={t("admin.experienceActions.archive")}
        cancelLabel={t("admin.pricingTierForm.cancel")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === "restore"}
        title={t("admin.archive.restoreTitle")}
        description={t("admin.archive.restoreDescription")}
        confirmLabel={t("admin.archive.restore")}
        cancelLabel={t("admin.pricingTierForm.cancel")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm?.type === "publish"}
        title={t("admin.experienceActions.publishTitle")}
        description={t("admin.experienceActions.publishDescription")}
        confirmLabel={t("admin.experienceActions.publish")}
        cancelLabel={t("admin.pricingTierForm.cancel")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="flex items-center justify-end gap-1">
        <Link
          to={editUrl}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-charcoal-subtle hover:text-charcoal hover:bg-warm-gray transition-colors"
          title={t("admin.experienceActions.edit")}
        >
          <Pencil className="h-4 w-4" />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title={t("admin.experienceActions.moreActions")}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canAdmin &&
              experience.status !== "published" &&
              !experience.archivedAt && (
                <DropdownMenuItem onSelect={() => handleAction("publish")}>
                  <Globe className="h-4 w-4 text-emerald-600" />
                  {t("admin.experienceActions.publish")}
                </DropdownMenuItem>
              )}
            {experience.status !== "draft" && !experience.archivedAt && (
              <DropdownMenuItem onSelect={() => handleAction("draft")}>
                <RotateCcw className="h-4 w-4 text-amber-600" />
                {t("admin.experienceActions.backToDraft")}
              </DropdownMenuItem>
            )}
            {!experience.archivedAt && (
              <DropdownMenuItem onSelect={() => handleAction("archive")}>
                <Archive className="h-4 w-4 text-charcoal-subtle" />
                {t("admin.experienceActions.archive")}
              </DropdownMenuItem>
            )}
            {experience.archivedAt && (
              <DropdownMenuItem onSelect={() => handleAction("restore")}>
                <RotateCcw className="h-4 w-4 text-sage" />
                {t("admin.archive.restore")}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
