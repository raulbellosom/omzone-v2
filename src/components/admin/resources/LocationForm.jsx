import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const EMPTY = {
  name: "",
  description: "",
  address: "",
  coordinates: "",
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

function Textarea({
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
  maxLength,
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      maxLength={maxLength}
      className={cn(
        "flex w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-subtle",
        "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none",
        "disabled:opacity-50 disabled:bg-warm-gray",
      )}
    />
  );
}

export default function LocationForm({
  initialData,
  onSubmit,
  submitting,
  submitLabel,
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ ...EMPTY, ...initialData });
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
    if (!form.name.trim()) e.name = t("admin.resourceForms.nameRequired");
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
      name: form.name.trim(),
      description: form.description.trim() || null,
      address: form.address.trim() || null,
      coordinates: form.coordinates.trim() || null,
      isActive: form.isActive,
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identidad */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.resourceForms.locationSection")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("admin.resourceForms.name")}
            required
            error={errors.name}
          >
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Estudio principal"
              disabled={submitting}
              className={errors.name ? "border-red-400" : ""}
            />
          </Field>
          <Field
            label={t("admin.resourceForms.address")}
            hint={t("admin.resourceForms.addressHint")}
          >
            <Input
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="Av. Tulum 123, Tulum, Q.R."
              disabled={submitting}
              maxLength={500}
            />
          </Field>
          <Field
            label={t("admin.resourceForms.coordinates")}
            hint={t("admin.resourceForms.coordinatesHint")}
          >
            <Input
              value={form.coordinates}
              onChange={(e) => set("coordinates", e.target.value)}
              placeholder="20.2114,-87.4653"
              disabled={submitting}
              maxLength={100}
            />
          </Field>
          <div className="flex items-center pt-5">
            <Toggle
              checked={form.isActive}
              onChange={(v) => set("isActive", v)}
              label={t("admin.resourceForms.locationActive")}
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
            placeholder="Estudio de yoga y meditación con capacidad para 30 personas..."
            disabled={submitting}
            maxLength={5000}
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
