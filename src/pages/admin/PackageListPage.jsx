import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Package, Search } from "lucide-react";
import { usePackages } from "@/hooks/usePackages";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "draft", label: "Borrador" },
  { value: "published", label: "Publicados" },
  { value: "archived", label: "Archivados" },
];

const STATUS_BADGE = {
  draft: { variant: "warm", label: "Borrador" },
  published: { variant: "success", label: "Publicado" },
  archived: { variant: "default", label: "Archivado" },
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

function EmptyState() {
  return (
    <Card className="p-10 text-center">
      <Package className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-charcoal mb-1">Sin paquetes</h2>
      <p className="text-sm text-charcoal-muted mb-4">
        Crea el primer paquete de experiencias para ofrecer retiros, estancias o
        combinaciones de sesiones.
      </p>
      <Link to={ROUTES.ADMIN_PACKAGE_NEW}>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Crear primer paquete
        </Button>
      </Link>
    </Card>
  );
}

export default function PackageListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();

  const {
    data: packages,
    loading,
    error,
  } = usePackages({
    search: search.trim(),
    status: statusFilter,
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-charcoal">Paquetes</h1>
          <p className="text-sm text-charcoal-subtle mt-0.5">
            Paquetes de experiencias, retiros y estancias
          </p>
        </div>
        <Link to={ROUTES.ADMIN_PACKAGE_NEW}>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo paquete</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-9"
          />
        </div>
        <AdminSelect
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS}
          fullWidth={false}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {!loading && !error && packages.length === 0 && <EmptyState />}

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
              {packages.map((pkg) => {
                const badge = STATUS_BADGE[pkg.status] || STATUS_BADGE.draft;
                return (
                  <tr
                    key={pkg.$id}
                    className="hover:bg-warm-gray/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-charcoal">
                        {pkg.name}
                      </div>
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
                      {pkg.durationDays ? `${pkg.durationDays} días` : "—"}
                    </td>
                    <td className="px-4 py-3 text-charcoal-muted">
                      {pkg.capacity ? `${pkg.capacity} pers.` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() =>
                          navigate(`/admin/packages/${pkg.$id}/edit`)
                        }
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                        aria-label="Editar paquete"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
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
              <Card
                key={pkg.$id}
                className="p-4 space-y-2 cursor-pointer hover:shadow-sm transition-shadow"
                onClick={() => navigate(`/admin/packages/${pkg.$id}/edit`)}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-charcoal truncate">
                    {pkg.name}
                  </span>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-charcoal-muted">
                  <span>{formatPrice(pkg.totalPrice, pkg.currency)}</span>
                  {pkg.durationDays && <span>{pkg.durationDays} días</span>}
                  {pkg.capacity && <span>{pkg.capacity} pers.</span>}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
