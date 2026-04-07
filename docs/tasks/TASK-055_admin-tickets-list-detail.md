# TASK-055: Admin — Listado y detalle de tickets

## Objetivo

Implementar las páginas de gestión de tickets en el panel administrativo de OMZONE, reemplazando el placeholder "Próximamente". Al completar esta tarea, un admin puede listar todos los tickets emitidos con filtros, ver el detalle de cada ticket con QR y estado, e invalidar tickets cuando sea necesario.

## Contexto

- **Fase:** C — Admin: secciones faltantes (post-fase 15)
- **Documento maestro:** RF-08 (Emisión de tickets), RF-09 (Validación de tickets)
- **Estado actual:** La ruta `/admin/tickets` renderiza `<AdminPlaceholder title="Tickets" />`. La collection `tickets` ya existe con todos los atributos. El hook `useUserTickets` existe para portal cliente. Se necesita un hook admin separado.
- **Referencia de patterns:** `OrderListPage` y `OrderDetailPage` — mismo patrón de tabla + filtros + detalle.
- **Collection `tickets`:** Atributos existentes: `orderId`, `orderItemId`, `userId`, `experienceId`, `slotId`, `ticketCode`, `participantName`, `participantEmail`, `status` (valid|used|cancelled|expired), `usedAt`, `ticketSnapshot`.

## Alcance

Lo que SÍ incluye esta tarea:

1. **Página `TicketListPage`** en `/admin/tickets`:
   - Tabla con columnas: ticketCode, participante (nombre + email), experiencia, status, fecha de creación, acciones
   - Filtro por status (valid, used, cancelled, expired)
   - Filtro por experiencia (dropdown de experiencias)
   - Búsqueda por ticketCode o participantName
   - Paginación (25 por página)
   - Badge de status con colores (valid=verde, used=blue, cancelled=red, expired=gray)
   - Mobile responsive: tabla → cards en mobile
2. **Página `TicketDetailPage`** en `/admin/tickets/:ticketId`:
   - Datos del ticket: ticketCode, status, participante, email
   - QR code visual del ticketCode
   - Información de la experiencia vinculada (nombre, tipo)
   - Información del slot (fecha, hora) si aplica
   - Orden vinculada (orderNumber + link a detalle de orden)
   - Snapshot viewer (ticketSnapshot JSON read-only)
   - Historial: fecha de creación, fecha de uso (`usedAt`)
   - Acciones: "Invalidar ticket" (cambiar status a `cancelled`) con confirmación
3. **Hook `useAdminTickets`** — fetch tickets con filtros, paginación, búsqueda server-side.
4. **Hook `useTicketDetail`** — fetch ticket por ID + datos relacionados (experiencia, slot, orden).
5. **Reemplazar placeholder** — eliminar ruta de `AdminPlaceholder` para tickets en `App.jsx`.

## Fuera de alcance

- Generación de nuevos tickets desde admin (se generan via Function post-pago).
- Validación de ticket por QR scan (ya existe en `CheckInPage`).
- Exportar tickets a CSV/Excel.
- Envío de ticket por email desde admin.
- Bulk actions (invalidar múltiples tickets).

## Dominio

- [x] Operativo (bookings, validación, asignación)
- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Frontend admin

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `tickets` | leer / actualizar | Listar, filtrar, ver detalle, invalidar |
| `experiences` | leer | Nombre de experiencia vinculada |
| `slots` | leer | Datos del slot (fecha, hora) |
| `orders` | leer | Orden vinculada (orderNumber) |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | CRUD via Appwrite SDK con permisos admin |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Ninguno | — | — |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `TicketListPage` | admin | crear | Listado con tabla, filtros, búsqueda |
| `TicketDetailPage` | admin | crear | Detalle con QR, snapshot, acciones |
| `TicketStatusBadge` | admin | crear | Badge visual de status |
| `TicketQRDisplay` | admin | crear | QR code visual del ticket |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useAdminTickets` | crear | Fetch tickets con filtros y paginación |
| `useTicketDetail` | crear | Fetch ticket + experiencia + slot + orden |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/tickets` | admin | admin/root/operator | Listado de tickets |
| `/admin/tickets/:ticketId` | admin | admin/root/operator | Detalle de ticket |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver listado de tickets | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver detalle de ticket | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invalidar ticket | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

1. El admin navega a `/admin/tickets`.
2. Ve tabla de tickets con datos, badges de status y acciones.
3. Puede filtrar por status, experiencia o buscar por código/nombre.
4. Hace click en un ticket para ver detalle.
5. En el detalle ve: QR, datos del ticket, experiencia, slot, orden vinculada, snapshot.
6. Si necesita invalidar, presiona "Invalidar" → confirmación → status cambia a `cancelled`.

## Criterios de aceptación

- [ ] La ruta `/admin/tickets` muestra tabla de tickets con columnas: código, participante, experiencia, status, fecha.
- [ ] El filtro por status funciona (valid, used, cancelled, expired).
- [ ] La búsqueda por ticketCode o participantName funciona.
- [ ] La paginación funciona (25 por página).
- [ ] Los badges de status tienen colores diferenciados.
- [ ] El detalle `/admin/tickets/:ticketId` muestra QR code del ticketCode.
- [ ] El detalle muestra la experiencia vinculada y slot (fecha/hora).
- [ ] El detalle incluye link a la orden vinculada.
- [ ] El snapshot se muestra como JSON formateado read-only.
- [ ] El admin puede invalidar un ticket (cambiar a `cancelled`) con diálogo de confirmación.
- [ ] Un operator NO puede invalidar tickets.
- [ ] Usuarios root se excluyen del listado (excepto si el viewer es root) — `excludeGhostUsers()`.
- [ ] La tabla se transforma a cards en mobile (< 768px).
- [ ] Loading skeleton se muestra mientras carga.
- [ ] Empty state si no hay tickets.
- [ ] `npm run build` pasa limpio.

## Validaciones de seguridad

- [ ] Solo admin/root pueden invalidar tickets.
- [ ] Tickets de usuarios root se excluyen del listado si el viewer no es root.

## Dependencias

- **TASK-006:** Schema transaccional — provee collection `tickets`.
- **TASK-023:** Function generate-ticket — genera los tickets que se listan.
- **TASK-022:** Admin orders — pattern de referencia para listado + detalle.
- **TASK-010:** Admin layout — provee `AdminLayout` sidebar.

## Bloquea a

- **TASK-060:** QA integral — se necesita gestión de tickets funcional.

## Riesgos y notas

- Si no hay tickets creados (sin Stripe configurado), el listado estará vacío. TASK-059 puede crear datos seed.
- El componente QR ya existe en el portal cliente (`useUserTickets`). Reutilizar la librería QR.
- Pattern de referencia directo: `OrderListPage` + `OrderDetailPage`.
