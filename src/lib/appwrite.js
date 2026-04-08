import {
  Client,
  Account,
  Databases,
  Storage,
  Functions,
  ID,
  Query,
} from "appwrite";
import env from "@/config/env";

const client = new Client()
  .setEndpoint(env.appwriteEndpoint)
  .setProject(env.appwriteProjectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);

/**
 * Set the Appwrite client locale based on user preference.
 * Used before verification/recovery emails so Appwrite picks
 * the correct language template.
 */
export function syncLocale() {
  const STORAGE_KEY = "omzone_lang";
  let lang = "en";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") lang = stored;
  } catch {
    // Detect from browser
    const nav = navigator.language || "";
    if (nav.startsWith("es")) lang = "es";
  }
  client.setLocale(lang);
}

export { client, ID, Query };
