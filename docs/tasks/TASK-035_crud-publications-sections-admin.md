# TASK-035: CRUD publicaciones y secciones desde admin panel

## Objetivo

Implementar el módulo completo de gestión de publicaciones y sus secciones modulares desde el panel administrativo de OMZONE. Al completar esta tarea, un admin puede crear, editar, listar y gestionar publicaciones CMS con secciones de contenido reordenables, preview público y auto-generación de slug. Esto habilita la capa editorial completa del sistema.

## Contexto

- **Fase:** 10 — CMS y publicaciones
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 10
- **Documento maestro:** Secciones:
  - **RF-01:** Gestión de contenido editorial — publicaciones como vehículo narrativo
  - **RF-14:** CMS / publicaciones — secciones modulares, contenido bilingüe
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Sección 2.2 (`publications`), 2.3 (`publication_sections`)
- **ADR relacionados:** ADR-003 (Separación editorial/comercial) — las publicaciones son la capa narrativa pública, independiente de la entidad comercial `experiences`.

Las tablas `publications` y `publication_sections` fueron creadas en TASK-003. Esta tarea implementa la interfaz admin para gestionar esos datos e incluye el manejo completo de secciones dentro de cada publicación.

## Alcance

Lo que SÍ incluye esta tarea:

1. Página de listado de publicaciones (`/admin/publications`):
   - Tabla con columnas: título, categoría, estado, fecha de publicación, acciones
   - Filtro por categoría (landing, blog, highlight, institutional, faq)
   - Filtro por estado (draft, published, archived)
   - Búsqueda por título
   - Paginación
   - Botón "Crear publicación"
   - Empty state cuando no hay publicaciones
2. Formulario de creación de publicación (`/admin/publications/create`):
   - Campos: `title`, `titleEs`, `slug` (auto-generado desde title), `subtitle`, `subtitleEs`, `excerpt`, `excerptEs`, `category` (enum select), `experienceId` (opcional — selector de experiencia vinculada), `heroImageId` (file picker), `status`, `publishedAt`, `seoTitle`, `seoDescription`, `ogImageId`
   - Validación de campos requeridos (title, slug, category, status)
   - Validación de formato de slug
   - Feedback de éxito/error
   - Redirección al editor de secciones tras creación exitosa
3. Formulario de edición de publicación (`/admin/publications/:id/edit`):
   - Mismos campos pre-poblados
   - Mismas validaciones
   - Botón "Guardar cambios"
4. Gestión de secciones dentro de una publicación (`/admin/publications/:id/sections`):
   - Listado de secciones existentes ordenadas por `sortOrder`
   - Agregar nueva sección con tipo seleccionable: `hero`, `text`, `gallery`, `highlights`, `faq`, `itinerary`, `testimonials`, `inclusions`, `restrictions`, `cta`, `video`
   - Formulario de sección: `sectionType`, `title`, `titleEs`, `content`, `contentEs` (textarea / markdown editor), `mediaIds` (referencia a archivos), `metadata` (JSON editor), `sortOrder`, `isVisible` (toggle)
   - Editar sección existente
   - Eliminar sección (con confirmación)
   - Drag-and-drop reorder de secciones (actualiza sortOrder)
5. Preview de publicación:
   - Botón "Vista previa" que abre publicación tal como se vería públicamente
   - Renderiza secciones en orden con componentes visuales básicos
   - Funciona como modal o nueva pestaña
6. Slug auto-generación:
   - Al escribir `title`, generar slug automáticamente (lowercase, hyphens)
   - Permitir override manual
   - Validar unicidad
7. Link a experiencia:
   - Selector que muestra experiencias publicadas
   - Almacena `experienceId` en la publicación
   - Opcional — la publicación puede no estar vinculada a ninguna experiencia
8. Mobile responsive:
   - Tabla de publicaciones → tarjetas en mobile (< 768px)
   - Formularios en single-column en mobile
   - Secciones reordenables con botones up/down como fallback del drag-and-drop en mobile

## Fuera de alcance

- Renderizado público de publicaciones (TASK-036).
- Componente de media upload/picker (TASK-038) — se usa referencia a fileId por ahora.
- Blog listing page o paginación pública.
- Búsqueda pública de publicaciones.
- Versionado de publicaciones.
- Workflow de aprobación de contenido.
- Rich text editor avanzado (WYSIWYG) — se usa textarea con markdown.
- Programación automática de publicación por fecha.

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Frontend admin

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `publications` | crear / leer / actualizar | CRUD completo de publicaciones |
| `publication_sections` | crear / leer / actualizar / borrar | Gestión de secciones dentro de publicación |
| `experiences` | leer | Para selector de experiencia vinculada |

## Atributos nuevos o modificados

N/A — las tablas `publications` y `publication_sections` fueron creadas en TASK-003 con todos los atributos definidos en el data model.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | El CRUD se hace con Appwrite Databases SDK desde frontend (permisos via `Role.label("admin")`) |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `publication_media` | leer | Referencia a heroImageId y ogImageId; upload se gestiona en TASK-037/038 |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `PublicationListPage` | admin | crear | Listado con tabla, filtros, búsqueda |
| `PublicationCreatePage` | admin | crear | Formulario de creación |
| `PublicationEditPage` | admin | crear | Formulario de edición |
| `PublicationForm` | admin | crear | Formulario reutilizable (create + edit) |
| `PublicationTable` | admin | crear | Tabla de publicaciones |
| `SectionManager` | admin | crear | Listado de secciones con drag-and-drop |
| `SectionForm` | admin | crear | Formulario para crear/editar sección |
| `SectionCard` | admin | crear | Card de sección con preview, edit, delete, reorder |
| `PublicationPreview` | admin | crear | Preview de publicación como se vería públicamente |
| `ExperienceSelector` | admin | crear | Selector de experiencia vinculada |
| `SlugInput` | admin | usar existente | Input con auto-generación de slug (creado en TASK-011) |
| `StatusBadge` | admin | usar existente | Badge visual para status |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `usePublications` | crear | Fetch, create, update publicaciones |
| `usePublicationSections` | crear | CRUD de secciones por publicationId |
| `useExperiences` | usar existente | Para el selector de experiencia vinculada |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/publications` | admin | admin | Listado de publicaciones |
| `/admin/publications/create` | admin | admin | Creación |
| `/admin/publications/:id/edit` | admin | admin | Edición |
| `/admin/publications/:id/sections` | admin | admin | Gestión de secciones |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Listar publicaciones | ✅ | ✅ | ✅ | ❌ | ❌ |
| Crear publicación | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar publicación | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cambiar status (publish/archive) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Eliminar publicación | ❌ | ❌ | ❌ | ❌ | ❌ |
| Agregar/editar/eliminar secciones | ✅ | ✅ | ✅ | ❌ | ❌ |
| Reordenar secciones | ✅ | ✅ | ✅ | ❌ | ❌ |
| Preview publicación | ✅ | ✅ | ✅ | ❌ | ❌ |

Nota: No se implementa "eliminar publicación" — se usa archivado. Operator puede editar contenido y secciones pero no publicar/archivar ni crear nuevas.

## Flujo principal

1. Admin navega a `/admin/publications`.
2. Se muestra listado de publicaciones en tabla con filtros por categoría y status.
3. Admin hace click en "Crear publicación".
4. Se navega a formulario de creación con campos en blanco.
5. Admin llena título, categoría, excerpt; slug se genera automáticamente.
6. Opcionalmente vincula una experiencia y selecciona heroImage.
7. Admin guarda → se crea publicación con status `draft`.
8. Se redirige al editor de secciones de esa publicación.
9. Admin agrega secciones: elige tipo, llena contenido.
10. Admin reordena secciones con drag-and-drop.
11. Admin hace click en "Vista previa" para ver cómo se verá públicamente.
12. Cuando está conforme, cambia status a `published`.

## Criterios de aceptación

- [x] Un admin puede ver el listado de publicaciones en tabla con columnas: título, categoría, status, publishedAt, acciones.
- [x] Un admin puede crear una publicación con título, slug auto-generado, categoría y status.
- [x] El slug se genera automáticamente desde el título (lowercase, hyphens, sin caracteres especiales) y se puede override manualmente.
- [x] Se valida unicidad del slug antes de guardar; si ya existe se muestra error inline.
- [x] Un admin puede editar una publicación existente con campos pre-poblados.
- [x] Un admin puede vincular o desvincular una experiencia a la publicación mediante selector.
- [x] Un admin puede agregar secciones a una publicación seleccionando el tipo de sección.
- [x] Los 11 tipos de sección están disponibles: hero, text, gallery, highlights, faq, itinerary, testimonials, inclusions, restrictions, cta, video.
- [x] Un admin puede editar el contenido de cada sección (título ES/EN, contenido ES/EN, mediaIds, metadata, isVisible).
- [x] Un admin puede eliminar una sección con confirmación previa.
- [x] Un admin puede reordenar secciones mediante up/down buttons y el sortOrder se actualiza en DB.
- [x] El preview muestra la publicación con sus secciones renderizadas en orden.
- [x] Al intentar crear sin campos requeridos (title, category), se muestran errores inline.
- [x] El listado soporta filtro por categoría y status, y búsqueda por título.
- [x] Si no hay publicaciones, se muestra empty state con CTA "Crear primera publicación".
- [x] En mobile (< 768px), la tabla se transforma en tarjetas.
- [x] Los formularios se muestran en single-column en mobile.
- [x] En mobile, el reorder de secciones funciona con botones up/down.
- [x] Un operator puede ver y editar contenido pero NO puede crear publicaciones ni cambiar status.

## Validaciones de seguridad

- [x] Las operaciones de creación/actualización usan Appwrite Databases SDK que valida permisos via `Role.label("admin")`.
- [x] El slug se sanitiza antes de guardar (strip caracteres peligrosos, lowercase, solo hyphens y alfanuméricos).
- [x] El campo `metadata` en secciones se valida como JSON válido antes de guardar.
- [x] Los inputs de texto se renderizan como texto plano en preview (whitespace-pre-line, sin dangerouslySetInnerHTML).
- [x] No se permite inyección de HTML arbitrario en campos de contenido — preview usa texto plano, no innerHTML.

## Dependencias

- **TASK-003:** Schema dominio editorial — provee tablas `publications`, `publication_sections` con atributos, índices y permisos.
- **TASK-010:** Admin layout — provee el shell admin (sidebar, navigation, content area).

## Bloquea a

- **TASK-036:** Renderizado público de publicaciones — necesita que las publicaciones y secciones existan para renderizarlas.

## Riesgos y notas

- **Drag-and-drop:** Requiere una librería de drag-and-drop compatible con React (ej: `@dnd-kit/core` o `react-beautiful-dnd`). Evaluar cuál es más ligera y compatible con mobile.
- **Markdown vs Rich Text:** En esta iteración se usa textarea con markdown. Si se requiere WYSIWYG en el futuro, el campo `content` ya soporta strings largos (10000 chars). Se puede agregar un editor en iteración futura sin cambiar schema.
- **mediaIds:** Los fileIds se almacenan como JSON array string. En esta tarea se ingresan manualmente o por referencia. El componente MediaPicker (TASK-038) mejorará la UX.
- **Preview fidelity:** El preview en admin es una aproximación del renderizado público. El renderizado final con estilos completos se implementa en TASK-036.
- **Contenido bilingüe:** Los campos ES son opcionales. Si no se llenan, el renderizado público debería usar el valor EN como fallback.
