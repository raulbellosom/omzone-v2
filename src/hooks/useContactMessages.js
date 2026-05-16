import { useState, useEffect, useCallback } from "react";
import { databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL = env.collectionContactMessages;

const PAGE_SIZE = 25;

/** List contact messages with optional isRead filter */
export function useContactMessages({ filter = "all", search = "", page = 0 } = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const queries = [
        Query.orderDesc("$createdAt"),
        Query.limit(PAGE_SIZE),
        Query.offset(page * PAGE_SIZE),
      ];
      if (filter === "unread") queries.push(Query.equal("isRead", false));
      if (filter === "read") queries.push(Query.equal("isRead", true));
      // Appwrite doesn't support full-text on email/name by default, so we filter client-side
      const result = await databases.listDocuments(DB, COL, queries);
      let docs = result.documents;
      if (search) {
        const q = search.toLowerCase();
        docs = docs.filter(
          (d) =>
            d.name?.toLowerCase().includes(q) ||
            d.email?.toLowerCase().includes(q) ||
            d.subject?.toLowerCase().includes(q),
        );
      }
      setData(docs);
      setTotal(result.total);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, total, loading, error, refetch: fetch };
}

/** Get a single contact message by id */
export function useContactMessage(id) {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const doc = await databases.getDocument(DB, COL, id);
      setMessage(doc);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { message, loading, error, refetch: fetch };
}

/** Count unread messages — for dashboard badge */
export function useUnreadContactCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    databases
      .listDocuments(DB, COL, [
        Query.equal("isRead", false),
        Query.limit(1),
      ])
      .then((r) => setCount(r.total))
      .catch(() => {});
  }, []);

  return count;
}

/** Update isRead + optional adminNotes on a message */
export async function updateContactMessage(id, { isRead, adminNotes, readAt } = {}) {
  const data = {};
  if (isRead !== undefined) data.isRead = isRead;
  if (adminNotes !== undefined) data.adminNotes = adminNotes;
  if (readAt !== undefined) data.readAt = readAt;
  return databases.updateDocument(DB, COL, id, data);
}
