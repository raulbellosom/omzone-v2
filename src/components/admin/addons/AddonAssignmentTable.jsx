import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";

function formatPrice(amount, currency) {
  if (amount == null) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency || "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AddonAssignmentTable({
  assignments,
  addonsMap,
  onEdit,
  onDelete,
  deleting,
}) {
  const [confirmId, setConfirmId] = useState(null);

  function handleDelete(id) {
    if (confirmId === id) {
      onDelete(id);
      setConfirmId(null);
    } else {
      setConfirmId(id);
    }
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-sand-dark">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-warm-gray/60 text-left text-charcoal-muted">
              <th className="px-4 py-3 font-medium">Addon</th>
              <th className="px-4 py-3 font-medium text-center">Requerido</th>
              <th className="px-4 py-3 font-medium text-center">Por defecto</th>
              <th className="px-4 py-3 font-medium">Precio override</th>
              <th className="px-4 py-3 font-medium text-center">Orden</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sand-dark">
            {assignments.map((a) => {
              const addon = addonsMap[a.addonId];
              return (
                <tr
                  key={a.$id}
                  className="hover:bg-warm-gray/30 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-charcoal">
                    {addon?.name || a.addonId}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {a.isRequired ? (
                      <Badge variant="sage">Sí</Badge>
                    ) : (
                      <span className="text-charcoal-muted">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {a.isDefault ? (
                      <Badge variant="warm">Sí</Badge>
                    ) : (
                      <span className="text-charcoal-muted">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-charcoal-muted">
                    {a.overridePrice != null
                      ? formatPrice(a.overridePrice, addon?.currency)
                      : "Precio base"}
                  </td>
                  <td className="px-4 py-3 text-center text-charcoal-muted">
                    {a.sortOrder ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(a)}
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                        aria-label="Editar asignación"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.$id)}
                        disabled={deleting === a.$id}
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label="Eliminar asignación"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {confirmId === a.$id && (
                      <p className="text-xs text-red-600 mt-1">
                        Clic de nuevo para confirmar
                      </p>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {assignments.map((a) => {
          const addon = addonsMap[a.addonId];
          return (
            <Card key={a.$id} className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium text-charcoal truncate">
                  {addon?.name || a.addonId}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(a)}
                    className="p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                    aria-label="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.$id)}
                    disabled={deleting === a.$id}
                    className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-muted">
                {a.isRequired && <Badge variant="sage">Requerido</Badge>}
                {a.isDefault && <Badge variant="warm">Por defecto</Badge>}
                <span>
                  {a.overridePrice != null
                    ? formatPrice(a.overridePrice, addon?.currency)
                    : "Precio base"}
                </span>
                <span>Orden: {a.sortOrder ?? 0}</span>
              </div>
              {confirmId === a.$id && (
                <p className="text-xs text-red-600">
                  Toca eliminar de nuevo para confirmar
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
