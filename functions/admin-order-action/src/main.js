import { Client, Databases, Functions, ID, Users } from "node-appwrite";

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

async function assertAdmin(users, userId) {
  if (!userId) {
    const err = new Error("Authentication required");
    err.status = 401;
    throw err;
  }

  const user = await users.get(userId);
  const labels = user.labels || [];
  if (!labels.includes("admin") && !labels.includes("root")) {
    const err = new Error("Only admin users can manage order actions");
    err.status = 403;
    throw err;
  }
}

async function trigger(functions, functionId, payload, log, error) {
  try {
    await functions.createExecution(functionId, JSON.stringify(payload), true);
    log(`Triggered ${functionId} for order ${payload.orderId}`);
  } catch (err) {
    error(`Failed to trigger ${functionId}: ${err.message}`);
  }
}

async function createManualPayment(db, DB, COL_PAYMENTS, order, actorUserId) {
  await db.createDocument(DB, COL_PAYMENTS, ID.unique(), {
    orderId: order.$id,
    amount: Number(order.totalAmount || 0),
    currency: (order.currency || "MXN").toUpperCase(),
    status: "succeeded",
    method: "manual",
    metadata: JSON.stringify({
      eventType: "admin_manual_payment",
      orderId: order.$id,
      orderNumber: order.orderNumber,
      actorUserId,
      registeredAt: new Date().toISOString(),
    }),
  });
}

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
  const functions = new Functions(client);

  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COL_ORDERS = process.env.APPWRITE_COLLECTION_ORDERS || "orders";
  const COL_PAYMENTS = process.env.APPWRITE_COLLECTION_PAYMENTS || "payments";
  const FUNC_GENERATE_TICKET =
    process.env.APPWRITE_FUNCTION_GENERATE_TICKET || "generate-ticket";
  const FUNC_SEND_CONFIRMATION =
    process.env.APPWRITE_FUNCTION_SEND_CONFIRMATION || "send-confirmation";
  const FUNC_SEND_NOTIFICATION =
    process.env.APPWRITE_FUNCTION_SEND_NOTIFICATION || "send-notification";

  try {
    await assertAdmin(users, req.headers["x-appwrite-user-id"]);

    const body = JSON.parse(req.bodyText ?? req.body ?? "{}");
    const { orderId, action } = body;
    if (!orderId || typeof orderId !== "string") {
      return res.json(
        {
          ok: false,
          error: { code: "ERR_MISSING_ORDER", message: "orderId is required" },
        },
        400,
      );
    }
    if (
      ![
        "record_manual_payment",
        "confirm_order",
        "cancel_order",
        "mark_refunded",
        "retry_ticket_generation",
        "resend_confirmation",
      ].includes(action)
    ) {
      return res.json(
        {
          ok: false,
          error: { code: "ERR_INVALID_ACTION", message: "Invalid action" },
        },
        400,
      );
    }

    const order = await db.getDocument(DB, COL_ORDERS, orderId);
    const actorUserId = req.headers["x-appwrite-user-id"];

    if (action === "record_manual_payment") {
      if (["cancelled", "refunded"].includes(order.status)) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_ORDER_CLOSED",
              message: "Closed orders cannot be manually paid",
            },
          },
          409,
        );
      }
      await createManualPayment(db, DB, COL_PAYMENTS, order, actorUserId);
      const updated = await db.updateDocument(DB, COL_ORDERS, orderId, {
        status: "confirmed",
        paymentStatus: "succeeded",
        paidAt: order.paidAt || new Date().toISOString(),
      });
      await trigger(functions, FUNC_GENERATE_TICKET, { orderId }, log, error);
      return res.json({ ok: true, data: { order: updated } });
    }

    if (action === "confirm_order") {
      if (order.paymentStatus !== "succeeded") {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_PAYMENT_REQUIRED",
              message: "Payment must be succeeded before confirmation",
            },
          },
          409,
        );
      }
      const updated = await db.updateDocument(DB, COL_ORDERS, orderId, {
        status: "confirmed",
      });
      await trigger(functions, FUNC_GENERATE_TICKET, { orderId }, log, error);
      return res.json({ ok: true, data: { order: updated } });
    }

    if (action === "cancel_order") {
      if (["confirmed", "refunded"].includes(order.status)) {
        return res.json(
          {
            ok: false,
            error: {
              code: "ERR_INVALID_CANCEL",
              message: "Confirmed or refunded orders cannot be cancelled here",
            },
          },
          409,
        );
      }
      const updated = await db.updateDocument(DB, COL_ORDERS, orderId, {
        status: "cancelled",
        paymentStatus:
          order.paymentStatus === "succeeded" ? order.paymentStatus : "failed",
        cancelledAt: new Date().toISOString(),
      });

      // Notify customer
      if (order.customerEmail) {
        const experienceName = (() => {
          try {
            return JSON.parse(order.snapshot || "{}").experienceName || "";
          } catch {
            return "";
          }
        })();
        await trigger(
          functions,
          FUNC_SEND_NOTIFICATION,
          {
            templateKey: "order-cancelled",
            orderId,
            userId: order.userId || null,
            recipientEmail: order.customerEmail,
            recipientName: order.customerName || "",
            vars: {
              orderNumber: order.orderNumber || orderId,
              customerName: order.customerName || "",
              experienceName: experienceName || "—",
              adminNote: body.note || "",
            },
          },
          log,
          error,
        );
      }

      return res.json({ ok: true, data: { order: updated } });
    }

    if (action === "mark_refunded") {
      const updated = await db.updateDocument(DB, COL_ORDERS, orderId, {
        status: "refunded",
        paymentStatus: "refunded",
      });

      // Notify customer
      if (order.customerEmail) {
        const experienceName = (() => {
          try {
            return JSON.parse(order.snapshot || "{}").experienceName || "";
          } catch {
            return "";
          }
        })();
        await trigger(
          functions,
          FUNC_SEND_NOTIFICATION,
          {
            templateKey: "order-refunded",
            orderId,
            userId: order.userId || null,
            recipientEmail: order.customerEmail,
            recipientName: order.customerName || "",
            vars: {
              orderNumber: order.orderNumber || orderId,
              customerName: order.customerName || "",
              experienceName: experienceName || "—",
              adminNote: body.note || "",
            },
          },
          log,
          error,
        );
      }

      return res.json({ ok: true, data: { order: updated } });
    }

    if (action === "retry_ticket_generation") {
      await trigger(functions, FUNC_GENERATE_TICKET, { orderId }, log, error);
      return res.json({ ok: true, data: { triggered: FUNC_GENERATE_TICKET } });
    }

    await trigger(functions, FUNC_SEND_CONFIRMATION, { orderId }, log, error);
    return res.json({ ok: true, data: { triggered: FUNC_SEND_CONFIRMATION } });
  } catch (err) {
    error(`admin-order-action failed: ${err.message}`);
    return res.json(
      {
        ok: false,
        error: {
          code: "ERR_ADMIN_ORDER_ACTION",
          message: err.message || "Order action failed",
        },
      },
      err.status || 500,
    );
  }
};
