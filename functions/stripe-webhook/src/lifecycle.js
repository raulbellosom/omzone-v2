export const CONFIRMED_ORDER_STATUSES = new Set(["paid", "confirmed"]);

export function getSessionOrderId(session) {
  return session?.metadata?.orderId || session?.client_reference_id || null;
}

export function normalizeCurrency(currency) {
  return String(currency || "").trim().toUpperCase();
}

export function amountToMinorUnits(amount) {
  return Math.round(Number(amount || 0) * 100);
}

export function validateCheckoutSessionForOrder(session, order) {
  if (!session || !order) {
    return { ok: false, reason: "missing_session_or_order" };
  }

  const orderId = getSessionOrderId(session);
  if (orderId && orderId !== order.$id) {
    return { ok: false, reason: "order_id_mismatch" };
  }

  if (
    order.stripeSessionId &&
    session.id &&
    order.stripeSessionId !== session.id &&
    order.stripeSessionId !== session.payment_link
  ) {
    return { ok: false, reason: "session_id_mismatch" };
  }

  if (session.payment_status && session.payment_status !== "paid") {
    return { ok: false, reason: "payment_not_paid" };
  }

  if (
    session.amount_total != null &&
    session.amount_total !== amountToMinorUnits(order.totalAmount)
  ) {
    return { ok: false, reason: "amount_mismatch" };
  }

  if (
    session.currency &&
    normalizeCurrency(session.currency) !== normalizeCurrency(order.currency)
  ) {
    return { ok: false, reason: "currency_mismatch" };
  }

  return { ok: true };
}

export function isOrderFulfilled(order) {
  return (
    CONFIRMED_ORDER_STATUSES.has(order?.status) &&
    order?.paymentStatus === "succeeded"
  );
}

export function buildCheckoutCompletedOrderUpdate(session, nowIso) {
  const update = {
    status: "confirmed",
    paymentStatus: "succeeded",
    paidAt: nowIso,
  };

  if (session?.id) {
    update.stripeSessionId = session.id;
  }
  if (session?.payment_intent) {
    update.stripePaymentIntentId = session.payment_intent;
  }

  return update;
}

export function buildCheckoutPaymentData(session, order) {
  const metadata = {
    eventType: "checkout.session.completed",
    sessionId: session.id,
    paymentIntentId: session.payment_intent || null,
    customerEmail: session.customer_email || order.customerEmail || null,
    amountTotal: session.amount_total ?? null,
    currency: session.currency || order.currency || null,
    orderId: order.$id,
  };

  const paymentData = {
    orderId: order.$id,
    stripePaymentIntentId: session.payment_intent || null,
    amount:
      session.amount_total != null
        ? session.amount_total / 100
        : Number(order.totalAmount || 0),
    currency: normalizeCurrency(session.currency || order.currency || "MXN"),
    status: "succeeded",
    method: Array.isArray(session.payment_method_types)
      ? session.payment_method_types[0] || null
      : null,
    metadata: JSON.stringify(metadata),
  };

  if (session.id) {
    paymentData.stripeSessionId = session.id;
  }

  return paymentData;
}
