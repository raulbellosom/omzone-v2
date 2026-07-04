# Pending fixes for production ("omzone")

**Date:** 2026-07-04
**Status:** Documented, not applied — production access was explicitly withheld

## Context

While building the check-in-access feature and verifying it against `omzone-dev`, we found and fixed a real, pre-existing bug (unrelated to the check-in feature itself) affecting how several Appwrite functions parse the request body. On this Appwrite runtime, `req.body` is already a parsed object when `Content-Type: application/json` is set — not a raw string — so `JSON.parse(req.body || "{}")` throws `"[object Object]" is not valid JSON`, causing the function to fail on every real invocation with a 500 internal error.

We do not have API access to the production project ("omzone", separate from "omzone-dev") from this environment, and the user explicitly asked not to touch production yet. This document exists so the exact same fix can be replicated there later without re-deriving it.

## What's already fixed and verified on `omzone-dev`

All of the following are committed on `main` and confirmed working live against `omzone-dev` (each now returns its real business-logic error instead of a 500):

| File | Commit | Call sites fixed |
|---|---|---|
| `functions/validate-ticket/src/main.js` | `c11f57d` | 1 |
| `functions/consume-pass/src/main.js` | `f22da34` | 1 |
| `functions/generate-ticket/src/main.js` | `f22da34` | 1 |
| `functions/assign-user-label/src/main.js` | `f22da34` | 3 |
| `functions/send-confirmation/src/main.js` | `f22da34` | 1 |
| `functions/send-notification/src/main.js` | `f22da34` | 1 |

The fix pattern applied everywhere:
```js
// before
const body = JSON.parse(req.body || "{}");
// after
const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
```
(`assign-user-label` has one variant, `req.body ? JSON.parse(req.body) : null`, adjusted to the equivalent `typeof` check — see the diff in `f22da34`.)

Functions confirmed to already be safe (no fix needed, already use the same defensive pattern or `req.bodyText`): `archive-document`, `archive-personal`, `hard-delete-document`, `log-event`, `restore-document`, `submit-contact`, `admin-order-action`. Confirmed to not touch `req.body` at all (cron-only, nothing to fix): `expire-payment-links`, `audit-cleanup`, `send-reminder`. `create-checkout` and `stripe-webhook` are also unaffected (use `req.bodyText`).

## What's also fixed and verified on `omzone-dev` (separate but related, same infra category)

- `validate-ticket` and `consume-pass` and `send-reminder` were all missing a `scopes` array entirely in their function config (a pre-existing gap, not caused by any of this work), meaning their dynamic API key had zero database/user permissions. Fixed in `appwrite.json` (commits `ae78bd6` and a later commit from the parallel consume-pass/scopes audit session) and applied live to `omzone-dev`.
- `functions/validate-ticket`'s `package-lock.json` was pinned to `node-appwrite@^13.0.0` while `package.json` required `^16.0.0` — a stale lockfile that made rebuilds non-deterministic. Regenerated in commit `c11f57d`.

## To do when production work is authorized

1. **Confirm whether production "omzone" actually has the same bugs** — this hasn't been checked yet (no production access from this environment). Check each function listed above for the same `JSON.parse(req.body...)` pattern and the same missing-`scopes` pattern before assuming it needs the identical fix; production may be on a different Appwrite runtime version where `req.body` behaves differently, or the scopes may already be configured correctly there.
2. If confirmed broken, apply the same code fixes (already written and tested — just deploy the same `functions/*/src/main.js` files that are on `main` now) and the same `scopes`/`package-lock.json` fixes to the production project.
3. Get the user's explicit sign-off before deploying anything to production — this is a live customer-facing project.
