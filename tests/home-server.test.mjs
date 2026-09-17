import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createRequestHandler } from "../server/home-handler.mjs";
import { render, publicConfig } from "../dist-ssr/entry-server.js";
import { DEFAULT_HOME_CONTENT } from "../src/lib/homeContent.js";

const template = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");
async function start(t, fetchImpl, extra = {}) {
  const server = createServer(createRequestHandler({
    distDir: fileURLToPath(new URL("../dist/", import.meta.url)), template, render,
    config: { ...publicConfig, siteUrl: "https://example.test", noindex: false, ...extra },
    fetchImpl, log: () => {},
  }));
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  return `http://127.0.0.1:${server.address().port}`;
}
const ok = (data = DEFAULT_HOME_CONTENT) => new Response(JSON.stringify(data), { status: 200 });

test("real React SSR puts content and unique SEO in initial HTML for both languages", async (t) => {
  const base = await start(t, async () => ok());
  for (const [route, suffix, lang] of [["/", "", "en"], ["/es", "Es", "es"]]) {
    const response = await fetch(base + route);
    const html = await response.text();
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.match(html, new RegExp(`<html lang="${lang}">`));
    assert.ok(html.includes(DEFAULT_HOME_CONTENT[`heroTitle${suffix}`]));
    assert.ok(html.includes(DEFAULT_HOME_CONTENT[`heroDescription${suffix}`]));
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.equal((html.match(/<title>/g) || []).length, 1);
    assert.equal((html.match(/name="description"/g) || []).length, 1);
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1);
    assert.equal((html.match(/rel="alternate"/g) || []).length, 3);
    const head = html.split("</head>")[0];
    assert.ok(head.includes(DEFAULT_HOME_CONTENT[`seoTitle${suffix}`]));
    assert.ok(head.includes(DEFAULT_HOME_CONTENT[`seoDescription${suffix}`]));
    assert.match(head, new RegExp(`rel="canonical" href="https://example.test${route}"`));
    assert.doesNotMatch(head, /noindex/);
  }
});
test("a publication changes the next response without rebuilding or restarting", async (t) => {
  let content = DEFAULT_HOME_CONTENT;
  let reads = 0;
  const base = await start(t, async (_url, init) => {
    reads++;
    assert.equal(init.headers["X-Appwrite-Key"], undefined);
    return ok(content);
  });
  await fetch(base + "/");
  content = { ...content, heroTitle: "New published H1", seoTitle: "New SEO title" };
  const html = await (await fetch(base + "/")).text();
  assert.match(html, /New published H1/);
  assert.match(html, /<title>New SEO title — OMZONE<\/title>/);
  assert.equal(reads, 2);
});
test("unavailable or invalid content returns 503 and preserves the last good HTML", async (t) => {
  let failure = false;
  const base = await start(t, async () => failure ? ok({}) : ok({ ...DEFAULT_HOME_CONTENT, heroTitle: "Last published" }));
  await fetch(base + "/");
  failure = true;
  const response = await fetch(base + "/");
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("retry-after"), "60");
  assert.match(await response.text(), /Last published/);
});
test("cold start and Appwrite timeout render a complete fallback with 503", async (t) => {
  const base = await start(t, async (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  }), { timeoutMs: 30, noindex: true });
  const response = await fetch(base + "/es");
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("x-robots-tag"), "noindex, nofollow");
  assert.ok((await response.text()).includes(DEFAULT_HOME_CONTENT.heroTitleEs));
});
test("plain text is escaped in visible content, metadata and bootstrap", async (t) => {
  const malicious = '</script><img src=x onerror="alert(1)">';
  const base = await start(t, async () => ok({ ...DEFAULT_HOME_CONTENT, heroTitle: malicious, seoTitle: malicious }));
  const html = await (await fetch(base + "/")).text();
  assert.doesNotMatch(html, /<img src=x/);
  const encoded = html.match(/id="omzone-home-data" type="application\/json">([\s\S]*?)<\/script>/)[1];
  assert.equal(JSON.parse(encoded).content.heroTitle, malicious);
  assert.doesNotMatch(encoded, /</);
});
test("redirects, HEAD, method restrictions and SPA routes remain functional", async (t) => {
  const base = await start(t, async () => ok());
  const redirect = await fetch(base + "/es/?x=1", { redirect: "manual" });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get("location"), "/es?x=1");
  assert.equal((await fetch(base + "/", { method: "HEAD" })).status, 200);
  assert.equal((await fetch(base + "/", { method: "POST" })).status, 405);
  assert.equal((await fetch(base + "/admin/hero-slides")).status, 200);
  assert.equal((await fetch(base + "/missing.js")).status, 404);
  assert.equal((await fetch(base + "/.env")).status, 404);
});
