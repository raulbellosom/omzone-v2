import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import {
  useDashboardMetrics,
  useRecentOrders,
  useUpcomingSlots,
} from "@/hooks/useDashboardMetrics";
import { ROUTES } from "@/constants/routes";
import { Card } from "@/components/common/Card";
import MetricCard from "@/components/admin/dashboard/MetricCard";
import RecentOrdersTable from "@/components/admin/dashboard/RecentOrdersTable";
import UpcomingSlotsCard from "@/components/admin/dashboard/UpcomingSlotsCard";
import QuickActions from "@/components/admin/dashboard/QuickActions";
import {
  ShoppingCart,
  DollarSign,
  TicketCheck,
  CalendarDays,
  MessageSquare,
} from "lucide-react";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboardPage() {
  const { user, isAdmin, isRoot } = useAuth();
  const { t } = useLanguage();
  const canSeeRevenue = isAdmin || isRoot;
  const { metrics, loading: metricsLoading } = useDashboardMetrics();
  const { orders, loading: ordersLoading } = useRecentOrders(10);
  const { slots, loading: slotsLoading } = useUpcomingSlots(5);

  const firstName = user?.name?.split(" ")[0] || "Admin";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-charcoal">
          {t("admin.dashboard.welcome").replace("{name}", firstName)}
        </h1>
        <p className="text-charcoal-muted mt-0.5">
          {t("admin.dashboard.subtitle")}
        </p>
      </div>

      {/* Quick actions */}
      <QuickActions isAdmin={canSeeRevenue} />

      {/* Metric cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title={t("admin.dashboard.ordersTitle")}
          value={metricsLoading ? "…" : metrics.ordersMonth}
          description={t("admin.dashboard.ordersDesc")}
          icon={ShoppingCart}
        />
        {canSeeRevenue && (
          <MetricCard
            title={t("admin.dashboard.revenueTitle")}
            value={metricsLoading ? "…" : formatCurrency(metrics.revenueMonth)}
            description={t("admin.dashboard.revenueDesc")}
            icon={DollarSign}
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

      {/* Pending requests banner */}
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
