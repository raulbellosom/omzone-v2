import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useLocations } from "@/hooks/useLocations";
import AdminSelect from "@/components/common/AdminSelect";
import SearchCombobox from "@/components/common/SearchCombobox";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const ROOM_TYPE_OPTIONS_STATIC = [
  { value: "studio", key: "studio" },
  { value: "therapy_room", key: "therapy_room" },
  { value: "outdoor", key: "outdoor" },
  { value: "pool_area", key: "pool_area" },
  { value: "other", key: "other" },
];

const EMPTY = {
  locationId: "",
  name: "",
  description: "",
  capacity: "",
  type: "studio",
  isActive: true,
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

export default function RoomForm({
  initialData,
  onSubmit,
  submitting,
  submitLabel,
}) {
  const { t } = useLanguage();

  const ROOM_TYPE_OPTIONS = ROOM_TYPE_OPTIONS_STATIC.map((o) => ({
    value: o.value,
    label: t(`admin.resourceForms.roomTypes.${o.key}`),
  }));

  const [form, setForm] = useState({ ...EMPTY, ...initialData });
  const [errors, setErrors] = useState({});

  // Only active locations for the select
  const { data: locations, loading: loadingLocations } = useLocations({
    activeOnly: true,
  });

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
    if (!form.name.trim()) e.name = t("admin.resourceForms.nameRequired");
    if (!form.locationId)
      e.locationId = t("admin.resourceForms.locationRequired");
    if (form.capacity !== "" && form.capacity !== null) {
      const n = parseInt(form.capacity);
      if (isNaN(n) || n < 1)
        e.capacity = t("admin.resourceForms.capacityPositive");
    }
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      locationId: form.locationId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      capacity: form.capacity !== "" ? parseInt(form.capacity) : null,
      type: form.type || null,
      isActive: form.isActive,
    };

    await onSubmit(payload);
  }

  const locationOptions = locations.map((l) => ({
    value: l.$id,
    label: l.name,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identidad */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.resourceForms.roomSection")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("admin.resourceForms.location")}
            required
            error={errors.locationId}
          >
            <SearchCombobox
              value={form.locationId}
              onValueChange={(v) => set("locationId", v)}
              options={locationOptions}
              disabled={submitting || loadingLocations}
              error={!!errors.locationId}
              placeholder={
                loadingLocations
                  ? t("admin.resourceForms.loading")
                  : t("admin.resourceForms.selectLocation")
              }
              searchPlaceholder={t("admin.resourceForms.searchLocation")}
              emptyMessage={t("admin.resourceForms.noLocations")}
            />
          </Field>
          <Field
            label={t("admin.resourceForms.name")}
            required
            error={errors.name}
          >
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t("admin.placeholders.roomName")}
              disabled={submitting}
              className={errors.name ? "border-red-400" : ""}
            />
          </Field>
          <Field label={t("admin.resourceForms.roomType")}>
            <AdminSelect
              value={form.type}
              onChange={(v) => set("type", v)}
              options={ROOM_TYPE_OPTIONS}
              disabled={submitting}
            />
          </Field>
          <Field
            label={t("admin.resourceForms.capacity")}
            hint={t("admin.resourceForms.capacityHint")}
            error={errors.capacity}
          >
            <Input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder={t("admin.placeholders.roomCapacity")}
              disabled={submitting}
              className={errors.capacity ? "border-red-400" : ""}
            />
          </Field>
          <div className="flex items-center pt-5">
            <Toggle
              checked={form.isActive}
              onChange={(v) => set("isActive", v)}
              label={t("admin.resourceForms.roomActive")}
              disabled={submitting}
            />
          </div>
        </div>
      </Card>

      {/* Descripción */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.resourceForms.descriptionSection")}
        </h2>
        <Field label={t("admin.resourceForms.description")}>
          <Textarea
            value={form.description}
            onChange={(v) => set("description", v)}
            placeholder={t("admin.placeholders.roomDescription")}
            disabled={submitting}
          />
        </Field>
      </Card>

      <div className="flex items-center gap-3 pb-6">
        <Button type="submit" disabled={submitting} size="md">
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              {t("admin.resourceForms.saving")}
            </span>
          ) : (
            submitLabel || t("admin.resourceForms.save")
          )}
        </Button>
      </div>
    </form>
  );
}
