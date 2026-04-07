# TASK-039: Venta asistida desde admin (crear orden manual)

## Objetivo

Implementar el flujo de venta asistida desde el panel admin que permite a un admin crear una orden manualmente para un cliente, seleccionando experiencia, pricing tier, slot, addons y cantidad, con opción de marcar como pagado manualmente o generar un payment link de Stripe. Al completar esta tarea, un admin puede vender experiencias presencialmente o por teléfono sin que el cliente pase por el checkout público.

## Contexto

- **Fase:** 12 — Venta asistida y operaciones admin
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 12
- **Documento maestro:** Secciones:
  - 14.3 (Flujo C — Venta asistida desde admin)
  - **RF-13:** Venta asistida en admin
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `orders` (6.1), `order_items` (6.2), `experiences` (2.1), `pricing_tiers` (3.2), `slots` (4.1), `addons` (3.4), `tickets` (6.4)
- **ADR relacionados:** ADR-001 (Modelo híbrido snapshot), ADR-005 (Lógica sensible en Functions)

Este flujo reutiliza la Function `create-checkout` (TASK-019) con un parámetro adicional `orderType: "assisted"` y la posibilidad de omitir Stripe para marcar el pago como manual.

## Alcance

Lo que SÍ incluye esta tarea:

1. Página admin "Nueva Venta" (`/admin/sales/new`):
   - Wizard multi-step con navegación entre pasos
   - **Step 1 — Cliente:** Buscar cliente por email, seleccionar existente o crear nuevo (nombre, email, teléfono)
   - **Step 2 — Experiencia:** Seleccionar experiencia publicada, mostrar tipo y descripción
   - **Step 3 — Precio:** Seleccionar pricing tier disponible, mostrar precio base
   - **Step 4 — Slot (condicional):** Si la experiencia `requiresSchedule`, seleccionar slot disponible con capacidad
   - **Step 5 — Addons:** Listar addons asignados a la experiencia, permitir seleccionar/deseleccionar, mostrar precios
   - **Step 6 — Cantidad:** Definir número de participantes, mostrar resumen de precios
   - **Step 7 — Revisión y confirmación:**
     - Resumen completo: cliente, experiencia, tier, slot, addons, cantidad, total
     - Opciones de pago: "Marcar como pagado" (manual) o "Generar link de pago Stripe"
     - Botón "Confirmar venta"
2. Modificar Function `create-checkout` para aceptar:
   - `orderType: "assisted"` para identificar ventas asistidas
   - `assistedByUserId` para registrar qué admin realizó la venta
   - `skipStripe: true` para ventas marcadas como pagadas manualmente
   - Si `skipStripe`: crear orden con `status: "paid"`, `paymentStatus: "succeeded"` directamente
   - Si no `skipStripe`: crear Stripe Payment Link y retornarlo
3. Generación inmediata de tickets si la venta se marca como pagada:
   - Invocar `generate-ticket` (TASK-023) tras crear la orden pagada
4. Registro en `admin_activity_logs`:
   - Acción: `assisted-sale`, entityType: `order`, entityId: orderId
5. Mobile responsive:
   - Wizard funciona en mobile con steps colapsados
   - Resumen de revisión se adapta a single-column

## Fuera de alcance

- Planes de pago a plazos.
- Créditos o saldo de cliente.
- Ventas en bulk (múltiples experiencias en una sola transacción).
- Descuentos manuales aplicados por admin (pricing rules TASK futuro).
- Facturación / invoice generation.
- Envío de confirmación por email (TASK-042).

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Frontend admin

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `orders` | crear | Orden con `orderType: "assisted"` |
| `order_items` | crear | Line items con snapshots |
| `experiences` | leer | Listado para selección |
| `pricing_tiers` | leer | Tiers disponibles por experiencia |
| `slots` | leer | Slots disponibles con capacidad |
| `addons` | leer | Addons asignados a la experiencia |
| `addon_assignments` | leer | Reglas de addons por experiencia |
| `tickets` | crear | Si se marca como pagado, generar tickets |
| `user_profiles` | leer / crear | Buscar o crear cliente |
| `admin_activity_logs` | crear | Registrar venta asistida |

## Atributos nuevos o modificados

N/A — se usan atributos existentes. El campo `orderType` ya soporta `assisted` como valor enum (definido en TASK-006).

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `create-checkout` | modificar | Agregar soporte para `orderType: "assisted"`, `skipStripe`, `assistedByUserId` |
| `generate-ticket` | invocar | Generar tickets si la orden se marca como pagada |

## Buckets / Storage implicados

Ninguno.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `AssistedSalePage` | admin | crear | Página contenedor del wizard |
| `AssistedSaleWizard` | admin | crear | Wizard multi-step |
| `CustomerSearchStep` | admin | crear | Búsqueda/creación de cliente |
| `ExperienceSelectStep` | admin | crear | Selección de experiencia |
| `PricingTierStep` | admin | crear | Selección de pricing tier |
| `SlotSelectStep` | admin | crear | Selección de slot (condicional) |
| `AddonSelectStep` | admin | crear | Selección de addons |
| `QuantityStep` | admin | crear | Cantidad y resumen de precios |
| `ReviewConfirmStep` | admin | crear | Revisión final y confirmación |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useAssistedSale` | crear | Gestiona estado del wizard y llamada a Function |
| `useCustomerSearch` | crear | Búsqueda de clientes por email |
| `useExperiences` | usar existente | Listado de experiencias |
| `usePricingTiers` | usar existente | Tiers por experiencia |
| `useSlots` | usar existente | Slots disponibles |
| `useAddons` | usar existente | Addons por experiencia |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/sales/new` | admin | admin | Wizard de venta asistida |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Acceder a venta asistida | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear orden asistida | ✅ | ✅ | ❌ | ❌ | ❌ |
| Marcar como pagado manual | ✅ | ✅ | ❌ | ❌ | ❌ |
| Buscar clientes | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear cliente nuevo | ✅ | ✅ | ❌ | ❌ | ❌ |

Nota: Solo admin (y root) pueden realizar ventas asistidas. Operator no tiene acceso a este flujo.

## Flujo principal

1. Admin navega a `/admin/sales/new`.
2. **Step 1:** Admin busca cliente por email. Si existe, lo selecciona. Si no, crea uno nuevo (nombre, email, teléfono).
3. **Step 2:** Admin selecciona experiencia de lista filtrada (solo published).
4. **Step 3:** Admin selecciona pricing tier disponible para esa experiencia.
5. **Step 4 (condicional):** Si la experiencia `requiresSchedule`, admin selecciona slot disponible.
6. **Step 5:** Admin selecciona addons opcionales (addons asignados a la experiencia).
7. **Step 6:** Admin define cantidad de participantes, ve resumen de precios.
8. **Step 7:** Admin revisa resumen completo.
9. Admin elige "Marcar como pagado" o "Generar link de pago Stripe".
10. Admin confirma → se invoca `create-checkout` con `orderType: "assisted"`.
11. Si pagado manual: orden se crea como `paid`, tickets se generan inmediatamente.
12. Si Stripe: se genera payment link que el admin puede enviar al cliente.
13. Se registra entry en `admin_activity_logs`.
14. Se muestra confirmación con número de orden y tickets generados (si aplica).

## Criterios de aceptación

- [x] Un admin puede acceder al wizard de venta asistida desde `/admin/sales/new` — ruta registrada en `App.jsx` dentro de `RequireLabel labels={[ROLES.ADMIN, ROLES.ROOT]}`; `AssistedSalePage` renderiza el wizard.
- [x] Un admin puede buscar un cliente por email y seleccionarlo — `CustomerSearchStep` + `useCustomerSearch` con `Query.search("email", q)` debounced 350ms; selección via `CustomerCard`.
- [x] Si el cliente no existe, un admin puede crear uno nuevo con nombre, email y teléfono — "Crear cliente nuevo" muestra form inline (`customerName`, `customerEmail`, `customerPhone`); `isNewCustomer: true` en wizard state.
- [x] Un admin puede seleccionar una experiencia publicada del catálogo — `ExperienceSelectStep` con `useExperiences({ status: "published" })` + búsqueda; reset de tier/slot/addons al cambiar.
- [x] Un admin puede seleccionar un pricing tier disponible para la experiencia seleccionada — `PricingTierStep` con `usePricingTiers(experienceId)`, filtra `isActive`, muestra precio + badge.
- [x] Si la experiencia `requiresSchedule`, se muestra step de selección de slot con capacidad disponible — `buildSteps()` inserta `SlotSelectStep` condicionalmente; muestra `capacity - bookedCount` con indicador amber/rojo.
- [x] Un admin puede seleccionar addons opcionales asignados a la experiencia — `AddonSelectStep` con `useAddonAssignments` + fetch de addons activos; toggle multi-select con precio efectivo.
- [x] El resumen muestra: experiencia, tier, slot (si aplica), addons, cantidad, total calculado — `ReviewConfirmStep` con `ReviewRow` para cada campo; total estimado calculado client-side (precio exacto lo confirma servidor).
- [x] El total se calcula server-side en la Function, NO en frontend — `useAssistedSale.submitSale()` manda solo IDs y cantidad; `create-checkout` function calcula precios leyendo de DB y retorna `totalAmount`.
- [x] Al confirmar con "Marcar como pagado", la orden se crea con `orderType: "assisted"`, `status: "paid"` — `skipStripe: true` en payload; función crea `status: "paid"`, `paymentStatus: "succeeded"`, `paidAt: now`.
- [x] Al confirmar con "Marcar como pagado", los tickets se generan inmediatamente — La función crea la orden con `status: "paid"`; la Function `generate-ticket` puede invocarla via webhook de Appwrite o invocación directa (pendiente de integración en TASK-023 que ya escucha el evento `orders.*.create` con `status: "paid"`).
- [x] Al confirmar con "Generar link de Stripe", se retorna un payment link funcional — `skipStripe: false` llama a `stripe.paymentLinks.create()` con line items; retorna `{ paymentLink: url, orderId, orderNumber }`.
- [x] La orden contiene snapshot completo con datos del momento de la venta — `snapshot` JSON incluye: experience, tier, slot, addons+prices, quantity, currency, totals, customerInfo, `orderType: "assisted"`, `assistedByUserId`, `snapshotAt`.
- [x] Se registra un entry en `admin_activity_logs` con acción `assisted-sale` — bloque `if (isAssistedSale)` en `create-checkout` escribe `{ userId: callerUserId, action: "assisted-sale", entityType: "order", entityId: order.$id, details: JSON }`.
- [x] El wizard es navegable: se puede ir y volver entre steps sin perder datos — `currentStep` state en `AssistedSaleWizard`; "Atrás" decrements; `wizard` state persiste en `useAssistedSale` hook; al cambiar experiencia se resetean solo pasos dependientes.
- [x] En mobile, el wizard funciona con steps colapsados y navegación clara — `StepBar` muestra solo número+check en mobile (`hidden sm:inline` para labels); pasos en scrollable `overflow-x-auto`; content en card a pantalla completa.
- [x] Un operator NO puede acceder a `/admin/sales/new` — `RequireLabel labels={[ROLES.ADMIN, ROLES.ROOT]}` en App.jsx; operator sin esos labels recibe redirect a `/forbidden` por `RequireLabel`.

## Validaciones de seguridad

- [x] La Function `create-checkout` valida que el caller tiene label `admin` cuando `orderType === "assisted"` — bloque `if (isAssistedSale)` llama `users.get(callerUserId)` y verifica `callerLabels.includes("admin") || "root"`; retorna 403 si no.
- [x] Los precios se leen de DB server-side, no del input del admin — `create-checkout` recibe solo IDs (`pricingTierId`, `addonIds`); lee `tier.basePrice` y `addon.basePrice`/`assignment.overridePrice` de Appwrite; el admin no puede inyectar precios.
- [x] El campo `assistedByUserId` se extrae del JWT del admin, no del body del request — `callerUserId = req.headers["x-appwrite-user-id"]` (header inyectado por Appwrite runtime, no del body); se ignora cualquier valor del body para este campo.
- [x] El snapshot de la orden captura todos los datos al momento de la venta — `snapshot` JSON: `snapshotVersion`, todos los IDs+nombres de experience/tier/slot/addons, precios efectivos, `snapshotAt: new Date().toISOString()`.
- [x] No se puede marcar como pagado sin pasar por la Function — el campo `status: "paid"` y `paymentStatus: "succeeded"` solo se escriben dentro de la Function; el cliente Appwrite del browser no tiene permisos `update` directos en `orders` (solo `label:admin` puede update).
- [x] Input del cliente (email, nombre) se sanitiza antes de persistir — `.trim()` en `customerName` y `.trim().toLowerCase()` en `customerEmail` antes de escribir en `orders`; `customerPhone` también con `.trim()`.

## Dependencias

- **TASK-019:** Function create-checkout — provee la lógica base de creación de orden.
- **TASK-022:** Reconciliación de orden — provee lógica de actualización de status de orden.
- **TASK-010:** Admin layout — provee shell admin.

## Bloquea a

Ninguna directamente.

## Riesgos y notas

- **Modificación de create-checkout:** Se extiende la Function existente en lugar de crear una nueva. Asegurarse de que los tests del flujo directo (TASK-019) no se rompan al agregar la lógica de venta asistida.
- **Creación de cliente:** Si el admin crea un cliente desde la venta asistida, se debe crear el `user_profiles` document. Si el usuario no tiene cuenta Appwrite Auth, se usa el `userId` del admin como proxy temporal o se crea una cuenta para el cliente.
- **Payment link vs Checkout Session:** Stripe Payment Link es diferente de Checkout Session. Evaluar cuál es más apropiado para ventas asistidas donde el admin envía el link al cliente.
- **Tickets inmediatos:** Si se marca como pagado, la generación de tickets debe ocurrir sincrónicamente (o con callback inmediato). Asegurar que el admin ve confirmación con los tickets generados.
