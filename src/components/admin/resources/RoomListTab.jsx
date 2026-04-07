import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useRooms, updateRoom } from "@/hooks/useRooms";
import { useLocations } from "@/hooks/useLocations";
import { useAuth } from "@/hooks/useAuth";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";

const ROOM_TYPE_LABELS = {
  studio: "Estudio",
  therapy_room: "Sala de terapia",
  outdoor: "Exterior",
  pool_area: "Área de alberca",
  other: "Otro",
};

const ROOM_NEW_ROUTE = "/admin/rooms/new";
const ROOM_EDIT_ROUTE = "/admin/rooms/:id/edit";

function ActiveToggle({ isActive, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isActive}
      onClick={() => onChange(!isActive)}
      className={cn(
        "relative w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sage/40",
        isActive ? "bg-sage" : "bg-sand-dark",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
          isActive ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-sand">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 rounded bg-warm-gray animate-pulse"
            style={{ width: `${40 + i * 10}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

function RoomCard({ room, locationName, onToggle, canAdmin, navigate }) {
  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-charcoal truncate">{room.name}</p>
          <p className="text-xs text-charcoal-subtle mt-0.5 truncate">
            {locationName ?? "—"}
          </p>
        </div>
        <Badge variant={room.isActive ? "success" : "warm"}>
          {room.isActive ? "Activo" : "Inactivo"}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-charcoal-subtle flex-wrap">
        <span>{ROOM_TYPE_LABELS[room.type] ?? room.type ?? "—"}</span>
        {room.capacity && (
          <>
            <span className="text-sand-dark">·</span>
            <span>{room.capacity} personas</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-sand flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROOM_EDIT_ROUTE.replace(":id", room.$id))}
          className="flex-1 justify-center"
        >
          <Pencil className="h-3.5 w-3.5" /> Editar
        </Button>
        {canAdmin && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-charcoal-subtle">
              {room.isActive ? "Activo" : "Inactivo"}
            </span>
            <ActiveToggle
              isActive={room.isActive}
              onChange={(v) => onToggle(room.$id, v)}
            />
          </div>
        )}
      </div>
    </Card>
  );
}

export default function RoomListTab() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [locationFilter, setLocationFilter] = useState("");
  const [actionError, setActionError] = useState(null);

  // All locations for filter select
  const { data: locations } = useLocations({ activeOnly: false });

  const {
    data: rooms,
    total,
    loading,
    error,
    refetch,
  } = useRooms({ locationId: locationFilter });

  // Build a map: locationId → name for display
  const locationMap = Object.fromEntries(locations.map((l) => [l.$id, l.name]));

  const handleToggle = useCallback(
    async (id, newValue) => {
      setActionError(null);
      try {
        await updateRoom(id, { isActive: newValue });
        refetch();
      } catch (err) {
        setActionError(err.message);
      }
    },
    [refetch],
  );

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Location filter */}
        <AdminSelect
          value={locationFilter}
          onChange={(v) => setLocationFilter(v)}
          options={[
            { value: "", label: "Todas las locaciones" },
            ...locations.map((l) => ({ value: l.$id, label: l.name })),
          ]}
          minWidth="min-w-[180px]"
          fullWidth={false}
        />

        <div className="ml-auto">
          {isAdmin && (
            <Button
              type="button"
              size="sm"
              onClick={() => navigate(ROOM_NEW_ROUTE)}
            >
              <Plus className="h-4 w-4" /> Crear cuarto
            </Button>
          )}
        </div>
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
              <th className="px-4 py-3 text-left font-medium text-charcoal-subtle">
                Nombre
              </th>
              <th className="px-4 py-3 text-left font-medium text-charcoal-subtle">
                Locación
              </th>
              <th className="px-4 py-3 text-left font-medium text-charcoal-subtle hidden lg:table-cell">
                Tipo
              </th>
              <th className="px-4 py-3 text-left font-medium text-charcoal-subtle hidden sm:table-cell">
                Capacidad
              </th>
              <th className="px-4 py-3 text-center font-medium text-charcoal-subtle">
                Activo
              </th>
              <th className="px-4 py-3 text-right font-medium text-charcoal-subtle">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}

            {!loading && rooms.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-sm text-charcoal-subtle"
                >
                  No hay cuartos
                  {locationFilter ? " en esta locación" : " creados todavía"}.
                </td>
              </tr>
            )}

            {!loading &&
              rooms.map((room) => (
                <tr
                  key={room.$id}
                  className="border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-charcoal truncate max-w-40">
                      {room.name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-charcoal-subtle truncate max-w-40">
                    {locationMap[room.locationId] ?? room.locationId}
                  </td>
                  <td className="px-4 py-3 text-charcoal-subtle hidden lg:table-cell">
                    {ROOM_TYPE_LABELS[room.type] ?? room.type ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-charcoal-subtle hidden sm:table-cell">
                    {room.capacity ? `${room.capacity} pers.` : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {isAdmin ? (
                      <ActiveToggle
                        isActive={room.isActive}
                        onChange={(v) => handleToggle(room.$id, v)}
                      />
                    ) : (
                      <Badge variant={room.isActive ? "success" : "warm"}>
                        {room.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        navigate(ROOM_EDIT_ROUTE.replace(":id", room.$id))
                      }
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
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-36 rounded bg-warm-gray" />
                  <div className="h-3 w-28 rounded bg-warm-gray" />
                </div>
                <div className="h-5 w-16 rounded-full bg-warm-gray" />
              </div>
            </Card>
          ))}
        {!loading && rooms.length === 0 && (
          <Card className="p-8 text-center space-y-4">
            <p className="text-sm text-charcoal-subtle">
              No hay cuartos todavía.
            </p>
            {isAdmin && (
              <Button
                type="button"
                size="sm"
                onClick={() => navigate(ROOM_NEW_ROUTE)}
              >
                <Plus className="h-4 w-4" /> Crear primer cuarto
              </Button>
            )}
          </Card>
        )}
        {!loading &&
          rooms.map((room) => (
            <RoomCard
              key={room.$id}
              room={room}
              locationName={locationMap[room.locationId]}
              onToggle={handleToggle}
              canAdmin={isAdmin}
              navigate={navigate}
            />
          ))}
      </div>

      {!loading && total > 0 && (
        <p className="text-xs text-charcoal-subtle text-right">
          {total} {total === 1 ? "cuarto" : "cuartos"}
        </p>
      )}
    </div>
  );
}
