# TASK-019: Function create-checkout — validación, snapshot, Stripe session

## Objetivo

Crear la Appwrite Function `create-checkout` que recibe la intención de compra del cliente, valida todos los datos server-side, lee precios de la base de datos, calcula el total, crea la orden con snapshot completo, genera los order items y crea una Stripe Checkout Session. Al completar esta tarea, el flujo de compra tiene una Function segura que garantiza integridad de precios y datos transaccionales.

## Contexto

- **Fase:** 5 — Checkout
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 5
- **Documento maestro:** Secciones 14.1 (Flujo A — compra directa), RF-08 (Checkout), RF-10 (Órdenes)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `orders` (6.1), `order_items` (6.2), `pricing_tiers` (3.2), `addons` (3.4), `addon_assignments` (3.5), `slots` (4.1), `experiences` (2.1)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Checkout: Comercial (read) + Agenda (read) → Transaccional (write via Function)
- **ADR relacionados:** ADR-001 (Modelo híbrido relacional + snapshot) — la orden y order items deben contener snapshots JSON inmutables; ADR-005 (Lógica sensible en Functions) — el frontend NUNCA calcula precios, solo envía intención
- **RF relacionados:** RF-06, RF-08, RF-10

Esta Function es la pieza de seguridad más crítica del flujo transaccional. Los precios se leen exclusivamente del servidor, el total se calcula en la Function, y los snapshots capturan el estado exacto de la compra para integridad histórica.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear Appwrite Function `create-checkout` con trigger HTTP (POST).
2. Validar JWT del usuario autenticado (Appwrite SDK server-side).
3. Validar input del request body:
   - `experienceId` (string, requerido)
   - `pricingTierId` (string, requerido)
   - `slotId` (string, opcional — requerido si experiencia `requiresSchedule`)
   - `addonIds` (array de strings, opcional)
   - `quantity` (integer, requerido, ≥ 1)
   - `customerName` (string, requerido)
   - `customerEmail` (string, requerido, formato email)
   - `customerPhone` (string, opcional)
4. Validar existencia y estado de entidades:
   - Experiencia existe y `status === "published"` y `saleMode === "direct"`
   - Pricing tier existe, pertenece a la experiencia, y `isActive === true`
   - Slot existe, pertenece a la experiencia, `status === "available"`, `startDatetime` es futuro, y tiene capacidad (`capacity - bookedCount >= quantity`)
   - Addons existen, están activos, y tienen `addon_assignments` válidas para la experiencia
5. Leer precios de DB server-side:
   - `basePrice` del pricing tier
   - `basePrice` de cada addon (o `overridePrice` del addon_assignment si existe)
6. Calcular:
   - Subtotal experiencia = `tier.basePrice × quantity`
   - Subtotal addons = suma de `addon.basePrice × quantity` (o per-unit según `priceType`)
   - Tax = 0 (configurable futuro)
   - Total = subtotal + addons + tax
7. Generar `orderNumber` con formato `OMZ-YYYYMMDD-NNN`.
8. Crear documento `orders` con:
   - `userId`, `orderNumber`, `orderType = "direct"`, `status = "pending"`, `paymentStatus = "pending"`
   - `currency`, `subtotal`, `taxAmount`, `totalAmount`
   - `customerName`, `customerEmail`
   - `snapshot` — JSON completo con: experiencia, tier, slot, addons, quantities, precios al momento
9. Crear documentos `order_items`:
   - Un item para la experiencia principal con `itemSnapshot`
   - Un item por cada addon seleccionado con `itemSnapshot`
10. Crear Stripe Checkout Session con:
    - `line_items` que coinciden con los order items calculados
    - `mode: "payment"`
    - `success_url` → `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    - `cancel_url` → `/checkout/cancel`
    - `metadata` con `orderId` para reconciliación en webhook
    - `client_reference_id` → `orderId`
11. Actualizar orden con `stripeSessionId`.
12. Retornar `{ sessionUrl, orderId }` al frontend.
13. Manejo de errores con códigos HTTP apropiados (400, 401, 404, 409, 500).
14. Idempotencia: si se detecta orden pending duplicada para el mismo usuario + experiencia + tier + slot, retornar la sesión existente en lugar de crear una nueva.

## Fuera de alcance

- Sale modes `request`, `assisted`, `pass` — futuras tasks.
- Webhook de Stripe (TASK-021).
- Generación de tickets (TASK-023).
- Pricing rules (early-bird, promo codes, quantity discounts) — futura.
- Tax calculation real (IVA/ISR) — placeholder en 0.
- Refunds, cancel order.
- Email de confirmación.
- Multiple currencies en un mismo checkout.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Comercial (pricing, addons, paquetes, pases)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experiences` | leer | Validar existencia, status, saleMode |
| `pricing_tiers` | leer | Validar tier activo, leer basePrice |
| `slots` | leer | Validar disponibilidad y capacidad |
| `addon_assignments` | leer | Validar addons asignados a la experiencia |
| `addons` | leer | Leer precios de addons |
| `orders` | crear | Crear orden con snapshot |
| `order_items` | crear | Crear line items con itemSnapshot |

## Atributos nuevos o modificados

N/A — todas las tablas existen por TASK-006. Se usan los atributos definidos en el data model.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `create-checkout` | crear | Function HTTP POST para crear orden y Stripe session |

## Buckets / Storage implicados

N/A.

## Componentes frontend implicados

N/A — esta tarea es backend-only. El frontend que consume esta Function es TASK-020.

## Hooks implicados

N/A.

## Rutas implicadas

N/A — la Function expone un endpoint HTTP gestionado por Appwrite.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Invocar `create-checkout` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Crear orden propia | ✅ | ✅ | ✅ | ✅ | ❌ |

## Flujo principal

1. El frontend envía POST a `create-checkout` con: `experienceId`, `pricingTierId`, `slotId`, `addonIds`, `quantity`, `customerName`, `customerEmail`.
2. La Function verifica JWT del usuario autenticado.
3. La Function valida input (tipos, formato, campos requeridos).
4. La Function lee la experiencia de DB → valida `status === "published"` y `saleMode === "direct"`.
5. La Function lee el pricing tier → valida que pertenece a la experiencia y `isActive === true`.
6. Si `slotId` presente: la Function lee el slot → valida disponibilidad, capacidad, experienceId match.
7. Si `addonIds` presentes: la Function valida cada addon y su assignment a la experiencia.
8. La Function calcula subtotal, tax, total server-side desde precios en DB.
9. La Function genera `orderNumber` y crea documento `orders` con `status = "pending"` y snapshot JSON completo.
10. La Function crea documentos `order_items` con `itemSnapshot` por cada item.
11. La Function crea Stripe Checkout Session con line items y metadata.
12. La Function actualiza orden con `stripeSessionId`.
13. La Function retorna `{ sessionUrl, orderId }`.
14. El frontend redirige al usuario a `sessionUrl`.

## Criterios de aceptación

- [ ] La Function `create-checkout` existe como Appwrite Function con trigger HTTP.
- [ ] La Function valida JWT del usuario y rechaza requests sin sesión (401).
- [ ] La Function valida todos los campos requeridos y retorna 400 con mensaje descriptivo si faltan.
- [ ] La Function valida que `customerEmail` tiene formato de email válido.
- [ ] La Function valida que la experiencia existe, está publicada y tiene `saleMode === "direct"`.
- [ ] La Function valida que el pricing tier pertenece a la experiencia y está activo.
- [ ] Si la experiencia `requiresSchedule === true` y no se envía `slotId`, retorna 400.
- [ ] La Function valida que el slot tiene capacidad suficiente (`capacity - bookedCount >= quantity`).
- [ ] Los precios se leen EXCLUSIVAMENTE de la base de datos — nunca del input del cliente.
- [ ] El cálculo de total es: `(tier.basePrice × quantity) + Σ(addon.price × quantity) + tax`.
- [ ] Se crea un documento `orders` con `status = "pending"`, `paymentStatus = "pending"` y `snapshot` JSON completo.
- [ ] El `snapshot` contiene: experiencia (id, publicName, type), tier (id, name, basePrice), slot (id, startDatetime, endDatetime), addons (id, name, basePrice), quantity, totales.
- [ ] Se crean documentos `order_items` con `itemSnapshot` por cada item (experiencia principal + cada addon).
- [ ] Se crea una Stripe Checkout Session con `line_items` que reflejan los montos calculados.
- [ ] La Stripe Session tiene `metadata.orderId` para reconciliación en webhook.
- [ ] La Function retorna `{ sessionUrl, orderId }` con status 200.
- [ ] Si ocurre un error en Stripe, la Function retorna 500 y la orden queda en `status = "pending"`.
- [ ] La Function es idempotente: si existe una orden pending para el mismo usuario + experiencia + tier + slot, retorna la sesión existente.

## Validaciones de seguridad

- [ ] JWT del usuario verificado server-side via Appwrite SDK (`req.headers` / session token).
- [ ] Precios leídos de DB, NUNCA del input del cliente (ADR-005).
- [ ] Input sanitizado: strings trimmed, integers validados, arrays validados como arrays.
- [ ] Experiencia, tier, slot y addons validados por existencia y estado antes de cualquier operación de escritura.
- [ ] El `orderId` en metadata de Stripe no es guessable — se usa `$id` autogenerado por Appwrite.
- [ ] La Function no expone stack traces ni detalles internos de error al cliente.
- [ ] Stripe API key se lee de environment variables, nunca hardcodeada.
- [ ] La Function verifica que `quantity` está dentro de `minQuantity` / `maxQuantity` de la experiencia.

## Dependencias

- **TASK-003:** Schema editorial — provee `experiences`.
- **TASK-004:** Schema comercial — provee `pricing_tiers`, `addons`, `addon_assignments`.
- **TASK-005:** Schema agenda — provee `slots`.
- **TASK-006:** Schema transaccional — provee `orders`, `order_items`.

## Bloquea a

- **TASK-020:** UI de checkout — consume el endpoint `create-checkout`.
- **TASK-021:** Function stripe-webhook — procesa los eventos generados por la Stripe Session creada aquí.
- **TASK-022:** Reconciliación de orden — actualiza la orden creada aquí tras pago confirmado.

## Riesgos y notas

- **Race conditions en slot capacity:** Si dos usuarios compran al mismo tiempo el último cupo, ambos podrían pasar la validación. Mitigación: la reconciliación post-pago (TASK-022) hace el incremento de `bookedCount` — si en ese punto se excede la capacidad, se debe manejar como overbooking. Alternativa: usar operación atómica de increment si Appwrite 1.9.0 lo soporta.
- **Snapshot size:** Una orden con múltiples addons puede generar un snapshot grande. Limitar a 50KB (cubre ~50 items holgadamente). Incluir `snapshotVersion: 1` en el JSON para versionado futuro.
- **orderNumber generation:** El formato `OMZ-YYYYMMDD-NNN` requiere un contador diario. Opciones: contar órdenes del día, o usar un sufijo aleatorio (ej: `OMZ-20260405-A7K`). El sufijo aleatorio es más seguro frente a concurrencia.
- **Stripe API key:** Configurar `STRIPE_SECRET_KEY` como variable de entorno en Appwrite Function settings. Verificar que no se filtra en logs.
- **Moneda:** En v1, asumir moneda única (MXN o USD) por checkout. No mezclar monedas dentro de una misma orden.
- **Cold start:** La Function puede tardar ~2s en cold start. Aceptable para checkout. Documentar para el frontend que muestre loading state.
