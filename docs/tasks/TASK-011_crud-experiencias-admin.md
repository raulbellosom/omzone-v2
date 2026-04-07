# TASK-011: CRUD experiencias desde admin panel

## Objetivo

Implementar el módulo completo de gestión de experiencias desde el panel administrativo de OMZONE: listado con búsqueda y filtros, creación con formulario completo, edición, cambio de estado (draft/published/archived), auto-generación de slug y upload de imagen de portada. Al completar esta tarea, un admin puede crear, listar, buscar, editar y cambiar el estado de experiencias desde el panel.

## Contexto

- **Fase:** 3 — CRUD admin básico
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 3
- **Documento maestro:** Secciones:
  - **RF-01:** Gestión de contenido editorial — experiencias como entidad central
  - **RF-02:** Gestión de experiencias — tipos, modos de venta, fulfillment
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Sección 2.1 (`experiences`)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Dominio Editorial (2.1) — `experiences` es la entidad central referenciada por todos los demás dominios
- **ADR relacionados:** ADR-003 (Separación editorial/comercial) — el CRUD de experiencias gestiona la entidad editorial base, sin precios ni ediciones.

La tabla `experiences` fue creada en TASK-003 con 28 atributos. Esta tarea implementa la interfaz admin para gestionar esos datos.

## Alcance

Lo que SÍ incluye esta tarea:

1. Página de listado de experiencias (`/admin/experiences`):
   - Tabla con columnas: nombre, tipo, modo de venta, estado, acciones
   - Búsqueda por nombre (publicName)
   - Filtro por tipo (session, immersion, retreat, stay, private, package)
   - Filtro por estado (draft, published, archived)
   - Paginación
   - Botón "Crear experiencia"
   - Empty state cuando no hay experiencias
2. Formulario de creación (`/admin/experiences/create`):
   - Todos los campos editables de `experiences`:
     - `name` (interno), `publicName`, `publicNameEs`
     - `slug` (auto-generado desde `publicName` con override manual)
     - `type` (enum select), `saleMode` (enum select), `fulfillmentType` (enum select)
     - `shortDescription`, `shortDescriptionEs`
     - `longDescription`, `longDescriptionEs`
     - `heroImageId` (upload de imagen a bucket `experience_images`)
     - `requiresSchedule`, `requiresDate`, `allowQuantity` (toggles)
     - `maxQuantity`, `minQuantity` (condicional si `allowQuantity`)
     - `generatesTickets` (toggle)
     - `status` (enum select)
     - `sortOrder`
     - `seoTitle`, `seoDescription`
   - Validación de campos requeridos
   - Validación de formato de slug (lowercase, hyphens, no spaces)
   - Feedback de éxito/error
   - Redirección al listado tras creación exitosa
3. Formulario de edición (`/admin/experiences/:id/edit`):
   - Mismos campos que creación, pre-poblados con datos existentes
   - Mismas validaciones
   - Feedback de éxito/error
   - Botón "Guardar cambios"
4. Cambio de estado inline:
   - Desde el listado: cambiar status de una experiencia (draft ↔ published ↔ archived)
   - Confirmación antes de archivar
5. Upload de imagen heroImage:
   - File input para seleccionar imagen
   - Upload al bucket `experience_images` en Storage
   - Guardar `fileId` en `heroImageId`
   - Preview de la imagen cargada
6. Auto-generación de slug:
   - Al escribir `publicName`, generar slug automáticamente (lowercase, hyphens)
   - Permitir override manual del slug
   - Validar unicidad del slug antes de guardar
7. Mobile responsive:
   - Tabla se transforma en tarjetas en pantallas < 768px
   - Formulario en single-column en mobile

## Fuera de alcance

- Ediciones de experiencia (TASK-012).
- Pricing tiers y reglas de precio (TASK-012).
- Addons y addon assignments (TASK-013).
- Tags management y asignación de tags a experiencias.
- Galería de imágenes (`galleryImageIds`) — solo heroImage.
- Vista pública de experiencias (Fase 4).
- OG image upload (`ogImageId`).
- Bulk actions (archivar/publicar múltiples).
- Drag & drop reorder de experiencias.
- Duplicar experiencia.

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Comercial (pricing, addons, paquetes, pases) — solo la entidad `experiences` que es compartida
- Nota: clasificado como **Editorial + Comercial + Frontend admin** en el plan maestro.

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experiences` | crear / leer / actualizar | CRUD completo de experiencias |
| Bucket `experience_images` | crear / leer | Upload de heroImage |

## Atributos nuevos o modificados

N/A — la tabla `experiences` y sus 28 atributos fueron creados en TASK-003. Esta tarea solo opera sobre ellos via CRUD.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | El CRUD se hace directamente con Appwrite Databases SDK desde el frontend (permisos via `Role.label("admin")`) |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_images` | crear bucket (si no existe) / upload files | Almacena heroImage de experiencias |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `ExperienceListPage` | admin | crear | Página de listado con tabla, filtros, búsqueda |
| `ExperienceCreatePage` | admin | crear | Página con formulario de creación |
| `ExperienceEditPage` | admin | crear | Página con formulario de edición |
| `ExperienceForm` | admin | crear | Formulario reutilizable (create + edit) |
| `ExperienceTable` | admin | crear | Tabla de experiencias con acciones |
| `ExperienceCard` | admin | crear | Card para vista mobile del listado |
| `ImageUpload` | admin | crear | Componente reutilizable de upload de imagen |
| `SlugInput` | admin | crear | Input con auto-generación de slug |
| `StatusBadge` | admin | crear | Badge visual para status (draft/published/archived) |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useExperiences` | crear | Fetch, create, update experiencias via Databases SDK |
| `useImageUpload` | crear | Upload de archivo a Storage bucket y retorno de fileId |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/experiences` | admin | heredado de `/admin` | Listado de experiencias |
| `/admin/experiences/create` | admin | heredado | Formulario de creación |
| `/admin/experiences/:id/edit` | admin | heredado | Formulario de edición |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Listar experiencias | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver detalle de experiencia | ✅ | ✅ | ✅ | ❌ | ❌ |
| Crear experiencia | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar experiencia | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cambiar status (publish/archive) | ✅ | ✅ | ❌ | ❌ | ❌ |
| Eliminar experiencia | ❌ | ❌ | ❌ | ❌ | ❌ |
| Upload imagen | ✅ | ✅ | ❌ | ❌ | ❌ |

Nota: No se implementa "eliminar" (delete). Se usa archivado como mecanismo de baja. Operator puede editar datos pero no publicar/archivar ni crear nuevas — estas restricciones se refinarán en tarea futura si es necesario ser más granular.

## Flujo principal

1. Admin navega a `/admin/experiences`.
2. Se muestra listado de experiencias en tabla con columnas: nombre, tipo, saleMode, status, acciones.
3. Admin usa filtros de tipo y status para encontrar experiencias específicas.
4. Admin hace click en "Crear experiencia".
5. Se navega a `/admin/experiences/create` con formulario vacío.
6. Admin llena campos obligatorios: name, publicName, type, saleMode, fulfillmentType, status.
7. Al escribir publicName, el campo slug se genera automáticamente.
8. Admin opcionalmente sube una imagen de portada (heroImage).
9. Admin hace click en "Crear".
10. Se validan campos requeridos y formato de slug.
11. Si hay errores, se muestran inline en el formulario.
12. Si es válido, se crea el documento en `experiences` via Databases SDK.
13. Se redirige al listado con mensaje de éxito.
14. Para editar, admin hace click en "Editar" en la fila de la tabla.
15. Se navega a `/admin/experiences/:id/edit` con formulario pre-poblado.
16. Admin modifica campos y guarda cambios.

## Criterios de aceptación

- [ ] Un admin puede ver el listado de experiencias en tabla con columnas: nombre, tipo, saleMode, status, acciones.
- [ ] Un admin puede crear una experiencia con name, publicName, slug, type, saleMode, fulfillmentType y status.
- [ ] Al escribir publicName, el slug se genera automáticamente (lowercase, hyphens, sin caracteres especiales).
- [ ] El slug puede override manual y se valida formato (lowercase, hyphens only, sin espacios).
- [ ] Un admin puede editar una experiencia existente y los campos se pre-pueblan correctamente.
- [ ] Al intentar crear sin campos requeridos (name, publicName, type, saleMode), se muestran errores inline.
- [ ] Un admin puede cambiar el status de una experiencia entre draft, published y archived desde el listado.
- [ ] Al archivar una experiencia, se muestra confirmación antes de ejecutar.
- [ ] Un admin puede subir una imagen heroImage que se guarda en el bucket `experience_images` y el fileId se asocia a la experiencia.
- [ ] El listado soporta búsqueda por nombre y filtro por tipo y status.
- [ ] El listado muestra paginación cuando hay más de 25 experiencias.
- [ ] Si no hay experiencias, se muestra empty state con botón "Crear primera experiencia".
- [ ] En mobile (< 768px), la tabla se transforma en tarjetas con la información esencial.
- [ ] El formulario se muestra en single-column en mobile.
- [ ] Un operator puede ver y editar experiencias pero NO puede crear ni cambiar status (restricción a nivel de API permission `Role.label("admin")`).

## Validaciones de seguridad

- [ ] Las operaciones de creación y actualización usan Appwrite Databases SDK que valida permisos via `Role.label("admin")` en server-side.
- [ ] El slug se sanitiza antes de guardar (strip caracteres peligrosos, lowercase, solo hyphens y alfanuméricos).
- [ ] El upload de imágenes valida tipo de archivo (solo jpg, png, webp) y tamaño máximo (5MB).
- [ ] No se exponen IDs internos de Appwrite en URLs públicas — solo slugs.

## Dependencias

- **TASK-003:** Schema dominio editorial — provee la tabla `experiences` con atributos, índices y permisos.
- **TASK-010:** Admin layout — provee el shell admin (sidebar, top bar, content area) donde se renderizan las páginas.

## Bloquea a

- **TASK-012:** CRUD ediciones y pricing tiers — necesita que las experiencias existan para crear ediciones y precios.
- **TASK-013:** CRUD addons y addon assignments — necesita experiencias para asignar addons.
- **TASK-014:** CRUD slots y agenda — necesita experiencias para crear slots.

## Riesgos y notas

- **Bucket `experience_images`:** Si el bucket no existe aún, esta tarea debe crearlo con permisos: read `Role.any()`, write `Role.label("admin")`. Verificar si hay una task previa que lo crea o incluirlo en esta task.
- **Slug unicidad:** Se debe verificar que el slug no existe antes de crear la experiencia. Usar query `slug == value` antes de create. Si existe, mostrar error "Este slug ya está en uso".
- **Operator permisos:** Los permisos de colección en Appwrite usan `Role.label("admin")` para create/update/delete. Si operator necesita editar, se requiere que los permisos de colección también incluyan `Role.label("operator")` para update. Verificar configuración de permisos en TASK-003.
- **File cleanup:** Si el admin sube una imagen y luego cancela la creación, el archivo queda huérfano en Storage. No se implementa cleanup automático en esta tarea — es una mejora futura.
- **galleryImageIds:** Se excluye de esta tarea. Solo se gestiona heroImage. La galería completa requiere un componente de media picker más sofisticado (TASK-038).
