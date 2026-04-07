import { useState } from "react";
import { useAdminTickets } from "@/hooks/useAdminTickets";
import { useExperiences } from "@/hooks/useExperiences";
import { useLanguage } from "@/hooks/useLanguage";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import AdminSelect from "@/components/common/AdminSelect";
import TicketTable from "@/components/admin/tickets/TicketTable";
import TicketCard from "@/components/admin/tickets/TicketCard";
import { Search, Ticket, X } from "lucide-react";

const PAGE_SIZE = 25;

const STATUS_KEYS = [
  { value: "", i18nKey: "admin.tickets.allStatuses" },
  { value: "valid", i18nKey: "admin.tickets.valid" },
  { value: "used", i18nKey: "admin.tickets.used" },
  { value: "cancelled", i18nKey: "admin.tickets.cancelled" },
  { value: "expired", i18nKey: "admin.tickets.expired" },
];

export default function TicketListPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [experienceId, setExperienceId] = useState("");
  const [page, setPage] = useState(0);

  const offset = page * PAGE_SIZE;
  const { data, total, loading, error } = useAdminTickets({
    search,
    status,
    experienceId,
    limit: PAGE_SIZE,
    offset,
  });

  const { data: experiences } = useExperiences({ limit: 100 });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = search || status || experienceId;

  const STATUS_OPTIONS = STATUS_KEYS.map((s) => ({
    value: s.value,
    label: t(s.i18nKey),
  }));

  const EXPERIENCE_OPTIONS = [
    { value: "", label: t("admin.tickets.allExperiences") },
    ...experiences.map((exp) => ({
      value: exp.$id,
      label: exp.titleEn || exp.titleEs || exp.$id,
    })),
  ];

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setExperienceId("");
    setPage(0);
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-charcoal">
            {t("admin.tickets.title")}
          </h1>
          {!loading && (
            <p className="text-sm text-charcoal-muted mt-1">
              {total === 1
                ? t("admin.tickets.countOne")
                : t("admin.tickets.countOther").replace("{count}", total)}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("admin.tickets.searchPlaceholder")}
            className="pl-9 h-10"
          />
        </div>
        <AdminSelect
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
          options={STATUS_OPTIONS}
          fullWidth={false}
        />
        <AdminSelect
          value={experienceId}
          onChange={(v) => {
            setExperienceId(v);
            setPage(0);
          }}
          options={EXPERIENCE_OPTIONS}
          fullWidth={false}
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {t("admin.tickets.clear")}
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && data.length === 0 && (
        <Card className="p-10 text-center">
          <Ticket className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            {t("admin.tickets.emptyTitle")}
          </h2>
          <p className="text-sm text-charcoal-muted">
            {hasFilters
              ? t("admin.tickets.emptyFiltered")
              : t("admin.tickets.emptyDefault")}
          </p>
        </Card>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <TicketTable tickets={data} loading={loading} />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-4 space-y-3 animate-pulse">
              <div className="flex justify-between">
                <div className="space-y-1.5">
                  <div className="h-4 w-36 rounded bg-warm-gray" />
                  <div className="h-3 w-28 rounded bg-warm-gray" />
                </div>
                <div className="h-5 w-16 rounded-full bg-warm-gray" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 w-24 rounded bg-warm-gray" />
                <div className="h-3 w-16 rounded bg-warm-gray" />
              </div>
            </Card>
          ))}

        {!loading &&
          data.map((ticket) => <TicketCard key={ticket.$id} ticket={ticket} />)}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-charcoal-subtle">
            {t("admin.common.pageOf")
              .replace("{page}", page + 1)
              .replace("{total}", totalPages)}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              {t("admin.common.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              {t("admin.common.next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
