import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6); // 6:00 – 21:00

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function formatDay(date, locale = "en-US") {
  return date.toLocaleDateString(locale, { weekday: "short", day: "numeric" });
}

function formatHour(h) {
  return `${String(h).padStart(2, "0")}:00`;
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const STATUS_COLORS = {
  draft: "bg-amber-100 border-amber-300 text-amber-800",
  published: "bg-sage/20 border-sage text-sage-dark",
  full: "bg-red-100 border-red-300 text-red-800",
  cancelled:
    "bg-charcoal/10 border-charcoal/20 text-charcoal-muted line-through",
};

export default function SlotCalendarView({
  slots = [],
  experienceId,
  experienceNames = {},
}) {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const locale = lang === "es" ? "es-MX" : "en-US";
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const slotsByDay = useMemo(() => {
    const map = {};
    days.forEach((day) => {
      const key = day.toISOString().slice(0, 10);
      map[key] = slots.filter((s) => isSameDay(new Date(s.startDatetime), day));
    });
    return map;
  }, [slots, days]);

  function prevWeek() {
    setWeekStart((w) => addDays(w, -7));
  }

  function nextWeek() {
    setWeekStart((w) => addDays(w, 7));
  }

  function goToday() {
    setWeekStart(getWeekStart(new Date()));
  }

  function handleSlotClick(slot) {
    const eid = experienceId || slot.experienceId;
    navigate(`/admin/experiences/${eid}/slots/${slot.$id}/edit`);
  }

  const weekLabel = `${weekStart.toLocaleDateString(locale, { month: "short", day: "numeric" })} — ${addDays(weekStart, 6).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="space-y-3">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={prevWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-charcoal min-w-[200px] text-center">
            {weekLabel}
          </span>
          <Button variant="ghost" size="sm" onClick={nextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={goToday}>
          {t("admin.slotCalendar.today")}
        </Button>
      </div>

      {/* Desktop grid */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
        <div className="min-w-[700px]">
          {/* Day headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-sand-dark bg-warm-gray/60">
            <div className="px-2 py-2" />
            {days.map((day) => {
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "px-2 py-2 text-center text-xs font-medium",
                    isToday ? "text-sage font-semibold" : "text-charcoal-muted",
                  )}
                >
                  {formatDay(day, locale)}
                </div>
              );
            })}
          </div>

          {/* Hour rows */}
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-sand-dark/50 min-h-[48px]"
            >
              <div className="px-2 py-1 text-[10px] text-charcoal-muted text-right pr-3 pt-1">
                {formatHour(hour)}
              </div>
              {days.map((day) => {
                const dayKey = day.toISOString().slice(0, 10);
                const daySlots = (slotsByDay[dayKey] || []).filter((s) => {
                  const h = new Date(s.startDatetime).getHours();
                  return h === hour;
                });
                return (
                  <div
                    key={dayKey}
                    className="px-0.5 py-0.5 border-l border-sand-dark/30 relative"
                  >
                    {daySlots.map((slot) => (
                      <button
                        key={slot.$id}
                        onClick={() => handleSlotClick(slot)}
                        className={cn(
                          "w-full text-left text-[10px] leading-tight px-1.5 py-1 rounded border mb-0.5 cursor-pointer truncate transition-opacity hover:opacity-80",
                          STATUS_COLORS[slot.status] || STATUS_COLORS.draft,
                        )}
                        title={`${experienceNames[slot.experienceId] || ""} ${new Date(slot.startDatetime).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })} — ${slot.bookedCount}/${slot.capacity}`}
                      >
                        <span className="font-medium">
                          {new Date(slot.startDatetime).toLocaleTimeString(
                            locale,
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                        {experienceNames[slot.experienceId] && (
                          <span className="block truncate">
                            {experienceNames[slot.experienceId]}
                          </span>
                        )}
                        <span className="block">
                          {slot.bookedCount}/{slot.capacity}
                        </span>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile list */}
      <div className="md:hidden space-y-2">
        {days.map((day) => {
          const dayKey = day.toISOString().slice(0, 10);
          const daySlots = slotsByDay[dayKey] || [];
          if (daySlots.length === 0) return null;
          return (
            <div key={dayKey}>
              <h3
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide mb-1",
                  isSameDay(day, new Date())
                    ? "text-sage"
                    : "text-charcoal-muted",
                )}
              >
                {day.toLocaleDateString(locale, {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </h3>
              <div className="space-y-1">
                {daySlots.map((slot) => (
                  <button
                    key={slot.$id}
                    onClick={() => handleSlotClick(slot)}
                    className={cn(
                      "w-full text-left text-xs px-3 py-2 rounded-lg border transition-opacity hover:opacity-80",
                      STATUS_COLORS[slot.status] || STATUS_COLORS.draft,
                    )}
                  >
                    <span className="font-medium">
                      {new Date(slot.startDatetime).toLocaleTimeString(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" – "}
                      {new Date(slot.endDatetime).toLocaleTimeString(locale, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {experienceNames[slot.experienceId] && (
                      <span className="ml-2">
                        {experienceNames[slot.experienceId]}
                      </span>
                    )}
                    <span className="float-right">
                      {slot.bookedCount}/{slot.capacity}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        {slots.length === 0 && (
          <p className="text-sm text-charcoal-muted text-center py-4">
            {t("admin.slotCalendar.noSlotsThisWeek")}
          </p>
        )}
      </div>
    </div>
  );
}
