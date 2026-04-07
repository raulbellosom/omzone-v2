import { Link } from "react-router-dom";
import { Card } from "@/components/common/Card";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";
import { Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

function formatSlotDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function OccupancyBar({ booked, capacity }) {
  const pct = capacity > 0 ? Math.round((booked / capacity) * 100) : 0;
  const barColor =
    pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-warm-gray overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-medium text-charcoal-muted whitespace-nowrap">
        {booked}/{capacity}
      </span>
    </div>
  );
}

function SkeletonSlots() {
  return Array.from({ length: 3 }).map((_, i) => (
    <div key={i} className="animate-pulse py-3 space-y-2">
      <div className="h-4 w-2/3 rounded bg-warm-gray" />
      <div className="h-3 w-1/2 rounded bg-warm-gray" />
      <div className="h-2 w-full rounded bg-warm-gray" />
    </div>
  ));
}

export default function UpcomingSlotsCard({ slots, loading }) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-charcoal mb-3">
          {t("admin.upcomingSlots.title")}
        </h3>
        <SkeletonSlots />
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-charcoal">
          {t("admin.upcomingSlots.title")}
        </h3>
        <Link
          to={ROUTES.ADMIN_SLOTS}
          className="text-xs text-sage hover:underline"
        >
          {t("admin.upcomingSlots.viewAll")}
        </Link>
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-charcoal-muted py-4 text-center">
          {t("admin.upcomingSlots.noSlots")}
        </p>
      ) : (
        <ul className="divide-y divide-sand-dark/30">
          {slots.map((slot) => (
            <li key={slot.$id} className="py-3 first:pt-0 last:pb-0">
              <p className="text-sm font-medium text-charcoal truncate">
                {slot.experienceName}
              </p>
              <div className="flex items-center gap-3 mt-1 text-xs text-charcoal-muted">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatSlotDate(slot.startDatetime)}
                </span>
                {slot.locationId && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {slot.locationId}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <OccupancyBar
                  booked={slot.bookedCount || 0}
                  capacity={slot.capacity || 0}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
