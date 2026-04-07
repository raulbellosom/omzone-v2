# TASK-027: Function consume-pass — redención de pase con trazabilidad

## Objetivo

Crear la Appwrite Function `consume-pass` que permite a un usuario (o admin actuando en su nombre) consumir un crédito de un pase comprado para acceder a una sesión específica, generando un ticket y registrando el consumo de forma trazable. Al completar esta tarea, los pases consumibles son funcionales end-to-end: el usuario selecciona una sesión, consume un crédito de su pase, recibe un ticket y el sistema registra todo con integridad.

## Contexto

- **Fase:** 8 — Pases y paquetes
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 8
- **Documento maestro:** Sección 7.6 (Pase consumible), RF-07, RF-13 (Pases consumibles)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `user_passes` (6.7), `pass_consumptions` (6.6), `passes` (3.8), `tickets` (6.4), `slots` (4.1)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Transaccional (write), Comercial (read passes)
- **ADR relacionados:** ADR-005 (Lógica sensible en Functions) — la redención de créditos y generación de tickets se realiza exclusivamente server-side; ADR-001 (Snapshots) — el ticket generado contiene snapshot
- **RF relacionados:** RF-07, RF-13

Esta Function es el motor transaccional de los pases consumibles. Es la única vía para consumir créditos, garantizando integridad, validación de reglas y trazabilidad completa.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear Appwrite Function `consume-pass` con trigger HTTP (POST).
2. Input: `userPassId` (string, requerido), `slotId` (string, requerido).
3. Validar caller: debe ser el dueño del pase (userId match) O tener label `admin`.
4. Validaciones:
   - `user_passes` document existe y `status === "active"`.
   - Pase no expirado: `expiresAt` es null o es futuro.
   - `remainingCredits > 0`.
   - Leer `passId` del user pass → leer tipo de pase (`passes`).
   - La experiencia del slot está en `validExperienceIds` del tipo de pase.
   - El slot existe, `status === "available"`, `startDatetime` es futuro, tiene capacidad.
5. Consumir:
   - Decrementar `remainingCredits` en `user_passes`.
   - Si `remainingCredits` llega a 0: actualizar `status` a `depleted`.
   - Crear `pass_consumptions` document con: `userPassId`, `slotId`, `ticketId` (del ticket generado), `creditsUsed = 1`, `consumedAt`.
6. Generar ticket:
   - Crear `tickets` document con: `userId`, `experienceId` (del slot), `slotId`, `ticketCode` único, `status = "active"`, `ticketSnapshot`.
   - El `ticketSnapshot` incluye: experiencia, fecha/hora del slot, tipo de pase, créditos usados.
   - El `orderId` en el ticket puede referenciar al `orderId` del user pass original.
7. Crear booking:
   - Crear `bookings` document con: `orderId` (del user pass), `slotId`, `userId`, `participantCount = 1`, `status = "confirmed"`.
   - Incrementar `bookedCount` del slot.
8. Retornar: ticket creado con `ticketCode`, datos del slot, créditos restantes.
9. Logging: registrar `userPassId`, `slotId`, `ticketId`, créditos restantes.

## Fuera de alcance

- Reembolso de crédito consumido.
- Extensión de vigencia del pase.
- Consumo batch (múltiples créditos en una invocación).
- Transferencia de créditos entre pases.
- Consumo sin slot (crédito genérico) — en v1 todo consumo requiere slot.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Comercial (pricing, addons, paquetes, pases)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `user_passes` | leer / actualizar | Verificar estado, decrementar créditos |
| `passes` | leer | Leer tipo de pase para validar experiencias válidas |
| `slots` | leer / actualizar | Verificar disponibilidad; incrementar bookedCount |
| `experiences` | leer | Verificar que la experiencia del slot es válida para el pase |
| `pass_consumptions` | crear | Registrar consumo con trazabilidad |
| `tickets` | crear | Generar ticket para la sesión consumida |
| `bookings` | crear | Crear reserva confirmada |

## Atributos nuevos o modificados

N/A — se usan atributos existentes definidos en el data model.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `consume-pass` | crear | Function HTTP POST para consumir créditos de pase |

## Buckets / Storage implicados

N/A.

## Componentes frontend implicados

N/A — esta tarea es backend-only. El frontend que invoca esta Function es TASK-033.

## Hooks implicados

N/A.

## Rutas implicadas

N/A — la Function expone un endpoint HTTP gestionado por Appwrite.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Invocar `consume-pass` (propio) | ✅ | ✅ | ❌ | ✅ | ❌ |
| Invocar `consume-pass` (de otro user) | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

1. Cliente (o admin) envía POST a `consume-pass` con `userPassId` y `slotId`.
2. La Function verifica JWT del caller.
3. La Function lee `user_passes` por `userPassId`.
4. Verifica que el caller es dueño del pase (`userId` match) o tiene label `admin`.
5. Verifica `status === "active"`, no expirado, `remainingCredits > 0`.
6. Lee tipo de pase (`passes`) → extrae `validExperienceIds`.
7. Lee slot → verifica experienceId está en validExperienceIds.
8. Verifica slot: `status === "available"`, `startDatetime` futuro, capacidad disponible.
9. Decrementa `remainingCredits` en `user_passes`.
10. Si `remainingCredits === 0` → actualiza `status = "depleted"`.
11. Genera ticket con `ticketCode` único y `ticketSnapshot`.
12. Crea booking y actualiza `bookedCount` del slot.
13. Crea `pass_consumptions` document.
14. Retorna ticket con datos del slot y créditos restantes.

## Criterios de aceptación

- [ ] La Function `consume-pass` existe como Appwrite Function con trigger HTTP.
- [ ] La Function valida que el caller es dueño del pase o tiene label `admin`; retorna 403 si no.
- [ ] Si el user pass no existe, retorna 404.
- [ ] Si el user pass tiene `status !== "active"`, retorna 400 con mensaje descriptivo.
- [ ] Si el pase está expirado (`expiresAt` en el pasado), retorna 400 "Pass expired".
- [ ] Si `remainingCredits === 0`, retorna 400 "No credits remaining".
- [ ] Si la experiencia del slot no está en `validExperienceIds`, retorna 400 "Experience not valid for this pass".
- [ ] Si el slot no tiene capacidad, retorna 409 "Slot is full".
- [ ] Si el slot tiene `startDatetime` en el pasado, retorna 400 "Slot already started".
- [ ] Tras consumo exitoso, `remainingCredits` se decrementa en 1.
- [ ] Si `remainingCredits` llega a 0, el user pass se actualiza a `status = "depleted"`.
- [ ] Se crea un `pass_consumptions` document con `userPassId`, `slotId`, `ticketId`, `creditsUsed = 1`, `consumedAt`.
- [ ] Se genera un ticket con `ticketCode` único, `status = "active"` y `ticketSnapshot` completo.
- [ ] Se crea un booking con `status = "confirmed"` y se incrementa `bookedCount` del slot.
- [ ] La Function retorna el ticket creado y los créditos restantes con status 200.
- [ ] La Function es idempotente: si ya existe un ticket para este user pass + slot, retorna el existente sin consumir otro crédito.

## Validaciones de seguridad

- [ ] JWT del caller verificado server-side.
- [ ] Ownership validado: el userId del caller debe coincidir con el userId del user pass, a menos que sea admin.
- [ ] No se permite consumir pases de otros usuarios sin label admin.
- [ ] Los datos del slot y experiencia se validan server-side, no se confía en input del cliente para datos de precio/capacidad.
- [ ] La Function usa Appwrite Server SDK con API key para crear tickets y bookings.
- [ ] `ticketCode` generado con UUID/crypto random, no predecible.
- [ ] La Function no expone detalles internos del pase de otro usuario en mensajes de error.

## Dependencias

- **TASK-004:** Schema comercial — provee colección `passes`.
- **TASK-005:** Schema agenda — provee `slots`.
- **TASK-006:** Schema transaccional — provee `user_passes`, `pass_consumptions`, `tickets`, `bookings`.
- **TASK-026:** CRUD pases admin — provee tipos de pase configurados.

## Bloquea a

- **TASK-033:** Mis pases en portal — el flujo "Usar pase" invoca esta Function.

## Riesgos y notas

- **Race condition en remainingCredits:** Si un usuario invoca `consume-pass` dos veces rápidamente, podría decrementar más créditos de los disponibles. Mitigación: verificar `remainingCredits > 0` antes de decrementar; si la escritura resulta en negativo, revertir y retornar error.
- **validExperienceIds lookup:** El campo es un JSON string array. La Function debe parsear y verificar inclusión. Si la lista es grande, el check es O(n) pero aceptable para los volúmenes esperados.
- **Ticket sin orderId tradicional:** El ticket generado por consumo de pase no tiene una orden de checkout directa. Se usa el `orderId` del user pass original como enlace.
- **Booking participantCount:** En consumo de pase, se genera un ticket y booking por invocación (1 crédito = 1 persona). Si se necesita consumo grupal (N créditos por N personas), es una extensión futura.
- **Slot timezone:** Verificar que la comparación de `startDatetime` con "ahora" respete timezones. Usar UTC para comparaciones.
