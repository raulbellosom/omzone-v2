import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
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

function initItems(valueEn, valueEs, metadataValue) {
  const en = parseJsonSafe(valueEn);
  const es = parseJsonSafe(valueEs);
  const enArr = Array.isArray(en) ? en : [];
  const esArr = Array.isArray(es) ? es : [];
  const len = Math.max(enArr.length, esArr.length);
  if (len > 0) {
    return Array.from({ length: len }, (_, i) => ({
      id: crypto.randomUUID(),
      quote_en: enArr[i] ? (enArr[i].quote || enArr[i].text || "") : "",
      quote_es: esArr[i] ? (esArr[i].quote || esArr[i].text || "") : "",
      // Author is shared — prefer EN entry, fall back to ES
      author:
        (enArr[i]?.author || enArr[i]?.name) ||
        (esArr[i]?.author || esArr[i]?.name) ||
        "",
    }));
  }
  // Legacy fallback: migrate from metadata.testimonials (old format)
  const legacyTestimonials = parseJsonSafe(metadataValue, {})?.testimonials;
  if (Array.isArray(legacyTestimonials) && legacyTestimonials.length > 0) {
    return legacyTestimonials.map((testimonial) => ({
      id: crypto.randomUUID(),
      quote_en: testimonial.quote || testimonial.text || "",
      quote_es: testimonial.quote || testimonial.text || "",
      author: testimonial.author || testimonial.name || "",
    }));
  }
  return [];
}

function serialize(items, lang) {
  if (!items.length) return "";
  const arr = items.map((item) => ({
    quote: lang === "en" ? item.quote_en : item.quote_es,
    author: item.author,
  }));
  return JSON.stringify(arr);
}

const inputCls =
  "w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 disabled:opacity-50 disabled:bg-warm-gray resize-none";

export default function TestimonialsBuilder({
  valueEn,
  valueEs,
  onChangeEn,
  onChangeEs,
  metadataValue,
  disabled,
}) {
  const { t } = useLanguage();
  const [items, setItems] = useState(() => initItems(valueEn, valueEs, metadataValue));

  function applyUpdate(next) {
    setItems(next);
    onChangeEn(serialize(next, "en"));
    onChangeEs(serialize(next, "es"));
  }

  function addItem() {
    applyUpdate([
      ...items,
      { id: crypto.randomUUID(), quote_en: "", quote_es: "", author: "" },
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
                      aria-label={t("admin.sectionBuilders.moveAriaLabel")}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-semibold text-charcoal-subtle uppercase tracking-wide flex-1">
                      {t("admin.sectionBuilders.testimonials.itemLabel")} {idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={disabled}
                      className="text-charcoal-subtle hover:text-red-500 transition-colors disabled:opacity-50"
                      aria-label={t("admin.sectionBuilders.deleteAriaLabel")}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Fields */}
                  <div className="p-3 space-y-3">
                    {/* Quotes — EN / ES side by side */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-sage uppercase tracking-wider">
                          {t("admin.sectionBuilders.testimonials.quoteEN")}
                        </span>
                        <textarea
                          value={item.quote_en}
                          onChange={(e) =>
                            updateField(item.id, "quote_en", e.target.value)
                          }
                          placeholder={t("admin.sectionBuilders.testimonials.placeholderQuoteEN")}
                          disabled={disabled}
                          rows={3}
                          className={inputCls}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider">
                          {t("admin.sectionBuilders.testimonials.quoteES")}
                        </span>
                        <textarea
                          value={item.quote_es}
                          onChange={(e) =>
                            updateField(item.id, "quote_es", e.target.value)
                          }
                          placeholder={t("admin.sectionBuilders.testimonials.placeholderQuoteES")}
                          disabled={disabled}
                          rows={3}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {/* Author — shared */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-medium text-charcoal-subtle uppercase tracking-wider">
                        {t("admin.sectionBuilders.testimonials.author")}
                      </span>
                      <input
                        type="text"
                        value={item.author}
                        onChange={(e) =>
                          updateField(item.id, "author", e.target.value)
                        }
                        placeholder={t("admin.sectionBuilders.testimonials.placeholderAuthor")}
                        disabled={disabled}
                        className="w-full rounded-lg border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal placeholder:text-charcoal-subtle focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20 disabled:opacity-50 disabled:bg-warm-gray"
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
          {t("admin.sectionBuilders.testimonials.empty")}
        </p>
      )}

      <button
        type="button"
        onClick={addItem}
        disabled={disabled}
        className="flex items-center gap-2 w-full justify-center py-2.5 border border-dashed border-sage/50 rounded-xl text-sm text-sage hover:bg-sage/5 hover:border-sage transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-4 w-4" />
        {t("admin.sectionBuilders.testimonials.add")}
      </button>
    </div>
  );
}
