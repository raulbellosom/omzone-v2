/**
 * @function submit-contact
 * @description Receives a contact form submission, verifies the reCAPTCHA v2 token
 *   server-side using the Google siteverify API, and — if valid — creates a document
 *   in the `contact_messages` collection. No authentication required; the function is
 *   open to any visitor via `execute: ["any"]`.
 * @trigger HTTP POST — invoked from the public /contact page
 *
 * @input {Object} payload
 * @input {string}  payload.name           - Sender's full name (required)
 * @input {string}  payload.email          - Sender's email address (required)
 * @input {string}  [payload.subject]      - Message subject (optional)
 * @input {string}  payload.message        - Message body, max 5000 chars (required)
 * @input {string}  payload.recaptchaToken - reCAPTCHA v2 response token (required)
 *
 * @output {Object} { ok: true, data: { documentId: string } }
 *
 * @errors
 * - 400 ERR_CONTACT_MISSING_FIELDS    — name, email, message, or recaptchaToken absent
 * - 400 ERR_CONTACT_INVALID_EMAIL     — email format invalid
 * - 400 ERR_CONTACT_MESSAGE_TOO_LONG  — message exceeds 5000 chars
 * - 403 ERR_CONTACT_CAPTCHA_FAILED    — reCAPTCHA verification returned success=false
 * - 500 ERR_CONTACT_INTERNAL          — unexpected error
 *
 * @idempotent No — each call creates a new document in contact_messages.
 *
 * @entities
 * - Writes: contact_messages
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT       (built-in, auto-injected)
 * - APPWRITE_FUNCTION_PROJECT_ID         (built-in, auto-injected)
 * - x-appwrite-key header                (built-in runtime, not an env var)
 * - APPWRITE_DATABASE_ID
 * - APPWRITE_COLLECTION_CONTACT_MESSAGES
 * - RECAPTCHA_SECRET_KEY
 */

import { Client, Databases, ID } from "node-appwrite";

// ─── Constants ────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE = 5000;
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initClient(req) {
  let endpoint = process.env.APPWRITE_FUNCTION_API_ENDPOINT;
  if (endpoint?.startsWith("http://")) {
    endpoint = endpoint.replace("http://", "https://");
  }
  return new Client()
    .setEndpoint(endpoint)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setSelfSigned(true)
    .setKey(req.headers["x-appwrite-key"]);
}

function ok(res, data) {
  return res.json({ ok: true, data }, 200);
}

function fail(res, status, code, message) {
  return res.json({ ok: false, error: { code, message } }, status);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default async ({ req, res, log, error }) => {
  const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";
  const COLLECTION =
    process.env.APPWRITE_COLLECTION_CONTACT_MESSAGES || "contact_messages";
  const RECAPTCHA_SECRET = process.env.RECAPTCHA_SECRET_KEY;

  try {
    // ── 1. Parse body ──────────────────────────────────────────────────────
    const body =
      typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});

    const { name, email, subject, message, recaptchaToken } = body;

    // ── 2. Validate required fields ───────────────────────────────────────
    if (
      !name?.trim() ||
      !email?.trim() ||
      !message?.trim() ||
      !recaptchaToken
    ) {
      return fail(
        res,
        400,
        "ERR_CONTACT_MISSING_FIELDS",
        "name, email, message, and recaptchaToken are required",
      );
    }

    if (!EMAIL_RE.test(email.trim())) {
      return fail(
        res,
        400,
        "ERR_CONTACT_INVALID_EMAIL",
        "Invalid email format",
      );
    }

    if (message.trim().length > MAX_MESSAGE) {
      return fail(
        res,
        400,
        "ERR_CONTACT_MESSAGE_TOO_LONG",
        `Message must be ${MAX_MESSAGE} characters or fewer`,
      );
    }

    // ── 3. Verify reCAPTCHA ───────────────────────────────────────────────
    if (!RECAPTCHA_SECRET) {
      error("RECAPTCHA_SECRET_KEY env var is not set");
      return fail(res, 500, "ERR_CONTACT_INTERNAL", "Server misconfiguration");
    }

    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET,
      response: recaptchaToken,
    });

    const verifyRes = await fetch(
      `${RECAPTCHA_VERIFY_URL}?${params.toString()}`,
      {
        method: "POST",
      },
    );

    if (!verifyRes.ok) {
      error(`reCAPTCHA API error: ${verifyRes.status}`);
      return fail(
        res,
        500,
        "ERR_CONTACT_INTERNAL",
        "Could not verify reCAPTCHA",
      );
    }

    const verifyData = await verifyRes.json();

    if (!verifyData.success) {
      log(`reCAPTCHA failed: ${JSON.stringify(verifyData["error-codes"])}`);
      return fail(
        res,
        403,
        "ERR_CONTACT_CAPTCHA_FAILED",
        "reCAPTCHA verification failed",
      );
    }

    // ── 4. Create document ────────────────────────────────────────────────
    const client = initClient(req);
    const databases = new Databases(client);

    const doc = await databases.createDocument(DB, COLLECTION, ID.unique(), {
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || null,
      message: message.trim(),
    });

    log(`Contact message created: ${doc.$id} from ${email.trim()}`);

    return ok(res, { documentId: doc.$id });
  } catch (err) {
    error(`ERR_CONTACT_INTERNAL: ${err.message}`);
    return fail(
      res,
      500,
      "ERR_CONTACT_INTERNAL",
      "An unexpected error occurred",
    );
  }
};
