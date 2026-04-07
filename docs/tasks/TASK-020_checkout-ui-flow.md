# TASK-020: UI de checkout — selección de slot, cantidad, addons, datos, pago

## Objetivo

Crear la interfaz de checkout en `/checkout` que guía al usuario paso a paso por la selección de slot, cantidad de asistentes, addons opcionales, datos del comprador y resumen final antes de redirigir al pago con Stripe. Al completar esta tarea, un visitante autenticado puede completar la compra de una experiencia con `saleMode === "direct"` de forma fluida y segura.

## Contexto

- **Fase:** 5 — Checkout
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 5
- **Documento maestro:** Secciones 14.1 (Flujo A — compra directa), RF-08 (Checkout), RF-10 (Órdenes)
- **Modelo de datos:** Mismo que TASK-019 — la UI consume la Function `create-checkout` y lee datos de experiencias, tiers, slots, addons
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Checkout: Comercial (read) + Agenda (read) → Transaccional (write via Function)
- **ADR relacionados:** ADR-005 (Lógica sensible en Functions) — el frontend NO calcula el total final; llama a la Function que retorna la Stripe session URL
- **RF relacionados:** RF-06, RF-08

El checkout es mobile-first con stepper/accordion. El total que se muestra al usuario es indicativo — el total real lo calcula la Function `create-checkout` server-side. El frontend envía la intención y confía en la respuesta de la Function para redirigir a Stripe.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear página `CheckoutPage` en `/checkout` (requiere auth).
2. Recibir parámetros de entrada vía URL search params o state de navegación: `experienceId`, `pricingTierId` (pre-seleccionados desde detalle).
3. Step 1 — Review selection:
   - Mostrar experiencia seleccionada (nombre, imagen, tipo)
   - Mostrar tier seleccionado (nombre, precio)
   - Si `requiresSchedule`: selector de slot (dropdown/calendar con slots disponibles)
   - Selector de cantidad (respetando `minQuantity` / `maxQuantity`)
4. Step 2 — Select addons:
   - Mostrar addons disponibles para la experiencia (desde `addon_assignments`)
   - Toggle on/off por addon
   - Si addon permite cantidad, mostrar selector de cantidad
   - Addons con `isRequired === true` pre-seleccionados y no deseleccionables
   - Addons con `isDefault === true` pre-seleccionados pero deseleccionables
5. Step 3 — Customer info:
   - Campos: nombre completo, email, teléfono (opcional)
   - Si autenticado: pre-llenar desde `user_profiles` (si hay datos)
   - Validación inline de campos requeridos y formato de email
6. Step 4 — Order summary:
   - Desglose indicativo: experiencia × quantity, addons, subtotal, total
   - Disclaimer: "El total será verificado antes del pago"
   - Botón "Pagar con Stripe" / "Confirmar y pagar"
7. Al confirmar:
   - Call a Function `create-checkout` con todos los datos
   - Mostrar loading state
   - On success: redirect a `sessionUrl` de Stripe
   - On error: mostrar mensaje de error y permitir retry
8. Crear página `CheckoutSuccessPage` en `/checkout/success`:
   - Recibir `session_id` de URL params
   - Mostrar confirmación: "¡Gracias por tu compra!"
   - Mostrar `orderId` o `orderNumber` si disponible
   - Link a portal de cliente
9. Crear página `CheckoutCancelPage` en `/checkout/cancel`:
   - Mostrar mensaje: "Tu compra fue cancelada"
   - Link para volver a intentar o explorar experiencias
10. Mobile-first layout: stepper/accordion en mobile, sidebar de resumen en desktop.

## Fuera de alcance

- Compra de pases o paquetes.
- Flow de `request` (solicitud antes de pago).
- Flow de `assisted` (venta desde admin).
- Saved payment methods / wallet.
- Guest checkout (sin autenticación).
- Cupones, promo codes, descuentos.
- Multi-currency within one checkout.
- Persistencia de carrito entre sesiones (el checkout es por sesión).
- Email de confirmación (post-webhook).

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- Nota: clasificado como **Frontend público + Transaccional** en el plan maestro.

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experiences` | leer | Mostrar datos de la experiencia seleccionada |
| `pricing_tiers` | leer | Mostrar tier seleccionado y precio |
| `slots` | leer | Mostrar slots disponibles para selección |
| `addon_assignments` | leer | Determinar qué addons están disponibles |
| `addons` | leer | Mostrar nombre, descripción, precio de addons |
| `user_profiles` | leer | Pre-llenar datos del comprador (si autenticado) |
| `orders` | crear (via Function) | La Function crea la orden — el frontend no escribe directamente |
| `order_items` | crear (via Function) | La Function crea los items — el frontend no escribe directamente |

## Atributos nuevos o modificados

N/A — no se modifican tablas.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `create-checkout` | invocar | Se llama con los datos de la compra; retorna `sessionUrl` |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Bucket de imágenes | leer | Preview URL de la experiencia seleccionada |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `CheckoutPage` | público | crear | Página principal del checkout con stepper |
| `CheckoutStepper` | público | crear | Navegación por steps (step indicator) |
| `SelectionStep` | público | crear | Step 1: review experiencia, tier, slot, cantidad |
| `AddonsStep` | público | crear | Step 2: selección de addons |
| `CustomerInfoStep` | público | crear | Step 3: datos del comprador |
| `OrderSummaryStep` | público | crear | Step 4: resumen y botón de pago |
| `OrderSummary` | público | crear | Sidebar/bottom sheet con desglose de orden |
| `SlotSelector` | público | crear | Dropdown/calendar de slots disponibles |
| `QuantitySelector` | público | crear | Selector +/- de cantidad |
| `AddonToggle` | público | crear | Toggle on/off para un addon |
| `CheckoutSuccessPage` | público | crear | Página de confirmación post-pago |
| `CheckoutCancelPage` | público | crear | Página de cancelación |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useCheckout` | crear | Estado del checkout: experiencia, tier, slot, addons, quantity, customer info |
| `useExperienceDetail` | leer (usar existente) | Reutilizar de TASK-018 para cargar datos de la experiencia |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/checkout` | público | `RequireAuth` | Checkout — requiere autenticación |
| `/checkout/success` | público | ninguno | Confirmación post-pago |
| `/checkout/cancel` | público | ninguno | Cancelación de pago |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Acceder a `/checkout` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Completar compra | ✅ | ✅ | ✅ | ✅ | ❌ |
| Ver `/checkout/success` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver `/checkout/cancel` | ✅ | ✅ | ✅ | ✅ | ✅ |

## Flujo principal

1. El usuario hace click en CTA "Reservar ahora" desde el detalle de experiencia (TASK-018).
2. Navega a `/checkout?experienceId=X&pricingTierId=Y` (o via state).
3. Step 1: ve la experiencia y tier seleccionados; si `requiresSchedule`, selecciona un slot; ajusta cantidad.
4. Step 2: ve addons disponibles; toggle on/off por addon; addons requeridos ya están activados.
5. Step 3: ingresa nombre, email, teléfono; campos pre-llenados si hay perfil.
6. Step 4: ve resumen completo indicativo; hace click en "Confirmar y pagar".
7. El frontend llama a `create-checkout` con todos los datos.
8. La Function retorna `{ sessionUrl, orderId }`.
9. El frontend redirige a `sessionUrl` (Stripe Checkout).
10. Tras pago exitoso, Stripe redirige a `/checkout/success?session_id={id}`.
11. Si el usuario cancela en Stripe, redirige a `/checkout/cancel`.

## Criterios de aceptación

- [ ] La página `/checkout` requiere autenticación — usuarios anónimos son redirigidos a `/login`.
- [ ] Si se accede a `/checkout` sin parámetros de experiencia, se muestra error y link para explorar experiencias.
- [ ] El Step 1 muestra la experiencia y tier seleccionados con nombre, imagen y precio.
- [ ] Si la experiencia `requiresSchedule`, el Step 1 muestra un selector de slots disponibles (solo `status === "available"` y futuros).
- [ ] El selector de cantidad respeta `minQuantity` y `maxQuantity` de la experiencia.
- [ ] El Step 2 muestra addons disponibles con toggle y precio.
- [ ] Addons con `isRequired === true` están pre-seleccionados y no se pueden deseleccionar.
- [ ] Addons con `isDefault === true` están pre-seleccionados pero se pueden deseleccionar.
- [ ] El Step 3 valida nombre y email como requeridos, email con formato válido.
- [ ] Si el usuario tiene `user_profiles`, los campos se pre-llenan.
- [ ] El Step 4 muestra desglose indicativo: experiencia, addons, subtotal, total.
- [ ] Al hacer click en "Confirmar y pagar", se muestra loading state y se llama a `create-checkout`.
- [ ] Si la Function retorna error, se muestra mensaje descriptivo y se permite reintentar.
- [ ] Si la Function retorna éxito, el usuario es redirigido a la URL de Stripe Checkout.
- [ ] La página `/checkout/success` muestra mensaje de confirmación y link al portal.
- [ ] La página `/checkout/cancel` muestra mensaje de cancelación y link para volver.
- [ ] En mobile (< 768px), el checkout se muestra como accordion/stepper vertical; el resumen como bottom sheet.
- [ ] En desktop (≥ 1024px), el resumen se muestra como sidebar fijo a la derecha.

## Validaciones de seguridad

- [ ] El frontend NO calcula el total final para el pago — el total lo calcula la Function `create-checkout` (ADR-005).
- [ ] El total indicativo mostrado en el resumen es solo orientativo — el real lo determina la Function + Stripe.
- [ ] Los datos del comprador (email, teléfono) se envían a la Function, no se usan para crear documentos directamente desde el frontend.
- [ ] La URL de Stripe Checkout viene de la Function, nunca se construye en el frontend.
- [ ] El `session_id` de la URL de success no se usa para marcar la orden como pagada — eso lo hace el webhook (TASK-021).

## Dependencias

- **TASK-018:** Detalle de experiencia — provee CTA que navega al checkout con parámetros.
- **TASK-019:** Function `create-checkout` — provee el endpoint que crea la orden y retorna la Stripe session URL.
- **TASK-016:** Public layout — provee `PublicLayout` como shell.
- **TASK-009:** Route guards — provee `RequireAuth` para proteger `/checkout`.

## Bloquea a

- **TASK-021:** Function stripe-webhook — procesa el pago generado desde el checkout.
- **TASK-022:** Reconciliación de orden — actualiza orden post-pago.

## Riesgos y notas

- **experienceId/pricingTierId en URL:** Si el usuario manipula los search params, la Function validará everything server-side. El frontend debe manejar gracefully que la experiencia o tier no exista (mostrar error).
- **Slot lock:** No hay reserva temporal de slot durante el checkout. Si otro usuario compra el último cupo mientras este usuario está en el checkout, la Function retornará error de capacidad insuficiente. Mostrar mensaje claro: "El horario seleccionado ya no tiene cupos. Por favor selecciona otro."
- **Pre-llenado de perfil:** Si `user_profiles` no tiene datos (usuario recién registrado), los campos se muestran vacíos.
- **Total indicativo vs real:** Documentar en la UI que el total es indicativo. El total real lo calcula la Function y es lo que Stripe cobra.
- **Stripe Checkout hosted:** Se usa Stripe Checkout (hosted, no embedded elements). El flujo redirige fuera de OMZONE y luego regresa.
- **Handling de back button:** Si el usuario navega "atrás" desde Stripe, puede volver al checkout con estado stale. Considerar resetear formulario o detectar orden ya creada.
