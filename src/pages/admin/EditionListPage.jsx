import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Plus, Pencil, Calendar, Users } from "lucide-react";
import { useEditions } from "@/hooks/useEditions";
import { useExperience } from "@/hooks/useExperiences";
import ExperienceDetailTabs from "@/components/admin/experiences/ExperienceDetailTabs";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";

const STATUS_MAP = {
  draft: { label: "Borrador", variant: "warm" },
  open: { label: "Abierta", variant: "success" },
  closed: { label: "Cerrada", variant: "warning" },
  completed: { label: "Completada", variant: "sage" },
  cancelled: { label: "Cancelada", variant: "danger" },
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TableSkeleton() {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-warm-gray/60 text-left text-charcoal-muted">
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Fechas</th>
            <th className="px-4 py-3 font-medium text-center">Capacidad</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-dark">
          {[1, 2, 3].map((i) => (
            <tr key={i}>
              {[1, 2, 3, 4, 5].map((j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 rounded bg-warm-gray animate-pulse" style={{ width: `${50 + j * 9}%` }} />
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
    <div className="md:hidden space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 animate-pulse space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 rounded bg-warm-gray" />
            <div className="h-5 w-16 rounded-full bg-warm-gray" />
          </div>
          <div className="flex gap-4">
            <div className="h-3 w-28 rounded bg-warm-gray" />
            <div className="h-3 w-12 rounded bg-warm-gray" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ experienceId }) {
  return (
    <Card className="p-10 text-center">
      <Calendar className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-charcoal mb-1">
        Sin ediciones
      </h2>
      <p className="text-sm text-charcoal-muted mb-4">
        Crea la primera edición para esta experiencia.
      </p>
      <Link to={`/admin/experiences/${experienceId}/editions/new`}>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Crear primera edición
        </Button>
      </Link>
    </Card>
  );
}

export default function EditionListPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: experience, loading: expLoading } = useExperience(id);
  const { data: editions, loading, error } = useEditions(id);

  const isLoading = loading || expLoading;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">Ediciones</h1>
          {experience && (
            <p className="text-sm text-charcoal-subtle mt-0.5 truncate">
              {experience.publicName}
            </p>
          )}
        </div>
        <Link to={`/admin/experiences/${id}/editions/new`}>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nueva edición</span>
          </Button>
        </Link>
      </div>

      <ExperienceDetailTabs />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && editions.length === 0 && <EmptyState experienceId={id} />}

      {/* Loading skeleton */}
      {isLoading && (
        <>
          <TableSkeleton />
          <CardSkeleton />
        </>
      )}

      {/* Desktop table */}
      {!isLoading && editions.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-warm-gray/60 text-left text-charcoal-muted">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Fechas</th>
                <th className="px-4 py-3 font-medium text-center">Capacidad</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-dark">
              {editions.map((ed) => {
                const st = STATUS_MAP[ed.status] || STATUS_MAP.draft;
                return (
                  <tr
                    key={ed.$id}
                    className="hover:bg-warm-gray/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-charcoal">
                      {ed.name}
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted whitespace-nowrap">
                      {formatDate(ed.startDate)} — {formatDate(ed.endDate)}
                    </td>
                    <td className="px-4 py-3 text-center text-charcoal-muted">
                      {ed.capacity ?? "∞"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          navigate(
                            `/admin/experiences/${id}/editions/${ed.$id}/edit`,
                          )
                        }
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                        aria-label="Editar edición"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {!isLoading && editions.length > 0 && (
        <div className="md:hidden space-y-3">
          {editions.map((ed) => {
            const st = STATUS_MAP[ed.status] || STATUS_MAP.draft;
            return (
              <Card
                key={ed.$id}
                className="p-4 space-y-2 cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() =>
                  navigate(`/admin/experiences/${id}/editions/${ed.$id}/edit`)
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-charcoal truncate">
                    {ed.name}
                  </span>
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-charcoal-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDate(ed.startDate)} — {formatDate(ed.endDate)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    {ed.capacity ?? "∞"}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
