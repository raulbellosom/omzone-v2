import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { databases, functions, Query } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;

/**
 * Hook that drives the entire checkout flow.
 *
 * Reads experienceId + pricingTierId from URL search params, loads
 * experience data, manages step state, and invokes the create-checkout Function.
 */
export function useCheckout() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // ─── URL params ─────────────────────────────────────────────────────────
  const experienceId = searchParams.get("experienceId");
  const initialTierId = searchParams.get("pricingTierId");

  // ─── Data loading state ─────────────────────────────────────────────────
  const [experience, setExperience] = useState(null);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [addons, setAddons] = useState([]);
  const [addonAssignments, setAddonAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // ─── Selection state ────────────────────────────────────────────────────
  const [selectedTierId, setSelectedTierId] = useState(initialTierId || "");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // ─── Customer info state ────────────────────────────────────────────────
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // ─── Step management ────────────────────────────────────────────────────
  const [currentStep, setCurrentStep] = useState(0);

  // ─── Submit state ───────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ─── Load experience data ───────────────────────────────────────────────
  useEffect(() => {
    if (!experienceId) {
      setLoading(false);
      setLoadError("missing_params");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError(null);

      try {
        const exp = await databases.getDocument(
          DB,
          env.collectionExperiences,
          experienceId,
        );

        if (exp.status !== "published" || exp.saleMode !== "direct") {
          if (!cancelled) {
            setLoadError("not_available");
            setLoading(false);
          }
          return;
        }

        const now = new Date().toISOString();

        const [tiersRes, slotsRes, assignmentsRes] = await Promise.allSettled([
          databases.listDocuments(DB, env.collectionPricingTiers, [
            Query.equal("experienceId", experienceId),
            Query.equal("isActive", true),
            Query.orderAsc("sortOrder"),
            Query.limit(50),
          ]),
          databases.listDocuments(DB, env.collectionSlots, [
            Query.equal("experienceId", experienceId),
            Query.equal("status", "published"),
            Query.greaterThan("startDatetime", now),
            Query.orderAsc("startDatetime"),
            Query.limit(50),
          ]),
          databases.listDocuments(DB, env.collectionAddonAssignments, [
            Query.equal("experienceId", experienceId),
            Query.orderAsc("sortOrder"),
            Query.limit(50),
          ]),
        ]);

        const tiers =
          tiersRes.status === "fulfilled" ? tiersRes.value.documents : [];
        const slotsData =
          slotsRes.status === "fulfilled" ? slotsRes.value.documents : [];
        const assignments =
          assignmentsRes.status === "fulfilled"
            ? assignmentsRes.value.documents
            : [];

        // Fetch addon details
        let addonsData = [];
        if (assignments.length > 0) {
          const addonIds = assignments
            .map((a) => a.addonId)
            .filter(Boolean);
          if (addonIds.length > 0) {
            try {
              const addonsRes = await databases.listDocuments(
                DB,
                env.collectionAddons,
                [
                  Query.equal("$id", addonIds),
                  Query.equal("status", "active"),
                  Query.limit(50),
                ],
              );
              addonsData = addonsRes.documents;
            } catch {
              // non-fatal
            }
          }
        }

        if (!cancelled) {
          setExperience(exp);
          setPricingTiers(tiers);
          setSlots(slotsData);
          setAddons(addonsData);
          setAddonAssignments(assignments);

          // Pre-select tier if provided and valid
          if (initialTierId && tiers.some((t) => t.$id === initialTierId)) {
            setSelectedTierId(initialTierId);
          } else if (tiers.length === 1) {
            setSelectedTierId(tiers[0].$id);
          }

          // Pre-select required/default addons
          const preSelected = [];
          for (const assignment of assignments) {
            if (assignment.isRequired || assignment.isDefault) {
              preSelected.push(assignment.addonId);
            }
          }
          setSelectedAddonIds(preSelected);

          // Pre-fill customer info from auth user
          if (user) {
            setCustomerEmail(user.email || "");
            setCustomerName(user.name || "");
            if (user.phone) setCustomerPhone(user.phone);
          }

          // Set min quantity
          if (exp.minQuantity && exp.minQuantity > 1) {
            setQuantity(exp.minQuantity);
          }

          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [experienceId, initialTierId, user]);

  // ─── Derived data ───────────────────────────────────────────────────────

  const selectedTier = useMemo(
    () => pricingTiers.find((t) => t.$id === selectedTierId) || null,
    [pricingTiers, selectedTierId],
  );

  const selectedSlot = useMemo(
    () => slots.find((s) => s.$id === selectedSlotId) || null,
    [slots, selectedSlotId],
  );

  /** Addons enriched with assignment data (overridePrice, isRequired) */
  const enrichedAddons = useMemo(() => {
    return addons.map((addon) => {
      const assignment = addonAssignments.find(
        (a) => a.addonId === addon.$id,
      );
      return {
        ...addon,
        isRequired: assignment?.isRequired || false,
        isDefault: assignment?.isDefault || false,
        effectivePrice:
          assignment?.overridePrice != null
            ? assignment.overridePrice
            : addon.basePrice,
      };
    });
  }, [addons, addonAssignments]);

  const selectedAddons = useMemo(
    () => enrichedAddons.filter((a) => selectedAddonIds.includes(a.$id)),
    [enrichedAddons, selectedAddonIds],
  );

  /** Indicative total (the real one is calculated server-side) */
  const indicativeTotal = useMemo(() => {
    if (!selectedTier) return 0;
    const base = selectedTier.basePrice * quantity;
    const addonsSum = selectedAddons.reduce(
      (sum, a) => sum + a.effectivePrice * quantity,
      0,
    );
    return base + addonsSum;
  }, [selectedTier, quantity, selectedAddons]);

  const currency = selectedTier?.currency || "MXN";

  // ─── Addon toggles ─────────────────────────────────────────────────────

  const toggleAddon = useCallback(
    (addonId) => {
      const addon = enrichedAddons.find((a) => a.$id === addonId);
      if (addon?.isRequired) return; // cannot deselect required

      setSelectedAddonIds((prev) =>
        prev.includes(addonId)
          ? prev.filter((id) => id !== addonId)
          : [...prev, addonId],
      );
    },
    [enrichedAddons],
  );

  // ─── Step validation ────────────────────────────────────────────────────

  const isStep0Valid = useMemo(() => {
    if (!selectedTierId) return false;
    if (experience?.requiresSchedule && !selectedSlotId) return false;
    if (quantity < 1) return false;
    return true;
  }, [selectedTierId, selectedSlotId, quantity, experience]);

  // step 1 (addons) is always valid - selection is optional
  const isStep1Valid = true;

  const isStep2Valid = useMemo(() => {
    if (!customerName.trim()) return false;
    if (!customerEmail.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return false;
    return true;
  }, [customerName, customerEmail]);

  const stepValidation = [isStep0Valid, isStep1Valid, isStep2Valid, true];

  // ─── Submit checkout ────────────────────────────────────────────────────

  const submitCheckout = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload = {
        experienceId,
        pricingTierId: selectedTierId,
        quantity,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim().toLowerCase(),
        addonIds: selectedAddonIds,
      };

      if (selectedSlotId) {
        payload.slotId = selectedSlotId;
      }
      if (customerPhone.trim()) {
        payload.customerPhone = customerPhone.trim();
      }

      const execution = await functions.createExecution(
        env.functionCreateCheckout,
        JSON.stringify(payload),
        false, // async = false
        "/",   // path
        "POST",
      );

      const result = JSON.parse(execution.responseBody);

      if (!result.ok) {
        setSubmitError(result.error?.message || "Checkout failed");
        return null;
      }

      // Redirect to Stripe
      if (result.data?.sessionUrl) {
        window.location.href = result.data.sessionUrl;
      }

      return result.data;
    } catch (err) {
      setSubmitError("Something went wrong. Please try again.");
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [
    experienceId,
    selectedTierId,
    selectedSlotId,
    selectedAddonIds,
    quantity,
    customerName,
    customerEmail,
    customerPhone,
  ]);

  // ─── Navigation ─────────────────────────────────────────────────────────

  const nextStep = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, 3));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  return {
    // Data
    experience,
    pricingTiers,
    slots,
    enrichedAddons,
    loading,
    loadError,

    // Selection
    selectedTierId,
    setSelectedTierId,
    selectedTier,
    selectedSlotId,
    setSelectedSlotId,
    selectedSlot,
    selectedAddonIds,
    toggleAddon,
    selectedAddons,
    quantity,
    setQuantity,

    // Customer
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,

    // Pricing
    indicativeTotal,
    currency,

    // Steps
    currentStep,
    nextStep,
    prevStep,
    goToStep,
    stepValidation,

    // Submit
    submitting,
    submitError,
    submitCheckout,
  };
}
