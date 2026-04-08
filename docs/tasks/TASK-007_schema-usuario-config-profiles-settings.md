# TASK-007: Schema dominio usuario y configuración — user_profiles, site_settings, logs, notifications, bookings

## Objetivo

Crear en Appwrite todas las colecciones del dominio de usuario, configuración y las tablas operativas de bookings de OMZONE: perfiles de usuario, logs de actividad administrativa, configuración de sitio, templates de notificación, reservas confirmadas y participantes. Al completar esta tarea, las 6 colecciones existen en `omzone_db` con todos sus atributos, índices y permisos, y están registradas en `appwrite.json` para despliegue reproducible.

## Contexto

- **Fase:** 1 — Schema core (Appwrite)
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 1
- **Documento maestro:** Secciones de Perfiles (RF-12), Operación interna (RF-16)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Secciones 5.1, 5.2 (Operativo: bookings, participants), 7.1, 7.2 (Usuario), 8.1, 8.2 (Configuración)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Dominio Usuario (2.6), Dominio Configuración (2.7), Dominio Operativo (2.4, parcial)
- **RF relacionados:** RF-12 (Customer portal / perfiles), RF-16 (Operación interna y trazabilidad)
- **ADR relacionados:** ADR-002 (Labels como modelo de auth) — los perfiles extienden Appwrite Auth con datos adicionales; los labels viven en Auth, no en user_profiles.

Las tablas de usuario y configuración complementan Appwrite Auth con datos extendidos. El perfil de usuario se crea automáticamente al registrarse (via Function, implementada en TASK-008). Las tablas operativas de bookings registran reservas confirmadas post-pago.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear la colección `user_profiles` con los 7 atributos, sin índices custom y permisos. El `$id` del documento es el Auth userId (no hay atributo `userId` separado).
2. Crear la colección `admin_activity_logs` con los 6 atributos, 3 índices y permisos.
3. Crear la colección `site_settings` con los 4 atributos, 2 índices y permisos.
4. Crear la colección `notification_templates` con los 7 atributos, 2 índices y permisos.
5. Crear la colección `bookings` con los 8 atributos, 4 índices y permisos.
6. Crear la colección `booking_participants` con los 5 atributos, 1 índice y permisos.
7. Configurar permisos de colección según el modelo de datos.
8. Registrar las 6 colecciones en `appwrite.json`.
9. Desplegar via CLI y verificar en consola.

## Fuera de alcance

- Function `assign-user-label` (TASK-008) — la creación automática de perfil al signup.
- Flujo de invitación de operadores.
- Componentes frontend del portal de cliente.
- CRUD de site_settings desde admin panel.
- Envío real de notificaciones (funcionalidad de Messaging).
- Tablas ya creadas en otros dominios (editorial, comercial, agenda, transaccional).

## Dominio

- [x] Usuario (perfiles, preferencias)
- [x] Configuración (settings, templates)
- [x] Operativo (bookings, validación, asignación) — solo tablas de bookings/participants

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `user_profiles` | crear | Perfil extendido del usuario (nombre, teléfono, idioma) |
| `admin_activity_logs` | crear | Registro de acciones administrativas para trazabilidad |
| `site_settings` | crear | Configuración general de la plataforma (key-value) |
| `notification_templates` | crear | Templates de notificaciones (email, sms, push) |
| `bookings` | crear | Reserva confirmada de un slot por un cliente |
| `booking_participants` | crear | Participantes individuales dentro de una reserva grupal |
| `orders` | leer | FK target para `bookings.orderId` — TASK-006 |
| `order_items` | leer | FK target para `bookings.orderItemId` — TASK-006 |
| `slots` | leer | FK target para `bookings.slotId` — TASK-005 |

## Atributos nuevos o modificados

### `user_profiles`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `user_profiles` | `displayName` | string(255) | no | Nombre a mostrar |
| `user_profiles` | `firstName` | string(255) | no | Nombre |
| `user_profiles` | `lastName` | string(255) | no | Apellido |
| `user_profiles` | `phone` | string(50) | no | Teléfono |
| `user_profiles` | `language` | enum [`es`, `en`] | no | Idioma preferido |
| `user_profiles` | `photoId` | string(255) | no | fileId de foto |
| `user_profiles` | `bio` | string(1000) | no | Bio/descripción |

### `admin_activity_logs`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `admin_activity_logs` | `userId` | string(255) | sí | userId del admin/operator |
| `admin_activity_logs` | `action` | string(100) | sí | Acción realizada |
| `admin_activity_logs` | `entityType` | string(100) | sí | Tipo de entidad afectada |
| `admin_activity_logs` | `entityId` | string(255) | sí | ID de entidad afectada |
| `admin_activity_logs` | `details` | string(5000) | no | JSON con detalles |
| `admin_activity_logs` | `ipAddress` | string(50) | no | IP del actor |

### `site_settings`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `site_settings` | `key` | string(100) | sí | Clave de configuración (única) |
| `site_settings` | `value` | string(10000) | sí | Valor (puede ser JSON) |
| `site_settings` | `category` | enum [`general`, `branding`, `checkout`, `notifications`, `seo`] | sí | Categoría de configuración |
| `site_settings` | `description` | string(500) | no | Descripción de la configuración |

### `notification_templates`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `notification_templates` | `key` | string(100) | sí | Identificador del template (único) |
| `notification_templates` | `type` | enum [`email`, `sms`, `push`] | sí | Tipo de notificación |
| `notification_templates` | `subject` | string(255) | no | Asunto EN |
| `notification_templates` | `subjectEs` | string(255) | no | Asunto ES |
| `notification_templates` | `body` | string(10000) | sí | Body EN (con placeholders) |
| `notification_templates` | `bodyEs` | string(10000) | no | Body ES |
| `notification_templates` | `isActive` | boolean | sí | ¿Activo? |

### `bookings`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `bookings` | `orderId` | string(255) | sí | FK a `orders` |
| `bookings` | `orderItemId` | string(255) | no | FK a `order_items` |
| `bookings` | `slotId` | string(255) | sí | FK a `slots` |
| `bookings` | `userId` | string(255) | sí | Appwrite Auth userId |
| `bookings` | `participantCount` | integer | sí | Cantidad de asistentes |
| `bookings` | `status` | enum [`confirmed`, `checked-in`, `no-show`, `cancelled`] | sí | Estado |
| `bookings` | `checkedInAt` | datetime | no | Fecha/hora de check-in |
| `bookings` | `notes` | string(1000) | no | Notas internas |

### `booking_participants`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `booking_participants` | `bookingId` | string(255) | sí | FK a `bookings` |
| `booking_participants` | `fullName` | string(255) | sí | Nombre completo |
| `booking_participants` | `email` | string(255) | no | Email |
| `booking_participants` | `phone` | string(50) | no | Teléfono |
| `booking_participants` | `notes` | string(500) | no | Notas |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | La Function de creación de perfil al signup se implementa en TASK-008 |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Ninguno | — | El atributo `photoId` en user_profiles es un string; el bucket se crea en otra task |

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

### `user_profiles`

| Acción | root | admin | operator | client (own) | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ✅ (solo propio) | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ✅ (solo propio) | ❌ |
| Delete | ❌ | ❌ | ❌ | ❌ | ❌ |

### `admin_activity_logs`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete | ❌ | ❌ | ❌ | ❌ | ❌ |

### `site_settings`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `notification_templates`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `bookings`

| Acción | root | admin | operator | client (own) | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ (solo propias) | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `booking_participants`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

**Implementación Appwrite:**
- `user_profiles`: read `Role.user("{userId}")` + `Role.label("admin")`, create `Role.label("admin")` (via Function on signup), update `Role.user("{userId}")` + `Role.label("admin")`
- `admin_activity_logs`: read `Role.label("admin")`, create `Role.label("admin")` + `Role.label("operator")`
- `site_settings`: read/create/update/delete `Role.label("admin")`
- `notification_templates`: read/create/update/delete `Role.label("admin")`
- `bookings`: read `Role.user("{userId}")` + `Role.label("admin")` + `Role.label("operator")`, create `Role.label("admin")` (via Function), update `Role.label("admin")` + `Role.label("operator")`, delete `Role.label("admin")`
- `booking_participants`: read `Role.label("admin")` + `Role.label("operator")`, create/update/delete `Role.label("admin")`

**Nota:** `user_profiles` y `bookings` requieren document-level permissions para que el usuario lea/edite solo sus propios documentos.

## Flujo principal

1. Verificar que las colecciones FK target existen: `orders` y `order_items` (TASK-006), `slots` (TASK-005).
2. Crear la colección `user_profiles` con los 8 atributos e `idx_userId` (unique).
3. Crear la colección `admin_activity_logs` con los 6 atributos y 3 índices.
4. Crear la colección `site_settings` con los 4 atributos y 2 índices (`idx_key` unique, `idx_category`).
5. Crear la colección `notification_templates` con los 7 atributos y 2 índices (`idx_key` unique, `idx_type_isActive`).
6. Crear la colección `bookings` con los 8 atributos y 4 índices.
7. Crear la colección `booking_participants` con los 5 atributos y 1 índice (`idx_bookingId`).
8. Asignar permisos de colección según el modelo de datos.
9. Registrar las 6 colecciones en `appwrite.json`.
10. Ejecutar `appwrite deploy` y verificar en consola.

## Criterios de aceptación

- [x] La colección `user_profiles` existe con 8 atributos, `language` como enum con valores `es`, `en`, e `idx_userId` unique.
- [x] `user_profiles` permite que un usuario lea y edite solo su propio perfil (document-level permissions con `Role.user("{userId}")`).
- [x] La colección `admin_activity_logs` existe con 6 atributos y 3 índices (`idx_userId`, `idx_entityType_entityId`, `idx_action`).
- [x] `admin_activity_logs` no tiene permisos de update ni delete — los logs son inmutables.
- [x] Un operator puede crear logs pero NO puede leerlos (solo admin puede leer).
- [x] La colección `site_settings` existe con 4 atributos, `category` como enum con 5 valores, `idx_key` unique.
- [x] `site_settings.value` es string(10000) para soportar JSON complejo.
- [x] La colección `notification_templates` existe con 7 atributos, `type` enum con 3 valores, `idx_key` unique.
- [x] `notification_templates.body` y `notification_templates.bodyEs` son string(10000).
- [x] La colección `bookings` existe con 8 atributos, `status` enum con 4 valores, y 4 índices.
- [x] `bookings` permite read a `admin`, `operator` y al propio usuario; update a `admin` y `operator`.
- [x] La colección `booking_participants` existe con 5 atributos y `idx_bookingId`.
- [x] `site_settings` y `notification_templates` solo son accesibles por `admin` — no por operator, client ni anónimo.
- [x] Las 6 colecciones están registradas en `appwrite.json` y el deploy es reproducible.

## Validaciones de seguridad

- [x] `user_profiles` usa document-level permissions — un usuario solo puede leer/editar su propio perfil, no el de otros.
- [x] `admin_activity_logs` es append-only (create sí, update/delete no) — garantiza integridad de auditoría.
- [x] `site_settings` solo es accesible para `admin` — configuración sensible (checkout, branding) no se expone.
- [x] `notification_templates` solo es accesible para `admin` — los templates pueden contener lógica de placeholders sensible.
- [x] Los datos de contacto en `booking_participants` (email, phone) solo son visibles para admin/operator.
- [x] `bookings` es creado solo via Function (admin server-side), no directamente por el cliente.
- [x] El campo `ipAddress` en `admin_activity_logs` se registra para trazabilidad — debe obtenerse server-side, nunca del cliente.

## Dependencias

- **TASK-001:** Scaffold proyecto — provee Appwrite SDK/CLI configurado.
- **TASK-005:** Schema dominio agenda — provee `slots` (FK target de `bookings.slotId`). *Nota: `bookings` solo se necesita si los slots existen, pero puede crearse en paralelo si los FKs son strings sin validación en Appwrite.*
- **TASK-006:** Schema dominio transaccional — provee `orders` y `order_items` (FK targets de `bookings`). *Misma nota: FKs son strings sin validación.*

## Bloquea a

- **TASK-008:** Function assign-user-label + user profile creation on signup — necesita `user_profiles` para crear perfil.
- **TASK-009:** Route guards por label — puede necesitar leer `user_profiles`.
- **TASK-034:** Perfil del cliente en portal — CRUD sobre `user_profiles`.
- **TASK-041:** Dashboard admin — lee `admin_activity_logs` y `site_settings`.

## Riesgos y notas

- **ADR-002 (Labels como modelo de auth):** Los labels (`admin`, `operator`, `client`, `root`) viven en Appwrite Auth, no en `user_profiles`. El perfil complementa con datos no funcionales (nombre, teléfono, bio). No duplicar el rol en el perfil.
- **Document-level permissions en `user_profiles`:** Requiere activar document security en la colección. Cada documento de perfil tendrá `Role.user("{userId}")` para read/update y `Role.label("admin")` como fallback.
- **`admin_activity_logs` — inmutabilidad:** Los logs no deben tener permisos de update ni delete. Esto es crítico para auditoría. Un operator puede crear logs (registrar sus propias acciones) pero solo admin puede leerlos.
- **`site_settings` — key-value:** La tabla usa un patrón key-value flexible. La clave es unique. Los valores complejos se serializan como JSON en `value` string(10000). No hay validación de schema sobre el valor — eso es responsabilidad de la aplicación.
- **`bookings` y dependencias FK:** En Appwrite, los FKs son strings sin validación referencial nativa. Técnicamente, `bookings` puede crearse sin que `orders` o `slots` existan aún, pero semánticamente depende de ellos. Se lista la dependencia para orden correcto de ejecución.
- **Orden de creación sugerido:** `user_profiles` → `admin_activity_logs` → `site_settings` → `notification_templates` → `bookings` → `booking_participants`. Las primeras 4 no tienen dependencias entre sí y podrían crearse en cualquier orden.

---

## Notas de implementación (post-deploy)

> Actualizado: 2026-04-07

- **`user_profiles` — `userId` eliminado como atributo:** El `$id` del documento ahora es el Auth userId directamente. Se eliminó el atributo `userId` y el índice `idx_userId`. Esto simplifica lookups a `getDocument(db, collection, userId)` sin necesidad de `Query.equal('userId', ...)`. El modelo de datos (`01_data-model.md`) y `appwrite.json` ya reflejan este cambio.
- **Atributos finales de `user_profiles`:** 7 atributos (`displayName`, `firstName`, `lastName`, `phone`, `language`, `photoId`, `bio`), 0 índices custom.
- **ADR-002 confirmado — sin campo `role` en `user_profiles`:** La Function `assign-user-label` tenía un bug crítico: escribía `role: "client"` en `createDocument`, campo que no existe en el schema. Appwrite rechazaba el documento con 400 "Unknown attribute", el catch lo silenciaba y el perfil nunca se creaba. Corregido eliminando todas las escrituras de `role` de la Function (event trigger, ensure-profile y manual assignment). La fuente de verdad de roles son los **Auth labels**, conforme a ADR-002.
