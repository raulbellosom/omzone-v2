import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import SortableList from "@/components/common/SortableList";
import SortableItem from "@/components/common/SortableItem";
import ItemTypeBadge from "@/components/admin/packages/ItemTypeBadge";
import PackageItemForm from "@/components/admin/packages/PackageItemForm";

export default function PackageItemsEditor({
  items = [],
  onChange,
  disabled,
}) {
  const [showForm, setShowForm] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  function handleAdd(payload) {
    const newItem = {
      ...payload,
      _tempId: Date.now(),
      sortOrder: payload.sortOrder ?? items.length,
    };
    onChange([...items, newItem]);
    setShowForm(false);
  }

  function handleEdit(payload) {
    const updated = items.map((item, i) =>
      i === editIndex ? { ...item, ...payload } : item,
    );
    onChange(updated);
    setEditIndex(null);
  }

  function handleDelete(index) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-sm text-charcoal-subtle italic py-3">
          Aún no hay elementos en este paquete. Agrega experiencias, addons,
          beneficios, hospedaje o alimentación.
        </p>
      )}

      {items.length > 0 && (
        <SortableList
          items={items}
          getId={(item) => item.$id || item._tempId}
          onReorder={onChange}
          disabled={disabled}
          className="space-y-3"
        >
          {items.map((item, index) => (
            <SortableItem
              key={item.$id || item._tempId || index}
              id={item.$id || item._tempId}
              disabled={disabled}
            >
              {({ listeners, attributes, setNodeRef, style, isDragging }) => (
                <div ref={setNodeRef} style={style} {...attributes}>
                  <Card
                    className={`p-3 flex items-start gap-3 ${isDragging ? "shadow-lg ring-2 ring-sage/30" : ""}`}
                  >
                    <button
                      type="button"
                      className="touch-none shrink-0 cursor-grab active:cursor-grabbing p-0.5 text-charcoal-muted hover:text-charcoal disabled:cursor-not-allowed disabled:opacity-30"
                      disabled={disabled}
                      aria-label="Arrastrar para reordenar"
                      {...listeners}
                    >
                      <GripVertical className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <ItemTypeBadge type={item.itemType} />
                        {item.quantity && item.quantity > 1 && (
                          <span className="text-xs text-charcoal-muted">
                            ×{item.quantity}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-charcoal line-clamp-2">
                        {item.description}
                      </p>
                      {item.descriptionEs && (
                        <p className="text-xs text-charcoal-subtle mt-0.5 line-clamp-1">
                          {item.descriptionEs}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setEditIndex(index)}
                        disabled={disabled}
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        disabled={disabled}
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </Card>
                </div>
              )}
            </SortableItem>
          ))}
        </SortableList>
      )}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setShowForm(true)}
        disabled={disabled}
      >
        <Plus className="h-4 w-4" />
        Agregar elemento
      </Button>

      {showForm && (
        <PackageItemForm
          onSubmit={handleAdd}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editIndex !== null && (
        <PackageItemForm
          initialData={items[editIndex]}
          onSubmit={handleEdit}
          onCancel={() => setEditIndex(null)}
        />
      )}
    </div>
  );
}
