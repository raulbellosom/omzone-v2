// Opt-in integration check: creates only temporary users/documents in development.
// Never modifies the published home document. Always cleans up its own fixtures.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { Client, Databases, Users } from "node-appwrite";
import { DEFAULT_HOME_CONTENT } from "../src/lib/homeContent.js";

const vars = parseEnv(await readFile(".env", "utf8"));
if (vars.APPWRITE_PROJECT_ID !== "omzone-dev" || !vars.APPWRITE_API_KEY) throw new Error("Development project and API key required");
const sdk = new Client().setEndpoint(vars.APPWRITE_ENDPOINT).setProject(vars.APPWRITE_PROJECT_ID).setKey(vars.APPWRITE_API_KEY);
const databases = new Databases(sdk);
const users = new Users(sdk);
const db = vars.APPWRITE_DATABASE_ID || "omzone_db";
const collection = "home_content";
const prefix = `homeqa_${Date.now().toString(36)}`;
const docId = `${prefix}_doc`;
const createdUsers = [];
const base = `${vars.APPWRITE_ENDPOINT}/databases/${db}/collections/${collection}/documents`;
async function request(method, path, secret, body) {
  return fetch(base + path, { method, headers: {
    "X-Appwrite-Project": vars.APPWRITE_PROJECT_ID, "Content-Type": "application/json",
    ...(secret ? { "X-Appwrite-Session": secret } : {}),
  }, body: body ? JSON.stringify(body) : undefined });
}
try {
  await databases.createDocument(db, collection, docId, DEFAULT_HOME_CONTENT);
  for (const role of [null, "client", "operator", "admin", "root"]) {
    let secret;
    if (role) {
      const id = `${prefix}_${role}`;
      await users.create(id, undefined, undefined, undefined, "Home permission test");
      createdUsers.push(id);
      await users.updateLabels(id, [role]);
      secret = (await users.createSession(id)).secret;
      assert.ok(secret, "session secret required to test actual user permissions");
    }
    assert.equal((await request("GET", `/${docId}`, secret)).status, 200);
    const write = await request("PATCH", `/${docId}`, secret, { data: { heroTitle: "Permission test" } });
    assert.equal(write.status, ["admin", "root"].includes(role) ? 200 : 401, `${role || "anonymous"} update permission`);
    assert.equal((await request("DELETE", `/${docId}`, secret)).status, 401, `${role || "anonymous"} cannot delete`);
    const create = await request("POST", "", secret, { documentId: `${prefix}_extra`, data: DEFAULT_HOME_CONTENT });
    assert.equal(create.status, 401, `${role || "anonymous"} cannot create`);
    console.log(`${role || "anonymous"}: public read; update ${["admin", "root"].includes(role) ? "allowed" : "denied"}; create/delete denied`);
  }
} finally {
  for (const id of [docId, `${prefix}_extra`]) {
    await databases.deleteDocument(db, collection, id).catch((error) => { if (error.code !== 404) throw error; });
  }
  for (const id of createdUsers) await users.delete(id);
  console.log("Temporary permission fixtures removed");
}
