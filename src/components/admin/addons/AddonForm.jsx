import { useState, useEffect } from "react";
import { Copy } from "lucide-react";
import { Input } from "@/components/common/Input";
import AdminFormLayout from "@/components/admin/AdminFormLayout";
import { Card } from "@/components/common/Card";
import ImageUpload from "@/components/admin/experiences/ImageUpload";
import { slugify, checkAddonSlugAvailable } from "@/hooks/useAddons";
import AdminSelect from "@/components/common/AdminSelect";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const ADDON_TYPE_OPTIONS = [
  { value: "service", i18nKey: "admin.addonTypes.service" },
  { value: "transport", i18nKey: "admin.addonTypes.transport" },
  { value: "food", i18nKey: "admin.addonTypes.food" },
  { value: "accommodation", i18nKey: "admin.addonTypes.lodging" },
  { value: "equipment", i18nKey: "admin.addonTypes.equipment" },
  { value: "other", i18nKey: "admin.addonTypes.other" },
];

const PRICE_TYPE_OPTIONS = [
  { value: "fixed", i18nKey: "admin.priceTypes.fixed" },
  { value: "per-person", i18nKey: "admin.priceTypes.perPerson" },
  { value: "per-day", i18nKey: "admin.priceTypes.perDay" },
  { value: "per-unit", i18nKey: "admin.priceTypes.perUnit" },
  { value: "quote", i18nKey: "admin.priceTypes.quote" },
];

const STATUS_OPTIONS = [
  { value: "active", i18nKey: "admin.statuses.active" },
  { value: "inactive", i18nKey: "admin.statuses.inactive" },
];

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
  addonType: "service",
  priceType: "fixed",
  basePrice: "",
  currency: "MXN",
  isStandalone: false,
  isPublic: true,
  followsMainDuration: false,
  maxQuantity: "",
  heroImageId: "",
  status: "active",
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

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage/40",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          checked ? "bg-sage" : "bg-sand-dark",
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

export default function AddonForm({
  initialData,
  onSubmit,
  submitting,
  submitLabel,
}) {
  const { t } = useLanguage();
  const init = initialData
    ? {
        ...EMPTY,
        ...Object.fromEntries(
          Object.entries(initialData).map(([k, v]) => [
            k,
            v === null && typeof EMPTY[k] === "string" ? "" : v,
          ]),
        ),
        basePrice: initialData.basePrice ?? "",
        maxQuantity: initialData.maxQuantity ?? "",
        sortOrder: initialData.sortOrder ?? "",
        heroImageId: initialData.heroImageId ?? "",
      }
    : { ...EMPTY };

  const [form, setForm] = useState(init);
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
      const available = await checkAddonSlugAvailable(
        form.slug.trim(),
        initialData?.$id,
      );
      if (!available) e.slug = t("admin.validation.slugInUse");
    }
    if (!form.addonType) e.addonType = t("admin.validation.typeRequired");
    if (!form.priceType) e.priceType = t("admin.validation.priceTypeRequired");
    const price = parseFloat(form.basePrice);
    if (isNaN(price) || price <= 0) {
      e.basePrice = t("admin.validation.pricePositive");
    }
    if (!form.currency) e.currency = t("admin.validation.currencyRequired");
    if (!form.status) e.status = t("admin.validation.statusRequired");
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
      addonType: form.addonType,
      priceType: form.priceType,
      basePrice: parseFloat(form.basePrice),
      currency: form.currency,
      isStandalone: form.isStandalone,
      isPublic: form.isPublic,
      followsMainDuration: form.followsMainDuration,
      maxQuantity: form.maxQuantity ? parseInt(form.maxQuantity) : null,
      heroImageId: form.heroImageId || null,
      status: form.status,
      sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0,
    };

    onSubmit(payload);
  }

  const isDisabled = submitting;
  const isEditMode = Boolean(initialData?.$id);

  const asideContent = (
    <>
      <div className="rounded-2xl border border-sand-dark/40 bg-white p-4 shadow-sm space-y-4">
        <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.formSections.publication")}
        </p>
        <Field label={t("admin.addonForm.status")} required error={errors.status}>
          <AdminSelect
            value={form.status}
            onChange={(v) => set("status", v)}
            options={STATUS_OPTIONS.map((o) => ({ ...o, label: t(o.i18nKey) }))}
            disabled={isDisabled}
            error={errors.status}
          />
        </Field>
        <Field
          label={t("admin.addonForm.sortOrder")}
          hint={t("admin.addonForm.sortOrderHint")}
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

      {isEditMode && (
        <div className="rounded-2xl border border-sand-dark/40 bg-white p-4 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
            {t("admin.common.quickInfo") || "Quick Info"}
          </p>
          <div className="space-y-2.5 text-sm">
            <div>
              <p className="text-xs text-charcoal-subtle mb-1">Slug</p>
              <div className="flex items-center gap-1.5">
                <code className="text-xs text-charcoal bg-warm-gray rounded-lg px-2 py-1 font-mono truncate flex-1 border border-sand-dark/40">
                  {form.slug || "—"}
                </code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(form.slug)}
                  className="p-1.5 rounded-lg hover:bg-warm-gray text-charcoal-subtle hover:text-charcoal transition-colors"
                  title="Copy slug"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            {initialData?.$createdAt && (
              <div>
                <p className="text-xs text-charcoal-subtle">Created</p>
                <p className="text-xs text-charcoal">
                  {new Date(initialData.$createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
            {initialData?.$updatedAt && (
              <div>
                <p className="text-xs text-charcoal-subtle">Last updated</p>
                <p className="text-xs text-charcoal">
                  {new Date(initialData.$updatedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );

  return (
    <AdminFormLayout onSubmit={handleSubmit} submitting={submitting} disabled={isDisabled} submitLabel={submitLabel} asideChildren={asideContent}>
      {/* Identidad */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.addonForm.sectionIdentity")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("admin.addonForm.name")} required error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t("admin.addonForm.placeholderName")}
              disabled={isDisabled}
              className={errors.name ? "border-red-400" : ""}
            />
          </Field>
          <Field label={t("admin.addonForm.nameEs")}>
            <Input
              value={form.nameEs}
              onChange={(e) => set("nameEs", e.target.value)}
              placeholder={t("admin.addonForm.placeholderName")}
              disabled={isDisabled}
            />
          </Field>
        </div>
        <Field
          label={t("admin.addonForm.slug")}
          required
          error={errors.slug}
          hint={t("admin.addonForm.slugHint")}
        >
          <Input
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              set("slug", e.target.value);
            }}
            placeholder="transporte-aeropuerto"
            disabled={isDisabled}
            className={errors.slug ? "border-red-400" : ""}
          />
        </Field>
      </Card>

      {/* Descripción */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.addonForm.sectionDescription")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("admin.addonForm.descriptionEn")}>
            <Textarea
              value={form.description}
              onChange={(v) => set("description", v)}
              placeholder={t("admin.addonForm.placeholderDescEn")}
              disabled={isDisabled}
              rows={4}
            />
          </Field>
          <Field label={t("admin.addonForm.descriptionEs")}>
            <Textarea
              value={form.descriptionEs}
              onChange={(v) => set("descriptionEs", v)}
              placeholder={t("admin.addonForm.placeholderDescEs")}
              disabled={isDisabled}
              rows={4}
            />
          </Field>
        </div>
      </Card>

      {/* Tipo y precio */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.addonForm.sectionTypePrice")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("admin.addonForm.addonType")}
            required
            error={errors.addonType}
          >
            <AdminSelect
              value={form.addonType}
              onChange={(v) => set("addonType", v)}
              options={ADDON_TYPE_OPTIONS.map((o) => ({
                ...o,
                label: t(o.i18nKey),
              }))}
              disabled={isDisabled}
              error={errors.addonType}
            />
          </Field>
          <Field
            label={t("admin.addonForm.priceType")}
            required
            error={errors.priceType}
          >
            <AdminSelect
              value={form.priceType}
              onChange={(v) => set("priceType", v)}
              options={PRICE_TYPE_OPTIONS.map((o) => ({
                ...o,
                label: t(o.i18nKey),
              }))}
              disabled={isDisabled}
              error={errors.priceType}
            />
          </Field>
          <Field
            label={t("admin.addonForm.basePrice")}
            required
            error={errors.basePrice}
          >
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.basePrice}
              onChange={(e) => set("basePrice", e.target.value)}
              placeholder="500.00"
              disabled={isDisabled}
              className={errors.basePrice ? "border-red-400" : ""}
            />
          </Field>
          <Field
            label={t("admin.addonForm.currency")}
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
        </div>
      </Card>

      {/* Opciones */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.addonForm.sectionOptions")}
        </h2>
        <div className="space-y-3">
          <Toggle
            checked={form.isStandalone}
            onChange={(v) => set("isStandalone", v)}
            disabled={isDisabled}
            label={t("admin.addonForm.isStandalone")}
          />
          <Toggle
            checked={form.isPublic}
            onChange={(v) => set("isPublic", v)}
            disabled={isDisabled}
            label={t("admin.addonForm.isPublic")}
          />
          <Toggle
            checked={form.followsMainDuration}
            onChange={(v) => set("followsMainDuration", v)}
            disabled={isDisabled}
            label={t("admin.addonForm.followsMainDuration")}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Field
            label={t("admin.addonForm.maxQuantity")}
            hint={t("admin.addonForm.maxQuantityHint")}
          >
            <Input
              type="number"
              min={1}
              value={form.maxQuantity}
              onChange={(e) => set("maxQuantity", e.target.value)}
              placeholder="10"
              disabled={isDisabled}
            />
          </Field>
        </div>
      </Card>

      {/* Imagen */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.addonForm.sectionCoverImage")}
        </h2>
        <div className="max-w-lg">
          <ImageUpload
            fileId={form.heroImageId}
            onUpload={(id) => set("heroImageId", id)}
            onRemove={() => set("heroImageId", "")}
            disabled={isDisabled}
          />
        </div>
      </Card>

    </AdminFormLayout>
  );
}
