/**
 * Script: add-archive-fields.mjs
 * Adds archivedAt / archivedBy / archiveReason (+ userArchivedAt for client entities)
 * and idx_archivedAt index to every target collection in appwrite.json.
 * Also registers the 4 new archive Functions.
 *
 * Run: node scripts/add-archive-fields.mjs
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(__dirname, "../appwrite.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

// ── Archive columns (admin-side) ───────────────────────────────────────────
const ARCHIVE_COLUMNS = [
  {
    key: "archivedAt",
    type: "datetime",
    required: false,
    array: false,
    default: null,
    format: "",
  },
  {
    key: "archivedBy",
    type: "string",
    required: false,
    array: false,
    size: 36,
    default: null,
    encrypt: false,
  },
  {
    key: "archiveReason",
    type: "string",
    required: false,
    array: false,
    size: 500,
    default: null,
    encrypt: false,
  },
];

// ── Personal archive column (client-side, does not affect admin view) ──────
const USER_ARCHIVED_AT_COLUMN = {
  key: "userArchivedAt",
  type: "datetime",
  required: false,
  array: false,
  default: null,
  format: "",
};

// ── Index ──────────────────────────────────────────────────────────────────
const IDX_ARCHIVED_AT = {
  key: "idx_archivedAt",
  type: "key",
  status: "available",
  columns: ["archivedAt"],
  orders: [],
};

const IDX_USER_ARCHIVED_AT = {
  key: "idx_userArchivedAt",
  type: "key",
  status: "available",
  columns: ["userArchivedAt"],
  orders: [],
};

// ── Target collections ─────────────────────────────────────────────────────
const ARCHIVABLE = [
  "experiences",
  "publications",
  "editions",
  "pricing_tiers",
  "pricing_rules",
  "addons",
  "packages",
  "passes",
  "locations",
  "rooms",
  "resources",
  "slots",
  "booking_requests",
  "bookings",
  "notification_templates",
  "tags",
  "hero_slides",
];

// These also get userArchivedAt so the client can hide from their own view
const PERSONAL_ARCHIVE = ["orders", "tickets", "user_passes"];

const ALL_TARGETS = [...ARCHIVABLE, ...PERSONAL_ARCHIVE];

// ── Patch tables ───────────────────────────────────────────────────────────
let updatedCount = 0;
for (const table of schema.tables) {
  if (!ALL_TARGETS.includes(table.$id)) continue;

  if (table.columns.some((c) => c.key === "archivedAt")) {
    console.log(`⏭  Skipping ${table.$id} — already has archivedAt`);
    continue;
  }

  // Add archive admin columns
  table.columns.push(...ARCHIVE_COLUMNS);

  // Add personal-archive column for client entities
  if (PERSONAL_ARCHIVE.includes(table.$id)) {
    table.columns.push(USER_ARCHIVED_AT_COLUMN);
  }

  // Add archivedAt index
  if (!table.indexes) table.indexes = [];
  if (!table.indexes.some((i) => i.key === "idx_archivedAt")) {
    table.indexes.push(IDX_ARCHIVED_AT);
  }

  // Add userArchivedAt index for client entities
  if (
    PERSONAL_ARCHIVE.includes(table.$id) &&
    !table.indexes.some((i) => i.key === "idx_userArchivedAt")
  ) {
    table.indexes.push(IDX_USER_ARCHIVED_AT);
  }

  console.log(`✅ Updated collection: ${table.$id}`);
  updatedCount++;
}

// ── Register new Functions ─────────────────────────────────────────────────
const NEW_FUNCTIONS = [
  {
    $id: "archive-document",
    name: "archive-document",
    runtime: "node-22",
    execute: ["users"],
    scopes: [
      "users.read",
      "documents.read",
      "documents.write",
      "databases.read",
      "collections.read",
    ],
    events: [],
    timeout: 30,
    enabled: true,
    logging: true,
    deploymentRetention: 0,
    entrypoint: "src/main.js",
    commands: "npm install",
    path: "functions/archive-document",
  },
  {
    $id: "restore-document",
    name: "restore-document",
    runtime: "node-22",
    execute: ["users"],
    scopes: [
      "users.read",
      "documents.read",
      "documents.write",
      "databases.read",
      "collections.read",
    ],
    events: [],
    timeout: 30,
    enabled: true,
    logging: true,
    deploymentRetention: 0,
    entrypoint: "src/main.js",
    commands: "npm install",
    path: "functions/restore-document",
  },
  {
    $id: "hard-delete-document",
    name: "hard-delete-document",
    runtime: "node-22",
    execute: ["users"],
    scopes: [
      "users.read",
      "documents.read",
      "documents.write",
      "documents.delete",
      "databases.read",
      "collections.read",
    ],
    events: [],
    timeout: 30,
    enabled: true,
    logging: true,
    deploymentRetention: 0,
    entrypoint: "src/main.js",
    commands: "npm install",
    path: "functions/hard-delete-document",
  },
  {
    $id: "archive-personal",
    name: "archive-personal",
    runtime: "node-22",
    execute: ["users"],
    scopes: [
      "users.read",
      "documents.read",
      "documents.write",
      "databases.read",
      "collections.read",
    ],
    events: [],
    timeout: 15,
    enabled: true,
    logging: true,
    deploymentRetention: 0,
    entrypoint: "src/main.js",
    commands: "npm install",
    path: "functions/archive-personal",
  },
];

for (const fn of NEW_FUNCTIONS) {
  if (schema.functions.some((f) => f.$id === fn.$id)) {
    console.log(`⏭  Function ${fn.$id} already registered`);
    continue;
  }
  schema.functions.push(fn);
  console.log(`✅ Registered function: ${fn.$id}`);
}

// ── Write output ───────────────────────────────────────────────────────────
writeFileSync(schemaPath, JSON.stringify(schema, null, 2) + "\n");
console.log(`\n🎉 Done. Updated ${updatedCount} collections in appwrite.json.`);
