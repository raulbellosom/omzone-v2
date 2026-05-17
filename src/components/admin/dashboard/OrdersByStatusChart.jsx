import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";

const STATUS_COLORS = {
  pending: "#F59E0B", // amber-400
  paid: "#38BDF8", // sky-400
  confirmed: "#7C9E87", // sage
  cancelled: "#F87171", // red-400
  refunded: "#A78BFA", // violet-400
};

function statusColor(status) {
  return STATUS_COLORS[status] ?? "#94A3B8";
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-lg px-4 py-2 text-sm">
      <span className="text-charcoal font-medium">{name}: </span>
      <span className="text-charcoal-muted">{value}</span>
    </div>
  );
}

function CustomLegend({ payload }) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3">
      {payload.map((entry) => (
        <li
          key={entry.value}
          className="flex items-center gap-1.5 text-xs text-charcoal-muted"
        >
          <span
            className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          {entry.value}
        </li>
      ))}
    </ul>
  );
}

export default function OrdersByStatusChart({ data, loading }) {
  const { t } = useLanguage();

  const labeled = data.map((d) => ({
    ...d,
    name: t(`admin.dashboard.analytics.status.${d.status}`) || d.status,
    color: statusColor(d.status),
  }));

  if (loading) {
    return (
      <Card className="p-5">
        <div className="h-52 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        </div>
      </Card>
    );
  }

  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-charcoal mb-1">
        {t("admin.dashboard.analytics.ordersByStatus")}
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
          <PieChart>
            <Pie
              data={labeled}
              cx="50%"
              cy="45%"
              innerRadius={52}
              outerRadius={75}
              paddingAngle={3}
              dataKey="count"
            >
              {labeled.map((entry, i) => (
                <Cell key={i} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend content={<CustomLegend />} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
