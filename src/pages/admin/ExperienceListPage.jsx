import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, X, Sparkles } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Card } from "@/components/common/Card";
import ExperienceTable from "@/components/admin/experiences/ExperienceTable";
import ExperienceCard from "@/components/admin/experiences/ExperienceCard";
import { useExperiences, updateExperience } from "@/hooks/useExperiences";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants/routes";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";

const TYPE_OPTIONS = [
  { value: "", label: "Todos los tipos" },
  { value: "session", label: "Sesión" },
  { value: "immersion", label: "Inmersión" },
  { value: "retreat", label: "Retiro" },
  { value: "stay", label: "Estancia" },
  { value: "private", label: "Privada" },
  { value: "package", label: "Paquete" },
];

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicada" },
  { value: "archived", label: "Archivada" },
];

const PAGE_SIZE = 25;

export default function ExperienceListPage() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [actionError, setActionError] = useState(null);

  const offset = page * PAGE_SIZE;
  const { data, total, loading, error, refetch } = useExperiences({
    search,
    type,
    status,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function handleSearchChange(value) {
    setSearch(value);
    setPage(0);
  }

  function handleTypeChange(value) {
    setType(value);
    setPage(0);
  }

  function handleStatusChange(value) {
    setStatus(value);
    setPage(0);
  }

  const handleStatusUpdate = useCallback(
    async (id, newStatus) => {
      setActionError(null);
      try {
        await updateExperience(id, { status: newStatus });
        refetch();
      } catch (err) {
        setActionError(err.message);
      }
    },
    [refetch],
  );

  const hasFilters = search || type || status;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">Experiencias</h1>
          {!loading && (
            <p className="text-sm text-charcoal-subtle mt-0.5">
              {total} {total === 1 ? "experiencia" : "experiencias"}
            </p>
          )}
        </div>
        {isAdmin && (
          <Button
            type="button"
            size="md"
            onClick={() => navigate(ROUTES.ADMIN_EXPERIENCE_NEW)}
          >
            <Plus className="h-4 w-4" />
            Nueva experiencia
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-subtle pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-9 h-10"
          />
        </div>
        <AdminSelect
          value={type}
          onChange={handleTypeChange}
          options={TYPE_OPTIONS}
          fullWidth={false}
        />
        <AdminSelect
          value={status}
          onChange={handleStatusChange}
          options={STATUS_OPTIONS}
          fullWidth={false}
        />
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setType("");
              setStatus("");
              setPage(0);
            }}
            className="flex items-center gap-1 text-sm text-charcoal-subtle hover:text-charcoal"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Error states */}
      {(error || actionError) && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error || actionError}</p>
        </Card>
      )}

      {/* Empty state */}
      {!loading && data.length === 0 && (
        <Card className="p-10 text-center">
          <Sparkles className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            Sin experiencias
          </h2>
          <p className="text-sm text-charcoal-muted mb-4">
            Crea la primera experiencia para empezar a construir tu catálogo.
          </p>
          {isAdmin && (
            <Button
              type="button"
              size="sm"
              onClick={() => navigate(ROUTES.ADMIN_EXPERIENCE_NEW)}
            >
              <Plus className="h-4 w-4" />
              Crear primera experiencia
            </Button>
          )}
        </Card>
      )}

      {/* Desktop table */}
      {!loading && data.length > 0 && (
        <div className="hidden md:block">
          <ExperienceTable
            experiences={data}
            loading={loading}
            onStatusChange={handleStatusUpdate}
            canAdmin={isAdmin}
          />
        </div>
      )}

      {/* Loading skeleton — desktop */}
      {loading && (
        <div className="hidden md:block">
          <ExperienceTable
            experiences={[]}
            loading={true}
            onStatusChange={handleStatusUpdate}
            canAdmin={isAdmin}
          />
        </div>
      )}

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-40 rounded bg-warm-gray" />
                  <div className="h-3 w-28 rounded bg-warm-gray" />
                </div>
                <div className="h-5 w-20 rounded-full bg-warm-gray" />
              </div>
              <div className="h-3 w-32 rounded bg-warm-gray" />
            </Card>
          ))}

        {!loading &&
          data.map((exp) => (
            <ExperienceCard
              key={exp.$id}
              experience={exp}
              onStatusChange={handleStatusUpdate}
              canAdmin={isAdmin}
            />
          ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-charcoal-subtle">
            Página {page + 1} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
