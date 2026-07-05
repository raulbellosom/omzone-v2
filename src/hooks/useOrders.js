import { useState, useEffect, useCallback } from "react";
import { databases, functions, Query } from "@/lib/appwrite";
import env from "@/config/env";

import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";

const DB = env.appwriteDatabaseId;
const COL_ORDERS = env.collectionOrders;
const COL_ORDER_ITEMS = env.collectionOrderItems;
const COL_PAYMENTS = env.collectionPayments;

// ─── State Machine (mirrors backend reconciliation.js) ───────────────────────

const ORDER_TRANSITIONS = {
  pending: ["paid", "cancelled"],
  paid: ["confirmed", "refunded"],
  confirmed: ["refunded"],
  cancelled: [],
  refunded: [],
};

export function getAllowedOrderTransitions(currentStatus) {
  return ORDER_TRANSITIONS[currentStatus] || [];
}

export function isValidOrderTransition(from, to) {
  const allowed = ORDER_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

// ─── List Hook ───────────────────────────────────────────────────────────────

export function useOrders({
  status = "",
  paymentStatus = "",
  search = "",
  limit = 25,
  offset = 0,
  includeArchived = false,
} = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useLanguage();
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt"),
      ];
      if (!includeArchived) queries.push(Query.isNull("archivedAt"));
      if (status) queries.push(Query.equal("status", status));
      if (paymentStatus)
        queries.push(Query.equal("paymentStatus", paymentStatus));
      if (search) queries.push(Query.search("orderNumber", search));

      const res = await databases.listDocuments(DB, COL_ORDERS, queries);
      setData(res.documents);
      setTotal(res.total);
    } catch (err) {
      setError(getErrorMessage(err, t));
    } finally {
      setLoading(false);
    }
  }, [status, paymentStatus, search, includeArchived, limit, offset]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

// ─── Detail Hook ─────────────────────────────────────────────────────────────

export function useOrderDetail(orderId) {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useLanguage();
  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    // Appwrite IDs are alphanumeric + underscore only.
    // If the param has dashes or other chars it's an orderNumber (human-readable).
    const isAppwriteId = /^[a-zA-Z0-9_]+$/.test(orderId);

    const getOrderDoc = isAppwriteId
      ? databases.getDocument(DB, COL_ORDERS, orderId)
      : databases
          .listDocuments(DB, COL_ORDERS, [
            Query.equal("orderNumber", orderId),
            Query.limit(1),
          ])
          .then((res) => {
            if (!res.documents.length) throw new Error("Order not found");
            return res.documents[0];
          });

    getOrderDoc
      .then((orderDoc) => {
        const docId = orderDoc.$id;
        return Promise.all([
          Promise.resolve(orderDoc),
          databases.listDocuments(DB, COL_ORDER_ITEMS, [
            Query.equal("orderId", docId),
            Query.limit(100),
          ]),
          databases.listDocuments(DB, COL_PAYMENTS, [
            Query.equal("orderId", docId),
            Query.limit(25),
            Query.orderDesc("$createdAt"),
          ]),
        ]);
      })
      .then(([orderDoc, itemsRes, paymentsRes]) => {
        setOrder(orderDoc);
        setItems(itemsRes.documents);
        setPayments(paymentsRes.documents);
      })
      .catch((err) => setError(getErrorMessage(err, t)))
      .finally(() => setLoading(false));
  }, [orderId]);

  return { order, items, payments, loading, error };
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function updateOrderStatus(orderId, newStatus) {
  const order = await databases.getDocument(DB, COL_ORDERS, orderId);
  if (!isValidOrderTransition(order.status, newStatus)) {
    throw new Error(`Invalid transition: ${order.status} → ${newStatus}`);
  }

  const actionByStatus = {
    paid: "record_manual_payment",
    confirmed: "confirm_order",
    cancelled: "cancel_order",
    refunded: "mark_refunded",
  };
  const action = actionByStatus[newStatus];
  if (!action) {
    throw new Error(`Unsupported order action for status: ${newStatus}`);
  }

  const execution = await functions.createExecution(
    env.functionAdminOrderAction,
    JSON.stringify({ orderId, action }),
    false,
    "/",
    "POST",
    { "Content-Type": "application/json" },
  );
  const body = JSON.parse(execution.responseBody || "{}");
  if (!body.ok) {
    throw new Error(body.error?.message || "Order action failed");
  }
  return body.data?.order || body.data;
}

export async function resendPaymentLink(orderId) {
  const execution = await functions.createExecution(
    env.functionAdminOrderAction,
    JSON.stringify({ orderId, action: "resend_payment_link" }),
    false,
    "/",
    "POST",
    { "Content-Type": "application/json" },
  );
  const body = JSON.parse(execution.responseBody || "{}");
  if (!body.ok) {
    throw new Error(body.error?.message || "Resend failed");
  }
  return body.data;
}
