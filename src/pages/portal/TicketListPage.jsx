import { useState, useMemo } from "react";
import { useUserTickets } from "@/hooks/useUserTickets";
import TicketCard from "@/components/portal/tickets/TicketCard";
import { Ticket, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const STATUS_FILTERS = [
  { value: "", label: "Todos" },
  { value: "valid", label: "Activos" },
  { value: "used", label: "Usados" },
];

function parseSnapshot(ticket) {
  try {
    return typeof ticket.ticketSnapshot === "string"
      ? JSON.parse(ticket.ticketSnapshot)
      : ticket.ticketSnapshot || {};
  } catch {
    return {};
  }
}

function TicketSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-warm-gray-dark/10 p-4 space-y-3 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-32 rounded bg-warm-gray/40" />
        <div className="h-5 w-14 rounded-full bg-warm-gray/40" />
      </div>
      <div className="h-3 w-24 rounded bg-warm-gray/30" />
      <div className="h-24 w-24 mx-auto rounded bg-warm-gray/30" />
      <div className="h-3 w-28 mx-auto rounded bg-warm-gray/30" />
    </div>
  );
}

export default function TicketListPage() {
  const [status, setStatus] = useState("");
  const { data, loading, error } = useUserTickets({ status });

  // Sort: active first, then by upcoming slot date ASC, then by $createdAt DESC
  const sorted = useMemo(() => {
    if (!data || data.length === 0) return [];
    const now = new Date().toISOString();

    return [...data]
      .map((t) => ({ ...t, _snap: parseSnapshot(t) }))
      .sort((a, b) => {
        // Active tickets before inactive
        const aActive = a.status === "valid" ? 0 : 1;
        const bActive = b.status === "valid" ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive;

        // By slot date ASC (upcoming first)
        const aDate =
          a._snap.slotStartDatetime || a._snap.editionDate || "";
        const bDate =
          b._snap.slotStartDatetime || b._snap.editionDate || "";
        if (aDate && bDate) return aDate.localeCompare(bDate);
        if (aDate) return -1;
        if (bDate) return 1;

        // Fallback: newest first
        return (b.$createdAt || "").localeCompare(a.$createdAt || "");
      });
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-sage/10 flex items-center justify-center">
          <Ticket className="h-5 w-5 text-sage" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-charcoal">
            Mis Tickets
          </h1>
          <p className="text-sm text-charcoal-muted">
            Todos tus tickets de experiencias en un solo lugar
          </p>
        </div>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer whitespace-nowrap",
              status === f.value
                ? "bg-sage text-white"
                : "bg-white text-charcoal-muted border border-warm-gray-dark/20 hover:border-sage/40",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <TicketSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && sorted.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sage/10 text-sage flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <p className="text-charcoal-muted">
            {status
              ? "No hay tickets con este filtro"
              : "Aún no tienes tickets"}
          </p>
          {!status && (
            <Link
              to="/experiencias"
              className="inline-flex items-center gap-2 text-sm text-sage font-semibold hover:underline"
            >
              Explorar experiencias
            </Link>
          )}
        </div>
      )}

      {/* Ticket grid */}
      {!loading && sorted.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((ticket) => (
            <TicketCard key={ticket.$id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}
