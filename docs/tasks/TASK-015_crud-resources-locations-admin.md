# TASK-015: CRUD resources y locations desde admin

## Objetivo

Implementar la gestión de recursos operativos (instructores, espacios, equipos), locaciones y cuartos/espacios desde el panel administrativo de OMZONE. Al completar esta tarea, un admin puede crear y gestionar el catálogo de recursos, locaciones y rooms que se asignan a slots y experiencias para la operación interna.

## Contexto

- **Fase:** 3 — CRUD admin básico
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 3
- **Documento maestro:** Secciones:
  - **RF-14:** Recursos operativos — cuartos, locaciones, espacios, capacidad física, notas internas, disponibilidad
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Sección 4.3 (`resources`), 5.3 (`locations`), 5.4 (`rooms`)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Dominio Operativo (2.4) — locaciones y cuartos son operación, no producto público
- **ADR relacionados:** ADR-004 (Experience-first, not room-first) — la experiencia se vende primero; la locación se asigna después

Las tablas `resources` (7 atributos), `locations` (5 atributos) y `rooms` (6 atributos) fueron creadas en TASK-005.

## Alcance

Lo que SÍ incluye esta tarea:

1. Página de recursos (`/admin/resources`):
   - Sub-tabs o secciones: Recursos, Locaciones, Cuartos
   - **Recursos** tab:
     - Tabla con columnas: nombre, tipo (instructor/space/equipment/vehicle), isActive, acciones
     - Búsqueda por nombre
     - Filtro por tipo
     - Botón "Crear recurso"
     - Empty state
   - **Locaciones** tab:
     - Tabla con columnas: nombre, dirección, isActive, acciones
     - Botón "Crear locación"
     - Empty state
   - **Cuartos** tab:
     - Tabla con columnas: nombre, locación (nombre), tipo, capacidad, isActive, acciones
     - Filtro por locación
     - Botón "Crear cuarto"
     - Empty state
2. Formulario de creación/edición de recurso:
   - Campos: `name`, `type` (enum: instructor, space, equipment, vehicle), `description`, `photoId` (upload opcional), `contactInfo`, `isActive`, `metadata` (JSON textarea opcional)
   - Validación: name y type requeridos
3. Formulario de creación/edición de locación:
   - Campos: `name`, `description`, `address`, `coordinates` (opcional), `isActive`
   - Validación: name requerido
4. Formulario de creación/edición de cuarto/room:
   - Campos: `locationId` (select de locaciones), `name`, `description`, `capacity`, `type` (enum: studio, outdoor, beach, conference, multiuse), `isActive`
   - Validación: name y locationId requeridos
5. Activar/desactivar inline:
   - Toggle de `isActive` para recursos, locaciones y rooms
6. Listado de rooms anidado en locación:
   - Desde el detalle/edición de una locación, ver los rooms asociados

## Fuera de alcance

- Calendario de disponibilidad de recursos (schedule por recurso).
- Vista pública de locaciones o recursos.
- Asignación de recursos a slots (eso es TASK-014 — `slot_resources`).
- Upload de foto de recurso con componente sofisticado (usar el `ImageUpload` reutilizable de TASK-011).
- Mapa interactivo con coordinates de locaciones.
- Metadata editor visual para resources (solo un textarea JSON básico).
- Bulk import de recursos o locaciones.
- Estadísticas de uso de recursos.

## Dominio

- [x] Operativo (bookings, validación, asignación) — solo la capa de catálogo operativo (resources, locations, rooms)
- Nota: clasificado como **Operativo + Frontend admin** en el plan maestro.

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `resources` | crear / leer / actualizar | CRUD de recursos operativos |
| `locations` | crear / leer / actualizar | CRUD de locaciones |
| `rooms` | crear / leer / actualizar | CRUD de cuartos/espacios por locación |

## Atributos nuevos o modificados

N/A — las tablas `resources` (7 attrs), `locations` (5 attrs) y `rooms` (6 attrs) fueron creadas en TASK-005.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | CRUD directo via Databases SDK |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_images` | usar existente | Reutilizar para photoId de recursos (upload opcional) |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `ResourcesPage` | admin | crear | Página con tabs: Recursos, Locaciones, Cuartos |
| `ResourceListTab` | admin | crear | Tab de recursos con tabla, filtros, búsqueda |
| `ResourceForm` | admin | crear | Formulario de creación/edición de recurso |
| `LocationListTab` | admin | crear | Tab de locaciones con tabla |
| `LocationForm` | admin | crear | Formulario de creación/edición de locación |
| `RoomListTab` | admin | crear | Tab de cuartos con tabla y filtro por locación |
| `RoomForm` | admin | crear | Formulario de creación/edición de room |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useResources` | crear | Fetch, create, update resources |
| `useLocations` | crear | Fetch, create, update locations |
| `useRooms` | crear | Fetch, create, update rooms filtrados por locationId |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/resources` | admin | heredado de `/admin` | Página con tabs: Recursos, Locaciones, Cuartos |
| `/admin/resources/create` | admin | heredado | Crear recurso |
| `/admin/resources/:id/edit` | admin | heredado | Editar recurso |
| `/admin/locations/create` | admin | heredado | Crear locación |
| `/admin/locations/:id/edit` | admin | heredado | Editar locación |
| `/admin/rooms/create` | admin | heredado | Crear room |
| `/admin/rooms/:id/edit` | admin | heredado | Editar room |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Listar recursos | ✅ | ✅ | ✅ | ❌ | ❌ |
| Crear recurso | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar recurso | ✅ | ✅ | ❌ | ❌ | ❌ |
| Activar/desactivar recurso | ✅ | ✅ | ❌ | ❌ | ❌ |
| Listar locaciones | ✅ | ✅ | ✅ | ❌ | ❌ |
| Crear locación | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar locación | ✅ | ✅ | ❌ | ❌ | ❌ |
| Listar rooms | ✅ | ✅ | ✅ | ❌ | ❌ |
| Crear room | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar room | ✅ | ✅ | ❌ | ❌ | ❌ |

Nota: Operator puede listar (read) pero no crear ni editar recursos, locaciones ni rooms (permisos de colección solo admin).

## Flujo principal

### Flujo A — Crear recurso
1. Admin navega a `/admin/resources` → tab "Recursos".
2. Ve la tabla de recursos existentes (vacía si es primera vez).
3. Hace click en "Crear recurso".
4. Llena formulario: name ("María García"), type ("instructor"), description ("Instructora de yoga certificada"), contactInfo ("maria@example.com"), isActive (true).
5. Opcionalmente sube foto del recurso.
6. Se valida y crea el documento en `resources`.
7. El recurso aparece en la tabla.

### Flujo B — Crear locación con rooms
1. Admin navega a `/admin/resources` → tab "Locaciones".
2. Hace click en "Crear locación".
3. Llena: name ("Estudio principal"), address ("Av. Tulum 123, Tulum"), isActive (true).
4. Se crea la locación.
5. Admin navega a tab "Cuartos" y hace click en "Crear cuarto".
6. Selecciona locación "Estudio principal", llena: name ("Sala yoga"), type ("studio"), capacity (20), isActive (true).
7. Se crea el room asociado a la locación.

## Criterios de aceptación

- [x] Un admin puede ver la lista de recursos en tabla con columnas: nombre, tipo, isActive, acciones.
- [x] Un admin puede crear un recurso con name, type, description, contactInfo e isActive.
- [x] Un admin puede editar un recurso existente con campos pre-poblados.
- [x] Un admin puede activar/desactivar un recurso con toggle inline.
- [x] La lista de recursos soporta búsqueda por nombre y filtro por tipo.
- [x] Un admin puede ver la lista de locaciones en tabla con columnas: nombre, dirección, isActive, acciones.
- [x] Un admin puede crear una locación con name, address y isActive.
- [x] Un admin puede editar una locación existente.
- [x] Un admin puede ver la lista de rooms en tabla con columnas: nombre, locación, tipo, capacidad, isActive, acciones.
- [x] Un admin puede crear un room asociado a una locación con name, type, capacity e isActive.
- [x] El select de locaciones en el formulario de room muestra solo locaciones activas.
- [x] La lista de rooms se puede filtrar por locación.
- [x] Si no hay recursos, se muestra empty state con CTA "Crear primer recurso".
- [x] Si no hay locaciones, se muestra empty state con CTA "Crear primera locación".
- [x] Si no hay rooms, se muestra empty state con CTA "Crear primer cuarto".
- [x] En mobile (< 768px), las tablas se transforman en cards.

## Validaciones de seguridad

- [x] Las operaciones CRUD usan permisos de colección: `Role.label("admin")` para create/update/delete; `Role.label("operator")` solo para read. — Permisos enforced en Appwrite server (TASK-005); UI gatea con `isAdmin` para ocultar botones de crear/editar/toggle al operator.
- [x] Los campos de texto (name, description, address, contactInfo) se sanitizan antes de guardar — `.trim()` en todos los handlers de submit de ResourceForm, LocationForm y RoomForm.
- [x] `capacity` de rooms se valida como entero positivo — validación en `RoomForm.validate()`: `parseInt` + guard `n < 1`.

## Dependencias

- **TASK-005:** Schema dominio agenda — provee tablas `resources`, `locations`, `rooms` con atributos, índices y permisos.
- **TASK-010:** Admin layout — provee el shell admin donde se renderizan las páginas.

## Bloquea a

- **TASK-014:** CRUD slots y agenda — necesita resources, locations y rooms para los selects en formularios de slots y asignación de recursos (puede desarrollarse en paralelo si los selects manejan listas vacías).

## Riesgos y notas

- **Locations/rooms sin índices adicionales:** La tabla `locations` no tiene índices explícitos en el data model (solo los autogenerados por Appwrite). Si el número de locaciones crece, puede necesitar un índice por `isActive`. Por ahora es suficiente.
- **Rooms filtrado:** El filtro de rooms por locationId depende de la query `equal("locationId", locationId)`. Verificar que el índice `idx_locationId` existe en la tabla `rooms`.
- **Resources metadata:** El campo `metadata` es un JSON string libre. En esta tarea se implementa como textarea simple. Un editor visual de JSON es mejora futura.
- **Photo upload:** Se reutiliza el componente `ImageUpload` de TASK-011 y el bucket `experience_images`. Si se requiere un bucket separado para recursos (ej: `resource_images`), se puede crear en esta tarea o reutilizar el existente.
- **TASK-014 interdependencia:** TASK-014 (slots) necesita locations, rooms y resources para los selects. Ambas tasks pueden desarrollarse en paralelo si TASK-014 maneja gracefully el caso de listas vacías.
- **No delete:** No se implementa eliminación de recursos, locaciones ni rooms. Solo se desactivan con `isActive = false`. Esto evita romper referencias existentes en `slots` y `slot_resources`.
