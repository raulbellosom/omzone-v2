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

// ─── Constants ───────────────────────────────────────────────────────────────

const HANDLED_EVENTS = [
  "checkout.session.completed",
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
  const result = await db.listDocuments(DB, COL, [
    Query.equal("stripePaymentIntentId", piId),
    Query.limit(1),
  ]);
  return result.total > 0;
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
  const orderId =
    (session.metadata && session.metadata.orderId) ||
    session.client_reference_id;

  if (!orderId) {
    log("WARN: checkout.session.completed missing orderId in metadata");
    return;
  }

  // Find order
  const order = await findOrderById(db, DB, COL_ORDERS, orderId);
  if (!order) {
    log(`WARN: Order ${orderId} not found for session ${session.id}`);
    return;
  }

  // Idempotency: already paid
  if (order.status === "paid" || order.paymentStatus === "succeeded") {
    log(`Order ${orderId} already paid, skipping`);
    return;
  }

  // Extract payment intent ID
  const piId = session.payment_intent || null;

  // Update order
  const updateData = {
    status: "paid",
    paymentStatus: "succeeded",
    paidAt: new Date().toISOString(),
  };
  if (piId) {
    updateData.stripePaymentIntentId = piId;
  }

  await db.updateDocument(DB, COL_ORDERS, orderId, updateData);
  log(`Order ${orderId} updated to paid`);

  // Create payment record (idempotent check)
  if (piId && !(await paymentExists(db, DB, COL_PAYMENTS, piId))) {
    await db.createDocument(DB, COL_PAYMENTS, ID.unique(), {
      orderId,
      stripePaymentIntentId: piId,
      amount: (session.amount_total || 0) / 100,
      currency: (session.currency || "mxn").toUpperCase(),
      status: "succeeded",
      method: session.payment_method_types
        ? session.payment_method_types[0] || null
        : null,
      metadata: JSON.stringify({
        eventType: "checkout.session.completed",
        sessionId: session.id,
        paymentIntentId: piId,
        customerEmail: session.customer_email || null,
        amountTotal: session.amount_total,
        currency: session.currency,
      }),
    });
    log(`Payment record created for order ${orderId} (PI: ${piId})`);
  }

  // Reconcile slot bookedCount
  await reconcileSlots({
    db,
    databaseId: DB,
    collectionOrderItems: COL_ORDER_ITEMS,
    collectionSlots: COL_SLOTS,
    orderId,
    log,
  });

  // Trigger ticket generation (async — fire-and-forget)
  try {
    await functions.createExecution(
      "generate-ticket",
      JSON.stringify({ orderId }),
      true, // async
      "/",
      "POST",
    );
    log(`Triggered generate-ticket for order ${orderId}`);
  } catch (err) {
    // Don't fail the webhook if ticket generation trigger fails
    log(
      `WARN: Failed to trigger generate-ticket for ${orderId}: ${err.message}`,
    );
  }
}

/**
 * checkout.session.expired — Session timed out before payment.
 * Updates order to cancelled.
 */
async function handleCheckoutExpired(session, db, DB, COL_ORDERS, log) {
  const orderId =
    (session.metadata && session.metadata.orderId) ||
    session.client_reference_id;

  if (!orderId) {
    log("WARN: checkout.session.expired missing orderId in metadata");
    return;
  }

  const order = await findOrderById(db, DB, COL_ORDERS, orderId);
  if (!order) {
    log(`WARN: Order ${orderId} not found for expired session ${session.id}`);
    return;
  }

  // Idempotency: already cancelled / already paid (edge case: events out of order)
  if (order.status === "cancelled") {
    log(`Order ${orderId} already cancelled, skipping`);
    return;
  }
  if (order.status === "paid") {
    log(`Order ${orderId} already paid, ignoring expired event`);
    return;
  }

  await db.updateDocument(DB, COL_ORDERS, orderId, {
    status: "cancelled",
    paymentStatus: "failed",
    cancelledAt: new Date().toISOString(),
  });
  log(`Order ${orderId} cancelled (session expired)`);
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

  // Idempotency: already paid
  if (order.status === "paid" || order.paymentStatus === "succeeded") {
    log(`Order ${order.$id} already paid, PI succeeded is no-op`);
    return;
  }

  // Update order
  await db.updateDocument(DB, COL_ORDERS, order.$id, {
    status: "paid",
    paymentStatus: "succeeded",
    paidAt: new Date().toISOString(),
    stripePaymentIntentId: piId,
  });
  log(`Order ${order.$id} updated to paid via payment_intent.succeeded`);

  // Create payment record
  if (!(await paymentExists(db, DB, COL_PAYMENTS, piId))) {
    await db.createDocument(DB, COL_PAYMENTS, ID.unique(), {
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
    });
    log(`Payment record created for order ${order.$id} (PI: ${piId})`);
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
  if (order.status === "paid") {
    log(`Order ${order.$id} already paid, ignoring failed PI event`);
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
  const stripe = new Stripe(STRIPE_SECRET);
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
