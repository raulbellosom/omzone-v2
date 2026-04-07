import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortableItem({ id, disabled, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: String(id), disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 10 : undefined,
  };

  if (typeof children === "function") {
    return children({
      listeners,
      attributes,
      setNodeRef,
      style,
      isDragging,
    });
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children}
    </div>
  );
}
