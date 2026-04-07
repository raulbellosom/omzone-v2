# TASK-021: Function stripe-webhook — procesar payment events

## Objetivo

Crear la Appwrite Function `stripe-webhook` que recibe, verifica y procesa los webhook events de Stripe para actualizar el estado de órdenes y registrar pagos. Al completar esta tarea, cuando Stripe confirma un pago o expira una sesión, la orden en OMZONE se actualiza automáticamente de forma segura e idempotente.

## Contexto

- **Fase:** 6 — Webhooks y pagos
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 6
- **Documento maestro:** RF-07 (Procesamiento de pagos Stripe), RF-10 (Órdenes)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `orders` (6.1), `payments` (6.3)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Functions backend: Transaccional (write)
- **ADR relacionados:** ADR-005 (Lógica sensible en Functions) — los webhooks de Stripe se procesan exclusivamente server-side con verificación de firma HMAC; ADR-001 (Snapshots) — los payment metadata se registran como JSON
- **RF relacionados:** RF-07

Esta Function es la segunda pieza crítica de seguridad transaccional. La firma HMAC de Stripe previene que un atacante simule un pago exitoso. La idempotencia previene procesamiento duplicado de eventos.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear Appwrite Function `stripe-webhook` con trigger HTTP (POST).
2. Verificar firma HMAC del webhook Stripe usando `STRIPE_WEBHOOK_SECRET` (desde env vars).
3. Rechazar requests con firma inválida (retornar 400).
4. Procesar los siguientes event types:
   - **`checkout.session.completed`:**
     - Extraer `orderId` de `session.metadata.orderId` o `session.client_reference_id`
     - Buscar orden en DB por `orderId`
     - Actualizar `orders.status` a `paid`
     - Actualizar `orders.paymentStatus` a `succeeded`
     - Registrar `orders.paidAt` con timestamp
     - Registrar `orders.stripePaymentIntentId` desde session data
   - **`checkout.session.expired`:**
     - Extraer `orderId` de metadata
     - Actualizar `orders.status` a `cancelled`
     - Actualizar `orders.paymentStatus` a `failed`
     - Registrar `orders.cancelledAt` con timestamp
   - **`payment_intent.succeeded`:**
     - Si la orden ya fue marcada como `paid` por `checkout.session.completed`, ignorar (idempotencia)
     - Si no, buscar orden por `stripePaymentIntentId` y actualizar
   - **`payment_intent.payment_failed`:**
     - Buscar orden por `stripePaymentIntentId`
     - Actualizar `orders.paymentStatus` a `failed`
5. Crear documento `payments` con:
   - `orderId`
   - `stripePaymentIntentId`
   - `amount` (del session/payment_intent)
   - `currency`
   - `status` (`succeeded`, `failed`)
   - `method` (card type si disponible)
   - `receiptUrl` (si disponible)
   - `metadata` — JSON con datos completos del event Stripe
6. Idempotencia:
   - Verificar si el evento ya fue procesado (buscar `payments` por `stripePaymentIntentId`)
   - Si ya existe y el status coincide, retornar 200 sin hacer nada
7. Logging: registrar en logs de Function el `eventId`, `eventType`, `orderId` y resultado del procesamiento.
8. Retornar 200 a Stripe lo más rápido posible para evitar retries.
9. Manejo de errores: si la orden no se encuentra, logear error y retornar 200 (para evitar retries infinitos de Stripe).

## Fuera de alcance

- Generación de tickets post-pago (TASK-023).
- Actualización de `bookedCount` en slots (TASK-022).
- Webhooks de refund (`charge.refunded`, `refund.created`) — futura task.
- Email de confirmación post-pago — futura task.
- Webhooks de subscription o recurring payments.
- Dashboard de webhook events en admin.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `orders` | leer / actualizar | Buscar orden por `orderId` o `stripePaymentIntentId`, actualizar status |
| `payments` | crear / leer | Crear registro de pago; leer para verificar idempotencia |

## Atributos nuevos o modificados

N/A — se usan atributos existentes de `orders` y `payments` definidos en el data model.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `stripe-webhook` | crear | Function HTTP POST para procesar webhook events de Stripe |

## Buckets / Storage implicados

N/A.

## Componentes frontend implicados

N/A — esta tarea es backend-only.

## Hooks implicados

N/A.

## Rutas implicadas

N/A — la Function expone un endpoint HTTP gestionado por Appwrite. El URL se configura en el Dashboard de Stripe como Webhook endpoint.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo/Stripe |
|---|---|---|---|---|---|
| Invocar `stripe-webhook` | ❌ | ❌ | ❌ | ❌ | ✅ (Stripe servers) |

Nota: El endpoint es público (accesible por Stripe servers) pero protegido por verificación de firma HMAC.

## Flujo principal

1. Stripe envía un POST al endpoint de `stripe-webhook` con un event payload y firma en header `Stripe-Signature`.
2. La Function extrae el raw body y el header `Stripe-Signature`.
3. La Function verifica la firma HMAC usando `STRIPE_WEBHOOK_SECRET`.
4. Si la firma es inválida → retorna 400 inmediatamente.
5. La Function parsea el event y extrae `event.type` y `event.data.object`.
6. Según el event type:
   - `checkout.session.completed` → busca orden, actualiza a `paid`, crea `payments` doc.
   - `checkout.session.expired` → busca orden, actualiza a `cancelled`.
   - `payment_intent.succeeded` → verifica idempotencia, actualiza si necesario.
   - `payment_intent.payment_failed` → actualiza `paymentStatus` a `failed`.
7. Antes de crear `payments` doc, verifica que no exista ya (idempotencia).
8. Logea resultado del procesamiento.
9. Retorna 200 a Stripe.

## Criterios de aceptación

- [ ] La Function `stripe-webhook` existe como Appwrite Function con trigger HTTP.
- [ ] La Function verifica la firma HMAC de Stripe usando `STRIPE_WEBHOOK_SECRET` (env var).
- [ ] Requests con firma inválida reciben respuesta 400 y NO se procesa ningún event.
- [ ] El evento `checkout.session.completed` actualiza la orden a `status = "paid"`, `paymentStatus = "succeeded"`, y registra `paidAt`.
- [ ] El evento `checkout.session.expired` actualiza la orden a `status = "cancelled"` y registra `cancelledAt`.
- [ ] El evento `payment_intent.succeeded` actualiza la orden si no fue procesada por `checkout.session.completed`.
- [ ] El evento `payment_intent.payment_failed` actualiza `paymentStatus = "failed"`.
- [ ] Se crea un documento `payments` con `orderId`, `stripePaymentIntentId`, `amount`, `currency`, `status`, `metadata`.
- [ ] La Function es idempotente: procesar el mismo evento dos veces no crea duplicados ni cambia estado incorrecto.
- [ ] Si la orden no existe en DB para un event, se logea el error pero se retorna 200 (evitar retries de Stripe).
- [ ] La Function retorna 200 a Stripe en todos los casos manejados (éxito o error controlado).
- [ ] `STRIPE_WEBHOOK_SECRET` se lee de environment variables, nunca hardcodeado.
- [ ] La Function logea `eventId`, `eventType`, `orderId` y resultado para troubleshooting.
- [ ] Event types no manejados se ignoran silenciosamente y retornan 200.

## Validaciones de seguridad

- [ ] Firma HMAC verificada con `stripe.webhooks.constructEvent()` usando el raw body — no el body parseado.
- [ ] `STRIPE_WEBHOOK_SECRET` almacenado como environment variable de la Function en Appwrite.
- [ ] La Function no expone datos internos de Stripe en respuestas HTTP (solo status codes).
- [ ] La Function no confía en datos del body sin verificar la firma primero.
- [ ] No se procesan eventos de Stripe si la firma no es válida — defensa contra webhook spoofing.
- [ ] La Function usa Appwrite Server SDK con API key, no con session de usuario (esta Function actúa como sistema).
- [ ] Los logs de la Function no incluyen datos sensibles de tarjeta ni payment methods completos.

## Dependencias

- **TASK-019:** Function `create-checkout` — crea las órdenes con `stripeSessionId` y metadata que este webhook usa para reconciliar.
- **TASK-006:** Schema transaccional — provee colecciones `orders` y `payments` con atributos e índices.

## Bloquea a

- **TASK-022:** Reconciliación de orden — actualiza `bookedCount` en slots y gestión de estado avanzada.
- **TASK-023:** Function `generate-ticket` — genera tickets tras pago confirmado (lee órdenes en estado `paid`).

## Riesgos y notas

- **Raw body parsing:** Appwrite Functions pueden tener el body ya parseado. Verificar que se puede acceder al raw body para la validación HMAC de Stripe. Si Appwrite parsea automáticamente, investigar cómo obtener el body original. Esto es un posible bloqueante técnico.
- **Retries de Stripe:** Stripe reenvía webhooks si no recibe 200 en ~60s. La Function debe ser rápida y retornar 200 antes de operaciones lentas. Si las operaciones DB son lentas, considerar retornar 200 primero y procesar async (aunque en Appwrite Functions esto no es trivial).
- **Orden de eventos:** Stripe no garantiza orden de delivery. Puede llegar `payment_intent.succeeded` antes de `checkout.session.completed`. La Function debe manejar ambos escenarios sin conflicto.
- **Testing:** Usar Stripe CLI (`stripe listen --forward-to`) para testing local. Documentar setup en README de la Function.
- **Webhook endpoint URL:** Configurar en Stripe Dashboard → Developers → Webhooks → Add endpoint. El URL será el endpoint de la Appwrite Function.
- **Events seleccionados en Stripe:** Configurar el webhook en Stripe para enviar solo los 4 event types necesarios, no todos los eventos posibles.
