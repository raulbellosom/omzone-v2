import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Settings2 } from "lucide-react";
import { useUserPass, updateUserPass } from "@/hooks/useUserPasses";
import {
  usePassConsumptions,
  createConsumption,
} from "@/hooks/usePassConsumptions";
import CreditAdjustForm from "@/components/admin/passes/CreditAdjustForm";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

const STATUS_BADGE = {
  active: { variant: "success", i18nKey: "admin.userPasses.active" },
  exhausted: { variant: "warm", i18nKey: "admin.userPasses.depleted" },
  expired: { variant: "default", i18nKey: "admin.userPasses.expired" },
  cancelled: { variant: "destructive", i18nKey: "admin.userPasses.cancelled" },
};

function parseSnapshot(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ProgressBar({ used, total }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-charcoal-muted">
        <span>
          {t("admin.userPassDetail.usedOfTotal")
            .replace("{used}", used)
            .replace("{total}", total)}
        </span>
        <span>
          {t("admin.userPassDetail.available").replace("{count}", total - used)}
        </span>
      </div>
      <div className="h-3 rounded-full bg-warm-gray overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 100 ? "bg-red-400" : pct >= 75 ? "bg-amber-400" : "bg-sage",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 max-w-4xl">
      {[1, 2].map((i) => (
        <Card key={i} className="p-5 space-y-4 animate-pulse">
          <div className="h-4 w-32 rounded bg-warm-gray" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-11 rounded-xl bg-warm-gray" />
            <div className="h-11 rounded-xl bg-warm-gray" />
          </div>
        </Card>
      ))}
    </div>
  );
}

export default function UserPassDetailPage() {
  const { t } = useLanguage();
  const { userPassId } = useParams();
  const { data: userPass, loading, error, refetch } = useUserPass(userPassId);
  const {
    data: consumptions,
    loading: loadingConsumptions,
    refetch: refetchConsumptions,
  } = usePassConsumptions({ userPassId });
  const [showAdjust, setShowAdjust] = useState(false);

  async function handleCreditAdjust({ credits, mode, notes }) {
    const newUsed =
      mode === "consume"
        ? userPass.usedCredits + credits
        : userPass.usedCredits - credits;

    // Update user pass credits
    const updatePayload = { usedCredits: newUsed };
    if (newUsed >= userPass.totalCredits) {
      updatePayload.status = "exhausted";
    } else if (
      userPass.status === "exhausted" &&
      newUsed < userPass.totalCredits
    ) {
      updatePayload.status = "active";
    }
    await updateUserPass(userPassId, updatePayload);

    // Create consumption record (positive for consume, negative for restore)
    await createConsumption({
      userPassId,
      creditsUsed: mode === "consume" ? credits : -credits,
      consumedAt: new Date().toISOString(),
      notes:
        notes ||
        `Ajuste manual: ${mode === "consume" ? "consumo" : "restauración"}`,
    });

    setShowAdjust(false);
    refetch();
    refetchConsumptions();
  }

  if (loading) return <LoadingSkeleton />;

  if (error || !userPass) {
    return (
      <div className="max-w-4xl">
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-sm text-red-700">
            {error ?? t("admin.userPassDetail.notFound")}
          </p>
        </Card>
      </div>
    );
  }

  const snap = parseSnapshot(userPass.passSnapshot);
  const statusCfg = STATUS_BADGE[userPass.status] ?? {
    variant: "default",
    i18nKey: null,
  };

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link
            to={ROUTES.ADMIN_USER_PASSES}
            className="inline-flex items-center gap-1 text-sm text-charcoal-muted hover:text-sage transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("admin.userPassDetail.assignedPasses")}
          </Link>
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            {snap?.name ?? userPass.passId}
          </h1>
          <p className="text-xs text-charcoal-muted font-mono mt-0.5">
            {t("admin.userPassDetail.user")} {userPass.userId}
          </p>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowAdjust(true)}
          disabled={userPass.status === "cancelled"}
        >
          <Settings2 className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t("admin.userPassDetail.adjustCredits")}
          </span>
        </Button>
      </div>

      {/* Info cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="p-4 space-y-3">
          <h2 className="text-sm font-medium text-charcoal-muted">
            {t("admin.userPassDetail.passStatus")}
          </h2>
          <Badge variant={statusCfg.variant}>
            {statusCfg.i18nKey ? t(statusCfg.i18nKey) : userPass.status}
          </Badge>
          <ProgressBar
            used={userPass.usedCredits}
            total={userPass.totalCredits}
          />
        </Card>
        <Card className="p-4 space-y-2">
          <h2 className="text-sm font-medium text-charcoal-muted">
            {t("admin.userPassDetail.details")}
          </h2>
          <dl className="text-sm space-y-1">
            <div className="flex justify-between">
              <dt className="text-charcoal-muted">
                {t("admin.userPassDetail.order")}
              </dt>
              <dd className="text-charcoal font-mono text-xs truncate max-w-36">
                {userPass.orderId}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-charcoal-muted">
                {t("admin.userPassDetail.created")}
              </dt>
              <dd className="text-charcoal">
                {formatDate(userPass.$createdAt)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-charcoal-muted">
                {t("admin.userPassDetail.expires")}
              </dt>
              <dd className="text-charcoal">
                {formatDate(userPass.expiresAt)}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      {/* Snapshot info */}
      {snap && (
        <Card className="p-4 space-y-2">
          <h2 className="text-sm font-medium text-charcoal-muted">
            Snapshot del pase al momento de compra
          </h2>
          <dl className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
            {snap.name && (
              <>
                <dt className="text-charcoal-muted">Nombre</dt>
                <dd className="text-charcoal">{snap.name}</dd>
              </>
            )}
            {snap.basePrice != null && (
              <>
                <dt className="text-charcoal-muted">Precio</dt>
                <dd className="text-charcoal">
                  ${snap.basePrice} {snap.currency ?? "MXN"}
                </dd>
              </>
            )}
            {snap.totalCredits != null && (
              <>
                <dt className="text-charcoal-muted">Créditos orig.</dt>
                <dd className="text-charcoal">{snap.totalCredits}</dd>
              </>
            )}
            {snap.validityDays != null && (
              <>
                <dt className="text-charcoal-muted">Vigencia orig.</dt>
                <dd className="text-charcoal">{snap.validityDays} días</dd>
              </>
            )}
          </dl>
        </Card>
      )}

      {/* Consumption history */}
      <Card className="p-4 space-y-3">
        <h2 className="text-sm font-medium text-charcoal-muted">
          Historial de consumos
        </h2>

        {loadingConsumptions && (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-8 rounded bg-warm-gray animate-pulse" />
            ))}
          </div>
        )}

        {!loadingConsumptions && consumptions.length === 0 && (
          <p className="text-sm text-charcoal-muted py-4 text-center">
            Sin consumos registrados
          </p>
        )}

        {!loadingConsumptions && consumptions.length > 0 && (
          <div className="overflow-x-auto -mx-4">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="text-left text-charcoal-muted border-b border-sand-dark">
                  <th className="px-4 py-2 font-medium">Fecha</th>
                  <th className="px-4 py-2 font-medium">Créditos</th>
                  <th className="px-4 py-2 font-medium">Experiencia</th>
                  <th className="px-4 py-2 font-medium">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-dark/50">
                {consumptions.map((c) => (
                  <tr key={c.$id}>
                    <td className="px-4 py-2 text-charcoal-muted whitespace-nowrap">
                      {formatDate(c.consumedAt)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={cn(
                          "font-medium",
                          c.creditsUsed > 0 ? "text-red-600" : "text-green-600",
                        )}
                      >
                        {c.creditsUsed > 0
                          ? `-${c.creditsUsed}`
                          : `+${Math.abs(c.creditsUsed)}`}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-charcoal-muted text-xs truncate max-w-30">
                      {c.experienceId || "—"}
                    </td>
                    <td className="px-4 py-2 text-charcoal-muted text-xs truncate max-w-40">
                      {c.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Credit adjust modal */}
      {showAdjust && (
        <CreditAdjustForm
          userPass={userPass}
          onSubmit={handleCreditAdjust}
          onClose={() => setShowAdjust(false)}
        />
      )}
    </div>
  );
}
