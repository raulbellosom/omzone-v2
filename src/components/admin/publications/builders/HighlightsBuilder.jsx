import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import SortableList from "@/components/common/SortableList";
import SortableItem from "@/components/common/SortableItem";

function parseJsonSafe(str, fallback = []) {
  if (!str) return fallback;
  try {
    return JSON.parse(str) ?? fallback;
  } catch {
    return fallback;
  }
}

function initItems(value) {
  const arr = parseJsonSafe(value);
  if (!Array.isArray(arr) || arr.length === 0) return [];
  return arr.map((item) => ({
    id: crypto.randomUUID(),
    title_en:
      typeof item === "string"
        ? item
        : item.title_en || item.text || item.label || "",
    title_es: typeof item === "string" ? "" : item.title_es || "",
    desc_en:
      typeof item === "string"
        ? ""
        : item.description_en || item.description || "",
    desc_es: typeof item === "string" ? "" : item.description_es || "",
  }));
}

function serialize(items) {
  if (!items.length) return "";
  return JSON.stringify(
    items.map(({ title_en, title_es, desc_en, desc_es }) => ({
      title_en,
      title_es,
      description_en: desc_en,
      description_es: desc_es,
    })),
  );
}

const textareaCls =
  "w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 disabled:opacity-50 disabled:bg-warm-gray resize-none";

const inputCls =
  "w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 disabled:opacity-50 disabled:bg-warm-gray";

export default function HighlightsBuilder({ value, onChange, disabled }) {
  const [items, setItems] = useState(() => initItems(value));

  function applyUpdate(next) {
    setItems(next);
    onChange(serialize(next));
  }

  function addItem() {
    applyUpdate([
      ...items,
      {
        id: crypto.randomUUID(),
        title_en: "",
        title_es: "",
        desc_en: "",
        desc_es: "",
      },
    ]);
  }

  function removeItem(id) {
    applyUpdate(items.filter((i) => i.id !== id));
  }

  function updateField(id, field, value) {
    applyUpdate(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  }

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <SortableList
          items={items}
          onReorder={applyUpdate}
          getId={(item) => item.id}
          disabled={disabled}
          className="space-y-3"
        >
          {items.map((item, idx) => (
            <SortableItem key={item.id} id={item.id} disabled={disabled}>
              {({ listeners, attributes, setNodeRef, style, isDragging }) => (
                <div
                  ref={setNodeRef}
                  style={style}
                  className={cn(
                    "border border-sand-dark rounded-xl bg-white overflow-hidden transition-shadow",
                    isDragging && "shadow-lg opacity-75",
                  )}
                >
                  {/* Row header */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-warm-gray border-b border-sand-dark">
                    <button
                      type="button"
                      {...listeners}
                      {...attributes}
                      disabled={disabled}
                      className="text-charcoal-subtle hover:text-charcoal cursor-grab active:cursor-grabbing disabled:opacity-50 disabled:cursor-default touch-none"
                      aria-label="Mover"
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wide flex-1">
                      Highlight {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={disabled}
                      className="text-charcoal-subtle hover:text-red-500 transition-colors disabled:opacity-50"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Fields */}
                  <div className="p-3 space-y-3">
                    {/* Titles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-sage uppercase tracking-wider">
                          Título EN
                        </span>
                        <input
                          type="text"
                          value={item.title_en}
                          onChange={(e) =>
                            updateField(item.id, "title_en", e.target.value)
                          }
                          placeholder="Title…"
                          disabled={disabled}
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">
                          Título ES
                        </span>
                        <input
                          type="text"
                          value={item.title_es}
                          onChange={(e) =>
                            updateField(item.id, "title_es", e.target.value)
                          }
                          placeholder="Título…"
                          disabled={disabled}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Descriptions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-sage uppercase tracking-wider">
                          Descripción EN
                        </span>
                        <textarea
                          value={item.desc_en}
                          onChange={(e) =>
                            updateField(item.id, "desc_en", e.target.value)
                          }
                          placeholder="Description…"
                          disabled={disabled}
                          rows={2}
                          className={textareaCls}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">
                          Descripción ES
                        </span>
                        <textarea
                          value={item.desc_es}
                          onChange={(e) =>
                            updateField(item.id, "desc_es", e.target.value)
                          }
                          placeholder="Descripción…"
                          disabled={disabled}
                          rows={2}
                          className={textareaCls}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </SortableItem>
          ))}
        </SortableList>
      )}

      {items.length === 0 && (
        <p className="text-sm text-charcoal-subtle text-center py-4">
          No hay highlights. Agrega el primero.
        </p>
      )}

      <button
        type="button"
        onClick={addItem}
        disabled={disabled}
        className="flex items-center gap-2 w-full justify-center py-2.5 border border-dashed border-sage/50 rounded-xl text-sm text-sage hover:bg-sage/5 hover:border-sage transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
        Agregar highlight
      </button>
    </div>
  );
}
