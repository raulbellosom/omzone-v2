// Uses the browser installed by the existing md-to-pdf development dependency.
// Run after npm run build:ssr. Appwrite requests are isolated fixtures here;
// database permission checks are a separate integration verification.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { render, publicConfig } from "../dist-ssr/entry-server.js";
import { createRequestHandler } from "../server/home-handler.mjs";
import { DEFAULT_HOME_CONTENT } from "../src/lib/homeContent.js";

let content = { ...DEFAULT_HOME_CONTENT, $id: "home", $updatedAt: new Date().toISOString() };
let role = null;
let writes = 0;
let failWrites = false;
const server = createServer(createRequestHandler({
  distDir: fileURLToPath(new URL("../dist/", import.meta.url)),
  template: await readFile(new URL("../dist/index.html", import.meta.url), "utf8"), render,
  config: { ...publicConfig, siteUrl: "http://localhost:3000", noindex: true },
  fetchImpl: async () => new Response(JSON.stringify(content)),
}));
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME_BIN || undefined });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1000 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (/hydration|hydrating|Minified React error/i.test(message.text())) errors.push(message.text()); });
  await page.setRequestInterception(true);
  page.on("request", async (request) => {
    const url = new URL(request.url());
    if (url.origin === origin || url.protocol === "data:") return request.continue();
    if (!url.pathname.startsWith("/v1/")) return request.abort();
    const headers = { "access-control-allow-origin": origin, "access-control-allow-credentials": "true",
      "access-control-allow-methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "access-control-allow-headers": request.headers()["access-control-request-headers"] || "*" };
    const reply = (body, status = 200) => request.respond({ status, headers, contentType: "application/json", body: JSON.stringify(body) });
    if (request.method() === "OPTIONS") return reply({});
    if (url.pathname === "/v1/account") return role
      ? reply({ $id: "test-user", name: "Editor", email: "editor@example.test", labels: [role], emailVerification: true, prefs: {} })
      : reply({ message: "Unauthorized", code: 401, type: "general_unauthorized_scope" }, 401);
    if (url.pathname.endsWith("/home_content/documents/home")) {
      if (request.method() === "PATCH") {
        writes++;
        if (failWrites) return reply({ message: "Unavailable", code: 503 }, 503);
        content = { ...content, ...JSON.parse(request.postData()).data, $updatedAt: new Date().toISOString() };
      }
      return reply(content);
    }
    if (url.pathname.endsWith("/files")) return reply({ total: 0, files: [] });
    return reply({ total: 0, documents: [], responseBody: '{"ok":true}' });
  });
  await page.evaluateOnNewDocument(() => localStorage.setItem("omzone_lang", "es"));
  await page.goto(origin + "/", { waitUntil: "networkidle0" });
  assert.equal(await page.$eval("h1", (el) => el.textContent), content.heroTitle);
  assert.equal(await page.$eval("html", (el) => el.lang), "en");
  await page.goto(origin + "/es", { waitUntil: "networkidle0" });
  assert.equal(await page.$eval("h1", (el) => el.textContent), content.heroTitleEs);
  assert.equal(await page.$$eval('head meta[name="description"]', (els) => els.length), 1);
  assert.equal(await page.$$eval('head link[rel="canonical"]', (els) => els.length), 1);
  assert.equal(await page.$$eval('head title', (els) => els.length), 1);
  assert.deepEqual(errors, [], "SSR must hydrate without recoverable errors");
  await page.click('header nav a[href="/about"]');
  await page.waitForFunction(() => location.pathname === "/about");
  await page.waitForSelector('header a[href="/es"]');
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click('header a[href="/es"]')]);
  assert.equal(await page.$eval("h1", (el) => el.textContent), content.heroTitleEs);
  await page.goto(origin + "/login", { waitUntil: "networkidle0" });
  assert.ok((await page.$$('a[href="/es"]')).length > 0, "auth Home links preserve Spanish");
  for (const label of ["operator", "client"]) {
    role = label;
    await page.goto(origin + "/admin/hero-slides", { waitUntil: "networkidle0" });
    assert.equal(await page.$("#home-heroTitle"), null, `${label} cannot access editor`);
  }
  role = "admin";
  await page.goto(origin + "/admin", { waitUntil: "networkidle0" });
  await page.click('a[href="/admin/hero-slides"]');
  await page.waitForSelector("#home-heroTitle");
  const fill = async (selector, value) => { await page.focus(selector); await page.keyboard.down("Control"); await page.keyboard.press("A"); await page.keyboard.up("Control"); await page.keyboard.press("Backspace"); if (value) await page.type(selector, value); };
  await fill("#home-heroTitle", "Browser published title");
  const blockedNavigation = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Back did not warn about unsaved changes")), 5000);
    page.once("dialog", async (dialog) => { clearTimeout(timer); await dialog.dismiss(); resolve(); });
  });
  await page.evaluate(() => window.history.back());
  await blockedNavigation;
  await page.waitForFunction(() => location.pathname === "/admin/hero-slides");
  assert.equal(await page.$eval("#home-heroTitle", (el) => el.value), "Browser published title");
  await page.click("#home-tab-seo");
  await fill("#home-seoTitle", "Browser SEO");
  await page.click("#home-tab-content");
  assert.equal(await page.$eval("#home-heroTitle", (el) => el.value), "Browser published title");
  await fill("#home-heroDescriptionEs", "");
  await page.click('form button[type="submit"]');
  assert.equal(writes, 0, "incomplete EN/ES publication must not reach Appwrite");
  await fill("#home-heroDescriptionEs", DEFAULT_HOME_CONTENT.heroDescriptionEs);
  failWrites = true;
  await page.click('form button[type="submit"]');
  await page.waitForSelector('form [role="alert"]');
  assert.equal(await page.$eval("#home-heroTitle", (el) => el.value), "Browser published title");
  failWrites = false;
  await page.click('form button[type="submit"]');
  await page.waitForFunction(() => document.querySelector('form button[type="submit"]').disabled);
  assert.equal(content.heroTitle, "Browser published title");
  assert.equal(content.seoTitle, "Browser SEO");
  await page.setViewport({ width: 390, height: 844 });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, "editor fits mobile viewport");
  await page.goto(origin + "/", { waitUntil: "networkidle0" });
  assert.equal(await page.$eval("h1", (el) => el.textContent), content.heroTitle);
  assert.equal(await page.title(), "Browser SEO — OMZONE");
  assert.deepEqual(errors, []);
  console.log("Browser passed: hydration EN/ES, metadata, return navigation, role guards, unsaved Back protection, tabs, validation, failed save, publication, mobile.");
} finally {
  await browser?.close();
  await new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); });
}
