/**
 * @function expire-payment-links
 * @description Daily cron that finds request-conversion orders with pending payment
 *   whose paymentLinkExpiresAt has passed. For each, disables the Stripe Payment Link
 *   (if available) and cancels the order in Appwrite.
 * @trigger Schedule (cron: 0 3 * * * — 3 AM UTC daily)
 *
 * @entities
 * - Reads:  orders (orderType=request-conversion, paymentStatus=pending, paymentLinkExpiresAt < now)
 * - Writes: orders (status=cancelled, cancelledAt)
 * - Stripe: paymentLinks.update(id, { active: false })
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in)
 * - APPWRITE_FUNCTION_PROJECT_ID   (built-in)
 * - APPWRITE_DATABASE_ID
 * - APPWRITE_COLLECTION_ORDERS
 * - STRIPE_SECRET_KEY
 */

import { Client, Databases, Query } from "node-appwrite";
import Stripe from "stripe";

function initClient() {
  let endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  if (endpoint && endpoint.startsWith("http://")) {
    endpoint = endpoint.replace("http://", "https://");
  }
  return new Client()
    .setEndpoint(endpoint)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setSelfSigned(true)
    .setKey(process.env.APPWRITE_API_KEY);
}

export default async ({ req, res, log, error }) => {
  const client = initClient();
  const db = new Databases(client);

  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_ORDERS = process.env.APPWRITE_COLLECTION_ORDERS || "orders";
  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

  const stripe = STRIPE_SECRET
    ? new Stripe(STRIPE_SECRET, { apiVersion: "2026-02-25.clover" })
    : null;

  const now = new Date().toISOString();
  log(`expire-payment-links: starting run at ${now}`);

  let processed = 0;
  let failed = 0;

  try {
    // Fetch all pending request-conversion orders (max 100 per run — enough for daily batch)
    const result = await db.listDocuments(DB, COL_ORDERS, [
      Query.equal("orderType", "request-conversion"),
      Query.equal("paymentStatus", "pending"),
      Query.lessThan("paymentLinkExpiresAt", now),
      Query.notEqual("status", "cancelled"),
      Query.notEqual("status", "refunded"),
      Query.limit(100),
    ]);

    log(`expire-payment-links: found ${result.total} expired orders`);

    for (const order of result.documents) {
      try {
        // Disable the Stripe Payment Link if we have the ID
        if (stripe && order.stripeSessionId) {
          try {
            await stripe.paymentLinks.update(order.stripeSessionId, {
              active: false,
            });
            log(
              `Stripe payment link ${order.stripeSessionId} disabled for order ${order.$id}`,
            );
          } catch (stripeErr) {
            // If the link is already inactive or doesn't exist, log and continue
            error(
              `Stripe disable link failed for ${order.stripeSessionId}: ${stripeErr.message} (non-blocking)`,
            );
          }
        }

        // Cancel the order in Appwrite
        await db.updateDocument(DB, COL_ORDERS, order.$id, {
          status: "cancelled",
          cancelledAt: now,
          notes: (order.notes ? order.notes + "\n" : "") +
            `Auto-cancelled: payment link expired at ${order.paymentLinkExpiresAt}`,
        });
        log(`Order ${order.$id} (${order.orderNumber}) cancelled — payment link expired`);
        processed++;
      } catch (orderErr) {
        error(`Failed to expire order ${order.$id}: ${orderErr.message}`);
        failed++;
      }
    }

    log(`expire-payment-links: done — processed=${processed}, failed=${failed}`);
    return res.json({ ok: true, data: { processed, failed } });
  } catch (err) {
    error(`expire-payment-links: fatal error — ${err.message}`);
    return res.json(
      { ok: false, error: { code: "ERR_EXPIRE", message: err.message } },
      500,
    );
  }
};
