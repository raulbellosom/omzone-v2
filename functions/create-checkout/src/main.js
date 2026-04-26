/**
 * @function create-checkout
 * @description Validates purchase intent, reads prices from DB, creates order with
 *   snapshot, generates order items, and creates a Stripe PaymentIntent (direct)
 *   or marks order as paid (assisted + skipStripe).
 * @trigger HTTP POST
 *
 * @input {Object} payload
 * @input {string} payload.experienceId - Experience to purchase
 * @input {string} payload.pricingTierId - Selected pricing tier
 * @input {string} [payload.slotId] - Selected slot (required if experience.requiresSchedule)
 * @input {string[]} [payload.addonIds] - Selected addon IDs
 * @input {number} payload.quantity - Number of attendees/units (≥ 1)
 * @input {string} payload.customerName - Customer full name
 * @input {string} payload.customerEmail - Customer email (valid format)
 * @input {string} [payload.customerPhone] - Customer phone (optional)
 * @input {string} [payload.orderType] - "direct" (default) | "assisted"
 * @input {boolean} [payload.skipStripe] - If true + assisted: mark order paid immediately
 * @input {string} [payload.targetUserId] - For assisted: the client userId (if known)
 *
 * @validates
 * - Autenticación: requiere JWT válido (x-appwrite-user-id)
 * - Para orderType "assisted": caller debe tener label admin o root
 * - Input: tipos, rangos, formato email
 * - Negocio: experiencia publicada, tier activo, slot disponible, addons activos
 *
 * @entities
 * - Lee: experiences, pricing_tiers, slots, addons, addon_assignments, orders, user_labels
 * - Escribe: orders, order_items, admin_activity_logs
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in)
 * - APPWRITE_DATABASE_ID
 * - APPWRITE_COLLECTION_EXPERIENCES
 * - APPWRITE_COLLECTION_PRICING_TIERS
 * - APPWRITE_COLLECTION_SLOTS
 * - APPWRITE_COLLECTION_ADDONS
 * - APPWRITE_COLLECTION_ADDON_ASSIGNMENTS
 * - APPWRITE_COLLECTION_ORDERS
 * - APPWRITE_COLLECTION_ORDER_ITEMS
 * - APPWRITE_COLLECTION_ADMIN_ACTIVITY_LOGS
 * - APPWRITE_COLLECTION_NOTIFICATION_TEMPLATES
 * - APPWRITE_COLLECTION_USER_PROFILES
 * - STRIPE_SECRET_KEY
 * - FRONTEND_URL
 * - EMAIL_PROVIDER   (resend | smtp — for payment link email)
 * - EMAIL_FROM       (From address for payment link email)
 * - RESEND_API_KEY   (required when EMAIL_PROVIDER=resend)
 *
 * @returns {Object}
 *   direct:   { ok: true, data: { clientSecret, orderId, orderNumber } }
 *   assisted + skipStripe: { ok: true, data: { orderId, orderNumber, paid: true } }
 *   assisted + Stripe:     { ok: true, data: { paymentLink, orderId } }
 */

import {
  Client,
  Databases,
  Users,
  Functions,
  Query,
  ID,
  Permission,
  Role,
} from "node-appwrite";
import Stripe from "stripe";

// ─── Constants ───────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initClient(req) {
  // Appwrite built-in injects http:// for internal Docker communication,
  // but if the server redirects HTTP→HTTPS the 301/302 converts POST→GET,
  // causing createDocument to silently return a listDocuments response.
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

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `OMZ-${date}-${suffix}`;
}

function buildLineItems(experience, tier, validatedAddons, quantity, currency) {
  const items = [
    {
      price_data: {
        currency: currency.toLowerCase(),
        unit_amount: Math.round(tier.basePrice * 100),
        product_data: { name: `${experience.publicName} — ${tier.name}` },
      },
      quantity,
    },
  ];
  for (const { addon, effectivePrice } of validatedAddons) {
    items.push({
      price_data: {
        currency: currency.toLowerCase(),
        unit_amount: Math.round(effectivePrice * 100),
        product_data: { name: addon.name },
      },
      quantity,
    });
  }
  return items;
}

function buildDocPermissions(userId) {
  return [
    Permission.read(Role.user(userId)),
    Permission.read(Role.label("admin")),
    Permission.read(Role.label("root")),
    Permission.update(Role.label("admin")),
    Permission.update(Role.label("root")),
  ];
}

/**
 * Trigger generate-ticket asynchronously (fire-and-forget).
 * Used for skipStripe paths where the stripe-webhook never fires.
 */
async function triggerGenerateTicket(client, orderId, log, error) {
  try {
    const fnId =
      process.env.APPWRITE_FUNCTION_GENERATE_TICKET || "generate-ticket";
    const functions = new Functions(client);
    await functions.createExecution(fnId, JSON.stringify({ orderId }), true);
    log(`Triggered generate-ticket for order ${orderId}`);
  } catch (err) {
    error(`generate-ticket trigger failed (non-blocking): ${err.message}`);
  }
}

/** Escape HTML to prevent injection in email templates. */
function escapeHtml(str) {
  if (typeof str !== "string") return String(str ?? "");
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Replace {{placeholder}} tokens in a template string. */
function renderTemplate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    return val !== undefined ? escapeHtml(val) : `{{${key}}}`;
  });
}

function formatCurrency(amount, currency) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/**
 * Send the Stripe payment link to the customer via email.
 * Fire-and-forget: logs failures but never throws.
 */
async function sendPaymentLinkEmail({
  db,
  customerEmail,
  customerName,
  orderNumber,
  experienceName,
  totalAmount,
  currency,
  paymentLinkUrl,
  targetUserId,
  log,
  error,
}) {
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!customerEmail || !EMAIL_RE.test(customerEmail)) {
    log(
      `sendPaymentLinkEmail: no valid email for order ${orderNumber} — skipping`,
    );
    return;
  }
  try {
    const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
    const COL_TEMPLATES =
      process.env.APPWRITE_COLLECTION_NOTIFICATION_TEMPLATES ||
      "notification_templates";
    const COL_PROFILES =
      process.env.APPWRITE_COLLECTION_USER_PROFILES || "user_profiles";

    // Determine customer language
    let useSpanish = false;
    if (targetUserId) {
      try {
        const profile = await db.getDocument(DB, COL_PROFILES, targetUserId);
        useSpanish = (profile.language || "en").startsWith("es");
      } catch {
        // No profile — default EN
      }
    }

    // Fetch template
    const tplRes = await db.listDocuments(DB, COL_TEMPLATES, [
      Query.equal("key", "payment-link"),
      Query.equal("type", "email"),
      Query.equal("isActive", true),
      Query.limit(1),
    ]);
    if (tplRes.documents.length === 0) {
      log(`sendPaymentLinkEmail: no active payment-link template — skipping`);
      return;
    }
    const tpl = tplRes.documents[0];
    const subject = useSpanish && tpl.subjectEs ? tpl.subjectEs : tpl.subject;
    const bodyTpl = useSpanish && tpl.bodyEs ? tpl.bodyEs : tpl.body;
    if (!subject || !bodyTpl) {
      log(`sendPaymentLinkEmail: template has empty subject/body — skipping`);
      return;
    }

    const vars = {
      customerName: customerName || "",
      orderNumber: orderNumber || "",
      experienceName: experienceName || "",
      totalAmount: formatCurrency(totalAmount, currency),
      paymentLinkUrl: paymentLinkUrl || "",
    };
    const renderedSubject = renderTemplate(subject, vars);
    const renderedBody = renderTemplate(bodyTpl, vars);

    const emailFrom = process.env.EMAIL_FROM || "OMZONE <noreply@omzone.com>";
    const provider = (process.env.EMAIL_PROVIDER || "resend").toLowerCase();

    if (provider === "resend") {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) throw new Error("RESEND_API_KEY not configured");
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: emailFrom,
          to: [customerEmail],
          subject: renderedSubject,
          html: renderedBody,
        }),
      });
      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`Resend ${response.status}: ${errBody}`);
      }
      const data = await response.json();
      log(
        `Payment link email sent via Resend id=${data.id} to ${customerEmail} for order ${orderNumber}`,
      );
    } else {
      throw new Error(
        `EMAIL_PROVIDER="${provider}" not supported in create-checkout`,
      );
    }
  } catch (err) {
    // Non-blocking — email failure must not break checkout
    error(`sendPaymentLinkEmail failed (non-blocking): ${err.message}`);
  }
}

// ─── Main Handler ────────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  if (req.method !== "POST") {
    return res.json(
      {
        ok: false,
        error: { code: "ERR_METHOD_NOT_ALLOWED", message: "Only POST allowed" },
      },
      405,
    );
  }

  const client = initClient(req);
  const db = new Databases(client);
  const users = new Users(client);

  let _step = "init";
  try {
    // ── 1. Parse input ─────────────────────────────────────────────────────
    _step = "parse-input";
    const rawBody = req.bodyText ?? req.body ?? "{}";
    const body = typeof rawBody === "string" ? JSON.parse(rawBody) : rawBody;
    const {
      experienceId,
      pricingTierId,
      slotId,
      addonIds = [],
      quantity,
      customerName,
      customerEmail,
      customerPhone,
      orderType = "direct",
      skipStripe = false,
      targetUserId,
      bookingRequestId,
      quotedAmount,
    } = body;

    // ── 2. Validate input ──────────────────────────────────────────────────
    _step = "validate-input";
    const isConversionType = orderType === "request-conversion";
    if (!experienceId || typeof experienceId !== "string") {
      // experienceId is optional for request-conversion (comes from booking request)
      if (!isConversionType) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_MISSING_EXPERIENCE",
              message: "experienceId is required",
            },
          },
          400,
        );
      }
    }
    if (
      !isConversionType &&
      (!pricingTierId || typeof pricingTierId !== "string")
    ) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_MISSING_TIER",
            message: "pricingTierId is required",
          },
        },
        400,
      );
    }
    if (!isConversionType && (!Number.isInteger(quantity) || quantity < 1)) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_INVALID_QUANTITY",
            message: "quantity must be an integer >= 1",
          },
        },
        400,
      );
    }
    if (
      !isConversionType &&
      (!customerName ||
        typeof customerName !== "string" ||
        customerName.trim().length === 0)
    ) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_MISSING_NAME",
            message: "customerName is required",
          },
        },
        400,
      );
    }
    if (
      !isConversionType &&
      (!customerEmail ||
        typeof customerEmail !== "string" ||
        !EMAIL_RE.test(customerEmail))
    ) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_INVALID_EMAIL",
            message: "Valid customerEmail is required",
          },
        },
        400,
      );
    }
    if (slotId !== undefined && slotId !== null && typeof slotId !== "string") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_INVALID_SLOT",
            message: "slotId must be a string",
          },
        },
        400,
      );
    }
    if (
      !Array.isArray(addonIds) ||
      addonIds.some((id) => typeof id !== "string")
    ) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_INVALID_ADDONS",
            message: "addonIds must be an array of strings",
          },
        },
        400,
      );
    }
    if (!["direct", "assisted", "request-conversion"].includes(orderType)) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_INVALID_ORDER_TYPE",
            message:
              "orderType must be 'direct', 'assisted', or 'request-conversion'",
          },
        },
        400,
      );
    }

    // ── 3. Authenticate ────────────────────────────────────────────────────
    _step = "authenticate";
    const callerUserId = req.headers["x-appwrite-user-id"];
    if (!callerUserId) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_AUTH_REQUIRED",
            message: "Authentication required",
          },
        },
        401,
      );
    }

    log(
      `Caller: ${callerUserId}, orderType: ${orderType}, hasApiKey: ${!!req.headers["x-appwrite-key"]}`,
    );

    // ── 3b. Assisted/conversion: verify caller is admin/root ────────────────
    const isAssistedSale = orderType === "assisted";
    const isRequestConversion = orderType === "request-conversion";
    if (isAssistedSale || isRequestConversion) {
      let callerUser;
      try {
        callerUser = await users.get(callerUserId);
      } catch (authErr) {
        error(
          `users.get(${callerUserId}) failed: ${authErr.message} [code=${authErr.code}, type=${authErr.type}]`,
        );
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_AUTH_FORBIDDEN",
              message: "Cannot verify caller identity",
            },
          },
          403,
        );
      }
      const callerLabels = callerUser.labels ?? [];
      if (!callerLabels.includes("admin") && !callerLabels.includes("root")) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_AUTH_FORBIDDEN",
              message:
                "Only admin users can create assisted sales or convert requests",
            },
          },
          403,
        );
      }
    }

    // For assisted: the order owner is the targetUserId (if provided) or the caller
    const orderUserId =
      isAssistedSale && targetUserId ? targetUserId : callerUserId;

    // ── 4. Environment ─────────────────────────────────────────────────────
    _step = "environment";
    const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
    const COL_EXPERIENCES =
      process.env.APPWRITE_COLLECTION_EXPERIENCES || "experiences";
    const COL_PRICING_TIERS =
      process.env.APPWRITE_COLLECTION_PRICING_TIERS || "pricing_tiers";
    const COL_SLOTS = process.env.APPWRITE_COLLECTION_SLOTS || "slots";
    const COL_ADDONS = process.env.APPWRITE_COLLECTION_ADDONS || "addons";
    const COL_ADDON_ASSIGNMENTS =
      process.env.APPWRITE_COLLECTION_ADDON_ASSIGNMENTS || "addon_assignments";
    const COL_ORDERS = process.env.APPWRITE_COLLECTION_ORDERS || "orders";
    const COL_ORDER_ITEMS =
      process.env.APPWRITE_COLLECTION_ORDER_ITEMS || "order_items";
    const COL_ACTIVITY_LOGS =
      process.env.APPWRITE_COLLECTION_ADMIN_ACTIVITY_LOGS ||
      "admin_activity_logs";
    const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

    // Stripe is only required for non-skipStripe flows
    if (!skipStripe && !STRIPE_SECRET) {
      error("STRIPE_SECRET_KEY not configured");
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CONFIG",
            message: "Payment service not configured",
          },
        },
        500,
      );
    }

    const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET) : null;

    // ── 4b. Request-conversion: early branch ───────────────────────────────
    if (isRequestConversion) {
      if (!bookingRequestId || typeof bookingRequestId !== "string") {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_MISSING_REQUEST",
              message: "bookingRequestId is required for request-conversion",
            },
          },
          400,
        );
      }
      if (typeof quotedAmount !== "number" || quotedAmount <= 0) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_INVALID_AMOUNT",
              message: "quotedAmount must be a positive number",
            },
          },
          400,
        );
      }

      const COL_BOOKING_REQUESTS =
        process.env.APPWRITE_COLLECTION_BOOKING_REQUESTS || "booking_requests";

      // Fetch & validate booking request
      let bookingReq;
      try {
        bookingReq = await db.getDocument(
          DB,
          COL_BOOKING_REQUESTS,
          bookingRequestId,
        );
      } catch {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_REQUEST_NOT_FOUND",
              message: "Booking request not found",
            },
          },
          404,
        );
      }
      if (bookingReq.status !== "approved") {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_REQUEST_NOT_APPROVED",
              message: "Booking request must be approved before conversion",
            },
          },
          400,
        );
      }
      if (bookingReq.convertedOrderId) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_REQUEST_ALREADY_CONVERTED",
              message: "Booking request was already converted",
            },
          },
          409,
        );
      }

      // Fetch experience (minimal validation)
      let rcExperience;
      try {
        rcExperience = await db.getDocument(
          DB,
          COL_EXPERIENCES,
          bookingReq.experienceId || experienceId,
        );
      } catch {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_EXPERIENCE_NOT_FOUND",
              message: "Experience not found",
            },
          },
          404,
        );
      }

      const rcCurrency = "MXN";
      const rcQuantity = quantity || bookingReq.participants || 1;
      const rcOrderNumber = generateOrderNumber();
      const rcOrderUserId = bookingReq.userId || callerUserId;
      const rcPermissions = buildDocPermissions(rcOrderUserId);

      // Build snapshot
      const rcSnapshot = JSON.stringify({
        snapshotVersion: 1,
        experienceId: rcExperience.$id,
        experienceName: rcExperience.publicName,
        experienceType: rcExperience.type,
        bookingRequestId: bookingReq.$id,
        quotedAmount,
        quantity: rcQuantity,
        currency: rcCurrency,
        subtotal: quotedAmount,
        addonsTotal: 0,
        taxAmount: 0,
        totalAmount: quotedAmount,
        customerName: (customerName || bookingReq.contactName || "").trim(),
        customerEmail: (customerEmail || bookingReq.contactEmail || "")
          .trim()
          .toLowerCase(),
        customerPhone: customerPhone || bookingReq.contactPhone || null,
        requestedDate: bookingReq.requestedDate || null,
        participants: rcQuantity,
        orderType: "request-conversion",
        convertedByUserId: callerUserId,
        snapshotAt: new Date().toISOString(),
      });

      const rcStatus = skipStripe ? "paid" : "pending";
      const rcPaymentStatus = skipStripe ? "succeeded" : "pending";
      const rcPaidAt = skipStripe ? new Date().toISOString() : null;

      const rcOrderData = {
        userId: rcOrderUserId,
        orderNumber: rcOrderNumber,
        orderType: "request-conversion",
        status: rcStatus,
        paymentStatus: rcPaymentStatus,
        currency: rcCurrency,
        subtotal: quotedAmount,
        taxAmount: 0,
        totalAmount: quotedAmount,
        customerName: (customerName || bookingReq.contactName || "").trim(),
        customerEmail: (customerEmail || bookingReq.contactEmail || "")
          .trim()
          .toLowerCase(),
        snapshot: rcSnapshot,
        notes: `Converted from booking request ${bookingReq.$id}`,
      };
      if (rcPaidAt) rcOrderData.paidAt = rcPaidAt;

      const rcOrder = await db.createDocument(
        DB,
        COL_ORDERS,
        ID.unique(),
        rcOrderData,
        rcPermissions,
      );
      log(
        `Request-conversion order created: ${rcOrder.$id} (${rcOrderNumber}) from request ${bookingReq.$id}`,
      );

      // Create single order item
      await db.createDocument(
        DB,
        COL_ORDER_ITEMS,
        ID.unique(),
        {
          orderId: rcOrder.$id,
          referenceId: rcExperience.$id,
          itemType: "edition",
          name: rcExperience.publicName,
          quantity: rcQuantity,
          unitPrice: quotedAmount / rcQuantity,
          currency: rcCurrency,
          totalPrice: quotedAmount,
          itemSnapshot: JSON.stringify({
            experienceId: rcExperience.$id,
            experienceName: rcExperience.publicName,
            experienceType: rcExperience.type,
            quotedAmount,
            bookingRequestId: bookingReq.$id,
          }),
        },
        rcPermissions,
      );

      // Log admin activity
      try {
        await db.createDocument(
          DB,
          COL_ACTIVITY_LOGS,
          ID.unique(),
          {
            userId: callerUserId,
            action: "request-conversion",
            entityType: "order",
            entityId: rcOrder.$id,
            details: JSON.stringify({
              orderNumber: rcOrderNumber,
              bookingRequestId: bookingReq.$id,
              quotedAmount,
              currency: rcCurrency,
              skipStripe,
            }),
          },
          [
            Permission.read(Role.label("admin")),
            Permission.read(Role.label("root")),
          ],
        );
      } catch (logErr) {
        error("Activity log failed: " + logErr.message);
      }

      // Update booking request
      await db.updateDocument(DB, COL_BOOKING_REQUESTS, bookingReq.$id, {
        status: "converted",
        convertedOrderId: rcOrder.$id,
        respondedAt: new Date().toISOString(),
      });

      if (skipStripe) {
        // No webhook fires for manual payment — trigger ticket generation directly
        await triggerGenerateTicket(client, rcOrder.$id, log, error);
        return res.json({
          ok: true,
          data: {
            orderId: rcOrder.$id,
            orderNumber: rcOrderNumber,
            paid: true,
            totalAmount: quotedAmount,
            currency: rcCurrency,
          },
        });
      }

      // Generate Stripe Payment Link for conversion
      const rcLineItems = [
        {
          price_data: {
            currency: rcCurrency.toLowerCase(),
            unit_amount: Math.round(quotedAmount * 100),
            product_data: {
              name: `${rcExperience.publicName} — Booking Request`,
            },
          },
          quantity: 1,
        },
      ];
      const rcPaymentLink = await stripe.paymentLinks.create({
        line_items: rcLineItems.map((item) => ({
          price_data: item.price_data,
          quantity: item.quantity,
        })),
        metadata: {
          orderId: rcOrder.$id,
          userId: rcOrderUserId,
          bookingRequestId: bookingReq.$id,
        },
        after_completion: {
          type: "redirect",
          redirect: {
            url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          },
        },
      });

      await db.updateDocument(DB, COL_ORDERS, rcOrder.$id, {
        stripeSessionId: rcPaymentLink.id,
      });
      log(
        `Stripe Payment Link for request-conversion: ${rcPaymentLink.id} for order ${rcOrder.$id}`,
      );

      // Fire-and-forget: email the payment link to the customer
      {
        const rcCustomerEmail = (customerEmail || bookingReq.contactEmail || "")
          .trim()
          .toLowerCase();
        const rcCustomerName = (
          customerName ||
          bookingReq.contactName ||
          ""
        ).trim();
        await sendPaymentLinkEmail({
          db,
          customerEmail: rcCustomerEmail,
          customerName: rcCustomerName,
          orderNumber: rcOrderNumber,
          experienceName: rcExperience.publicName,
          totalAmount: quotedAmount,
          currency: rcCurrency,
          paymentLinkUrl: rcPaymentLink.url,
          targetUserId: bookingReq.userId || null,
          log,
          error,
        });
      }

      return res.json({
        ok: true,
        data: {
          paymentLink: rcPaymentLink.url,
          orderId: rcOrder.$id,
          orderNumber: rcOrderNumber,
        },
      });
    }

    // ── 5. Validate experience ─────────────────────────────────────────────
    _step = "validate-experience";
    let experience;
    try {
      experience = await db.getDocument(DB, COL_EXPERIENCES, experienceId);
    } catch {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_EXPERIENCE_NOT_FOUND",
            message: "Experience not found",
          },
        },
        404,
      );
    }

    if (experience.status !== "published") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_EXPERIENCE_NOT_PUBLISHED",
            message: "Experience is not available",
          },
        },
        400,
      );
    }

    // Assisted sales bypass the saleMode check (admin can sell any mode)
    if (!isAssistedSale && experience.saleMode !== "direct") {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_SALE_MODE",
            message: "Experience is not available for direct purchase",
          },
        },
        400,
      );
    }

    if (experience.minQuantity && quantity < experience.minQuantity) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_MIN_QUANTITY",
            message: `Minimum quantity is ${experience.minQuantity}`,
          },
        },
        400,
      );
    }
    if (experience.maxQuantity && quantity > experience.maxQuantity) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_MAX_QUANTITY",
            message: `Maximum quantity is ${experience.maxQuantity}`,
          },
        },
        400,
      );
    }

    // ── 6. Validate pricing tier ───────────────────────────────────────────
    _step = "validate-pricing-tier";
    let tier;
    try {
      tier = await db.getDocument(DB, COL_PRICING_TIERS, pricingTierId);
    } catch {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_TIER_NOT_FOUND",
            message: "Pricing tier not found",
          },
        },
        404,
      );
    }

    if (tier.experienceId !== experienceId) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_TIER_MISMATCH",
            message: "Pricing tier does not belong to this experience",
          },
        },
        400,
      );
    }
    if (!tier.isActive) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_TIER_INACTIVE",
            message: "Pricing tier is not active",
          },
        },
        400,
      );
    }

    // ── 7. Validate slot (if required) ─────────────────────────────────────
    _step = "validate-slot";
    let slot = null;

    if (experience.requiresSchedule && !slotId && !isAssistedSale) {
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_SLOT_REQUIRED",
            message: "A slot is required for this experience",
          },
        },
        400,
      );
    }

    if (slotId) {
      try {
        slot = await db.getDocument(DB, COL_SLOTS, slotId);
      } catch {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_SLOT_NOT_FOUND",
              message: "Slot not found",
            },
          },
          404,
        );
      }

      if (slot.experienceId !== experienceId) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_SLOT_MISMATCH",
              message: "Slot does not belong to this experience",
            },
          },
          400,
        );
      }
      if (slot.status !== "published") {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_SLOT_UNAVAILABLE",
              message: "Slot is not available",
            },
          },
          400,
        );
      }
      if (new Date(slot.startDatetime) <= new Date()) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_SLOT_PAST",
              message: "Slot date has already passed",
            },
          },
          400,
        );
      }
      const available = slot.capacity - slot.bookedCount;
      if (available < quantity) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_SLOT_CAPACITY",
              message: `Only ${available} spots available`,
            },
          },
          409,
        );
      }
    }

    // ── 8. Validate addons ─────────────────────────────────────────────────
    _step = "validate-addons";
    const validatedAddons = [];
    for (const addonId of addonIds) {
      let addon;
      try {
        addon = await db.getDocument(DB, COL_ADDONS, addonId);
      } catch {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_ADDON_NOT_FOUND",
              message: `Addon ${addonId} not found`,
            },
          },
          404,
        );
      }
      if (addon.status !== "active") {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_ADDON_INACTIVE",
              message: `Addon "${addon.name}" is not active`,
            },
          },
          400,
        );
      }
      const assignments = await db.listDocuments(DB, COL_ADDON_ASSIGNMENTS, [
        Query.equal("addonId", addonId),
        Query.equal("experienceId", experienceId),
      ]);
      if (assignments.total === 0) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_CHECKOUT_ADDON_NOT_ASSIGNED",
              message: `Addon "${addon.name}" is not available for this experience`,
            },
          },
          400,
        );
      }
      const assignment = assignments.documents[0];
      const effectivePrice =
        assignment.overridePrice != null
          ? assignment.overridePrice
          : addon.basePrice;
      validatedAddons.push({ addon, assignment, effectivePrice });
    }

    // ── 9. Calculate prices (server-side only) ─────────────────────────────
    _step = "calculate-prices";
    const currency = tier.currency || "MXN";
    const subtotal = tier.basePrice * quantity;
    const addonsTotal = validatedAddons.reduce(
      (sum, { effectivePrice }) => sum + effectivePrice * quantity,
      0,
    );
    const taxAmount = 0;
    const totalAmount = subtotal + addonsTotal + taxAmount;

    // ── 10. Idempotency (direct only) ──────────────────────────────────────
    _step = "idempotency-check";
    if (!isAssistedSale) {
      const pendingOrders = await db.listDocuments(DB, COL_ORDERS, [
        Query.equal("userId", orderUserId),
        Query.equal("status", "pending"),
        Query.orderDesc("$createdAt"),
        Query.limit(10),
      ]);
      for (const pendingOrder of pendingOrders.documents) {
        try {
          const snap = JSON.parse(pendingOrder.snapshot || "{}");
          const matchesExperience = snap.experienceId === experienceId;
          const matchesTier = snap.pricingTierId === pricingTierId;
          const matchesSlot =
            (!slotId && !snap.slotId) || snap.slotId === slotId;
          if (matchesExperience && matchesTier && matchesSlot) {
            log(`Reusing pending order ${pendingOrder.$id}`);
            // Direct sale: create PaymentIntent (embedded Payment Element)
            const paymentIntent = await stripe.paymentIntents.create({
              amount: Math.round(pendingOrder.totalAmount * 100),
              currency: (snap.currency || "MXN").toLowerCase(),
              automatic_payment_methods: { enabled: true },
              metadata: { orderId: pendingOrder.$id, userId: orderUserId },
            });
            await db.updateDocument(DB, COL_ORDERS, pendingOrder.$id, {
              stripePaymentIntentId: paymentIntent.id,
              customerName: customerName.trim(),
              customerEmail: customerEmail.trim().toLowerCase(),
            });
            return res.json({
              ok: true,
              data: {
                clientSecret: paymentIntent.client_secret,
                orderId: pendingOrder.$id,
                orderNumber: pendingOrder.orderNumber,
              },
            });
          }
        } catch {
          // Skip malformed snapshots
        }
      }
    }

    // ── 11. Build snapshot ─────────────────────────────────────────────────
    _step = "build-snapshot";
    const snapshot = JSON.stringify({
      snapshotVersion: 1,
      experienceId: experience.$id,
      experienceName: experience.publicName,
      experienceNameEs: experience.publicNameEs || null,
      experienceType: experience.type,
      pricingTierId: tier.$id,
      pricingTierName: tier.name,
      pricingTierNameEs: tier.nameEs || null,
      basePrice: tier.basePrice,
      priceType: tier.priceType,
      slotId: slot ? slot.$id : null,
      slotStart: slot ? slot.startDatetime : null,
      slotEnd: slot ? slot.endDatetime : null,
      slotTimezone: slot ? slot.timezone : null,
      addons: validatedAddons.map(({ addon, effectivePrice }) => ({
        addonId: addon.$id,
        name: addon.name,
        nameEs: addon.nameEs || null,
        addonType: addon.addonType,
        basePrice: addon.basePrice,
        effectivePrice,
        priceType: addon.priceType,
      })),
      quantity,
      currency,
      subtotal,
      addonsTotal,
      taxAmount,
      totalAmount,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone ? String(customerPhone).trim() : null,
      orderType,
      assistedByUserId: isAssistedSale ? callerUserId : null,
      snapshotAt: new Date().toISOString(),
    });

    // ── 12. Create order ───────────────────────────────────────────────────
    _step = "create-order";
    const orderNumber = generateOrderNumber();
    const permissions = buildDocPermissions(orderUserId);

    // Assisted + skipStripe → create as paid immediately
    const initialStatus = isAssistedSale && skipStripe ? "paid" : "pending";
    const initialPaymentStatus =
      isAssistedSale && skipStripe ? "succeeded" : "pending";
    const paidAt =
      isAssistedSale && skipStripe ? new Date().toISOString() : null;

    const orderData = {
      userId: orderUserId,
      orderNumber,
      orderType,
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      currency,
      subtotal,
      taxAmount,
      totalAmount,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      snapshot,
      notes: isAssistedSale ? `Assisted by admin ${callerUserId}` : null,
    };
    if (paidAt) orderData.paidAt = paidAt;

    const order = await db.createDocument(
      DB,
      COL_ORDERS,
      ID.unique(),
      orderData,
      permissions,
    );
    // Guard: createDocument must return a valid document with $id
    if (!order || !order.$id) {
      error(
        `createDocument returned unexpected shape: keys=${order ? Object.keys(order).join(",") : "null"}`,
      );
      throw new Error("Order creation failed — invalid response from database");
    }
    log(
      `Order created: ${order.$id} (${orderNumber}) type=${orderType} status=${initialStatus}`,
    );

    // ── 13. Create order items ─────────────────────────────────────────────
    _step = "create-order-items";
    const mainItemData = {
      orderId: order.$id,
      referenceId: experienceId,
      itemType: "edition",
      name: experience.publicName,
      quantity,
      unitPrice: tier.basePrice,
      currency,
      totalPrice: subtotal,
      itemSnapshot: JSON.stringify({
        experienceId: experience.$id,
        experienceName: experience.publicName,
        experienceType: experience.type,
        tierId: tier.$id,
        tierName: tier.name,
        basePrice: tier.basePrice,
        priceType: tier.priceType,
        slotId: slot ? slot.$id : null,
        slotStart: slot ? slot.startDatetime : null,
        slotEnd: slot ? slot.endDatetime : null,
      }),
    };
    if (slot) mainItemData.slotId = slot.$id;
    await db.createDocument(
      DB,
      COL_ORDER_ITEMS,
      ID.unique(),
      mainItemData,
      permissions,
    );

    for (const { addon, effectivePrice } of validatedAddons) {
      await db.createDocument(
        DB,
        COL_ORDER_ITEMS,
        ID.unique(),
        {
          orderId: order.$id,
          referenceId: addon.$id,
          itemType: "addon",
          name: addon.name,
          quantity,
          unitPrice: effectivePrice,
          currency,
          totalPrice: effectivePrice * quantity,
          itemSnapshot: JSON.stringify({
            addonId: addon.$id,
            addonName: addon.name,
            addonType: addon.addonType,
            basePrice: addon.basePrice,
            effectivePrice,
            priceType: addon.priceType,
          }),
        },
        permissions,
      );
    }

    // ── 14. Log admin activity ─────────────────────────────────────────────
    if (isAssistedSale) {
      try {
        await db.createDocument(
          DB,
          COL_ACTIVITY_LOGS,
          ID.unique(),
          {
            userId: callerUserId,
            action: "assisted-sale",
            entityType: "order",
            entityId: order.$id,
            details: JSON.stringify({
              orderNumber,
              orderType,
              totalAmount,
              currency,
              customerEmail: customerEmail.trim().toLowerCase(),
              skipStripe,
            }),
          },
          [
            Permission.read(Role.label("admin")),
            Permission.read(Role.label("root")),
          ],
        );
      } catch (logErr) {
        // Non-fatal — log failure but don't abort the sale
        error("Activity log failed: " + logErr.message);
      }
    }

    // ── 15. Return for assisted + skipStripe (manual payment) ─────────────
    if (isAssistedSale && skipStripe) {
      // No webhook fires for manual payment — trigger ticket generation directly
      await triggerGenerateTicket(client, order.$id, log, error);
      return res.json({
        ok: true,
        data: {
          orderId: order.$id,
          orderNumber,
          paid: true,
          totalAmount,
          currency,
        },
      });
    }

    // ── 16. For assisted + Stripe: create Payment Link ────────────────────
    if (isAssistedSale && !skipStripe) {
      const lineItems = buildLineItems(
        experience,
        tier,
        validatedAddons,
        quantity,
        currency,
      );
      // Create a Stripe Payment Link (reusable link admin sends to client)
      const paymentLink = await stripe.paymentLinks.create({
        line_items: lineItems.map((item) => ({
          price_data: item.price_data,
          quantity: item.quantity,
        })),
        metadata: {
          orderId: order.$id,
          userId: orderUserId,
          assistedByUserId: callerUserId,
        },
        after_completion: {
          type: "redirect",
          redirect: {
            url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          },
        },
      });

      await db.updateDocument(DB, COL_ORDERS, order.$id, {
        stripeSessionId: paymentLink.id,
      });

      log(
        `Stripe Payment Link created: ${paymentLink.id} for order ${order.$id}`,
      );

      // Fire-and-forget: email the payment link to the customer
      await sendPaymentLinkEmail({
        db,
        customerEmail: customerEmail.trim().toLowerCase(),
        customerName: customerName.trim(),
        orderNumber,
        experienceName: experience.publicName,
        totalAmount,
        currency,
        paymentLinkUrl: paymentLink.url,
        targetUserId: targetUserId || null,
        log,
        error,
      });

      return res.json({
        ok: true,
        data: { paymentLink: paymentLink.url, orderId: order.$id, orderNumber },
      });
    }

    // ── 17. Direct sale: create Stripe PaymentIntent (embedded Payment Element) ──
    _step = "create-stripe-payment-intent";

    // Stripe enforces minimum amounts per currency
    const STRIPE_MIN_AMOUNTS = { mxn: 1000, usd: 50, eur: 50 };
    const amountInCents = Math.round(totalAmount * 100);
    const minCents = STRIPE_MIN_AMOUNTS[currency.toLowerCase()] || 50;
    if (amountInCents < minCents) {
      const minDisplay = (minCents / 100).toFixed(2);
      return res.json(
        {
          ok: false,
          error: {
            code: "ERR_CHECKOUT_AMOUNT_TOO_SMALL",
            message: `Minimum amount is $${minDisplay} ${currency.toUpperCase()}`,
          },
        },
        400,
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: { orderId: order.$id, userId: orderUserId },
    });

    await db.updateDocument(DB, COL_ORDERS, order.$id, {
      stripePaymentIntentId: paymentIntent.id,
    });
    log(
      `Stripe PaymentIntent created: ${paymentIntent.id} for order ${order.$id}`,
    );

    return res.json({
      ok: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        orderId: order.$id,
        orderNumber,
      },
    });
  } catch (err) {
    error(`create-checkout failed at step [${_step}]: ${err.message}`);
    return res.json(
      {
        ok: false,
        error: {
          code: "ERR_INTERNAL",
          message: "Internal error",
          _debug: {
            step: _step,
            msg: err.message,
            type: err.type || null,
            code: err.code || null,
          },
        },
      },
      500,
    );
  }
};
