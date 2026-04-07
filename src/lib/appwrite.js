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

export { client, ID, Query };
