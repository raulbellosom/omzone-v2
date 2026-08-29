import { useState, useEffect } from "react";
import { databases, Query } from "@/lib/appwrite";
import env from "@/config/env";
import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";

const DB = env.appwriteDatabaseId;
const COL_REDEMPTIONS = env.collectionTicketRedemptions;
const COL_ACTIVITY = env.collectionAdminActivityLogs;
const COL_PROFILES = env.collectionUserProfiles;

const ACTIVITY_LIMIT = 20;

/**
 * Loads a ticket's redemption record (who confirmed it, when, how) and its
 * full scan/action history from admin_activity_logs, plus the display names
 * of everyone involved. Read access to both collections is admin/root only —
 * callers must not mount this for non-admin viewers.
 */
export function useTicketActivity(ticketId) {
  const { t } = useLanguage();
  const [redemption, setRedemption] = useState(null);
  const [activity, setActivity] = useState([]);
  const [actors, setActors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ticketId) return;
    let cancelled = false;

    setLoading(true);
    setError(null);

    async function load() {
      try {
        const [redemptionRes, activityRes] = await Promise.all([
          databases.listDocuments(DB, COL_REDEMPTIONS, [
            Query.equal("ticketId", ticketId),
            Query.limit(1),
          ]),
          databases.listDocuments(DB, COL_ACTIVITY, [
            Query.equal("entityType", ["ticket", "tickets"]),
            Query.equal("entityId", ticketId),
            Query.orderDesc("$createdAt"),
            Query.limit(ACTIVITY_LIMIT),
          ]),
        ]);

        if (cancelled) return;

        const redemptionDoc = redemptionRes.documents[0] || null;
        const activityDocs = activityRes.documents;

        const userIds = [
          ...new Set(
            [redemptionDoc?.redeemedBy, ...activityDocs.map((d) => d.userId)].filter(
              Boolean,
            ),
          ),
        ];

        let profileMap = {};
        if (userIds.length > 0) {
          const profilesRes = await databases.listDocuments(DB, COL_PROFILES, [
            Query.equal("$id", userIds),
            Query.limit(userIds.length),
          ]);
          profileMap = Object.fromEntries(
            profilesRes.documents.map((p) => [p.$id, p]),
          );
        }

        if (cancelled) return;
        setRedemption(redemptionDoc);
        setActivity(activityDocs);
        setActors(profileMap);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, t));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [ticketId, t]);

  return { redemption, activity, actors, loading, error };
}
