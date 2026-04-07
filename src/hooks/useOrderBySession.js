import { useState, useEffect } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL_ORDERS = env.collectionOrders;
const COL_ORDER_ITEMS = env.collectionOrderItems;
const COL_TICKETS = env.collectionTickets;

/**
 * Fetches an order by Stripe session ID, including its items and tickets.
 * Handles the timing issue where Stripe redirects before webhook completes.
 */
export function useOrderBySession(sessionId) {
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        const res = await databases.listDocuments(DB, COL_ORDERS, [
          Query.equal("stripeSessionId", sessionId),
          Query.limit(1),
        ]);

        if (cancelled) return;

        if (res.documents.length === 0) {
          setOrder(null);
          setItems([]);
          setTickets([]);
          setLoading(false);
          return;
        }

        const orderDoc = res.documents[0];
        setOrder(orderDoc);

        // Fetch items and tickets in parallel
        const [itemsRes, ticketsRes] = await Promise.all([
          databases.listDocuments(DB, COL_ORDER_ITEMS, [
            Query.equal("orderId", orderDoc.$id),
            Query.limit(100),
          ]),
          databases.listDocuments(DB, COL_TICKETS, [
            Query.equal("orderId", orderDoc.$id),
            Query.limit(100),
          ]),
        ]);

        if (cancelled) return;

        setItems(itemsRes.documents);
        setTickets(ticketsRes.documents);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return { order, items, tickets, loading, error };
}
