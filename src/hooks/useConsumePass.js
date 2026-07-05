import { useState, useCallback } from "react";
import { functions } from "@/lib/appwrite";
import { useLanguage } from "@/hooks/useLanguage";
import { getErrorMessage } from "@/lib/errors";
import env from "@/config/env";

/**
 * Invokes the consume-pass Function.
 * Returns { consume, result, loading, error, reset }.
 */
export function useConsumePass() {
  const { t } = useLanguage();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const consume = useCallback(async ({ userPassId, slotId }) => {
    if (!userPassId || !slotId) {
      setError(t("portal.usePass.errorMissingData"));
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
        setError(t("portal.usePass.errorGeneric"));
        return null;
      }

      setResult(body.data);
      return body.data;
    } catch (err) {
      setError(getErrorMessage(err, t, "portal.usePass.errorGeneric"));
      return null;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { consume, result, loading, error, reset };
}
