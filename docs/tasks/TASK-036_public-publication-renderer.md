# TASK-036: Renderizado público de publicaciones con secciones modulares

## Objetivo

Implementar el renderizado público de publicaciones CMS con secciones modulares en la ruta `/p/:slug`. Al completar esta tarea, un visitante puede acceder a cualquier publicación publicada y verla como una página editorial con secciones visuales mapeadas por tipo, SEO meta tags y CTA a la experiencia vinculada si corresponde. Esto completa la capa editorial pública del sistema.

## Contexto

- **Fase:** 10 — CMS y publicaciones
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 10
- **Documento maestro:** Secciones:
  - **RF-01:** Gestión de contenido editorial — secciones modulares que componen páginas ricas
  - **RF-14:** CMS / publicaciones — renderizado público de contenido editorial
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Sección 2.2 (`publications`), 2.3 (`publication_sections`)
- **ADR relacionados:** ADR-003 (Separación editorial/comercial) — las publicaciones se renderizan independientemente de la entidad comercial; ADR-004 (Experience-first) — si la publicación enlaza a una experiencia, el CTA lleva al detalle de experiencia.

Depende del CRUD de publicaciones (TASK-035) para la existencia de datos y del layout público (TASK-016) para el shell visual.

## Alcance

Lo que SÍ incluye esta tarea:

1. Ruta pública `/p/:slug`:
   - Fetch publicación por slug donde `status === "published"`
   - Si no existe o no está publicada: mostrar 404
   - Fetch secciones ordenadas por `sortOrder` donde `isVisible === true`
2. Componente `PublicationPage` que orquesta el render:
   - Título, subtítulo, excerpt, heroImage
   - Iteración sobre secciones y mapeo a componentes visuales
3. Section renderer: `SectionRenderer` que mapea `sectionType` al componente visual:
   - `hero` → `HeroSection`: imagen full-width, título overlay, subtítulo
   - `text` → `TextSection`: bloque de texto markdown renderizado
   - `gallery` → `GallerySection`: grid de imágenes responsive
   - `highlights` → `HighlightsSection`: grid de highlights con iconos/texto
   - `faq` → `FaqSection`: acordeón de preguntas/respuestas
   - `itinerary` → `ItinerarySection`: timeline visual de actividades
   - `testimonials` → `TestimonialsSection`: slider o grid de testimonios
   - `inclusions` → `InclusionsSection`: lista de lo que incluye
   - `restrictions` → `RestrictionsSection`: lista de restricciones/requisitos
   - `cta` → `CtaSection`: call-to-action con botón
   - `video` → `VideoSection`: embed de video (YouTube/Vimeo)
4. CTA a experiencia vinculada:
   - Si la publicación tiene `experienceId`, mostrar botón/CTA que lleva a `/experiences/:slug`
   - El CTA puede estar en el CtaSection o como banner fijo al final
5. SEO meta tags:
   - Usar `seoTitle`, `seoDescription`, `ogImageId` de la publicación
   - Fallback: `title` como seoTitle, `excerpt` como seoDescription
   - Open Graph tags para compartir en redes
6. Responsive:
   - Todas las secciones se adaptan correctamente en mobile (375px), tablet (768px) y desktop (1280px)
   - HeroSection: full-width en todos los tamaños
   - GallerySection: 1 col mobile, 2 cols tablet, 3 cols desktop
   - FaqSection: acordeón funciona en touch
   - ItinerarySection: timeline vertical en mobile
7. Manejo de contenido bilingüe:
   - Renderizar campos ES o EN según preferencia de idioma del visitante (si i18n está disponible)
   - Fallback a EN si el campo ES está vacío

## Fuera de alcance

- Blog listing page (listado de publicaciones públicas con paginación).
- Búsqueda de publicaciones.
- Publicaciones relacionadas o sugeridas.
- Comentarios en publicaciones.
- Compartir en redes sociales (botones).
- Animaciones de scroll o parallax.
- Print stylesheet.
- RSS feed.

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Frontend público

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `publications` | leer | Fetch por slug, filtrado por `status === "published"` |
| `publication_sections` | leer | Fetch por `publicationId`, ordenado por `sortOrder`, filtrado por `isVisible` |
| `experiences` | leer | Fetch experiencia vinculada para CTA (si `experienceId` presente) |

## Atributos nuevos o modificados

N/A — se leen atributos existentes definidos en TASK-003.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Lectura directa con Appwrite Databases SDK (permisos `Role.any()` en publicaciones/secciones) |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `publication_media` | leer | Preview de imágenes en secciones (mediaIds) y heroImage |
| `experience_images` | leer | heroImage de la experiencia vinculada (para CTA) |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `PublicationPage` | público | crear | Página contenedor que carga publicación y secciones |
| `SectionRenderer` | público | crear | Componente que mapea sectionType a componente visual |
| `HeroSection` | público | crear | Sección hero full-width con imagen y texto overlay |
| `TextSection` | público | crear | Bloque de texto markdown renderizado |
| `GallerySection` | público | crear | Grid de imágenes responsive |
| `HighlightsSection` | público | crear | Grid de highlights |
| `FaqSection` | público | crear | Acordeón de preguntas/respuestas |
| `ItinerarySection` | público | crear | Timeline visual |
| `TestimonialsSection` | público | crear | Grid/slider de testimonios |
| `InclusionsSection` | público | crear | Lista de inclusiones |
| `RestrictionsSection` | público | crear | Lista de restricciones |
| `CtaSection` | público | crear | Call-to-action con botón |
| `VideoSection` | público | crear | Embed de video |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `usePublication` | crear | Fetch publicación por slug con secciones |
| `useFilePreview` | crear | Genera URL de preview de archivo Appwrite por fileId |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/p/:slug` | público | ninguno | Renderizado de publicación por slug |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver publicación publicada | ✅ | ✅ | ✅ | ✅ | ✅ |

Nota: Las publicaciones con `status !== "published"` no se muestran públicamente. Solo `published` es visible en esta ruta.

## Flujo principal

1. Visitante accede a `/p/:slug`.
2. El componente `PublicationPage` hace fetch de la publicación por slug con `status === "published"`.
3. Si no existe → muestra página 404.
4. Si existe → fetch de `publication_sections` por `publicationId`, ordenadas por `sortOrder`, filtradas por `isVisible === true`.
5. Se renderiza el header de la publicación: título, subtítulo, heroImage.
6. Se itera sobre las secciones y `SectionRenderer` mapea cada `sectionType` al componente visual correspondiente.
7. Cada componente de sección renderiza su contenido (texto, imágenes, FAQ, etc.).
8. Si la publicación tiene `experienceId`, se muestra CTA para explorar la experiencia.
9. Se aplican meta tags SEO en el `<head>`.

## Criterios de aceptación

- [ ] La ruta `/p/:slug` carga y renderiza una publicación publicada correctamente.
- [ ] Si el slug no existe o la publicación no está publicada, se muestra página 404.
- [ ] Las secciones se renderizan en el orden correcto según `sortOrder`.
- [ ] Solo se renderizan secciones con `isVisible === true`.
- [ ] Los 11 tipos de sección tienen un componente visual funcional: hero, text, gallery, highlights, faq, itinerary, testimonials, inclusions, restrictions, cta, video.
- [ ] `HeroSection` muestra imagen full-width con texto overlay responsive.
- [ ] `GallerySection` muestra grid de imágenes: 1 col mobile, 2 cols tablet, 3 cols desktop.
- [ ] `FaqSection` funciona como acordeón: click expande/colapsa respuestas.
- [ ] `VideoSection` embeda video de YouTube/Vimeo de forma responsive (16:9 ratio).
- [ ] Si la publicación tiene `experienceId`, se muestra CTA que navega al detalle de la experiencia.
- [ ] Se aplican meta tags `<title>`, `<meta description>`, `og:title`, `og:description`, `og:image` desde los campos SEO de la publicación.
- [ ] Fallback: si `seoTitle` está vacío, se usa `title`; si `seoDescription` está vacío, se usa `excerpt`.
- [ ] En mobile (375px), todas las secciones se renderizan correctamente sin scroll horizontal.
- [ ] En tablet (768px), los grids se adaptan a 2 columnas.
- [ ] Touch targets en FAQ acordeón y CTA son ≥ 44px.
- [ ] El contenido en campo `content` se renderiza como markdown (headings, bold, lists, links).
- [ ] Las imágenes usan lazy loading para secciones below the fold.

## Validaciones de seguridad

- [ ] El contenido markdown se sanitiza al renderizar para prevenir XSS (no ejecutar scripts).
- [ ] Los embeds de video solo permiten URLs de dominios confiables (youtube.com, vimeo.com).
- [ ] Las URLs de imágenes solo apuntan a Appwrite Storage del proyecto, no a externos arbitrarios.
- [ ] El slug se valida en el fetch (solo alfanuméricos y hyphens) para evitar inyección en queries.

## Dependencias

- **TASK-035:** CRUD publicaciones y secciones desde admin — provee datos de publicaciones y secciones.
- **TASK-016:** Public layout — provee el shell público (header, footer, navigation).

## Bloquea a

- **TASK-044:** SEO — meta tags, OG images, sitemap — necesita la ruta de publicaciones para incluirla en el sitemap.

## Riesgos y notas

- **Markdown rendering:** Se necesita una librería de markdown→HTML (ej: `react-markdown` o `marked`). Asegurarse de sanitizar la salida para evitar XSS.
- **Video embed:** Los URLs de video en `metadata` JSON deben parsearse para extraer el ID de video e insertar el iframe correspondiente. Definir formato esperado del JSON (ej: `{ "videoUrl": "https://youtube.com/..." }`).
- **Imágenes de secciones:** `mediaIds` es un JSON array de fileIds. Se deben resolver a URLs de preview de Appwrite Storage. Si un fileId no existe, la sección muestra placeholder en lugar de romper.
- **Sin publicaciones publicadas:** Si alguien navega a `/p/` sin slug ó con uno inválido, el sistema debe regresar 404, no un error genérico.
- **Performance:** Publicaciones con muchas secciones e imágenes pueden ser pesadas. Lazy loading de imágenes y secciones below the fold es esencial para SEO y UX.
- **Estética premium:** Los componentes de sección deben diseñarse con estética editorial premium/wellness, no como bloques genéricos de CMS. Usar tipografía amplia, whitespace generoso, imágenes grandes.
