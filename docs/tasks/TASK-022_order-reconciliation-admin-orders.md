# TASK-022: Reconciliación de orden — actualizar status, registrar payment, admin orders

## Objetivo

Implementar la máquina de estados de órdenes con transiciones válidas, actualizar el `bookedCount` de slots tras pago confirmado, y crear las páginas de administración de órdenes en el panel admin (listado, detalle con snapshot, actualización manual de status). Al completar esta tarea, las órdenes pagadas actualizan capacidad de agenda, el admin puede ver y gestionar todas las órdenes, y la integridad transaccional está garantizada por validación de transiciones de estado.

## Contexto

- **Fase:** 6 — Webhooks y pagos
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 6
- **Documento maestro:** RF-10 (Órdenes), RF-13 (Venta asistida — parcial: solo visualización de órdenes aquí), secciones 14.1 (Flujo A)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `orders` (6.1), `order_items` (6.2), `payments` (6.3), `slots` (4.1)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Transaccional (write), Agenda (write: bookedCount), Admin (read/write)
- **ADR relacionados:** ADR-001 (Snapshots) — los snapshots de orden se muestran read-only en admin; ADR-005 (Functions) — la reconciliación de slots debe hacerse server-side o con permisos admin
- **RF relacionados:** RF-07, RF-10

La reconciliación es la lógica que cierra el ciclo entre el pago (webhook) y la agenda (slots). Cuando un pago se confirma, los cupos se decrementan. La máquina de estados previene transiciones inválidas (ej: cancelled → paid). El admin panel de órdenes es donde se visualiza toda esta trazabilidad.

## Alcance

Lo que SÍ incluye esta tarea:

1. Implementar lógica de máquina de estados de orden:
   - **Order status:** `pending` → `paid` → `confirmed`; `pending` → `cancelled`
   - **Payment status:** `pending` → `succeeded` | `failed` | `refunded`
   - Validar transiciones: no permitir `cancelled` → `paid`, `refunded` → `succeeded`, etc.
   - En `stripe-webhook` (TASK-021): invocar la lógica de transición como módulo compartido.
2. Actualización de `bookedCount` en slot tras pago confirmado:
   - Cuando orden pasa a `paid` y tiene `order_items` con `slotId`:
     - Incrementar `bookedCount` del slot por la `quantity` de cada order item
     - Si `bookedCount >= capacity`, actualizar `slot.status` a `full`
   - Manejo de error: si el slot ya está `full` o ha cambiado de status, logear warning (overbooking edge case)
3. Crear página admin `AdminOrdersListPage` en `/admin/orders`:
   - Tabla/listado de órdenes con columnas: orderNumber, cliente (nombre + email), status, paymentStatus, total, fecha
   - Filtros por status y paymentStatus
   - Ordenamiento por fecha (más reciente primero)
   - Paginación
4. Crear página admin `AdminOrderDetailPage` en `/admin/orders/:orderId`:
   - Datos generales: orderNumber, status, paymentStatus, montos, fechas
   - Datos del cliente: customerName, customerEmail
   - Order items con desglose (nombre, cantidad, precio, slotId si aplica)
   - Snapshot viewer: mostrar `snapshot` JSON formateado como read-only
   - Payments asociados (del dominio `payments`)
   - Timeline de eventos: creación, pago, confirmación
5. Acción admin: actualizar status de orden manualmente (para ventas asistidas o correcciones):
   - Botón/dropdown para cambiar `status` con validación de transiciones permitidas
   - Confirmación antes de ejecutar
   - Solo admin (no operator)
6. Registrar la lógica de reconciliación como módulo reutilizable que `stripe-webhook` puede invocar.

## Fuera de alcance

- Generación de tickets post-pago (TASK-023).
- Refund processing (futuro).
- Venta asistida completa — crear orden manual desde admin (TASK-039).
- Customer notifications (email post-pago).
- Dashboard de métricas de ventas.
- Export de órdenes a CSV/Excel.
- Búsqueda de órdenes por texto libre.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Agenda (slots, recursos, capacidad)
- Nota: incluye **Frontend admin** para las páginas de gestión de órdenes.

## Entidades / tablas implicadas

| Tabla         | Operación         | Notas                                                                     |
| ------------- | ----------------- | ------------------------------------------------------------------------- |
| `orders`      | leer / actualizar | Listar, ver detalle, actualizar status                                    |
| `order_items` | leer              | Mostrar line items en detalle de orden                                    |
| `payments`    | leer              | Mostrar pagos asociados a la orden                                        |
| `slots`       | leer / actualizar | Incrementar `bookedCount` tras pago; actualizar status a `full` si aplica |

## Atributos nuevos o modificados

N/A — se usan atributos existentes definidos en el data model.

## Functions implicadas

| Function         | Operación | Notas                                                                           |
| ---------------- | --------- | ------------------------------------------------------------------------------- |
| `stripe-webhook` | modificar | Integrar lógica de reconciliación (transiciones de estado + bookedCount update) |

## Buckets / Storage implicados

N/A.

## Componentes frontend implicados

| Componente                 | Superficie | Operación | Notas                                                          |
| -------------------------- | ---------- | --------- | -------------------------------------------------------------- |
| `AdminOrdersListPage`      | admin      | crear     | Listado de órdenes con filtros y paginación                    |
| `AdminOrderDetailPage`     | admin      | crear     | Detalle de orden con snapshot viewer                           |
| `OrderStatusBadge`         | admin      | crear     | Badge visual de status de orden                                |
| `PaymentStatusBadge`       | admin      | crear     | Badge visual de status de pago                                 |
| `SnapshotViewer`           | admin      | crear     | Visualizador read-only de JSON snapshot formateado             |
| `OrderTimeline`            | admin      | crear     | Timeline de eventos de la orden                                |
| `StatusTransitionDropdown` | admin      | crear     | Dropdown para cambio manual de status con transiciones válidas |

## Hooks implicados

| Hook             | Operación | Notas                                             |
| ---------------- | --------- | ------------------------------------------------- |
| `useOrders`      | crear     | Fetch listado de órdenes con filtros y paginación |
| `useOrderDetail` | crear     | Fetch orden + items + payments por orderId        |

## Rutas implicadas

| Ruta                     | Superficie | Guard                                                 | Notas              |
| ------------------------ | ---------- | ----------------------------------------------------- | ------------------ |
| `/admin/orders`          | admin      | `ProtectedRoute labels={["admin","root","operator"]}` | Listado de órdenes |
| `/admin/orders/:orderId` | admin      | `ProtectedRoute labels={["admin","root","operator"]}` | Detalle de orden   |

## Permisos y labels involucrados

| Acción                              | root | admin | operator | client | anónimo |
| ----------------------------------- | ---- | ----- | -------- | ------ | ------- |
| Ver listado de órdenes              | ✅   | ✅    | ✅       | ❌     | ❌      |
| Ver detalle de orden + snapshot     | ✅   | ✅    | ✅       | ❌     | ❌      |
| Cambiar status de orden manualmente | ✅   | ✅    | ❌       | ❌     | ❌      |
| Ver payments asociados              | ✅   | ✅    | ✅       | ❌     | ❌      |

## Flujo principal

### Flujo de reconciliación (backend)

1. `stripe-webhook` procesa `checkout.session.completed`.
2. Actualiza orden a `status = "paid"`, `paymentStatus = "succeeded"`.
3. Invoca módulo de reconciliación:
   a. Lee `order_items` de la orden.
   b. Para cada `order_item` con `slotId`:
   - Lee el slot actual.
   - Incrementa `bookedCount` por `quantity`.
   - Si `bookedCount >= capacity`, cambia `slot.status` a `full`.
     c. Crea documento `payments`.
4. La orden queda reconciliada.

### Flujo de admin (frontend)

1. El admin navega a `/admin/orders`.
2. Ve la tabla de órdenes con status, montos y fechas.
3. Puede filtrar por status (`pending`, `paid`, `confirmed`, `cancelled`, `refunded`).
4. Hace click en una orden para ver detalle.
5. En el detalle ve: datos generales, items, payments, snapshot (read-only).
6. Si necesita cambiar status (ej: marcar como `confirmed` tras verificación manual), usa el dropdown de transición.
7. El sistema valida que la transición es válida antes de ejecutar.

## Criterios de aceptación

- [ ] La lógica de transición de estados valida rutas permitidas: `pending → paid`, `paid → confirmed`, `pending → cancelled`.
- [ ] La lógica rechaza transiciones inválidas: `cancelled → paid`, `refunded → succeeded`, `paid → pending`.
- [ ] Tras `checkout.session.completed`, el `bookedCount` del slot asociado se incrementa por la `quantity` de la orden.
- [ ] Si `bookedCount >= capacity` tras el incremento, el `slot.status` se actualiza a `full`.
- [ ] Si el slot ya no está `available` al momento de reconciliar, se logea warning pero no se bloquea el pago (overbooking controlado).
- [ ] La página `/admin/orders` muestra listado de órdenes con columnas: orderNumber, cliente, status, paymentStatus, total, fecha.
- [ ] El listado permite filtrar por `status` y `paymentStatus`.
- [ ] El listado está paginado (25 órdenes por página).
- [ ] La página `/admin/orders/:orderId` muestra datos completos de la orden.
- [ ] El detalle muestra `order_items` con nombre, cantidad, precio unitario y total.
- [ ] El detalle muestra el `snapshot` JSON formateado como visualización read-only.
- [ ] El detalle muestra `payments` asociados con amount, status y stripePaymentIntentId.
- [ ] Un admin puede cambiar el status de una orden via dropdown con transiciones válidas.
- [ ] Un operator puede ver órdenes pero NO puede cambiar su status manualmente.
- [ ] Antes de ejecutar un cambio de status manual, se muestra diálogo de confirmación.
- [ ] El `OrderStatusBadge` usa colores diferenciados por status: pending=yellow, paid=green, confirmed=blue, cancelled=red, refunded=gray.

## Validaciones de seguridad

- [ ] La actualización de `bookedCount` se realiza server-side (en la Function `stripe-webhook` o con permisos admin) — nunca desde frontend público.
- [ ] El cambio manual de status solo es accesible para `admin` y `root`, no para `operator`.
- [ ] La lógica de transición de estados se valida ANTES de ejecutar la actualización en DB.
- [ ] El snapshot JSON se muestra read-only — no es editable desde el admin panel.
- [ ] Los filtros de status se aplican con queries Appwrite (server-side), no client-side.

## Dependencias

- **TASK-021:** Function `stripe-webhook` — provee el punto de entrada donde se invoca la reconciliación; esta tarea integra la lógica de reconciliación dentro (o como módulo invocado por) esa Function.
- **TASK-006:** Schema transaccional — provee `orders`, `order_items`, `payments` con atributos e índices.
- **TASK-005:** Schema agenda — provee `slots` con `bookedCount` y `capacity`.
- **TASK-010:** Admin layout — provee shell del panel admin con sidebar y navigation.

## Bloquea a

- **TASK-023:** Function `generate-ticket` — necesita órdenes en estado `paid` para emitir tickets.
- **TASK-039:** Venta asistida — necesita las páginas de admin orders como base para crear órdenes manuales.

## Riesgos y notas

- **Race condition en bookedCount:** Si dos webhooks concurrentes incrementan `bookedCount` del mismo slot, uno podría basarse en un valor stale. Mitigación: verificar post-update que `bookedCount <= capacity` y logear si se excede. Appwrite 1.9.0 no tiene operaciones atómicas de increment, por lo que se debe leer-incrementar-escribir con validación.
- **Overbooking policy:** Decisión de negocio pendiente: ¿qué hacer si se confirma un pago pero el slot ya está lleno? Opciones: (a) aceptar overbooking y manejar manualmente, (b) refund automático, (c) reasignar a otro slot. Por ahora, implementar opción (a): aceptar, logear warning, y notificar admin.
- **Snapshot viewer:** El snapshot puede ser grande (hasta 50KB). Usar un componente con scroll y syntax highlighting (ej: `<pre>` con formateo JSON) en vez de intentar parsear y renderizar cada campo.
- **Transiciones de estado:**
  - `pending → paid`: automático por webhook
  - `paid → confirmed`: manual por admin (post-verificación operativa)
  - `pending → cancelled`: automático por session expired o manual por admin
  - No se incluye `paid → refunded` en esta task (futuro)
- **Módulo compartido:** La lógica de transiciones y reconciliación debería ser un módulo importable dentro de la Function, no inline en el handler del webhook. Esto facilita reutilización en venta asistida (TASK-039).
