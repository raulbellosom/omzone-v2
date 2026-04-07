import { Calendar, Clock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "long", day: "numeric", year: "numeric",
  });
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function SlotCard({ slot }) {
  const available = slot.capacity - slot.bookedCount;
  const isFull = available <= 0;
  const isAlmostFull = !isFull && available <= 3;

  return (
    <div className={cn(
      "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4",
      "rounded-xl border p-4 md:p-5 bg-white transition-colors",
      isFull ? "border-warm-gray-dark/20 opacity-60" : "border-warm-gray-dark/30 hover:border-sage/40"
    )}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 min-w-0">
        <div className="flex items-center gap-2 text-charcoal">
          <Calendar className="h-4 w-4 text-sage flex-shrink-0" />
          <span className="text-sm font-medium">{formatDate(slot.startDatetime)}</span>
        </div>
        <div className="flex items-center gap-2 text-charcoal-muted">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span className="text-sm">
            {formatTime(slot.startDatetime)}
            {slot.endDatetime && ` – ${formatTime(slot.endDatetime)}`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Users className="h-4 w-4 text-charcoal-subtle" />
          {isFull ? (
            <span className="text-xs font-medium text-red-500">Full</span>
          ) : (
            <span className={cn(
              "text-xs font-medium",
              isAlmostFull ? "text-amber-600" : "text-emerald-600"
            )}>
              {available} {available === 1 ? "spot" : "spots"} left
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgendaSection({ slots }) {
  if (!slots || slots.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-cream/50">
      <div className="container-shell">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-2">Available Dates</h2>
        <p className="text-charcoal-muted mb-8">Select your preferred date to continue with your booking.</p>

        <div className="space-y-3 max-w-3xl">
          {slots.map((slot) => (
            <SlotCard key={slot.$id} slot={slot} />
          ))}
        </div>
      </div>
    </section>
  );
}
