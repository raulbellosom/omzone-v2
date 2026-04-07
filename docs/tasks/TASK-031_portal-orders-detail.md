# TASK-031: Mis órdenes y detalle de orden

## Objetivo

Implementar la sección "Mis Órdenes" en el portal de cliente, mostrando el historial de órdenes del usuario con filtros por status y una vista detalle que reconstruye la compra desde el snapshot. Al completar esta tarea, un cliente puede consultar todas sus compras, ver los detalles exactos de cada orden (experiencia, tier, addons, precios) y acceder a sus tickets asociados.

## Contexto

- **Fase:** 9 — Portal de cliente
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 9
- **Documento maestro:** Sección 3.2 (Portal de cliente), RF-10 (Órdenes), RF-12 (Portal de cliente)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `orders` (6.1), `order_items` (6.2), `payments` (6.3), `tickets` (6.4)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Portal cliente: Transaccional (read own)
- **ADR relacionados:** ADR-001 (Modelo híbrido relacional + snapshot) — los detalles de la orden se muestran desde el snapshot, no desde datos vivos

## Alcance

Lo que SÍ incluye esta tarea:

1. **My Orders List** (`/portal/orders`):
   - Listado de órdenes del usuario autenticado.
   - Columnas/datos: orderNumber, fecha ($createdAt), total (totalAmount + currency), status, paymentStatus.
   - Filtro por status: todos, paid, pending, cancelled.
   - Orden por fecha descendente (más reciente primero).
   - Responsive: card list en mobile.

2. **Order Detail** (`/portal/orders/:orderId`):
   - Header: orderNumber, fecha, status badge, paymentStatus badge.
   - Items de la orden (del snapshot o `order_items`):
     - Experience name, tier name, quantity, unit price, total.
     - Addons: nombre, precio, cantidad.
     - Package: nombre, inclusiones, precio total.
     - Pass: nombre, créditos, precio.
   - Totals: subtotal, tax (si aplica), total.
   - Payment info: method (si disponible), receipt URL link.
   - Associated tickets: lista de tickets de esta orden con link a ticket detail.

3. **Empty state:** Si no hay órdenes, mostrar mensaje amable con CTA "Explorar experiencias".

## Fuera de alcance

- Cancel order / request cancellation.
- Request refund.
- Download invoice / PDF receipt.
- Re-order (comprar lo mismo otra vez).
- Order status notifications.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Frontend portal

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `orders` | leer | Listar por userId; detalle de una orden |
| `order_items` | leer | Items de la orden para detalle |
| `payments` | leer | Info de pago para detalle |
| `tickets` | leer | Tickets asociados a la orden |

## Atributos nuevos o modificados

N/A — se leen atributos existentes.

## Functions implicadas

N/A — reads directos con Appwrite SDK. Los permisos de colección (`Role.user("{userId}")`) controlan acceso.

## Buckets / Storage implicados

N/A.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `OrderList` | portal | crear | Listado de órdenes con filtros |
| `OrderCard` | portal | crear | Card de orden para la lista |
| `OrderDetail` | portal | crear | Vista detalle de una orden |
| `OrderItemRow` | portal | crear | Línea de item en el detalle |
| `OrderStatusBadge` | portal | crear | Badge visual de status |
| `PaymentStatusBadge` | portal | crear | Badge visual de paymentStatus |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useUserOrders` | crear | Lista órdenes del usuario con filtros |
| `useOrderDetail` | crear | Detalle de una orden con items, payment, tickets |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/portal/orders` | portal | `client` | Listado de órdenes |
| `/portal/orders/:orderId` | portal | `client` | Detalle de una orden |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Listar órdenes propias | ✅ | ✅ | ❌ | ✅ (solo propias) | ❌ |
| Ver detalle de orden propia | ✅ | ✅ | ❌ | ✅ (solo propia) | ❌ |
| Ver payment info de orden propia | ✅ | ✅ | ❌ | ✅ (solo propia) | ❌ |

## Flujo principal

1. Cliente navega a `/portal/orders`.
2. Se ejecuta query: `orders` donde `userId = current`, ordenadas por `$createdAt` DESC.
3. Se muestra lista de OrderCards con orderNumber, fecha, total, status.
4. El filtro de status filtra la lista (client-side o re-query).
5. Click en una orden → navega a `/portal/orders/:orderId`.
6. Se cargan: order, order_items, payment (si existe), tickets asociados.
7. Se muestra todo desde snapshot/datos inmutables:
   a. Items con nombre, cantidad, precio (del itemSnapshot o atributos directos).
   b. Subtotal, tax, total.
   c. Payment method y receipt link (del document `payments`).
   d. Lista de tickets con link a detalle.
8. Si no hay órdenes → empty state con CTA.

## Criterios de aceptación

- [x] La página `/portal/orders` lista todas las órdenes del usuario autenticado.
- [x] Cada orden muestra: orderNumber, fecha, totalAmount con currency, status badge, paymentStatus badge.
- [x] Las órdenes están ordenadas por fecha descendente.
- [x] Se puede filtrar por status: todos, paid, pending, cancelled.
- [x] El detalle de orden muestra los items comprados con nombre, cantidad, precio unitario, precio total.
- [x] Los datos de items se muestran desde el snapshot (inmutables), no desde datos vivos de experiencias/addons.
- [x] Si hay payment registrado, se muestra: método de pago y link a receipt (si disponible).
- [x] Se listan los tickets asociados a la orden con link al detalle del ticket.
- [x] Si el usuario no tiene órdenes, se muestra empty state con CTA "Explorar experiencias".
- [x] El listado es responsive: table/grid en desktop, card list en mobile (< 640px).
- [x] El detalle de orden es responsive: stack en 1 columna en mobile.
- [x] Un usuario solo puede ver sus propias órdenes; no puede acceder a órdenes de otro userId.
- [x] Los badges de status usan colores semánticos: verde (paid), amarillo (pending), rojo (cancelled).

## Validaciones de seguridad

- [x] Las queries filtran por `userId` del usuario autenticado — enforced por Appwrite permissions `Role.user("{userId}")` + hook-level userId filter.
- [x] Si un usuario intenta acceder a `/portal/orders/:orderId` de una orden que no le pertenece, recibe error o vacío (no datos de otro usuario).
- [x] Los receipt URLs son los proporcionados por Stripe; no se fabrican URLs.
- [x] No se exponen stripeSessionId ni stripePaymentIntentId al usuario en la UI.

## Dependencias

- **TASK-006:** Schema transaccional — provee `orders`, `order_items`, `payments`, `tickets`.
- **TASK-030:** Portal layout — provee PortalLayout y routing base.

## Bloquea a

N/A — esta es una task terminal dentro de la fase 9.

## Riesgos y notas

- **Snapshot vs order_items:** El detalle puede mostrarse exclusivamente desde `order_items` (que tienen `name`, `unitPrice`, `totalPrice`, `itemSnapshot`). El `snapshot` de la orden es el respaldo completo. Definir cuál se usa como fuente primaria para display. Recomendación: usar `order_items` como fuente principal, `orders.snapshot` como fallback.
- **Payment info visibility:** Los `payments` docs tienen permisos `Role.label("admin")`. El cliente no puede leerlos directamente. Opciones: (1) almacenar `receiptUrl` en el order snapshot, (2) crear una Function que exponga payment info mínima al dueño de la orden. Opción 1 es más simple para v1.
- **Pagination:** Si un cliente tiene muchas órdenes, considerar pagination. En v1, Appwrite retorna hasta 25 docs por default. Implementar "Load more" si hay más results.
- **Status badges:** Definir paleta de colores para los badges consistente con el design system del portal.
