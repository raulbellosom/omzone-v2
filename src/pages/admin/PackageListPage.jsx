import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Pencil,
  Package,
  Search,
  Archive,
  RotateCcw,
} from "lucide-react";
import { usePackages } from "@/hooks/usePackages";
import { useArchive } from "@/hooks/useArchive";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import ConfirmHardDeleteModal from "@/components/admin/ConfirmHardDeleteModal";
import AdminSelect from "@/components/common/AdminSelect";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import env from "@/config/env";

const STATUS_FILTER_OPTIONS = [
  { value: "", i18nKey: "admin.statuses.all" },
  { value: "draft", i18nKey: "admin.statuses.draft" },
  { value: "published", i18nKey: "admin.statuses.published" },
  { value: "__archived__", i18nKey: "admin.archive.archivedTab" },
];

const STATUS_BADGE = {
  draft: { variant: "warm", i18nKey: "admin.statuses.draft" },
  published: { variant: "success", i18nKey: "admin.statuses.published" },
};

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
            <th className="px-4 py-3 font-medium">Precio</th>
            <th className="px-4 py-3 font-medium">Duración</th>
            <th className="px-4 py-3 font-medium">Capacidad</th>
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
      <Package className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-charcoal mb-1">
        {t("admin.packages.emptyTitle")}
      </h2>
      <p className="text-sm text-charcoal-muted mb-4">
        {t("admin.packages.emptyMessage")}
      </p>
      {isAdmin && (
        <Link to={ROUTES.ADMIN_PACKAGE_NEW}>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            {t("admin.packages.emptyButton")}
          </Button>
        </Link>
      )}
    </Card>
  );
}

export default function PackageListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hardDeleteDoc, setHardDeleteDoc] = useState(null);
  const { t } = useLanguage();
  const { isAdmin, isRoot } = useAuth();

  const showArchived = statusFilter === "__archived__";

  const {
    data: packages,
    loading,
    error,
    refetch,
  } = usePackages({
    search: search.trim(),
    status: showArchived ? "" : statusFilter,
    onlyArchived: showArchived,
    includeDrafts: true,
  });

  const {
    archive,
    restore,
    hardDelete,
    loading: archiving,
  } = useArchive(env.collectionPackages, refetch);

  const handleArchive = useCallback(
    (id) => archive({ documentId: id }),
    [archive],
  );

  const handleRestore = useCallback(
    (id) => restore({ documentId: id }),
    [restore],
  );

  const handleHardDeleteConfirm = useCallback(
    async ({ documentId, confirmationId, reason }) => {
      await hardDelete({ documentId, confirmationId, reason });
      setHardDeleteDoc(null);
    },
    [hardDelete],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-charcoal">
            {t("admin.packages.title")}
          </h1>
          <p className="text-sm text-charcoal-subtle mt-0.5">
            {t("admin.packages.subtitle")}
          </p>
        </div>
        {isAdmin && (
          <Link to={ROUTES.ADMIN_PACKAGE_NEW}>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">
                {t("admin.packages.newPackage")}
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
            placeholder={t("admin.packages.searchPlaceholder")}
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

      {!loading && !error && packages.length === 0 && (
        <EmptyState t={t} isAdmin={isAdmin} />
      )}

      {loading && (
        <>
          <TableSkeleton />
          <CardSkeleton />
        </>
      )}

      {/* Desktop table */}
      {!loading && packages.length > 0 && (
        <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-warm-gray/60 border-b border-sand-dark text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.packages.name")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.packages.price")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.packages.duration")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.packages.capacity")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted">
                  {t("admin.packages.status")}
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-charcoal-muted text-right">
                  {t("admin.packages.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-dark">
              {packages.map((pkg) => {
                const badge = STATUS_BADGE[pkg.status] || STATUS_BADGE.draft;
                const editUrl = `/admin/packages/${pkg.$id}/edit`;
                return (
                  <tr
                    key={pkg.$id}
                    className="group hover:bg-warm-gray/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={editUrl}
                        className="font-medium text-charcoal hover:text-sage-dark hover:underline underline-offset-2 transition-colors"
                      >
                        {pkg.name}
                      </Link>
                      {pkg.nameEs && (
                        <div className="text-xs text-charcoal-subtle truncate max-w-xs">
                          {pkg.nameEs}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted whitespace-nowrap">
                      {formatPrice(pkg.totalPrice, pkg.currency)}
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted">
                      {pkg.durationDays
                        ? `${pkg.durationDays} ${t("admin.packages.durationDays")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted">
                      {pkg.capacity
                        ? `${pkg.capacity} ${t("admin.packages.capacityAbbr")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={badge.variant}>{t(badge.i18nKey)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={editUrl}
                          className="inline-flex p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                          aria-label={t("admin.packages.editAriaLabel")}
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        {isAdmin && !pkg.archivedAt && (
                          <button
                            type="button"
                            onClick={() => handleArchive(pkg.$id)}
                            className="inline-flex p-1.5 rounded-lg text-charcoal-muted hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            aria-label={
                              t("admin.packages.archiveButton") || "Archive"
                            }
                          >
                            <Archive className="h-4 w-4" />
                          </button>
                        )}
                        {pkg.archivedAt && (
                          <button
                            type="button"
                            onClick={() => handleRestore(pkg.$id)}
                            className="inline-flex p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                            aria-label={t("admin.archive.restore")}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </button>
                        )}
                        {isRoot && pkg.archivedAt && (
                          <button
                            type="button"
                            onClick={() => setHardDeleteDoc(pkg)}
                            className="inline-flex p-1.5 rounded-lg text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Hard delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14H6L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4h6v2" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile cards */}
      {!loading && packages.length > 0 && (
        <div className="md:hidden space-y-3">
          {packages.map((pkg) => {
            const badge = STATUS_BADGE[pkg.status] || STATUS_BADGE.draft;
            return (
              <Link
                key={pkg.$id}
                to={`/admin/packages/${pkg.$id}/edit`}
                className="block"
              >
                <Card className="p-4 space-y-2 cursor-pointer hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-charcoal truncate">
                      {pkg.name}
                    </span>
                    <Badge variant={badge.variant}>{t(badge.i18nKey)}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-charcoal-muted">
                    <span>{formatPrice(pkg.totalPrice, pkg.currency)}</span>
                    {pkg.durationDays && (
                      <span>
                        {pkg.durationDays} {t("admin.packages.durationDays")}
                      </span>
                    )}
                    {pkg.capacity && (
                      <span>
                        {pkg.capacity} {t("admin.packages.capacityAbbr")}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <ConfirmHardDeleteModal
        open={!!hardDeleteDoc}
        document={hardDeleteDoc}
        collectionId={env.collectionPackages}
        loading={archiving}
        onConfirm={handleHardDeleteConfirm}
        onCancel={() => setHardDeleteDoc(null)}
      />
    </div>
  );
}
