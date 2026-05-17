import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";

function formatAxisDate(dateStr, granularity) {
  try {
    const d = parseISO(dateStr);
    if (granularity === "month") return format(d, "MMM yyyy");
    return format(d, "MMM d");
  } catch {
    return dateStr;
  }
}

function formatTooltipDate(dateStr, granularity) {
  try {
    const d = parseISO(dateStr);
    if (granularity === "month") return format(d, "MMMM yyyy");
    if (granularity === "week") return `Week of ${format(d, "MMM d, yyyy")}`;
    return format(d, "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

function CustomTooltip({ active, payload, label, granularity }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-charcoal-muted text-xs mb-1">
        {formatTooltipDate(label, granularity)}
      </p>
      <p className="text-charcoal font-medium">
        {payload[0].value}{" "}
        <span className="text-charcoal-muted font-normal">orders</span>
      </p>
    </div>
  );
}

export default function OrdersVolumeChart({
  data,
  loading,
  granularity = "day",
}) {
  const { t } = useLanguage();
  const total = data.reduce((s, d) => s + (d.count || 0), 0);

  if (loading) {
    return (
      <Card className="p-5">
        <div className="h-52 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-charcoal mb-1">
        {t("admin.dashboard.analytics.ordersVolume")}
      </h3>
      <p className="text-xs text-charcoal-muted mb-3">
        {total} {t("admin.dashboard.analytics.totalOrders")}
      </p>
      {total === 0 ? (
        <div className="h-40 flex items-center justify-center text-charcoal-muted text-sm">
          {t("admin.dashboard.analytics.noData")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={190}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F1F5F9"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => formatAxisDate(d, granularity)}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              content={<CustomTooltip granularity={granularity} />}
              cursor={{ fill: "#F1F5F9", radius: 4 }}
            />
            <Bar
              dataKey="count"
              fill="#7C9E87"
              radius={[4, 4, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
