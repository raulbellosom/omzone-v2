import { useState } from "react";
import { GripVertical, Pencil, Star, DollarSign } from "lucide-react";
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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { cn } from "@/lib/utils";

const TYPE_LABELS = {
  fixed: "Fijo",
  "per-person": "Por persona",
  "per-group": "Por grupo",
  from: "Desde",
  quote: "Cotización",
};

function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-sage" : "bg-sand-dark",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  );
}

function formatPrice(amount, currency) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function SortableRow({ tier, onToggle, togglingId, onEdit, swapping }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tier.$id, disabled: swapping });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        "hover:bg-warm-gray/30 transition-colors",
        !tier.isActive && "opacity-50",
        isDragging && "bg-sage/5",
      )}
    >
      <td className="px-3 py-3 text-center">
        <button
          type="button"
          className="touch-none cursor-grab active:cursor-grabbing p-1 text-charcoal-muted hover:text-charcoal"
          aria-label="Arrastrar para reordenar"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-4 py-3 font-medium text-charcoal">
        <span className="flex items-center gap-1.5">
          {tier.isHighlighted && (
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
          )}
          {tier.name}
        </span>
      </td>
      <td className="px-4 py-3 text-charcoal-muted">
        {TYPE_LABELS[tier.priceType] || tier.priceType}
      </td>
      <td className="px-4 py-3 text-right font-medium text-charcoal">
        {formatPrice(tier.basePrice, tier.currency)}
      </td>
      <td className="px-4 py-3 text-center">
        {tier.badge ? (
          <Badge variant="sage">{tier.badge}</Badge>
        ) : (
          <span className="text-charcoal-muted">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <Toggle
          checked={tier.isActive}
          onChange={() => onToggle(tier)}
          disabled={togglingId === tier.$id}
        />
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onEdit(tier)}
          className="p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
          aria-label="Editar tier"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function SortableMobileCard({ tier, onToggle, togglingId, onEdit, swapping }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tier.$id, disabled: swapping });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <Card
        className={cn(
          "p-4 space-y-3",
          !tier.isActive && "opacity-50",
          isDragging && "shadow-lg ring-2 ring-sage/30",
        )}
      >
        <div className="flex items-start gap-2">
          <button
            type="button"
            className="touch-none shrink-0 cursor-grab active:cursor-grabbing p-1 -ml-1 mt-0.5 text-charcoal-muted hover:text-charcoal"
            aria-label="Arrastrar para reordenar"
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex-1 min-w-0">
            <span className="flex items-center gap-1.5 font-medium text-charcoal">
              {tier.isHighlighted && (
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              )}
              {tier.name}
            </span>
            <span className="text-xs text-charcoal-muted block mt-0.5">
              {TYPE_LABELS[tier.priceType] || tier.priceType}
            </span>
          </div>
          <span className="text-sm font-semibold text-charcoal whitespace-nowrap">
            {formatPrice(tier.basePrice, tier.currency)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Toggle
              checked={tier.isActive}
              onChange={() => onToggle(tier)}
              disabled={togglingId === tier.$id}
            />
            {tier.badge && <Badge variant="sage">{tier.badge}</Badge>}
          </div>
          <button
            onClick={() => onEdit(tier)}
            className="p-1.5 rounded text-charcoal-muted hover:text-sage transition-colors"
            aria-label="Editar tier"
          >
            <Pencil className="h-4 w-4" />
          </button>
        </div>
      </Card>
    </div>
  );
}

export default function PricingTierTable({
  tiers,
  onToggleActive,
  onReorder,
  onEdit,
  swapping,
}) {
  const [togglingId, setTogglingId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  async function handleToggle(tier) {
    setTogglingId(tier.$id);
    try {
      await onToggleActive(tier.$id, !tier.isActive);
    } finally {
      setTogglingId(null);
    }
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id || swapping) return;
    const oldIdx = tiers.findIndex((t) => t.$id === String(active.id));
    const newIdx = tiers.findIndex((t) => t.$id === String(over.id));
    if (oldIdx !== -1 && newIdx !== -1) {
      onReorder(arrayMove(tiers, oldIdx, newIdx));
    }
  }

  const ids = tiers.map((t) => t.$id);

  /* Desktop table */
  const desktopTable = (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={ids}
          strategy={verticalListSortingStrategy}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-warm-gray/60 text-left text-charcoal-muted">
                <th className="px-3 py-3 font-medium w-10" />
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium text-right">Precio</th>
                <th className="px-4 py-3 font-medium text-center">Badge</th>
                <th className="px-4 py-3 font-medium text-center">Activo</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-dark">
              {tiers.map((tier) => (
                <SortableRow
                  key={tier.$id}
                  tier={tier}
                  onToggle={handleToggle}
                  togglingId={togglingId}
                  onEdit={onEdit}
                  swapping={swapping}
                />
              ))}
            </tbody>
          </table>
        </SortableContext>
      </DndContext>
    </div>
  );

  /* Mobile cards */
  const mobileCards = (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={ids}
        strategy={verticalListSortingStrategy}
      >
        <div className="md:hidden space-y-3">
          {tiers.map((tier) => (
            <SortableMobileCard
              key={tier.$id}
              tier={tier}
              onToggle={handleToggle}
              togglingId={togglingId}
              onEdit={onEdit}
              swapping={swapping}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );

  return (
    <>
      {desktopTable}
      {mobileCards}
    </>
  );
}
