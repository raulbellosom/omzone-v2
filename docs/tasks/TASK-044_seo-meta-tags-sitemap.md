# TASK-044: SEO — meta tags, OG images, sitemap, structured data

## Objetivo

Implementar optimización SEO completa para el sitio público de OMZONE: meta tags dinámicos por página, Open Graph tags para social sharing, JSON-LD structured data para experiencias (Event schema), sitemap.xml auto-generado y robots.txt. Al completar esta tarea, el sitio público es indexable y optimizado para motores de búsqueda y plataformas sociales.

## Contexto

- **Fase:** 14 — SEO, performance e i18n
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 14
- **Documento maestro:** Secciones:
  - **RNF-06:** Performance — SEO y experiencia real
  - RF-01: Gestión de contenido editorial — SEO básico
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `experiences` (2.1) campos `seoTitle`, `seoDescription`, `ogImageId`, `slug`; `publications` (2.2) campos `seoTitle`, `seoDescription`, `ogImageId`, `slug`
- **ADR relacionados:** Ninguno específico.

Las páginas públicas de experiencias y publicaciones ya tienen campos SEO en sus entidades. Esta tarea implementa la lógica de renderizado de esos campos en el HTML.

## Alcance

Lo que SÍ incluye esta tarea:

1. React Helmet (o `react-helmet-async`) para meta tags dinámicos:
   - Componente `SEOHead` reutilizable que acepta: `title`, `description`, `ogTitle`, `ogDescription`, `ogImage`, `canonical`, `structuredData`
   - Default meta tags para todas las páginas (site name, default description)
2. Meta tags por tipo de página:
   - **Home:** título del sitio, descripción general, OG image por defecto
   - **Experience listing:** título de catálogo, descripción del catálogo
   - **Experience detail:** `seoTitle` (fallback `publicName`), `seoDescription` (fallback `shortDescription`), `ogImageId` → URL de preview
   - **Publication page:** `seoTitle` (fallback `title`), `seoDescription` (fallback `excerpt`), `ogImageId` → URL de preview
   - **Portal pages:** `noindex` (no indexar contenido privado)
   - **Admin pages:** `noindex`
3. Open Graph tags:
   - `og:title`, `og:description`, `og:image`, `og:url`, `og:type`, `og:site_name`
   - Twitter Card meta tags: `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`
4. JSON-LD Structured Data para experiencias:
   - Schema.org `Event` type para experiencias con slots:
     - `name`, `description`, `startDate`, `endDate`, `location`, `image`, `offers` (price, currency)
   - Insertar como `<script type="application/ld+json">` en el head
5. Sitemap.xml:
   - Ruta `/sitemap.xml` que genera XML con:
     - Rutas estáticas: home, about, contact
     - Rutas dinámicas: `/experiences/:slug` para cada experiencia publicada
     - Rutas dinámicas: `/p/:slug` para cada publicación publicada
   - `lastmod`, `changefreq`, `priority` por tipo de ruta
   - Generado en build time o vía Function/endpoint
6. robots.txt:
   - Permitir indexación de rutas públicas
   - Bloquear `/admin/*`, `/portal/*`, `/checkout/*`
   - Referencia al sitemap: `Sitemap: https://domain.com/sitemap.xml`
7. Canonical URLs:
   - Cada página pública define `<link rel="canonical">` con la URL canónica

## Fuera de alcance

- Google Search Console setup y verificación.
- Analytics (Google Analytics, Plausible, etc.).
- A/B testing de meta tags.
- Structured data para otros schemas (Organization, BreadcrumbList).
- AMP pages.
- Prerendering/SSR (el sitio es SPA; si SEO requiere SSR, es tarea separada).

## Dominio

- [x] Frontend público

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experiences` | leer | Slugs y campos SEO para sitemap y structured data |
| `publications` | leer | Slugs y campos SEO para sitemap |
| `slots` | leer | Próximos slots para structured data Event |
| `pricing_tiers` | leer | Precios para structured data Offers |

## Atributos nuevos o modificados

N/A — se leen atributos SEO existentes en `experiences` y `publications`.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `generate-sitemap` (opcional) | crear | Function que genera sitemap.xml dinámico, O generar en build time |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_images` | leer | OG image de experiencias |
| `publication_media` | leer | OG image de publicaciones |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `SEOHead` | público | crear | Componente reutilizable para meta tags con react-helmet |
| `StructuredData` | público | crear | Componente para JSON-LD inline |
| `ExperienceDetailPage` | público | modificar | Integrar SEOHead y StructuredData |
| `PublicationPage` | público | modificar | Integrar SEOHead |
| `ExperienceListPage` | público | modificar | Integrar SEOHead |
| `HomePage` | público | modificar | Integrar SEOHead |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useSEO` | crear | Genera props de SEOHead a partir de datos de entidad |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/sitemap.xml` | público | ninguno | Sitemap XML |
| `/robots.txt` | público | ninguno | Robots configuration |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Acceder a sitemap.xml | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crawling de páginas públicas | — | — | — | — | ✅ (bots) |

## Flujo principal

1. Cada página pública renderiza `<SEOHead>` con datos apropiados.
2. El componente inyecta meta tags en el `<head>` del documento.
3. Experience detail renderiza JSON-LD Event schema + SEO tags.
4. Publication page renderiza OG tags + SEO tags.
5. `/sitemap.xml` retorna XML con todas las rutas públicas y su metadata.
6. `/robots.txt` retorna configuración de crawling.

## Criterios de aceptación

- [ ] Todas las páginas públicas tienen `<title>` y `<meta name="description">` dinámicos.
- [ ] El detalle de experiencia usa `seoTitle` como title (fallback: `publicName`) y `seoDescription` como description (fallback: `shortDescription`).
- [ ] La página de publicación usa `seoTitle` (fallback: `title`) y `seoDescription` (fallback: `excerpt`).
- [ ] Todas las páginas públicas tienen OG tags: `og:title`, `og:description`, `og:image`, `og:url`.
- [ ] Las imágenes OG usan la URL de preview de Appwrite Storage del campo `ogImageId` (fallback: `heroImageId`).
- [ ] Twitter Card meta tags están presentes: `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`.
- [ ] El detalle de experiencia incluye JSON-LD structured data con schema `Event` y campos: name, description, startDate, endDate, location, image, offers.
- [ ] El sitemap.xml incluye todas las experiencias publicadas con slug y lastmod.
- [ ] El sitemap.xml incluye todas las publicaciones publicadas con slug y lastmod.
- [ ] El sitemap.xml incluye rutas estáticas (home, catálogo).
- [ ] El robots.txt bloquea `/admin/*`, `/portal/*`, `/checkout/*`.
- [ ] El robots.txt referencia al sitemap.
- [ ] Las páginas admin y portal tienen meta `noindex`.
- [ ] Cada página pública tiene `<link rel="canonical">` con URL absoluta.
- [ ] El componente `SEOHead` es reutilizable y se puede integrar en cualquier página con props simples.

## Validaciones de seguridad

- [ ] El sitemap.xml no incluye rutas admin ni portal.
- [ ] Los slugs usados en URLs del sitemap se validan (solo alfanuméricos y hyphens).
- [ ] JSON-LD structured data no incluye datos sensibles (precios internos, IDs de Appwrite).
- [ ] No se inyecta contenido user-generated sin sanitizar en meta tags.

## Dependencias

- **TASK-016:** Public layout — provee shell público donde se integra SEOHead.
- **TASK-017:** Listado público de experiencias — página de catálogo.
- **TASK-018:** Detalle público de experiencia — página de detalle con SEO fields.
- **TASK-036:** Renderizado público de publicaciones — página de publicación con SEO fields.

## Bloquea a

Ninguna directamente.

## Riesgos y notas

- **SPA y SEO:** React SPA no es ideal para SEO. Los meta tags inyectados por react-helmet funcionan para crawlers modernos (Googlebot ejecuta JS) pero no para todos. Si SEO es crítico, considerar SSR (Next.js) o prerendering (prerender.io) en una tarea futura.
- **Sitemap generation:** En un SPA, generar sitemap.xml dinámico requiere: (a) una Function que lo genere bajo demanda, (b) generarlo en build time con un script, o (c) una ruta estática. Opción (a) es más versátil. Opción (b) no refleja cambios en tiempo real.
- **OG image URLs:** Las URLs de preview de Appwrite Storage deben ser accesibles públicamente. Verificar que los permisos del bucket permiten `Role.any()` read.
- **JSON-LD offers:** El schema Event puede incluir `offers` con precio. Usar el pricing tier más bajo como `lowPrice` y el más alto como `highPrice` con `AggregateOffer`.
- **react-helmet-async:** Usar `react-helmet-async` en lugar de `react-helmet` ya que el segundo no está mantenido y tiene problemas con React 18+.
