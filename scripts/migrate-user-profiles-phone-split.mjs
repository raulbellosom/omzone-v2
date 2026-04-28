/**
 * Migration: user_profiles — remove displayName, add countryPhoneCode + phoneNumber
 *
 * Steps:
 *  1. Delete index  displayName_fulltext
 *  2. Delete attribute  displayName
 *  3. Create attribute  countryPhoneCode  (varchar 10)
 *  4. Create attribute  phoneNumber       (varchar 20)
 *  5. Create index      idx_phoneNumber   (key on phoneNumber)
 *
 * Run once from project root:
 *   node scripts/migrate-user-profiles-phone-split.mjs
 */

const ENDPOINT = "https://aprod.racoondevs.com/v1";
const PROJECT = "omzone-dev";
const API_KEY =
  "standard_3f208275bdff3b3bbf147f2a41f64240c737bbcde0a4a2cb209bf2fa91bedeff07ecca04ae6ea2470f11e316ce9dfb19778c778fb8d0247ddd864a17e369af111529327d007a07404012242ecfc88078e3308cbc9a4d5f1dbefbc2ad9fdaec71e016d763ccb81d67feb8d5858353b5f26fa371ce422b8774c21eead8af21e9aa";
const DATABASE = "omzone_db";
const COLLECTION = "user_profiles";

const BASE = `${ENDPOINT}/databases/${DATABASE}/collections/${COLLECTION}`;

const headers = {
  "Content-Type": "application/json",
  "X-Appwrite-Project": PROJECT,
  "X-Appwrite-Key": API_KEY,
};

async function req(method, path, body) {
  const url = `${BASE}${path}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, json };
}

async function run() {
  console.log("=== user_profiles migration: phone split ===\n");

  // 1. Delete displayName_fulltext index
  console.log("1. Deleting index: displayName_fulltext");
  const r1 = await req("DELETE", "/indexes/displayName_fulltext");
  if (r1.ok || r1.status === 404) {
    console.log("   ✓ deleted (or did not exist)");
  } else {
    console.warn("   ⚠ unexpected status", r1.status, JSON.stringify(r1.json));
  }

  // Appwrite needs a moment after index deletion before attribute deletion
  await new Promise((r) => setTimeout(r, 2000));

  // 2. Delete displayName attribute
  console.log("2. Deleting attribute: displayName");
  const r2 = await req("DELETE", "/attributes/displayName");
  if (r2.ok || r2.status === 404) {
    console.log("   ✓ deleted (or did not exist)");
  } else {
    console.warn("   ⚠ unexpected status", r2.status, JSON.stringify(r2.json));
  }

  // Give Appwrite time to process the deletion before adding new attributes
  await new Promise((r) => setTimeout(r, 3000));

  // 3. Create countryPhoneCode attribute
  console.log("3. Creating attribute: countryPhoneCode (varchar 10)");
  const r3 = await req("POST", "/attributes/string", {
    key: "countryPhoneCode",
    size: 10,
    required: false,
    default: null,
    array: false,
  });
  if (r3.ok || r3.status === 409) {
    console.log("   ✓ created (or already exists)");
  } else {
    console.warn("   ⚠ unexpected status", r3.status, JSON.stringify(r3.json));
  }

  // 4. Create phoneNumber attribute
  console.log("4. Creating attribute: phoneNumber (varchar 20)");
  const r4 = await req("POST", "/attributes/string", {
    key: "phoneNumber",
    size: 20,
    required: false,
    default: null,
    array: false,
  });
  if (r4.ok || r4.status === 409) {
    console.log("   ✓ created (or already exists)");
  } else {
    console.warn("   ⚠ unexpected status", r4.status, JSON.stringify(r4.json));
  }

  // Wait for attributes to reach "available" status before creating index
  console.log("   (waiting 5s for attributes to become available…)");
  await new Promise((r) => setTimeout(r, 5000));

  // 5. Create idx_phoneNumber index
  console.log("5. Creating index: idx_phoneNumber (key on phoneNumber)");
  const r5 = await req("POST", "/indexes", {
    key: "idx_phoneNumber",
    type: "key",
    attributes: ["phoneNumber"],
    orders: ["ASC"],
  });
  if (r5.ok || r5.status === 409) {
    console.log("   ✓ created (or already exists)");
  } else {
    console.warn("   ⚠ unexpected status", r5.status, JSON.stringify(r5.json));
  }

  console.log("\n=== Migration complete ===");
  console.log("Remember to update appwrite.json to reflect the new schema.");
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
