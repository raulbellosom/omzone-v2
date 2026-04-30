import { useState } from "react";
import { Copy } from "lucide-react";
import { Input } from "@/components/common/Input";
import AdminFormLayout from "@/components/admin/AdminFormLayout";
import { Card } from "@/components/common/Card";
import ImageUpload from "./ImageUpload";
import AdminSelect from "@/components/common/AdminSelect";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "draft", i18nKey: "admin.statuses.draft" },
  { value: "open", i18nKey: "admin.statuses.open" },
  { value: "closed", i18nKey: "admin.statuses.closed" },
  { value: "completed", i18nKey: "admin.statuses.completed" },
  { value: "cancelled", i18nKey: "admin.statuses.cancelled" },
];

const EMPTY = {
  name: "",
  nameEs: "",
  description: "",
  descriptionEs: "",
  startDate: "",
  endDate: "",
  registrationOpens: "",
  registrationCloses: "",
  capacity: "",
  status: "draft",
  heroImageId: "",
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

function toDatetimeLocal(iso) {
  if (!iso) return "";
  return iso.slice(0, 16);
}

function fromDatetimeLocal(val) {
  if (!val) return null;
  return new Date(val).toISOString();
}

export default function EditionForm({
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
        startDate: toDatetimeLocal(initialData.startDate),
        endDate: toDatetimeLocal(initialData.endDate),
        registrationOpens: toDatetimeLocal(initialData.registrationOpens),
        registrationCloses: toDatetimeLocal(initialData.registrationCloses),
        capacity: initialData.capacity ?? "",
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
    if (!form.name.trim()) e.name = t("admin.validation.nameRequired");
    if (!form.status) e.status = t("admin.validation.statusRequired");
    if (form.startDate && form.endDate && form.endDate <= form.startDate) {
      e.endDate = t("admin.validation.endDateAfterStart");
    }
    if (
      form.registrationCloses &&
      form.startDate &&
      form.registrationCloses >= form.startDate
    ) {
      e.registrationCloses = t("admin.validation.registrationCloseBeforeStart");
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
      startDate: fromDatetimeLocal(form.startDate),
      endDate: fromDatetimeLocal(form.endDate),
      registrationOpens: fromDatetimeLocal(form.registrationOpens),
      registrationCloses: fromDatetimeLocal(form.registrationCloses),
      capacity: form.capacity ? parseInt(form.capacity) : null,
      status: form.status,
      heroImageId: form.heroImageId || null,
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
        <Field label={t("admin.experienceForm.status")} required error={errors.status}>
          <AdminSelect
            value={form.status}
            onChange={(v) => set("status", v)}
            options={STATUS_OPTIONS.map((o) => ({ ...o, label: t(o.i18nKey) }))}
            disabled={isDisabled}
            error={errors.status}
          />
        </Field>
      </div>

      {isEditMode && (
        <div className="rounded-2xl border border-sand-dark/40 bg-white p-4 shadow-sm space-y-3">
          <p className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wider">
            {t("admin.common.quickInfo") || "Quick Info"}
          </p>
          <div className="space-y-2.5 text-sm">
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
          {t("admin.editionForm.sectionIdentity")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label={t("admin.editionForm.name")}
            required
            error={errors.name}
          >
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={t("admin.placeholders.editionName")}
              disabled={isDisabled}
              className={errors.name ? "border-red-400" : ""}
            />
          </Field>
          <Field label={t("admin.editionForm.nameEs")}>
            <Input
              value={form.nameEs}
              onChange={(e) => set("nameEs", e.target.value)}
              placeholder={t("admin.placeholders.editionNameEs")}
              disabled={isDisabled}
            />
          </Field>
        </div>
      </Card>

      {/* Descripción */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.editionForm.sectionDescription")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={t("admin.editionForm.descriptionEn")}>
            <Textarea
              value={form.description}
              onChange={(v) => set("description", v)}
              placeholder={t("admin.placeholders.editionDescEn")}
              disabled={isDisabled}
              rows={4}
            />
          </Field>
          <Field label={t("admin.editionForm.descriptionEs")}>
            <Textarea
              value={form.descriptionEs}
              onChange={(v) => set("descriptionEs", v)}
              placeholder={t("admin.placeholders.editionDescEs")}
              disabled={isDisabled}
              rows={4}
            />
          </Field>
        </div>
      </Card>

      {/* Fechas */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.editionForm.sectionDates")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label={t("admin.editionForm.startDate")}
            error={errors.startDate}
          >
            <Input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              disabled={isDisabled}
            />
          </Field>
          <Field label={t("admin.editionForm.endDate")} error={errors.endDate}>
            <Input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              disabled={isDisabled}
            />
          </Field>
          <Field
            label={t("admin.editionForm.registrationOpen")}
            error={errors.registrationOpens}
          >
            <Input
              type="datetime-local"
              value={form.registrationOpens}
              onChange={(e) => set("registrationOpens", e.target.value)}
              disabled={isDisabled}
            />
          </Field>
          <Field
            label={t("admin.editionForm.registrationClose")}
            error={errors.registrationCloses}
          >
            <Input
              type="datetime-local"
              value={form.registrationCloses}
              onChange={(e) => set("registrationCloses", e.target.value)}
              disabled={isDisabled}
            />
          </Field>
        </div>
      </Card>

      {/* Capacidad */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.editionForm.sectionCapacityStatus")}
        </h2>
        <div className="max-w-xs">
          <Field
            label={t("admin.editionForm.maxCapacity")}
            hint={t("admin.editionForm.capacityHint")}
          >
            <Input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="30"
              disabled={isDisabled}
            />
          </Field>
        </div>
      </Card>

      {/* Imagen de portada */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {t("admin.editionForm.sectionCoverImage")}
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
