import { useState, useEffect } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

const DB = env.appwriteDatabaseId;

const ITEM_TYPES = [
  { value: "experience", label: "Experiencia" },
  { value: "addon", label: "Addon" },
  { value: "benefit", label: "Beneficio" },
  { value: "accommodation", label: "Hospedaje" },
  { value: "meal", label: "Alimentación" },
];

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

function ReferencePicker({ type, value, onChange, disabled }) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (type !== "experience" && type !== "addon") {
      setOptions([]);
      return;
    }
    setLoading(true);
    const col =
      type === "experience" ? env.collectionExperiences : env.collectionAddons;
    const queries = [Query.orderAsc("name"), Query.limit(100)];
    if (type === "experience") queries.push(Query.equal("status", "published"));
    if (type === "addon") queries.push(Query.equal("status", "active"));
    databases
      .listDocuments(DB, col, queries)
      .then((res) =>
        setOptions(res.documents.map((d) => ({ value: d.$id, label: d.name }))),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [type]);

  if (type !== "experience" && type !== "addon") return null;

  return (
    <Field
      label={type === "experience" ? "Experiencia" : "Addon"}
      hint="Vincula a un registro existente (opcional)"
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className={cn(
          "flex h-11 w-full rounded-xl border border-sand-dark bg-white px-4 py-2 text-sm text-charcoal",
          "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20",
          "disabled:opacity-50 disabled:bg-warm-gray cursor-pointer",
        )}
      >
        <option value="">
          {loading ? "Cargando..." : "Sin referencia específica"}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

const EMPTY = {
  itemType: "",
  referenceId: "",
  description: "",
  descriptionEs: "",
  quantity: "1",
  sortOrder: "",
};

export default function PackageItemForm({
  initialData,
  onSubmit,
  onCancel,
  submitting,
}) {
  const init = initialData
    ? {
        itemType: initialData.itemType || "",
        referenceId: initialData.referenceId || "",
        description: initialData.description || "",
        descriptionEs: initialData.descriptionEs || "",
        quantity:
          initialData.quantity != null ? String(initialData.quantity) : "1",
        sortOrder:
          initialData.sortOrder != null ? String(initialData.sortOrder) : "",
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
    if (!form.itemType) e.itemType = "El tipo es requerido";
    if (!form.description.trim()) e.description = "La descripción es requerida";
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
      itemType: form.itemType,
      referenceId: form.referenceId || null,
      description: form.description.trim(),
      descriptionEs: form.descriptionEs.trim() || null,
      quantity: form.quantity ? parseInt(form.quantity) : null,
      sortOrder: form.sortOrder ? parseInt(form.sortOrder) : 0,
    };

    onSubmit(payload);
  }

  const isDisabled = submitting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-sand-dark px-5 py-4">
          <h3 className="text-base font-semibold text-charcoal">
            {initialData ? "Editar elemento" : "Agregar elemento"}
          </h3>
          <button
            onClick={onCancel}
            className="rounded-lg p-1.5 text-charcoal-muted hover:bg-warm-gray transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <Field label="Tipo de elemento" required error={errors.itemType}>
            <AdminSelect
              value={form.itemType}
              onChange={(v) => {
                set("itemType", v);
                if (v !== "experience" && v !== "addon") set("referenceId", "");
              }}
              options={ITEM_TYPES}
              placeholder="Seleccionar..."
              disabled={isDisabled}
              error={errors.itemType}
            />
          </Field>

          <ReferencePicker
            type={form.itemType}
            value={form.referenceId}
            onChange={(v) => set("referenceId", v)}
            disabled={isDisabled}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Descripción (EN)" required error={errors.description}>
              <Textarea
                value={form.description}
                onChange={(v) => set("description", v)}
                placeholder="One guided breathwork session..."
                disabled={isDisabled}
                rows={3}
                error={errors.description}
              />
            </Field>
            <Field label="Descripción (ES)">
              <Textarea
                value={form.descriptionEs}
                onChange={(v) => set("descriptionEs", v)}
                placeholder="Una sesión guiada de breathwork..."
                disabled={isDisabled}
                rows={3}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Cantidad" hint="Dejar vacío si no aplica">
              <Input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
                placeholder="1"
                disabled={isDisabled}
              />
            </Field>
            <Field label="Orden" hint="Posición en la lista">
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

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isDisabled}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isDisabled}>
              {submitting
                ? "Guardando..."
                : initialData
                  ? "Guardar"
                  : "Agregar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
