# TASK-003: Schema dominio editorial — experiences, publications, sections, tags

## Objetivo

Crear en Appwrite todas las colecciones del dominio editorial de OMZONE: el catálogo maestro de experiencias, el CMS de publicaciones con secciones modulares, las etiquetas reutilizables y la tabla intermedia N:N entre experiencias y tags. Al completar esta tarea, las 5 colecciones existen en la base de datos `omzone_db` con todos sus atributos, índices y permisos, y están registradas en `appwrite.json` para despliegue reproducible.

## Contexto

- **Fase:** 1 — Schema core (Appwrite)
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 1
- **Documento maestro:** Secciones de Experiencias (RF-01), Publicaciones/CMS (RF-02, RF-14)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Secciones 2.1 a 2.5
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Dominio Editorial (2.1)
- **RF relacionados:** RF-01 (Catálogo de experiencias), RF-02 (CMS editorial), RF-14 (Media y contenido)
- **ADR relacionados:** ADR-003 (Separación editorial/comercial) — las colecciones editoriales no contienen lógica de precios ni inventario.

El dominio editorial es la base del sistema. La tabla `experiences` es la entidad central referenciada por todos los demás dominios (comercial, agenda, transaccional). Las publicaciones permiten contenido CMS independiente o asociado a una experiencia.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear la base de datos `omzone_db` en Appwrite si no existe.
2. Crear la colección `experiences` con los 28 atributos definidos en el modelo de datos, 4 índices y permisos.
3. Crear la colección `publications` con los 16 atributos, 4 índices y permisos.
4. Crear la colección `publication_sections` con los 10 atributos, 2 índices y permisos.
5. Crear la colección `tags` con los 5 atributos, 2 índices y permisos.
6. Crear la colección `experience_tags` con los 2 atributos, 3 índices y permisos.
7. Configurar permisos de colección según el modelo de datos (lectura pública, escritura admin).
8. Registrar todas las colecciones en `appwrite.json`.
9. Desplegar via `appwrite deploy --all` o `appwrite deploy --collection`.
10. Verificar que las colecciones, atributos e índices existen correctamente en la consola de Appwrite.

## Fuera de alcance

- Colecciones del dominio comercial (editions, pricing, addons, packages, passes) — TASK-004.
- Colecciones del dominio agenda (slots, resources) — TASK-005.
- Colecciones del dominio transaccional (orders, tickets, etc.) — TASK-006.
- Seed data o datos de prueba en las colecciones.
- Functions de Appwrite (ninguna).
- Componentes frontend o UI.
- Buckets de Storage para imágenes (los atributos `heroImageId`, `galleryImageIds`, etc. son strings que referencian fileIds — los buckets se crean en otra task).
- Lógica de negocio, validaciones server-side o reglas de pricing.

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experiences` | crear | Catálogo maestro de experiencias — entidad central del sistema |
| `publications` | crear | CMS editorial: landings, blog posts, highlights |
| `publication_sections` | crear | Bloques modulares dentro de una publicación |
| `tags` | crear | Etiquetas reutilizables para categorización y filtrado |
| `experience_tags` | crear | Tabla intermedia N:N entre `experiences` y `tags` |

## Atributos nuevos o modificados

### `experiences`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `experiences` | `name` | string(255) | sí | Nombre interno |
| `experiences` | `publicName` | string(255) | sí | Nombre público EN |
| `experiences` | `publicNameEs` | string(255) | no | Nombre público ES |
| `experiences` | `slug` | string(255) | sí | URL slug (único) |
| `experiences` | `type` | enum [`session`, `immersion`, `retreat`, `stay`, `private`, `package`] | sí | Tipo de experiencia |
| `experiences` | `saleMode` | enum [`direct`, `request`, `assisted`, `pass`] | sí | Modo de venta |
| `experiences` | `fulfillmentType` | enum [`ticket`, `booking`, `pass`, `package`] | sí | Tipo de fulfillment |
| `experiences` | `shortDescription` | string(500) | no | Resumen corto EN |
| `experiences` | `shortDescriptionEs` | string(500) | no | Resumen corto ES |
| `experiences` | `longDescription` | string(5000) | no | Descripción larga EN |
| `experiences` | `longDescriptionEs` | string(5000) | no | Descripción larga ES |
| `experiences` | `heroImageId` | string(255) | no | fileId de portada en Storage |
| `experiences` | `galleryImageIds` | string(5000) | no | JSON array de fileIds |
| `experiences` | `requiresSchedule` | boolean | sí | ¿Requiere selección de fecha/slot? |
| `experiences` | `requiresDate` | boolean | sí | ¿Requiere fecha específica? |
| `experiences` | `allowQuantity` | boolean | sí | ¿Permite múltiples asistentes? |
| `experiences` | `maxQuantity` | integer | no | Máximo de asistentes por compra |
| `experiences` | `minQuantity` | integer | no | Mínimo de asistentes por compra |
| `experiences` | `generatesTickets` | boolean | sí | ¿Genera tickets tras compra? |
| `experiences` | `status` | enum [`draft`, `published`, `archived`] | sí | Estado de publicación |
| `experiences` | `sortOrder` | integer | no | Orden de visualización |
| `experiences` | `seoTitle` | string(255) | no | Título SEO |
| `experiences` | `seoDescription` | string(500) | no | Meta description |
| `experiences` | `ogImageId` | string(255) | no | fileId de OG image |

### `publications`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `publications` | `title` | string(255) | sí | Título EN |
| `publications` | `titleEs` | string(255) | no | Título ES |
| `publications` | `slug` | string(255) | sí | URL slug (único) |
| `publications` | `subtitle` | string(500) | no | Subtítulo EN |
| `publications` | `subtitleEs` | string(500) | no | Subtítulo ES |
| `publications` | `excerpt` | string(1000) | no | Extracto EN |
| `publications` | `excerptEs` | string(1000) | no | Extracto ES |
| `publications` | `category` | enum [`landing`, `blog`, `highlight`, `institutional`, `faq`] | sí | Categoría de publicación |
| `publications` | `experienceId` | string(255) | no | Relación a experiencia (si aplica) |
| `publications` | `heroImageId` | string(255) | no | fileId portada |
| `publications` | `status` | enum [`draft`, `published`, `archived`] | sí | Estado de publicación |
| `publications` | `publishedAt` | datetime | no | Fecha de publicación |
| `publications` | `seoTitle` | string(255) | no | SEO title |
| `publications` | `seoDescription` | string(500) | no | SEO description |
| `publications` | `ogImageId` | string(255) | no | OG image |

### `publication_sections`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `publication_sections` | `publicationId` | string(255) | sí | Relación a publicación |
| `publication_sections` | `sectionType` | enum [`hero`, `text`, `gallery`, `highlights`, `faq`, `itinerary`, `testimonials`, `inclusions`, `restrictions`, `cta`, `video`] | sí | Tipo de sección |
| `publication_sections` | `title` | string(255) | no | Título de la sección EN |
| `publication_sections` | `titleEs` | string(255) | no | Título ES |
| `publication_sections` | `content` | string(10000) | no | Contenido EN (markdown/richtext) |
| `publication_sections` | `contentEs` | string(10000) | no | Contenido ES |
| `publication_sections` | `mediaIds` | string(5000) | no | JSON array de fileIds |
| `publication_sections` | `metadata` | string(5000) | no | JSON con datos extra de la sección |
| `publication_sections` | `sortOrder` | integer | sí | Orden de visualización |
| `publication_sections` | `isVisible` | boolean | sí | ¿Visible en público? |

### `tags`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `tags` | `name` | string(100) | sí | Nombre EN |
| `tags` | `nameEs` | string(100) | no | Nombre ES |
| `tags` | `slug` | string(100) | sí | Slug (único) |
| `tags` | `category` | enum [`wellness`, `activity`, `level`, `duration`, `location`, `audience`] | no | Categoría de tag |
| `tags` | `sortOrder` | integer | no | Orden |

### `experience_tags`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `experience_tags` | `experienceId` | string(255) | sí | FK a `experiences` |
| `experience_tags` | `tagId` | string(255) | sí | FK a `tags` |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Esta tarea es solo schema |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Ninguno | — | Los atributos de imageId son strings; los buckets se crean en otra task |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| Ninguno | — | — | Esta tarea no involucra frontend |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| Ninguno | — | — |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| Ninguna | — | — | — |

## Permisos y labels involucrados

### `experiences`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `publications`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `publication_sections`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `tags`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `experience_tags`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

**Implementación Appwrite:**
- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

## Flujo principal

1. Verificar que la base de datos `omzone_db` existe en Appwrite. Si no, crearla.
2. Crear la colección `experiences` con todos los atributos (28), enums y valores por defecto.
3. Crear los 4 índices de `experiences`: `idx_slug` (unique), `idx_status`, `idx_type`, `idx_type_status`.
4. Asignar permisos de colección: read `Role.any()`, create/update/delete `Role.label("admin")`.
5. Crear la colección `publications` con los 16 atributos.
6. Crear los 4 índices de `publications`: `idx_slug` (unique), `idx_status`, `idx_category_status`, `idx_experienceId`.
7. Asignar permisos idénticos a `experiences`.
8. Crear la colección `publication_sections` con los 10 atributos.
9. Crear los 2 índices: `idx_publicationId`, `idx_publicationId_sortOrder`.
10. Asignar permisos idénticos.
11. Crear la colección `tags` con los 5 atributos.
12. Crear los 2 índices: `idx_slug` (unique), `idx_category`.
13. Crear la colección `experience_tags` con los 2 atributos.
14. Crear los 3 índices: `idx_experienceId`, `idx_tagId`, `idx_experienceId_tagId` (unique).
15. Registrar las 5 colecciones en `appwrite.json`.
16. Ejecutar `appwrite deploy --all` o `appwrite deploy --collection` para desplegar.
17. Verificar en la consola de Appwrite que todas las colecciones, atributos, índices y permisos existen.

## Criterios de aceptación

- [x] La base de datos `omzone_db` existe en Appwrite.
- [x] La colección `experiences` existe con los 24 atributos definidos en `docs/architecture/01_data-model.md` sección 2.1.
- [x] Los 3 atributos enum de `experiences` (`type`, `saleMode`, `fulfillmentType`) tienen los valores correctos del modelo.
- [x] El atributo `status` de `experiences` es enum con valores `draft`, `published`, `archived`.
- [x] Los 4 índices de `experiences` están creados, incluyendo `idx_slug` como unique.
- [x] La colección `publications` existe con los 15 atributos, incluido `category` como enum con 5 valores.
- [ ] Los 4 índices de `publications` están creados, incluyendo `idx_slug` como unique.
- [x] La colección `publication_sections` existe con los 10 atributos, incluido `sectionType` como enum con 11 valores.
- [x] Los 2 índices de `publication_sections` están creados, incluyendo el compuesto `idx_publicationId_sortOrder`.
- [x] La colección `tags` existe con los 5 atributos y 2 índices, `idx_slug` como unique.
- [x] La colección `experience_tags` existe con 2 atributos y 3 índices, `idx_experienceId_tagId` como unique.
- [x] Todas las colecciones tienen permisos read `Role.any()`, create/update/delete `Role.label("admin")`.
- [x] Las 5 colecciones están registradas en `appwrite.json` y el deploy es reproducible ejecutando `appwrite deploy`.
- [x] Un usuario anónimo puede listar documentos de `experiences` via SDK (read público).
- [x] Un usuario sin label `admin` NO puede crear documentos en ninguna colección editorial.
- [x] Los tamaños de string son correctos: `longDescription` usa TEXT (off-page, 16K+ chars), `content` en sections usa TEXT, `galleryImageIds` usa TEXT — resuelve el límite de 65535 bytes por fila de MariaDB.

## Validaciones de seguridad

- [x] Los permisos de escritura están restringidos a `Role.label("admin")` — no a `Role.users()`.
- [x] No se otorgan permisos de delete a `operator` ni `client` en ninguna colección editorial.
- [x] Los índices unique (`idx_slug`, `idx_experienceId_tagId`) previenen duplicados a nivel de base de datos.
- [x] No se exponen colecciones con permisos de escritura pública (create/update/delete requieren `admin`).

## Dependencias

- **TASK-001:** Scaffold proyecto React + Vite + TailwindCSS + Appwrite SDK — provee el proyecto base y la configuración del SDK/CLI para interactuar con Appwrite.

## Bloquea a

- **TASK-004:** Schema dominio comercial — `experience_editions`, `pricing_tiers`, `addon_assignments` referencian `experiences` via FK.
- **TASK-005:** Schema dominio agenda — `slots` referencia `experiences` via FK.
- **TASK-006:** Schema dominio transaccional — `tickets`, `booking_requests` referencian `experiences`.
- **TASK-011:** CRUD experiencias desde admin — requiere que las colecciones existan.
- **TASK-017:** Listado público de experiencias — requiere colecciones para leer datos.
- **TASK-035:** CRUD publicaciones y secciones desde admin.

## Riesgos y notas

- **Orden de creación de atributos:** En Appwrite, los atributos de tipo enum pueden tardar en crearse. Crear los atributos secuencialmente y verificar que cada uno queda en estado `available` antes de continuar.
- **Índices compuestos:** Los índices compuestos (ej: `idx_type_status`, `idx_publicationId_sortOrder`) deben crearse después de que todos los atributos involucrados existan.
- **Slugs únicos:** Los índices unique en `slug` son críticos para el routing público. El índice unique `idx_experienceId_tagId` previene tags duplicados por experiencia.
- **Tamaños de string:** Los campos JSON como `galleryImageIds`, `mediaIds` y `metadata` usan string(5000). Si en el futuro se requiere mayor tamaño, se necesitará migración. El `snapshot` no aplica en este dominio.
- **ADR-003:** La separación editorial/comercial es explícita. Estas colecciones NO contienen pricing, inventario ni lógica de agenda. Las experiencias son catálogo narrativo; los precios viven en el dominio comercial.
- **Enum `sectionType`:** Tiene 11 valores posibles. Si se agregan tipos en el futuro, requiere actualización del enum en Appwrite (que permite agregar valores sin romper datos existentes).
