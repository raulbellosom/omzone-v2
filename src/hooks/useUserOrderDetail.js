import { useState, useEffect } from "react";
import { databases, Query } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL_ORDERS = env.collectionOrders;
const COL_ORDER_ITEMS = env.collectionOrderItems;
const COL_TICKETS = env.collectionTickets;

/**
 * Fetches a single order with items and associated tickets.
 * Verifies ownership (userId matches authenticated user).
 * Note: payments collection is not readable by clients — payment status
 * is shown from the order itself (paymentStatus field).
 */
export function useUserOrderDetail(orderId) {
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!orderId || !user?.$id) return;

    setLoading(true);
    setError(null);

    databases
      .getDocument(DB, COL_ORDERS, orderId)
      .then((orderDoc) => {
        // Security: verify ownership
        if (orderDoc.userId !== user.$id) {
          throw new Error("Order not found");
        }
        setOrder(orderDoc);

        // Fetch items and tickets in parallel
        return Promise.allSettled([
          databases.listDocuments(DB, COL_ORDER_ITEMS, [
            Query.equal("orderId", orderId),
            Query.limit(100),
          ]),
          databases.listDocuments(DB, COL_TICKETS, [
            Query.equal("orderId", orderId),
            Query.limit(100),
          ]),
        ]);
      })
      .then((results) => {
        if (!results) return;
        if (results[0].status === "fulfilled") {
          setItems(results[0].value.documents);
        }
        if (results[1].status === "fulfilled") {
          setTickets(results[1].value.documents);
        }
      })
      .catch((err) => setError(err.message || "Could not load order"))
      .finally(() => setLoading(false));
  }, [orderId, user?.$id]);

  return { order, items, tickets, loading, error };
}
