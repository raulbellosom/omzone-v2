# TASK-049: QA de flujos transaccionales — checkout, tickets, pases

## Objetivo

Ejecutar testing end-to-end de todos los flujos transaccionales de OMZONE: compra directa → pago → ticket, compra de pase → consumo, compra de paquete → fulfillment, venta asistida → tickets, booking request → conversión a orden. Verificar snapshots, integridad de datos, capacidad de slots, edge cases y manejo de errores. Al completar esta tarea, se confirma que todos los flujos monetarios del sistema funcionan correctamente de principio a fin.

## Contexto

- **Fase:** 15 — QA, responsive y deploy
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 15
- **Documento maestro:** Secciones:
  - 14.1-14.5 (Flujos A-E del negocio)
  - RF-06 a RF-13
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Dominio transaccional completo (secciones 6.1-6.9)
- **ADR relacionados:** ADR-001 (Modelo híbrido snapshot), ADR-005 (Lógica sensible en Functions)

Esta auditoría verifica que los snapshots son completos e inmutables, que los montos son correctos, que los slots actualizan capacidad, y que los edge cases están manejados.

## Alcance

Lo que SÍ incluye esta tarea:

1. **Flujo A — Compra directa:**
   - Browse catálogo → seleccionar experiencia → seleccionar tier → seleccionar slot → agregar addons → checkout → pago Stripe (test mode) → recibir ticket
   - Verificar: orden creada con snapshot, order items con itemSnapshot, ticket con ticketCode, slot bookedCount actualizado
2. **Flujo B — Compra de pase:**
   - Comprar pase → verificar user_pass creado → consumir pase con slot → ticket generado → remainingCredits actualizado
   - Verificar: pass_consumptions log, créditos decrementados
3. **Flujo C — Compra de paquete:**
   - Comprar paquete → verificar todos los items fulfilled → tickets/beneficios generados
   - Verificar: orden refleja todos los package_items
4. **Flujo D — Venta asistida:**
   - Admin crea venta asistida → marca como pagado → tickets generados inmediatamente
   - Verificar: orden con `orderType: "assisted"`, activity log registrado
5. **Flujo E — Booking request:**
   - Visitante envía solicitud → admin revisa → cotiza → convierte a orden
   - Verificar: orden con `orderType: "request-conversion"`, booking request actualizado con `convertedOrderId`
6. **Verificación de snapshots:**
   - Cada orden tiene `snapshot` JSON con datos completos de la compra
   - Cada order_item tiene `itemSnapshot`
   - Cada ticket tiene `ticketSnapshot`
   - Cada user_pass tiene `passSnapshot`
   - Los snapshots NO cambian si se modifica la experiencia/precio después de la compra
7. **Verificación de capacidad de slots:**
   - Compra incrementa `bookedCount` del slot
   - Cuando `bookedCount === capacity`, el slot pasa a `status: "full"`
   - No se puede comprar para un slot full
8. **Edge cases:**
   - Double payment: same Stripe event procesado dos veces → no duplica orden/tickets
   - Session expired: checkout session expirada → orden queda en `pending`, no genera tickets
   - Slot full mid-checkout: el slot se llena mientras el usuario está en checkout → manejado gracefully
   - Addon no disponible: addon desactivado entre selección y confirmación → checkout falla con error descriptivo
   - Stripe test mode: usar tarjetas de test para success, failure, 3D Secure
9. **Webhook retry handling:**
   - Simular re-envío de webhook → no duplica procesamiento (idempotencia)
10. **Documentación de resultados:**
    - Lista de tests ejecutados con resultado pass/fail
    - Issues encontrados con severidad

## Fuera de alcance

- Load testing (concurrencia masiva).
- Security penetration testing.
- Performance benchmarking.
- Testing de reembolsos (si no implementado aún).
- Testing de expiración automática de pases (CRON, si no implementado).

## Dominio

- [x] QA
- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Comercial (pricing, addons, paquetes, pases)
- [x] Agenda (slots, recursos, capacidad)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `orders` | verificar | Creación, status, snapshot |
| `order_items` | verificar | Items con itemSnapshot |
| `tickets` | verificar | Creación, ticketCode, status |
| `user_passes` | verificar | Créditos, status, passSnapshot |
| `pass_consumptions` | verificar | Log de consumo |
| `payments` | verificar | Registro de pago Stripe |
| `slots` | verificar | bookedCount, status |
| `booking_requests` | verificar | Ciclo de vida, convertedOrderId |
| `admin_activity_logs` | verificar | Logs de venta asistida |

## Atributos nuevos o modificados

N/A — tarea de QA, no modifica schema.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `create-checkout` | verificar | Flujo completo de creación de orden |
| `stripe-webhook` | verificar | Procesamiento de eventos de pago |
| `generate-ticket` | verificar | Emisión de tickets post-pago |
| `validate-ticket` | verificar | Escaneo de ticket |
| `consume-pass` | verificar | Consumo de pase |

## Buckets / Storage implicados

Ninguno directamente.

## Componentes frontend implicados

N/A — testing usa la UI existente y API directo.

## Hooks implicados

N/A.

## Rutas implicadas

Todas las rutas transaccionales se verifican como parte del flujo E2E.

## Permisos y labels involucrados

| Acción | Probado con label |
|---|---|
| Checkout como client | client |
| Checkout como anónimo | — (debe requerir auth) |
| Venta asistida | admin |
| Booking request (público) | anónimo, client |
| Validar ticket | admin, operator |
| Consumir pase | admin |

## Flujo principal

1. Configurar datos de test: experiencias publicadas, pricing tiers, slots con capacidad, addons, pases, paquetes.
2. Ejecutar Flujo A (compra directa) con Stripe test card → verificar orden, items, ticket, slot.
3. Ejecutar Flujo B (pase) → verificar user_pass, consumo, créditos.
4. Ejecutar Flujo C (paquete) → verificar fulfillment.
5. Ejecutar Flujo D (venta asistida) → verificar orden assisted, tickets inmediatos.
6. Ejecutar Flujo E (booking request) → verificar ciclo de vida completo.
7. Verificar snapshots: cambiar precio de experiencia después de compra → snapshot no cambia.
8. Ejecutar edge cases: double webhook, session expired, slot full.
9. Compilar resultados en test matrix.

## Criterios de aceptación

- [ ] Flujo A (compra directa) completa exitosamente: browse → checkout → pay → ticket.
- [ ] La orden se crea con `status: "pending"` y pasa a `paid` tras webhook de Stripe.
- [ ] El snapshot de la orden contiene: experiencia, tier, slot, addons, precios, cantidades.
- [ ] Los order items contienen `itemSnapshot` con datos del momento de compra.
- [ ] El ticket se genera con `ticketCode` único y `status: "active"`.
- [ ] El `ticketSnapshot` contiene datos completos de la experiencia y slot.
- [ ] El `bookedCount` del slot se incrementa en la cantidad comprada.
- [ ] Cuando bookedCount alcanza capacity, el status del slot cambia a `full`.
- [ ] Flujo B (pase): compra crea `user_passes` con créditos correctos; consumo decrementa `remainingCredits`.
- [ ] Flujo C (paquete): la orden contiene todos los items del paquete con snapshots.
- [ ] Flujo D (venta asistida): orden con `orderType: "assisted"` y tickets generados inmediatamente.
- [ ] Flujo E (booking request): solicitud → reviewing → quoted → converted con orden vinculada.
- [ ] Snapshot inmutabilidad: cambiar precio de experiencia/tier/addon después de una compra NO modifica los snapshots de órdenes existentes.
- [ ] Idempotencia: procesar el mismo webhook event dos veces NO duplica orden ni tickets.
- [ ] Stripe test card declined: checkout falla gracefully con mensaje de error al usuario.
- [ ] Slot full mid-checkout: el usuario recibe error descriptivo, la orden no se crea o queda pending.
- [ ] Se documenta lista completa de tests con resultado pass/fail.

## Validaciones de seguridad

- [ ] Los precios en la orden coinciden con los precios en DB al momento de la compra (no manipulados).
- [ ] El `totalAmount` de la orden coincide con el charge de Stripe.
- [ ] No se pueden crear tickets sin pago confirmado.
- [ ] Los webhooks verifican firma HMAC de Stripe antes de procesar.
- [ ] Un client no puede ver órdenes/tickets de otro client.

## Dependencias

- **TASK-019:** Function create-checkout.
- **TASK-020:** UI de checkout.
- **TASK-021:** Function stripe-webhook.
- **TASK-022:** Reconciliación de orden.
- **TASK-023:** Function generate-ticket.
- **TASK-024:** Function validate-ticket.
- **TASK-025:** Confirmación y ticket display.
- **TASK-026:** CRUD pases admin.
- **TASK-027:** Function consume-pass.
- **TASK-028:** CRUD paquetes admin.
- **TASK-029:** Checkout pases y paquetes.

## Bloquea a

- **TASK-050:** Deploy — los flujos transaccionales deben funcionar antes del deploy a producción.

## Riesgos y notas

- **Stripe test mode:** Usar Stripe test mode con tarjetas de test (`4242 4242 4242 4242` para success, `4000 0000 0000 0002` para decline). NO usar keys de producción.
- **Cleanup de test data:** Los tests generan órdenes, tickets y pagos de prueba. Planificar cómo limpiar datos de test antes de producción.
- **Snapshot verification:** Para verificar inmutabilidad, crear una compra, luego modificar el precio de la experiencia, y confirmar que el snapshot de la orden mantiene el precio original.
- **Webhook simulation:** Stripe CLI (`stripe listen --forward-to`) permite simular webhooks localmente. Descargar Stripe CLI para testing.
- **Concurrent purchases:** Para testing básico de concurrencia, abrir dos browsers y intentar comprar el último cupo de un slot simultáneamente. Verificar que solo uno tiene éxito.
- **Pass expiration:** Si los pases tienen `validityDays`, verificar que un pase expirado no puede consumirse. Si la expiración no está implementada aún, documentar como pendiente.
