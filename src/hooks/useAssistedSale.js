import { useState } from "react";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";

const FN_ID = env.functionCreateCheckout;

// ─── Initial wizard state ─────────────────────────────────────────────────────

const EMPTY_WIZARD = {
  // Step 1 — Customer
  customer: null, // { $id?, displayName, email, phone } or null for new
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  isNewCustomer: false,

  // Step 2 — Experience
  experience: null,

  // Step 3 — Pricing tier
  pricingTier: null,

  // Step 4 — Slot (conditional)
  slot: null,
  slotSkipped: false,

  // Step 5 — Addons
  selectedAddonIds: [],

  // Step 6 — Quantity
  quantity: 1,

  // Step 7 — Payment method
  paymentMethod: "manual", // "manual" | "stripe"
};

/**
 * useAssistedSale — manages the wizard state and submits the assisted sale.
 *
 * @returns {{ wizard, setWizardField, submitSale, submitting, result, submitError, resetWizard }}
 */
export function useAssistedSale() {
  const [wizard, setWizard] = useState({ ...EMPTY_WIZARD });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  function setWizardField(field, value) {
    setWizard((prev) => ({ ...prev, [field]: value }));
  }

  function resetWizard() {
    setWizard({ ...EMPTY_WIZARD });
    setResult(null);
    setSubmitError(null);
  }

  /**
   * Submit the assisted sale by calling the create-checkout Function.
   * Returns true on success.
   */
  async function submitSale() {
    setSubmitting(true);
    setSubmitError(null);
    setResult(null);

    const skipStripe = wizard.paymentMethod === "manual";

    // Resolve customer name/email from selected customer or new customer fields
    const customerName = wizard.customer
      ? (
          `${wizard.customer.firstName ?? ""} ${wizard.customer.lastName ?? ""}`.trim() ||
          wizard.customerName
        ).trim()
      : wizard.customerName.trim();
    const customerEmail = wizard.customer
      ? (wizard.customer.email || wizard.customerEmail).trim().toLowerCase()
      : wizard.customerEmail.trim().toLowerCase();
    const customerPhone = wizard.customer
      ? wizard.customer.phone || wizard.customerPhone || ""
      : wizard.customerPhone || "";

    const payload = {
      orderType: "assisted",
      experienceId: wizard.experience.$id,
      pricingTierId: wizard.pricingTier.$id,
      slotId: wizard.slot ? wizard.slot.$id : undefined,
      addonIds: wizard.selectedAddonIds,
      quantity: wizard.quantity,
      customerName,
      customerEmail,
      customerPhone: customerPhone || undefined,
      skipStripe,
      targetUserId: wizard.customer?.$id ?? undefined,
    };

    try {
      const execution = await functions.createExecution(
        FN_ID,
        JSON.stringify(payload),
        false, // sync
        "/",
        "POST",
        { "Content-Type": "application/json" },
      );

      const body = JSON.parse(execution.responseBody || "{}");

      if (!body.ok) {
        setSubmitError(body.error?.message ?? "Error al procesar la venta");
        return false;
      }

      setResult(body.data);
      return true;
    } catch (err) {
      setSubmitError(err?.message ?? "Error de conexión");
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return {
    wizard,
    setWizardField,
    submitSale,
    submitting,
    result,
    submitError,
    resetWizard,
  };
}
