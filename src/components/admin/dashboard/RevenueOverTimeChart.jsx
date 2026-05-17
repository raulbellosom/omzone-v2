import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";

// Color map per currency
const CURRENCY_COLORS = {
  MXN: { stroke: "#7C9E87", fill: "#7C9E87" }, // sage
  USD: { stroke: "#38BDF8", fill: "#38BDF8" }, // sky-400
  EUR: { stroke: "#A78BFA", fill: "#A78BFA" }, // violet-400
  DEFAULT: { stroke: "#94A3B8", fill: "#94A3B8" }, // slate-400
};

function currencyColor(code) {
  return CURRENCY_COLORS[code] ?? CURRENCY_COLORS.DEFAULT;
}

function formatAmount(value, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatAxisDate(dateStr, granularity) {
  try {
    const d = parseISO(dateStr);
    if (granularity === "month") return format(d, "MMM yyyy");
    if (granularity === "week") return format(d, "MMM d");
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

function CustomTooltip({ active, payload, label, currencies }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-charcoal-muted text-xs mb-2">
        {(() => {
          try {
            return format(parseISO(label), "MMM d, yyyy");
          } catch {
            return label;
          }
        })()}
      </p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="inline-block w-2.5 h-2.5 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-charcoal font-medium">
            {formatAmount(entry.value, entry.dataKey)}
          </span>
          <span className="text-charcoal-muted">{entry.dataKey}</span>
        </div>
      ))}
    </div>
  );
}

export default function RevenueOverTimeChart({
  data,
  currencies,
  loading,
  granularity = "day",
}) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <Card className="p-5">
        <div className="h-64 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        </div>
      </Card>
    );
  }

  const hasData = data.some((d) => currencies.some((c) => d[c] > 0));

  return (
    <Card className="p-5">
      <h3 className="text-sm font-semibold text-charcoal mb-4">
        {t("admin.dashboard.analytics.revenueOverTime")}
      </h3>
      {!hasData ? (
        <div className="h-52 flex items-center justify-center text-charcoal-muted text-sm">
          {t("admin.dashboard.analytics.noData")}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
          >
            <defs>
              {currencies.map((cur) => (
                <linearGradient
                  key={cur}
                  id={`grad-${cur}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={currencyColor(cur).fill}
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor={currencyColor(cur).fill}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="date"
              tickFormatter={(d) => formatAxisDate(d, granularity)}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={(v) => {
                if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
                return v;
              }}
              tick={{ fontSize: 11, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              content={
                <CustomTooltip
                  currencies={currencies}
                  granularity={granularity}
                />
              }
            />
            {currencies.length > 1 && (
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
            )}
            {currencies.map((cur) => (
              <Area
                key={cur}
                type="monotone"
                dataKey={cur}
                name={cur}
                stroke={currencyColor(cur).stroke}
                strokeWidth={2}
                fill={`url(#grad-${cur})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
