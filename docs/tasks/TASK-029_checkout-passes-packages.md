# TASK-029: Checkout adaptado para pases y paquetes

## Objetivo

Extender la Function `create-checkout` y la UI de checkout para soportar la compra de pases consumibles (`saleMode: pass`) y paquetes de experiencia. Al completar esta tarea, un cliente puede comprar un pase de N créditos o un paquete completo vía Stripe, y tras pago confirmado, el sistema genera `user_passes` o tickets/beneficios según corresponda.

## Contexto

- **Fase:** 8 — Pases y paquetes
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 8
- **Documento maestro:** Sección 7.5-7.6, RF-06 (Checkout — paquetes), RF-07 (Pagos — pases), RF-12, RF-13
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `orders` (6.1), `order_items` (6.2), `user_passes` (6.7), `passes` (3.8), `packages` (3.6), `package_items` (3.7), `tickets` (6.4)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Comercial (read) → Transaccional (write via Function)
- **ADR relacionados:** ADR-001 (Snapshots) — órdenes de pase/paquete contienen snapshot completo; ADR-005 (Lógica sensible en Functions) — el fulfillment se ejecuta server-side

## Alcance

Lo que SÍ incluye esta tarea:

### Backend — Extend `create-checkout` Function

1. Aceptar nuevo campo `checkoutType`: `"experience"` (default, existente), `"pass"`, `"package"`.
2. **Flow para `checkoutType: "pass"`:**
   - Input: `passId` (string, requerido).
   - Validar: pass exists, `status === "active"`.
   - Leer `basePrice`, `currency`, `totalCredits` del pass.
   - Crear `orders` con `orderType = "direct"`, `snapshot` incluyendo pass data.
   - Crear `order_items` con `itemType = "pass"`, `referenceId = passId`, `unitPrice = pass.basePrice`.
   - Crear Stripe Checkout Session con pass como line item.
   - Retornar `{ sessionUrl, orderId }`.

3. **Flow para `checkoutType: "package"`:**
   - Input: `packageId` (string, requerido), `slotId` (string, opcional — si el paquete requiere agenda).
   - Validar: package exists, `status === "published"`.
   - Leer `totalPrice`, `currency`, package items.
   - Crear `orders` con `snapshot` incluyendo package + items data.
   - Crear `order_items` con `itemType = "package"`, `referenceId = packageId`, `unitPrice = package.totalPrice`.
   - Crear Stripe Checkout Session.
   - Retornar `{ sessionUrl, orderId }`.

4. **Fulfillment post-pago (extend webhook handler or generate-ticket):**
   - Para pass orders: create `user_passes` document with `userId`, `passId`, `orderId`, `totalCredits`, `remainingCredits = totalCredits`, `status = "active"`, `activatedAt = now()`, `expiresAt` (calculated from `validityDays`), `passSnapshot`.
   - Para package orders: iterate package items, generate tickets for items of type `experience` that have referenceId, create bookings if slotId provided.

### Frontend — Extend Checkout UI

5. **Pass checkout flow:**
   - Pass selection page or CTA from pass listing.
   - Confirm screen: pass name, credits, price, description.
   - Proceed to Stripe checkout.

6. **Package checkout flow:**
   - Package selection page or CTA from package detail.
   - Confirm screen: package name, inclusions list, total price.
   - Optional slot selection if package requires it.
   - Proceed to Stripe checkout.

7. **Success page:** Already handled by TASK-025 — extend to show pass or package confirmation details.

## Fuera de alcance

- Consumo de pase (redención de créditos) — TASK-027.
- Partial package fulfillment (fulfill some items now, others later).
- Multiple passes in a single checkout.
- Package customization (selecting specific items or swapping experiences).
- Pass renewal or extension.
- Coupon/discount codes for passes or packages.
- Tax calculation for passes/packages.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Comercial (pricing, addons, paquetes, pases)
- [x] Frontend público

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `passes` | leer | Validar pass type, leer precio |
| `packages` | leer | Validar package, leer precio total |
| `package_items` | leer | Leer items del paquete para snapshot y fulfillment |
| `orders` | crear | Crear orden con snapshot de pass o package |
| `order_items` | crear | Crear line items |
| `user_passes` | crear | Crear instancia de pase comprado (post-pago) |
| `tickets` | crear | Generar tickets para package items de tipo experience (post-pago) |
| `bookings` | crear | Crear bookings si hay slot (post-pago) |
| `slots` | leer / actualizar | Verificar disponibilidad; incrementar bookedCount |

## Atributos nuevos o modificados

N/A — se usan atributos existentes definidos en el data model.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `create-checkout` | modificar | Extender para soportar `checkoutType = "pass"` y `"package"` |
| `generate-ticket` | modificar | Extender para fulfillment de paquetes y creación de user_passes |

## Buckets / Storage implicados

N/A.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `PassCheckout` | público | crear | Confirm screen para compra de pase |
| `PackageCheckout` | público | crear | Confirm screen para compra de paquete |
| `CheckoutSuccess` | público | modificar | Extender para mostrar confirmación de pass/package |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `usePassCheckout` | crear | Invoca create-checkout con checkoutType=pass |
| `usePackageCheckout` | crear | Invoca create-checkout con checkoutType=package |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/checkout/pass/:passId` | público | `client` | Checkout de pase |
| `/checkout/package/:packageId` | público | `client` | Checkout de paquete |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Comprar pase via checkout | ✅ | ✅ | ✅ | ✅ | ❌ |
| Comprar paquete via checkout | ✅ | ✅ | ✅ | ✅ | ❌ |

## Flujo principal

### Pass Checkout
1. Cliente navega a `/checkout/pass/:passId`.
2. Frontend muestra confirm screen: nombre del pase, créditos, precio, vigencia, experiencias válidas.
3. Cliente confirma y click "Pagar".
4. Frontend invoca `create-checkout` con `{ checkoutType: "pass", passId }`.
5. Function valida pass, crea orden con snapshot, crea Stripe session.
6. Frontend redirige a Stripe.
7. Tras pago, webhook procesa → `generate-ticket` (o lógica extendida) crea `user_passes` doc.
8. Success page muestra confirmación del pase comprado.

### Package Checkout
1. Cliente navega a `/checkout/package/:packageId`.
2. Frontend muestra confirm screen: nombre del paquete, inclusiones, precio total.
3. Si requiere slot: selector de fecha/hora.
4. Cliente confirma y click "Pagar".
5. Frontend invoca `create-checkout` con `{ checkoutType: "package", packageId, slotId? }`.
6. Function valida, crea orden con snapshot de paquete + items, crea Stripe session.
7. Frontend redirige a Stripe.
8. Tras pago, fulfillment genera tickets para items de tipo experience.
9. Success page muestra confirmación con inclusiones.

## Criterios de aceptación

- [ ] La Function `create-checkout` acepta `checkoutType = "pass"` con `passId` y crea orden + Stripe session correctamente.
- [ ] La Function `create-checkout` acepta `checkoutType = "package"` con `packageId` y crea orden + Stripe session correctamente.
- [ ] Para pass checkout: la orden contiene snapshot con datos del tipo de pase (nombre, créditos, precio, vigencia).
- [ ] Para package checkout: la orden contiene snapshot con datos del paquete y lista de items incluidos.
- [ ] Los precios se leen del servidor (pass.basePrice, package.totalPrice) — nunca del input del cliente.
- [ ] Tras pago confirmado de un pase, se crea `user_passes` con `totalCredits`, `remainingCredits = totalCredits`, `status = "active"`, `activatedAt`, `expiresAt` calculado.
- [ ] El `passSnapshot` del user_passes contiene datos inmutables del tipo de pase al momento de compra.
- [ ] Tras pago confirmado de un paquete, se generan tickets para items de tipo `experience` que tengan `referenceId`.
- [ ] La UI de pass checkout muestra: nombre, créditos, precio, vigencia, experiencias válidas.
- [ ] La UI de package checkout muestra: nombre, inclusiones (items), precio total.
- [ ] El checkout redirige correctamente a Stripe y el redirect de éxito funciona.
- [ ] La success page muestra datos específicos según el tipo de compra (experiencia, pase o paquete).
- [ ] La UI de checkout es responsive en mobile (< 640px).
- [ ] Un usuario no autenticado es redirigido al login antes del checkout.
- [ ] Si el pass o package no existe o no está activo/publicado, la Function retorna 400 con mensaje descriptivo.

## Validaciones de seguridad

- [ ] JWT del caller verificado server-side en `create-checkout`.
- [ ] Precios leídos exclusivamente de DB (pass.basePrice, package.totalPrice), nunca del input.
- [ ] Pass validado: existe, `status === "active"`.
- [ ] Package validado: existe, `status === "published"`.
- [ ] La Function no expone stack traces ni detalles internos en errores.
- [ ] Stripe API key en environment variables.
- [ ] El fulfillment post-pago (user_passes, tickets) se ejecuta server-side, no desde frontend.
- [ ] Los snapshots preservan datos inmutables para integridad histórica.

## Dependencias

- **TASK-019:** Function `create-checkout` — base a extender.
- **TASK-020:** UI de checkout — base a extender.
- **TASK-021:** Function `stripe-webhook` — procesa pagos.
- **TASK-023:** Function `generate-ticket` — se extiende para fulfillment de paquetes.
- **TASK-026:** CRUD pases admin — provee tipos de pase configurados.
- **TASK-028:** CRUD paquetes admin — provee paquetes configurados.

## Bloquea a

- **TASK-033:** Mis pases en portal — requiere user_passes generados tras compra.

## Riesgos y notas

- **Fulfillment placement:** Decidir si el fulfillment de pases y paquetes vive dentro de `generate-ticket` (extendido) o en una Function separada `fulfill-order`. En v1, extender `generate-ticket` para manejar `pass` y `package` order items junto con `experience` items.
- **Package sin slot:** En v1, un paquete puede comprarse sin slot si no requiere agenda inmediata. Los tickets para items de tipo `experience` sin slot quedan como "pendientes de asignar slot" (edge case a definir).
- **Pass vigencia:** `expiresAt` se calcula como `activatedAt + validityDays`. Si `validityDays` es null, `expiresAt` permanece null (pase sin expiración).
- **Multiple quantity:** En v1, no se permite comprar 2 unidades del mismo pase en una orden. Un pase = una compra. Esto simplifica el fulfillment.
- **Stripe line items:** Verificar que Stripe acepta line items para "pase" y "paquete" como productos genéricos (price_data con unit_amount).
