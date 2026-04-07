import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Plus,
  Pencil,
  XCircle,
  CalendarDays,
  List,
  CalendarPlus,
} from "lucide-react";
import { useSlots, cancelSlot } from "@/hooks/useSlots";
import { useExperience } from "@/hooks/useExperiences";
import { useLocations } from "@/hooks/useLocations";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import SlotCalendarView from "@/components/admin/slots/SlotCalendarView";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicados" },
  { value: "full", label: "Llenos" },
  { value: "cancelled", label: "Cancelados" },
];

const STATUS_LABELS = {
  draft: { text: "Borrador", variant: "warm" },
  published: { text: "Publicado", variant: "success" },
  full: { text: "Lleno", variant: "destructive" },
  cancelled: { text: "Cancelado", variant: "default" },
};

function formatDatetime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TableSkeleton() {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-warm-gray/60 text-left text-charcoal-muted">
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Horario</th>
            <th className="px-4 py-3 font-medium">Capacidad</th>
            <th className="px-4 py-3 font-medium">Locación</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-dark">
          {[1, 2, 3, 4].map((i) => (
            <tr key={i}>
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <td key={j} className="px-4 py-3">
                  <div
                    className="h-4 rounded bg-warm-gray animate-pulse"
                    style={{ width: `${45 + j * 8}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="md:hidden space-y-2">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 animate-pulse space-y-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="h-4 w-36 rounded bg-warm-gray" />
              <div className="h-3 w-44 rounded bg-warm-gray" />
            </div>
            <div className="h-5 w-16 rounded-full bg-warm-gray" />
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <div className="h-8 w-16 rounded-lg bg-warm-gray" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ experienceId }) {
  return (
    <Card className="p-10 text-center">
      <CalendarDays className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-charcoal mb-1">Sin slots</h2>
      <p className="text-sm text-charcoal-muted mb-4">
        Crea el primer slot de agenda para esta experiencia.
      </p>
      <Link to={`/admin/experiences/${experienceId}/slots/create`}>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Crear primer slot
        </Button>
      </Link>
    </Card>
  );
}

export default function SlotListPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: experience } = useExperience(id);
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [view, setView] = useState("table"); // table | calendar
  const [cancelling, setCancelling] = useState(null);

  const {
    data: slots,
    loading,
    error,
    refetch,
  } = useSlots(id, {
    status: statusFilter,
    dateFrom: dateFrom ? new Date(dateFrom).toISOString() : "",
    dateTo: dateTo ? new Date(dateTo + "T23:59:59").toISOString() : "",
  });

  const { data: locations } = useLocations();
  const locationMap = Object.fromEntries(locations.map((l) => [l.$id, l.name]));

  async function handleCancel(slot) {
    const hasBookings = slot.bookedCount > 0;
    const msg = hasBookings
      ? `Este slot tiene ${slot.bookedCount} reserva(s) activa(s). ¿Estás seguro de que deseas cancelarlo?`
      : "¿Cancelar este slot?";
    if (!window.confirm(msg)) return;

    setCancelling(slot.$id);
    try {
      await cancelSlot(slot.$id);
      refetch();
    } catch {
      // silent
    } finally {
      setCancelling(null);
    }
  }

  const experienceNames = experience ? { [id]: experience.publicName } : {};

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">
            Agenda / Slots
          </h1>
          {experience && (
            <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
              {experience.publicName}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Link to={`/admin/experiences/${id}/slots/quick-create`}>
            <Button variant="outline" size="sm">
              <CalendarPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Recurrentes</span>
            </Button>
          </Link>
          <Link to={`/admin/experiences/${id}/slots/create`}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo slot</span>
            </Button>
          </Link>
        </div>
      </div>

      <ExperienceDetailTabs />

      {/* Filters + View toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <AdminSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS}
          fullWidth={false}
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-11 rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
          placeholder="Desde"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-11 rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
          placeholder="Hasta"
        />
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => setView("table")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              view === "table"
                ? "bg-sage/20 text-sage"
                : "text-charcoal-muted hover:bg-warm-gray",
            )}
            aria-label="Vista tabla"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "p-2 rounded-lg transition-colors",
              view === "calendar"
                ? "bg-sage/20 text-sage"
                : "text-charcoal-muted hover:bg-warm-gray",
            )}
            aria-label="Vista calendario"
          >
            <CalendarDays className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <>
          <TableSkeleton />
          <CardSkeleton />
        </>
      )}

      {!loading && !error && slots.length === 0 && (
        <EmptyState experienceId={id} />
      )}

      {/* Calendar view */}
      {!loading && view === "calendar" && slots.length > 0 && (
        <SlotCalendarView
          slots={slots}
          experienceId={id}
          experienceNames={experienceNames}
        />
      )}

      {/* Table view — desktop */}
      {!loading && view === "table" && slots.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-warm-gray/60 text-left text-charcoal-muted">
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Horario</th>
                  <th className="px-4 py-3 font-medium">Capacidad</th>
                  <th className="px-4 py-3 font-medium">Locación</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark">
                {slots.map((slot) => {
                  const st = STATUS_LABELS[slot.status] || STATUS_LABELS.draft;
                  return (
                    <tr
                      key={slot.$id}
                      className="hover:bg-warm-gray/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-charcoal whitespace-nowrap">
                        {new Date(slot.startDatetime).toLocaleDateString(
                          "es-MX",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td className="px-4 py-3 text-charcoal-muted whitespace-nowrap">
                        {formatTime(slot.startDatetime)} –{" "}
                        {formatTime(slot.endDatetime)}
                      </td>
                      <td className="px-4 py-3 text-charcoal-muted">
                        {slot.bookedCount}/{slot.capacity}
                      </td>
                      <td className="px-4 py-3 text-charcoal-muted">
                        {locationMap[slot.locationId] || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={st.variant}>{st.text}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <button
                          onClick={() =>
                            navigate(
                              `/admin/experiences/${id}/slots/${slot.$id}/edit`,
                            )
                          }
                          className="p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                          aria-label="Editar slot"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {slot.status !== "cancelled" && (
                          <button
                            onClick={() => handleCancel(slot)}
                            disabled={cancelling === slot.$id}
                            className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                            aria-label="Cancelar slot"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-2">
            {slots.map((slot) => {
              const st = STATUS_LABELS[slot.status] || STATUS_LABELS.draft;
              return (
                <Card key={slot.$id} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-charcoal">
                        {formatDatetime(slot.startDatetime)}
                      </p>
                      <p className="text-xs text-charcoal-muted mt-0.5">
                        {formatTime(slot.startDatetime)} –{" "}
                        {formatTime(slot.endDatetime)}
                        {" · "}
                        {slot.bookedCount}/{slot.capacity} reservados
                      </p>
                      {locationMap[slot.locationId] && (
                        <p className="text-xs text-charcoal-subtle mt-0.5">
                          {locationMap[slot.locationId]}
                        </p>
                      )}
                    </div>
                    <Badge variant={st.variant} className="shrink-0">
                      {st.text}
                    </Badge>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigate(
                          `/admin/experiences/${id}/slots/${slot.$id}/edit`,
                        )
                      }
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </Button>
                    {slot.status !== "cancelled" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancel(slot)}
                        disabled={cancelling === slot.$id}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Cancelar
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
