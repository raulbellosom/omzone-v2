import { useState, useEffect, useCallback } from "react";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";

const POLL_INTERVAL_MS = 75 * 1000;

async function callCheckinSummary() {
  const execution = await functions.createExecution(
    env.functionCheckinSummary,
    "{}",
    false,
    "/",
    "POST",
    { "Content-Type": "application/json" },
  );
  const body = JSON.parse(execution.responseBody);
  return { status: execution.responseStatusCode, body };
}

/**
 * Fetches the check-in page's daily summary (stats, upcoming sessions,
 * alerts, recent activity). Refreshes on a fixed interval; callers should
 * also invoke `refetch()` right after a successful check-in confirmation
 * so the operator sees it reflected without waiting for the next tick.
 */
export function useCheckInSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      const { status, body } = await callCheckinSummary();
      if (status < 400 && body.ok) {
        setData(body.data);
      }
      // On failure, silently keep the last-known-good data — this is a
      // background-refreshed convenience panel, not the primary scan flow.
    } catch {
      // Network error — keep last-known-good data.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    const id = setInterval(fetchSummary, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchSummary]);

  return { data, loading, refetch: fetchSummary };
}
