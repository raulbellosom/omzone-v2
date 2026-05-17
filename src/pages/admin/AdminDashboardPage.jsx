import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import {
  useDashboardMetrics,
  useRecentOrders,
  useUpcomingSlots,
  monthRange,
} from "@/hooks/useDashboardMetrics";
import {
  useDashboardCharts,
  getAutoGranularity,
  getAvailableGranularities,
} from "@/hooks/useDashboardCharts";
import { useUnreadContactCount } from "@/hooks/useContactMessages";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import MetricCard from "@/components/admin/dashboard/MetricCard";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrdersTable";
import UpcomingSlotsCard from "@/components/admin/dashboard/UpcomingSlotsCard";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import DateRangeFilter from "@/components/admin/dashboard/DateRangeFilter";
import GranularityFilter from "@/components/admin/dashboard/GranularityFilter";
import RevenueOverTimeChart from "@/components/admin/dashboard/RevenueOverTimeChart";
import OrdersByStatusChart from "@/components/admin/dashboard/OrdersByStatusChart";
import OrdersVolumeChart from "@/components/admin/dashboard/OrdersVolumeChart";
import {
  ShoppingCart,
  DollarSign,
  TicketCheck,
  CalendarDays,
  MessageSquare,
  Mail,
} from "lucide-react";

function formatAmount(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function RevenueValue({ revenuesByCurrency, loading }) {
  if (loading) return <span>…</span>;
  const entries = Object.entries(revenuesByCurrency);
  if (entries.length === 0) {
    return <span className="text-charcoal-muted text-lg">—</span>;
  }
  return (
    <div className="space-y-0.5">
      {entries.map(([currency, amount]) => (
        <div
          key={currency}
          className="flex items-baseline gap-1.5 leading-tight"
        >
          <span className="text-2xl font-semibold text-charcoal">
            {formatAmount(amount, currency)}
          </span>
          <span className="text-xs text-charcoal-muted font-normal">
            {currency}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isAdmin, isRoot } = useAuth();
  const { t } = useLanguage();
  const canSeeRevenue = isAdmin || isRoot;

  const [dateRange, setDateRange] = useState(monthRange);
  const [granularity, setGranularity] = useState(() =>
    getAutoGranularity(monthRange().start, monthRange().end),
  );

  // Auto-reset granularity to the best default when the date range changes
  useEffect(() => {
    if (dateRange?.start && dateRange?.end) {
      setGranularity(getAutoGranularity(dateRange.start, dateRange.end));
    }
  }, [dateRange?.start, dateRange?.end]);

  const availableGranularities =
    dateRange?.start && dateRange?.end
      ? getAvailableGranularities(dateRange.start, dateRange.end)
      : ["day"];

  const { metrics, loading: metricsLoading } = useDashboardMetrics(dateRange);
  const { orders, loading: ordersLoading } = useRecentOrders(10, dateRange);
  const { slots, loading: slotsLoading } = useUpcomingSlots(5);
  const unreadContactCount = useUnreadContactCount();
  const { data: chartData, loading: chartsLoading } = useDashboardCharts(
    dateRange,
    granularity,
  );

  const firstName = user?.name?.split(" ")[0] || "Admin";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            {t("admin.dashboard.welcome").replace("{name}", firstName)}
          </h1>
          <p className="text-charcoal-muted mt-0.5">
            {t("admin.dashboard.subtitle")}
          </p>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* Quick actions */}
      <QuickActions isAdmin={canSeeRevenue} />

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title={t("admin.dashboard.ordersTitle")}
          value={metricsLoading ? "…" : metrics.ordersCount}
          description={t("admin.dashboard.ordersDesc")}
          icon={ShoppingCart}
        />
        {canSeeRevenue && (
          <MetricCard
            title={t("admin.dashboard.revenueTitle")}
            value={
              <RevenueValue
                revenuesByCurrency={metrics.revenuesByCurrency}
                loading={metricsLoading}
              />
            }
            description={t("admin.dashboard.revenueDesc")}
            icon={DollarSign}
            className="col-span-1"
          />
        )}
        <MetricCard
          title={t("admin.dashboard.activeTicketsTitle")}
          value={metricsLoading ? "…" : metrics.activeTickets}
          description={t("admin.dashboard.activeTicketsDesc")}
          icon={TicketCheck}
        />
        <MetricCard
          title={t("admin.dashboard.upcomingSlotsTitle")}
          value={metricsLoading ? "…" : metrics.upcomingSlots}
          description={t("admin.dashboard.upcomingSlotsDesc")}
          icon={CalendarDays}
        />
      </div>

      {/* Banners — unread contacts + pending requests */}
      {(unreadContactCount > 0 || metrics.pendingRequests > 0) && (
        <div className="space-y-3">
          {unreadContactCount > 0 && (
            <Link to={ROUTES.ADMIN_CONTACT_MESSAGES + "?filter=unread"}>
              <Card className="p-4 border-sky-200 bg-sky-50 hover:shadow-card-hover transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-sky-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-sky-900">
                      {unreadContactCount === 1
                        ? t("admin.dashboard.unreadContactOne")
                        : t("admin.dashboard.unreadContactOther").replace(
                            "{count}",
                            unreadContactCount,
                          )}
                    </p>
                    <p className="text-xs text-sky-700">
                      {t("admin.dashboard.clickToReview")}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {metrics.pendingRequests > 0 && (
            <Link to={ROUTES.ADMIN_BOOKING_REQUESTS}>
              <Card className="p-4 border-amber-200 bg-amber-50 hover:shadow-card-hover transition-shadow cursor-pointer">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      {metrics.pendingRequests === 1
                        ? t("admin.dashboard.pendingBookingOne")
                        : t("admin.dashboard.pendingBookingOther").replace(
                            "{count}",
                            metrics.pendingRequests,
                          )}
                    </p>
                    <p className="text-xs text-amber-700">
                      {t("admin.dashboard.clickToReview")}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Analytics charts — admin/root only */}
      {canSeeRevenue && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-sm font-semibold text-charcoal-subtle uppercase tracking-wider">
              {t("admin.dashboard.analytics.title")}
            </h2>
            <GranularityFilter
              value={granularity}
              onChange={setGranularity}
              available={availableGranularities}
            />
          </div>
          <RevenueOverTimeChart
            data={chartData.revenueByDay}
            currencies={chartData.currencies}
            loading={chartsLoading}
            granularity={granularity}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <OrdersByStatusChart
              data={chartData.ordersByStatus}
              loading={chartsLoading}
            />
            <OrdersVolumeChart
              data={chartData.orderCountByDay}
              loading={chartsLoading}
              granularity={granularity}
            />
          </div>
        </div>
      )}

      {/* Content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent orders — 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-charcoal">
                {t("admin.dashboard.recentOrders")}
              </h3>
              <Link
                to={ROUTES.ADMIN_ORDERS}
                className="text-xs text-sage hover:underline"
              >
                {t("admin.dashboard.viewAll")}
              </Link>
            </div>
            <RecentOrdersTable orders={orders} loading={ordersLoading} />
          </Card>
        </div>

        {/* Upcoming slots — 1/3 width */}
        <div>
          <UpcomingSlotsCard slots={slots} loading={slotsLoading} />
        </div>
      </div>
    </div>
  );
}
