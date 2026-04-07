/**
 * Visual credit progress bar with color coding.
 * Green (>50%), yellow (25-50%), red (<25% remaining).
 */
export default function CreditBar({
  total,
  used,
  size = "md",
  showLabel = true,
}) {
  const remaining = Math.max(0, total - used);
  const pct = total > 0 ? (remaining / total) * 100 : 0;

  let barColor = "bg-green-500";
  if (pct < 25) barColor = "bg-red-500";
  else if (pct <= 50) barColor = "bg-amber-500";

  const heights = { sm: "h-2", md: "h-3", lg: "h-4" };
  const h = heights[size] || heights.md;

  return (
    <div className="w-full space-y-1">
      <div className={`w-full ${h} bg-warm-gray/30 rounded-full overflow-hidden`}>
        <div
          className={`${h} ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-charcoal-muted">
          {remaining} / {total} créditos restantes
        </p>
      )}
    </div>
  );
}
