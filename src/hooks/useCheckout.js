import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { databases, functions, Query } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import { sanitizePhone } from "@/lib/utils";
import env from "@/config/env";
import {
  ADDON_PRICE_TYPES_SUPPORTED_IN_CHECKOUT,
  computeAddonChargeQuantity,
  computeCheckoutConstraints,
  isTierSlotCompatible,
} from "@/lib/checkoutRules";

const DB = env.appwriteDatabaseId;

async function fetchDocumentsByIds(collectionId, ids) {
  if (!ids.length) return [];
  const res = await databases.listDocuments(DB, collectionId, [
    Query.equal("$id", ids),
    Query.limit(Math.min(Math.max(ids.length, 1), 500)),
  ]);
  return res.documents;
}

export function useCheckout() {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const experienceId = searchParams.get("experienceId");
  const initialTierId = searchParams.get("pricingTierId");
  const initialAddonIds = searchParams.get("addonIds");

  const [experience, setExperience] = useState(null);
  const [pricingTiers, setPricingTiers] = useState([]);
  const [slots, setSlots] = useState([]);
  const [addons, setAddons] = useState([]);
  const [addonAssignments, setAddonAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [selectedTierId, setSelectedTierId] = useState(initialTierId || "");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedAddonIds, setSelectedAddonIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [quantityNotice, setQuantityNotice] = useState(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const [clientSecret, setClientSecret] = useState(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderNumber, setOrderNumber] = useState(null);

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
        const rawSlots =
          slotsRes.status === "fulfilled" ? slotsRes.value.documents : [];
        const assignments =
          assignmentsRes.status === "fulfilled"
            ? assignmentsRes.value.documents
            : [];

        let addonsData = [];
        if (assignments.length > 0) {
          const addonIds = assignments.map((a) => a.addonId).filter(Boolean);
          if (addonIds.length > 0) {
            try {
              addonsData = await fetchDocumentsByIds(
                env.collectionAddons,
                addonIds,
              );
              addonsData = addonsData.filter(
                (addon) => addon.status === "active",
              );
            } catch {
              addonsData = [];
            }
          }
        }

        let locations = [];
        let rooms = [];
        const locationIds = [
          ...new Set(rawSlots.map((slot) => slot.locationId).filter(Boolean)),
        ];
        const roomIds = [
          ...new Set(rawSlots.map((slot) => slot.roomId).filter(Boolean)),
        ];
        try {
          [locations, rooms] = await Promise.all([
            fetchDocumentsByIds(env.collectionLocations, locationIds),
            fetchDocumentsByIds(env.collectionRooms, roomIds),
          ]);
        } catch {
          locations = [];
          rooms = [];
        }

        const locationMap = new Map(locations.map((doc) => [doc.$id, doc]));
        const roomMap = new Map(rooms.map((doc) => [doc.$id, doc]));
        const slotsData = rawSlots.map((slot) => {
          const location = slot.locationId
            ? locationMap.get(slot.locationId)
            : null;
          const room = slot.roomId ? roomMap.get(slot.roomId) : null;
          return {
            ...slot,
            locationName: location?.name || null,
            locationAddress: location?.address || null,
            roomName: room?.name || null,
          };
        });

        if (!cancelled) {
          setExperience(exp);
          setPricingTiers(tiers);
          setSlots(slotsData);
          setAddons(addonsData);
          setAddonAssignments(assignments);

          if (
            initialTierId &&
            tiers.some((tier) => tier.$id === initialTierId)
          ) {
            setSelectedTierId(initialTierId);
          } else if (tiers.length === 1) {
            setSelectedTierId(tiers[0].$id);
          }

          const preSelected = new Set();
          for (const assignment of assignments) {
            if (assignment.isRequired || assignment.isDefault) {
              preSelected.add(assignment.addonId);
            }
          }
          if (initialAddonIds) {
            for (const id of initialAddonIds.split(",")) {
              if (id) preSelected.add(id);
            }
          }
          setSelectedAddonIds([...preSelected]);

          if (user) {
            setCustomerEmail(user.email || "");
            setCustomerName(user.name || "");
            if (user.phone) setCustomerPhone(user.phone);
          }

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
  }, [experienceId, initialTierId, initialAddonIds, user]);

  const selectedTier = useMemo(
    () => pricingTiers.find((tier) => tier.$id === selectedTierId) || null,
    [pricingTiers, selectedTierId],
  );

  const compatibleSlots = useMemo(() => {
    if (!selectedTier?.editionId) return slots;
    return slots.filter((slot) => slot.editionId === selectedTier.editionId);
  }, [slots, selectedTier]);

  useEffect(() => {
    if (!selectedSlotId) return;
    if (!compatibleSlots.some((slot) => slot.$id === selectedSlotId)) {
      setSelectedSlotId("");
    }
  }, [compatibleSlots, selectedSlotId]);

  const selectedSlot = useMemo(
    () => compatibleSlots.find((slot) => slot.$id === selectedSlotId) || null,
    [compatibleSlots, selectedSlotId],
  );

  const tierSlotCompatibility = useMemo(
    () => isTierSlotCompatible(selectedTier, selectedSlot),
    [selectedTier, selectedSlot],
  );

  const effectiveConstraints = useMemo(() => {
    if (!experience || !selectedTier) return null;
    return computeCheckoutConstraints({
      experience,
      tier: selectedTier,
      slot: selectedSlot,
      quantity,
    });
  }, [experience, selectedTier, selectedSlot, quantity]);

  useEffect(() => {
    if (!effectiveConstraints || !effectiveConstraints.isValid) return;
    if (experience?.requiresSchedule && !selectedSlot) return;
    if (quantity === effectiveConstraints.normalizedQuantity) {
      if (quantityNotice) setQuantityNotice(null);
      return;
    }
    const nextQuantity = effectiveConstraints.normalizedQuantity;
    setQuantity(nextQuantity);
    setQuantityNotice({
      prev: quantity,
      next: nextQuantity,
      min: effectiveConstraints.effectiveMin,
      max: effectiveConstraints.effectiveMax,
    });
  }, [
    effectiveConstraints,
    experience,
    selectedSlot,
    quantity,
    quantityNotice,
    setQuantity,
  ]);

  const enrichedAddons = useMemo(() => {
    return addons
      .map((addon) => {
        const assignment = addonAssignments.find(
          (item) => item.addonId === addon.$id,
        );
        if (!assignment) return null;
        const addonPricing = computeAddonChargeQuantity(
          addon.priceType,
          quantity,
        );
        return {
          ...addon,
          isRequired: assignment?.isRequired || false,
          isDefault: assignment?.isDefault || false,
          effectivePrice:
            assignment?.overridePrice != null
              ? assignment.overridePrice
              : addon.basePrice,
          chargeQuantity: addonPricing.chargeQuantity || 0,
          unsupportedPriceType:
            Boolean(addonPricing.errorCode) ||
            !ADDON_PRICE_TYPES_SUPPORTED_IN_CHECKOUT.includes(addon.priceType),
        };
      })
      .filter(Boolean);
  }, [addons, addonAssignments, quantity]);

  const selectedAddons = useMemo(
    () =>
      enrichedAddons.filter((addon) => selectedAddonIds.includes(addon.$id)),
    [enrichedAddons, selectedAddonIds],
  );

  const hasUnsupportedRequiredAddons = useMemo(
    () =>
      enrichedAddons.some(
        (addon) => addon.isRequired && addon.unsupportedPriceType,
      ),
    [enrichedAddons],
  );

  const indicativeTotal = useMemo(() => {
    if (!selectedTier) return 0;
    const base = selectedTier.basePrice * quantity;
    const addonsSum = selectedAddons.reduce(
      (sum, addon) => sum + addon.effectivePrice * addon.chargeQuantity,
      0,
    );
    return base + addonsSum;
  }, [selectedTier, quantity, selectedAddons]);

  const currency = selectedTier?.currency || pricingTiers[0]?.currency || "MXN";

  const toggleAddon = useCallback(
    (addonId) => {
      const addon = enrichedAddons.find((item) => item.$id === addonId);
      if (!addon) return;
      if (addon.isRequired || addon.unsupportedPriceType) return;
      setSelectedAddonIds((prev) =>
        prev.includes(addonId)
          ? prev.filter((id) => id !== addonId)
          : [...prev, addonId],
      );
    },
    [enrichedAddons],
  );

  const isStep0Valid = useMemo(() => {
    if (!selectedTierId) return false;
    if (!tierSlotCompatibility.compatible) return false;
    if (experience?.requiresSchedule && !selectedSlotId) return false;
    if (!effectiveConstraints?.isValid) return false;
    if (quantity < effectiveConstraints.effectiveMin) return false;
    if (quantity > effectiveConstraints.effectiveMax) return false;
    return true;
  }, [
    selectedTierId,
    selectedSlotId,
    quantity,
    experience,
    tierSlotCompatibility,
    effectiveConstraints,
  ]);

  const isStep1Valid = !hasUnsupportedRequiredAddons;

  const isStep2Valid = useMemo(() => {
    if (!customerName.trim()) return false;
    if (!customerEmail.trim()) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return false;
    // Phone is optional, but if provided the local part must be >= 8 digits
    if (customerPhone.trim()) {
      const spaceIdx = customerPhone.indexOf(" ");
      const localPart = spaceIdx >= 0 ? customerPhone.slice(spaceIdx + 1) : "";
      if (localPart.replace(/\D/g, "").length < 8) return false;
    }
    return true;
  }, [customerName, customerEmail, customerPhone]);

  const stepValidation = [isStep0Valid, isStep1Valid, isStep2Valid, true, true];

  const createPaymentIntent = useCallback(async () => {
    if (clientSecret) {
      return { clientSecret, checkoutSessionId, orderId, orderNumber };
    }

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
        frontendUrl: window.location.origin,
      };

      if (selectedSlotId) payload.slotId = selectedSlotId;
      if (customerPhone.trim()) {
        payload.customerPhone = sanitizePhone(customerPhone);
      }

      const execution = await functions.createExecution(
        env.functionCreateCheckout,
        JSON.stringify(payload),
        false,
        "/",
        "POST",
      );

      const result = JSON.parse(execution.responseBody);

      if (!result.ok) {
        const errCode = result.error?.code || "ERR_UNKNOWN";
        const errMsg = result.error?.message || "Checkout failed";
        const debugMsg = result.error?._debug?.msg || null;
        setSubmitError({ code: errCode, message: errMsg, debug: debugMsg });
        return null;
      }

      const {
        clientSecret: secret,
        checkoutSessionId: sessionId,
        orderId: oid,
        orderNumber: onum,
      } = result.data;
      setClientSecret(secret);
      setCheckoutSessionId(sessionId);
      setOrderId(oid);
      setOrderNumber(onum);

      return result.data;
    } catch (err) {
      setSubmitError({
        code: "ERR_NETWORK",
        message: err.message || "Network error",
      });
      return null;
    } finally {
      setSubmitting(false);
    }
  }, [
    clientSecret,
    checkoutSessionId,
    orderId,
    orderNumber,
    experienceId,
    selectedTierId,
    selectedSlotId,
    selectedAddonIds,
    quantity,
    customerName,
    customerEmail,
    customerPhone,
  ]);

  const nextStep = useCallback(() => {
    setCurrentStep((step) => Math.min(step + 1, 4));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  return {
    experience,
    pricingTiers,
    slots: compatibleSlots,
    enrichedAddons,
    loading,
    loadError,

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
    quantityNotice,

    effectiveConstraints,
    tierSlotCompatibility,
    hasUnsupportedRequiredAddons,

    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    customerPhone,
    setCustomerPhone,

    indicativeTotal,
    currency,

    currentStep,
    nextStep,
    prevStep,
    goToStep,
    stepValidation,

    submitting,
    submitError,
    clearSubmitError: () => setSubmitError(null),
    createPaymentIntent,
    clientSecret,
    checkoutSessionId,
    orderId,
    orderNumber,
  };
}
