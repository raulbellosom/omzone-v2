import { Calendar, Clock, MapPin } from "lucide-react";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ConsumptionHistory({ consumptions = [], loading }) {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-xl bg-warm-gray/30"
          />
        ))}
      </div>
    );
  }

  if (consumptions.length === 0) {
    return (
      <p className="text-sm text-charcoal-muted text-center py-4">
        Aún no se ha usado ningún crédito.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-warm-gray-dark/10">
      {consumptions.map((c) => (
        <li key={c.$id} className="py-3 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <p className="text-sm font-medium text-charcoal truncate">
              {c.notes || "Consumo"}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-muted">
              {c.consumedAt && (
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(c.consumedAt)}
                </span>
              )}
              {c.consumedAt && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(c.consumedAt)}
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 text-xs font-medium text-charcoal-muted bg-warm-gray/20 rounded-full px-2 py-0.5">
            -{c.creditsUsed} crédito{c.creditsUsed !== 1 ? "s" : ""}
          </span>
        </li>
      ))}
    </ul>
  );
}
