import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useLocations, updateLocation } from "@/hooks/useLocations";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const LOCATION_NEW_ROUTE = "/admin/locations/new";
const LOCATION_EDIT_ROUTE = "/admin/locations/:id/edit";

function ActiveToggle({ isActive, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      onClick={() => onChange(!isActive)}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-sage/40",
        isActive ? "bg-sage" : "bg-sand-dark",
        "disabled:opacity-40 disabled:cursor-not-allowed"
      )}
    >
      <span className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
        isActive ? "translate-x-4" : "translate-x-0"
      )} />
    </button>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand">
      {[1,2,3,4].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded bg-warm-gray animate-pulse" style={{ width: `${50 + i*10}%` }} />
        </td>
      ))}
    </tr>
  );
}

function LocationCard({ location, onToggle, canAdmin, navigate }) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-charcoal truncate">{location.name}</p>
          {location.address && (
            <p className="text-xs text-charcoal-subtle mt-0.5 truncate">{location.address}</p>
          )}
        </div>
        <Badge variant={location.isActive ? "success" : "warm"}>
          {location.isActive ? "Activa" : "Inactiva"}
        </Badge>
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-sand flex-wrap">
        <Button
          type="button" variant="ghost" size="sm"
          onClick={() => navigate(LOCATION_EDIT_ROUTE.replace(":id", location.$id))}
          className="flex-1 justify-center"
        >
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Button>
        {canAdmin && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-charcoal-subtle">{location.isActive ? "Activa" : "Inactiva"}</span>
            <ActiveToggle isActive={location.isActive} onChange={(v) => onToggle(location.$id, v)} />
          </div>
        )}
      </div>
    </Card>
  );
}

export default function LocationListTab() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [actionError, setActionError] = useState(null);

  const { data, total, loading, error, refetch } = useLocations();

  const handleToggle = useCallback(async (id, newValue) => {
    setActionError(null);
    try {
      await updateLocation(id, { isActive: newValue });
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  }, [refetch]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-charcoal-subtle">
          {!loading && `${total} ${total === 1 ? "locación" : "locaciones"}`}
        </p>
        {isAdmin && (
          <Button type="button" size="sm" onClick={() => navigate(LOCATION_NEW_ROUTE)}>
            <Plus className="h-4 w-4" /> Crear locación
          </Button>
        )}
      </div>

      {(error || actionError) && (
        <Card className="p-3 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error || actionError}</p>
        </Card>
      )}

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-sand-dark bg-warm-gray/50">
              <th className="px-4 py-3 text-left font-medium text-charcoal-subtle">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-charcoal-subtle hidden sm:table-cell">Dirección</th>
              <th className="px-4 py-3 text-center font-medium text-charcoal-subtle">Activa</th>
              <th className="px-4 py-3 text-right font-medium text-charcoal-subtle">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-charcoal-subtle">
                  No hay locaciones creadas todavía.
                </td>
              </tr>
            )}

            {!loading && data.map((loc) => (
              <tr key={loc.$id} className="border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-charcoal truncate max-w-48">{loc.name}</p>
                </td>
                <td className="px-4 py-3 text-charcoal-subtle hidden sm:table-cell truncate max-w-64">
                  {loc.address ?? "—"}
                </td>
                <td className="px-4 py-3 text-center">
                  {isAdmin ? (
                    <ActiveToggle isActive={loc.isActive} onChange={(v) => handleToggle(loc.$id, v)} />
                  ) : (
                    <Badge variant={loc.isActive ? "success" : "warm"}>
                      {loc.isActive ? "Activa" : "Inactiva"}
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button" variant="ghost" size="icon"
                    onClick={() => navigate(LOCATION_EDIT_ROUTE.replace(":id", loc.$id))}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="p-4 space-y-3 animate-pulse">
            <div className="flex justify-between">
              <div className="space-y-1.5">
                <div className="h-4 w-36 rounded bg-warm-gray" />
                <div className="h-3 w-48 rounded bg-warm-gray" />
              </div>
              <div className="h-5 w-16 rounded-full bg-warm-gray" />
            </div>
          </Card>
        ))}
        {!loading && data.length === 0 && (
          <Card className="p-8 text-center space-y-4">
            <p className="text-sm text-charcoal-subtle">No hay locaciones todavía.</p>
            {isAdmin && (
              <Button type="button" size="sm" onClick={() => navigate(LOCATION_NEW_ROUTE)}>
                <Plus className="h-4 w-4" /> Crear primera locación
              </Button>
            )}
          </Card>
        )}
        {!loading && data.map((loc) => (
          <LocationCard key={loc.$id} location={loc} onToggle={handleToggle} canAdmin={isAdmin} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}
