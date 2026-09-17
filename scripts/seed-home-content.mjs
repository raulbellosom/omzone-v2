import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { Client, Databases, Permission, Role } from "node-appwrite";
import { DEFAULT_HOME_CONTENT, HOME_CONTENT_ID } from "../src/lib/homeContent.js";

const args = process.argv.slice(2);
const option = (name) => args[args.indexOf(name) + 1];
if (!args.includes("--project") || !args.includes("--env-file")) {
  throw new Error("Usage: npm run setup:home -- --project omzone-dev --env-file .env");
}
const vars = parseEnv(await readFile(option("--env-file"), "utf8"));
if (!vars.APPWRITE_API_KEY || vars.APPWRITE_PROJECT_ID !== option("--project")) throw new Error("Missing API key or target project mismatch");
const manifest = JSON.parse(await readFile(new URL("../appwrite.json", import.meta.url), "utf8"));
const schema = manifest.tables.find((table) => table.$id === "home_content");
const dbId = vars.APPWRITE_DATABASE_ID || "omzone_db";
const db = new Databases(new Client().setEndpoint(vars.APPWRITE_ENDPOINT).setProject(vars.APPWRITE_PROJECT_ID).setKey(vars.APPWRITE_API_KEY));
const permissions = [Permission.read(Role.any()), Permission.update(Role.label("admin")), Permission.update(Role.label("root"))];
let collection;
try { collection = await db.getCollection(dbId, schema.$id); }
catch (error) {
  if (error.code !== 404) throw error;
  collection = await db.createCollection(dbId, schema.$id, schema.name, permissions, false, true);
}
if (JSON.stringify([...collection.$permissions].sort()) !== JSON.stringify([...permissions].sort()) || collection.documentSecurity || !collection.enabled) {
  throw new Error("Existing home_content permissions differ; inspect before changing them");
}
for (const field of schema.columns) {
  const existing = collection.attributes.find((attribute) => attribute.key === field.key);
  if (existing) {
    if (existing.type !== field.type || existing.size !== field.size || existing.required !== field.required || existing.array) throw new Error(`Incompatible column: ${field.key}`);
    continue;
  }
  await db.createStringAttribute(dbId, schema.$id, field.key, field.size, field.required);
}
const deadline = Date.now() + 60000;
while (true) {
  collection = await db.getCollection(dbId, schema.$id);
  if (collection.attributes.some((a) => a.status === "failed" || a.status === "stuck")) throw new Error("Column creation failed");
  if (schema.columns.every((field) => collection.attributes.some((a) => a.key === field.key && a.status === "available"))) break;
  if (Date.now() >= deadline) throw new Error("Columns not ready; safely rerun setup later");
  await new Promise((resolve) => setTimeout(resolve, 1000));
}
try {
  await db.getDocument(dbId, schema.$id, HOME_CONTENT_ID);
  console.log(`[home] ${vars.APPWRITE_PROJECT_ID}: existing content preserved`);
} catch (error) {
  if (error.code !== 404) throw error;
  try { await db.createDocument(dbId, schema.$id, HOME_CONTENT_ID, DEFAULT_HOME_CONTENT); }
  catch (createError) { if (createError.code !== 409) throw createError; }
  console.log(`[home] ${vars.APPWRITE_PROJECT_ID}: home content initialized`);
}
