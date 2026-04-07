import { Link } from "react-router-dom";
import { Badge } from "@/components/common/Badge";
import CreditBar from "./CreditBar";
import { Calendar, ChevronRight } from "lucide-react";

const STATUS_VARIANT = {
  active: "success",
  exhausted: "warm",
  expired: "danger",
  cancelled: "danger",
};

const STATUS_LABEL = {
  active: "Activo",
  exhausted: "Agotado",
  expired: "Vencido",
  cancelled: "Cancelado",
};

function safeParse(str) {
  if (!str) return {};
  try {
    return typeof str === "string" ? JSON.parse(str) : str;
  } catch {
    return {};
  }
}

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysUntil(iso) {
  if (!iso) return null;
  const diff = Math.ceil((new Date(iso) - new Date()) / 86400000);
  return diff;
}

export default function PassCard({ userPass }) {
  const snap = safeParse(userPass.passSnapshot);
  const name = snap.name || snap.passName || "Pase";
  const remaining = userPass.totalCredits - userPass.usedCredits;
  const days = daysUntil(userPass.expiresAt);

  return (
    <Link
      to={`/portal/passes/${userPass.$id}`}
      className="block bg-white rounded-2xl border border-warm-gray-dark/10 shadow-sm hover:shadow-md transition-shadow p-5 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-display font-semibold text-charcoal text-sm leading-snug line-clamp-2 flex-1">
          {name}
        </h3>
        <Badge variant={STATUS_VARIANT[userPass.status] || "default"}>
          {STATUS_LABEL[userPass.status] || userPass.status}
        </Badge>
      </div>

      <CreditBar
        total={userPass.totalCredits}
        used={userPass.usedCredits}
        size="sm"
        showLabel
      />

      <div className="flex items-center justify-between text-xs text-charcoal-muted">
        <span>
          {remaining > 0
            ? `${remaining} crédito${remaining !== 1 ? "s" : ""} disponible${remaining !== 1 ? "s" : ""}`
            : "Sin créditos"}
        </span>
        {days !== null && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {days > 0
              ? `${days} día${days !== 1 ? "s" : ""} restante${days !== 1 ? "s" : ""}`
              : days === 0
                ? "Vence hoy"
                : "Vencido"}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end text-sage text-xs font-medium">
        <span className="inline-flex items-center gap-0.5">
          Ver detalle <ChevronRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
