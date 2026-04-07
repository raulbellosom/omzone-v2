import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { databases } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import { usePassConsumptions } from "@/hooks/usePassConsumptions";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import CreditBar from "@/components/portal/passes/CreditBar";
import ConsumptionHistory from "@/components/portal/passes/ConsumptionHistory";
import { ROUTES } from "@/constants/routes";
import env from "@/config/env";
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  ShoppingBag,
  Zap,
} from "lucide-react";

const DB = env.appwriteDatabaseId;
const COL_USER_PASSES = env.collectionUserPasses;

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
    month: "long",
    year: "numeric",
  });
}

function daysUntil(iso) {
  if (!iso) return null;
  return Math.ceil((new Date(iso) - new Date()) / 86400000);
}

function DetailRow({ label, children }) {
  if (!children) return null;
  return (
    <div className="flex justify-between items-start py-2 border-b border-warm-gray-dark/10 last:border-0">
      <span className="text-sm text-charcoal-muted">{label}</span>
      <span className="text-sm font-medium text-charcoal text-right">
        {children}
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-6 w-32 rounded bg-warm-gray/40" />
      <div className="bg-white rounded-2xl p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-warm-gray/40 mx-auto" />
        <div className="h-4 w-full rounded-full bg-warm-gray/30" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-4 w-24 rounded bg-warm-gray/30" />
            <div className="h-4 w-32 rounded bg-warm-gray/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PassDetailPage() {
  const { userPassId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userPass, setUserPass] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    data: consumptions,
    loading: consLoading,
  } = usePassConsumptions({ userPassId });

  useEffect(() => {
    if (!userPassId) return;

    setLoading(true);
    databases
      .getDocument(DB, COL_USER_PASSES, userPassId)
      .then((doc) => {
        if (doc.userId !== user?.$id) {
          setError("Pase no encontrado");
          return;
        }
        setUserPass(doc);
      })
      .catch(() => setError("Pase no encontrado"))
      .finally(() => setLoading(false));
  }, [userPassId, user?.$id]);

  if (loading) return <LoadingSkeleton />;

  if (error || !userPass) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-charcoal-muted">
          {error || "Pase no encontrado"}
        </p>
        <Button
          variant="outline"
          onClick={() => navigate(ROUTES.PORTAL_PASSES)}
        >
          Volver a Pases
        </Button>
      </div>
    );
  }

  const snap = safeParse(userPass.passSnapshot);
  const name = snap.name || snap.passName || "Pase";
  const remaining = Math.max(0, userPass.totalCredits - userPass.usedCredits);
  const days = daysUntil(userPass.expiresAt);
  const canUse = userPass.status === "active" && remaining > 0;

  // Parse valid experience IDs from snapshot
  let validExpNames = [];
  if (snap.validExperienceNames) {
    validExpNames = Array.isArray(snap.validExperienceNames)
      ? snap.validExperienceNames
      : [];
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(ROUTES.PORTAL_PASSES)}
        className="inline-flex items-center gap-1.5 text-sm text-charcoal-muted hover:text-charcoal transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        Mis Pases
      </button>

      {/* Main card */}
      <div className="bg-white rounded-2xl border border-warm-gray-dark/10 shadow-sm p-4 sm:p-6 md:p-8 space-y-6">
        {/* Title + status */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl md:text-2xl font-display font-bold text-charcoal">
            {name}
          </h1>
          <Badge variant={STATUS_VARIANT[userPass.status] || "default"}>
            {STATUS_LABEL[userPass.status] || userPass.status}
          </Badge>
        </div>

        {/* Credit bar — large */}
        <div className="max-w-sm mx-auto">
          <CreditBar
            total={userPass.totalCredits}
            used={userPass.usedCredits}
            size="lg"
            showLabel
          />
        </div>

        {/* Details */}
        <div className="max-w-sm mx-auto space-y-0">
          <DetailRow label="Créditos totales">
            {userPass.totalCredits}
          </DetailRow>
          <DetailRow label="Créditos usados">
            {userPass.usedCredits}
          </DetailRow>
          <DetailRow label="Créditos restantes">
            {remaining}
          </DetailRow>
          {userPass.$createdAt && (
            <DetailRow label="Activado">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(userPass.$createdAt)}
              </span>
            </DetailRow>
          )}
          {userPass.expiresAt && (
            <DetailRow label="Vencimiento">
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(userPass.expiresAt)}
                {days !== null && days > 0 && (
                  <span className="text-xs text-charcoal-muted ml-1">
                    ({days} día{days !== 1 ? "s" : ""})
                  </span>
                )}
                {days !== null && days <= 0 && (
                  <span className="text-xs text-red-600 ml-1">Vencido</span>
                )}
              </span>
            </DetailRow>
          )}
          {!userPass.expiresAt && (
            <DetailRow label="Vencimiento">Sin vencimiento</DetailRow>
          )}
        </div>

        {/* Valid experiences */}
        {validExpNames.length > 0 && (
          <div className="max-w-sm mx-auto">
            <h3 className="text-xs font-semibold text-charcoal-muted uppercase tracking-wider mb-2">
              Experiencias válidas
            </h3>
            <ul className="space-y-1">
              {validExpNames.map((name, i) => (
                <li
                  key={i}
                  className="text-sm text-charcoal flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
                  {name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Order link */}
        {userPass.orderId && (
          <div className="text-center">
            <Link
              to={`/portal/orders/${userPass.orderId}`}
              className="inline-flex items-center gap-1.5 text-xs text-sage font-medium hover:underline"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              Ver orden asociada
            </Link>
          </div>
        )}

        {/* CTA: Use pass */}
        {canUse && (
          <div className="text-center pt-2">
            <Link to={`/portal/passes/${userPass.$id}/use`}>
              <Button size="md" className="inline-flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Usar pase
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Consumption history */}
      <div className="bg-white rounded-2xl border border-warm-gray-dark/10 shadow-sm p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-charcoal">
          Historial de consumos
        </h2>
        <ConsumptionHistory
          consumptions={consumptions}
          loading={consLoading}
        />
      </div>
    </div>
  );
}
