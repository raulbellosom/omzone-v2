import { useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { useRooms, updateRoom } from "@/hooks/useRooms";
import { useLocations } from "@/hooks/useLocations";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";

const ROOM_TYPE_LABEL_KEYS = [
  "studio",
  "therapy_room",
  "outdoor",
  "pool_area",
  "other",
];

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
        "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-sage/40",
        isActive ? "bg-sage" : "bg-sand-dark",
      )}
    >
      <span
        className={cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
          isActive ? "translate-x-4" : "translate-x-0",
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

function RoomCard({
  room,
  locationName,
  onToggle,
  canAdmin,
  navigate,
  t,
  roomTypeLabel,
}) {
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
          {room.isActive
            ? t("admin.resourceLists.active")
            : t("admin.resourceLists.inactive")}
        </Badge>
      </div>
      <div className="flex items-center gap-3 text-xs text-charcoal-subtle flex-wrap">
        <span>{roomTypeLabel}</span>
        {room.capacity && (
          <>
            <span className="text-sand-dark">·</span>
            <span>
              {room.capacity} {t("admin.resourceLists.persAbbr")}
            </span>
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
          <Pencil className="h-3.5 w-3.5" /> {t("admin.resourceLists.edit")}
        </Button>
        {canAdmin && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-charcoal-subtle">
              {room.isActive
                ? t("admin.resourceLists.active")
                : t("admin.resourceLists.inactive")}
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
  const { t } = useLanguage();
  const [locationFilter, setLocationFilter] = useState("");
  const [actionError, setActionError] = useState(null);

  const getRoomTypeLabel = (typeVal) =>
    typeVal
      ? t(`admin.resourceLists.roomTypes.${typeVal}`) || typeVal
      : "\u2014";

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
            { value: "", label: t("admin.resourceLists.allLocations") },
            ...locations.map((l) => ({ value: l.$id, label: l.name })),
          ]}
          minWidth="min-w-44"
          fullWidth={false}
        />

        <div className="ml-auto">
          {isAdmin && (
            <Button
              type="button"
              size="sm"
              onClick={() => navigate(ROOM_NEW_ROUTE)}
            >
              <Plus className="h-4 w-4" /> {t("admin.resourceLists.createRoom")}
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
            <tr className="border-b border-sand-dark bg-warm-gray/60">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                {t("admin.resourceLists.name")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                {t("admin.resourceLists.location")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden lg:table-cell">
                {t("admin.resourceLists.type")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted hidden sm:table-cell">
                {t("admin.resourceLists.capacity")}
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                {t("admin.resourceLists.active")}
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                {t("admin.resourceLists.actions")}
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
                  {locationFilter
                    ? t("admin.resourceLists.noRoomsLocation")
                    : t("admin.resourceLists.noRoomsYet")}
                </td>
              </tr>
            )}

            {!loading &&
              rooms.map((room) => {
                const editUrl = ROOM_EDIT_ROUTE.replace(":id", room.$id);
                return (
                  <tr
                    key={room.$id}
                    className="group border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={editUrl}
                        className="font-medium text-charcoal hover:text-sage-dark hover:underline underline-offset-2 transition-colors truncate max-w-40 block"
                      >
                        {room.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal-subtle truncate max-w-40">
                      {locationMap[room.locationId] ?? room.locationId}
                    </td>
                    <td className="px-4 py-3 text-charcoal-subtle hidden lg:table-cell">
                      {getRoomTypeLabel(room.type)}
                    </td>
                    <td className="px-4 py-3 text-charcoal-subtle hidden sm:table-cell">
                      {room.capacity
                        ? `${room.capacity} ${t("admin.resourceLists.persAbbr")}`
                        : "\u2014"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isAdmin ? (
                        <ActiveToggle
                          isActive={room.isActive}
                          onChange={(v) => handleToggle(room.$id, v)}
                        />
                      ) : (
                        <Badge variant={room.isActive ? "success" : "warm"}>
                          {room.isActive
                            ? t("admin.resourceLists.active")
                            : t("admin.resourceLists.inactive")}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <Link
                        to={editUrl}
                        className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-charcoal-subtle hover:text-sage hover:bg-sage/10 transition-colors"
                        title={t("admin.resourceLists.edit")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
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
              {t("admin.resourceLists.noRoomsMobile")}
            </p>
            {isAdmin && (
              <Button
                type="button"
                size="sm"
                onClick={() => navigate(ROOM_NEW_ROUTE)}
              >
                <Plus className="h-4 w-4" />{" "}
                {t("admin.resourceLists.createFirstRoom")}
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
              t={t}
              roomTypeLabel={getRoomTypeLabel(room.type)}
            />
          ))}
      </div>

      {!loading && total > 0 && (
        <p className="text-xs text-charcoal-subtle text-right">
          {total}{" "}
          {t("admin.resourceLists.roomCount").replace("{count}", "").trim()}
        </p>
      )}
    </div>
  );
}
