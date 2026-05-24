/**
 * @function submit-contact
 * @description Receives a contact form submission, verifies the reCAPTCHA v2 token
 *   server-side using the Google siteverify API, and — if valid — creates a document
 *   in the `contact_messages` collection. No authentication required; the function is
 *   open to any visitor via `execute: ["any"]`.
 * @trigger HTTP POST — invoked from the public /contact, /facturacion, /billing-request pages
 *
 * @input {Object} payload
 * @input {string}  payload.name           - Sender's full name (required)
 * @input {string}  payload.email          - Sender's email address (required)
 * @input {string}  [payload.subject]      - Message subject (optional)
 * @input {string}  payload.message        - Message body, max 5000 chars (required)
 * @input {string}  payload.recaptchaToken - reCAPTCHA v2 response token (required)
 * @input {string}  [payload.category]     - Message category: contact|invoice_request|faq|support|other (default: contact)
 * @input {Object}  [payload.categoryData] - Category-specific extra data as JSON object (optional, sanitized)
 * @input {string}  [payload.phone]        - Sender's phone/WhatsApp number (optional)
 *
 * @output {Object} { ok: true, data: { documentId: string } }
 *
 * @errors
 * - 400 ERR_CONTACT_MISSING_FIELDS    — name, email, message, or recaptchaToken absent
 * - 400 ERR_CONTACT_INVALID_EMAIL     — email format invalid
 * - 400 ERR_CONTACT_MESSAGE_TOO_LONG  — message exceeds 5000 chars
 * - 400 ERR_CONTACT_INVALID_CATEGORY  — category value not in allowed list
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
const MAX_CATEGORY_DATA = 4000;
const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

const ALLOWED_CATEGORIES = [
  "contact",
  "invoice_request",
  "faq",
  "support",
  "other",
];

// Allowed keys per category to prevent injection of arbitrary data
const CATEGORY_DATA_KEYS = {
  invoice_request: [
    "orderCode",
    "whatsapp",
    "rfc",
    "taxRegime",
    "cfdiUse",
    "fiscalEmail",
    "additionalInfo",
    "orderFound",
  ],
  contact: ["preferredContact"],
  faq: ["topic"],
  support: ["topic", "preferredContact"],
  other: ["additionalInfo", "preferredContact"],
};

// Categories that can skip reCAPTCHA (low-risk, embedded quick forms)
const CAPTCHA_OPTIONAL_CATEGORIES = ["support", "other"];

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

/** Strip unknown keys and truncate string values to prevent oversized payloads */
function sanitizeCategoryData(category, raw) {
  if (!raw || typeof raw !== "object") return null;
  const allowedKeys = CATEGORY_DATA_KEYS[category] ?? [];
  if (allowedKeys.length === 0) return null;
  const sanitized = {};
  for (const key of allowedKeys) {
    if (raw[key] !== undefined && raw[key] !== null) {
      sanitized[key] = String(raw[key]).substring(0, 500);
    }
  }
  return Object.keys(sanitized).length > 0 ? sanitized : null;
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

    const {
      name,
      email,
      subject,
      message,
      recaptchaToken,
      category: rawCategory,
      categoryData: rawCategoryData,
      phone,
    } = body;

    // ── 2. Validate required fields ───────────────────────────────────────
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return fail(
        res,
        400,
        "ERR_CONTACT_MISSING_FIELDS",
        "name, email, and message are required",
      );
    }

    // recaptchaToken is required unless category is support/other
    const category =
      (typeof rawCategory === "string" ? rawCategory.trim() : null) ||
      "contact";
    const captchaOptional = CAPTCHA_OPTIONAL_CATEGORIES.includes(category);
    if (!recaptchaToken && !captchaOptional) {
      return fail(
        res,
        400,
        "ERR_CONTACT_MISSING_FIELDS",
        "recaptchaToken is required for this category",
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

    // ── 2b. Validate category ─────────────────────────────────────────────
    // (category already derived above before captcha check)
    if (!ALLOWED_CATEGORIES.includes(category)) {
      return fail(
        res,
        400,
        "ERR_CONTACT_INVALID_CATEGORY",
        `category must be one of: ${ALLOWED_CATEGORIES.join(", ")}`,
      );
    }

    // ── 2c. Sanitize categoryData ─────────────────────────────────────────
    const sanitizedCategoryData = sanitizeCategoryData(
      category,
      rawCategoryData,
    );
    let categoryDataStr = null;
    if (sanitizedCategoryData) {
      const serialized = JSON.stringify(sanitizedCategoryData);
      if (serialized.length <= MAX_CATEGORY_DATA) {
        categoryDataStr = serialized;
      }
    }

    // ── 3. Verify reCAPTCHA ───────────────────────────────────────────────
    if (recaptchaToken) {
      if (!RECAPTCHA_SECRET) {
        error("RECAPTCHA_SECRET_KEY env var is not set");
        return fail(
          res,
          500,
          "ERR_CONTACT_INTERNAL",
          "Server misconfiguration",
        );
      }

      const params = new URLSearchParams({
        secret: RECAPTCHA_SECRET,
        response: recaptchaToken,
      });

      const verifyRes = await fetch(
        `${RECAPTCHA_VERIFY_URL}?${params.toString()}`,
        { method: "POST" },
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
    } else {
      log(`reCAPTCHA skipped — category: ${category} (captcha-optional)`);
    }

    // ── 4. Create document ────────────────────────────────────────────────
    const client = initClient(req);
    const databases = new Databases(client);

    const doc = await databases.createDocument(DB, COLLECTION, ID.unique(), {
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || null,
      message: message.trim(),
      category,
      categoryData: categoryDataStr,
      phone: phone?.trim() || null,
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
