# TASK-054: Rediseño experiencias listing — editorial vertical sin precios visibles

## Objetivo

Transformar la página de listado de experiencias de un grid de cards tipo marketplace (3 columnas con precios visibles) a un layout editorial vertical tipo revista donde cada experiencia se presenta como un artículo/sección con imagen prominente, narrativa evocadora y sin precios visibles. Al completar esta tarea, un visitante recorre el catálogo de OMZONE como si leyera una revista de wellness, no como si comprara en un e-commerce.

## Contexto

- **Fase:** B — Catálogo editorial (post-fase 15)
- **Documento maestro:** RF-04 (Catálogo público con filtros), RF-05 (Detalle de experiencia)
- **ADR relacionados:** ADR-003 (Separación editorial/comercial), ADR-004 (Experience-first)
- **Estado actual:** `src/pages/public/ExperiencesListPage.jsx` funciona correctamente con datos reales, filtros por tags y tipo, grid de 3 columnas con `ExperienceCard` que muestra precios "From $X".
- **Instrucciones de contenido:** `.github/instructions/content.instructions.md` — "nunca parecer marketplace genérico"
- **Copilot instructions:** "Experience-first: el sistema vende experiencias, no tarjetas de marketplace"

El rediseño mantiene toda la funcionalidad existente (fetch, filtros, estados) pero cambia radicalmente la presentación visual.

## Alcance

Lo que SÍ incluye esta tarea:

1. **Hero banner** al inicio de la página con imagen de fondo y texto evocador ("Discover transformative wellness experiences...") para establecer el tono editorial.
2. **Refactor de `ExperienceCard` → `ExperienceArticle`** — cada experiencia se presenta como una sección de artículo editorial:
   - Imagen hero grande (no thumbnail cuadrado)
   - Título en tipografía display (Playfair)
   - Descripción expandida (no truncada a 2 líneas)
   - Badge de tipo (session, immersion, retreat, stay)
   - Tags visibles como pills sutiles
   - **Sin precio visible** — el precio solo se ve dentro del detalle
   - CTA sutil: "Discover this experience →" / "Explorar →"
3. **Layout vertical** — experiencias apiladas verticalmente. Alternar composición: imagen izquierda/texto derecha, luego imagen derecha/texto izquierda (zig-zag en desktop). En mobile: imagen arriba, texto abajo siempre.
4. **Filtros rediseñados** — más sutiles, integrados visualmente. Pills horizontales con scroll en mobile, no checkboxes densos.
5. **Ocultar precios del listado** — `priceMap` se deja de pasar a los componentes de listado. El hook `usePublicExperiences` sigue cargando precios (para el detalle), pero no se renderizan en el listado.
6. **Mantener funcionalidad existente** — filtrado por tags y tipo, loading/error/empty states, routing a detalle por slug.
7. **Responsive** — mobile-first. Layout vertical en todas las resoluciones. Zig-zag solo en lg+.

## Fuera de alcance

- Cambios en `ExperienceDetailPage` (ya está completo).
- Paginación o infinite scroll.
- Búsqueda por texto.
- Animaciones complejas (parallax, reveal on scroll).
- Cambios en el hook `usePublicExperiences` (solo se deja de renderizar el precio).

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Frontend público

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experiences` | leer | Misma query existente — solo `status === "published"` |
| `tags` | leer | Para filtros |
| `experience_tags` | leer | Para filtros |
| `pricing_tiers` | leer | Se mantiene en hook pero NO se renderiza en el listado |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | — |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_media` | leer | Hero images de experiencias |
| `public-resources` | leer | Hero banner de la página |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `ExperiencesListPage` | público | modificar | Agregar hero banner, cambiar grid a layout vertical |
| `ExperienceCard` | público | deprecar/reemplazar | Reemplazado por `ExperienceArticle` |
| `ExperienceArticle` | público | crear | Nuevo componente editorial zig-zag |
| `ExperienceFilters` | público | modificar | Rediseño a pills horizontales más sutiles |
| `CatalogHero` | público | crear | Hero banner para la página de listado |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `usePublicExperiences` | sin cambios | Se mantiene igual — solo se deja de pasar `priceMap` al render |
| `useLanguage` | usar existente | Textos i18n |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/experiences` | público | ninguno | Misma ruta, nueva presentación |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver catálogo público | ✅ | ✅ | ✅ | ✅ | ✅ |
| Filtrar por tags y tipo | ✅ | ✅ | ✅ | ✅ | ✅ |

## Flujo principal

1. El visitante navega a `/experiences`.
2. Ve un hero banner con imagen y texto evocador.
3. Debajo, filtros en pills horizontales (tipo y tags).
4. Las experiencias se muestran como artículos verticales alternados (zig-zag en desktop).
5. Cada artículo tiene imagen grande, título Playfair, descripción, badge de tipo y CTA sutil.
6. No se ven precios en ningun artículo.
7. Al hacer click en "Discover this experience →", navega a `/experiences/[slug]`.
8. Los filtros funcionan en tiempo real como antes.

## Criterios de aceptación

- [ ] La página `/experiences` muestra un hero banner con imagen de fondo y texto evocador.
- [ ] Las experiencias se presentan como artículos verticales (no grid de cards).
- [ ] En desktop (lg+), los artículos alternan composición izquierda-derecha (zig-zag).
- [ ] En mobile, la composición es siempre: imagen arriba, texto abajo.
- [ ] **No se muestran precios** en el listado — ni "From $X" ni "Inquire for pricing".
- [ ] Cada artículo muestra: imagen hero grande, título en Playfair, descripción, badge de tipo, CTA.
- [ ] El CTA de cada artículo dice "Discover this experience →" (o equivalente i18n) y navega al detalle.
- [ ] Los filtros por tags y tipo funcionan igual que antes.
- [ ] Los filtros se presentan como pills horizontales con scroll en mobile.
- [ ] Loading state muestra skeletons adaptados al nuevo layout.
- [ ] Empty state y no-results state funcionan igual.
- [ ] Todos los textos están en i18n (EN/ES).
- [ ] `SEOHead` se mantiene con title y description correctos.
- [ ] `npm run build` pasa limpio.
- [ ] El `ExperienceCard` original se puede eliminar o mantener para otros usos, pero no se usa en el listado.

## Dependencias

- **TASK-017:** Listado original — provee la funcionalidad actual que se rediseña.
- **TASK-016:** Public layout — provee `PublicLayout`.
- **TASK-046:** i18n — provee textos.

## Bloquea a

- **TASK-059:** Seed data — el catálogo rediseñado necesita experiencias con datos reales para verse bien.
- **TASK-061:** Responsive audit.

## Riesgos y notas

- El componente `ExperienceCard` puede seguir existiendo para uso en otros contextos (landing "Discover" section, cards internas). Pero en el listado principal se reemplaza por `ExperienceArticle`.
- Con pocas experiencias (1-2), el layout vertical puede verse vacío. Se recomienda crear al menos 3-5 experiencias de ejemplo (TASK-059).
- La descripción expandida usa `shortDescription` existente. Si es demasiado corta, se puede usar `longDescription` truncada a ~200 chars.
- El zig-zag en desktop se logra con `flex-row-reverse` alternado. Patrón CSS limpio, sin JavaScript.
