# TASK-018: Detalle público de experiencia — editorial + comercial + agenda

## Objetivo

Crear la página pública de detalle de experiencia en `/experiencias/:slug` que muestra la narrativa editorial completa, pricing tiers con variantes, slots disponibles con capacidad restante, addons aplicables y CTA de reserva/compra. Al completar esta tarea, un visitante puede explorar una experiencia en profundidad antes de iniciar el checkout.

## Contexto

- **Fase:** 4 — Catálogo público
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 4
- **Documento maestro:** Secciones 3.1 (Sitio público), 8.1 (Capa editorial), 8.2 (Capa comercial), 8.3 (Capa de agenda), RF-01, RF-03 (Precios y variantes), RF-04 (Catálogo público), RF-05 (Addons)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `experiences` (2.1), `publications` (2.2), `publication_sections` (2.3), `pricing_tiers` (3.2), `addons` (3.4), `addon_assignments` (3.5), `slots` (4.1)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Sitio público consume Editorial (read), Comercial (read prices), Agenda (read slots)
- **ADR relacionados:** ADR-003 (Separación editorial/comercial) — datos editoriales y comerciales se leen de dominios separados y se componen en la misma página; ADR-004 (Experience-first) — la experiencia es el protagonista, no la ubicación
- **RF relacionados:** RF-01, RF-03, RF-04, RF-05

Esta es la página más rica editorialmente del sitio público. Combina storytelling (publicaciones con secciones), comercio (pricing tiers con badges), agenda (slots con fechas y cupos) y complementos (addons). El diseño debe ser aspiracional, inmersivo y premium.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear página `ExperienceDetailPage` en `/experiencias/:slug`.
2. Fetch experiencia por `slug` (query con índice `idx_slug`).
3. Fetch datos relacionados en paralelo:
   - `pricing_tiers` donde `experienceId` y `isActive === true`
   - `slots` donde `experienceId` y `status === "available"` y `startDatetime` > now
   - `addon_assignments` donde `experienceId`, luego fetch `addons` por IDs
   - `publications` donde `experienceId` y `status === "published"` (si existe)
   - `publication_sections` donde `publicationId` y `isVisible === true` (si existe publication)
4. Hero section: imagen hero, `publicName`, `shortDescription`.
5. Si existe publicación asociada: renderizar secciones modulares por `sectionType`:
   - `hero` — imagen + texto overlay
   - `text` — bloque de texto markdown/richtext
   - `gallery` — grid de imágenes desde `mediaIds`
   - `highlights` — lista de beneficios/características
   - `faq` — preguntas frecuentes (acordeón)
   - `itinerary` — timeline de actividades por día
   - `inclusions` — lo que incluye
   - `restrictions` — restricciones / lo que no incluye
   - `testimonials` — citas de participantes
   - `cta` — call-to-action intermedio
   - `video` — video embed
6. Pricing section: mostrar tiers con nombre, precio, descripción, badge, highlight visual.
7. Agenda section: mostrar slots disponibles con fecha, hora, capacidad restante (`capacity - bookedCount`).
8. Addons section: mostrar addons disponibles con nombre, descripción, precio.
9. CTA final: botón "Reservar" / "Comprar" / "Solicitar" según `saleMode`:
   - `direct` → "Reservar ahora" / "Comprar" — navega a checkout
   - `request` → "Solicitar información" — placeholder
   - `assisted` → "Consultar disponibilidad" — placeholder
   - `pass` → "Ver pases disponibles" — placeholder
10. Responsive: single column en mobile, layout multi-sección en desktop.
11. Image gallery component si publicación tiene sección de galería.

## Fuera de alcance

- Flujo de checkout (TASK-020).
- Add-to-cart o selección de slot/tier en esta página (se hace en checkout).
- Formulario de solicitud (request flow — futuro).
- SEO meta tags dinámicos (OG, Twitter cards).
- Scroll animations, parallax.
- Reviews / ratings de usuarios.
- Experiencias relacionadas ("También te puede interesar").
- Breadcrumbs.
- Compartir en redes sociales.

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Comercial (pricing, addons, paquetes, pases)
- [x] Agenda (slots, recursos, capacidad)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experiences` | leer | Fetch experiencia por slug |
| `publications` | leer | Fetch publicación asociada por `experienceId` (si existe) |
| `publication_sections` | leer | Fetch secciones de publicación por `publicationId` |
| `pricing_tiers` | leer | Fetch tiers activos por `experienceId` |
| `slots` | leer | Fetch slots disponibles futuros por `experienceId` |
| `addon_assignments` | leer | Fetch assignments por `experienceId` |
| `addons` | leer | Fetch addons por IDs de assignments |

## Atributos nuevos o modificados

N/A — esta tarea no modifica atributos de base de datos.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Los datos se leen directamente del SDK con permisos `Role.any()` |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Bucket de imágenes | leer | Preview URLs de `heroImageId`, `galleryImageIds`, `mediaIds` en secciones |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `ExperienceDetailPage` | público | crear | Página de detalle completa |
| `ExperienceHero` | público | crear | Hero section con imagen, título, descripción |
| `SectionRenderer` | público | crear | Renderiza una `publication_section` por su `sectionType` |
| `GallerySection` | público | crear | Grid de imágenes desde `mediaIds` |
| `HighlightsSection` | público | crear | Lista de beneficios/características |
| `FaqSection` | público | crear | Acordeón de preguntas frecuentes |
| `ItinerarySection` | público | crear | Timeline de actividades |
| `PricingSection` | público | crear | Grilla de pricing tiers |
| `PricingTierCard` | público | crear | Card individual de un pricing tier |
| `AgendaSection` | público | crear | Lista de slots disponibles |
| `SlotCard` | público | crear | Card de slot con fecha/hora/capacidad |
| `AddonsSection` | público | crear | Lista de addons disponibles |
| `AddonCard` | público | crear | Card de addon con nombre/precio |
| `ExperienceCTA` | público | crear | Botón CTA según `saleMode` |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useExperienceDetail` | crear | Fetch experiencia por slug + todos los datos relacionados |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/experiencias/:slug` | público | ninguno | Detalle de experiencia (acceso público) |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver detalle de experiencia pública | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver pricing tiers | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver slots disponibles | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver addons disponibles | ✅ | ✅ | ✅ | ✅ | ✅ |

## Flujo principal

1. El visitante navega a `/experiencias/:slug` (desde el listado o un link directo).
2. La página resuelve el slug y busca la experiencia con `status === "published"`.
3. Si no se encuentra o no está publicada, se muestra página 404.
4. Se cargan en paralelo: pricing tiers activos, slots disponibles futuros, addon assignments + addons, publicación asociada + secciones.
5. Se renderiza el hero section con imagen, título y descripción.
6. Si existe publicación: se renderizan las secciones modulares en orden por `sortOrder`.
7. Se renderiza la sección de pricing con tiers como cards.
8. Si la experiencia `requiresSchedule`, se renderiza la sección de agenda con slots disponibles.
9. Si hay addons asignados, se renderiza la sección de addons.
10. Se renderiza el CTA final según `saleMode`.

## Criterios de aceptación

- [x] La página `/experiences/:slug` carga y muestra la experiencia correspondiente al slug. (Nota: ruta en inglés `/experiences/:slug`, no `/experiencias/:slug`.)
- [x] Si el slug no existe o la experiencia no está publicada, se muestra página 404 — `error === "not_found"` renderiza `<NotFoundPage />` en `ExperienceDetailPage`.
- [x] El hero section muestra imagen (desde Storage), `publicName` y `shortDescription` — `ExperienceHero.jsx` con preview URL de `heroImageId` + fallback SVG.
- [x] Si existe publicación asociada, las secciones se renderizan en orden por `sortOrder` — `useExperienceDetail` ordena por `sortOrder` antes de retornar; `SectionRenderer` las itera en orden.
- [x] La sección `gallery` renderiza un grid de imágenes desde `mediaIds` — `parseMediaIds()` parsea el JSON string; grid responsivo en `GallerySection`.
- [x] La sección `faq` renderiza un acordeón funcional (expand/collapse) — `FaqSection` con estado `openIndex`; click expande/colapsa.
- [x] La sección `highlights` renderiza una lista estilizada de beneficios — `HighlightsSection` con iconos de check sage.
- [x] La sección de pricing muestra todos los tiers activos con nombre, precio, descripción y badge — `PricingSection` + `PricingTierCard`; badge pill cuando `tier.badge` existe.
- [x] El tier con `isHighlighted === true` se muestra visualmente destacado — `ring-2 ring-sage/20 bg-sage/5` en `PricingTierCard`; también en `PricingSidebar` desktop.
- [x] La sección de agenda muestra slots con fecha, hora y cupos restantes (`capacity - bookedCount`) — `AgendaSection` + `SlotCard`; "Full" cuando available=0, amber cuando ≤3.
- [x] Solo se muestran slots con `status === "available"` y `startDatetime` futuro — query en `useExperienceDetail`: `Query.equal("status","available")` + `Query.greaterThan("startDatetime", new Date().toISOString())`.
- [x] La sección de addons muestra addons asignados con nombre, descripción y precio — `AddonsSection` + `AddonCard` con `formatPrice()`.
- [x] El CTA muestra texto según `saleMode`: "Book Now" para `direct`, "Request Information" para `request` — `CTA_CONFIG` map en `ExperienceCTA.jsx` y `PricingSidebar`.
- [x] El CTA para `saleMode === "direct"` navega a `/checkout` con parámetros de la experiencia — `navigate(${ROUTES.CHECKOUT}?experienceId=${experience.$id}&slug=${experience.slug})`.
- [x] El layout es responsivo: single column en mobile, multi-sección con sidebar de pricing en desktop — `lg:grid lg:grid-cols-[1fr_360px] lg:gap-12`; `PricingSection` solo en mobile (`lg:hidden`), `PricingSidebar` solo en desktop (`hidden lg:block`).
- [x] Si la experiencia no tiene pricing tiers, la sección de pricing no se renderiza — `PricingSection` renderiza null si `tiers.length === 0`; sidebar muestra "Inquire for pricing".
- [x] Si la experiencia no tiene slots, la sección de agenda no se renderiza — `showAgenda = experience.requiresSchedule && slots.length > 0`.
- [x] Se muestra loading state mientras se cargan los datos — `<LoadingSkeleton />` con `animate-pulse` mientras `loading === true`.

## Validaciones de seguridad

- [x] Solo se muestran experiencias con `status === "published"` — `useExperienceDetail`: `Query.equal("status","published")` en el fetch por slug; si no hay resultado, `error = "not_found"` → 404.
- [x] Solo se muestran slots con `status === "available"` — `Query.equal("status","available")` + `Query.greaterThan("startDatetime", now)` en `useExperienceDetail`; slots `full`/`cancelled`/`completed` nunca se retornan.
- [x] Solo se muestran pricing tiers con `isActive === true` — `Query.equal("isActive", true)` en la query de `pricing_tiers`.
- [x] Solo se muestran addons con `status === "active"` — los addons se filtran por `isActive === true` al hacer fetch de `addon_assignments`; addons inactivos excluidos.
- [x] No se expone información interna — UI usa `experience.publicName` (no `name`); notas de slots (`notes`), pricing rules (`pricingRules`) y campos internos no se renderizan en ningún componente público.

## Dependencias

- **TASK-003:** Schema dominio editorial — provee `experiences`, `publications`, `publication_sections`, `tags`, `experience_tags`.
- **TASK-004:** Schema dominio comercial — provee `pricing_tiers`, `addons`, `addon_assignments`.
- **TASK-005:** Schema dominio agenda — provee `slots`.
- **TASK-016:** Public layout — provee `PublicLayout` como shell.
- **TASK-017:** Listado público de experiencias — provee navegación desde cards al detalle.

## Bloquea a

- **TASK-020:** UI de checkout — el CTA de esta página navega al checkout con los datos de la experiencia seleccionada.

## Riesgos y notas

- **Queries múltiples:** Esta página puede requerir 5-7 queries paralelas. Optimizar con `Promise.all` y manejar errores parciales (ej: si no hay publicación, seguir renderizando sin secciones editoriales).
- **Sin publicación:** Una experiencia puede existir sin publicación (venta directa desde catálogo). En ese caso, solo se muestran: hero (desde experiencia), pricing, agenda, addons. No se muestra zona editorial.
- **Secciones CMS dinámicas:** El `SectionRenderer` debe ser un switch/map por `sectionType`. Si llega un tipo no soportado, ignorar silenciosamente (no crashear).
- **galleryImageIds es JSON string:** El atributo es `string(5000)` con JSON array. Parsear con `JSON.parse` y manejar error si el formato es inválido.
- **mediaIds en secciones:** Mismo caso — JSON string que requiere parsing.
- **Cupos restantes:** Calcular `capacity - bookedCount`. Si el resultado es 0, mostrar "Cupo lleno" en vez de "0 cupos disponibles". Slots `full` ya están filtrados por status, pero verificar también numéricamente.
- **Imágenes fallback:** Si `heroImageId` no existe o la preview URL falla, mostrar placeholder premium.
- **saleMode CTA:** Los CTAs para `request`, `assisted` y `pass` son placeholders en esta task — no navegan a flujos funcionales aún.
