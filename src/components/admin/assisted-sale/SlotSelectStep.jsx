import { CheckCircle2, Clock, Users, AlertTriangle } from "lucide-react";
import { useSlots } from "@/hooks/useSlots";
import WizardStepWrapper from "./WizardStepWrapper";
import { cn } from "@/lib/utils";

function formatDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  }) + " " + d.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function SlotCard({ slot, selected, onSelect }) {
  const available = slot.capacity - slot.bookedCount;
  const isFull = available <= 0;
  const isLow = available > 0 && available <= 3;

  return (
    <button
      type="button"
      onClick={() => !isFull && onSelect()}
      disabled={isFull}
      className={cn(
        "w-full text-left rounded-xl border-2 px-4 py-3 transition-all",
        selected ? "border-sage bg-sage/5" :
        isFull ? "border-sand-dark/30 bg-warm-gray/40 opacity-60 cursor-not-allowed" :
        "border-sand-dark/40 hover:border-sage/50"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-charcoal">
            <Clock className="h-4 w-4 text-charcoal-subtle shrink-0" />
            <span className="truncate">{formatDateTime(slot.startDatetime)}</span>
          </div>
          <div className={cn(
            "flex items-center gap-1.5 mt-1 text-xs",
            isFull ? "text-red-500" : isLow ? "text-amber-600" : "text-charcoal-muted"
          )}>
            {isFull ? (
              <><AlertTriangle className="h-3.5 w-3.5" /> Cupo lleno</>
            ) : (
              <><Users className="h-3.5 w-3.5" /> {available} lugar{available !== 1 ? "es" : ""} disponible{available !== 1 ? "s" : ""}</>
            )}
          </div>
          {slot.notes && (
            <p className="text-xs text-charcoal-muted mt-1 line-clamp-1">{slot.notes}</p>
          )}
        </div>
        {selected && <CheckCircle2 className="h-5 w-5 text-sage shrink-0" />}
      </div>
    </button>
  );
}

export default function SlotSelectStep({ wizard, setWizardField }) {
  const now = new Date().toISOString();
  const { data: slots, loading } = useSlots(
    wizard.experience?.$id,
    { status: "published", dateFrom: now }
  );

  if (!wizard.experience?.requiresSchedule) {
    return (
      <WizardStepWrapper title="Slot" description="Esta experiencia no requiere selección de slot.">
        <p className="text-sm text-charcoal-muted">Continúa al siguiente paso.</p>
      </WizardStepWrapper>
    );
  }

  return (
    <WizardStepWrapper
      title="Slot / Fecha"
      description="Selecciona la fecha y hora para esta venta."
    >
      {loading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        </div>
      )}

      {!loading && slots.length === 0 && (
        <p className="text-sm text-charcoal-muted py-4">
          No hay slots disponibles para esta experiencia.
        </p>
      )}

      <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
        {slots.map((slot) => (
          <SlotCard
            key={slot.$id}
            slot={slot}
            selected={wizard.slot?.$id === slot.$id}
            onSelect={() => setWizardField("slot", slot)}
          />
        ))}
      </div>
    </WizardStepWrapper>
  );
}
