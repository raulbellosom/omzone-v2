import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Card } from "@/components/common/Card";
import { useLanguage } from "@/hooks/useLanguage";

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
  const { t } = useLanguage();

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
              <th className="px-4 py-3 font-medium">
                {t("admin.addonAssignment.tableAddon")}
              </th>
              <th className="px-4 py-3 font-medium text-center">
                {t("admin.addonAssignment.tableRequired")}
              </th>
              <th className="px-4 py-3 font-medium text-center">
                {t("admin.addonAssignment.tableDefault")}
              </th>
              <th className="px-4 py-3 font-medium">
                {t("admin.addonAssignment.tableOverridePrice")}
              </th>
              <th className="px-4 py-3 font-medium text-center">
                {t("admin.addonAssignment.tableOrder")}
              </th>
              <th className="px-4 py-3 font-medium text-right">
                {t("admin.addonAssignment.tableActions")}
              </th>
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
                      <Badge variant="sage">
                        {t("admin.addonAssignment.yes")}
                      </Badge>
                    ) : (
                      <span className="text-charcoal-muted">
                        {t("admin.addonAssignment.no")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {a.isDefault ? (
                      <Badge variant="warm">
                        {t("admin.addonAssignment.yes")}
                      </Badge>
                    ) : (
                      <span className="text-charcoal-muted">
                        {t("admin.addonAssignment.no")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-charcoal-muted">
                    {a.overridePrice != null
                      ? formatPrice(a.overridePrice, addon?.currency)
                      : t("admin.addonAssignment.basePrice")}
                  </td>
                  <td className="px-4 py-3 text-center text-charcoal-muted">
                    {a.sortOrder ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(a)}
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-sage hover:bg-sage/10 transition-colors"
                        aria-label={t("admin.addonAssignment.editAriaLabel")}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(a.$id)}
                        disabled={deleting === a.$id}
                        className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={t("admin.addonAssignment.deleteAriaLabel")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {confirmId === a.$id && (
                      <p className="text-xs text-red-600 mt-1">
                        {t("admin.addonAssignment.confirmDelete")}
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
                    aria-label={t("admin.addonAssignment.editMobileLabel")}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.$id)}
                    disabled={deleting === a.$id}
                    className="p-1.5 rounded-lg text-charcoal-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                    aria-label={t("admin.addonAssignment.deleteMobileLabel")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-charcoal-muted">
                {a.isRequired && (
                  <Badge variant="sage">
                    {t("admin.addonAssignment.requiredBadge")}
                  </Badge>
                )}
                {a.isDefault && (
                  <Badge variant="warm">
                    {t("admin.addonAssignment.defaultBadge")}
                  </Badge>
                )}
                <span>
                  {a.overridePrice != null
                    ? formatPrice(a.overridePrice, addon?.currency)
                    : t("admin.addonAssignment.basePrice")}
                </span>
                <span>
                  {t("admin.addonAssignment.tableOrder")}: {a.sortOrder ?? 0}
                </span>
              </div>
              {confirmId === a.$id && (
                <p className="text-xs text-red-600">
                  {t("admin.addonAssignment.confirmDeleteMobile")}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
