import { useState, useCallback } from "react";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";

/**
 * Invokes the validate-ticket Function and manages result state.
 * Returns { validate, result, loading, error, reset }.
 */
export function useValidateTicket() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validate = useCallback(async (ticketCode) => {
    const sanitized = ticketCode.trim();
    if (!sanitized) {
      setError("Please enter a ticket code");
      return null;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const execution = await functions.createExecution(
        env.functionValidateTicket,
        JSON.stringify({ ticketCode: sanitized }),
        false, // async
        "/", // path
        "POST",
        { "Content-Type": "application/json" },
      );

      const body = JSON.parse(execution.responseBody);

      if (execution.responseStatusCode >= 400) {
        const entry = {
          success: false,
          ticketCode: sanitized,
          message: body.message || "Validation failed",
          status: body.status || null,
          usedAt: body.usedAt || null,
          timestamp: new Date().toISOString(),
        };
        setResult(entry);
        return entry;
      }

      const entry = {
        success: true,
        ticketCode: sanitized,
        message: body.message || "Check-in successful",
        ticket: body.ticket || null,
        timestamp: new Date().toISOString(),
      };
      setResult(entry);
      return entry;
    } catch (err) {
      const msg = err.message || "Failed to validate ticket";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { validate, result, loading, error, reset };
}
