# TASK-032: Mis tickets activos y descarga

## Objetivo

Implementar la sección "Mis Tickets" en el portal de cliente con listado filtrable, vista detalle completa con QR, y opción de impresión/descarga. Al completar esta tarea, un cliente puede consultar todos sus tickets, ver el QR de cada uno, verificar su estado y obtener una versión imprimible para presentar en el check-in.

## Contexto

- **Fase:** 9 — Portal de cliente
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 9
- **Documento maestro:** RF-11 (Tickets digitales), RF-12 (Portal de cliente)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `tickets` (6.4)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Portal cliente: Transaccional (read own)
- **ADR relacionados:** ADR-001 (Snapshots) — los tickets se muestran desde `ticketSnapshot`

Nota: TASK-025 introduce la base del ticket display (success page, admin check-in). Esta task expande la experiencia completa en el portal del cliente con listado, filtros, detalle y descarga.

## Alcance

Lo que SÍ incluye esta tarea:

1. **My Tickets List** (`/portal/tickets`):
   - Listado de tickets del usuario autenticado.
   - Filtro por status: todos, activos (`active`), usados (`used`).
   - Cada ticket card: nombre de experiencia (del snapshot), fecha/hora, status badge, QR preview (pequeño).
   - Orden por fecha del slot (próximos primero), luego por `$createdAt`.
   - Responsive: cards en grid (desktop), stack (mobile), swipeable opcional (mobile).

2. **Ticket Detail** (`/portal/tickets/:ticketId`):
   - Full info del ticketSnapshot: experiencia, fecha, hora, participante, tier, addons.
   - QR code grande (mínimo 250x250px en desktop, 200x200px en mobile).
   - Status badge prominente (active = verde, used = gris, cancelled = rojo).
   - Si used: mostrar `usedAt` date.
   - orderNumber y link a la orden.

3. **Print / Download:**
   - Botón "Imprimir" que abre `window.print()`.
   - CSS `@media print`: ocultar nav, sidebar, footer; mostrar solo el ticket con QR.
   - Layout de impresión: ticket centrado, QR grande, datos esenciales, logo OMZONE.
   - Botón "Compartir" (Web Share API si disponible, fallback copy link).

4. **QR rendering:** Usar componente `TicketQR` de TASK-025 (o crear si no existe).

## Fuera de alcance

- Camera-based QR scanner.
- Ticket transfer a otro usuario.
- PDF generation server-side.
- Email re-send del ticket.
- Ticket cancellation por el cliente.
- Calendar integration (add to Google Calendar).

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Frontend portal

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `tickets` | leer | Listar por userId; detalle de un ticket |
| `slots` | leer | Fecha/hora para orden de listado (o extraer del snapshot) |

## Atributos nuevos o modificados

N/A — se leen atributos existentes.

## Functions implicadas

N/A — reads directos con Appwrite SDK (permisos `Role.user("{userId}")` controlan acceso).

## Buckets / Storage implicados

N/A.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `PortalTicketList` | portal | crear | Listado filtrable de tickets |
| `PortalTicketCard` | portal | crear | Card de ticket con QR preview y status |
| `PortalTicketDetail` | portal | crear | Vista detalle completa con QR grande |
| `TicketPrintView` | portal | crear | Layout optimizado para impresión |
| `TicketQR` | compartido | usar/crear | Componente QR reutilizable |
| `TicketStatusBadge` | compartido | crear | Badge visual de status del ticket |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useUserTickets` | usar/crear | Lista tickets del usuario con filtros (puede existir de TASK-025) |
| `useTicketDetail` | crear | Detalle de un ticket por ID |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/portal/tickets` | portal | `client` | Listado de tickets |
| `/portal/tickets/:ticketId` | portal | `client` | Detalle de un ticket |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Listar tickets propios | ✅ | ✅ | ❌ | ✅ (solo propios) | ❌ |
| Ver detalle de ticket propio | ✅ | ✅ | ❌ | ✅ (solo propio) | ❌ |
| Imprimir ticket propio | ✅ | ✅ | ❌ | ✅ | ❌ |

## Flujo principal

1. Cliente navega a `/portal/tickets`.
2. Se ejecuta query: `tickets` donde `userId = current`.
3. Se muestra lista de PortalTicketCards.
4. Por defecto, filtro "Activos" preseleccionado para mostrar tickets usables primero.
5. Cliente puede cambiar filtro a "Todos" o "Usados".
6. Click en un ticket → navega a `/portal/tickets/:ticketId`.
7. Se muestra detalle completo del ticket desde ticketSnapshot.
8. QR grande visible, status prominente.
9. Click "Imprimir" → `window.print()` con CSS print optimizado.
10. Si disponible Web Share API: "Compartir" → share dialog del OS.

## Criterios de aceptación

- [x] La página `/portal/tickets` lista todos los tickets del usuario autenticado.
- [x] El filtro por status funciona: todos, activos, usados.
- [x] Cada ticket card muestra: nombre de experiencia, fecha, hora, status badge, QR preview.
- [x] Los tickets activos se muestran antes que los usados, ordenados por fecha más próxima primero.
- [x] El detalle del ticket muestra la información completa del ticketSnapshot: experiencia, fecha, hora, participante, tier, addons.
- [x] El QR code se renderiza con el `ticketCode` y tiene tamaño mínimo 250x250px en desktop y 200x200px en mobile.
- [x] El status badge usa colores semánticos: verde (active), gris (used), rojo (cancelled).
- [x] Si el ticket está used, se muestra la fecha de uso (`usedAt`).
- [x] El botón "Imprimir" abre el diálogo de impresión del navegador.
- [x] La vista de impresión muestra solo el ticket: QR grande, datos esenciales, logo OMZONE, sin nav/sidebar.
- [x] Si no hay tickets, se muestra empty state con mensaje amable.
- [x] El listado es responsive: grid en desktop (≥ 1024px), stack de cards en mobile (< 640px).
- [x] El detalle es responsive: QR y datos se apilan en mobile.
- [x] Un usuario solo puede ver sus propios tickets.

## Validaciones de seguridad

- [x] Las queries filtran por `userId` del usuario autenticado — enforced por Appwrite permissions `Role.user("{userId}")`.
- [x] Un usuario no puede acceder al detalle de un ticket que no le pertenece.
- [x] El QR no contiene información sensible — solo el ticketCode (código alfanumérico).
- [x] La vista de impresión no incluye datos del session token o información interna.

## Dependencias

- **TASK-006:** Schema transaccional — provee `tickets`.
- **TASK-023:** Function `generate-ticket` — genera los tickets que esta task muestra.
- **TASK-025:** Checkout confirmation — puede proveer componentes base de QR y ticket card.
- **TASK-030:** Portal layout — provee PortalLayout.

## Bloquea a

N/A — esta es una task terminal dentro de la fase 9.

## Riesgos y notas

- **QR library bundle size:** `qrcode.react` es ~15KB gzipped. Acceptable. Verificar que no hay conflictos con la versión utilizada en TASK-025.
- **Ticket expiration visual:** En v1, tickets no expiran automáticamente. Pero si el evento (slot) ya pasó y el ticket sigue `active`, considerar mostrarlo con un aviso visual "Evento pasado". No cambiar el status server-side en esta task.
- **Print layout:** Testear la vista de impresión en Chrome, Firefox y Safari. Evitar que los headers/footers del navegador rompan el layout. Incluir `@page { margin: 1cm; }` para consistencia.
- **Snapshot completeness:** Si el `ticketSnapshot` no contiene todos los datos necesarios para display (edge case de tickets antiguos), implementar fallback para campos vacíos.
- **Pagination:** Mismo patrón que TASK-031. Si hay muchos tickets, implementar "Load more".
