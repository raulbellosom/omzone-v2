#!/usr/bin/env node

/**
 * generate-sitemap.mjs
 *
 * Build-time script that queries Appwrite for published experiences & publications
 * and writes a sitemap.xml to public/sitemap.xml.
 *
 * Usage:
 *   export APPWRITE_API_KEY=$(grep APPWRITE_API_KEY .env | cut -d= -f2)
 *   node scripts/generate-sitemap.mjs
 *
 * Runs automatically via the "build" npm script.
 */

import { Client, Databases, Query } from "node-appwrite";
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Config ──────────────────────────────────────────────────────────────────

const SITE_URL = process.env.VITE_SITE_URL || "https://omzone.com";
const ENDPOINT =
  process.env.APPWRITE_ENDPOINT || "https://aprod.racoondevs.com/v1";
const PROJECT = process.env.APPWRITE_PROJECT_ID || "omzone-dev";
const API_KEY = process.env.APPWRITE_API_KEY;
const DB = process.env.APPWRITE_DATABASE_ID || "omzone_db";

if (!API_KEY) {
  console.warn(
    "[sitemap] APPWRITE_API_KEY not set — generating static-only sitemap.",
  );
}

// ─── Static pages ────────────────────────────────────────────────────────────

const STATIC_PAGES = [
  { loc: "/", changefreq: "weekly", priority: "1.0" },
  { loc: "/experiences", changefreq: "daily", priority: "0.9" },
  { loc: "/about", changefreq: "monthly", priority: "0.5" },
  { loc: "/contact", changefreq: "monthly", priority: "0.5" },
  { loc: "/privacy", changefreq: "yearly", priority: "0.3" },
  { loc: "/terms", changefreq: "yearly", priority: "0.3" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toW3CDate(iso) {
  return iso ? iso.split("T")[0] : new Date().toISOString().split("T")[0];
}

function slugIsValid(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  let xml = `  <url>\n    <loc>${escapeXml(SITE_URL + loc)}</loc>\n`;
  if (lastmod) xml += `    <lastmod>${toW3CDate(lastmod)}</lastmod>\n`;
  if (changefreq) xml += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority) xml += `    <priority>${priority}</priority>\n`;
  xml += `  </url>`;
  return xml;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const entries = [];

  // Static pages
  const today = new Date().toISOString();
  for (const page of STATIC_PAGES) {
    entries.push(urlEntry({ ...page, lastmod: today }));
  }

  // Dynamic pages from Appwrite
  if (API_KEY) {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT)
      .setKey(API_KEY);
    const db = new Databases(client);

    // Published experiences
    try {
      const expRes = await db.listDocuments(DB, "experiences", [
        Query.equal("status", "published"),
        Query.select(["slug", "$updatedAt"]),
        Query.limit(500),
      ]);
      for (const doc of expRes.documents) {
        if (!doc.slug || !slugIsValid(doc.slug)) continue;
        entries.push(
          urlEntry({
            loc: `/experiences/${doc.slug}`,
            lastmod: doc.$updatedAt,
            changefreq: "weekly",
            priority: "0.8",
          }),
        );
      }
      console.log(`[sitemap] ${expRes.documents.length} published experiences`);
    } catch (err) {
      console.error("[sitemap] Failed to fetch experiences:", err.message);
    }

    // Published publications
    try {
      const pubRes = await db.listDocuments(DB, "publications", [
        Query.equal("status", "published"),
        Query.select(["slug", "$updatedAt"]),
        Query.limit(500),
      ]);
      for (const doc of pubRes.documents) {
        if (!doc.slug || !slugIsValid(doc.slug)) continue;
        entries.push(
          urlEntry({
            loc: `/p/${doc.slug}`,
            lastmod: doc.$updatedAt,
            changefreq: "monthly",
            priority: "0.6",
          }),
        );
      }
      console.log(
        `[sitemap] ${pubRes.documents.length} published publications`,
      );
    } catch (err) {
      console.error("[sitemap] Failed to fetch publications:", err.message);
    }
  }

  // Build XML
  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...entries,
    `</urlset>`,
  ].join("\n");

  // Write to public/
  const dest = resolve(__dirname, "..", "public", "sitemap.xml");
  writeFileSync(dest, xml, "utf-8");
  console.log(`[sitemap] Written ${entries.length} URLs to ${dest}`);
}

main().catch((err) => {
  console.error("[sitemap] Fatal:", err);
  process.exit(1);
});
