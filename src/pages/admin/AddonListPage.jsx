import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Pencil, Package, Search } from "lucide-react";
import { useAddons, updateAddon } from "@/hooks/useAddons";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { Input } from "@/components/common/Input";
import AdminSelect from "@/components/common/AdminSelect";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const ADDON_TYPE_LABELS = {
  service: "Servicio",
  transport: "Transporte",
  food: "Alimentos",
  accommodation: "Hospedaje",
  equipment: "Equipo",
  other: "Otro",
};

const PRICE_TYPE_LABELS = {
  fixed: "Fijo",
  "per-person": "Por persona",
  "per-day": "Por día",
  "per-unit": "Por unidad",
  quote: "Cotización",
};

const TYPE_FILTER_OPTIONS = [
  { value: "", label: "Todos los tipos" },
  { value: "service", label: "Servicio" },
  { value: "transport", label: "Transporte" },
  { value: "food", label: "Alimentos" },
  { value: "accommodation", label: "Hospedaje" },
  { value: "equipment", label: "Equipo" },
  { value: "other", label: "Otro" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
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

function EmptyState() {
  return (
    <Card className="p-10 text-center">
      <Package className="h-10 w-10 text-charcoal-muted mx-auto mb-3" />
      <h2 className="text-lg font-semibold text-charcoal mb-1">Sin addons</h2>
      <p className="text-sm text-charcoal-muted mb-4">
        Crea el primer addon para empezar a ofrecerlos en tus experiencias.
      </p>
      <Link to={ROUTES.ADMIN_ADDON_NEW}>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Crear primer addon
        </Button>
      </Link>
    </Card>
  );
}

export default function AddonListPage() {
  const [search, setSearch] = useState("");
  const [addonType, setAddonType] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toggling, setToggling] = useState(null);
  const navigate = useNavigate();

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
          <h1 className="text-xl font-semibold text-charcoal">Addons</h1>
          <p className="text-sm text-charcoal-subtle mt-0.5">
            Complementos disponibles para experiencias
          </p>
        </div>
        <Link to={ROUTES.ADMIN_ADDON_NEW}>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo addon</span>
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
          value={addonType}
          onChange={setAddonType}
          options={TYPE_FILTER_OPTIONS}
          fullWidth={false}
        />
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

      {/* Empty */}
      {!loading && !error && addons.length === 0 && <EmptyState />}

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
              {addons.map((addon) => (
                <tr
                  key={addon.$id}
                  className="hover:bg-warm-gray/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-charcoal">
                    {addon.name}
                  </td>
                  <td className="px-4 py-3 text-charcoal-muted">
                    {ADDON_TYPE_LABELS[addon.addonType] || addon.addonType}
                  </td>
                  <td className="px-4 py-3 text-charcoal-muted whitespace-nowrap">
                    {formatPrice(addon.basePrice, addon.currency)}
                  </td>
                  <td className="px-4 py-3 text-charcoal-muted">
                    {PRICE_TYPE_LABELS[addon.priceType] || addon.priceType}
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
                            ? "Activo"
                            : "Inactivo"}
                      </Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() =>
                        navigate(`/admin/addons/${addon.$id}/edit`)
                      }
                      className="p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                      aria-label="Editar addon"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
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
                  {addon.status === "active" ? "Activo" : "Inactivo"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-charcoal-muted">
                <span>{ADDON_TYPE_LABELS[addon.addonType]}</span>
                <span>{formatPrice(addon.basePrice, addon.currency)}</span>
                <span>{PRICE_TYPE_LABELS[addon.priceType]}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
