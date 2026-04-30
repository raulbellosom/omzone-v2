import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, CreditCard } from "lucide-react";
import { useUserPasses } from "@/hooks/useUserPasses";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/hooks/useLanguage";

const STATUS_OPTIONS = [
  { value: "", i18nKey: "admin.userPasses.all" },
  { value: "active", i18nKey: "admin.userPasses.active" },
  { value: "exhausted", i18nKey: "admin.userPasses.depleted" },
  { value: "expired", i18nKey: "admin.userPasses.expired" },
  { value: "cancelled", i18nKey: "admin.userPasses.cancelled" },
];

const STATUS_BADGE = {
  active: { variant: "success", i18nKey: "admin.userPasses.active" },
  exhausted: { variant: "warm", i18nKey: "admin.userPasses.depleted" },
  expired: { variant: "default", i18nKey: "admin.userPasses.expired" },
  cancelled: { variant: "destructive", i18nKey: "admin.userPasses.cancelled" },
};

function parseSnapshot(snapshotText) {
  try {
    return JSON.parse(snapshotText);
  } catch {
    return null;
  }
}

function ProgressBar({ used, total }) {
  const pct = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-warm-gray overflow-hidden max-w-30">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            pct >= 100 ? "bg-red-400" : pct >= 75 ? "bg-amber-400" : "bg-sage",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-charcoal-muted whitespace-nowrap">
        {used}/{total}
      </span>
    </div>
  );
}

function TableSkeleton() {
  const { t } = useLanguage();
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-sand-dark bg-warm-gray/60">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.userPasses.pass")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.userPasses.user")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.userPasses.credits")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.userPasses.expires")}
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
              {t("admin.userPasses.status")}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-dark">
          {[1, 2, 3, 4].map((i) => (
            <tr key={i}>
              {[1, 2, 3, 4, 5].map((j) => (
                <td key={j} className="px-4 py-3">
                  <div
                    className="h-4 rounded bg-warm-gray animate-pulse"
                    style={{ width: `${50 + j * 8}%` }}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="md:hidden space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4 animate-pulse space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 rounded bg-warm-gray" />
            <div className="h-5 w-16 rounded-full bg-warm-gray" />
          </div>
          <div className="h-2 w-24 rounded bg-warm-gray" />
        </Card>
      ))}
    </div>
  );
}

export default function UserPassListPage() {
  const { t } = useLanguage();
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const {
    data: userPasses,
    loading,
    error,
  } = useUserPasses({
    userId: userSearch.trim(),
    status: statusFilter,
  });

  function getStatusBadge(status) {
    const cfg = STATUS_BADGE[status] ?? { variant: "default", i18nKey: null };
    return (
      <Badge variant={cfg.variant}>
        {cfg.i18nKey ? t(cfg.i18nKey) : status}
      </Badge>
    );
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            {t("admin.userPasses.title")}
          </h1>
          <p className="text-sm text-charcoal-subtle mt-0.5">
            {t("admin.userPasses.subtitle")}
          </p>
        </div>
        <Link to={ROUTES.ADMIN_PASSES}>
          <Button size="sm" variant="ghost">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t("admin.userPasses.backToPasses")}
            </span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-44 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
          <Input
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder={t("admin.userPasses.searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <AdminSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS.map((o) => ({ ...o, label: t(o.i18nKey) }))}
          fullWidth={false}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && userPasses.length === 0 && (
        <Card className="p-10 text-center">
          <CreditCard className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-charcoal mb-1">
            {t("admin.userPasses.emptyTitle")}
          </h2>
          <p className="text-sm text-charcoal-muted">
            {t("admin.userPasses.emptyMessage")}
          </p>
        </Card>
      )}

      {loading && (
        <>
          <TableSkeleton />
          <CardSkeleton />
        </>
      )}

      {/* Desktop table */}
      {!loading && userPasses.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-sand-dark bg-warm-gray/60">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.userPasses.pass")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.userPasses.user")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.userPasses.credits")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.userPasses.expires")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.userPasses.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {userPasses.map((up) => {
                const snap = parseSnapshot(up.passSnapshot);
                return (
                  <tr
                    key={up.$id}
                    className="group border-b border-sand last:border-0 hover:bg-warm-gray/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/user-passes/${up.$id}`)}
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={ROUTES.ADMIN_USER_PASS_DETAIL.replace(":userPassId", up.$id)}
                        className="font-medium text-charcoal hover:text-sage-dark hover:underline underline-offset-2 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {snap?.name ?? up.passId}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted text-xs font-mono truncate max-w-40">
                      {up.userId}
                    </td>
                    <td className="px-4 py-3">
                      <ProgressBar
                        used={up.usedCredits}
                        total={up.totalCredits}
                      />
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted whitespace-nowrap">
                      {formatDate(up.expiresAt)}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(up.status)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {!loading && userPasses.length > 0 && (
        <div className="md:hidden space-y-3">
          {userPasses.map((up) => {
            const snap = parseSnapshot(up.passSnapshot);
            return (
              <Link
                key={up.$id}
                to={`/admin/user-passes/${up.$id}`}
                className="block"
              >
                <Card className="p-4 space-y-2 cursor-pointer hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-charcoal truncate">
                    {snap?.name ?? up.passId}
                  </span>
                  {getStatusBadge(up.status)}
                </div>
                <ProgressBar used={up.usedCredits} total={up.totalCredits} />
                <div className="flex items-center gap-4 text-xs text-charcoal-muted">
                  <span className="font-mono truncate max-w-30">
                    {up.userId}
                  </span>
                  <span>
                    {t("admin.userPasses.expires")}: {formatDate(up.expiresAt)}
                  </span>
                </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
