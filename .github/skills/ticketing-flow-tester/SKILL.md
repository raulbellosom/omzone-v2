# Skill: Ticketing Flow Tester

## Cuándo usarlo

- Cuando se implemente o modifique el flujo de emisión de tickets en OMZONE
- Al validar que después de un pago confirmado se emite correctamente el ticket con todos sus datos
- Cuando se necesite probar la visualización de tickets en el customer portal
- Al implementar o auditar el flujo de check-in / redención de tickets (QR, código manual)
- Cuando se pruebe el uso de pases consumibles y su decremento correcto
- Después de cambios en el webhook de Stripe o la Function de emisión que puedan afectar tickets

**Ejemplos concretos:**
- "Validar que después de `checkout.session.completed` se emite un ticket con QR y datos correctos"
- "Probar que un client puede ver sus tickets activos en el portal y acceder al detalle"
- "Verificar que la redención de un ticket decrementa el pase consumible correctamente"
- "Probar que un ticket canjeado no se puede canjear de nuevo"
- "Verificar que un operator puede hacer check-in escaneando el QR"

## Cuándo NO usarlo

- Para validar el flujo de checkout previo al ticket → usar skill `checkout-flow-validator`
- Para validar el webhook de Stripe que dispara la emisión → usar skill `stripe-webhook-validator`
- Para QA general de un módulo completo → usar skill `qa-tester`
- Para auditar responsive de la página de tickets → usar skill `responsive-auditor`
- Para crear la Function de emisión desde cero → usar skill `appwrite-function-builder`

## Entradas necesarias

- [ ] Documento maestro leído: `docs/core/00_documento_maestro_requerimientos.md` — sección de tickets, reservas, redenciones, pases
- [ ] Schema de tickets revisado en `appwrite.json`: tabla `tickets`, atributos, relaciones con órdenes y ediciones
- [ ] Schema de órdenes revisado: relación orden → ticket
- [ ] Schema de pases consumibles revisado (si aplica): tabla de pases, saldo, redenciones
- [ ] Function de emisión identificada: `functions/<emit-ticket>/src/main.js`
- [ ] Function de redención identificada (si existe): `functions/<redeem-ticket>/src/main.js`
- [ ] Componentes del customer portal de tickets identificados
- [ ] Componentes de check-in/redención del admin/operator identificados

## Procedimiento paso a paso

### Fase 1: Preparación

**Paso 1 — Mapear el flujo completo de ticketing**

El flujo de tickets en OMZONE tiene varias etapas:

```
1. Pago confirmado (webhook Stripe → orden creada con snapshot)
2. Emisión (Function crea ticket vinculado a la orden)
3. Notificación (email/visual al client con datos del ticket)
4. Visualización (client ve ticket en portal: código, QR, datos de la experiencia)
5. Presentación (client muestra QR o código en el evento)
6. Redención / Check-in (operator/admin valida y marca como usado)
7. Post-uso (ticket marcado como redeemed, pase decrementado si aplica)
```

Identificar qué etapas están implementadas y cuáles se van a probar.

> ✅ Hecho cuando: flujo mapeado, etapas a probar identificadas.

**Paso 2 — Inventariar entidades y archivos**

| Entidad | Elementos |
|---|---|
| **Tablas** | `tickets`, `orders`, `editions`, `experience_passes` (si aplica), `redemptions` (si aplica) |
| **Functions** | emisión, redención, validación |
| **Componentes** | lista de tickets, detalle de ticket, QR viewer, check-in scanner |
| **Hooks** | useTickets, useTicketDetail, useRedemption (o equivalentes) |

> ✅ Hecho cuando: inventario completo de entidades involucradas.

**Paso 3 — Definir escenarios de prueba**

Preparar matriz de escenarios:

| # | Escenario | Tipo | Roles |
|---|---|---|---|
| 1 | Emisión exitosa después de pago | happy path | system (webhook) |
| 2 | Visualización en customer portal | happy path | client |
| 3 | Check-in con QR | happy path | operator |
| 4 | Ticket ya canjeado | edge case | operator |
| 5 | Ticket de otro usuario | permisos | client |
| 6 | Pase consumible con saldo | happy path | client + operator |
| 7 | Pase consumible sin saldo | edge case | client |
| 8 | Ticket para edición cancelada | edge case | client |

> ✅ Hecho cuando: matriz de escenarios preparada.

### Fase 2: Ejecución

**Paso 4 — Validar emisión de ticket**

Después de que el webhook crea la orden, debe emitirse el ticket. Verificar:

- [ ] El ticket se crea vinculado a la orden correcta (`orderId`)
- [ ] El ticket tiene un código/identificador único (no duplicable)
- [ ] El QR data contiene información suficiente para validar (ticketId, código, o hash verificable)
- [ ] El status del ticket es correcto al emitirse: `active` / `valid`
- [ ] Los datos del ticket reflejan el snapshot de la orden (no datos vivos):
  - Experiencia: nombre, tipo
  - Edición: fecha, horario, ubicación
  - Variante: tier/nombre
  - Titular: nombre del client
- [ ] Si se compran múltiples ítems, se emite un ticket por cada uno
- [ ] El stock/capacidad de la edición se decrementa correctamente
- [ ] Si la emisión falla, la orden queda en estado reconocible (no se pierde la venta)

> ✅ Hecho cuando: emisión verificada en happy path y con datos correctos.

**Paso 5 — Validar unicidad y seguridad del ticket**

- [ ] El código del ticket es único — no hay dos tickets con el mismo código
- [ ] El código no es predecible (no es secuencial simple tipo ticket-001, ticket-002)
- [ ] El QR no expone datos sensibles (no incluir precios, datos personales completos)
- [ ] Un ticket no puede ser duplicado manipulando el frontend
- [ ] La Function de emisión no puede ser invocada directamente por un `client` (solo por system/webhook)
- [ ] El ticket se vincula al `userId` correcto — no se puede transferir por manipulación

> ✅ Hecho cuando: unicidad y seguridad del ticket auditadas.

**Paso 6 — Validar visualización en customer portal**

El client debe poder ver sus tickets. Verificar:

- [ ] La lista de tickets muestra solo los tickets del client autenticado (no los de otros)
- [ ] Cada ticket en la lista muestra: experiencia, fecha, status, código corto
- [ ] El detalle del ticket muestra: todos los datos del snapshot, QR, código completo
- [ ] El QR se renderiza correctamente y es escaneable
- [ ] Si el ticket está canjeado, se muestra como tal (visual distinto, no confundible con activo)
- [ ] Si no hay tickets, se muestra empty state adecuado
- [ ] La carga es rápida y hay loading state mientras llegan los datos

Verificar por rol:
| Acción | client (dueño) | client (otro) | operator | admin |
|---|---|---|---|---|
| Ver lista de tickets propios | ✅ | ❌ | N/A | ✅ (todos) |
| Ver detalle de ticket propio | ✅ | ❌ | ✅ | ✅ |
| Ver QR de ticket propio | ✅ | ❌ | ✅ | ✅ |

> ✅ Hecho cuando: visualización verificada con aislamiento entre clients.

**Paso 7 — Validar flujo de redención / check-in**

El operator/admin valida el ticket en el evento. Verificar:

- [ ] El operator puede buscar un ticket por código o escanear QR
- [ ] Al escanear/buscar, se muestran los datos del ticket: experiencia, titular, fecha, status
- [ ] Si el ticket es `active`, se puede marcar como `redeemed` / `checked-in`
- [ ] Después de redimir, el status cambia inmediatamente (no requiere refresh)
- [ ] El timestamp de redención se registra
- [ ] El operator que hizo el check-in se registra (para auditoría)

Verificar por rol:
| Acción | client | operator | admin |
|---|---|---|---|
| Escanear QR / buscar ticket | ❌ | ✅ | ✅ |
| Hacer check-in | ❌ | ✅ | ✅ |
| Ver historial de check-ins | ❌ | ✅ (sus check-ins) | ✅ (todos) |

> ✅ Hecho cuando: redención funciona correctamente con roles separados.

**Paso 8 — Validar pases consumibles (si aplica)**

Los pases son tickets de múltiples usos con saldo. Verificar:

- [ ] El pase se emite con el saldo correcto (ej: 5 sesiones)
- [ ] Cada redención decrementa el saldo en 1
- [ ] El saldo se muestra actualizado inmediatamente en el customer portal
- [ ] Cuando el saldo llega a 0, el pase cambia a status `exhausted` / `completed`
- [ ] No se puede redimir un pase con saldo 0
- [ ] El historial de redenciones del pase es visible (fecha, experiencia, operator)
- [ ] La redención de un pase valida que la experiencia es compatible con el tipo de pase

> ✅ Hecho cuando: pases consumibles funcionan con saldo correcto.

**Paso 9 — Validar edge cases**

| Escenario | Comportamiento esperado |
|---|---|
| Ticket ya canjeado → intentar canjear de nuevo | Error claro: "Este ticket ya fue utilizado" |
| Ticket de edición con fecha pasada | Depende de regla de negocio: ¿se puede canjear igual? |
| Ticket para edición cancelada | Estado visible, no se puede canjear, posible "pendiente de resolución" |
| QR inválido / código inexistente | Error claro: "Ticket no encontrado" |
| Client intenta acceder a ticket de otro client | 403 o redirección — NUNCA muestra los datos |
| Pase con saldo 0 → intentar redimir | Error claro: "Sin saldo disponible" |
| Redención sin conexión (offline) | Comportamiento definido, no queda en estado inconsistente |
| Ticket con datos de snapshot incompletos | El UI muestra lo disponible sin romperse |
| Orden con múltiples tickets → cancel parcial | ¿Se invalidan todos o solo algunos? |

- [ ] Cada edge case tiene comportamiento definido y documentado
- [ ] Los errores son descriptivos, no genéricos

> ✅ Hecho cuando: edge cases probados con comportamiento correcto.

**Paso 10 — Validar consistencia de datos**

- [ ] El ticket referencia la orden correcta y viceversa
- [ ] Los datos del ticket son consistentes con el snapshot de la orden
- [ ] Si la experiencia/edición cambia después de la venta, el ticket muestra datos del snapshot (no datos vivos)
- [ ] El stock decrementado en la edición coincide con el número de tickets emitidos
- [ ] Si un ticket se cancela/invalida, el stock se incrementa de vuelta (si aplica)
- [ ] No hay tickets huérfanos (sin orden) ni órdenes sin ticket (para pagos exitosos)

> ✅ Hecho cuando: datos son consistentes entre tickets, órdenes y ediciones.

### Fase 3: Validación

**Paso 11 — Checklist cruzado de seguridad**

- [ ] Un client no puede ver tickets de otro client
- [ ] Un client no puede canjear su propio ticket (solo operator/admin)
- [ ] La Function de emisión no es invocable directamente por frontend
- [ ] La Function de redención verifica el label del caller (operator/admin)
- [ ] El código/QR del ticket no es predecible ni fabricable
- [ ] No se puede manipular el saldo de un pase desde frontend
- [ ] `root` no aparece en ningún flujo visible de ticketing

> ✅ Hecho cuando: seguridad auditada.

**Paso 12 — Compilar reporte**

Generar el reporte con formato estándar (ver Output esperado).

> ✅ Hecho cuando: reporte completo.

## Checklist de entrega

- [ ] Emisión validada: ticket se crea con datos correctos después de pago confirmado
- [ ] Código/QR es único, no predecible y no expone datos sensibles
- [ ] Aislamiento entre clients: un client solo ve sus propios tickets
- [ ] Visualización en customer portal: lista, detalle, QR, estados
- [ ] Redención/check-in funciona con roles correctos (operator/admin)
- [ ] Ticket canjeado no se puede canjear de nuevo
- [ ] Pases consumibles decrementan saldo correctamente (si aplica)
- [ ] Snapshot respetado: datos del ticket no cambian si la experiencia cambia
- [ ] Stock/capacidad consistente con tickets emitidos
- [ ] Edge cases cubiertos: ticket duplicado, QR inválido, saldo cero, edición cancelada
- [ ] Errores descriptivos, no genéricos
- [ ] Seguridad auditada: no hay escalación de acceso ni manipulación posible
- [ ] `root` no expuesto en ningún flujo de ticketing

## Errores comunes

❌ **Emitir ticket antes de confirmar el pago** → ✅ El ticket se emite DESPUÉS de que el pago es confirmado (webhook `checkout.session.completed`). Nunca emitir en el momento del redirect de Stripe — el pago podría no completarse.

❌ **Mostrar datos vivos en el ticket en vez del snapshot** → ✅ Si la experiencia cambia de nombre o la edición cambia de hora, el ticket del client debe mostrar lo que compró, no lo actual. Siempre leer del snapshot de la orden.

❌ **Código de ticket secuencial predecible** → ✅ `TICKET-001`, `TICKET-002` permite a alguien adivinar tickets válidos. Usar UUIDs, hashes o códigos alfanuméricos aleatorios de longitud suficiente.

❌ **No verificar aislamiento entre clients** → ✅ Probar SIEMPRE que un `client` no puede acceder a tickets de otro `client` — ni por URL directa, ni por API, ni por manipulación de queries.

❌ **Decrementar stock sin crear ticket (o viceversa)** → ✅ La operación de emitir ticket y decrementar stock debe ser atómica o tener compensación. Si una falla y la otra no, queda inconsistencia.

❌ **Check-in sin registrar quién lo hizo** → ✅ Para auditoría, registrar el `operatorId` y timestamp de cada check-in. Esto permite investigar discrepancias o reclamos.

❌ **Pase con saldo negativo por race condition** → ✅ Si dos redenciones del mismo pase llegan simultáneamente con saldo=1, solo una debe proceder. Implementar verificación + decremento atómico o lock optimista.

## Output esperado

```markdown
# Ticketing Flow Test Report

## Resumen

| Área | Estado |
|---|---|
| Emisión de ticket | ✅ / ❌ |
| Unicidad y seguridad | ✅ / ❌ |
| Visualización en portal | ✅ / ❌ |
| Redención / check-in | ✅ / ❌ |
| Pases consumibles | ✅ / ❌ / N/A |
| Edge cases | ✅ / ❌ |
| Consistencia de datos | ✅ / ❌ |
| Aislamiento entre users | ✅ / ❌ |

## Escenarios probados

| # | Escenario | Resultado | Issues |
|---|---|---|---|
| 1 | Emisión después de pago | ✅ / ❌ | TK-NNN |
| 2 | Visualización en portal | ✅ / ❌ | TK-NNN |
| ... | ... | ... | ... |

## Issues detallados

### TK-001: [Título]
- **Severidad:** critical | major | minor
- **Área:** emisión | unicidad | visualización | redención | pases | edge-case | seguridad
- **Archivo:** path/to/file (líneas aprox.)
- **Descripción:** qué falla
- **Expected:** comportamiento esperado
- **Actual:** comportamiento observado
- **Fix sugerido:** approach

## Recomendaciones
```

### Severidades de referencia

| Nivel | Criterio |
|---|---|
| **critical** | Ticket no se emite después de pago, client ve tickets de otro user, doble canje, pase con saldo negativo |
| **major** | Datos del ticket incorrectos, QR no escaneable, check-in no registra operator, stock inconsistente |
| **minor** | Empty state genérico, loading state ausente, timestamp en formato no legible |

## Referencias cruzadas

- Documento maestro: `docs/core/00_documento_maestro_requerimientos.md`
- Schema de tickets y órdenes: `appwrite.json`
- Instrucción de Functions: `.github/instructions/functions.instructions.md`
- Agente de QA: `.github/agents/qa.agent.md`
- Prompt de QA: `.github/prompts/run-qa.prompt.md`
- Skill previo en el flujo: `stripe-webhook-validator` (valida el webhook que dispara emisión)
- Skill previo en el flujo: `checkout-flow-validator` (valida el checkout que llega a Stripe)
- Skill complementario: `qa-tester` (para QA general que incluya tickets)
