# TASK-006: Schema dominio transaccional — orders, order_items, payments, tickets, passes consumibles, refunds

## Objetivo

Crear en Appwrite todas las colecciones del dominio transaccional de OMZONE: órdenes, line items, pagos, tickets, redenciones, pases de usuario, consumo de pases, reembolsos y solicitudes de booking. Al completar esta tarea, las 9 colecciones existen en `omzone_db` con todos sus atributos, índices y permisos, y están registradas en `appwrite.json` para despliegue reproducible. Los atributos de snapshot usan tipo `string` con tamaño grande para almacenar JSON inmutable.

## Contexto

- **Fase:** 1 — Schema core (Appwrite)
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 1
- **Documento maestro:** Secciones de Checkout (RF-06), Órdenes (RF-07), Pagos (RF-08), Tickets (RF-09), Redenciones (RF-10), Pases (RF-13), Reembolsos (RF-16)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Secciones 6.1 a 6.9
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Dominio Transaccional (2.5)
- **RF relacionados:** RF-06, RF-07, RF-08, RF-09, RF-10, RF-13, RF-16
- **ADR relacionados:** ADR-001 (Modelo híbrido relacional + snapshot) — toda orden y ticket contiene snapshot JSON suficiente para no depender de relaciones vivas.

El dominio transaccional es cross-cutting: referencia entidades de otros dominios pero contiene su propia versión (snapshot) de los datos al momento de compra. Las órdenes no se borran. Los snapshots garantizan integridad histórica.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear la colección `orders` con los 18 atributos, 6 índices y permisos.
2. Crear la colección `order_items` con los 10 atributos, 2 índices y permisos.
3. Crear la colección `payments` con los 8 atributos, 3 índices y permisos.
4. Crear la colección `tickets` con los 12 atributos, 6 índices y permisos.
5. Crear la colección `ticket_redemptions` con los 5 atributos, 1 índice y permisos.
6. Crear la colección `user_passes` con los 9 atributos, 4 índices y permisos.
7. Crear la colección `pass_consumptions` con los 6 atributos, 2 índices y permisos.
8. Crear la colección `refunds` con los 9 atributos, 3 índices y permisos.
9. Crear la colección `booking_requests` con los 13 atributos, 3 índices y permisos.
10. Verificar que snapshot attributes (`snapshot`, `itemSnapshot`, `ticketSnapshot`, `passSnapshot`, `refundSnapshot`) son string con tamaño grande (5000–50000).
11. Registrar las 9 colecciones en `appwrite.json`.
12. Desplegar via CLI y verificar en consola.

## Fuera de alcance

- Colecciones de dominios editorial (TASK-003), comercial (TASK-004), agenda (TASK-005).
- Function `create-checkout` (TASK-019).
- Function `stripe-webhook` (TASK-021).
- Function `generate-ticket` (TASK-023).
- Function `validate-ticket` (TASK-024).
- Function `consume-pass` (TASK-027).
- UI de checkout, confirmación o portal de cliente.
- Lógica de generación de orderNumber.
- Integración con Stripe (solo se crean los campos para IDs de Stripe).
- Seed data.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `orders` | crear | Orden de compra con snapshot completo |
| `order_items` | crear | Line items de la orden con snapshot |
| `payments` | crear | Registro de pago Stripe |
| `tickets` | crear | Tickets emitidos tras pago confirmado |
| `ticket_redemptions` | crear | Registro de escaneos/redenciones |
| `user_passes` | crear | Instancias compradas de pase por usuario |
| `pass_consumptions` | crear | Historial de consumo de pases |
| `refunds` | crear | Registro de reembolsos |
| `booking_requests` | crear | Solicitudes previas a pago |
| `experiences` | leer | FK target — TASK-003 |
| `experience_editions` | leer | FK target — TASK-004 |
| `slots` | leer | FK target — TASK-005 |
| `passes` | leer | FK target — TASK-004 |

## Atributos nuevos o modificados

### `orders`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `orders` | `userId` | string(255) | sí | Appwrite Auth userId |
| `orders` | `orderNumber` | string(50) | sí | Número legible (ej: OMZ-20260405-001) |
| `orders` | `orderType` | enum [`direct`, `assisted`, `request-conversion`] | sí | Tipo de orden |
| `orders` | `status` | enum [`pending`, `paid`, `confirmed`, `cancelled`, `refunded`] | sí | Estado de la orden |
| `orders` | `paymentStatus` | enum [`pending`, `processing`, `succeeded`, `failed`, `refunded`] | sí | Estado del pago |
| `orders` | `currency` | string(3) | sí | Moneda |
| `orders` | `subtotal` | float | sí | Subtotal antes de impuestos |
| `orders` | `taxAmount` | float | no | Impuestos |
| `orders` | `totalAmount` | float | sí | Total final |
| `orders` | `stripeSessionId` | string(255) | no | Stripe Checkout Session ID |
| `orders` | `stripePaymentIntentId` | string(255) | no | Stripe PaymentIntent ID |
| `orders` | `snapshot` | string(50000) | sí | JSON snapshot completo de la compra |
| `orders` | `customerName` | string(255) | no | Nombre del cliente al comprar |
| `orders` | `customerEmail` | string(255) | no | Email del cliente al comprar |
| `orders` | `notes` | string(2000) | no | Notas internas |
| `orders` | `paidAt` | datetime | no | Fecha de pago confirmado |
| `orders` | `cancelledAt` | datetime | no | Fecha de cancelación |

### `order_items`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `order_items` | `orderId` | string(255) | sí | FK a `orders` |
| `order_items` | `itemType` | enum [`experience`, `addon`, `package`, `pass`] | sí | Tipo de item |
| `order_items` | `referenceId` | string(255) | sí | FK a la entidad original |
| `order_items` | `slotId` | string(255) | no | FK a `slots` (si aplica) |
| `order_items` | `name` | string(255) | sí | Nombre al momento de compra |
| `order_items` | `quantity` | integer | sí | Cantidad |
| `order_items` | `unitPrice` | float | sí | Precio unitario al momento de compra |
| `order_items` | `totalPrice` | float | sí | Precio total (qty × unitPrice) |
| `order_items` | `currency` | string(3) | sí | Moneda |
| `order_items` | `itemSnapshot` | string(10000) | sí | JSON snapshot del item |

### `payments`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `payments` | `orderId` | string(255) | sí | FK a `orders` |
| `payments` | `stripePaymentIntentId` | string(255) | sí | Stripe PI ID |
| `payments` | `amount` | float | sí | Monto cobrado |
| `payments` | `currency` | string(3) | sí | Moneda |
| `payments` | `status` | enum [`pending`, `succeeded`, `failed`, `refunded`] | sí | Estado del pago |
| `payments` | `method` | string(100) | no | Método (card, oxxo, etc.) |
| `payments` | `receiptUrl` | string(500) | no | URL de recibo Stripe |
| `payments` | `metadata` | string(5000) | no | JSON con datos Stripe |

### `tickets`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `tickets` | `orderId` | string(255) | sí | FK a `orders` |
| `tickets` | `orderItemId` | string(255) | no | FK a `order_items` |
| `tickets` | `userId` | string(255) | sí | Dueño del ticket |
| `tickets` | `experienceId` | string(255) | sí | FK a `experiences` |
| `tickets` | `slotId` | string(255) | no | FK a `slots` |
| `tickets` | `ticketCode` | string(50) | sí | Código único (para QR) |
| `tickets` | `participantName` | string(255) | no | Nombre del participante |
| `tickets` | `participantEmail` | string(255) | no | Email del participante |
| `tickets` | `status` | enum [`active`, `used`, `cancelled`, `expired`] | sí | Estado del ticket |
| `tickets` | `usedAt` | datetime | no | Fecha de uso/check-in |
| `tickets` | `ticketSnapshot` | string(10000) | sí | JSON snapshot completo |

### `ticket_redemptions`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `ticket_redemptions` | `ticketId` | string(255) | sí | FK a `tickets` |
| `ticket_redemptions` | `redeemedBy` | string(255) | sí | userId del operador que escaneó |
| `ticket_redemptions` | `redeemedAt` | datetime | sí | Fecha/hora |
| `ticket_redemptions` | `location` | string(255) | no | Lugar de escaneo |
| `ticket_redemptions` | `notes` | string(500) | no | Notas |

### `user_passes`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `user_passes` | `userId` | string(255) | sí | Appwrite Auth userId |
| `user_passes` | `passId` | string(255) | sí | FK a `passes` (tipo de pase) |
| `user_passes` | `orderId` | string(255) | sí | FK a `orders` |
| `user_passes` | `totalCredits` | integer | sí | Créditos totales al momento de compra |
| `user_passes` | `remainingCredits` | integer | sí | Créditos restantes |
| `user_passes` | `status` | enum [`active`, `depleted`, `expired`, `cancelled`] | sí | Estado |
| `user_passes` | `activatedAt` | datetime | sí | Fecha de activación |
| `user_passes` | `expiresAt` | datetime | no | Fecha de expiración |
| `user_passes` | `passSnapshot` | string(5000) | sí | JSON snapshot del pase comprado |

### `pass_consumptions`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `pass_consumptions` | `userPassId` | string(255) | sí | FK a `user_passes` |
| `pass_consumptions` | `slotId` | string(255) | no | FK a `slots` (sesión consumida) |
| `pass_consumptions` | `ticketId` | string(255) | no | FK a `tickets` generado |
| `pass_consumptions` | `creditsUsed` | integer | sí | Créditos consumidos |
| `pass_consumptions` | `consumedAt` | datetime | sí | Fecha de consumo |
| `pass_consumptions` | `notes` | string(500) | no | Notas |

### `refunds`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `refunds` | `orderId` | string(255) | sí | FK a `orders` |
| `refunds` | `paymentId` | string(255) | sí | FK a `payments` |
| `refunds` | `stripeRefundId` | string(255) | no | Stripe Refund ID |
| `refunds` | `amount` | float | sí | Monto reembolsado |
| `refunds` | `currency` | string(3) | sí | Moneda |
| `refunds` | `reason` | string(1000) | no | Razón del reembolso |
| `refunds` | `status` | enum [`pending`, `succeeded`, `failed`] | sí | Estado |
| `refunds` | `refundedBy` | string(255) | sí | userId del admin que procesó |
| `refunds` | `refundSnapshot` | string(10000) | sí | JSON snapshot al momento de reembolso |

### `booking_requests`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `booking_requests` | `userId` | string(255) | no | Auth userId (si autenticado) |
| `booking_requests` | `experienceId` | string(255) | sí | FK a `experiences` |
| `booking_requests` | `requestType` | enum [`quote`, `private-session`, `group`, `custom`] | sí | Tipo de solicitud |
| `booking_requests` | `preferredDate` | datetime | no | Fecha preferida |
| `booking_requests` | `participantCount` | integer | no | Asistentes estimados |
| `booking_requests` | `contactName` | string(255) | sí | Nombre |
| `booking_requests` | `contactEmail` | string(255) | sí | Email |
| `booking_requests` | `contactPhone` | string(50) | no | Teléfono |
| `booking_requests` | `message` | string(5000) | no | Mensaje del solicitante |
| `booking_requests` | `status` | enum [`new`, `reviewing`, `quoted`, `converted`, `declined`, `expired`] | sí | Estado |
| `booking_requests` | `adminNotes` | string(5000) | no | Notas del admin |
| `booking_requests` | `quotedAmount` | float | no | Monto cotizado |
| `booking_requests` | `convertedOrderId` | string(255) | no | FK a `orders` si se convirtió |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Esta tarea es solo schema. Las Functions se crean en TASK-019, 021, 023, 024, 027 |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Ninguno | — | — |

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

### `orders`

| Acción | root | admin | operator | client (own) | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ✅ (solo propias) | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ (no se usa) | ❌ | ❌ | ❌ | ❌ |

### `order_items`

| Acción | root | admin | operator | client (own) | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ✅ (via order) | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `payments`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ❌ | ❌ | ❌ | ❌ | ❌ |

### `tickets`

| Acción | root | admin | operator | client (own) | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ (solo propios) | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete | ❌ | ❌ | ❌ | ❌ | ❌ |

### `ticket_redemptions`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create | ✅ | ✅ | ✅ | ❌ | ❌ |
| Update | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete | ❌ | ❌ | ❌ | ❌ | ❌ |

### `user_passes`

| Acción | root | admin | operator | client (own) | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ✅ (solo propios) | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ❌ | ❌ | ❌ | ❌ | ❌ |

### `pass_consumptions`

| Acción | root | admin | operator | client (own) | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ✅ (via user_pass) | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete | ❌ | ❌ | ❌ | ❌ | ❌ |

### `refunds`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ❌ | ❌ | ❌ | ❌ | ❌ |
| Delete | ❌ | ❌ | ❌ | ❌ | ❌ |

### `booking_requests`

| Acción | root | admin | operator | client (own) | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ✅ (solo propias) | ❌ |
| Create | ✅ | ✅ | ❌ | ✅ | ✅ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ❌ | ❌ | ❌ | ❌ | ❌ |

**Implementación Appwrite:**
- `orders`: read `Role.user("{userId}")` + `Role.label("admin")`, create/update `Role.label("admin")`, delete ninguno
- `order_items`: read `Role.label("admin")`, create `Role.label("admin")`, update/delete `Role.label("admin")`
- `payments`: read/create/update `Role.label("admin")`
- `tickets`: read `Role.user("{userId}")` + `Role.label("admin")` + `Role.label("operator")`, create `Role.label("admin")`, update `Role.label("admin")` + `Role.label("operator")`
- `ticket_redemptions`: read/create `Role.label("admin")` + `Role.label("operator")`
- `user_passes`: read `Role.user("{userId}")` + `Role.label("admin")`, create/update `Role.label("admin")`
- `pass_consumptions`: read `Role.user("{userPassId.userId}")` + `Role.label("admin")`, create `Role.label("admin")`
- `refunds`: read/create `Role.label("admin")`
- `booking_requests`: read `Role.user("{userId}")` + `Role.label("admin")`, create `Role.any()`, update `Role.label("admin")`

**Nota:** Los permisos `Role.user("{userId}")` se aplican a nivel de documento (document-level permissions), no de colección. A nivel de colección, el SDK necesita los roles de "admin" para create, y los document-level permissions para que el usuario lea sus propios documentos.

## Flujo principal

1. Verificar que las colecciones FK target existen: `experiences` (TASK-003), `experience_editions` y `passes` (TASK-004), `slots` (TASK-005).
2. Crear la colección `orders` con los 18 atributos. Especial atención: `snapshot` como string(50000).
3. Crear los 6 índices de `orders`, incluyendo `idx_orderNumber` (unique) e `idx_stripeSessionId`.
4. Crear `order_items` con 10 atributos. `itemSnapshot` como string(10000).
5. Crear `payments` con 8 atributos y 3 índices.
6. Crear `tickets` con 12 atributos y 6 índices. `ticketSnapshot` como string(10000), `idx_ticketCode` (unique).
7. Crear `ticket_redemptions` con 5 atributos y 1 índice.
8. Crear `user_passes` con 9 atributos y 4 índices. `passSnapshot` como string(5000).
9. Crear `pass_consumptions` con 6 atributos y 2 índices.
10. Crear `refunds` con 9 atributos y 3 índices. `refundSnapshot` como string(10000).
11. Crear `booking_requests` con 13 atributos y 3 índices. Especial: create permite `Role.any()`.
12. Asignar permisos de colección según lo definido arriba.
13. Registrar las 9 colecciones en `appwrite.json`.
14. Ejecutar `appwrite deploy` y verificar en consola.

## Criterios de aceptación

- [x] La colección `orders` existe con 17 atributos (per data model), `snapshot` como tipo TEXT (Appwrite text, hasta 65535 bytes — supera los 50000 originalmente especificados), y `idx_orderNumber` unique. ✅
- [x] `orders.status` es enum con 5 valores, `orders.paymentStatus` es enum con 5 valores, `orders.orderType` es enum con 3 valores. ✅
- [x] Los 6 índices de `orders` están creados, incluyendo `idx_stripeSessionId`. ✅
- [x] La colección `order_items` existe con 10 atributos, `itemSnapshot` como tipo TEXT. ✅
- [x] La colección `payments` existe con 8 atributos (per data model: stripeChargeId en vez de receiptUrl), `payments.status` enum con 4 valores, `metadata` como tipo TEXT. ✅
- [x] La colección `tickets` existe con 11 atributos (per data model), `idx_ticketCode` unique, `ticketSnapshot` como tipo TEXT. ✅
- [x] Los 6 índices de `tickets` están creados, incluyendo compuesto `idx_userId_status`. ✅
- [x] La colección `ticket_redemptions` existe con 5 atributos (per data model: `method` enum en vez de `location` string) y `idx_ticketId`. ✅
- [x] La colección `user_passes` existe con 9 atributos (per data model: `usedCredits`+`orderItemId` en vez de `remainingCredits`+`activatedAt`), `passSnapshot` como tipo TEXT, y 4 índices. ✅
- [x] La colección `pass_consumptions` existe con 6 atributos (per data model: `experienceId` en vez de `ticketId`) y 2 índices. ✅
- [x] La colección `refunds` existe con 9 atributos (per data model: `processedAt` en vez de `refundedBy`), `refundSnapshot` como tipo TEXT, y 3 índices. ✅
- [x] La colección `booking_requests` existe con 13 atributos (per data model: field names refined), `status` enum con 5 valores [pending, reviewing, approved, rejected, converted], y permite create `Role.any()`. ✅
- [x] Las órdenes no tienen permiso de delete — las órdenes no se borran. ✅
- [x] Los tickets no tienen permiso de delete — los tickets se cancelan, no se eliminan. ✅
- [x] Un visitante anónimo puede crear un `booking_request` (create "any") pero NO puede leer los de otros (documentSecurity=true, read solo admin). ✅
- [x] Las 9 colecciones están registradas en `appwrite.json` (via `appwrite pull tables`) y el deploy es reproducible. Total: 27 tablas. ✅
- [x] Los snapshots usan tipo TEXT de Appwrite (hasta 65535 bytes por campo), que excede los tamaños originalmente especificados y garantiza espacio suficiente para snapshots JSON complejos. ✅

## Validaciones de seguridad

- [x] `payments` y `refunds` solo tienen permisos de lectura/escritura para `admin` — no accesibles por client ni operator directamente. ✅ (documentSecurity=false)
- [x] Las órdenes son creadas exclusivamente via Function (admin server-side), no por el cliente directamente — `create` solo `Role.label("admin")`. ✅
- [x] Los tickets son creados exclusivamente via Function post-pago — `create` solo `Role.label("admin")`. ✅
- [x] `booking_requests` permite create `Role.any()` pero los campos `adminNotes` y `convertedOrderId` solo se escriben via update `Role.label("admin")`. ✅
- [x] No se exponen IDs de Stripe al público — `stripeSessionId`, `stripePaymentIntentId`, `stripeRefundId` solo son legibles para admin (payments/refunds con documentSecurity=false y permisos solo admin). ✅
- [x] Los snapshots son inmutables por diseño: se escriben una vez al crear el documento y no se modifican. ✅ (ADR-001)
- [x] `ticket_redemptions` no tiene permisos de update ni delete — un escaneo es un evento inmutable. ✅

## Dependencias

- **TASK-003:** Schema dominio editorial — provee `experiences` (FK target de `tickets.experienceId`, `booking_requests.experienceId`).
- **TASK-004:** Schema dominio comercial — provee `passes` (FK target de `user_passes.passId`), `experience_editions` (referenciada en snapshots).
- **TASK-005:** Schema dominio agenda — provee `slots` (FK target de `order_items.slotId`, `tickets.slotId`, `pass_consumptions.slotId`).

## Bloquea a

- **TASK-007:** Schema usuario y config — `bookings` referencia `orders` y `order_items`.
- **TASK-019:** Function create-checkout.
- **TASK-020:** UI de checkout.
- **TASK-021:** Function stripe-webhook.
- **TASK-023:** Function generate-ticket.
- **TASK-024:** Function validate-ticket.
- **TASK-027:** Function consume-pass.
- **TASK-031:** Mis órdenes en portal de cliente.
- **TASK-032:** Mis tickets en portal de cliente.
- **TASK-039:** Venta asistida desde admin.

## Riesgos y notas

- **ADR-001 (Modelo híbrido relacional + snapshot):** Este es el dominio que más depende de snapshots. Verificar que los tamaños de string son suficientes: `orders.snapshot` a 50000 es el más grande. Si Appwrite 1.9.0 tiene un límite menor para strings, se necesitará ajustar o fragmentar el snapshot.
- **Tamaño límite de strings en Appwrite:** Verificar el tamaño máximo de atributo string soportado por Appwrite 1.9.0. Si es menor a 50000, se necesitará una estrategia alternativa para el snapshot de órdenes.
- **Document-level permissions:** Varias colecciones (`orders`, `tickets`, `user_passes`, `booking_requests`) requieren document-level permissions para que el usuario lea solo sus propios documentos. Verificar que la configuración de colección en Appwrite habilita document security.
- **`orderNumber` format:** El modelo define `OMZ-20260405-001` como ejemplo. La generación del número secuencial se implementa en la Function de checkout, no en el schema.
- **No-delete policy:** `orders`, `tickets`, `ticket_redemptions` no deben permitir borrado. Esto es por diseño (ADR-001): los registros transaccionales son inmutables. Se cancelan via cambio de status.
- **`booking_requests` con create `Role.any()`:** Es la única colección transaccional que permite escritura anónima. Esto es intencional para que visitantes sin cuenta puedan solicitar experiencias privadas o cotizaciones. Validar que no se abuse — rate limiting se implementaría en Function si es necesario.
- **9 colecciones:** Este es el task con más colecciones (9). Considerar ejecutar la creación en orden de dependencia: orders → order_items → payments → tickets → ticket_redemptions → user_passes → pass_consumptions → refunds → booking_requests.
