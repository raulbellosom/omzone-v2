import { useState } from "react";
import {
  useBookingRequests,
  REQUEST_STATUSES,
} from "@/hooks/useBookingRequests";
import { useLanguage } from "@/hooks/useLanguage";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import BookingRequestTable from "@/components/admin/booking-requests/BookingRequestTable";
import BookingRequestCard from "@/components/admin/booking-requests/BookingRequestCard";
import { Search, MessageSquare, X } from "lucide-react";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

const STATUS_OPTIONS = [
  { value: "", i18nKey: "admin.bookingRequests.allStatuses" },
  ...REQUEST_STATUSES.map((s) => ({ value: s.value, label: s.label })),
];

export default function BookingRequestListPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);

  const offset = page * PAGE_SIZE;
  const { data, total, loading, error } = useBookingRequests({
    search,
    status,
    limit: PAGE_SIZE,
    offset,
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = search || status;

  const resolvedStatusOptions = STATUS_OPTIONS.map((s) => ({
    value: s.value,
    label: s.i18nKey ? t(s.i18nKey) : s.label,
  }));

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPage(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">
          {t("admin.bookingRequests.title")}
        </h1>
        {!loading && (
          <p className="text-sm text-charcoal-muted mt-1">
            {total === 1
              ? t("admin.bookingRequests.countOne")
              : t("admin.bookingRequests.countOther").replace("{count}", total)}
          </p>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder={t("admin.bookingRequests.searchPlaceholder")}
            className="pl-9 h-10"
          />
        </div>
        <AdminSelect
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(0);
          }}
          options={resolvedStatusOptions}
          fullWidth={false}
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {t("admin.bookingRequests.clear")}
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
          <MessageSquare className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            {t("admin.bookingRequests.emptyTitle")}
          </h2>
          <p className="text-sm text-charcoal-muted">
            {hasFilters
              ? t("admin.bookingRequests.emptyFiltered")
              : t("admin.bookingRequests.emptyDefault")}
          </p>
        </Card>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <BookingRequestTable requests={data} loading={loading} />
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
              <div className="h-4 w-40 rounded bg-warm-gray" />
              <div className="flex justify-between">
                <div className="h-3 w-24 rounded bg-warm-gray" />
                <div className="h-3 w-16 rounded bg-warm-gray" />
              </div>
            </Card>
          ))}

        {!loading &&
          data.map((req) => <BookingRequestCard key={req.$id} request={req} />)}
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
