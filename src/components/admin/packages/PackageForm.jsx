import { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import ImageUpload from "@/components/admin/experiences/ImageUpload";
import GalleryManager from "@/components/admin/media/GalleryManager";
import PackageItemsEditor from "@/components/admin/packages/PackageItemsEditor";
import { slugify, checkPackageSlugAvailable } from "@/hooks/usePackages";
import AdminSelect from "@/components/common/AdminSelect";
import { useLanguage } from "@/hooks/useLanguage";
import env from "@/config/env";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "draft", i18nKey: "admin.packageStatuses.draft" },
  { value: "published", i18nKey: "admin.packageStatuses.published" },
  { value: "archived", i18nKey: "admin.packageStatuses.archived" },
];

const STATUS_TRANSITIONS = {
  draft: ["draft", "published"],
  published: ["published", "archived"],
  archived: ["archived", "draft"],
};

const CURRENCY_OPTIONS = [
  { value: "MXN", label: "MXN" },
  { value: "USD", label: "USD" },
];

const EMPTY = {
  name: "",
  nameEs: "",
  slug: "",
  description: "",
  descriptionEs: "",
  totalPrice: "",
  currency: "MXN",
  durationDays: "",
  capacity: "",
  heroImageId: "",
  galleryImageIds: [],
  status: "draft",
  sortOrder: "",
};

function Field({ label, required, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-charcoal">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="text-xs text-charcoal-subtle">{hint}</p>}
    </div>
  );
}

function Textarea({ value, onChange, placeholder, disabled, rows = 3, error }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={cn(
        "flex w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-subtle",
        "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none",
        "disabled:opacity-50 disabled:bg-warm-gray",
        error && "border-red-400",
      )}
    />
  );
}

export default function PackageForm({
  initialData,
  initialItems = [],
  onSubmit,
  submitting,
  submitLabel,
}) {
  const { t } = useLanguage();
  const init = initialData
    ? {
        ...EMPTY,
        ...initialData,
        totalPrice: initialData.totalPrice ?? "",
        durationDays: initialData.durationDays ?? "",
        capacity: initialData.capacity ?? "",
        sortOrder: initialData.sortOrder ?? "",
        heroImageId: initialData.heroImageId ?? "",
        galleryImageIds: initialData.galleryImageIds
          ? (() => {
              try {
                const p = JSON.parse(initialData.galleryImageIds);
                return Array.isArray(p) ? p : [];
              } catch {
                return [];
              }
            })()
          : [],
      }
    : { ...EMPTY };

  const [form, setForm] = useState(init);
  const [items, setItems] = useState(initialItems);
  const [errors, setErrors] = useState({});
  const [slugManual, setSlugManual] = useState(!!initialData);

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
  }

  useEffect(() => {
    if (!slugManual && form.name) {
      set("slug", slugify(form.name));
    }
  }, [form.name, slugManual]);

  async function validate() {
    const e = {};
    if (!form.name.trim()) e.name = t("admin.validation.nameRequired");
    if (!form.slug.trim()) {
      e.slug = t("admin.validation.slugRequired");
    } else {
      const available = await checkPackageSlugAvailable(
        form.slug.trim(),
        initialData?.$id,
      );
      if (!available) e.slug = t("admin.validation.slugInUse");
    }
    const price = parseFloat(form.totalPrice);
    if (isNaN(price) || price < 0) {
      e.totalPrice = t("admin.validation.priceNotNegative");
    }
    if (!form.currency) e.currency = t("admin.validation.currencyRequired");
    if (!form.status) e.status = t("admin.validation.statusRequired");
    if (form.status === "published" && items.length === 0) {
      e.items = t("admin.validation.atLeastOneItemToPublish");
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = await validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      name: form.name.trim(),
      nameEs: form.nameEs.trim() || null,
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      descriptionEs: form.descriptionEs.trim() || null,
      totalPrice: parseFloat(form.totalPrice),
      currency: form.currency,
      durationDays: form.durationDays ? parseInt(form.durationDays) : null,
      capacity: form.capacity ? parseInt(form.capacity) : null,
      heroImageId: form.heroImageId || null,
      galleryImageIds:
        form.galleryImageIds.length > 0
          ? JSON.stringify(form.galleryImageIds)
          : null,
      status: form.status,
      sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0,
    };

    onSubmit(payload, items);
  }

  const isDisabled = submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identidad */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.sections.identity")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("admin.packageForm.name")}
            required
            error={errors.name}
          >
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Deep Rest Retreat — 3 Days"
              disabled={isDisabled}
              className={errors.name ? "border-red-400" : ""}
            />
          </Field>
          <Field label={t("admin.packageForm.nameEs")}>
            <Input
              value={form.nameEs}
              onChange={(e) => set("nameEs", e.target.value)}
              placeholder="Retiro Descanso Profundo — 3 Días"
              disabled={isDisabled}
            />
          </Field>
        </div>
        <Field
          label={t("admin.packageForm.slug")}
          required
          error={errors.slug}
          hint={t("admin.packageForm.slugHint")}
        >
          <Input
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              set("slug", e.target.value);
            }}
            placeholder="deep-rest-retreat-3-days"
            disabled={isDisabled}
            className={errors.slug ? "border-red-400" : ""}
          />
        </Field>
      </Card>

      {/* Descripción */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.sections.description")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("admin.packageForm.descriptionEn")}>
            <Textarea
              value={form.description}
              onChange={(v) => set("description", v)}
              placeholder="A complete immersive retreat combining breathwork, forest bathing, and guided meditation..."
              disabled={isDisabled}
              rows={4}
            />
          </Field>
          <Field label={t("admin.packageForm.descriptionEs")}>
            <Textarea
              value={form.descriptionEs}
              onChange={(v) => set("descriptionEs", v)}
              placeholder="Un retiro inmersivo completo que combina breathwork, baño de bosque y meditación guiada..."
              disabled={isDisabled}
              rows={4}
            />
          </Field>
        </div>
      </Card>

      {/* Precio y logística */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.sections.priceAndLogistics")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("admin.packageForm.totalPrice")}
            required
            error={errors.totalPrice}
          >
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.totalPrice}
              onChange={(e) => set("totalPrice", e.target.value)}
              placeholder="12500.00"
              disabled={isDisabled}
              className={errors.totalPrice ? "border-red-400" : ""}
            />
          </Field>
          <Field
            label={t("admin.packageForm.currency")}
            required
            error={errors.currency}
          >
            <AdminSelect
              value={form.currency}
              onChange={(v) => set("currency", v)}
              options={CURRENCY_OPTIONS}
              disabled={isDisabled}
              error={errors.currency}
            />
          </Field>
          <Field
            label={t("admin.packageForm.durationDays")}
            hint={t("admin.packageForm.durationHint")}
          >
            <Input
              type="number"
              min={1}
              value={form.durationDays}
              onChange={(e) => set("durationDays", e.target.value)}
              placeholder="3"
              disabled={isDisabled}
            />
          </Field>
          <Field
            label={t("admin.packageForm.capacity")}
            hint={t("admin.packageForm.capacityHint")}
          >
            <Input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="12"
              disabled={isDisabled}
            />
          </Field>
        </div>
      </Card>

      {/* Elementos del paquete */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.sections.includedItems")}
        </h2>
        {errors.items && <p className="text-xs text-red-600">{errors.items}</p>}
        <PackageItemsEditor
          items={items}
          onChange={setItems}
          disabled={isDisabled}
        />
      </Card>

      {/* Estado y orden */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.sections.statusAndOrder")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("admin.packageForm.status")}
            required
            error={errors.status}
          >
            <AdminSelect
              value={form.status}
              onChange={(v) => set("status", v)}
              options={STATUS_OPTIONS.filter((o) =>
                (
                  STATUS_TRANSITIONS[initialData?.status || "draft"] ||
                  STATUS_TRANSITIONS.draft
                ).includes(o.value),
              ).map((o) => ({ ...o, label: t(o.i18nKey) }))}
              disabled={isDisabled}
              error={errors.status}
            />
          </Field>
          <Field
            label={t("admin.packageForm.order")}
            hint={t("admin.packageForm.orderHint")}
          >
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", e.target.value)}
              placeholder="0"
              disabled={isDisabled}
            />
          </Field>
        </div>
      </Card>

      {/* Imagen de portada */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.sections.coverImage")}
        </h2>
        <div className="max-w-lg">
          <ImageUpload
            fileId={form.heroImageId}
            onUpload={(id) => set("heroImageId", id)}
            onRemove={() => set("heroImageId", "")}
            bucketId={env.bucketPackageImages}
            disabled={isDisabled}
          />
        </div>
      </Card>

      {/* Galería de imágenes */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.sections.imageGallery")}
        </h2>
        <GalleryManager
          value={form.galleryImageIds}
          onChange={(ids) => set("galleryImageIds", ids)}
          bucketId={env.bucketPackageImages}
          isAdmin
          disabled={isDisabled}
        />
      </Card>

      {/* Acciones */}
      <div className="flex items-center gap-3 pb-6">
        <Button type="submit" disabled={isDisabled} size="md">
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              {t("admin.packageForm.saving")}
            </span>
          ) : (
            submitLabel || t("admin.common.save")
          )}
        </Button>
      </div>
    </form>
  );
}
