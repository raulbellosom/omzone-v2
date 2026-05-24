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

function initItems(valueEn, valueEs) {
  const en = parseJsonSafe(valueEn);
  const es = parseJsonSafe(valueEs);
  const len = Math.max(
    Array.isArray(en) ? en.length : 0,
    Array.isArray(es) ? es.length : 0,
  );
  if (len === 0) return [];
  return Array.from({ length: len }, (_, i) => ({
    id: crypto.randomUUID(),
    q_en: (Array.isArray(en) && en[i]) ? (en[i].question || en[i].q || "") : "",
    a_en: (Array.isArray(en) && en[i]) ? (en[i].answer || en[i].a || "") : "",
    q_es: (Array.isArray(es) && es[i]) ? (es[i].question || es[i].q || "") : "",
    a_es: (Array.isArray(es) && es[i]) ? (es[i].answer || es[i].a || "") : "",
  }));
}

function serialize(items, lang) {
  if (!items.length) return "";
  const arr = items.map((item) =>
    lang === "en"
      ? { question: item.q_en, answer: item.a_en }
      : { question: item.q_es, answer: item.a_es },
  );
  return JSON.stringify(arr);
}

const inputCls =
  "w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 disabled:opacity-50 disabled:bg-warm-gray resize-none";

export default function FaqBuilder({
  valueEn,
  valueEs,
  onChangeEn,
  onChangeEs,
  disabled,
}) {
  const [items, setItems] = useState(() => initItems(valueEn, valueEs));

  function applyUpdate(next) {
    setItems(next);
    onChangeEn(serialize(next, "en"));
    onChangeEs(serialize(next, "es"));
  }

  function addItem() {
    applyUpdate([
      ...items,
      { id: crypto.randomUUID(), q_en: "", a_en: "", q_es: "", a_es: "" },
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
                      Pregunta {idx + 1}
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

                  {/* Fields — EN / ES side by side */}
                  <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* EN */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-sage uppercase tracking-wider">
                        EN
                      </span>
                      <textarea
                        value={item.q_en}
                        onChange={(e) =>
                          updateField(item.id, "q_en", e.target.value)
                        }
                        placeholder="Question…"
                        disabled={disabled}
                        rows={2}
                        className={inputCls}
                      />
                      <textarea
                        value={item.a_en}
                        onChange={(e) =>
                          updateField(item.id, "a_en", e.target.value)
                        }
                        placeholder="Answer…"
                        disabled={disabled}
                        rows={3}
                        className={inputCls}
                      />
                    </div>
                    {/* ES */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">
                        ES
                      </span>
                      <textarea
                        value={item.q_es}
                        onChange={(e) =>
                          updateField(item.id, "q_es", e.target.value)
                        }
                        placeholder="Pregunta…"
                        disabled={disabled}
                        rows={2}
                        className={inputCls}
                      />
                      <textarea
                        value={item.a_es}
                        onChange={(e) =>
                          updateField(item.id, "a_es", e.target.value)
                        }
                        placeholder="Respuesta…"
                        disabled={disabled}
                        rows={3}
                        className={inputCls}
                      />
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
          No hay preguntas. Agrega la primera.
        </p>
      )}

      <button
        type="button"
        onClick={addItem}
        disabled={disabled}
        className="flex items-center gap-2 w-full justify-center py-2.5 border border-dashed border-sage/50 rounded-xl text-sm text-sage hover:bg-sage/5 hover:border-sage transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
        Agregar pregunta
      </button>
    </div>
  );
}
