import { useState, useEffect } from "react";
import { databases, Query } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import env from "@/config/env";

import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";

const DB = env.appwriteDatabaseId;
const COL_ORDERS = env.collectionOrders;
const COL_ORDER_ITEMS = env.collectionOrderItems;
const COL_TICKETS = env.collectionTickets;

/**
 * Fetches an order by Stripe session ID or direct order ID, including its items and tickets.
 * Handles the timing issue where Stripe redirects before webhook completes.
 */
export function useOrderBySession(sessionId, orderId) {
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { t } = useLanguage();
  useEffect(() => {
    if (authLoading) return;

    if (!user?.$id) {
      setOrder(null);
      setItems([]);
      setTickets([]);
      setLoading(false);
      setError(t("common.errorNotFound"));
      return;
    }

    if (!sessionId && !orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    let pollTimer = null;
    let attempts = 0;

    async function fetch() {
      setLoading(true);
      setError(null);
      try {
        let orderDoc = null;

        if (orderId) {
          // Direct lookup by order ID (Payment Element flow)
          try {
            orderDoc = await databases.getDocument(DB, COL_ORDERS, orderId);
          } catch {
            // Order not found
          }
        } else if (sessionId) {
          // Legacy lookup by Stripe session ID (Checkout redirect flow)
          const res = await databases.listDocuments(DB, COL_ORDERS, [
            Query.equal("stripeSessionId", sessionId),
            Query.limit(1),
          ]);
          if (res.documents.length > 0) {
            orderDoc = res.documents[0];
          }
        }

        if (cancelled) return;

        if (!orderDoc) {
          setOrder(null);
          setItems([]);
          setTickets([]);
          setLoading(false);
          return;
        }

        if (orderDoc.userId !== user.$id) {
          throw new Error("Order not found");
        }

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

        if (
          orderDoc.status === "pending" &&
          orderDoc.paymentStatus !== "failed" &&
          attempts < 6
        ) {
          attempts += 1;
          pollTimer = window.setTimeout(fetch, 2500);
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, t));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetch();

    return () => {
      cancelled = true;
      if (pollTimer) window.clearTimeout(pollTimer);
    };
  }, [sessionId, orderId, user?.$id, authLoading]);

  return { order, items, tickets, loading, error };
}
