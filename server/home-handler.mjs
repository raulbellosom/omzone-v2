import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import {
  DEFAULT_HOME_CONTENT, HOME_CONTENT_ID, homeLanguage,
  serializeHomeBootstrap, validateHomeContent,
} from "../src/lib/homeContent.js";

export function injectHomeHtml(template, result, bootstrap) {
  // Remove only the template's SEO tags. Favicons, fonts and Vite assets remain.
  const clean = template
    .replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\b[^>]*(?:name|property)=["'](?:description|robots|og:[^"']*|twitter:[^"']*)["'][^>]*>/gi, "")
    .replace(/<link\b[^>]*rel=["'](?:canonical|alternate)["'][^>]*>/gi, "");
  return clean
    .replace(/<html\b[^>]*>/i, () => `<html ${result.htmlAttributes}>`)
    .replace("</head>", () => `${result.head}</head>`)
    .replace('<div id="root"></div>', () => `<div id="root">${result.html}</div>`)
    .replace("</body>", () => `<script id="omzone-home-data" type="application/json">${serializeHomeBootstrap(bootstrap)}</script></body>`);
}

const TYPES = {
  ".js": "text/javascript", ".css": "text/css", ".json": "application/json",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2",
  ".xml": "application/xml", ".txt": "text/plain", ".pdf": "application/pdf",
  ".webmanifest": "application/manifest+json", ".html": "text/html",
};

export function createRequestHandler({ distDir, template, render, config, fetchImpl = fetch, log = console.error }) {
  let lastGood = null;
  const origin = new URL(config.siteUrl).origin;
  const timeoutMs = config.timeoutMs ?? 3000;
  return async (req, res) => {
    const respond = (status, body, type = "text/html; charset=utf-8", headers = {}) => {
      res.writeHead(status, {
        "Content-Type": type, "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
        ...(config.noindex ? { "X-Robots-Tag": "noindex, nofollow" } : {}),
        ...headers,
      });
      res.end(req.method === "HEAD" ? undefined : body);
    };
    try {
      if (!["GET", "HEAD"].includes(req.method)) return respond(405, "Method not allowed", "text/plain", { Allow: "GET, HEAD" });
      const url = new URL(req.url, origin);
      if (url.pathname === "/healthz") return respond(200, '{"status":"ok"}', "application/json");
      if (url.pathname === "/es/") return respond(308, "", "text/plain", { Location: `/es${url.search}` });
      if (homeLanguage(url.pathname)) {
        let content;
        let status = 200;
        try {
          const endpoint = `${config.appwriteEndpoint}/databases/${encodeURIComponent(config.appwriteDatabaseId)}/collections/${encodeURIComponent(config.collectionHomeContent)}/documents/${HOME_CONTENT_ID}`;
          const response = await fetchImpl(endpoint, {
            headers: { "X-Appwrite-Project": config.appwriteProjectId },
            cache: "no-store", signal: AbortSignal.timeout(timeoutMs),
          });
          if (!response.ok) throw new Error(`content_http_${response.status}`);
          const document = await response.json();
          const validation = validateHomeContent(document, config.allowedBuckets);
          if (!validation.valid) throw new Error("content_invalid");
          content = validation.data;
          lastGood = content;
        } catch (error) {
          status = 503;
          content = lastGood || DEFAULT_HOME_CONTENT;
          log(`[home] unavailable: ${error.name === "TimeoutError" ? "timeout" : "read_failed"}`);
        }
        // Only public configuration is serialized, never process.env or credentials.
        const bootstrap = { content, config: {
          siteUrl: origin, appwriteEndpoint: config.appwriteEndpoint,
          appwriteProjectId: config.appwriteProjectId, noindex: config.noindex,
        } };
        const result = render(url.pathname + url.search, bootstrap);
        return respond(status, injectHomeHtml(template, result, bootstrap), undefined,
          status === 503 ? { "Retry-After": "60" } : {});
      }

      // Useful for a local production preview. Nginx serves these files in production.
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { return respond(400, "Bad request"); }
      if (pathname.split(/[\\/]/).some((part) => part.startsWith(".")) || pathname.includes("\\")) {
        return respond(404, "Not found");
      }
      const target = path.resolve(distDir, `.${pathname}`);
      const relative = path.relative(distDir, target);
      if (relative.startsWith("..") || path.isAbsolute(relative)) return respond(404, "Not found");
      const info = await stat(target).catch(() => null);
      if (info?.isFile()) {
        return respond(200, await readFile(target), TYPES[path.extname(target)] || "application/octet-stream",
          pathname.startsWith("/assets/") ? { "Cache-Control": "public, max-age=31536000, immutable" } : {});
      }
      if (path.extname(pathname)) return respond(404, "Not found", "text/plain");
      return respond(200, template);
    } catch {
      log("[home] render_failed");
      respond(503, "Temporarily unavailable", "text/plain; charset=utf-8", { "Retry-After": "60" });
    }
  };
}
