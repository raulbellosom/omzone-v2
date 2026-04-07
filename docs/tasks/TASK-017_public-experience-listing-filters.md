# TASK-017: Listado público de experiencias con filtros y tags

## Objetivo

Crear la página pública de listado de experiencias en `/experiencias` donde los visitantes exploran el catálogo de OMZONE mediante tarjetas editoriales con imagen hero, nombre, descripción, badge de tipo y precio "desde". Al completar esta tarea, un visitante puede filtrar experiencias por tags y tipo, ver un grid responsivo de cards premium y navegar al detalle de cada experiencia.

## Contexto

- **Fase:** 4 — Catálogo público
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 4
- **Documento maestro:** Secciones 3.1 (Sitio público), RF-01 (Catálogo editorial), RF-04 (Catálogo público con filtros)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `experiences` (2.1), `tags` (2.4), `experience_tags` (2.5), `pricing_tiers` (3.2)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Sitio público consume Editorial (read), Comercial (read prices)
- **ADR relacionados:** ADR-003 (Separación editorial/comercial) — se leen datos editoriales de `experiences` y precios de `pricing_tiers` como dominios separados
- **RF relacionados:** RF-01, RF-04

El listado público es la puerta de entrada al catálogo de experiencias. Las cards deben transmitir la narrativa premium de OMZONE: imagen protagonista, tipografía editorial, y precio "desde" calculado del tier activo más bajo. Los filtros permiten explorar por categoría wellness y tipo de experiencia.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear página `ExperiencesListPage` en `/experiencias`.
2. Fetch de experiencias con `status === "published"` desde Appwrite.
3. Fetch de tags desde colección `tags` para renderizar filtros.
4. Fetch de `experience_tags` para asociar tags a experiencias.
5. Fetch de `pricing_tiers` donde `isActive === true` para calcular precio "desde" (menor `basePrice` por experiencia).
6. Crear componente `ExperienceCard` con:
   - Hero image (desde `heroImageId` via Storage preview URL)
   - `publicName`
   - `shortDescription` (truncada si excede)
   - Badge de `type` (Session, Immersion, Retreat, Stay, Private)
   - Precio "desde" formateado con moneda
   - Link a `/experiencias/[slug]`
7. Crear componente `ExperienceFilters`:
   - Filtro por tags (checkboxes o pill buttons)
   - Filtro por tipo de experiencia (dropdown o pill buttons)
   - Botón "Limpiar filtros"
8. Grid responsivo: 1 columna mobile, 2 columnas tablet (≥ 768px), 3 columnas desktop (≥ 1024px).
9. Empty state cuando no hay experiencias publicadas o los filtros no tienen resultados.
10. Loading state mientras se cargan los datos.

## Fuera de alcance

- Búsqueda por texto libre.
- Paginación (se cargan hasta 25 experiencias; paginación futura).
- Sorting (por precio, fecha, nombre).
- SEO meta tags.
- Página de detalle de experiencia (TASK-018).
- Filtros avanzados (por fecha, por precio, por ubicación).
- Animaciones de scroll o lazy loading de imágenes (optimización futura).
- Caché de imágenes o CDN.

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Comercial (pricing, addons, paquetes, pases)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experiences` | leer | Fetch experiencias con `status === "published"` |
| `tags` | leer | Fetch todas las tags para filtros |
| `experience_tags` | leer | Fetch relaciones N:N para asociar tags a experiencias |
| `pricing_tiers` | leer | Fetch tiers activos para calcular precio "desde" |

## Atributos nuevos o modificados

N/A — esta tarea no modifica atributos de base de datos.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Los datos se leen directamente del SDK con permisos `Role.any()` |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Bucket de imágenes de experiencias | leer | Se genera preview URL de `heroImageId` via Appwrite Storage |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `ExperiencesListPage` | público | crear | Página principal del listado en `/experiencias` |
| `ExperienceCard` | público | crear | Card editorial por experiencia |
| `ExperienceFilters` | público | crear | Panel de filtros por tags y tipo |
| `TypeBadge` | público | crear | Badge visual para tipo de experiencia |
| `PriceTag` | público | crear | Componente de precio "desde X" formateado |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useExperiences` | crear | Fetch experiencias publicadas + pricing tiers + tags |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/experiencias` | público | ninguno | Listado público de experiencias |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver listado público de experiencias | ✅ | ✅ | ✅ | ✅ | ✅ |
| Filtrar por tags y tipo | ✅ | ✅ | ✅ | ✅ | ✅ |

## Flujo principal

1. El visitante navega a `/experiencias`.
2. La página carga experiencias publicadas, tags y pricing tiers desde Appwrite.
3. Se muestra un grid de cards con hero image, nombre, descripción, badge de tipo y precio "desde".
4. El visitante puede activar filtros por tags (yoga, meditation, retreat, etc.) o por tipo (session, immersion, etc.).
5. El grid se filtra en tiempo real (client-side) mostrando solo experiencias que coinciden.
6. Si no hay resultados, se muestra empty state con mensaje y botón "Limpiar filtros".
7. Al hacer click en una card, el visitante navega a `/experiencias/[slug]`.

## Criterios de aceptación

- [x] La página `/experiences` muestra un grid de experiencias con `status === "published"`.
- [x] Cada card muestra: hero image, `publicName`, `shortDescription` truncada, badge de tipo, precio "desde".
- [x] El precio "desde" se calcula como el menor `basePrice` de `pricing_tiers` donde `isActive === true` para cada experiencia.
- [x] Si una experiencia no tiene pricing tiers activos, se muestra "Inquire for pricing".
- [x] Los filtros por tags funcionan: al seleccionar un tag, solo se muestran experiencias que tienen ese tag via `experience_tags`.
- [x] Los filtros por tipo funcionan: al seleccionar un tipo, solo se muestran experiencias con ese `type`.
- [x] Se pueden combinar filtros de tags y tipo simultáneamente (AND lógico).
- [x] El botón "Clear filters" resetea todos los filtros activos.
- [x] El grid es responsivo: 1 columna en mobile (< 768px), 2 columnas en tablet (768px–1023px), 3 columnas en desktop (≥ 1024px).
- [x] Si no hay experiencias publicadas, se muestra empty state con mensaje "No experiences available at the moment."
- [x] Si los filtros activos no tienen resultados, se muestra empty state con botón "Clear filters".
- [x] Cada card es clickeable y navega a `/experiences/[slug]`.
- [x] Mientras se cargan los datos, se muestra un loading state (skeleton cards).
- [x] Las imágenes se renderizan desde Appwrite Storage preview URL con dimensiones optimizadas para cards (600x450).

## Validaciones de seguridad

- [x] Solo se muestran experiencias con `status === "published"` — nunca `draft` ni `archived`.
- [x] Los queries usan `Query.equal("status", "published")` para filtrar server-side.
- [x] No se expone información interna (nombres internos `name`, notas, sortOrder no-público) en la UI.

## Dependencias

- **TASK-003:** Schema dominio editorial — provee colecciones `experiences`, `tags`, `experience_tags` con atributos e índices.
- **TASK-004:** Schema dominio comercial — provee colección `pricing_tiers` con atributos e índices.
- **TASK-016:** Public layout — provee `PublicLayout` como shell que envuelve la página.

## Bloquea a

- **TASK-018:** Detalle público de experiencia — el link de cada card apunta al detalle.

## Riesgos y notas

- **Queries múltiples:** Esta página requiere 4 queries (experiences, tags, experience_tags, pricing_tiers). Considerar optimizar con queries paralelas o un hook que orqueste todo con `Promise.all`.
- **Límite de 25 documentos:** Appwrite retorna máximo 25 documentos por query por defecto. Para un catálogo inicial esto es suficiente, pero documentar que paginación será necesaria si el catálogo crece.
- **Imágenes sin heroImageId:** Si una experiencia no tiene `heroImageId`, mostrar un placeholder visual premium (no una imagen rota).
- **Precio "desde" con múltiples monedas:** Si hay tiers en MXN y USD para la misma experiencia, el "desde" debe tomar la moneda principal (MXN por defecto). Considerar definir moneda por defecto en `site_settings`.
- **Performance de filtros client-side:** Con 25 experiencias, el filtrado client-side es viable. Si escala significativamente, migrar a queries server-side con filtros Appwrite.
