import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import AdminSelect from "@/components/common/AdminSelect";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

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

export default function AddonAssignmentForm({
  availableAddons,
  initialData,
  existingAddonIds,
  onSubmit,
  onCancel,
  submitting,
}) {
  const isEdit = !!initialData;
  const { t } = useLanguage();

  const [form, setForm] = useState({
    addonId: initialData?.addonId || "",
    isRequired: initialData?.isRequired ?? false,
    isDefault: initialData?.isDefault ?? false,
    overridePrice: initialData?.overridePrice ?? "",
    sortOrder: initialData?.sortOrder ?? "",
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
    if (!form.addonId) e.addonId = t("admin.validation.selectAddon");
    if (!isEdit && form.addonId && existingAddonIds.includes(form.addonId)) {
      e.addonId = t("admin.validation.addonAlreadyAssigned");
    }
    if (form.overridePrice !== "" && form.overridePrice !== null) {
      const price = parseFloat(form.overridePrice);
      if (isNaN(price) || price < 0) {
        e.overridePrice = t("admin.validation.priceZeroOrMore");
      }
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
      addonId: form.addonId,
      isRequired: form.isRequired,
      isDefault: form.isDefault,
      overridePrice:
        form.overridePrice !== "" && form.overridePrice !== null
          ? parseFloat(form.overridePrice)
          : null,
      sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0,
    };

    onSubmit(payload);
  }

  // Filter addons: in edit mode show all, in create mode exclude already assigned
  const selectableAddons = isEdit
    ? availableAddons
    : availableAddons.filter((a) => !existingAddonIds.includes(a.$id));

  return (
    <Card className="p-5 space-y-4 border-sage/40">
      <h3 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
        {isEdit
          ? t("admin.addonAssignment.editTitle")
          : t("admin.addonAssignment.assignTitle")}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          label={t("admin.addonAssignment.addonLabel")}
          required
          error={errors.addonId}
        >
          <AdminSelect
            value={form.addonId}
            onChange={(v) => set("addonId", v)}
            disabled={submitting || isEdit}
            error={!!errors.addonId}
            placeholder={t("admin.addonAssignment.selectAddon")}
            options={[
              { value: "", label: t("admin.addonAssignment.selectAddon") },
              ...selectableAddons.map((addon) => ({
                value: addon.$id,
                label: `${addon.name} — $${addon.basePrice} ${addon.currency}`,
              })),
            ]}
          />
        </Field>

        <div className="space-y-3">
          <Toggle
            checked={form.isRequired}
            onChange={(v) => set("isRequired", v)}
            disabled={submitting}
            label={t("admin.addonAssignment.requiredToggle")}
          />
          <Toggle
            checked={form.isDefault}
            onChange={(v) => set("isDefault", v)}
            disabled={submitting}
            label={t("admin.addonAssignment.defaultToggle")}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("admin.addonAssignment.overridePrice")}
            error={errors.overridePrice}
            hint={t("admin.addonAssignment.overridePriceHint")}
          >
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.overridePrice}
              onChange={(e) => set("overridePrice", e.target.value)}
              placeholder={t("admin.addonAssignment.basePrice")}
              disabled={submitting}
              className={errors.overridePrice ? "border-red-400" : ""}
            />
          </Field>
          <Field
            label={t("admin.addonAssignment.order")}
            hint={t("admin.addonAssignment.orderHint")}
          >
            <Input
              type="number"
              min={0}
              value={form.sortOrder}
              onChange={(e) => set("sortOrder", e.target.value)}
              placeholder="0"
              disabled={submitting}
            />
          </Field>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={submitting} size="sm">
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                {t("admin.addonAssignment.saving")}
              </span>
            ) : isEdit ? (
              t("admin.addonAssignment.save")
            ) : (
              t("admin.addonAssignment.assign")
            )}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={submitting}
            >
              {t("admin.addonAssignment.cancel")}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
