import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { ROLES } from "@/constants/roles";
import { Card } from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import OrderTable from "@/components/admin/orders/OrderTable";
import OrderCard from "@/components/admin/orders/OrderCard";
import { Search, ShoppingCart, X } from "lucide-react";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 25;

const STATUS_KEYS = [
  { value: "", i18nKey: "admin.orders.allStatuses" },
  { value: "pending", i18nKey: "admin.orders.pending" },
  { value: "paid", i18nKey: "admin.orders.paid" },
  { value: "confirmed", i18nKey: "admin.orders.confirmed" },
  { value: "cancelled", i18nKey: "admin.orders.cancelled" },
  { value: "refunded", i18nKey: "admin.orders.refunded" },
];

const PAYMENT_STATUS_KEYS = [
  { value: "", i18nKey: "admin.orders.allPayments" },
  { value: "pending", i18nKey: "admin.orders.pending" },
  { value: "processing", i18nKey: "admin.orders.processing" },
  { value: "succeeded", i18nKey: "admin.orders.succeeded" },
  { value: "failed", i18nKey: "admin.orders.failed" },
  { value: "refunded", i18nKey: "admin.orders.refunded" },
];

export default function OrderListPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin =
    user?.labels?.includes(ROLES.ADMIN) || user?.labels?.includes(ROLES.ROOT);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(0);

  const offset = page * PAGE_SIZE;
  const { data, total, loading, error, refetch } = useOrders({
    search,
    status,
    paymentStatus,
    limit: PAGE_SIZE,
    offset,
  });
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const hasFilters = search || status || paymentStatus;

  const STATUS_OPTIONS = STATUS_KEYS.map((s) => ({
    value: s.value,
    label: t(s.i18nKey),
  }));
  const PAYMENT_STATUS_OPTIONS = PAYMENT_STATUS_KEYS.map((s) => ({
    value: s.value,
    label: t(s.i18nKey),
  }));

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPaymentStatus("");
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
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            {t("admin.orders.title")}
          </h1>
          {!loading && (
            <p className="text-sm text-charcoal-muted mt-1">
              {total === 1
                ? t("admin.orders.countOne")
                : t("admin.orders.countOther").replace("{count}", total)}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t("admin.orders.searchPlaceholder")}
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
          value={paymentStatus}
          onChange={(v) => {
            setPaymentStatus(v);
            setPage(0);
          }}
          options={PAYMENT_STATUS_OPTIONS}
          fullWidth={false}
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-charcoal-muted hover:text-charcoal transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            {t("admin.orders.clear")}
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
          <ShoppingCart className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            {t("admin.orders.emptyTitle")}
          </h2>
          <p className="text-sm text-charcoal-muted">
            {hasFilters
              ? t("admin.orders.emptyFiltered")
              : t("admin.orders.emptyDefault")}
          </p>
        </Card>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <OrderTable orders={data} loading={loading} />
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
                <div className="h-5 w-20 rounded-full bg-warm-gray" />
                <div className="h-4 w-16 rounded bg-warm-gray" />
              </div>
            </Card>
          ))}

        {!loading &&
          data.map((order) => <OrderCard key={order.$id} order={order} />)}
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
