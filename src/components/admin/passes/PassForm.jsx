import { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import ImageUpload from "@/components/admin/experiences/ImageUpload";
import ExperiencePicker from "@/components/admin/passes/ExperiencePicker";
import { slugify, checkPassSlugAvailable } from "@/hooks/usePasses";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  { value: "active", label: "Activo" },
  { value: "inactive", label: "Inactivo" },
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
  totalCredits: "",
  basePrice: "",
  currency: "MXN",
  validityDays: "",
  validExperienceIds: [],
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

function parseJsonArray(val) {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function PassForm({
  initialData,
  onSubmit,
  submitting,
  submitLabel = "Guardar",
}) {
  const init = initialData
    ? {
        ...EMPTY,
        ...initialData,
        totalCredits: initialData.totalCredits ?? "",
        basePrice: initialData.basePrice ?? "",
        validityDays: initialData.validityDays ?? "",
        sortOrder: initialData.sortOrder ?? "",
        heroImageId: initialData.heroImageId ?? "",
        validExperienceIds: parseJsonArray(initialData.validExperienceIds),
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
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.slug.trim()) {
      e.slug = "El slug es requerido";
    } else {
      const available = await checkPassSlugAvailable(
        form.slug.trim(),
        initialData?.$id,
      );
      if (!available) e.slug = "Este slug ya está en uso";
    }
    const credits = parseInt(form.totalCredits);
    if (isNaN(credits) || credits < 1) {
      e.totalCredits = "Los créditos deben ser al menos 1";
    }
    const price = parseFloat(form.basePrice);
    if (isNaN(price) || price <= 0) {
      e.basePrice = "El precio debe ser mayor a 0";
    }
    if (!form.currency) e.currency = "La moneda es requerida";
    if (!form.status) e.status = "El estado es requerido";
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
      totalCredits: parseInt(form.totalCredits),
      basePrice: parseFloat(form.basePrice),
      currency: form.currency,
      validityDays: form.validityDays ? parseInt(form.validityDays) : null,
      validExperienceIds:
        form.validExperienceIds.length > 0
          ? JSON.stringify(form.validExperienceIds)
          : null,
      heroImageId: form.heroImageId || null,
      status: form.status,
      sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0,
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
              placeholder="Pase Breath & Move"
              disabled={isDisabled}
              className={errors.name ? "border-red-400" : ""}
            />
          </Field>
          <Field label="Nombre (ES)">
            <Input
              value={form.nameEs}
              onChange={(e) => set("nameEs", e.target.value)}
              placeholder="Pase Respira y Muévete"
              disabled={isDisabled}
            />
          </Field>
        </div>
        <Field
          label="Slug"
          required
          error={errors.slug}
          hint="Se genera automáticamente, editable manualmente"
        >
          <Input
            value={form.slug}
            onChange={(e) => {
              setSlugManual(true);
              set("slug", e.target.value);
            }}
            placeholder="pase-breath-move"
            disabled={isDisabled}
            className={errors.slug ? "border-red-400" : ""}
          />
        </Field>
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
              placeholder="Multi-session pass for wellness experiences..."
              disabled={isDisabled}
              rows={4}
            />
          </Field>
          <Field label="Descripción (ES)">
            <Textarea
              value={form.descriptionEs}
              onChange={(v) => set("descriptionEs", v)}
              placeholder="Pase multi-sesión para experiencias de bienestar..."
              disabled={isDisabled}
              rows={4}
            />
          </Field>
        </div>
      </Card>

      {/* Créditos y precio */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Créditos y precio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Total de créditos"
            required
            error={errors.totalCredits}
            hint="Número de sesiones/usos incluidos"
          >
            <Input
              type="number"
              min={1}
              value={form.totalCredits}
              onChange={(e) => set("totalCredits", e.target.value)}
              placeholder="10"
              disabled={isDisabled}
              className={errors.totalCredits ? "border-red-400" : ""}
            />
          </Field>
          <Field label="Vigencia (días)" hint="Dejar vacío si no vence">
            <Input
              type="number"
              min={1}
              value={form.validityDays}
              onChange={(e) => set("validityDays", e.target.value)}
              placeholder="90"
              disabled={isDisabled}
            />
          </Field>
          <Field label="Precio base" required error={errors.basePrice}>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={form.basePrice}
              onChange={(e) => set("basePrice", e.target.value)}
              placeholder="3500.00"
              disabled={isDisabled}
              className={errors.basePrice ? "border-red-400" : ""}
            />
          </Field>
          <Field label="Moneda" required error={errors.currency}>
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

      {/* Experiencias válidas */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Experiencias válidas
        </h2>
        <Field hint="Si no seleccionas ninguna, el pase aplica para todas las experiencias">
          <ExperiencePicker
            value={form.validExperienceIds}
            onChange={(v) => set("validExperienceIds", v)}
            disabled={isDisabled}
          />
        </Field>
      </Card>

      {/* Estado y orden */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Estado y orden
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Estado" required error={errors.status}>
            <AdminSelect
              value={form.status}
              onChange={(v) => set("status", v)}
              options={STATUS_OPTIONS}
              disabled={isDisabled}
              error={errors.status}
            />
          </Field>
          <Field label="Orden" hint="Orden de aparición (menor = primero)">
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

      {/* Imagen */}
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

      {/* Acciones */}
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
