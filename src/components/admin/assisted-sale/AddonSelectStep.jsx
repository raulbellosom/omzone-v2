import { useEffect, useState } from "react";
import { databases, Query } from "@/lib/appwrite";
import { useAddonAssignments } from "@/hooks/useAddonAssignments";
import WizardStepWrapper from "./WizardStepWrapper";
import env from "@/config/env";
import { cn } from "@/lib/utils";

const DB = env.appwriteDatabaseId;
const COL_ADDONS = env.collectionAddons;

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency", currency, minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(amount);
}

function AddonCard({ addon, assignment, selected, onToggle }) {
  const effectivePrice = assignment.overridePrice != null ? assignment.overridePrice : addon.basePrice;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "w-full text-left rounded-xl border-2 px-4 py-3 transition-all",
        selected ? "border-sage bg-sage/5" : "border-sand-dark/40 hover:border-sage/50"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-charcoal truncate">{addon.name}</p>
          {addon.shortDescription && (
            <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-1">{addon.shortDescription}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn(
            "text-sm font-semibold",
            selected ? "text-sage-dark" : "text-charcoal"
          )}>
            +{formatPrice(effectivePrice, addon.currency)}
          </span>
          <div className={cn(
            "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
            selected ? "bg-sage border-sage" : "border-sand-dark"
          )}>
            {selected && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AddonSelectStep({ wizard, setWizardField }) {
  const { data: assignments, loading: assignmentsLoading } = useAddonAssignments(wizard.experience?.$id);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch addon details for each assignment
  useEffect(() => {
    if (assignments.length === 0) { setAddons([]); return; }
    setLoading(true);
    const addonIds = assignments.map((a) => a.addonId).filter(Boolean);
    if (addonIds.length === 0) { setAddons([]); setLoading(false); return; }
    databases
      .listDocuments(DB, COL_ADDONS, [Query.equal("$id", addonIds), Query.equal("status", "active"), Query.limit(50)])
      .then((res) => setAddons(res.documents))
      .catch(() => setAddons([]))
      .finally(() => setLoading(false));
  }, [assignments]);

  function toggle(addonId) {
    const current = wizard.selectedAddonIds;
    if (current.includes(addonId)) {
      setWizardField("selectedAddonIds", current.filter((id) => id !== addonId));
    } else {
      setWizardField("selectedAddonIds", [...current, addonId]);
    }
  }

  const isLoading = assignmentsLoading || loading;

  return (
    <WizardStepWrapper
      title="Complementos (Addons)"
      description="Selecciona los addons opcionales para esta venta. Puedes omitir todos."
    >
      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && addons.length === 0 && (
        <p className="text-sm text-charcoal-muted py-4">
          No hay addons disponibles para esta experiencia.
        </p>
      )}

      <div className="space-y-2">
        {addons.map((addon) => {
          const assignment = assignments.find((a) => a.addonId === addon.$id);
          if (!assignment) return null;
          return (
            <AddonCard
              key={addon.$id}
              addon={addon}
              assignment={assignment}
              selected={wizard.selectedAddonIds.includes(addon.$id)}
              onToggle={() => toggle(addon.$id)}
            />
          );
        })}
      </div>

      {wizard.selectedAddonIds.length > 0 && (
        <p className="text-xs text-charcoal-muted mt-3">
          {wizard.selectedAddonIds.length} addon{wizard.selectedAddonIds.length > 1 ? "s" : ""} seleccionado{wizard.selectedAddonIds.length > 1 ? "s" : ""}
        </p>
      )}
    </WizardStepWrapper>
  );
}
