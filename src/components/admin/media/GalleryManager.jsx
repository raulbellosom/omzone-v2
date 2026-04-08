import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, X, ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import ImagePreview from "@/components/common/ImagePreview";
import MediaPicker from "./MediaPicker";
import { useLanguage } from "@/hooks/useLanguage";
import env from "@/config/env";
import { cn } from "@/lib/utils";

// ─── Sortable thumbnail item ──────────────────────────────────────────────────

function SortableItem({
  fileId,
  bucketId,
  index,
  total,
  onRemove,
  onMoveLeft,
  onMoveRight,
  disabled,
  t,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fileId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative aspect-square rounded-xl overflow-hidden border border-sand-dark/30 bg-warm-gray",
        isDragging && "opacity-50 shadow-xl ring-2 ring-sage/40",
      )}
    >
      <ImagePreview
        fileId={fileId}
        bucketId={bucketId}
        width={300}
        height={300}
        className="w-full h-full"
        fit="cover"
      />

      {/* Overlay on hover */}
      {!disabled && (
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
      )}

      {/* Drag handle (desktop) */}
      {!disabled && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute top-1 left-1 p-1 rounded-lg bg-white/80 text-charcoal opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
          aria-label={t("admin.gallery.dragToReorder")}
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Remove button */}
      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(fileId)}
          className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-charcoal hover:bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={t("admin.gallery.removeImage")}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* Mobile reorder arrows (always visible on touch) */}
      {!disabled && (
        <div className="absolute bottom-1 inset-x-0 flex justify-center gap-1 sm:hidden">
          <button
            type="button"
            onClick={() => onMoveLeft(index)}
            disabled={index === 0}
            className="p-1 rounded-lg bg-white/80 text-charcoal disabled:opacity-30 shadow-sm"
            aria-label={t("admin.gallery.moveLeft")}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onMoveRight(index)}
            disabled={index === total - 1}
            className="p-1 rounded-lg bg-white/80 text-charcoal disabled:opacity-30 shadow-sm"
            aria-label={t("admin.gallery.moveRight")}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Index badge */}
      <div className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] font-bold flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        {index + 1}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * GalleryManager — manage an ordered list of fileIds from Appwrite Storage.
 *
 * Props:
 *  - value      {string[]}   Array of fileIds (JSON-serializable)
 *  - onChange   {fn}         Called with new string[] when order/list changes
 *  - bucketId   {string}     Appwrite bucket (default: experience_media)
 *  - isAdmin    {boolean}    Show upload tab in MediaPicker
 *  - disabled   {boolean}
 *  - maxItems   {number}     Max number of images (default unlimited)
 */
export default function GalleryManager({
  value = [],
  onChange,
  bucketId = env.bucketExperienceMedia,
  isAdmin = false,
  disabled = false,
  maxItems,
}) {
  const { t } = useLanguage();
  const [pickerOpen, setPickerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return;
    const oldIndex = value.indexOf(active.id);
    const newIndex = value.indexOf(over.id);
    onChange?.(arrayMove(value, oldIndex, newIndex));
  }

  function handleRemove(fileId) {
    onChange?.(value.filter((id) => id !== fileId));
  }

  function handleMoveLeft(index) {
    if (index === 0) return;
    onChange?.(arrayMove(value, index, index - 1));
  }

  function handleMoveRight(index) {
    if (index === value.length - 1) return;
    onChange?.(arrayMove(value, index, index + 1));
  }

  function handlePickerSelect(fileIds) {
    const newIds = fileIds.filter((id) => !value.includes(id));
    let next = [...value, ...newIds];
    if (maxItems) next = next.slice(0, maxItems);
    onChange?.(next);
  }

  const canAdd = !disabled && (!maxItems || value.length < maxItems);

  return (
    <div className="space-y-2">
      {/* Grid */}
      {value.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={value} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {value.map((fileId, index) => (
                <SortableItem
                  key={fileId}
                  fileId={fileId}
                  bucketId={bucketId}
                  index={index}
                  total={value.length}
                  onRemove={handleRemove}
                  onMoveLeft={handleMoveLeft}
                  onMoveRight={handleMoveRight}
                  disabled={disabled}
                  t={t}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add button */}
      {canAdd && (
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className={cn(
            "flex items-center gap-2 rounded-xl border-2 border-dashed border-sand-dark/60 px-4 py-3 text-sm text-charcoal-muted",
            "hover:border-sage hover:text-sage hover:bg-sage/5 transition-colors w-full justify-center",
            "focus:outline-none focus:ring-2 focus:ring-sage/40",
          )}
        >
          <Plus className="h-4 w-4" />
          {t("admin.gallery.addImage")}
          {value.length > 0 ? ` ${t("admin.gallery.addMore")}` : ""}
          {maxItems && ` (${value.length}/${maxItems})`}
        </button>
      )}

      {value.length === 0 && disabled && (
        <p className="text-sm text-charcoal-muted text-center py-4">
          {t("admin.gallery.noImages")}
        </p>
      )}

      {/* MediaPicker modal */}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        bucketId={bucketId}
        multiple
        selected={value}
        onSelect={handlePickerSelect}
        isAdmin={isAdmin}
      />
    </div>
  );
}
