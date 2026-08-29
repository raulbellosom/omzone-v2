import { useState, useEffect, useCallback } from "react";
import { databases, Query } from "@/lib/appwrite";
import { useAuth } from "@/hooks/useAuth";
import env from "@/config/env";

const DB = env.appwriteDatabaseId;
const COL_NOTIFICATIONS = env.collectionClientNotifications;
const POLL_INTERVAL_MS = 60 * 1000;

/**
 * Polls the authenticated client's in-app notifications. No Realtime
 * subscription exists in this codebase yet, so this follows the same
 * setInterval pattern already used by useCheckInSummary.
 */
export function useClientNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    if (!user?.$id) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    try {
      const res = await databases.listDocuments(DB, COL_NOTIFICATIONS, [
        Query.equal("userId", user.$id),
        Query.orderDesc("$createdAt"),
        Query.limit(20),
      ]);
      setNotifications(res.documents);
    } catch {
      // Background convenience feature — keep last-known-good data.
    } finally {
      setLoading(false);
    }
  }, [user?.$id]);

  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.$id === notificationId ? { ...n, isRead: true } : n)),
    );
    try {
      await databases.updateDocument(DB, COL_NOTIFICATIONS, notificationId, {
        isRead: true,
        readAt: new Date().toISOString(),
      });
    } catch {
      // Best-effort — a failed mark-as-read just means it reappears as unread.
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return { notifications, unreadCount, loading, markAsRead, refetch: fetchNotifications };
}
