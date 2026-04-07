import { useState } from "react";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import GalleryManager from "@/components/admin/media/GalleryManager";
import env from "@/config/env";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";

const SECTION_TYPES = [
  { value: "hero", label: "Hero" },
  { value: "text", label: "Texto" },
  { value: "gallery", label: "Galería" },
  { value: "highlights", label: "Highlights" },
  { value: "faq", label: "FAQ" },
  { value: "itinerary", label: "Itinerario" },
  { value: "testimonials", label: "Testimonios" },
  { value: "inclusions", label: "Inclusiones" },
  { value: "restrictions", label: "Restricciones" },
  { value: "cta", label: "Call to Action" },
  { value: "video", label: "Video" },
];

const EMPTY = {
  sectionType: "text",
  title: "",
  titleEs: "",
  content: "",
  contentEs: "",
  mediaIds: "",
  metadata: "",
  isVisible: true,
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
          "relative w-10 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sage/40",
          checked ? "bg-sage" : "bg-sand-dark",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        <span
          className={cn(
            "absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform",
            checked ? "translate-x-5" : "translate-x-1",
          )}
        />
      </button>
      <span className="text-sm text-charcoal">{label}</span>
    </label>
  );
}

export default function SectionForm({
  initialData,
  onSubmit,
  onCancel,
  submitting,
}) {
  const isEditing = !!initialData?.$id;

  // mediaIds is stored as a JSON string in Appwrite; we keep two representations:
  //   form.mediaIds     — string[] used by GalleryManager
  //   form.mediaIdsRaw  — raw JSON textarea for non-gallery sections
  function parseMediaIds(val) {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    try {
      return JSON.parse(val) ?? [];
    } catch {
      return [];
    }
  }

  const [form, setForm] = useState(() => {
    if (initialData) {
      const parsed = parseMediaIds(initialData.mediaIds);
      return {
        sectionType: initialData.sectionType || "text",
        title: initialData.title || "",
        titleEs: initialData.titleEs || "",
        content: initialData.content || "",
        contentEs: initialData.contentEs || "",
        mediaIds: parsed,
        mediaIdsRaw:
          parsed.length > 0
            ? JSON.stringify(parsed)
            : initialData.mediaIds || "",
        metadata:
          typeof initialData.metadata === "string"
            ? initialData.metadata
            : JSON.stringify(initialData.metadata || {}),
        isVisible: initialData.isVisible ?? true,
      };
    }
    return { ...EMPTY, mediaIds: [], mediaIdsRaw: "" };
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

  const isGallery = form.sectionType === "gallery";

  function validate() {
    const e = {};
    if (!form.sectionType) e.sectionType = "El tipo es requerido";
    // Validate raw JSON textarea only for non-gallery sections
    if (!isGallery && form.mediaIdsRaw.trim()) {
      try {
        const parsed = JSON.parse(form.mediaIdsRaw);
        if (!Array.isArray(parsed)) e.mediaIds = "Debe ser un array JSON";
      } catch {
        e.mediaIds = "JSON inválido";
      }
    }
    if (form.metadata.trim()) {
      try {
        JSON.parse(form.metadata);
      } catch {
        e.metadata = "JSON inválido";
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

    // Serialize mediaIds: array → JSON string (or null)
    let mediaIdsValue = null;
    if (isGallery) {
      mediaIdsValue =
        form.mediaIds.length > 0 ? JSON.stringify(form.mediaIds) : null;
    } else {
      mediaIdsValue = form.mediaIdsRaw.trim() || null;
    }

    const payload = {
      sectionType: form.sectionType,
      title: form.title.trim() || null,
      titleEs: form.titleEs.trim() || null,
      content: form.content.trim() || null,
      contentEs: form.contentEs.trim() || null,
      mediaIds: mediaIdsValue,
      metadata: form.metadata.trim() || null,
      isVisible: form.isVisible,
    };

    onSubmit(payload);
  }

  const isDisabled = submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
          {isEditing ? "Editar sección" : "Nueva sección"}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tipo de sección" required error={errors.sectionType}>
            <AdminSelect
              value={form.sectionType}
              onChange={(v) => set("sectionType", v)}
              options={SECTION_TYPES}
              disabled={isDisabled || isEditing}
              error={!!errors.sectionType}
            />
          </Field>
          <div className="flex items-end">
            <Toggle
              checked={form.isVisible}
              onChange={(v) => set("isVisible", v)}
              label="Visible"
              disabled={isDisabled}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Título (EN)">
            <Input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Section title"
              disabled={isDisabled}
              maxLength={255}
            />
          </Field>
          <Field label="Título (ES)">
            <Input
              value={form.titleEs}
              onChange={(e) => set("titleEs", e.target.value)}
              placeholder="Título de la sección"
              disabled={isDisabled}
              maxLength={255}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Contenido (EN)">
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              placeholder="Section content..."
              disabled={isDisabled}
              rows={6}
              className={cn(
                "flex w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-subtle",
                "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none",
                "disabled:opacity-50 disabled:bg-warm-gray",
              )}
            />
          </Field>
          <Field label="Contenido (ES)">
            <textarea
              value={form.contentEs}
              onChange={(e) => set("contentEs", e.target.value)}
              placeholder="Contenido de la sección..."
              disabled={isDisabled}
              rows={6}
              className={cn(
                "flex w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-charcoal placeholder:text-charcoal-subtle",
                "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none",
                "disabled:opacity-50 disabled:bg-warm-gray",
              )}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Media"
            hint={
              isGallery
                ? "Gestiona las imágenes de la galería"
                : 'Array JSON, ej: ["file1","file2"]'
            }
            error={errors.mediaIds}
          >
            {isGallery ? (
              <GalleryManager
                value={form.mediaIds}
                onChange={(ids) => set("mediaIds", ids)}
                bucketId={env.bucketPublicationMedia}
                isAdmin
                disabled={isDisabled}
              />
            ) : (
              <textarea
                value={form.mediaIdsRaw}
                onChange={(e) => set("mediaIdsRaw", e.target.value)}
                placeholder='["fileId1", "fileId2"]'
                disabled={isDisabled}
                rows={2}
                className={cn(
                  "flex w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-charcoal font-mono placeholder:text-charcoal-subtle",
                  "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none",
                  "disabled:opacity-50 disabled:bg-warm-gray",
                  errors.mediaIds && "border-red-400",
                )}
              />
            )}
          </Field>
          <Field
            label="Metadata"
            hint="Objeto JSON con datos adicionales"
            error={errors.metadata}
          >
            <textarea
              value={form.metadata}
              onChange={(e) => set("metadata", e.target.value)}
              placeholder='{"key": "value"}'
              disabled={isDisabled}
              rows={2}
              className={cn(
                "flex w-full rounded-xl border border-sand-dark bg-white px-4 py-3 text-sm text-charcoal font-mono placeholder:text-charcoal-subtle",
                "focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 resize-none",
                "disabled:opacity-50 disabled:bg-warm-gray",
                errors.metadata && "border-red-400",
              )}
            />
          </Field>
        </div>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isDisabled} size="md">
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Guardando...
            </span>
          ) : isEditing ? (
            "Guardar cambios"
          ) : (
            "Agregar sección"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={onCancel}
          disabled={isDisabled}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
