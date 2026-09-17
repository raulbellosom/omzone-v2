import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createRequestHandler } from "./home-handler.mjs";
import { render, publicConfig } from "../dist-ssr/entry-server.js";

// API endpoint/project are compiled alongside the browser bundle. Do not allow
// a runtime override to silently mix production HTML with development queries.
const config = {
  ...publicConfig,
  siteUrl: process.env.PUBLIC_SITE_URL || publicConfig.siteUrl,
  noindex: process.env.HOME_NOINDEX !== "false",
  timeoutMs: Number(process.env.HOME_TIMEOUT_MS || 3000),
};
if (!/^https?:$/.test(new URL(config.siteUrl).protocol)) throw new Error("Invalid PUBLIC_SITE_URL");
if (!Number.isFinite(config.timeoutMs) || config.timeoutMs < 100 || config.timeoutMs > 30000) throw new Error("Invalid HOME_TIMEOUT_MS");
const distDir = fileURLToPath(new URL("../dist/", import.meta.url));
const template = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
const server = createServer(createRequestHandler({ distDir, template, render, config }));
server.listen(Number(process.env.PORT || 3000), process.env.HOST || "127.0.0.1", () => {
  console.log(`[home] listening on ${process.env.HOST || "127.0.0.1"}:${process.env.PORT || 3000}; project=${config.appwriteProjectId}; noindex=${config.noindex}`);
});
for (const signal of ["SIGTERM", "SIGINT"]) process.on(signal, () => {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
});
