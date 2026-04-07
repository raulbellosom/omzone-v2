# TASK-005: Schema dominio agenda — slots, slot_resources, resources, locations, rooms

## Objetivo

Crear en Appwrite todas las colecciones del dominio de agenda y las tablas operativas de locaciones de OMZONE: slots de disponibilidad, recursos asignables, la tabla intermedia slot-recurso, locaciones y cuartos/espacios. Al completar esta tarea, las 5 colecciones existen en `omzone_db` con todos sus atributos, índices y permisos, y están registradas en `appwrite.json` para despliegue reproducible.

## Contexto

- **Fase:** 1 — Schema core (Appwrite)
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 1
- **Documento maestro:** Secciones de Agenda/Ediciones (RF-04), Operación interna (RF-14)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Secciones 4.1 a 4.3 (Agenda) y 5.3 a 5.4 (Operativo: locations, rooms)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Dominio Agenda (2.3) y Dominio Operativo (2.4)
- **RF relacionados:** RF-04 (Agenda y disponibilidad), RF-14 (Operación y recursos)
- **ADR relacionados:** ADR-004 (Experience-first, not room-first) — las locaciones y cuartos son operación, no producto público. La experiencia se vende primero; la locación se asigna después.

El dominio de agenda define cuándo y bajo qué calendario se reserva una experiencia. Los slots son ocurrencias agendadas con capacidad. Los recursos (instructores, espacios, equipos) se asignan a slots. Las locaciones y cuartos son infraestructura operativa referenciada por slots y recursos.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear la colección `slots` con los 13 atributos, 5 índices y permisos.
2. Crear la colección `slot_resources` con los 4 atributos, 2 índices y permisos.
3. Crear la colección `resources` con los 7 atributos, 2 índices y permisos.
4. Crear la colección `locations` con los 5 atributos y permisos.
5. Crear la colección `rooms` con los 6 atributos, 1 índice y permisos.
6. Configurar permisos de colección según el modelo de datos (slots: lectura pública, escritura admin/operator; recursos y locaciones: solo admin/operator).
7. Registrar las 5 colecciones en `appwrite.json`.
8. Desplegar via CLI y verificar en consola.

## Fuera de alcance

- Colecciones del dominio editorial — TASK-003.
- Colecciones del dominio comercial — TASK-004.
- Colecciones del dominio transaccional — TASK-006.
- Lógica de booking, validación de capacidad o recurrencia de slots.
- Functions de creación/validación de slots.
- Seed data de locaciones, recursos o slots.
- Cualquier componente frontend o UI.
- Buckets de Storage.

## Dominio

- [x] Agenda (slots, recursos, capacidad)
- [x] Operativo (bookings, validación, asignación) — solo tablas de locations/rooms

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `slots` | crear | Fechas/horarios disponibles con capacidad |
| `slot_resources` | crear | Recursos asignados a un slot (instructor, espacio) |
| `resources` | crear | Catálogo de recursos operativos |
| `locations` | crear | Locaciones operativas |
| `rooms` | crear | Cuartos/espacios dentro de locaciones |
| `experiences` | leer | FK target para `slots.experienceId` — creada en TASK-003 |
| `experience_editions` | leer | FK target para `slots.editionId` — creada en TASK-004 |

## Atributos nuevos o modificados

### `slots`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `slots` | `experienceId` | string(255) | sí | FK a `experiences` |
| `slots` | `editionId` | string(255) | no | FK a `experience_editions` |
| `slots` | `slotType` | enum [`single`, `recurring`, `range`, `all-day`] | sí | Tipo de slot |
| `slots` | `startDatetime` | datetime | sí | Inicio (UTC) |
| `slots` | `endDatetime` | datetime | sí | Fin (UTC) |
| `slots` | `timezone` | string(50) | sí | Zona horaria original |
| `slots` | `capacity` | integer | sí | Cupos totales |
| `slots` | `bookedCount` | integer | sí | Cupos ocupados |
| `slots` | `locationId` | string(255) | no | FK a `locations` |
| `slots` | `roomId` | string(255) | no | FK a `rooms` |
| `slots` | `status` | enum [`available`, `full`, `cancelled`, `completed`] | sí | Estado del slot |
| `slots` | `notes` | string(1000) | no | Notas internas |

### `slot_resources`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `slot_resources` | `slotId` | string(255) | sí | FK a `slots` |
| `slot_resources` | `resourceId` | string(255) | sí | FK a `resources` |
| `slot_resources` | `role` | enum [`instructor`, `assistant`, `equipment`, `space`] | sí | Rol del recurso |
| `slot_resources` | `notes` | string(500) | no | Notas |

### `resources`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `resources` | `name` | string(255) | sí | Nombre |
| `resources` | `type` | enum [`instructor`, `space`, `equipment`, `vehicle`] | sí | Tipo de recurso |
| `resources` | `description` | string(1000) | no | Descripción |
| `resources` | `photoId` | string(255) | no | fileId de foto |
| `resources` | `contactInfo` | string(500) | no | Datos de contacto |
| `resources` | `isActive` | boolean | sí | ¿Disponible? |
| `resources` | `metadata` | string(2000) | no | JSON con datos adicionales |

### `locations`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `locations` | `name` | string(255) | sí | Nombre |
| `locations` | `description` | string(1000) | no | Descripción |
| `locations` | `address` | string(500) | no | Dirección |
| `locations` | `coordinates` | string(100) | no | Lat/lng |
| `locations` | `isActive` | boolean | sí | ¿Activa? |

### `rooms`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `rooms` | `locationId` | string(255) | sí | FK a `locations` |
| `rooms` | `name` | string(255) | sí | Nombre |
| `rooms` | `description` | string(1000) | no | Descripción |
| `rooms` | `capacity` | integer | no | Capacidad |
| `rooms` | `type` | enum [`studio`, `outdoor`, `beach`, `conference`, `multiuse`] | no | Tipo de espacio |
| `rooms` | `isActive` | boolean | sí | ¿Activo? |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Esta tarea es solo schema |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Ninguno | — | El atributo `photoId` en resources es un string; el bucket se crea en otra task |

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

### `slots`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `slot_resources`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `resources`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `locations`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `rooms`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

**Implementación Appwrite:**
- `slots`: read `Role.any()`, create/update `Role.label("admin")` + `Role.label("operator")`, delete `Role.label("admin")`
- `slot_resources`: read `Role.label("admin")` + `Role.label("operator")`, create/update/delete `Role.label("admin")`
- `resources`: read `Role.label("admin")` + `Role.label("operator")`, create/update/delete `Role.label("admin")`
- `locations`: read `Role.label("admin")` + `Role.label("operator")`, create/update/delete `Role.label("admin")`
- `rooms`: read `Role.label("admin")` + `Role.label("operator")`, create/update/delete `Role.label("admin")`

## Flujo principal

1. Verificar que las colecciones `experiences` (TASK-003) y `experience_editions` (TASK-004) existen en `omzone_db`.
2. Crear la colección `locations` con los 5 atributos y permisos (sin índices definidos en modelo).
3. Crear la colección `rooms` con los 6 atributos, 1 índice (`idx_locationId`) y permisos.
4. Crear la colección `resources` con los 7 atributos, 2 índices (`idx_type`, `idx_type_isActive`) y permisos.
5. Crear la colección `slots` con los 13 atributos y 5 índices.
6. Crear la colección `slot_resources` con los 4 atributos y 2 índices (`idx_slotId`, `idx_resourceId`).
7. Asignar permisos diferenciados: slots con lectura pública y escritura admin+operator; rest solo admin/operator.
8. Registrar las 5 colecciones en `appwrite.json`.
9. Ejecutar `appwrite deploy` y verificar en consola.

## Criterios de aceptación

- [x] La colección `slots` existe con 12 atributos definidos en `01_data-model.md` sección 4.1.
- [x] `slots.slotType` es enum con 4 valores: `single_session`, `multi_day`, `retreat_day`, `private` (según tabla de atributos y data model).
- [x] `slots.status` es enum con 4 valores: `draft`, `published`, `full`, `cancelled` (según tabla de atributos y data model).
- [x] Los 5 índices de `slots` están creados, incluyendo el compuesto `idx_experienceId_status_start` (3 columnas).
- [x] `slots` tiene read público (`Role.any()`) y create/update para `admin` + `operator`, delete solo `admin`.
- [x] La colección `slot_resources` existe con 4 atributos, `role` como enum con 4 valores.
- [x] `slot_resources` tiene permisos solo para `admin` y `operator` (no público).
- [x] La colección `resources` existe con 7 atributos, `type` como enum con 4 valores, y 2 índices.
- [x] `resources` tiene permisos solo para `admin` y `operator`.
- [x] La colección `locations` existe con 5 atributos y permisos solo para `admin/operator`.
- [x] La colección `rooms` existe con 6 atributos, `type` como enum con 5 valores, e `idx_locationId`.
- [x] `rooms` tiene permisos solo para `admin/operator`.
- [x] Un usuario anónimo puede listar `slots` pero NO puede listar `resources`, `slot_resources`, `locations` ni `rooms`.
- [x] Un usuario con label `operator` puede leer y crear/actualizar `slots`, pero NO puede eliminarlos.
- [x] Un usuario con label `operator` puede leer `resources`, `locations`, `rooms`, `slot_resources` pero NO crear/editar/borrar.
- [x] Las 5 colecciones están registradas en `appwrite.json` y el deploy es reproducible.

## Validaciones de seguridad

- [x] `slot_resources`, `resources`, `locations`, `rooms` NO tienen lectura pública — solo `admin` y `operator`.
- [x] Solo `admin` puede eliminar slots — `operator` puede leer y crear/actualizar pero NO borrar.
- [x] Solo `admin` puede crear/editar/borrar `slot_resources`, `resources`, `locations`, `rooms`.
- [x] Los datos de contacto en `resources.contactInfo` solo son visibles para admin/operator, no públicos.
- [x] Las coordenadas en `locations.coordinates` no están expuestas al público.

## Dependencias

- **TASK-003:** Schema dominio editorial — provee `experiences` (FK target de `slots.experienceId`).
- **TASK-004:** Schema dominio comercial — provee `experience_editions` (FK target de `slots.editionId`).

## Bloquea a

- **TASK-006:** Schema dominio transaccional — `bookings` referencia `slots`; `order_items` puede referenciar `slots`.
- **TASK-014:** CRUD slots y agenda desde admin.
- **TASK-015:** CRUD resources y locations desde admin.
- **TASK-018:** Detalle público de experiencia — sección de agenda con slots disponibles.

## Riesgos y notas

- **ADR-004 (Experience-first, not room-first):** Las locaciones y cuartos son operación interna. No se exponen al público. Solo admin y operator los ven y gestionan. La experiencia se vende primero; la locación se asigna después.
- **Permisos diferenciados de `slots`:** Esta es la primera colección con permisos distintos para `operator` (puede crear/actualizar slots pero no borrar). Verificar que Appwrite 1.9.0 soporta `Role.label("operator")` correctamente en los permisos de colección.
- **`bookedCount` en `slots`:** Es un contador que se incrementa via Functions (cuando se confirma un booking). El schema lo permite como integer writable, pero la lógica de incremento atómico se implementa en Functions posteriores.
- **`locations` sin índices:** El modelo de datos no define índices para `locations`. Si en producción hay muchas locaciones, considerar agregar `idx_isActive`. Por ahora se sigue el modelo tal cual.
- **Zona horaria en `slots`:** El campo `timezone` almacena la zona horaria original como string (ej: `America/Mexico_City`). La conversión a UTC se hace en la lógica de aplicación, no en el schema.
- **Índice de 3 columnas:** `idx_experienceId_status_start` en `slots` es un índice compuesto de 3 atributos. Verificar que Appwrite 1.9.0 soporta índices con 3+ columnas.
