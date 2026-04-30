import { useState } from "react";
import { Input } from "@/components/common/Input";
import AdminFormLayout from "@/components/admin/AdminFormLayout";
import { Card } from "@/components/common/Card";
import ImageUpload from "@/components/admin/experiences/ImageUpload";
import AdminSelect from "@/components/common/AdminSelect";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

// Resource type options moved inside component for i18n

const EMPTY = {
  name: "",
  type: "instructor",
  description: "",
  photoId: "",
  contactInfo: "",
  isActive: true,
  metadata: "",
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
  error,
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
        error && "border-red-400",
      )}
    />
  );
}

export default function ResourceForm({
  initialData,
  onSubmit,
  submitting,
  submitLabel,
}) {
  const { t } = useLanguage();

  const RESOURCE_TYPE_OPTIONS = [
    {
      value: "instructor",
      label: t("admin.resourceForms.resourceTypes.instructor"),
    },
    {
      value: "facilitator",
      label: t("admin.resourceForms.resourceTypes.facilitator"),
    },
    {
      value: "therapist",
      label: t("admin.resourceForms.resourceTypes.therapist"),
    },
    {
      value: "equipment",
      label: t("admin.resourceForms.resourceTypes.equipment"),
    },
  ];

  const [form, setForm] = useState({
    ...EMPTY,
    ...Object.fromEntries(
      Object.entries(initialData ?? {}).map(([k, v]) => [
        k,
        v === null && typeof EMPTY[k] === "string" ? "" : v,
      ]),
    ),
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
    if (!form.name.trim()) e.name = t("admin.resourceForms.nameRequired");
    if (!form.type) e.type = t("admin.resourceForms.typeRequired");
    if (form.metadata.trim()) {
      try {
        JSON.parse(form.metadata);
      } catch {
        e.metadata = t("admin.resourceForms.invalidJson");
      }
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
      name: form.name.trim(),
      type: form.type,
      description: form.description.trim() || null,
      photoId: form.photoId || null,
      contactInfo: form.contactInfo.trim() || null,
      isActive: form.isActive,
      metadata: form.metadata.trim() || null,
    };

    await onSubmit(payload);
  }

  const isEditMode = Boolean(initialData?.$id);

  const currentTypeLabel =
    RESOURCE_TYPE_OPTIONS.find((o) => o.value === form.type)?.label ?? form.type;

  const asideContent = (
    <>
      <div className="rounded-2xl border border-sand-dark/40 bg-white p-4 shadow-sm space-y-4">
        <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.formSections.publication")}
        </p>
        <Toggle
          checked={form.isActive}
          onChange={(v) => set("isActive", v)}
          label={t("admin.resourceForms.resourceActive")}
          disabled={submitting}
        />
      </div>
      {isEditMode && (
        <div className="rounded-2xl border border-sand-dark/40 bg-white p-4 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
            {t("admin.common.quickInfo")}
          </p>
          <div className="space-y-2.5 text-sm">
            {form.type && (
              <div>
                <p className="text-xs text-charcoal-subtle mb-1">
                  {t("admin.resourceForms.type")}
                </p>
                <p className="text-xs text-charcoal">{currentTypeLabel}</p>
              </div>
            )}
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
    <AdminFormLayout onSubmit={handleSubmit} submitting={submitting} disabled={submitting} submitLabel={submitLabel} asideChildren={asideContent}>
      {/* Identidad */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.resourceForms.resourceSection")}
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
              placeholder={t("admin.placeholders.resourceName")}
              disabled={submitting}
              className={errors.name ? "border-red-400" : ""}
            />
          </Field>
          <Field
            label={t("admin.resourceForms.type")}
            required
            error={errors.type}
          >
            <AdminSelect
              value={form.type}
              onChange={(v) => set("type", v)}
              options={RESOURCE_TYPE_OPTIONS}
              disabled={submitting}
              error={errors.type}
            />
          </Field>
          <Field
            label={t("admin.resourceForms.contact")}
            hint={t("admin.resourceForms.contactHint")}
          >
            <Input
              value={form.contactInfo}
              onChange={(e) => set("contactInfo", e.target.value)}
              placeholder={t("admin.placeholders.resourceContact")}
              disabled={submitting}
              maxLength={500}
            />
          </Field>
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
            placeholder={t("admin.placeholders.resourceDescription")}
            disabled={submitting}
            maxLength={5000}
          />
        </Field>
      </Card>

      {/* Foto */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.resourceForms.resourcePhoto")}
        </h2>
        <div className="max-w-sm">
          <ImageUpload
            fileId={form.photoId}
            onUpload={(id) => set("photoId", id)}
            onRemove={() => set("photoId", "")}
            disabled={submitting}
          />
        </div>
      </Card>

      {/* Metadata */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.resourceForms.metadata")}
        </h2>
        <Field
          label={t("admin.resourceForms.metadata")}
          hint={t("admin.resourceForms.metadataHint")}
          error={errors.metadata}
        >
          <Textarea
            value={form.metadata}
            onChange={(v) => set("metadata", v)}
            placeholder={t("admin.placeholders.resourceMetadata")}
            disabled={submitting}
            rows={4}
            error={errors.metadata}
          />
        </Field>
      </Card>

    </AdminFormLayout>
  );
}
