import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

export { arrayMove };

export default function SortableList({
  items,
  onReorder,
  getId,
  disabled,
  children,
  className,
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const getItemId = getId || ((item) => item.$id || item.id);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id || disabled) return;
    const oldIndex = items.findIndex(
      (item) => String(getItemId(item)) === String(active.id),
    );
    const newIndex = items.findIndex(
      (item) => String(getItemId(item)) === String(over.id),
    );
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => String(getItemId(item)))}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>{children}</div>
      </SortableContext>
    </DndContext>
  );
}
