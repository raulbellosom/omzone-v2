import assert from "node:assert/strict";
import {
  amountToMinorUnits,
  buildCheckoutCompletedOrderUpdate,
  getSessionOrderId,
  isOrderFulfilled,
  validateCheckoutSessionForOrder,
} from "./lifecycle.js";

const order = {
  $id: "order_123",
  status: "pending",
  paymentStatus: "pending",
  totalAmount: 200,
  currency: "USD",
  stripeSessionId: "cs_test_123",
};

const session = {
  id: "cs_test_123",
  metadata: { orderId: "order_123" },
  payment_status: "paid",
  amount_total: 20000,
  currency: "usd",
  payment_intent: "pi_123",
};

assert.equal(getSessionOrderId(session), "order_123");
assert.equal(amountToMinorUnits(200), 20000);
assert.deepEqual(validateCheckoutSessionForOrder(session, order), { ok: true });
assert.deepEqual(
  validateCheckoutSessionForOrder(
    { ...session, id: "cs_from_payment_link", payment_link: "plink_123" },
    { ...order, stripeSessionId: "plink_123" },
  ),
  { ok: true },
);
assert.deepEqual(
  validateCheckoutSessionForOrder(
    { ...session, amount_total: 19900 },
    order,
  ),
  { ok: false, reason: "amount_mismatch" },
);
assert.deepEqual(
  validateCheckoutSessionForOrder(
    { ...session, payment_status: "unpaid" },
    order,
  ),
  { ok: false, reason: "payment_not_paid" },
);
assert.deepEqual(
  buildCheckoutCompletedOrderUpdate(session, "2026-05-06T00:00:00.000Z"),
  {
    status: "confirmed",
    paymentStatus: "succeeded",
    paidAt: "2026-05-06T00:00:00.000Z",
    stripeSessionId: "cs_test_123",
    stripePaymentIntentId: "pi_123",
  },
);
assert.equal(
  isOrderFulfilled({ status: "confirmed", paymentStatus: "succeeded" }),
  true,
);
assert.equal(
  isOrderFulfilled({ status: "pending", paymentStatus: "succeeded" }),
  false,
);

console.log("stripe webhook lifecycle tests passed");
