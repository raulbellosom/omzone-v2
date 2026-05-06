/**
 * @function stripe-webhook
 * @description Receives, verifies and processes Stripe webhook events to update
 *   order status and create payment records. Handles checkout.session.completed,
 *   checkout.session.expired, payment_intent.succeeded, and payment_intent.payment_failed.
 * @trigger HTTP POST (public — called by Stripe servers)
 *
 * @validates
 * - HMAC signature via stripe.webhooks.constructEvent() using raw body
 * - Only POST method allowed
 * - Required env vars present (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET)
 *
 * @entities
 * - Reads: orders (by $id or stripeSessionId or stripePaymentIntentId)
 * - Writes: orders (status, paymentStatus, paidAt, cancelledAt, stripePaymentIntentId)
 * - Creates: payments
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in, auto-injected)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in, auto-injected)
 * - x-appwrite-key header (dynamic API key, runtime only)
 * - APPWRITE_DATABASE_ID (project-level global)
 * - APPWRITE_COLLECTION_ORDERS (project-level global)
 * - APPWRITE_COLLECTION_PAYMENTS (project-level global)
 * - STRIPE_SECRET_KEY (project-level global)
 * - STRIPE_WEBHOOK_SECRET (project-level global)
 *
 * @errors
 * - 400: Invalid signature, malformed payload
 * - 405: Method not allowed
 * - 500: Missing config or internal error
 *
 * @idempotent Yes — checks payment records and order status before processing
 * @returns 200 in all handled cases (success, already processed, unknown event)
 */

import { Client, Databases, Query, ID, Functions } from "node-appwrite";
import Stripe from "stripe";
import { reconcileSlots } from "./reconciliation.js";
import {
  buildCheckoutCompletedOrderUpdate,
  buildCheckoutPaymentData,
  getSessionOrderId,
  isOrderFulfilled,
  validateCheckoutSessionForOrder,
} from "./lifecycle.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const HANDLED_EVENTS = [
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "checkout.session.async_payment_failed",
  "checkout.session.expired",
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initClient(req) {
  let endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  if (endpoint && endpoint.startsWith("http://")) {
    endpoint = endpoint.replace("http://", "https://");
  }
  return new Client()
    .setEndpoint(endpoint)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setSelfSigned(true)
    .setKey(req.headers["x-appwrite-key"]);
}

/**
 * Find order by document $id.
 */
async function findOrderById(db, DB, COL, orderId) {
  try {
    return await db.getDocument(DB, COL, orderId);
  } catch {
    return null;
  }
}

/**
 * Find order by stripeSessionId index.
 */
async function findOrderBySessionId(db, DB, COL, sessionId) {
  const result = await db.listDocuments(DB, COL, [
    Query.equal("stripeSessionId", sessionId),
    Query.limit(1),
  ]);
  return result.documents[0] || null;
}

async function findOrderForCheckoutSession(db, DB, COL, session) {
  const orderId = getSessionOrderId(session);
  if (orderId) {
    const byId = await findOrderById(db, DB, COL, orderId);
    if (byId) return byId;
  }

  if (session.id) {
    const bySession = await findOrderBySessionId(db, DB, COL, session.id);
    if (bySession) return bySession;
  }

  if (session.payment_link) {
    const byPaymentLink = await findOrderBySessionId(
      db,
      DB,
      COL,
      session.payment_link,
    );
    if (byPaymentLink) return byPaymentLink;
  }

  return null;
}

/**
 * Find order by stripePaymentIntentId.
 */
async function findOrderByPaymentIntentId(db, DB, COL, piId) {
  const result = await db.listDocuments(DB, COL, [
    Query.equal("stripePaymentIntentId", piId),
    Query.limit(1),
  ]);
  return result.documents[0] || null;
}

/**
 * Check if a payment record already exists for a given stripePaymentIntentId.
 */
async function paymentExists(db, DB, COL, piId) {
  if (!piId) return false;
  const result = await db.listDocuments(DB, COL, [
    Query.equal("stripePaymentIntentId", piId),
    Query.limit(1),
  ]);
  return result.total > 0;
}

async function paymentExistsForOrderSession(db, DB, COL, orderId, sessionId) {
  if (!orderId || !sessionId) return false;
  const result = await db.listDocuments(DB, COL, [
    Query.equal("orderId", orderId),
    Query.limit(100),
  ]);
  return result.documents.some((doc) => {
    if (doc.stripeSessionId === sessionId) return true;
    try {
      const metadata = JSON.parse(doc.metadata || "{}");
      return metadata.sessionId === sessionId;
    } catch {
      return false;
    }
  });
}

async function createPaymentRecord(db, DB, COL_PAYMENTS, paymentData, log) {
  try {
    await db.createDocument(DB, COL_PAYMENTS, ID.unique(), paymentData);
  } catch (err) {
    if (
      paymentData.stripeSessionId &&
      /stripeSessionId|Invalid document structure|Unknown attribute/i.test(
        err.message,
      )
    ) {
      const fallback = { ...paymentData };
      delete fallback.stripeSessionId;
      await db.createDocument(DB, COL_PAYMENTS, ID.unique(), fallback);
      log(
        `Payment record created without stripeSessionId column fallback for order ${paymentData.orderId}`,
      );
      return;
    }
    throw err;
  }
}

// ─── Event Handlers ──────────────────────────────────────────────────────────

/**
 * checkout.session.completed — Main success path.
 * Updates order to paid, creates payment record.
 */
async function handleCheckoutCompleted(
  session,
  db,
  DB,
  COL_ORDERS,
  COL_PAYMENTS,
  COL_ORDER_ITEMS,
  COL_SLOTS,
  functions,
  log,
) {
  const order = await findOrderForCheckoutSession(db, DB, COL_ORDERS, session);
  if (!order) {
    log(`WARN: Order not found for checkout session ${session.id}`);
    return;
  }

  const validation = validateCheckoutSessionForOrder(session, order);
  if (!validation.ok) {
    log(
      `WARN: checkout.session.completed rejected for order ${order.$id}: ${validation.reason}`,
    );
    return;
  }

  // Idempotency: already fulfilled
  if (isOrderFulfilled(order)) {
    log(`Order ${order.$id} already fulfilled, skipping`);
    return;
  }

  // Extract payment intent ID
  const piId = session.payment_intent || null;

  // Update order
  const updateData = buildCheckoutCompletedOrderUpdate(
    session,
    new Date().toISOString(),
  );

  await db.updateDocument(DB, COL_ORDERS, order.$id, updateData);
  log(`Order ${order.$id} confirmed via checkout.session.completed`);

  // Create payment record (idempotent check)
  const hasPayment =
    (piId && (await paymentExists(db, DB, COL_PAYMENTS, piId))) ||
    (await paymentExistsForOrderSession(
      db,
      DB,
      COL_PAYMENTS,
      order.$id,
      session.id,
    ));
  if (!hasPayment) {
    const paymentData = buildCheckoutPaymentData(session, order);
    await createPaymentRecord(db, DB, COL_PAYMENTS, paymentData, log);
    log(`Payment record created for order ${order.$id} (session: ${session.id})`);
  }

  // Reconcile slot bookedCount
  await reconcileSlots({
    db,
    databaseId: DB,
    collectionOrderItems: COL_ORDER_ITEMS,
    collectionSlots: COL_SLOTS,
    orderId: order.$id,
    log,
  });

  // Trigger ticket generation (async — fire-and-forget)
  try {
    await functions.createExecution(
      "generate-ticket",
      JSON.stringify({ orderId: order.$id }),
      true, // async
      "/",
      "POST",
    );
    log(`Triggered generate-ticket for order ${order.$id}`);
  } catch (err) {
    // Don't fail the webhook if ticket generation trigger fails
    log(
      `WARN: Failed to trigger generate-ticket for ${order.$id}: ${err.message}`,
    );
  }
}

/**
 * checkout.session.expired — Session timed out before payment.
 * Updates order to cancelled.
 */
async function handleCheckoutExpired(session, db, DB, COL_ORDERS, log) {
  const order = await findOrderForCheckoutSession(db, DB, COL_ORDERS, session);
  if (!order) {
    log(`WARN: Order not found for expired session ${session.id}`);
    return;
  }

  // Idempotency: already cancelled / already paid (edge case: events out of order)
  if (order.status === "cancelled") {
    log(`Order ${order.$id} already cancelled, skipping`);
    return;
  }
  if (isOrderFulfilled(order)) {
    log(`Order ${order.$id} already fulfilled, ignoring expired event`);
    return;
  }

  await db.updateDocument(DB, COL_ORDERS, order.$id, {
    status: "cancelled",
    paymentStatus: "failed",
    cancelledAt: new Date().toISOString(),
  });
  log(`Order ${order.$id} cancelled (session expired)`);
}

async function handleCheckoutAsyncFailed(session, db, DB, COL_ORDERS, log) {
  const order = await findOrderForCheckoutSession(db, DB, COL_ORDERS, session);
  if (!order) {
    log(`WARN: Order not found for async failed session ${session.id}`);
    return;
  }

  if (isOrderFulfilled(order)) {
    log(`Order ${order.$id} already fulfilled, ignoring async failed event`);
    return;
  }

  await db.updateDocument(DB, COL_ORDERS, order.$id, {
    paymentStatus: "failed",
  });
  log(`Order ${order.$id} payment marked failed (async checkout session)`);
}

/**
 * payment_intent.succeeded — Fallback path if checkout.session.completed
 * already processed, this is a no-op. Otherwise, updates the order.
 */
async function handlePaymentIntentSucceeded(
  paymentIntent,
  db,
  DB,
  COL_ORDERS,
  COL_PAYMENTS,
  COL_ORDER_ITEMS,
  COL_SLOTS,
  functions,
  log,
) {
  const piId = paymentIntent.id;

  // Find order by PI
  let order = await findOrderByPaymentIntentId(db, DB, COL_ORDERS, piId);

  if (!order) {
    // Stripe may deliver payment_intent.succeeded before checkout.session.completed.
    // Try metadata fallback.
    const orderId = paymentIntent.metadata && paymentIntent.metadata.orderId;
    if (orderId) {
      order = await findOrderById(db, DB, COL_ORDERS, orderId);
    }
  }

  if (!order) {
    log(`WARN: No order found for payment_intent ${piId}`);
    return;
  }

  // Idempotency: checkout.session.completed is the preferred fulfillment path.
  if (isOrderFulfilled(order)) {
    log(`Order ${order.$id} already fulfilled, PI succeeded is no-op`);
    return;
  }

  // Update order
  await db.updateDocument(DB, COL_ORDERS, order.$id, {
    status: "confirmed",
    paymentStatus: "succeeded",
    paidAt: new Date().toISOString(),
    stripePaymentIntentId: piId,
  });
  log(`Order ${order.$id} confirmed via payment_intent.succeeded fallback`);

  // Create payment record
  if (!(await paymentExists(db, DB, COL_PAYMENTS, piId))) {
    // Extract card details from charges (safe PCI data: brand + last4 only)
    let cardBrand = null;
    let cardLast4 = null;
    try {
      const charge =
        paymentIntent.charges &&
        paymentIntent.charges.data &&
        paymentIntent.charges.data[0];
      if (charge && charge.payment_method_details && charge.payment_method_details.card) {
        cardBrand = charge.payment_method_details.card.brand || null;
        cardLast4 = charge.payment_method_details.card.last4 || null;
      }
    } catch {
      // Non-fatal: card details not available
    }

    const paymentData = {
      orderId: order.$id,
      stripePaymentIntentId: piId,
      amount: (paymentIntent.amount || 0) / 100,
      currency: (paymentIntent.currency || "mxn").toUpperCase(),
      status: "succeeded",
      method: paymentIntent.payment_method_types
        ? paymentIntent.payment_method_types[0] || null
        : null,
      metadata: JSON.stringify({
        eventType: "payment_intent.succeeded",
        paymentIntentId: piId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      }),
    };
    if (cardBrand) paymentData.cardBrand = cardBrand;
    if (cardLast4) paymentData.cardLast4 = cardLast4;

    await db.createDocument(DB, COL_PAYMENTS, ID.unique(), paymentData);
    log(`Payment record created for order ${order.$id} (PI: ${piId}, card: ${cardBrand || "n/a"} ****${cardLast4 || "n/a"})`);
  }

  // Reconcile slot bookedCount
  await reconcileSlots({
    db,
    databaseId: DB,
    collectionOrderItems: COL_ORDER_ITEMS,
    collectionSlots: COL_SLOTS,
    orderId: order.$id,
    log,
  });

  // Trigger ticket generation (async — fire-and-forget)
  try {
    await functions.createExecution(
      "generate-ticket",
      JSON.stringify({ orderId: order.$id }),
      true, // async
      "/",
      "POST",
    );
    log(`Triggered generate-ticket for order ${order.$id}`);
  } catch (err) {
    log(
      `WARN: Failed to trigger generate-ticket for ${order.$id}: ${err.message}`,
    );
  }
}

/**
 * payment_intent.payment_failed — Mark payment as failed.
 */
async function handlePaymentIntentFailed(
  paymentIntent,
  db,
  DB,
  COL_ORDERS,
  COL_PAYMENTS,
  log,
) {
  const piId = paymentIntent.id;

  let order = await findOrderByPaymentIntentId(db, DB, COL_ORDERS, piId);
  if (!order) {
    const orderId = paymentIntent.metadata && paymentIntent.metadata.orderId;
    if (orderId) {
      order = await findOrderById(db, DB, COL_ORDERS, orderId);
    }
  }

  if (!order) {
    log(`WARN: No order found for failed payment_intent ${piId}`);
    return;
  }

  // Don't downgrade a paid order
  if (isOrderFulfilled(order)) {
    log(`Order ${order.$id} already fulfilled, ignoring failed PI event`);
    return;
  }

  await db.updateDocument(DB, COL_ORDERS, order.$id, {
    paymentStatus: "failed",
  });
  log(`Order ${order.$id} payment marked failed (PI: ${piId})`);

  // Create payment record for failed attempt
  if (!(await paymentExists(db, DB, COL_PAYMENTS, piId))) {
    await db.createDocument(DB, COL_PAYMENTS, ID.unique(), {
      orderId: order.$id,
      stripePaymentIntentId: piId,
      amount: (paymentIntent.amount || 0) / 100,
      currency: (paymentIntent.currency || "mxn").toUpperCase(),
      status: "failed",
      method: paymentIntent.payment_method_types
        ? paymentIntent.payment_method_types[0] || null
        : null,
      metadata: JSON.stringify({
        eventType: "payment_intent.payment_failed",
        paymentIntentId: piId,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        lastError: paymentIntent.last_payment_error
          ? paymentIntent.last_payment_error.message
          : null,
      }),
    });
    log(`Failed payment record created for order ${order.$id}`);
  }
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  // ── Method check ───────────────────────────────────────────────────────────
  if (req.method !== "POST") {
    return res.json(
      {
        ok: false,
        error: { code: "ERR_METHOD_NOT_ALLOWED", message: "Only POST allowed" },
      },
      405,
    );
  }

  // ── Config check ───────────────────────────────────────────────────────────
  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

  if (!STRIPE_SECRET || !WEBHOOK_SECRET) {
    error("STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET not configured");
    return res.json(
      {
        ok: false,
        error: { code: "ERR_CONFIG", message: "Webhook not configured" },
      },
      500,
    );
  }

  // ── Verify HMAC signature ──────────────────────────────────────────────────
  const stripe = new Stripe(STRIPE_SECRET, {
    apiVersion: "2026-02-25.clover",
  });
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    error("Missing stripe-signature header");
    return res.json(
      {
        ok: false,
        error: {
          code: "ERR_WEBHOOK_MISSING_SIGNATURE",
          message: "Missing signature",
        },
      },
      400,
    );
  }

  let event;
  try {
    // Use req.bodyText for the raw, unparsed body (Appwrite 1.5+ / open-runtimes)
    event = stripe.webhooks.constructEvent(
      req.bodyText,
      signature,
      WEBHOOK_SECRET,
    );
  } catch (err) {
    error(`Webhook signature verification failed: ${err.message}`);
    return res.json(
      {
        ok: false,
        error: {
          code: "ERR_WEBHOOK_INVALID_SIGNATURE",
          message: "Invalid signature",
        },
      },
      400,
    );
  }

  // ── Log event receipt ──────────────────────────────────────────────────────
  log(`Webhook received: ${event.type} (${event.id})`);

  // ── Ignore unhandled event types ───────────────────────────────────────────
  if (!HANDLED_EVENTS.includes(event.type)) {
    log(`Event type ${event.type} not handled, acknowledging`);
    return res.json({ ok: true, message: "Event type not handled" });
  }

  // ── Initialize Appwrite ────────────────────────────────────────────────────
  const client = initClient(req);
  const db = new Databases(client);
  const functions = new Functions(client);

  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_ORDERS = process.env.APPWRITE_COLLECTION_ORDERS || "orders";
  const COL_PAYMENTS = process.env.APPWRITE_COLLECTION_PAYMENTS || "payments";
  const COL_ORDER_ITEMS =
    process.env.APPWRITE_COLLECTION_ORDER_ITEMS || "order_items";
  const COL_SLOTS = process.env.APPWRITE_COLLECTION_SLOTS || "slots";

  try {
    const dataObject = event.data.object;

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await handleCheckoutCompleted(
          dataObject,
          db,
          DB,
          COL_ORDERS,
          COL_PAYMENTS,
          COL_ORDER_ITEMS,
          COL_SLOTS,
          functions,
          log,
        );
        break;

      case "checkout.session.async_payment_failed":
        await handleCheckoutAsyncFailed(dataObject, db, DB, COL_ORDERS, log);
        break;

      case "checkout.session.expired":
        await handleCheckoutExpired(dataObject, db, DB, COL_ORDERS, log);
        break;

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(
          dataObject,
          db,
          DB,
          COL_ORDERS,
          COL_PAYMENTS,
          COL_ORDER_ITEMS,
          COL_SLOTS,
          functions,
          log,
        );
        break;

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(
          dataObject,
          db,
          DB,
          COL_ORDERS,
          COL_PAYMENTS,
          log,
        );
        break;
    }

    log(`Event ${event.id} (${event.type}) processed successfully`);
    return res.json({ ok: true });
  } catch (err) {
    // Internal errors → 500 so Stripe retries
    error(`Error processing event ${event.id}: ${err.message}`);
    return res.json(
      {
        ok: false,
        error: { code: "ERR_WEBHOOK_INTERNAL", message: "Processing failed" },
      },
      500,
    );
  }
};
