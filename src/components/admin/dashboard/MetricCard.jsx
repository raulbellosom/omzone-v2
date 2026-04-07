import { Card } from "@/components/common/Card";
import { cn } from "@/lib/utils";

export default function MetricCard({ title, value, description, icon: Icon, className }) {
  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-charcoal-subtle uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-2xl font-semibold text-charcoal truncate">
            {value}
          </p>
          {description && (
            <p className="text-sm text-charcoal-muted mt-1">{description}</p>
          )}
        </div>
        {Icon && (
          <div className="rounded-lg bg-sage/10 p-2 shrink-0">
            <Icon className="h-5 w-5 text-sage" />
          </div>
        )}
      </div>
    </Card>
  );
}
