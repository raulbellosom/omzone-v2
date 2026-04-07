import { useState, useEffect, useCallback } from "react";
import { databases, Query, ID } from "@/lib/appwrite";
import env from "@/config/env";

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
} = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.limit(limit),
        Query.offset(offset),
        Query.orderDesc("$createdAt"),
      ];
      if (status) queries.push(Query.equal("status", status));
      if (paymentStatus) queries.push(Query.equal("paymentStatus", paymentStatus));
      if (search) queries.push(Query.search("orderNumber", search));

      const res = await databases.listDocuments(DB, COL_ORDERS, queries);
      setData(res.documents);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, paymentStatus, search, limit, offset]);

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

  useEffect(() => {
    if (!orderId) return;

    setLoading(true);
    setError(null);

    Promise.all([
      databases.getDocument(DB, COL_ORDERS, orderId),
      databases.listDocuments(DB, COL_ORDER_ITEMS, [
        Query.equal("orderId", orderId),
        Query.limit(100),
      ]),
      databases.listDocuments(DB, COL_PAYMENTS, [
        Query.equal("orderId", orderId),
        Query.limit(25),
        Query.orderDesc("$createdAt"),
      ]),
    ])
      .then(([orderDoc, itemsRes, paymentsRes]) => {
        setOrder(orderDoc);
        setItems(itemsRes.documents);
        setPayments(paymentsRes.documents);
      })
      .catch((err) => setError(err.message))
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

  const updateData = { status: newStatus };
  if (newStatus === "cancelled") {
    updateData.cancelledAt = new Date().toISOString();
  }

  return databases.updateDocument(DB, COL_ORDERS, orderId, updateData);
}
