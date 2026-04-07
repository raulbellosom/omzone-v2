import { useState, useMemo } from "react";
import { useAllSlots } from "@/hooks/useSlots";
import { useExperiences } from "@/hooks/useExperiences";
import SlotCalendarView from "@/components/admin/slots/SlotCalendarView";
import { Card } from "@/components/common/Card";
import { CalendarDays } from "lucide-react";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const STATUS_FILTER_OPTIONS = [
  { value: "", i18nKey: "admin.agenda.allStatuses" },
  { value: "draft", i18nKey: "admin.statuses.draft" },
  { value: "published", i18nKey: "admin.statuses.published" },
  { value: "full", i18nKey: "admin.statuses.full" },
  { value: "cancelled", i18nKey: "admin.statuses.cancelled" },
];

export default function AgendaGlobalPage() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: experiences } = useExperiences({ limit: 100 });
  const {
    data: slots,
    loading,
    error,
  } = useAllSlots({
    status: statusFilter,
    experienceId: experienceFilter,
    dateFrom: dateFrom ? new Date(dateFrom).toISOString() : "",
    dateTo: dateTo ? new Date(dateTo + "T23:59:59").toISOString() : "",
  });

  const experienceNames = useMemo(
    () => Object.fromEntries(experiences.map((e) => [e.$id, e.publicName])),
    [experiences],
  );

  const experienceOptions = [
    { value: "", label: t("admin.agenda.allExperiences") },
    ...experiences.map((e) => ({ value: e.$id, label: e.publicName })),
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-charcoal">
          {t("admin.agenda.title")}
        </h1>
        <p className="text-sm text-charcoal-subtle mt-0.5">
          {t("admin.agenda.subtitle")}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <AdminSelect
          value={experienceFilter}
          onChange={setExperienceFilter}
          options={experienceOptions}
          fullWidth={false}
        />
        <AdminSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS.map((o) => ({
            ...o,
            label: t(o.i18nKey),
          }))}
          fullWidth={false}
        />
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="h-11 rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="h-11 rounded-xl border border-sand-dark bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:border-sage focus:ring-2 focus:ring-sage/20"
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <Card className="p-5 space-y-4 animate-pulse">
          {/* Calendar header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-5 w-32 rounded bg-warm-gray" />
            <div className="flex gap-2">
              <div className="h-8 w-8 rounded-lg bg-warm-gray" />
              <div className="h-8 w-16 rounded-lg bg-warm-gray" />
              <div className="h-8 w-8 rounded-lg bg-warm-gray" />
            </div>
          </div>
          {/* Day headers */}
          <div className="hidden md:grid grid-cols-7 gap-px">
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <div key={d} className="h-5 rounded bg-warm-gray mx-2" />
            ))}
          </div>
          {/* Calendar grid rows */}
          <div className="hidden md:grid grid-cols-7 gap-px bg-sand-dark rounded-xl overflow-hidden border border-sand-dark">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="bg-white p-2 h-14">
                {i % 3 === 0 && (
                  <div className="h-3 w-16 rounded bg-warm-gray" />
                )}
              </div>
            ))}
          </div>
          {/* Mobile list skeleton */}
          <div className="md:hidden space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 rounded bg-warm-gray" />
                <div className="h-10 w-full rounded-lg bg-warm-gray/50" />
              </div>
            ))}
          </div>
        </Card>
      )}

      {!loading && slots.length === 0 && (
        <Card className="p-10 text-center">
          <CalendarDays className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            {t("admin.agenda.emptyTitle")}
          </h2>
          <p className="text-sm text-charcoal-muted">
            {t("admin.agenda.emptyMessage")}
          </p>
        </Card>
      )}

      {!loading && slots.length > 0 && (
        <SlotCalendarView slots={slots} experienceNames={experienceNames} />
      )}
    </div>
  );
}
