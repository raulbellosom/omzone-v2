import { useState, useCallback } from "react";
import { functions } from "@/lib/appwrite";
import env from "@/config/env";

async function callValidateTicket(payload) {
  const execution = await functions.createExecution(
    env.functionValidateTicket,
    JSON.stringify(payload),
    false, // async
    "/",
    "POST",
    { "Content-Type": "application/json" },
  );
  const body = JSON.parse(execution.responseBody);
  return { status: execution.responseStatusCode, body };
}

function outcomeFromErrorCode(code) {
  if (code === "ERR_VALIDATE_ALREADY_USED") return "used";
  if (code === "ERR_VALIDATE_CANCELLED") return "invalid_cancelled";
  if (code === "ERR_VALIDATE_EXPIRED") return "invalid_expired";
  return "invalid_not_found";
}

/**
 * Drives the two-step check-in flow against the validate-ticket function:
 * checkTicket() previews a ticket without consuming it, confirmEntry() marks
 * it used. Returns { state, checkTicket, confirmEntry, reset }.
 */
export function useTicketCheckIn() {
  const [state, setState] = useState({ phase: "idle", data: null, error: null });

  const checkTicket = useCallback(async (ticketCode) => {
    const sanitized = (ticketCode || "").trim();
    if (!sanitized) {
      setState({ phase: "idle", data: null, error: "Ingresa o escanea un código de pase" });
      return null;
    }

    setState({ phase: "loading", data: { ticketCode: sanitized }, error: null });

    try {
      const { status, body } = await callValidateTicket({
        ticketCode: sanitized,
        action: "check",
      });

      if (status >= 400) {
        const result = {
          outcome: outcomeFromErrorCode(body.error?.code),
          ticketCode: sanitized,
          ticket: body.data?.ticket ?? body.data ?? null,
          message: body.error?.message || "Validation failed",
          usedAt: body.error?.usedAt || null,
        };
        setState({ phase: "result", data: result, error: null });
        return result;
      }

      const schedule = body.data.schedule;
      const outcome = schedule && !schedule.withinWindow ? "schedule" : "valid";
      const result = {
        outcome,
        ticketCode: sanitized,
        ticket: body.data.ticket,
        schedule,
      };
      setState({ phase: "result", data: result, error: null });
      return result;
    } catch (err) {
      setState({ phase: "idle", data: null, error: err.message || "Failed to check ticket" });
      return null;
    }
  }, []);

  const confirmEntry = useCallback(async (ticketCode, method = "manual") => {
    setState((s) => ({ ...s, phase: "confirming" }));

    try {
      const { status, body } = await callValidateTicket({
        ticketCode,
        action: "confirm",
        method,
      });

      if (status >= 400) {
        // Someone else confirmed it between check and confirm.
        const result = {
          outcome: outcomeFromErrorCode(body.error?.code),
          ticketCode,
          ticket: body.data?.ticket ?? body.data ?? null,
          message: body.error?.message || "Ticket already used",
          usedAt: body.error?.usedAt || null,
        };
        setState({ phase: "result", data: result, error: null });
        return result;
      }

      const result = { outcome: "entered", ticketCode, ticket: body.data.ticket };
      setState({ phase: "entered", data: result, error: null });
      return result;
    } catch (err) {
      setState((s) => ({ ...s, phase: "result", error: err.message || "Failed to confirm entry" }));
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ phase: "idle", data: null, error: null });
  }, []);

  return { state, checkTicket, confirmEntry, reset };
}
