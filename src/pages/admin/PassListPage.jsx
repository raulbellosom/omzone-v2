import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Pencil, Ticket, Search, Users } from "lucide-react";
import { usePasses, updatePass } from "@/hooks/usePasses";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import AdminSelect from "@/components/common/AdminSelect";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const STATUS_FILTER_OPTIONS = [
  { value: "", i18nKey: "admin.statuses.allActive" },
  { value: "active", i18nKey: "admin.statuses.activeOnly" },
  { value: "inactive", i18nKey: "admin.statuses.inactiveOnly" },
];

function formatPrice(amount, currency) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function TableSkeleton() {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-warm-gray/60 text-left text-charcoal-muted">
            <th className="px-4 py-3 font-medium">Nombre</th>
            <th className="px-4 py-3 font-medium">Créditos</th>
            <th className="px-4 py-3 font-medium">Precio</th>
            <th className="px-4 py-3 font-medium">Vigencia</th>
            <th className="px-4 py-3 font-medium">Estado</th>
            <th className="px-4 py-3 font-medium text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-sand-dark">
          {[1, 2, 3, 4].map((i) => (
            <tr key={i}>
              {[1, 2, 3, 4, 5, 6].map((j) => (
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
          <div className="flex gap-4">
            <div className="h-3 w-20 rounded bg-warm-gray" />
            <div className="h-3 w-16 rounded bg-warm-gray" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ t, isAdmin }) {
  return (
    <Card className="p-10 text-center">
      <Ticket className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-charcoal mb-1">
        {t("admin.passes.emptyTitle")}
      </h2>
      <p className="text-sm text-charcoal-muted mb-4">
        {t("admin.passes.emptyMessage")}
      </p>
      {isAdmin && (
        <Link to={ROUTES.ADMIN_PASS_NEW}>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            {t("admin.passes.emptyButton")}
          </Button>
        </Link>
      )}
    </Card>
  );
}

export default function PassListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toggling, setToggling] = useState(null);
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const {
    data: passes,
    loading,
    error,
    refetch,
  } = usePasses({
    search: search.trim(),
    status: statusFilter,
  });

  async function toggleStatus(pass) {
    setToggling(pass.$id);
    try {
      await updatePass(pass.$id, {
        status: pass.status === "active" ? "inactive" : "active",
      });
      refetch();
    } catch {
      // silent
    } finally {
      setToggling(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            {t("admin.passes.title")}
          </h1>
          <p className="text-sm text-charcoal-subtle mt-0.5">
            {t("admin.passes.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={ROUTES.ADMIN_USER_PASSES}>
            <Button size="sm" variant="ghost">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("admin.passes.assignedPasses")}
              </span>
            </Button>
          </Link>
          {isAdmin && (
            <Link to={ROUTES.ADMIN_PASS_NEW}>
              <Button size="sm">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("admin.passes.newPass")}
                </span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-44 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.passes.searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <AdminSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS.map((o) => ({
            ...o,
            label: t(o.i18nKey),
          }))}
          fullWidth={false}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && passes.length === 0 && (
        <EmptyState t={t} isAdmin={isAdmin} />
      )}

      {loading && (
        <>
          <TableSkeleton />
          <CardSkeleton />
        </>
      )}

      {/* Desktop table */}
      {!loading && passes.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-warm-gray/60 border-b border-sand-dark text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.passes.name")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.passes.credits")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.passes.price")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.passes.validity")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.passes.status")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted text-right">
                  {t("admin.passes.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-dark">
              {passes.map((pass) => {
                const editUrl = `/admin/passes/${pass.$id}/edit`;
                return (
                  <tr key={pass.$id} className="group hover:bg-warm-gray/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={editUrl}
                        className="font-medium text-charcoal hover:text-sage-dark hover:underline underline-offset-2 transition-colors"
                      >
                        {pass.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted">
                      {pass.totalCredits} {t("admin.passes.creditsSuffix")}
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted whitespace-nowrap">
                      {formatPrice(pass.basePrice, pass.currency)}
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted">
                      {pass.validityDays
                        ? `${pass.validityDays} ${t("admin.packages.durationDays")}`
                        : t("admin.passes.noExpiry")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(pass)}
                        disabled={toggling === pass.$id}
                        className="focus:outline-none"
                      >
                        <Badge
                          variant={pass.status === "active" ? "success" : "warm"}
                          className="cursor-pointer"
                        >
                          {toggling === pass.$id
                            ? "..."
                            : pass.status === "active"
                              ? t("admin.statuses.active")
                              : t("admin.statuses.inactive")}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <Link
                        to={editUrl}
                        className="inline-flex p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                        aria-label={t("admin.passes.editAriaLabel")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {!loading && passes.length > 0 && (
        <div className="md:hidden space-y-3">
          {passes.map((pass) => (
            <Link
              key={pass.$id}
              to={`/admin/passes/${pass.$id}/edit`}
              className="block"
            >
              <Card className="p-4 space-y-2 cursor-pointer hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-charcoal truncate">
                  {pass.name}
                </span>
                <Badge variant={pass.status === "active" ? "success" : "warm"}>
                  {pass.status === "active"
                    ? t("admin.statuses.active")
                    : t("admin.statuses.inactive")}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-charcoal-muted">
                <span>
                  {pass.totalCredits} {t("admin.passes.creditsSuffix")}
                </span>
                <span>{formatPrice(pass.basePrice, pass.currency)}</span>
                <span>
                  {pass.validityDays
                    ? `${pass.validityDays} ${t("admin.packages.durationDays")}`
                    : t("admin.passes.noExpiry")}
                </span>
              </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
