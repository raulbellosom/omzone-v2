/**
 * generate-docs-pdf.mjs
 * Genera dos PDFs en español:
 *   1. omzone-docs-tecnica.pdf  — docs/core + docs/architecture + docs/tasks
 *   2. omzone-docs-usuario.pdf  — src/docs/content/es/** (todas las secciones)
 *
 * Uso: node scripts/generate-docs-pdf.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { mdToPdf } from "md-to-pdf";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "docs");

fs.mkdirSync(OUT, { recursive: true });

// ─── CSS compartido ───────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px;
    line-height: 1.65;
    color: #1a1a1a;
    background: #fff;
  }

  /* Portada de sección */
  .section-cover {
    page-break-before: always;
    padding: 72px 0 48px;
    border-bottom: 3px solid #0f0f0f;
    margin-bottom: 40px;
  }
  .section-cover h1 {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
  }
  .section-cover p {
    font-size: 14px;
    color: #666;
  }

  /* Separador de documento */
  .doc-start { page-break-before: always; padding-top: 24px; }

  h1 { font-size: 22px; font-weight: 700; margin: 28px 0 12px; }
  h2 { font-size: 17px; font-weight: 600; margin: 22px 0 10px; border-bottom: 1px solid #e5e5e5; padding-bottom: 4px; }
  h3 { font-size: 14px; font-weight: 600; margin: 16px 0 8px; }
  h4 { font-size: 13px; font-weight: 600; margin: 12px 0 6px; }

  p { margin: 8px 0; }
  ul, ol { margin: 8px 0 8px 20px; }
  li { margin: 3px 0; }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 12px;
  }
  th {
    background: #f5f5f5;
    font-weight: 600;
    text-align: left;
    padding: 7px 10px;
    border: 1px solid #ddd;
  }
  td {
    padding: 6px 10px;
    border: 1px solid #ddd;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #fafafa; }

  code {
    font-family: 'Fira Code', 'Cascadia Code', 'Courier New', monospace;
    font-size: 11.5px;
    background: #f3f3f3;
    border: 1px solid #e0e0e0;
    border-radius: 3px;
    padding: 1px 5px;
  }
  pre {
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 6px;
    padding: 14px 16px;
    margin: 12px 0;
    overflow: hidden;
    font-size: 11.5px;
    line-height: 1.55;
  }
  pre code {
    background: none;
    border: none;
    padding: 0;
    color: inherit;
  }

  blockquote {
    border-left: 3px solid #ccc;
    padding: 4px 14px;
    margin: 10px 0;
    color: #555;
    font-style: italic;
  }

  hr { border: none; border-top: 1px solid #e5e5e5; margin: 20px 0; }

  a { color: #0066cc; text-decoration: none; }

  /* Header / footer de página */
  @page {
    margin: 20mm 18mm 20mm 18mm;
    @top-center { content: "OMZONE — Documentación"; font-size: 10px; color: #aaa; }
    @bottom-right { content: counter(page); font-size: 10px; color: #aaa; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Quita el frontmatter YAML de un archivo .md */
function stripFrontmatter(content) {
  return content.replace(/^---[\s\S]*?---\n?/, "");
}

/** Convierte links relativos .md y rutas /docs/... a URLs absolutas de omzone.com */
function fixLinks(content) {
  const BASE = "https://omzone.com/help/docs/es";
  // Fix absolute-path links like [text](/docs/section/slug) → https://omzone.com/help/docs/es/section/slug
  content = content.replace(/\]\(\/docs\/([\w/-]+)\)/g, `](${BASE}/$1)`);
  // Fix relative links like [text](../section/slug.md) → https://omzone.com/help/docs/es/section/slug
  content = content.replace(
    /\]\(\.\.\/([\w-]+)\/([\w-]+)\.md\)/g,
    `](${BASE}/$1/$2)`,
  );
  // Fix same-dir relative links like [text](./slug.md) — strip .md only
  content = content.replace(/\]\(\.\/([\w-]+)\.md\)/g, `]($1)`);
  // Fix omzone.mx → omzone.com
  content = content.replace(/omzone\.mx/g, "omzone.com");
  return content;
}

/** Lee un archivo markdown limpio */
function readMd(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  return fixLinks(stripFrontmatter(raw).trim());
}

/** Lee todos los .md en un directorio, ordenados */
function readDir(dir, sort = (a, b) => a.localeCompare(b)) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort(sort)
    .map((f) => ({ file: f, content: readMd(path.join(dir, f)) }));
}

/** Construye un bloque de portada de sección */
function sectionCover(title, subtitle = "") {
  return `\n\n<div class="section-cover">\n<h1>${title}</h1>\n${subtitle ? `<p>${subtitle}</p>` : ""}\n</div>\n\n`;
}

/** Envuelve un artículo en un div con page-break */
function wrapDoc(content) {
  return `\n\n<div class="doc-start">\n\n${content}\n\n</div>\n\n---\n`;
}

// ─── Convertir y guardar PDF ──────────────────────────────────────────────────
async function buildPdf(markdownContent, outputPath, title) {
  console.log(`\n⏳  Generando: ${path.basename(outputPath)} ...`);
  const pdf = await mdToPdf(
    { content: markdownContent },
    {
      dest: outputPath,
      pdf_options: {
        format: "A4",
        printBackground: true,
        margin: { top: "20mm", right: "18mm", bottom: "20mm", left: "18mm" },
      },
      css: CSS,
      document_title: title,
      launch_options: {
        headless: "new",
        executablePath:
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      },
    },
  );
  if (pdf.filename) {
    const size = (fs.statSync(pdf.filename).size / 1024).toFixed(0);
    console.log(`✅  ${path.basename(outputPath)} — ${size} KB`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. DOCUMENTACIÓN TÉCNICA
// ─────────────────────────────────────────────────────────────────────────────
async function buildTechnicalPdf() {
  const parts = [];
  const ES_OLD = path.join(
    ROOT,
    "src",
    "docs",
    "content",
    "_archive",
    "es_old",
  );

  // Portada principal
  parts.push(
    `# OMZONE\n## Documentación Técnica del Sistema\n\n*Generado: ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}*\n\n---`,
  );

  // ── Sección: Arquitectura y modelo de datos ──────────────────────────────────
  parts.push(
    sectionCover(
      "Arquitectura y Modelo de Datos",
      "Dominios, colecciones, atributos, relaciones e índices",
    ),
  );
  for (const file of ["00_domain-map.md", "01_data-model.md"]) {
    const fp = path.join(ROOT, "docs", "architecture", file);
    if (fs.existsSync(fp)) parts.push(wrapDoc(readMd(fp)));
  }

  // ── Sección: ADRs ────────────────────────────────────────────────────────────
  parts.push(
    sectionCover(
      "Decisiones de Arquitectura (ADRs)",
      "Por qué el sistema está diseñado como está",
    ),
  );
  for (const { content } of readDir(
    path.join(ROOT, "docs", "architecture"),
  ).filter(({ file }) => file.startsWith("ADR-"))) {
    parts.push(wrapDoc(content));
  }

  // ── Sección: Catálogo ────────────────────────────────────────────────────────
  parts.push(
    sectionCover(
      "Catálogo",
      "Experiencias, ediciones, precios, complementos y pases",
    ),
  );
  for (const { content } of readDir(path.join(ES_OLD, "catalog"))) {
    parts.push(wrapDoc(content));
  }

  // ── Sección: Operaciones ─────────────────────────────────────────────────────
  parts.push(
    sectionCover(
      "Operaciones",
      "Agenda, horarios, recursos, ubicaciones y solicitudes de reserva",
    ),
  );
  for (const { content } of readDir(path.join(ES_OLD, "operations"))) {
    parts.push(wrapDoc(content));
  }

  // ── Sección: Ventas ──────────────────────────────────────────────────────────
  parts.push(sectionCover("Ventas", "Órdenes, pagos y venta asistida"));
  for (const { content } of readDir(path.join(ES_OLD, "sales"))) {
    parts.push(wrapDoc(content));
  }

  // ── Sección: Contenido ───────────────────────────────────────────────────────
  parts.push(
    sectionCover(
      "Gestión de Contenido",
      "Publicaciones y secciones editoriales",
    ),
  );
  for (const { content } of readDir(path.join(ES_OLD, "content"))) {
    parts.push(wrapDoc(content));
  }

  // ── Sección: Sistema ─────────────────────────────────────────────────────────
  parts.push(
    sectionCover("Sistema", "Clientes, tickets, media y configuración"),
  );
  for (const { content } of readDir(path.join(ES_OLD, "system"))) {
    parts.push(wrapDoc(content));
  }

  // ── Sección: Referencia técnica ───────────────────────────────────────────────
  parts.push(
    sectionCover(
      "Referencia Técnica",
      "Flujos, glosario, limitaciones conocidas y resolución de problemas",
    ),
  );
  for (const { content } of readDir(path.join(ES_OLD, "reference"))) {
    parts.push(wrapDoc(content));
  }

  await buildPdf(
    parts.join("\n"),
    path.join(OUT, "omzone-docs-tecnica.pdf"),
    "OMZONE — Documentación Técnica del Sistema",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DOCUMENTACIÓN DE USUARIO (ES)
// ─────────────────────────────────────────────────────────────────────────────
async function buildUserPdf() {
  const ES = path.join(ROOT, "src", "docs", "content", "es");
  const parts = [];

  // Portada principal
  parts.push(
    `# OMZONE\n## Guía del Usuario\n\n*Generado: ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}*\n\n---`,
  );

  const sections = [
    {
      dir: "getting-started",
      title: "Primeros pasos",
      subtitle: "Acceso, roles y recorrido inicial del panel",
    },
    {
      dir: "admin",
      title: "Panel de administración",
      subtitle: "Gestión de experiencias, agenda, órdenes, mensajes y más",
    },
    {
      dir: "landing",
      title: "Sitio público",
      subtitle: "Estructura de la landing, flujo de compra y páginas públicas",
    },
    {
      dir: "portal",
      title: "Portal del cliente",
      subtitle: "Mis reservas, tickets, pases y perfil",
    },
    {
      dir: "casos-de-uso",
      title: "Casos de uso",
      subtitle: "Flujos de trabajo paso a paso para operadores",
    },
    {
      dir: "referencia",
      title: "Referencia",
      subtitle: "Glosario, permisos, plantillas y herramientas",
    },
  ];

  for (const { dir, title, subtitle } of sections) {
    const sectionPath = path.join(ES, dir);
    if (!fs.existsSync(sectionPath)) continue;

    parts.push(sectionCover(title, subtitle));

    for (const { content } of readDir(sectionPath)) {
      parts.push(wrapDoc(content));
    }
  }

  await buildPdf(
    parts.join("\n"),
    path.join(OUT, "omzone-docs-usuario.pdf"),
    "OMZONE — Guía del Usuario",
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
(async () => {
  console.log("\n🚀  OMZONE — Generador de PDFs\n");
  console.log(`📁  Destino: ${OUT}\n`);

  try {
    await buildTechnicalPdf();
    await buildUserPdf();
    console.log("\n🎉  Ambos PDFs generados exitosamente en public/docs/\n");
  } catch (err) {
    console.error("\n❌  Error al generar PDFs:", err.message);
    process.exit(1);
  }
})();
