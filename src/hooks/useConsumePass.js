import { useState, useCallback } from "react";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";

/**
 * Invokes the consume-pass Function.
 * Returns { consume, result, loading, error, reset }.
 */
export function useConsumePass() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const consume = useCallback(async ({ userPassId, slotId }) => {
    if (!userPassId || !slotId) {
      setError("Faltan datos para consumir el pase");
      return null;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const execution = await functions.createExecution(
        env.functionConsumePass,
        JSON.stringify({ userPassId, slotId }),
        false,
        "/",
        "POST",
        { "Content-Type": "application/json" },
      );

      const body = JSON.parse(execution.responseBody);

      if (execution.responseStatusCode >= 400 || !body.ok) {
        const msg = body?.error?.message || "Error al consumir el pase";
        setError(msg);
        return null;
      }

      setResult(body.data);
      return body.data;
    } catch (err) {
      setError(err.message || "Error de conexión");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { consume, result, loading, error, reset };
}
