import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import ImageUpload from "./ImageUpload";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "open", label: "Abierta" },
  { value: "closed", label: "Cerrada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
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
  submitLabel = "Guardar",
}) {
  const init = initialData
    ? {
        ...EMPTY,
        ...initialData,
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
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.status) e.status = "El estado es requerido";
    if (form.startDate && form.endDate && form.endDate <= form.startDate) {
      e.endDate = "La fecha de fin debe ser posterior a la de inicio";
    }
    if (
      form.registrationCloses &&
      form.startDate &&
      form.registrationCloses >= form.startDate
    ) {
      e.registrationCloses =
        "El cierre de registro debe ser anterior al inicio";
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identidad */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Identidad
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nombre" required error={errors.name}>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Edición Primavera 2026"
              disabled={isDisabled}
              className={errors.name ? "border-red-400" : ""}
            />
          </Field>
          <Field label="Nombre (ES)">
            <Input
              value={form.nameEs}
              onChange={(e) => set("nameEs", e.target.value)}
              placeholder="Edición Primavera 2026"
              disabled={isDisabled}
            />
          </Field>
        </div>
      </Card>

      {/* Descripción */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Descripción
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Descripción (EN)">
            <Textarea
              value={form.description}
              onChange={(v) => set("description", v)}
              placeholder="Spring edition details..."
              disabled={isDisabled}
              rows={4}
            />
          </Field>
          <Field label="Descripción (ES)">
            <Textarea
              value={form.descriptionEs}
              onChange={(v) => set("descriptionEs", v)}
              placeholder="Detalles de la edición..."
              disabled={isDisabled}
              rows={4}
            />
          </Field>
        </div>
      </Card>

      {/* Fechas */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Fechas
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Fecha de inicio" error={errors.startDate}>
            <Input
              type="datetime-local"
              value={form.startDate}
              onChange={(e) => set("startDate", e.target.value)}
              disabled={isDisabled}
            />
          </Field>
          <Field label="Fecha de fin" error={errors.endDate}>
            <Input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => set("endDate", e.target.value)}
              disabled={isDisabled}
            />
          </Field>
          <Field label="Apertura de registro" error={errors.registrationOpens}>
            <Input
              type="datetime-local"
              value={form.registrationOpens}
              onChange={(e) => set("registrationOpens", e.target.value)}
              disabled={isDisabled}
            />
          </Field>
          <Field label="Cierre de registro" error={errors.registrationCloses}>
            <Input
              type="datetime-local"
              value={form.registrationCloses}
              onChange={(e) => set("registrationCloses", e.target.value)}
              disabled={isDisabled}
            />
          </Field>
        </div>
      </Card>

      {/* Capacidad y estado */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Capacidad y estado
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Capacidad máxima" hint="Dejar vacío si no hay límite">
            <Input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="30"
              disabled={isDisabled}
            />
          </Field>
          <Field label="Estado" required error={errors.status}>
            <AdminSelect
              value={form.status}
              onChange={(v) => set("status", v)}
              options={STATUS_OPTIONS}
              disabled={isDisabled}
              error={errors.status}
            />
          </Field>
        </div>
      </Card>

      {/* Imagen de portada */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Imagen de portada
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

      {/* Actions */}
      <div className="flex items-center gap-3 pb-6">
        <Button type="submit" disabled={isDisabled} size="md">
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Guardando...
            </span>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
