import { useState, useEffect } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import ImageUpload from "@/components/admin/experiences/ImageUpload";
import { slugify, checkAddonSlugAvailable } from "@/hooks/useAddons";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";

const ADDON_TYPE_OPTIONS = [
  { value: "service", label: "Servicio" },
  { value: "transport", label: "Transporte" },
  { value: "food", label: "Alimentos" },
  { value: "accommodation", label: "Hospedaje" },
  { value: "equipment", label: "Equipo" },
  { value: "other", label: "Otro" },
];

const PRICE_TYPE_OPTIONS = [
  { value: "fixed", label: "Fijo" },
  { value: "per-person", label: "Por persona" },
  { value: "per-day", label: "Por día" },
  { value: "per-unit", label: "Por unidad" },
  { value: "quote", label: "Cotización" },
];

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
  submitLabel = "Guardar",
}) {
  const init = initialData
    ? {
        ...EMPTY,
        ...initialData,
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
    if (!form.name.trim()) e.name = "El nombre es requerido";
    if (!form.slug.trim()) {
      e.slug = "El slug es requerido";
    } else {
      const available = await checkAddonSlugAvailable(
        form.slug.trim(),
        initialData?.$id,
      );
      if (!available) e.slug = "Este slug ya está en uso";
    }
    if (!form.addonType) e.addonType = "El tipo es requerido";
    if (!form.priceType) e.priceType = "El tipo de precio es requerido";
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
              placeholder="Transporte aeropuerto"
              disabled={isDisabled}
              className={errors.name ? "border-red-400" : ""}
            />
          </Field>
          <Field label="Nombre (ES)">
            <Input
              value={form.nameEs}
              onChange={(e) => set("nameEs", e.target.value)}
              placeholder="Transporte aeropuerto"
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
            placeholder="transporte-aeropuerto"
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
              placeholder="Airport transfer service..."
              disabled={isDisabled}
              rows={4}
            />
          </Field>
          <Field label="Descripción (ES)">
            <Textarea
              value={form.descriptionEs}
              onChange={(v) => set("descriptionEs", v)}
              placeholder="Servicio de transporte al aeropuerto..."
              disabled={isDisabled}
              rows={4}
            />
          </Field>
        </div>
      </Card>

      {/* Tipo y precio */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Tipo y precio
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tipo de addon" required error={errors.addonType}>
            <AdminSelect
              value={form.addonType}
              onChange={(v) => set("addonType", v)}
              options={ADDON_TYPE_OPTIONS}
              disabled={isDisabled}
              error={errors.addonType}
            />
          </Field>
          <Field label="Tipo de precio" required error={errors.priceType}>
            <AdminSelect
              value={form.priceType}
              onChange={(v) => set("priceType", v)}
              options={PRICE_TYPE_OPTIONS}
              disabled={isDisabled}
              error={errors.priceType}
            />
          </Field>
          <Field label="Precio base" required error={errors.basePrice}>
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

      {/* Opciones */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Opciones
        </h2>
        <div className="space-y-3">
          <Toggle
            checked={form.isStandalone}
            onChange={(v) => set("isStandalone", v)}
            disabled={isDisabled}
            label="Se puede vender de forma independiente"
          />
          <Toggle
            checked={form.isPublic}
            onChange={(v) => set("isPublic", v)}
            disabled={isDisabled}
            label="Visible al público"
          />
          <Toggle
            checked={form.followsMainDuration}
            onChange={(v) => set("followsMainDuration", v)}
            disabled={isDisabled}
            label="Sigue la duración de la experiencia principal"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Field label="Cantidad máxima" hint="Dejar vacío si no hay límite">
            <Input
              type="number"
              min={1}
              value={form.maxQuantity}
              onChange={(e) => set("maxQuantity", e.target.value)}
              placeholder="10"
              disabled={isDisabled}
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

      {/* Estado */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          Estado
        </h2>
        <div className="max-w-xs">
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
