---
name: seo-auditor
description: "Auditar y optimizar SEO de OMZONE: meta tags, structured data, local SEO Puerto Vallarta, Open Graph, sitemap, keywords, hreflang, Core Web Vitals, headings y accesibilidad de contenido público."
---

# Skill: SEO Auditor

## Cuándo usarlo

- Al crear o editar una página pública y verificar que cumple estándares SEO
- Para auditar el SEO completo del sitio antes de un launch o release
- Cuando se quiera verificar posicionamiento local (Puerto Vallarta / Bahía de Banderas)
- Al agregar experiencias nuevas y validar que su structured data es correcto
- Para revisar que el sitemap y robots.txt están actualizados
- Cuando se detecten caídas de tráfico orgánico o problemas de indexación

**Ejemplos concretos:**

- "Audita el SEO de la página de experiencias"
- "Verifica el structured data de una experiencia específica"
- "Revisa el SEO local para Puerto Vallarta"
- "Haz un audit completo antes del launch"
- "Optimiza las meta descriptions de las páginas públicas"

## Cuándo NO usarlo

- Para escribir copy editorial → usar agente `copywriter` o `content`
- Para implementar componentes React → usar instrucción `react-components.instructions.md`
- Para auditar responsive → usar skill `responsive-auditor`
- Para crear task docs → usar skill `task-doc-writer`

## Entradas necesarias

- [ ] Instrucción SEO leída: `.github/instructions/seo.instructions.md`
- [ ] `index.html` revisado — meta tags base
- [ ] `src/components/common/SEOHead.jsx` revisado — componente SEO
- [ ] `src/hooks/useSEO.js` revisado — hooks de structured data
- [ ] `public/sitemap.xml` y `public/robots.txt` revisados
- [ ] `scripts/generate-sitemap.mjs` revisado — generación dinámica
- [ ] Páginas públicas en `src/pages/public/` revisadas

## Procedimiento paso a paso

### Fase 1: Audit técnico

**Paso 1 — Revisar index.html base**

Verificar presencia de:

- `<html lang="en">` (idioma principal)
- Meta charset y viewport
- Meta description por defecto
- OG base tags (`og:site_name`, `og:type`, `twitter:card`)
- Geo meta tags para local SEO
- Favicon y apple-touch-icon
- Preconnect/preload de recursos críticos

**Paso 2 — Revisar SEOHead component**

Verificar que `SEOHead.jsx`:

- Genera title con formato `{keyword} — OMZONE`, ≤60 chars
- Incluye meta description ≤155 chars
- Genera canonical URL absoluta
- Incluye OG completo (title, description, image 1200×630, type, url, site_name)
- Incluye Twitter card (summary_large_image)
- Soporta `noindex` para páginas no indexables
- NO genera tags duplicados

**Paso 3 — Revisar StructuredData component**

Verificar que:

- Genera JSON-LD válido con `@context` y `@type`
- Se renderiza en `<head>` vía Helmet
- Escapa correctamente caracteres especiales

### Fase 2: Audit de páginas

**Paso 4 — Auditar cada página pública**

Para cada archivo en `src/pages/public/`, verificar:

| Criterio                      | Check                                      |
| ----------------------------- | ------------------------------------------ |
| `<SEOHead>` presente          | ¿Usa el componente?                        |
| Title único                   | ¿No se repite con otra página?             |
| Title ≤60 chars               | ¿Se verá completo en SERP?                 |
| Title incluye keyword         | ¿Contiene keyword relevante?               |
| Description única             | ¿No es la default genérica?                |
| Description ≤155 chars        | ¿No se trunca?                             |
| Description incluye ubicación | ¿Menciona PV/BdB cuando aplica?            |
| Canonical URL                 | ¿URL absoluta correcta?                    |
| OG image                      | ¿Tiene imagen 1200×630?                    |
| Solo un `<h1>`                | ¿Heading hierarchy correcta?               |
| Alt en imágenes               | ¿Todas las `<img>` tienen alt descriptivo? |
| Links internos                | ¿Hay links a otras páginas del sitio?      |

**Paso 5 — Auditar páginas dinámicas (experiencias, publicaciones)**

Verificar en `useSEO.js`:

- `useExperienceSEO` genera title desde `seoTitle` o `publicName`
- Description desde `seoDescription` o `shortDescription`
- Canonical con slug correcto
- JSON-LD tipo Event con campos requeridos
- OG image desde `ogImageId` o `heroImageId`
- Offers en structured data cuando hay pricing tiers

Para publicaciones:

- `usePublicationSEO` genera tipo "article"
- Canonical con slug correcto bajo `/p/`

### Fase 3: Local SEO

**Paso 6 — Verificar señales de local SEO**

Checklist de local SEO para Puerto Vallarta / Bahía de Banderas:

| Señal                          | Estado | Acción                                                            |
| ------------------------------ | ------ | ----------------------------------------------------------------- |
| Geo meta tags en `<head>`      |        | `geo.region=MX-JAL`, `geo.placename=Puerto Vallarta`, coordenadas |
| Organization JSON-LD           |        | En layout público, con address PV, geo coords, areaServed         |
| Ubicación en meta descriptions |        | Mencionar PV/BdB en descriptions de páginas relevantes            |
| Ubicación en titles            |        | Al menos home y experiences deben mencionarla                     |
| Event JSON-LD con location     |        | Slots con location deben inyectar Place en structured data        |
| NAP consistente                |        | Nombre, Address, Phone iguales en toda la web                     |
| Google Business Profile        |        | Verificar que existe y es consistente (fuera de scope de código)  |

**Paso 7 — Verificar keyword integration**

Revisar que las keywords target aparecen naturalmente en:

- Titles y descriptions
- H1 y H2 de páginas principales
- Alt text de imágenes hero
- Contenido visible de las primeras secciones
- Anchor text de links internos

Keywords target principales:

- `wellness experiences Puerto Vallarta`
- `wellness retreat Bahia de Banderas`
- `sound healing Puerto Vallarta`
- `meditation retreat Mexico`
- `holistic wellness Riviera Nayarit`

### Fase 4: Infraestructura SEO

**Paso 8 — Verificar sitemap**

- `scripts/generate-sitemap.mjs` incluye todas las páginas estáticas
- Incluye experiencias publicadas por slug
- Incluye publicaciones del CMS por slug
- `<lastmod>` refleja fecha real
- No incluye páginas privadas/admin
- Sitemap referenciado en `robots.txt`

**Paso 9 — Verificar robots.txt**

- Permite acceso general (`Allow: /`)
- Bloquea rutas privadas (`/admin/*`, `/portal/*`, `/checkout/*`, etc.)
- NO bloquea CSS/JS/images
- Apunta a sitemap correcto

**Paso 10 — Verificar performance SEO**

- HTML semántico (header, main, article, section, nav, footer)
- Images con `loading="lazy"` below the fold
- Fonts preloaded
- Bundle optimizado (Vite tree-shaking)
- Appwrite image previews con dimensiones apropiadas

### Fase 5: Reporte

**Paso 11 — Generar reporte de hallazgos**

Formato del reporte:

```markdown
## SEO Audit Report — OMZONE

### Score: X/10

### Critical Issues (bloquean indexación)

- [ ] Issue description → fix

### High Priority (impactan ranking)

- [ ] Issue description → fix

### Medium Priority (mejoran posicionamiento)

- [ ] Issue description → fix

### Low Priority (nice to have)

- [ ] Issue description → fix

### Local SEO Status

- Geo tags: ✅/❌
- Organization schema: ✅/❌
- Location in content: ✅/❌
- NAP consistency: ✅/❌

### Pages Audited

| Page | Title OK | Desc OK | Canonical | OG  | Schema | H1  |
| ---- | -------- | ------- | --------- | --- | ------ | --- |
| Home | ✅/❌    | ...     | ...       | ... | ...    | ... |
```

## Recursos de referencia

- [Instrucción SEO](../../instructions/seo.instructions.md) — keyword strategy, local SEO, checklist completo
- [SEOHead component](../../../src/components/common/SEOHead.jsx) — componente base
- [useSEO hook](../../../src/hooks/useSEO.js) — structured data para experiencias y publicaciones
- [StructuredData component](../../../src/components/common/StructuredData.jsx) — JSON-LD renderer
- [Sitemap generator](../../../scripts/generate-sitemap.mjs) — generación dinámica
- [Google Search Central](https://developers.google.com/search/docs) — documentación oficial
- [Schema.org Event](https://schema.org/Event) — referencia de structured data
- [Schema.org LocalBusiness](https://schema.org/LocalBusiness) — para local SEO avanzado
