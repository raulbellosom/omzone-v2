import { useState } from "react";
import { ImagePlus } from "lucide-react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import ImagePreview from "@/components/common/ImagePreview";
import MediaPicker from "@/components/admin/media/MediaPicker";
import env from "@/config/env";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const EMPTY = {
  mediaFileId: "",
  bucketId: env.bucketPublicResources,
  altText: "",
  altTextEs: "",
  eyebrow: "",
  eyebrowEs: "",
  caption: "",
  captionEs: "",
  ctaLabel: "",
  ctaLabelEs: "",
  ctaHref: "",
  isVisible: true,
  startsAt: "",
  endsAt: "",
};

function Field({ label, required, error, hint, children, count, max }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-charcoal">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
        {typeof count === "number" && typeof max === "number" && (
          <span
            className={cn(
              "text-[11px] tabular-nums",
              count > max ? "text-red-600" : "text-charcoal-subtle",
            )}
          >
            {count}/{max}
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-charcoal-subtle">{hint}</p>}
    </div>
  );
}

function Toggle({ checked, onChange, label, disabled }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-sage/40",
          checked ? "bg-sage" : "bg-sand-dark",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
      <span className="text-sm text-charcoal">{label}</span>
    </label>
  );
}

// Convert ISO datetime to value compatible with <input type="datetime-local">.
function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local) {
  if (!local) return null;
  const d = new Date(local);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function HeroSlideForm({
  initialData,
  onSubmit,
  onCancel,
  submitting,
}) {
  const isEditing = !!initialData?.$id;
  const { t } = useLanguage();
  const [pickerOpen, setPickerOpen] = useState(false);

  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        mediaFileId: initialData.mediaFileId || "",
        bucketId: initialData.bucketId || env.bucketPublicResources,
        altText: initialData.altText || "",
        altTextEs: initialData.altTextEs || "",
        eyebrow: initialData.eyebrow || "",
        eyebrowEs: initialData.eyebrowEs || "",
        caption: initialData.caption || "",
        captionEs: initialData.captionEs || "",
        ctaLabel: initialData.ctaLabel || "",
        ctaLabelEs: initialData.ctaLabelEs || "",
        ctaHref: initialData.ctaHref || "",
        isVisible: initialData.isVisible ?? true,
        startsAt: toLocalInput(initialData.startsAt),
        endsAt: toLocalInput(initialData.endsAt),
      };
    }
    return { ...EMPTY };
  });
  const [errors, setErrors] = useState({});

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
  }

  function validate() {
    const e = {};
    if (!form.mediaFileId) e.mediaFileId = t("admin.heroSlides.imageRequired");
    if (form.startsAt && form.endsAt) {
      const s = new Date(form.startsAt).getTime();
      const en = new Date(form.endsAt).getTime();
      if (s >= en) e.endsAt = t("admin.heroSlides.endsAfterStarts");
    }
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      mediaFileId: form.mediaFileId,
      bucketId: form.bucketId || env.bucketPublicResources,
      altText: form.altText.trim() || null,
      altTextEs: form.altTextEs.trim() || null,
      eyebrow: form.eyebrow.trim() || null,
      eyebrowEs: form.eyebrowEs.trim() || null,
      caption: form.caption.trim() || null,
      captionEs: form.captionEs.trim() || null,
      ctaLabel: form.ctaLabel.trim() || null,
      ctaLabelEs: form.ctaLabelEs.trim() || null,
      ctaHref: form.ctaHref.trim() || null,
      isVisible: form.isVisible,
      startsAt: fromLocalInput(form.startsAt),
      endsAt: fromLocalInput(form.endsAt),
    };

    onSubmit(payload);
  }

  const isDisabled = submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="p-5 space-y-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
            {isEditing
              ? t("admin.heroSlides.editTitle")
              : t("admin.heroSlides.newTitle")}
          </h2>
          <Toggle
            checked={form.isVisible}
            onChange={(v) => set("isVisible", v)}
            label={t("admin.heroSlides.visible")}
            disabled={isDisabled}
          />
        </div>

        {/* Image picker */}
        <Field
          label={t("admin.heroSlides.image")}
          required
          error={errors.mediaFileId}
          hint={t("admin.heroSlides.imageHint")}
        >
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div className="w-full sm:w-64 aspect-video rounded-xl overflow-hidden border border-sand-dark/40 bg-warm-gray">
              {form.mediaFileId ? (
                <ImagePreview
                  fileId={form.mediaFileId}
                  bucketId={form.bucketId}
                  width={640}
                  height={360}
                  className="w-full h-full"
                  fit="cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-charcoal-subtle">
                  <ImagePlus className="h-8 w-8" />
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPickerOpen(true)}
                disabled={isDisabled}
              >
                <ImagePlus className="h-4 w-4" />
                {form.mediaFileId
                  ? t("admin.heroSlides.changeImage")
                  : t("admin.heroSlides.pickImage")}
              </Button>
              {form.mediaFileId && (
                <button
                  type="button"
                  onClick={() => set("mediaFileId", "")}
                  disabled={isDisabled}
                  className="text-xs text-charcoal-subtle hover:text-red-600 disabled:opacity-50 text-left"
                >
                  {t("admin.heroSlides.removeImage")}
                </button>
              )}
            </div>
          </div>
        </Field>

        {/* SEO note */}
        <Card className="p-3 bg-sage/5 border-sage/20">
          <p className="text-xs text-charcoal-subtle leading-relaxed">
            <strong className="text-sage-dark">SEO:</strong>{" "}
            {t("admin.heroSlides.seoNote")}
          </p>
        </Card>

        {/* Alt text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("admin.heroSlides.altTextEn")}
            hint={t("admin.heroSlides.altHint")}
            count={form.altText.length}
            max={200}
          >
            <Input
              value={form.altText}
              onChange={(e) => set("altText", e.target.value)}
              placeholder={t("admin.heroSlides.altPlaceholderEn")}
              disabled={isDisabled}
              maxLength={200}
            />
          </Field>
          <Field
            label={t("admin.heroSlides.altTextEs")}
            count={form.altTextEs.length}
            max={200}
          >
            <Input
              value={form.altTextEs}
              onChange={(e) => set("altTextEs", e.target.value)}
              placeholder={t("admin.heroSlides.altPlaceholderEs")}
              disabled={isDisabled}
              maxLength={200}
            />
          </Field>
        </div>

        {/* Optional decorative copy */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-subtle">
            {t("admin.heroSlides.decorativeCopy")}
          </p>
          <p className="text-xs text-charcoal-subtle -mt-2">
            {t("admin.heroSlides.decorativeNote")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label={t("admin.heroSlides.eyebrowEn")}
              count={form.eyebrow.length}
              max={60}
            >
              <Input
                value={form.eyebrow}
                onChange={(e) => set("eyebrow", e.target.value)}
                disabled={isDisabled}
                maxLength={60}
              />
            </Field>
            <Field
              label={t("admin.heroSlides.eyebrowEs")}
              count={form.eyebrowEs.length}
              max={60}
            >
              <Input
                value={form.eyebrowEs}
                onChange={(e) => set("eyebrowEs", e.target.value)}
                disabled={isDisabled}
                maxLength={60}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field
              label={t("admin.heroSlides.captionEn")}
              count={form.caption.length}
              max={240}
            >
              <Input
                value={form.caption}
                onChange={(e) => set("caption", e.target.value)}
                disabled={isDisabled}
                maxLength={240}
              />
            </Field>
            <Field
              label={t("admin.heroSlides.captionEs")}
              count={form.captionEs.length}
              max={240}
            >
              <Input
                value={form.captionEs}
                onChange={(e) => set("captionEs", e.target.value)}
                disabled={isDisabled}
                maxLength={240}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field
              label={t("admin.heroSlides.ctaLabelEn")}
              count={form.ctaLabel.length}
              max={60}
            >
              <Input
                value={form.ctaLabel}
                onChange={(e) => set("ctaLabel", e.target.value)}
                disabled={isDisabled}
                maxLength={60}
              />
            </Field>
            <Field
              label={t("admin.heroSlides.ctaLabelEs")}
              count={form.ctaLabelEs.length}
              max={60}
            >
              <Input
                value={form.ctaLabelEs}
                onChange={(e) => set("ctaLabelEs", e.target.value)}
                disabled={isDisabled}
                maxLength={60}
              />
            </Field>
            <Field
              label={t("admin.heroSlides.ctaHref")}
              hint={t("admin.heroSlides.ctaHrefHint")}
            >
              <Input
                value={form.ctaHref}
                onChange={(e) => set("ctaHref", e.target.value)}
                placeholder="/experiences"
                disabled={isDisabled}
                maxLength={500}
              />
            </Field>
          </div>
        </div>

        {/* Scheduling */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-charcoal-subtle">
            {t("admin.heroSlides.scheduling")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label={t("admin.heroSlides.startsAt")}>
              <Input
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => set("startsAt", e.target.value)}
                disabled={isDisabled}
              />
            </Field>
            <Field label={t("admin.heroSlides.endsAt")} error={errors.endsAt}>
              <Input
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => set("endsAt", e.target.value)}
                disabled={isDisabled}
              />
            </Field>
          </div>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isDisabled} size="md">
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              {t("admin.common.saving")}
            </span>
          ) : isEditing ? (
            t("admin.heroSlides.saveChanges")
          ) : (
            t("admin.heroSlides.addSlide")
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCancel}
          disabled={isDisabled}
        >
          {t("admin.common.cancel")}
        </Button>
      </div>

      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        bucketId={env.bucketPublicResources}
        multiple={false}
        selected={form.mediaFileId ? [form.mediaFileId] : []}
        onSelect={(ids) => {
          if (ids?.[0]) {
            set("mediaFileId", ids[0]);
            set("bucketId", env.bucketPublicResources);
          }
        }}
        isAdmin
      />
    </form>
  );
}
