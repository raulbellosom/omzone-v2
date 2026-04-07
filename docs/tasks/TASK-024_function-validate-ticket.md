# TASK-024: Function validate-ticket — escaneo QR y check-in

## Objetivo

Crear la Appwrite Function `validate-ticket` que recibe un `ticketCode` (escaneado desde QR o ingresado manualmente), valida su existencia y estado, marca el ticket como usado, registra la redención y actualiza el booking asociado si existe. Al completar esta tarea, un operator o admin puede escanear un código QR y registrar el check-in de un asistente de forma segura y trazable.

## Contexto

- **Fase:** 7 — Tickets y reservas
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 7
- **Documento maestro:** RF-09 (Validación de tickets / QR)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `tickets` (6.4), `ticket_redemptions` (6.5), `bookings` (5.1)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Operativo (write bookings, write redemptions), Transaccional (update tickets)
- **ADR relacionados:** ADR-005 (Lógica sensible en Functions) — la validación de tickets se ejecuta server-side, no confiar en estado del frontend
- **RF relacionados:** RF-09

Esta Function cierra el ciclo de vida del ticket: emisión → validación → uso. La trazabilidad de redención es esencial para operación interna y resolución de disputas.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear Appwrite Function `validate-ticket` con trigger HTTP (POST).
2. Input: `ticketCode` (string, requerido), `location` (string, opcional — lugar de escaneo).
3. Validar que el caller tiene label `admin` o `operator`.
4. Buscar ticket por `ticketCode` (índice único).
5. Validaciones:
   - Ticket existe → si no, retorna 404 "Ticket not found".
   - Ticket `status === "active"` → si `used`, retorna 409 "Ticket already used" con `usedAt`.
   - Ticket `status === "cancelled"` → retorna 410 "Ticket cancelled".
   - Ticket `status === "expired"` → retorna 410 "Ticket expired".
6. Si válido:
   - Actualizar `tickets.status` a `used`.
   - Registrar `tickets.usedAt` con timestamp actual.
   - Crear documento `ticket_redemptions` con: `ticketId`, `redeemedBy` (userId del operator), `redeemedAt`, `location`, `notes`.
7. Si el ticket tiene booking asociado (buscar `bookings` por `orderId` + `slotId`):
   - Actualizar `bookings.status` a `checked-in`.
   - Registrar `bookings.checkedInAt` con timestamp actual.
8. Retornar datos del ticket para display al operator:
   - `ticketCode`, `participantName`, `participantEmail`, experience name (del snapshot), fecha/hora, status actualizado, addons.
9. Logging: registrar `ticketCode`, `redeemedBy`, `location`, resultado.

## Fuera de alcance

- QR scanner UI con cámara — TASK-025 implementa input de texto; cámara es futura.
- Batch check-in (múltiples tickets a la vez).
- Analytics de check-in / reportes de asistencia.
- Reverse check-in (revertir un ticket de `used` a `active`).
- Validación offline (sin conexión a servidor).
- Ticket transfer entre usuarios.

## Dominio

- [x] Operativo (bookings, validación, asignación)
- [x] Transaccional (órdenes, pagos, tickets, reembolsos)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `tickets` | leer / actualizar | Buscar por ticketCode, actualizar status a `used` |
| `ticket_redemptions` | crear | Registrar redención con operador, fecha, lugar |
| `bookings` | leer / actualizar | Si tiene booking, actualizar a `checked-in` |

## Atributos nuevos o modificados

N/A — se usan atributos existentes definidos en el data model.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `validate-ticket` | crear | Function HTTP POST para validar y redimir tickets |

## Buckets / Storage implicados

N/A.

## Componentes frontend implicados

N/A — esta tarea es backend-only. La UI de check-in se implementa en TASK-025.

## Hooks implicados

N/A.

## Rutas implicadas

N/A — la Function expone un endpoint HTTP gestionado por Appwrite.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Invocar `validate-ticket` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver resultado de validación | ✅ | ✅ | ✅ | ❌ | ❌ |

## Flujo principal

1. Operator escanea QR o ingresa `ticketCode` en admin panel.
2. Frontend envía POST a `validate-ticket` con `ticketCode` y opcionalmente `location`.
3. La Function verifica JWT y label del caller (`admin` o `operator`).
4. La Function busca ticket por `ticketCode`.
5. Si no existe → retorna 404.
6. Si `status !== "active"` → retorna error con status apropiado y detalle.
7. Si `status === "active"`:
   a. Actualiza ticket `status = "used"`, `usedAt = now()`.
   b. Crea `ticket_redemptions` doc.
   c. Si hay booking asociado: actualiza `status = "checked-in"`, `checkedInAt = now()`.
8. Retorna datos del ticket (snapshot info) para mostrar al operator.
9. Operator ve confirmación visual con datos del asistente.

## Criterios de aceptación

- [ ] La Function `validate-ticket` existe como Appwrite Function con trigger HTTP.
- [ ] La Function valida que el caller tiene label `admin` o `operator`; retorna 403 si no.
- [ ] La Function busca el ticket por `ticketCode` usando el índice único.
- [ ] Si el ticket no existe, retorna 404 con mensaje "Ticket not found".
- [ ] Si el ticket ya fue usado (`status === "used"`), retorna 409 con `usedAt` incluido en la respuesta.
- [ ] Si el ticket está cancelado o expirado, retorna 410 con mensaje apropiado.
- [ ] Si el ticket es válido (`status === "active"`), se actualiza a `status = "used"` y se registra `usedAt`.
- [ ] Se crea un documento `ticket_redemptions` con `ticketId`, `redeemedBy`, `redeemedAt`, `location`.
- [ ] Si el ticket tiene un booking asociado, el booking se actualiza a `status = "checked-in"` con `checkedInAt`.
- [ ] La respuesta incluye: `ticketCode`, `participantName`, `participantEmail`, nombre de experiencia, fecha/hora, status actualizado.
- [ ] La Function retorna 200 en caso de validación exitosa.
- [ ] La Function es idempotente: validar un ticket ya usado retorna 409 sin crear redemption duplicada.
- [ ] Los logs registran `ticketCode`, `redeemedBy`, `location` y resultado.
- [ ] El campo `location` de la redención se guarda si fue proporcionado.

## Validaciones de seguridad

- [ ] JWT del caller verificado server-side; label `admin` o `operator` requerido.
- [ ] La Function NO permite que un `client` o `anónimo` valide tickets.
- [ ] `ticketCode` sanitizado (solo caracteres alfanuméricos y guiones permitidos).
- [ ] La Function usa Appwrite Server SDK con API key para operaciones de escritura.
- [ ] No se exponen datos sensibles de la orden en la respuesta — solo datos del ticket y participante.
- [ ] La Function no permite revertir un ticket de `used` a `active` (operación irreversible server-side).
- [ ] Los logs no contienen datos sensibles del participante más allá de nombre y email.

## Dependencias

- **TASK-006:** Schema transaccional — provee `tickets`, `ticket_redemptions`.
- **TASK-023:** Function `generate-ticket` — genera los tickets que esta Function valida.

## Bloquea a

- **TASK-025:** Página de check-in en admin — necesita el endpoint de validación funcional.

## Riesgos y notas

- **Concurrencia:** Dos operators podrían intentar validar el mismo ticket simultáneamente. Mitigación: la actualización de status a `used` debe verificar que el status actual sea `active` antes de escribir. Si ya cambió entre la lectura y la escritura, la segunda invocación debe retornar 409.
- **Booking lookup:** Encontrar el booking asociado a un ticket requiere buscar por `orderId` + `slotId`. Si hay múltiples bookings para la misma orden y slot (caso edge con quantity > 1), definir si un booking cubre todo el grupo o hay bookings individuales. En v1, un booking por order item (cubre el grupo).
- **Location tracking:** El campo `location` es informativo. En v1 se llena manualmente. En futuro podría derivarse de geolocalización o punto de acceso.
- **Ticket expiration:** En v1, los tickets no expiran automáticamente. Un cron job futuro podría marcar tickets como `expired` si el slot ya pasó. Documentar como futura mejora.
