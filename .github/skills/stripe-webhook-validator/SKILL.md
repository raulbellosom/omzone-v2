# Skill: Stripe Webhook Validator

## Cuándo usarlo

- Cuando se implemente o modifique la Function que recibe webhooks de Stripe en OMZONE
- Al crear un nuevo evento de webhook (ej: `checkout.session.completed`, `payment_intent.succeeded`, `charge.refunded`)
- Cuando se necesite validar que la reconciliación entre Stripe y las órdenes/tickets de OMZONE funciona correctamente
- Después de cambios en el flujo de checkout que puedan afectar cómo se procesan los webhooks
- Cuando se investigue un bug donde el pago se cobra pero el ticket no se emite (o viceversa)

**Ejemplos concretos:**
- "Validar que `checkout.session.completed` crea correctamente la orden y emite el ticket"
- "Verificar idempotencia: un webhook duplicado no debe crear dos tickets"
- "Auditar que la firma HMAC se verifica antes de procesar cualquier evento"
- "Probar qué pasa si Stripe envía un evento con un `sessionId` que no existe en nuestro sistema"

## Cuándo NO usarlo

- Para validar el flujo de checkout completo (frontend + Function de inicio) → usar skill `checkout-flow-validator`
- Para construir la Function de checkout desde cero → usar skill `appwrite-function-builder`
- Para QA general que incluye webhooks como parte de un flujo mayor → usar skill `qa-tester`
- Para validar el flujo de tickets una vez emitidos (QR, check-in, redención) → usar skill `ticketing-flow-tester`

## Entradas necesarias

- [ ] Documento maestro leído: `docs/core/00_documento_maestro_requerimientos.md` — sección de checkout/pagos
- [ ] Function de webhook identificada: `functions/<webhook-function-name>/src/main.js`
- [ ] Stripe events suscritos: lista de eventos que la Function debe manejar
- [ ] Schema de órdenes y tickets revisado en `appwrite.json`
- [ ] Variables de entorno de Stripe identificadas: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] Flujo de checkout documentado: qué inicia la sesión, qué metadata se envía, qué campos se esperan de vuelta

## Procedimiento paso a paso

### Fase 1: Preparación

**Paso 1 — Entender el flujo de pago en OMZONE**

Mapear el flujo completo:

```
1. Client selecciona experiencia + variante + addons
2. Frontend llama a Function `create-checkout` con los datos
3. Function valida, calcula precio, crea Stripe Checkout Session con metadata
4. Client es redirigido a Stripe para pagar
5. Stripe cobra → envía webhook a Function de webhook
6. Function de webhook procesa → crea/actualiza orden → emite ticket
7. Client es redirigido a página de confirmación
```

Identificar:
- Qué metadata se envía a Stripe en la Checkout Session (`experienceId`, `editionId`, `variantId`, `userId`, `addons`, etc.)
- Qué eventos de Stripe se suscriben
- Qué tablas se escriben al procesar el webhook

> ✅ Hecho cuando: tengo el flujo completo mapeado con metadata y tablas de destino.

**Paso 2 — Localizar y leer la Function de webhook**

Leer el código de la Function que procesa webhooks:
- Archivo principal: `functions/<webhook-function-name>/src/main.js`
- Dependencias: `package.json`
- Variables de entorno: `.env.example`

> ✅ Hecho cuando: conozco el código completo de la Function de webhook.

**Paso 3 — Identificar los eventos a validar**

Listar cada evento de Stripe que la Function maneja:

| Evento | Acción esperada en OMZONE |
|---|---|
| `checkout.session.completed` | Crear orden con snapshot, emitir ticket, decrementar stock |
| `payment_intent.succeeded` | Confirmar pago en orden (si se usa como fallback) |
| `charge.refunded` | Marcar orden como refunded, invalidar ticket |
| ... | ... |

> ✅ Hecho cuando: tengo la tabla de eventos con acciones esperadas.

### Fase 2: Ejecución

**Paso 4 — Validar verificación de firma HMAC**

La firma HMAC es la **primera línea de defensa**. Verificar:

- [ ] La Function extrae el header `stripe-signature` del request
- [ ] Usa `stripe.webhooks.constructEvent(body, signature, webhookSecret)` para verificar
- [ ] El `STRIPE_WEBHOOK_SECRET` viene de variable de entorno, NUNCA hardcodeado
- [ ] Si la firma es inválida, retorna error inmediato (401/403) SIN procesar nada
- [ ] El body RAW se usa para verificación (no el body parseado/modificado)
- [ ] No hay bypass posible: no se puede procesar un evento sin firma válida

Patrón esperado:
```javascript
const signature = req.headers['stripe-signature'];
let event;
try {
  event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
} catch (err) {
  error(`Webhook signature verification failed: ${err.message}`);
  return res.json({ ok: false, error: { code: 'ERR_WEBHOOK_INVALID_SIGNATURE', message: 'Invalid signature' } }, 401);
}
```

> ✅ Hecho cuando: verificación de firma es sólida y sin bypass.

**Paso 5 — Validar idempotencia**

Los webhooks de Stripe pueden llegar duplicados. La Function debe ser idempotente:

- [ ] Se verifica si el evento ya fue procesado ANTES de ejecutar lógica de negocio
- [ ] Método de deduplicación implementado:
  - **Opción A:** Verificar `event.id` contra un registro de eventos procesados
  - **Opción B:** Verificar si la orden ya existe con el `sessionId` de Stripe
  - **Opción C:** Verificar si el ticket ya fue emitido para esa orden
- [ ] Si el evento ya fue procesado, retorna `{ ok: true }` sin error (Stripe espera 2xx)
- [ ] No depende de timing: funciona aunque el webhook llegue 1ms o 1 hora después
- [ ] Race condition protegida: si dos webhooks idénticos llegan simultáneamente, solo uno procesa

Patrón esperado:
```javascript
// Verificar si ya se procesó este checkout session
const existingOrder = await databases.listDocuments(DB, 'orders', [
  Query.equal('stripeSessionId', session.id),
  Query.limit(1)
]);
if (existingOrder.total > 0) {
  log(`Webhook already processed for session ${session.id}, skipping`);
  return res.json({ ok: true, data: { alreadyProcessed: true } });
}
```

> ✅ Hecho cuando: idempotencia verificada para cada evento.

**Paso 6 — Validar extracción de metadata y datos**

El webhook debe extraer correctamente la metadata enviada al crear la Checkout Session:

- [ ] Se extraen todos los campos de metadata esperados (`experienceId`, `editionId`, `variantId`, `userId`, `addons`, etc.)
- [ ] Se valida que cada campo de metadata existe y no es null/undefined
- [ ] Se validan los tipos: IDs son strings válidos, cantidades son números, etc.
- [ ] Si falta metadata crítica, se registra error y se retorna fallo descriptivo
- [ ] Se extraen los datos de pago: `amount_total`, `currency`, `payment_status`
- [ ] Se extrae el `customer_email` o datos de cliente si aplica

> ✅ Hecho cuando: extracción de metadata es completa y validada.

**Paso 7 — Validar creación de orden con snapshot**

La orden es el registro histórico de la venta. Debe incluir snapshot completo:

- [ ] La orden se crea con todos los campos requeridos del schema
- [ ] El snapshot incluye TODO lo necesario para reconstruir la venta sin leer datos vivos:
  - Experiencia: nombre, tipo, descripción corta
  - Edición: fecha, horario, ubicación
  - Variante: nombre, tier, precio al momento de la compra
  - Addons: nombre, precio, cantidad de cada addon
  - Totales: subtotal, impuestos, descuentos, total final
  - Stripe: sessionId, paymentIntentId, amount, currency
- [ ] Los precios en el snapshot corresponden a lo que Stripe cobró (no se recalculan de datos vivos)
- [ ] El `userId` de la orden corresponde al usuario autenticado, no a un dato manipulable
- [ ] El status de la orden se establece correctamente: `paid`, `confirmed`, etc.

> ✅ Hecho cuando: orden se crea con snapshot completo y fiel.

**Paso 8 — Validar emisión de ticket**

Después de crear la orden, se emite el ticket:

- [ ] El ticket se crea vinculado a la orden
- [ ] El ticket tiene un identificador único (code, QR data)
- [ ] El status del ticket es correcto: `active`, `valid`, etc.
- [ ] El stock/capacidad se decrementa correctamente en la edición
- [ ] Si la emisión del ticket falla DESPUÉS de crear la orden, el sistema queda en estado consistente (orden sin ticket = requiere acción manual o retry, NO stock decrementado sin ticket)
- [ ] Si se compran múltiples items, se emite un ticket por cada uno

> ✅ Hecho cuando: emisión de ticket es correcta y consistente con la orden.

**Paso 9 — Validar manejo de errores y edge cases**

| Escenario | Comportamiento esperado |
|---|---|
| Firma HMAC inválida | 401 inmediato, nada procesado |
| Evento duplicado | 200 OK, no se reprocesa |
| Metadata faltante | Error logueado, no se crea orden corrupta |
| Session ID no existe en contexto esperado | Error descriptivo logueado |
| Error al crear orden en Appwrite | Error logueado, Stripe recibirá 5xx y reintentará |
| Error al emitir ticket | Orden creada pero ticket pendiente — estado consistente |
| Evento no suscrito/desconocido | 200 OK con log informativo, no error |
| `amount_total = 0` (sesión gratuita) | Comportamiento definido: ¿se crea orden igual? |
| Refund parcial | Comportamiento definido según reglas de negocio |

- [ ] Cada error tiene código descriptivo: `ERR_WEBHOOK_*`
- [ ] Los errores se logean con `error()` del contexto, no `console.error`
- [ ] Los errores de Stripe (5xx a ellos) provocan retry automático de Stripe — la Function está preparada
- [ ] No hay `try/catch` genérico que traga errores silenciosamente

> ✅ Hecho cuando: todos los edge cases revisados con comportamiento definido.

**Paso 10 — Validar respuestas HTTP**

Stripe requiere respuestas HTTP específicas para determinar si reintenta:

- [ ] 2xx → Stripe considera el webhook procesado (no reintenta)
- [ ] 4xx → Stripe no reintenta (error del payload, no tiene sentido reintentar)
- [ ] 5xx → Stripe reintenta con backoff exponencial
- [ ] La Function retorna 2xx cuando:
  - El evento se procesó exitosamente
  - El evento ya fue procesado (idempotencia)
  - El evento es de un tipo no suscrito (ignorar sin error)
- [ ] La Function retorna 4xx cuando:
  - La firma es inválida
  - El payload es malformado
- [ ] La Function retorna 5xx cuando:
  - Error interno (Appwrite caído, error inesperado) → Stripe reintentará
- [ ] La respuesta siempre es `{ ok: true/false, ... }` (formato OMZONE estándar)

> ✅ Hecho cuando: respuestas HTTP son correctas para cada escenario.

### Fase 3: Validación

**Paso 11 — Checklist cruzado de seguridad**

- [ ] No hay forma de triggear el webhook sin firma válida
- [ ] No hay forma de inyectar metadata falsa post-firma
- [ ] El `userId` en la orden viene de metadata confiable (enviada por Function de checkout, no por frontend)
- [ ] Los precios vienen de lo que Stripe cobró, no de lo que el frontend envió
- [ ] No se exponen datos sensibles en la respuesta del webhook (Stripe no necesita ver datos internos)
- [ ] `STRIPE_WEBHOOK_SECRET` no está hardcodeado ni en logs
- [ ] No hay escalación de privilegios: el webhook no ejecuta acciones que el caller original no debería poder hacer

> ✅ Hecho cuando: seguridad auditada sin vulnerabilidades.

**Paso 12 — Compilar reporte**

Generar el reporte con formato estándar (ver Output esperado).

> ✅ Hecho cuando: reporte completo con hallazgos y recomendaciones.

## Checklist de entrega

- [ ] Verificación de firma HMAC implementada correctamente, sin bypass
- [ ] Idempotencia implementada: webhooks duplicados no generan datos duplicados
- [ ] Metadata extraída y validada completamente
- [ ] Orden creada con snapshot completo: experiencia, edición, variante, addons, precios, datos de Stripe
- [ ] Snapshot usa precios de Stripe (lo cobrado), no recalcula de datos vivos
- [ ] Ticket emitido correctamente vinculado a la orden
- [ ] Stock/capacidad decrementado al emitir ticket
- [ ] Estados consistentes ante fallos parciales (orden sin ticket = estado reconocible)
- [ ] Manejo de errores con códigos descriptivos `ERR_WEBHOOK_*`
- [ ] Respuestas HTTP correctas: 2xx (procesado/duplicado), 4xx (firma/payload), 5xx (error interno)
- [ ] Eventos no suscritos retornan 2xx sin error
- [ ] No hay `console.log`, solo `log()` / `error()` del contexto
- [ ] Variables de entorno en `.env.example`: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] `root` no está involucrado en ningún flujo de webhook

## Errores comunes

❌ **Verificar firma DESPUÉS de parsear el body** → ✅ La firma HMAC se verifica sobre el body RAW. Si el framework parsea el body antes (`JSON.parse`), la verificación fallará. Usar `req.body` o `req.bodyRaw` según el runtime de Appwrite.

❌ **No implementar idempotencia y confiar en que Stripe envía una sola vez** → ✅ Stripe SIEMPRE puede enviar webhooks duplicados (retries, errores de red, cambios de endpoint). La Function DEBE verificar si ya procesó el evento antes de actuar.

❌ **Recalcular precios desde datos vivos en vez de usar lo que Stripe cobró** → ✅ Si entre el checkout y el webhook cambia un precio, el snapshot debe reflejar LO QUE SE COBRÓ (`amount_total` de Stripe), no lo que dice la tabla de precios ahora.

❌ **Retornar 4xx en errores internos haciendo que Stripe no reintente** → ✅ Si Appwrite está caído o hay un error transitorio, retornar 5xx para que Stripe reintente. Solo retornar 4xx para errores de payload/firma que nunca se resolverán solos.

❌ **Decrementar stock sin verificar que el ticket se creó** → ✅ Si se decrementa stock y luego falla la creación del ticket, queda un asiento perdido. La operación debe ser atómica o tener rollback/compensación.

❌ **Confiar en metadata del frontend para datos sensibles** → ✅ La metadata de Stripe se establece en la Function de checkout (server-side). Pero verificar que efectivamente viene de allí y no de un parámetro manipulable.

❌ **`try/catch` genérico que retorna 200 siempre** → ✅ Un catch genérico que retorna `{ ok: true }` ante cualquier error oculta fallos reales y Stripe nunca reintenta. Capturar errores específicos, logear con detalle y retornar el código HTTP correcto.

## Output esperado

```markdown
# Stripe Webhook Validation Report

## Resumen

| Aspecto | Estado |
|---|---|
| Firma HMAC | ✅ / ❌ |
| Idempotencia | ✅ / ❌ |
| Extracción de metadata | ✅ / ❌ |
| Creación de orden + snapshot | ✅ / ❌ |
| Emisión de ticket | ✅ / ❌ |
| Manejo de errores | ✅ / ❌ |
| Respuestas HTTP | ✅ / ❌ |
| Seguridad | ✅ / ❌ |

## Eventos validados

| Evento | Resultado | Issues |
|---|---|---|
| `checkout.session.completed` | ✅ / ❌ | WH-NNN |
| `charge.refunded` | ✅ / ❌ | WH-NNN |

## Issues detallados

### WH-001: [Título]
- **Severidad:** critical | major | minor
- **Área:** firma | idempotencia | metadata | orden | ticket | error-handling | seguridad
- **Archivo:** path/to/file.js (líneas aprox.)
- **Descripción:** qué falla
- **Fix sugerido:** approach

## Recomendaciones
```

### Severidades de referencia

| Nivel | Criterio |
|---|---|
| **critical** | Dinero cobrado sin ticket emitido, firma no verificada, datos manipulables, doble procesamiento de pago |
| **major** | Snapshot incompleto, error handling inadecuado, idempotencia parcial, stock inconsistente |
| **minor** | Log insuficiente, respuesta HTTP subóptima, metadata redundante |

## Referencias cruzadas

- Documento maestro: `docs/core/00_documento_maestro_requerimientos.md`
- Schema de órdenes/tickets: `appwrite.json`
- Instrucción de Functions: `.github/instructions/functions.instructions.md`
- Prompt de Functions: `.github/prompts/create-function.prompt.md`
- Agente de Stripe: `.github/agents/stripe.agent.md`
- Agente de seguridad: `.github/agents/security.agent.md`
- Skill complementario: `checkout-flow-validator` (para validar el inicio del flujo)
- Skill complementario: `ticketing-flow-tester` (para validar el flujo post-emisión)
