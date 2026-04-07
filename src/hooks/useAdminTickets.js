import { useState, useEffect, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL_TICKETS = env.collectionTickets;
const COL_EXPERIENCES = env.collectionExperiences;
const COL_SLOTS = env.collectionSlots;
const COL_ORDERS = env.collectionOrders;

// ─── List Hook ───────────────────────────────────────────────────────────────

export function useAdminTickets({
  status = "",
  experienceId = "",
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
      if (experienceId) queries.push(Query.equal("experienceId", experienceId));
      if (search) queries.push(Query.search("ticketCode", search));

      const res = await databases.listDocuments(DB, COL_TICKETS, queries);
      setData(res.documents);
      setTotal(res.total);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [status, experienceId, search, limit, offset]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

// ─── Detail Hook ─────────────────────────────────────────────────────────────

export function useTicketDetail(ticketId) {
  const [ticket, setTicket] = useState(null);
  const [experience, setExperience] = useState(null);
  const [slot, setSlot] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticketId) return;

    setLoading(true);
    setError(null);

    databases
      .getDocument(DB, COL_TICKETS, ticketId)
      .then(async (ticketDoc) => {
        setTicket(ticketDoc);

        const promises = [];

        // Fetch experience
        if (ticketDoc.experienceId) {
          promises.push(
            databases
              .getDocument(DB, COL_EXPERIENCES, ticketDoc.experienceId)
              .catch(() => null),
          );
        } else {
          promises.push(Promise.resolve(null));
        }

        // Fetch slot
        if (ticketDoc.slotId) {
          promises.push(
            databases
              .getDocument(DB, COL_SLOTS, ticketDoc.slotId)
              .catch(() => null),
          );
        } else {
          promises.push(Promise.resolve(null));
        }

        // Fetch order
        if (ticketDoc.orderId) {
          promises.push(
            databases
              .getDocument(DB, COL_ORDERS, ticketDoc.orderId)
              .catch(() => null),
          );
        } else {
          promises.push(Promise.resolve(null));
        }

        const [exp, sl, ord] = await Promise.all(promises);
        setExperience(exp);
        setSlot(sl);
        setOrder(ord);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ticketId]);

  return { ticket, experience, slot, order, loading, error };
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export async function invalidateTicket(ticketId) {
  return databases.updateDocument(DB, COL_TICKETS, ticketId, {
    status: "cancelled",
  });
}
