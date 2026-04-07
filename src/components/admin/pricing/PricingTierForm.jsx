import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import AdminSelect from "@/components/common/AdminSelect";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const PRICE_TYPE_KEYS = [
  { value: "fixed", key: "fixed" },
  { value: "per-person", key: "perPerson" },
  { value: "per-group", key: "perGroup" },
  { value: "from", key: "from" },
  { value: "quote", key: "quote" },
];

const CURRENCY_OPTIONS = [
  { value: "MXN", label: "MXN" },
  { value: "USD", label: "USD" },
];

const EMPTY = {
  name: "",
  nameEs: "",
  description: "",
  descriptionEs: "",
  priceType: "fixed",
  basePrice: "",
  currency: "MXN",
  minPersons: "",
  maxPersons: "",
  badge: "",
  isHighlighted: false,
  isActive: true,
  sortOrder: 0,
  editionId: "",
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

function Textarea({ value, onChange, placeholder, disabled, rows = 3 }) {
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
      )}
    />
  );
}

function Toggle({ checked, onChange, disabled, label }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200",
          checked ? "bg-sage" : "bg-sand-dark",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
      <span className="text-sm text-charcoal">{label}</span>
    </label>
  );
}

export default function PricingTierForm({
  initialData,
  editions = [],
  onSubmit,
  submitting,
  submitLabel,
  onCancel,
}) {
  const { t } = useLanguage();

  const PRICE_TYPE_OPTIONS = PRICE_TYPE_KEYS.map((o) => ({
    value: o.value,
    label: t(`admin.pricingTierForm.priceTypeOptions.${o.key}`),
  }));

  const init = initialData
    ? {
        ...EMPTY,
        ...initialData,
        basePrice: initialData.basePrice ?? "",
        minPersons: initialData.minPersons ?? "",
        maxPersons: initialData.maxPersons ?? "",
        sortOrder: initialData.sortOrder ?? 0,
        editionId: initialData.editionId ?? "",
      }
    : { ...EMPTY };

  const [form, setForm] = useState(init);
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
    if (!form.name.trim()) e.name = t("admin.pricingTierForm.nameRequired");
    if (!form.priceType)
      e.priceType = t("admin.pricingTierForm.priceTypeRequired");
    if (!form.currency)
      e.currency = t("admin.pricingTierForm.currencyRequired");
    const price = parseFloat(form.basePrice);
    if (isNaN(price) || price <= 0) {
      e.basePrice = t("admin.pricingTierForm.basePricePositive");
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
      name: form.name.trim(),
      nameEs: form.nameEs.trim() || null,
      description: form.description.trim() || null,
      descriptionEs: form.descriptionEs.trim() || null,
      priceType: form.priceType,
      basePrice: parseFloat(form.basePrice),
      currency: form.currency,
      minPersons: form.minPersons ? parseInt(form.minPersons) : null,
      maxPersons: form.maxPersons ? parseInt(form.maxPersons) : null,
      badge: form.badge.trim() || null,
      isHighlighted: form.isHighlighted,
      isActive: form.isActive,
      sortOrder: parseInt(form.sortOrder) || 0,
      editionId: form.editionId || null,
    };

    onSubmit(payload);
  }

  const isDisabled = submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identidad */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.pricingTierForm.sectionIdentity")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("admin.pricingTierForm.name")}
            required
            error={errors.name}
          >
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="General Admission"
              disabled={isDisabled}
              className={errors.name ? "border-red-400" : ""}
            />
          </Field>
          <Field label={t("admin.pricingTierForm.nameEs")}>
            <Input
              value={form.nameEs}
              onChange={(e) => set("nameEs", e.target.value)}
              placeholder="Admisión General"
              disabled={isDisabled}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("admin.pricingTierForm.descriptionEn")}>
            <Textarea
              value={form.description}
              onChange={(v) => set("description", v)}
              placeholder="What's included in this tier..."
              disabled={isDisabled}
            />
          </Field>
          <Field label={t("admin.pricingTierForm.descriptionEs")}>
            <Textarea
              value={form.descriptionEs}
              onChange={(v) => set("descriptionEs", v)}
              placeholder="Qué incluye este tier..."
              disabled={isDisabled}
            />
          </Field>
        </div>
      </Card>

      {/* Precio */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.pricingTierForm.sectionPrice")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field
            label={t("admin.pricingTierForm.priceType")}
            required
            error={errors.priceType}
          >
            <AdminSelect
              value={form.priceType}
              onChange={(v) => set("priceType", v)}
              options={PRICE_TYPE_OPTIONS}
              disabled={isDisabled}
              error={errors.priceType}
            />
          </Field>
          <Field
            label={t("admin.pricingTierForm.basePrice")}
            required
            error={errors.basePrice}
          >
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={form.basePrice}
              onChange={(e) => set("basePrice", e.target.value)}
              placeholder="1500.00"
              disabled={isDisabled}
              className={errors.basePrice ? "border-red-400" : ""}
            />
          </Field>
          <Field
            label={t("admin.pricingTierForm.currency")}
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

      {/* Personas */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.pricingTierForm.sectionPersons")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("admin.pricingTierForm.minPersons")}
            hint={t("admin.pricingTierForm.minPersonsHint")}
          >
            <Input
              type="number"
              min={1}
              value={form.minPersons}
              onChange={(e) => set("minPersons", e.target.value)}
              placeholder="1"
              disabled={isDisabled}
            />
          </Field>
          <Field label={t("admin.pricingTierForm.maxPersons")}>
            <Input
              type="number"
              min={1}
              value={form.maxPersons}
              onChange={(e) => set("maxPersons", e.target.value)}
              placeholder="10"
              disabled={isDisabled}
            />
          </Field>
        </div>
      </Card>

      {/* Visuales y edición */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.pricingTierForm.sectionVisuals")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("admin.pricingTierForm.badge")}
            hint={t("admin.pricingTierForm.badgeHint")}
          >
            <Input
              value={form.badge}
              onChange={(e) => set("badge", e.target.value)}
              placeholder="Popular"
              disabled={isDisabled}
              maxLength={50}
            />
          </Field>
          <Field
            label={t("admin.pricingTierForm.order")}
            hint={t("admin.pricingTierForm.orderHint")}
          >
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", e.target.value)}
              disabled={isDisabled}
            />
          </Field>
        </div>
        {editions.length > 0 && (
          <Field
            label={t("admin.pricingTierForm.edition")}
            hint={t("admin.pricingTierForm.editionHint")}
          >
            <AdminSelect
              value={form.editionId}
              onChange={(v) => set("editionId", v)}
              options={[
                { value: "", label: t("admin.pricingTierForm.noEdition") },
                ...editions.map((ed) => ({
                  value: ed.$id,
                  label: ed.name,
                })),
              ]}
              disabled={isDisabled}
            />
          </Field>
        )}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Toggle
            checked={form.isActive}
            onChange={(v) => set("isActive", v)}
            disabled={isDisabled}
            label={t("admin.pricingTierForm.active")}
          />
          <Toggle
            checked={form.isHighlighted}
            onChange={(v) => set("isHighlighted", v)}
            disabled={isDisabled}
            label={t("admin.pricingTierForm.highlighted")}
          />
        </div>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pb-6">
        <Button type="submit" disabled={isDisabled} size="md">
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              {t("admin.pricingTierForm.saving")}
            </span>
          ) : (
            submitLabel || t("admin.pricingTierForm.name")
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onCancel}
            disabled={isDisabled}
          >
            {t("admin.pricingTierForm.cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
