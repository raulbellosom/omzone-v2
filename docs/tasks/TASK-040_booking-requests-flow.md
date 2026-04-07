# TASK-040: Booking requests — solicitud → cotización → conversión a orden

## Objetivo

Implementar el flujo completo de booking requests: formulario público para experiencias con `saleMode: request`, panel admin para gestión de solicitudes (revisar, cotizar, declinar, convertir a orden), y la conversión de una solicitud aprobada en una orden pagable. Al completar esta tarea, las experiencias bajo modelo `request` tienen un ciclo de vida completo desde la solicitud del cliente hasta la generación de la orden.

## Contexto

- **Fase:** 12 — Venta asistida y operaciones admin
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 12
- **Documento maestro:** Secciones:
  - 14.2 (Flujo B — Solicitud/request antes de pago)
  - **RF-09:** Solicitudes y cotizaciones
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `booking_requests` (6.9), `orders` (6.1), `experiences` (2.1)
- **ADR relacionados:** ADR-005 (Lógica sensible en Functions) — la conversión de request a orden se debe validar server-side.

Las experiencias con `saleMode: request` no permiten compra directa; requieren que el cliente envíe una solicitud que el admin revisa y convierte en orden.

## Alcance

Lo que SÍ incluye esta tarea:

1. Formulario público de solicitud en detalle de experiencia:
   - Se muestra en el detalle de experiencia cuando `saleMode === "request"` (en lugar de botón "Comprar")
   - Campos: `contactName`, `contactEmail`, `contactPhone`, `preferredDate`, `participantCount`, `message`
   - `requestType` auto-asignado según experiencia (`quote`, `private-session`, `group`, `custom`)
   - Validación de campos requeridos (name, email)
   - Validación de formato email
   - Feedback de éxito: "Tu solicitud ha sido enviada. Te contactaremos pronto."
   - Crea documento `booking_requests` con `status: "new"`
2. Página admin de booking requests (`/admin/booking-requests`):
   - Tabla con columnas: contacto, experiencia, fecha preferida, participantes, status, fecha de solicitud, acciones
   - Filtro por status (new, reviewing, quoted, converted, declined, expired)
   - Badge de conteo de `new` requests en sidebar de admin
   - Paginación
3. Detalle de booking request (`/admin/booking-requests/:id`):
   - Todos los datos de la solicitud
   - Nombre y detalle de la experiencia vinculada
   - Campo editable `adminNotes` (notas internas)
   - Campo editable `quotedAmount` (monto cotizado)
   - Acciones de status:
     - `new` → `reviewing`: marcar como en revisión
     - `reviewing` → `quoted`: definir monto cotizado
     - `reviewing` → `declined`: declinar con notas
     - `quoted` → `converted`: convertir a orden
     - cualquiera → `expired`: marcar como expirado
4. Conversión a orden (`quoted` → `converted`):
   - Al convertir, crea orden con `orderType: "request-conversion"`
   - Usa `quotedAmount` como precio total
   - Asigna el `convertedOrderId` en el booking request
   - Genera Stripe Payment Link o marca como pagado manual (similar a venta asistida)
5. Mobile responsive:
   - Tabla → tarjetas en mobile
   - Detalle y formulario de solicitud en single-column

## Fuera de alcance

- Email de notificación automática al admin cuando llega nueva solicitud (TASK-042; se deja como nota planned).
- Email al cliente cuando se cotiza o responde.
- Chat o sistema de mensajería entre admin y cliente.
- Cotizaciones con desglose de items.
- Expiración automática de requests (scheduled job).
- Pagos parciales o depósitos.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Operativo (bookings, validación, asignación)
- [x] Frontend público
- [x] Frontend admin

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `booking_requests` | crear / leer / actualizar | Solicitudes con ciclo de vida de status |
| `experiences` | leer | Experiencia vinculada a la solicitud |
| `orders` | crear | Orden generada al convertir request |
| `order_items` | crear | Items de la orden convertida |
| `admin_activity_logs` | crear | Registro de cambios de status y conversión |

## Atributos nuevos o modificados

N/A — la tabla `booking_requests` fue creada en TASK-006 con todos los atributos definidos en el data model (incluyendo `quotedAmount`, `convertedOrderId`, `adminNotes`, `status` con enum completo).

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `create-checkout` | invocar (modificar) | Para conversión a orden, reutilizar lógica de creación con `orderType: "request-conversion"` |

## Buckets / Storage implicados

Ninguno.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `BookingRequestForm` | público | crear | Formulario de solicitud en detalle de experiencia |
| `BookingRequestListPage` | admin | crear | Listado de solicitudes con filtros |
| `BookingRequestTable` | admin | crear | Tabla de solicitudes |
| `BookingRequestDetailPage` | admin | crear | Detalle con acciones de status |
| `BookingRequestActions` | admin | crear | Botones de cambio de status y conversión |
| `ExperienceDetailPage` | público | modificar | Mostrar formulario de request si `saleMode === "request"` |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useBookingRequests` | crear | Fetch, create, update booking requests |
| `useBookingRequestConvert` | crear | Lógica de conversión request → orden |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/booking-requests` | admin | admin | Listado de solicitudes |
| `/admin/booking-requests/:id` | admin | admin | Detalle de solicitud |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Enviar solicitud (público) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver listado de solicitudes (admin) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cambiar status de solicitud | ✅ | ✅ | ✅ | ❌ | ❌ |
| Convertir solicitud a orden | ✅ | ✅ | ❌ | ❌ | ❌ |
| Declinar solicitud | ✅ | ✅ | ✅ | ❌ | ❌ |

Nota: `booking_requests` tiene permiso create `Role.any()` para que visitantes anónimos puedan enviar solicitudes.

## Flujo principal

1. Visitante navega al detalle de una experiencia con `saleMode === "request"`.
2. En lugar de botón "Comprar", se muestra formulario de solicitud.
3. Visitante llena: nombre, email, teléfono, fecha preferida, cantidad, mensaje.
4. Visitante envía → se crea `booking_requests` con `status: "new"`.
5. Se muestra confirmación al visitante.
6. Admin ve badge de nuevas solicitudes en sidebar.
7. Admin navega a `/admin/booking-requests` y ve la solicitud nueva.
8. Admin abre detalle → marca como `reviewing`.
9. Admin agrega notas internas, define monto cotizado.
10. Admin cambia status a `quoted`.
11. Admin decide convertir → se crea orden con `orderType: "request-conversion"` y se asigna `convertedOrderId`.
12. Admin puede generar payment link o marcar como pagado.

## Criterios de aceptación

- [ ] En el detalle de una experiencia con `saleMode === "request"`, se muestra formulario de solicitud en lugar de botón de compra.
- [ ] El formulario valida campos requeridos (contactName, contactEmail) con errores inline.
- [ ] El formulario valida formato de email antes de enviar.
- [ ] Al enviar el formulario, se crea un documento `booking_requests` con `status: "new"` en Appwrite.
- [ ] Después de enviar, se muestra mensaje de confirmación al visitante.
- [ ] Un admin puede ver el listado de booking requests con filtro por status.
- [ ] El sidebar admin muestra badge con conteo de solicitudes con status `new`.
- [ ] Un admin puede abrir el detalle de una solicitud y ver toda la información.
- [ ] Un admin puede cambiar el status del request siguiendo las transiciones válidas (new→reviewing→quoted/declined, quoted→converted).
- [ ] Un admin puede agregar notas internas (`adminNotes`) y monto cotizado (`quotedAmount`).
- [ ] Al convertir a orden, se crea una orden con `orderType: "request-conversion"` y snapshot.
- [ ] Al convertir, el `convertedOrderId` se persiste en el booking request.
- [ ] La conversión ofrece opciones: marcar como pagado manual o generar link de pago Stripe.
- [ ] Se registran entries en `admin_activity_logs` para cambios de status y conversión.
- [ ] En mobile, la tabla de solicitudes se transforma en tarjetas.
- [ ] El formulario público de solicitud es responsive y funcional en mobile.
- [ ] Un visitante anónimo puede enviar una solicitud sin necesidad de estar autenticado.
- [ ] Un operator puede ver y cambiar status de solicitudes pero NO puede convertir a orden.

## Validaciones de seguridad

- [ ] El formulario público sanitiza inputs antes de escribir en DB (strip HTML, trim whitespace).
- [ ] El campo `contactEmail` se valida como email válido en frontend y se valida en DB (formato string).
- [ ] La conversión a orden solo la puede hacer un usuario con label `admin` (validado en Function).
- [ ] Rate limiting: considerar limitar solicitudes por IP o email para evitar spam (futuro, nota como riesgo).
- [ ] Los datos del booking request no exponen información de otros clientes — cada request es individual.
- [ ] La ruta `/admin/booking-requests` está protegida por guard de admin.

## Dependencias

- **TASK-006:** Schema transaccional — provee tabla `booking_requests` con atributos y permisos.
- **TASK-018:** Detalle público de experiencia — provee la página donde se muestra el formulario de solicitud.
- **TASK-010:** Admin layout — provee shell admin.

## Bloquea a

Ninguna directamente.

## Riesgos y notas

- **Spam en formulario público:** El formulario de solicitud está abierto a anónimos (`Role.any()` create). Puede recibir spam. Mitigaciones futuras: captcha, rate limiting, honeypot field. No implementado en esta tarea.
- **Notificaciones:** No hay notificación automática al admin cuando llega una solicitud. Queda como placeholder para TASK-042. El admin debe revisar el panel periódicamente.
- **Conversión a orden:** La conversión reutiliza la lógica de `create-checkout` pero con precio fijo (`quotedAmount`) en lugar de leer pricing tiers. Se necesita agregar un path en la Function para este caso.
- **userId en booking_requests:** Si el visitante está autenticado, se guarda su userId. Si no, queda null. En la conversión a orden, si no hay userId se necesita crear una cuenta o vincular después.
- **Status transitions:** Validar en backend que las transiciones de status son válidas (no saltar de `new` a `converted` directamente). Implementar state machine simple.
