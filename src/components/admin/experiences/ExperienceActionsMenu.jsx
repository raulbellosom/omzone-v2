import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Pencil, Archive, Globe, RotateCcw, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/common/Button";
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

export default function ExperienceActionsMenu({ experience, onStatusChange, canAdmin }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { t } = useLanguage();

  const editUrl = ROUTES.ADMIN_EXPERIENCE_EDIT.replace(":id", experience.$id);

  function handleAction(type) {
    setOpen(false);
    setConfirm({ type });
  }

  function handleConfirm() {
    const { type } = confirm;
    setConfirm(null);
    if (type === "archive") onStatusChange(experience.$id, "archived");
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
        open={confirm?.type === "publish"}
        title={t("admin.experienceActions.publishTitle")}
        description={t("admin.experienceActions.publishDescription")}
        confirmLabel={t("admin.experienceActions.publish")}
        cancelLabel={t("admin.pricingTierForm.cancel")}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="relative flex items-center justify-end gap-1">
        <Link
          to={editUrl}
          className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-charcoal-subtle hover:text-charcoal hover:bg-warm-gray transition-colors"
          title={t("admin.experienceActions.edit")}
        >
          <Pencil className="h-4 w-4" />
        </Link>

        <div className="relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setOpen((p) => !p)}
            title={t("admin.experienceActions.moreActions")}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-xl border border-sand-dark bg-white shadow-lg py-1">
                {canAdmin && experience.status !== "published" && (
                  <button
                    type="button"
                    onClick={() => handleAction("publish")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-warm-gray"
                  >
                    <Globe className="h-4 w-4 text-emerald-600" />
                    {t("admin.experienceActions.publish")}
                  </button>
                )}
                {experience.status !== "draft" && (
                  <button
                    type="button"
                    onClick={() => handleAction("draft")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-warm-gray"
                  >
                    <RotateCcw className="h-4 w-4 text-amber-600" />
                    {t("admin.experienceActions.backToDraft")}
                  </button>
                )}
                {experience.status !== "archived" && (
                  <button
                    type="button"
                    onClick={() => handleAction("archive")}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-charcoal hover:bg-warm-gray"
                  >
                    <Archive className="h-4 w-4 text-charcoal-subtle" />
                    {t("admin.experienceActions.archive")}
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
