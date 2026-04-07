# TASK-023: Function generate-ticket — emisión post-pago con snapshot

## Objetivo

Crear la Appwrite Function `generate-ticket` que, tras confirmar el pago de una orden, genera documentos `tickets` y opcionalmente `bookings` por cada order item elegible. Al completar esta tarea, cada orden pagada produce tickets digitales con snapshot inmutable, código QR único y reserva asociada al slot correspondiente.

## Contexto

- **Fase:** 7 — Tickets y reservas
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 7
- **Documento maestro:** Secciones 14.1, RF-08 (Emisión de tickets), RF-11 (Tickets digitales)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `tickets` (6.4), `bookings` (5.1), `orders` (6.1), `order_items` (6.2), `slots` (4.1)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Transaccional (write), Operativo (write bookings)
- **ADR relacionados:** ADR-001 (Modelo híbrido relacional + snapshot) — cada ticket contiene `ticketSnapshot` inmutable; ADR-005 (Lógica sensible en Functions) — la emisión de tickets se ejecuta server-side exclusivamente
- **RF relacionados:** RF-08, RF-11

Esta Function es la pieza de emisión post-pago. Se invoca después de que `stripe-webhook` confirma el pago de una orden. Los tickets contienen snapshots inmutables que permiten reconstruir la compra sin depender de datos vivos.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear Appwrite Function `generate-ticket` con trigger HTTP (POST, invocada internamente por `stripe-webhook` o manualmente por admin).
2. Input: `orderId` (requerido).
3. Validar que la orden existe, su `status === "paid"` y que aún no tiene tickets generados (idempotencia).
4. Leer todos los `order_items` de la orden.
5. Por cada order item con `itemType === "experience"`:
   - Generar `ticketCode` único: formato `OMZ-TKTXXXXXX` donde X es UUID parcial (12 chars hex).
   - Si `quantity > 1`: generar un ticket por unidad (N tickets = quantity).
   - Construir `ticketSnapshot` JSON con:
     - Nombre de la experiencia (del `itemSnapshot`)
     - Fecha y hora del slot (si aplica)
     - Nombre del tier
     - Precio unitario
     - Nombre del participante (de `customerName` de la orden)
     - Email del participante (de `customerEmail`)
     - `orderNumber`
     - Addons incluidos
   - Crear documento `tickets` con: `orderId`, `orderItemId`, `userId`, `experienceId`, `slotId`, `ticketCode`, `participantName`, `participantEmail`, `status = "active"`, `ticketSnapshot`.
6. Si el order item tiene `slotId`:
   - Crear documento `bookings` con: `orderId`, `orderItemId`, `slotId`, `userId`, `participantCount = quantity`, `status = "confirmed"`.
   - Incrementar `bookedCount` en el slot correspondiente.
7. Retornar lista de tickets generados con `ticketCode` y datos básicos.
8. Idempotencia: si la orden ya tiene tickets, retornar los existentes sin crear duplicados.
9. Logging: registrar `orderId`, cantidad de tickets generados, bookings creados.

## Fuera de alcance

- Generación de PDF del ticket — futura task.
- Envío de email con ticket — futura task.
- Fulfillment de pases (`user_passes`) — TASK-029.
- Fulfillment de paquetes (`package_items`) — TASK-029.
- Camera-based QR scanning — TASK-025.
- Validación/redención de ticket — TASK-024.
- Actualización de `bookedCount` ante cancelación o reembolso.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Operativo (bookings, validación, asignación)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `orders` | leer | Verificar status `paid`, leer snapshot y datos de cliente |
| `order_items` | leer | Obtener line items para generar tickets |
| `tickets` | crear / leer | Crear tickets; leer para verificar idempotencia |
| `bookings` | crear | Crear reserva confirmada si hay slotId |
| `slots` | leer / actualizar | Leer datos del slot; incrementar `bookedCount` |
| `experiences` | leer | Leer nombre y datos para snapshot (o extraer del itemSnapshot) |

## Atributos nuevos o modificados

N/A — se usan atributos existentes definidos en el data model.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `generate-ticket` | crear | Function HTTP POST para generar tickets post-pago |

## Buckets / Storage implicados

N/A.

## Componentes frontend implicados

N/A — esta tarea es backend-only. El frontend que muestra tickets es TASK-025.

## Hooks implicados

N/A.

## Rutas implicadas

N/A — la Function expone un endpoint HTTP gestionado por Appwrite. Se invoca internamente.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Invocar `generate-ticket` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver tickets propios | ✅ | ✅ | ✅ | ✅ (solo propios) | ❌ |

Nota: La Function se invoca server-side (por `stripe-webhook` o admin). No es accesible por clientes directamente.

## Flujo principal

1. `stripe-webhook` (o admin manualmente) invoca `generate-ticket` con `orderId`.
2. La Function valida que el caller tiene label `admin` o `root` (o es invocación interna server-side).
3. La Function busca la orden por `orderId` y verifica `status === "paid"`.
4. La Function busca tickets existentes para esa orden (idempotencia).
5. Si ya existen tickets → retorna los existentes con 200.
6. La Function lee todos los `order_items` de la orden.
7. Por cada order item con `itemType === "experience"`:
   a. Genera N `ticketCode` únicos (N = quantity).
   b. Construye `ticketSnapshot` JSON inmutable.
   c. Crea N documentos `tickets`.
   d. Si el item tiene `slotId`: crea un documento `bookings` y actualiza `bookedCount` del slot.
8. Logea resumen: orderId, tickets generados, bookings creados.
9. Retorna array de tickets creados con 200.

## Criterios de aceptación

- [ ] La Function `generate-ticket` existe como Appwrite Function con trigger HTTP.
- [ ] La Function valida que el caller tiene permisos de admin/root o es invocación server-side.
- [ ] La Function valida que la orden existe y tiene `status === "paid"`, retorna 400 si no.
- [ ] Por cada order item de tipo `experience`, se genera un ticket por unidad de quantity.
- [ ] Cada ticket tiene un `ticketCode` único con formato `OMZ-TKT` + 12 caracteres hex.
- [ ] El `ticketSnapshot` contiene: nombre de experiencia, fecha/hora del slot, nombre del tier, precio, nombre del participante, email, orderNumber, addons.
- [ ] El ticket se crea con `status = "active"`.
- [ ] Si el order item tiene `slotId`, se crea un documento `bookings` con `status = "confirmed"` y `participantCount` correcto.
- [ ] El `bookedCount` del slot se incrementa al crear el booking.
- [ ] La Function es idempotente: invocarla dos veces para la misma orden no crea tickets duplicados.
- [ ] Si la orden no existe, retorna 404 con mensaje descriptivo.
- [ ] Si la orden tiene `status !== "paid"`, retorna 400 con mensaje "Order not yet paid".
- [ ] La Function retorna la lista de tickets generados con `ticketCode`, `experienceId`, `slotId`, `status`.
- [ ] Los logs de la Function registran `orderId`, cantidad de tickets y bookings generados.

## Validaciones de seguridad

- [ ] La Function verifica label del caller (`admin` o `root`) o que es invocación interna con API key.
- [ ] La Function usa Appwrite Server SDK con API key para crear documentos (no session de usuario).
- [ ] `ticketCode` se genera con UUID/crypto random — no es predecible ni secuencial.
- [ ] Los snapshots se construyen desde datos en DB, no desde input del caller.
- [ ] La Function no expone datos internos de la orden en mensajes de error al caller.
- [ ] La idempotencia previene generación masiva de tickets por invocación repetida.
- [ ] No se permite generar tickets para órdenes con `status !== "paid"`.

## Dependencias

- **TASK-006:** Schema transaccional — provee colecciones `orders`, `order_items`, `tickets`, `bookings`.
- **TASK-005:** Schema agenda — provee `slots` con `bookedCount`.
- **TASK-021:** Function `stripe-webhook` — actualiza la orden a `paid` y puede invocar esta Function.
- **TASK-022:** Reconciliación de orden — actualiza estado post-webhook.

## Bloquea a

- **TASK-024:** Function `validate-ticket` — requiere tickets existentes para validar.
- **TASK-025:** Página de confirmación y ticket digital — muestra los tickets generados.
- **TASK-032:** Mis tickets en portal de cliente — lista tickets del usuario.

## Riesgos y notas

- **Invocación desde webhook vs manual:** Definir si `stripe-webhook` invoca esta Function directamente (HTTP call interno) o si se usa un evento de Appwrite como trigger alternativo. La opción HTTP interna es más simple y controlable.
- **Race condition en bookedCount:** Si se generan tickets y bookings concurrentemente para el mismo slot, `bookedCount` puede quedar inconsistente. Mitigación: verificar capacidad antes de incrementar; si se excede, loggear como overbooking y notificar admin.
- **Tickets por addon:** En v1, solo los items de tipo `experience` generan tickets. Addons se reflejan en el snapshot pero no generan tickets independientes. Documentar esta decisión.
- **Snapshot vs datos vivos:** El `ticketSnapshot` debe ser autosuficiente para mostrar el ticket sin consultar otras colecciones. Incluir `snapshotVersion: 1` para versionado futuro.
- **Cantidad masiva:** Una orden con quantity = 20 genera 20 tickets. La Function debe manejar esto en un batch razonable sin timeout.
