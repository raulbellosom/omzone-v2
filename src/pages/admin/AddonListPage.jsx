import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Package, Search } from "lucide-react";
import { useAddons, updateAddon } from "@/hooks/useAddons";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import AdminSelect from "@/components/common/AdminSelect";
import AddonTypeChip from "@/components/admin/addons/AddonTypeChip";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const ADDON_TYPE_LABELS = {
  service: "admin.addonTypes.service",
  transport: "admin.addonTypes.transport",
  food: "admin.addonTypes.food",
  accommodation: "admin.addonTypes.lodging",
  equipment: "admin.addonTypes.equipment",
  other: "admin.addonTypes.other",
};

const PRICE_TYPE_LABELS = {
  fixed: "admin.priceTypes.fixed",
  "per-person": "admin.priceTypes.perPerson",
  "per-day": "admin.priceTypes.perDay",
  "per-unit": "admin.priceTypes.perUnit",
  quote: "admin.priceTypes.quote",
};

const TYPE_FILTER_OPTIONS = [
  { value: "", i18nKey: "admin.addonTypes.all" },
  { value: "service", i18nKey: "admin.addonTypes.service" },
  { value: "transport", i18nKey: "admin.addonTypes.transport" },
  { value: "food", i18nKey: "admin.addonTypes.food" },
  { value: "accommodation", i18nKey: "admin.addonTypes.lodging" },
  { value: "equipment", i18nKey: "admin.addonTypes.equipment" },
  { value: "other", i18nKey: "admin.addonTypes.other" },
];

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
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Precio</th>
            <th className="px-4 py-3 font-medium">Modelo</th>
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
            <div className="h-3 w-20 rounded bg-warm-gray" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function EmptyState({ t, isAdmin }) {
  return (
    <Card className="p-10 text-center">
      <Package className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-charcoal mb-1">
        {t("admin.addons.emptyTitle")}
      </h2>
      <p className="text-sm text-charcoal-muted mb-4">
        {t("admin.addons.emptyMessage")}
      </p>
      {isAdmin && (
        <Link to={ROUTES.ADMIN_ADDON_NEW}>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            {t("admin.addons.emptyButton")}
          </Button>
        </Link>
      )}
    </Card>
  );
}

export default function AddonListPage() {
  const [search, setSearch] = useState("");
  const [addonType, setAddonType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toggling, setToggling] = useState(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const {
    data: addons,
    loading,
    error,
    refetch,
  } = useAddons({
    search: search.trim(),
    addonType,
    status: statusFilter,
  });

  async function toggleStatus(addon) {
    setToggling(addon.$id);
    try {
      await updateAddon(addon.$id, {
        status: addon.status === "active" ? "inactive" : "active",
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
            {t("admin.addons.title")}
          </h1>
          <p className="text-sm text-charcoal-subtle mt-0.5">
            {t("admin.addons.subtitle")}
          </p>
        </div>
        {isAdmin && (
          <Link to={ROUTES.ADMIN_ADDON_NEW}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("admin.addons.newAddon")}
              </span>
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-44 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.addons.searchPlaceholder")}
            className="pl-9"
          />
        </div>
        <AdminSelect
          value={addonType}
          onChange={setAddonType}
          options={TYPE_FILTER_OPTIONS.map((o) => ({
            ...o,
            label: t(o.i18nKey),
          }))}
          fullWidth={false}
        />
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

      {/* Empty */}
      {!loading && !error && addons.length === 0 && (
        <EmptyState t={t} isAdmin={isAdmin} />
      )}

      {/* Loading skeleton */}
      {loading && (
        <>
          <TableSkeleton />
          <CardSkeleton />
        </>
      )}

      {/* Desktop table */}
      {!loading && addons.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-warm-gray/60 border-b border-sand-dark text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.addons.name")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.addons.type")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.addons.price")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.addons.model")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.addons.status")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted text-right">
                  {t("admin.addons.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-dark">
              {addons.map((addon) => {
                const editUrl = `/admin/addons/${addon.$id}/edit`;
                return (
                  <tr key={addon.$id} className="group hover:bg-warm-gray/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={editUrl}
                        className="font-medium text-charcoal hover:text-sage-dark hover:underline underline-offset-2 transition-colors"
                      >
                        {addon.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <AddonTypeChip type={addon.addonType} />
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted whitespace-nowrap">
                      {formatPrice(addon.basePrice, addon.currency)}
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted">
                      {t(PRICE_TYPE_LABELS[addon.priceType]) || addon.priceType}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatus(addon)}
                        disabled={toggling === addon.$id}
                        className="focus:outline-none"
                      >
                        <Badge
                          variant={addon.status === "active" ? "success" : "warm"}
                          className="cursor-pointer"
                        >
                          {toggling === addon.$id
                            ? "..."
                            : addon.status === "active"
                              ? t("admin.statuses.active")
                              : t("admin.statuses.inactive")}
                        </Badge>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <Link
                        to={editUrl}
                        className="inline-flex p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                        aria-label={t("admin.addons.editAriaLabel")}
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
      {!loading && addons.length > 0 && (
        <div className="md:hidden space-y-3">
          {addons.map((addon) => (
            <Card
              key={addon.$id}
              className="p-4 space-y-2 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => navigate(`/admin/addons/${addon.$id}/edit`)}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-charcoal truncate">
                  {addon.name}
                </span>
                <Badge variant={addon.status === "active" ? "success" : "warm"}>
                  {addon.status === "active"
                    ? t("admin.statuses.active")
                    : t("admin.statuses.inactive")}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-charcoal-muted">
                <span>{t(ADDON_TYPE_LABELS[addon.addonType])}</span>
                <span>{formatPrice(addon.basePrice, addon.currency)}</span>
                <span>{t(PRICE_TYPE_LABELS[addon.priceType])}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
