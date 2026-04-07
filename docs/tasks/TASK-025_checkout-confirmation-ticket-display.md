# TASK-025: Página de confirmación + ticket digital para cliente

## Objetivo

Implementar la página de confirmación post-checkout que muestra el resumen de la orden y los tickets generados, la sección de tickets en el portal de cliente con QR renderizado, y una página básica de check-in en admin con input de ticketCode. Al completar esta tarea, el cliente puede ver y descargar sus tickets tras la compra, consultar tickets activos en su portal, y el admin puede hacer check-in desde un campo de texto.

## Contexto

- **Fase:** 7 — Tickets y reservas
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 7
- **Documento maestro:** RF-08 (Emisión de tickets), RF-11 (Tickets digitales), RF-12 (Portal de cliente)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `orders` (6.1), `order_items` (6.2), `tickets` (6.4)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Sitio público (checkout success), Portal cliente (my tickets), Panel admin (check-in)
- **ADR relacionados:** ADR-001 (Snapshots) — los tickets se muestran desde `ticketSnapshot`, no desde datos vivos

## Alcance

Lo que SÍ incluye esta tarea:

1. **Checkout Success Page** (`/checkout/success`):
   - Recibir `session_id` desde URL params (redirect de Stripe).
   - Buscar orden por `stripeSessionId` (query a `orders`).
   - Mostrar: orderNumber, items comprados (del snapshot), total, fecha, paymentStatus.
   - Mostrar tickets generados: experiencia, fecha, ticketCode, QR.
   - CTA "Ver mis tickets" → enlace al portal.
   - CTA "Volver al catálogo" → enlace al listado público.
   - Estado de carga mientras se busca la orden.
   - Si la orden no se encuentra o no está paid: mostrar mensaje genérico de agradecimiento con nota de que recibirá confirmación.

2. **Client Portal — My Tickets** (`/portal/tickets`):
   - Listado de tickets del usuario autenticado.
   - Filtro por status: todos, activos, usados.
   - Card de ticket: nombre de experiencia, fecha, hora, status badge (active/used/cancelled), QR preview.
   - Ticket detail view: info completa del ticketSnapshot, QR grande, status.
   - Print-friendly ticket view (CSS `@media print`).
   - "Descargar ticket" button que abre ventana de impresión.

3. **QR Rendering:**
   - Usar librería `qrcode.react` (o similar) para renderizar QR desde `ticketCode`.
   - QR visible en success page, ticket list y ticket detail.

4. **Admin — Check-in Page** (`/admin/check-in`):
   - Input de texto para `ticketCode`.
   - Botón "Validar".
   - Invoke `validate-ticket` Function.
   - Mostrar resultado: participante, experiencia, fecha, status.
   - Visual feedback: verde si válido, rojo si inválido/usado/expired.
   - Historial de últimos 10 check-ins de la sesión actual (in-memory, no persistido).

## Fuera de alcance

- Camera-based QR scanning (web camera API) — futura task.
- PDF generation del ticket — futura task.
- Email de confirmación con ticket — futura task.
- Ticket transfer entre usuarios.
- Batch check-in desde admin.
- Notification push cuando el ticket se genera.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [ ] Operativo (bookings, validación, asignación)
- [x] Frontend público
- [x] Frontend portal
- [x] Frontend admin

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `orders` | leer | Buscar orden por stripeSessionId en success page |
| `order_items` | leer | Mostrar items de la orden en success page |
| `tickets` | leer | Listar tickets del usuario en portal; mostrar en success page |

## Atributos nuevos o modificados

N/A — se leen atributos existentes definidos en el data model.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `validate-ticket` | usar existente | Invocada desde admin check-in page |

## Buckets / Storage implicados

N/A.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `CheckoutSuccess` | público | crear | Página de confirmación post-pago |
| `TicketCard` | portal | crear | Card de ticket con QR preview y status badge |
| `TicketDetail` | portal | crear | Vista detalle de un ticket con QR grande |
| `TicketList` | portal | crear | Listado filtrable de tickets del usuario |
| `TicketQR` | compartido | crear | Componente QR reutilizable usando qrcode.react |
| `CheckInPage` | admin | crear | Página de check-in con input de ticketCode |
| `CheckInResult` | admin | crear | Display del resultado de validación |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useOrderBySession` | crear | Busca orden por stripeSessionId |
| `useUserTickets` | crear | Lista tickets del usuario autenticado con filtros |
| `useValidateTicket` | crear | Invoca validate-ticket Function y maneja estado |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/checkout/success` | público | ninguno (accesible post-redirect de Stripe) | Confirmación de compra |
| `/portal/tickets` | portal | `client` | Listado de tickets del usuario |
| `/portal/tickets/:ticketId` | portal | `client` | Detalle de un ticket |
| `/admin/check-in` | admin | `admin` o `operator` | Página de check-in |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver checkout success | ✅ | ✅ | ✅ | ✅ | ✅ |
| Listar tickets propios | ✅ | ✅ | ❌ | ✅ (solo propios) | ❌ |
| Ver detalle de ticket propio | ✅ | ✅ | ❌ | ✅ (solo propios) | ❌ |
| Hacer check-in desde admin | ✅ | ✅ | ✅ | ❌ | ❌ |

## Flujo principal

### Checkout Success
1. Stripe redirige al usuario a `/checkout/success?session_id=cs_xxx`.
2. El componente extrae `session_id` de URL params.
3. Query a `orders` filtrando por `stripeSessionId === session_id`.
4. Mostrar loading spinner mientras carga.
5. Si orden encontrada y `status === "paid"`:
   a. Mostrar resumen: orderNumber, items (del snapshot), total.
   b. Query a `tickets` filtrando por `orderId`.
   c. Mostrar tickets con QR y datos.
6. Si orden no encontrada o `status !== "paid"`:
   a. Mostrar mensaje genérico: "Tu pago está siendo procesado. Recibirás confirmación en breve."

### My Tickets (Portal)
1. Usuario navega a `/portal/tickets`.
2. Query a `tickets` filtrando por `userId` del usuario autenticado.
3. Mostrar grid/lista de TicketCards con filtro de status.
4. Click en un ticket → navega a `/portal/tickets/:ticketId`.
5. Vista detalle con QR grande, datos completos, botón imprimir.

### Admin Check-in
1. Operator navega a `/admin/check-in`.
2. Ingresa `ticketCode` en input de texto.
3. Click "Validar" → invoca `validate-ticket` Function.
4. Si válido: muestra datos del participante en verde.
5. Si inválido: muestra motivo del error en rojo.
6. El resultado se agrega al historial in-memory de la sesión.

## Criterios de aceptación

- [ ] La página `/checkout/success` muestra el resumen de la orden con orderNumber, items y total.
- [ ] Los tickets se muestran en la success page con su `ticketCode` y QR renderizado.
- [ ] Si la orden aún no es `paid`, se muestra un mensaje de procesamiento (no un error).
- [ ] El QR se renderiza usando `qrcode.react` o librería similar, codificando el `ticketCode`.
- [ ] La página `/portal/tickets` lista todos los tickets del usuario autenticado.
- [ ] Los tickets se pueden filtrar por status: todos, activos, usados.
- [ ] Cada ticket card muestra: nombre de experiencia, fecha, hora, status badge, QR preview.
- [ ] La vista detalle muestra información completa del ticketSnapshot y QR de tamaño grande.
- [ ] El botón "Descargar ticket" / "Imprimir" abre el diálogo de impresión del navegador.
- [ ] La vista de impresión muestra el ticket completo con QR en formato limpio (sin nav/sidebar).
- [ ] La página `/admin/check-in` tiene un input para `ticketCode` y botón "Validar".
- [ ] Un check-in exitoso muestra datos del participante con feedback visual verde.
- [ ] Un ticket ya usado muestra feedback rojo con "Ticket already used" y `usedAt`.
- [ ] Un ticket inexistente muestra "Ticket not found" con feedback rojo.
- [ ] La success page, portal tickets y admin check-in son responsive en mobile (< 640px).
- [ ] El usuario no autenticado que accede a `/portal/tickets` es redirigido al login.

## Validaciones de seguridad

- [ ] La consulta de tickets en portal filtra estrictamente por `userId` del usuario autenticado — no se pueden ver tickets de otros usuarios.
- [ ] La página de check-in en admin solo es accesible con label `admin` o `operator`.
- [ ] El `stripeSessionId` en success page no expone información sensible si la orden no pertenece al usuario.
- [ ] El input de `ticketCode` en admin se sanitiza antes de enviar a la Function.

## Dependencias

- **TASK-001:** Scaffold del proyecto — layout base, routing.
- **TASK-009:** Route guards — protección de rutas por label.
- **TASK-020:** UI de checkout — el success page es la continuación del flujo de checkout.
- **TASK-023:** Function `generate-ticket` — genera los tickets que esta task muestra.
- **TASK-024:** Function `validate-ticket` — la Function que el admin check-in invoca.

## Bloquea a

- **TASK-032:** Mis tickets en portal — la sección de tickets del portal se inicia aquí y se expande en TASK-032.

## Riesgos y notas

- **Timing issue en success page:** El redirect de Stripe puede llegar antes de que el webhook procese el pago. Por eso se debe manejar el caso `status !== "paid"` de forma amable, no como error. Considerar polling o retry con delay.
- **Librería QR:** `qrcode.react` es la opción más popular para React. Verificar tamaño del bundle y compatibilidad con impresión.
- **Acceso a order por stripeSessionId:** El query a `orders` en success page debe funcionar sin requierir autenticación (el usuario puede llegar sin sesión si el redirect de Stripe expira la sesión). Alternativa: requerir login y buscar por `userId` + `stripeSessionId`.
- **Print styling:** La vista de impresión requiere CSS `@media print` que oculte nav, sidebar y muestre solo el ticket. Probar en Chrome, Firefox y Safari.
- **Mobile QR:** El QR debe ser suficientemente grande en mobile para que un scanner lo lea. Mínimo 200x200px en mobile.
