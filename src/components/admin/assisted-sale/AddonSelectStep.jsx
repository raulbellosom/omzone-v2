import { useEffect, useState } from "react";
import { databases, Query } from "@/lib/appwrite";
import { useAddonAssignments } from "@/hooks/useAddonAssignments";
import { useLanguage } from "@/hooks/useLanguage";
import WizardStepWrapper from "./WizardStepWrapper";
import env from "@/config/env";
import { cn } from "@/lib/utils";
import {
  ADDON_PRICE_TYPES_SUPPORTED_IN_CHECKOUT,
  computeAddonChargeQuantity,
} from "@/lib/checkoutRules";

const DB = env.appwriteDatabaseId;
const COL_ADDONS = env.collectionAddons;

function formatPrice(amount, currency = "MXN") {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function AddonCard({ addon, selected, onToggle, t }) {
  const badge = addon.unsupportedPriceType
    ? t("admin.assistedSale.addons.unsupported")
    : addon.priceType === "per-person"
      ? t("admin.assistedSale.addons.perPerson")
      : t("admin.assistedSale.addons.perReservation");
  const badgeClass = addon.unsupportedPriceType
    ? "bg-red-100 text-red-700"
    : "bg-sage/10 text-sage-dark";

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={addon.isRequired || addon.unsupportedPriceType}
      className={cn(
        "w-full text-left rounded-xl border-2 px-4 py-3 transition-all",
        selected
          ? "border-sage bg-sage/5"
          : "border-sand-dark/40 hover:border-sage/50",
        (addon.isRequired || addon.unsupportedPriceType) &&
          "opacity-80 cursor-not-allowed",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-charcoal truncate">{addon.name}</p>
            {addon.isRequired && (
              <span className="text-[10px] uppercase tracking-wider text-sage-dark bg-sage/10 px-1.5 py-0.5 rounded-full font-medium">
                {t("admin.assistedSale.addons.required")}
              </span>
            )}
            <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ${badgeClass}`}>
              {badge}
            </span>
          </div>
          {addon.shortDescription && (
            <p className="text-xs text-charcoal-muted mt-0.5 line-clamp-1">
              {addon.shortDescription}
            </p>
          )}
          {addon.unsupportedPriceType && (
            <p className="text-xs text-red-700 mt-1">
              {t("admin.assistedSale.addons.unsupportedHint")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "text-sm font-semibold",
              selected ? "text-sage-dark" : "text-charcoal",
            )}
          >
            +{formatPrice(addon.effectivePrice, addon.currency)}
          </span>
          {addon.chargeQuantity > 0 && (
            <span className="text-xs text-charcoal-subtle">× {addon.chargeQuantity}</span>
          )}
          <div
            className={cn(
              "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
              selected ? "bg-sage border-sage" : "border-sand-dark",
            )}
          >
            {selected && (
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default function AddonSelectStep({ wizard, setWizardField }) {
  const { t } = useLanguage();
  const { data: assignments, loading: assignmentsLoading } =
    useAddonAssignments(wizard.experience?.$id);
  const [addons, setAddons] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!assignments.length) {
      setAddons([]);
      return;
    }
    setLoading(true);
    const addonIds = assignments.map((assignment) => assignment.addonId).filter(Boolean);
    if (!addonIds.length) {
      setAddons([]);
      setLoading(false);
      return;
    }
    databases
      .listDocuments(DB, COL_ADDONS, [
        Query.equal("$id", addonIds),
        Query.equal("status", "active"),
        Query.limit(50),
      ])
      .then((res) => {
        const byId = new Map(res.documents.map((doc) => [doc.$id, doc]));
        const enriched = assignments
          .map((assignment) => {
            const addon = byId.get(assignment.addonId);
            if (!addon) return null;
            const pricing = computeAddonChargeQuantity(addon.priceType, wizard.quantity);
            return {
              ...addon,
              isRequired: Boolean(assignment.isRequired),
              isDefault: Boolean(assignment.isDefault),
              effectivePrice:
                assignment.overridePrice != null
                  ? assignment.overridePrice
                  : addon.basePrice,
              unsupportedPriceType:
                Boolean(pricing.errorCode) ||
                !ADDON_PRICE_TYPES_SUPPORTED_IN_CHECKOUT.includes(addon.priceType),
              chargeQuantity: pricing.chargeQuantity || 0,
            };
          })
          .filter(Boolean);
        setAddons(enriched);
        const requiredIds = enriched
          .filter((addon) => addon.isRequired)
          .map((addon) => addon.$id);
        const missingRequired = requiredIds.filter(
          (id) => !wizard.selectedAddonIds.includes(id),
        );
        if (missingRequired.length) {
          setWizardField(
            "selectedAddonIds",
            Array.from(new Set([...wizard.selectedAddonIds, ...missingRequired])),
          );
        }
      })
      .catch(() => setAddons([]))
      .finally(() => setLoading(false));
  }, [assignments, setWizardField, wizard.quantity, wizard.selectedAddonIds]);

  function toggle(addonId) {
    const addon = addons.find((item) => item.$id === addonId);
    if (!addon || addon.isRequired || addon.unsupportedPriceType) return;
    const current = wizard.selectedAddonIds;
    if (current.includes(addonId)) {
      setWizardField(
        "selectedAddonIds",
        current.filter((id) => id !== addonId),
      );
    } else {
      setWizardField("selectedAddonIds", [...current, addonId]);
    }
  }

  const isLoading = assignmentsLoading || loading;
  const hasUnsupportedRequired = addons.some(
    (addon) => addon.isRequired && addon.unsupportedPriceType,
  );

  useEffect(() => {
    setWizardField("hasUnsupportedRequiredAddons", hasUnsupportedRequired);
  }, [hasUnsupportedRequired, setWizardField]);

  return (
    <WizardStepWrapper
      title={t("admin.assistedSale.addons.title")}
      description={t("admin.assistedSale.addons.description")}
    >
      {isLoading && (
        <div className="flex justify-center py-6">
          <div className="w-6 h-6 rounded-full border-2 border-sage border-t-transparent animate-spin" />
        </div>
      )}

      {!isLoading && addons.length === 0 && (
        <p className="text-sm text-charcoal-muted py-4">
          {t("admin.assistedSale.addons.noAddons")}
        </p>
      )}

      {hasUnsupportedRequired && (
        <p className="text-xs text-red-700 mb-3">
          {t("admin.assistedSale.addons.requiredUnsupported")}
        </p>
      )}

      <div className="space-y-2">
        {addons.map((addon) => (
          <AddonCard
            key={addon.$id}
            addon={addon}
            selected={wizard.selectedAddonIds.includes(addon.$id)}
            onToggle={() => toggle(addon.$id)}
            t={t}
          />
        ))}
      </div>

      {wizard.selectedAddonIds.length > 0 && (
        <p className="text-xs text-charcoal-muted mt-3">
          {wizard.selectedAddonIds.length} addon
          {wizard.selectedAddonIds.length > 1 ? "s" : ""} seleccionado
          {wizard.selectedAddonIds.length > 1 ? "s" : ""}
        </p>
      )}
    </WizardStepWrapper>
  );
}
