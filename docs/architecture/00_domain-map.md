# OMZONE — Mapa de Dominios del Sistema

Versión: 1.0
Fecha: 2026-04-05

---

## 1. Propósito

Este documento define las boundaries claras entre los dominios del sistema OMZONE, sus entidades, relaciones inter-dominio y reglas de comunicación. Es la referencia de arquitectura para ubicar cualquier entidad o flujo.

---

## 2. Dominios

### 2.1 Dominio Editorial

**Responsabilidad:** Comunicar la experiencia al público con narrativa, storytelling, imágenes y SEO.

**Boundary:** No contiene lógica de precios, inventario ni operación.

| Entidad | Propósito |
|---|---|
| `experiences` | Catálogo maestro (sesión, inmersión, retiro, estancia, privada) |
| `publications` | Páginas CMS: blogs, landings, highlights |
| `publication_sections` | Bloques modulares de contenido dentro de una publicación |
| `publication_media` | Media asociado a secciones de publicación |
| `tags` | Etiquetas reutilizables para filtrado y SEO |
| `experience_tags` | Relación N:N experiencias ↔ tags |

**Relaciones inter-dominio:**
- `experiences` → referenciada por dominio comercial (editions, pricing)
- `experiences` → referenciada por dominio agenda (slots)
- `publications` → puede referenciar `experiences` para link editorial → comercial

**Regla:** Una publicación puede existir sin experiencia comercial asociada (contenido institucional). Una experiencia puede existir sin publicación (solo venta directa desde catálogo).

---

### 2.2 Dominio Comercial

**Responsabilidad:** Definir cómo se vende cada experiencia: precios, variantes, addons, paquetes, pases.

**Boundary:** No contiene narrativa pública ni lógica de agenda.

| Entidad | Propósito |
|---|---|
| `experience_editions` | Ediciones programadas (temporadas, versiones) |
| `pricing_tiers` | Variantes de precio (early bird, regular, VIP, grupal) |
| `pricing_rules` | Reglas condicionales de pricing (por fecha, cantidad, condición) |
| `addons` | Complementos vendibles (masaje, transporte, hospedaje) |
| `addon_assignments` | Relación addon ↔ experiencia/edición con reglas |
| `packages` | Paquetes compuestos de múltiples experiencias + addons |
| `package_items` | Items dentro de un paquete |
| `passes` | Tipos de pases consumibles (5 sesiones, 10 accesos, mensual) |

**Relaciones inter-dominio:**
- `experience_editions` → apunta a `experiences` (editorial)
- `pricing_tiers` → apunta a `experiences` o `experience_editions`
- `addon_assignments` → enlaza `addons` con `experiences` / `editions`
- `packages` → referencia `experiences` y `addons` via `package_items`
- `passes` → referencia `experiences` para definir qué sesiones son válidas

**Regla:** Los precios NUNCA se leen directamente por el cliente para armar totales. Los totales se calculan en Functions server-side.

---

### 2.3 Dominio Agenda

**Responsabilidad:** Definir cuándo y bajo qué calendario se reserva una experiencia.

**Boundary:** No contiene precios ni narrativa. Solo fechas, capacidad y recursos.

| Entidad | Propósito |
|---|---|
| `slots` | Fechas/horarios disponibles con capacidad |
| `slot_resources` | Recursos asignados a un slot (instructor, espacio) |
| `resources` | Catálogo de recursos operativos (instructores, espacios, equipos) |

**Relaciones inter-dominio:**
- `slots` → apunta a `experiences` o `experience_editions`
- `slot_resources` → enlaza `slots` con `resources`
- `slots` → referenciado por dominio transaccional (`order_items`, `bookings`)

**Regla:** Un slot es una ocurrencia agendada. Un pase es un saldo consumible. No confundir.

---

### 2.4 Dominio Operativo

**Responsabilidad:** Ejecutar internamente lo vendido: reservas confirmadas, asignaciones, participantes.

**Boundary:** No expone datos al público. Es la capa de ejecución post-venta.

| Entidad | Propósito |
|---|---|
| `bookings` | Reserva confirmada de un slot por un cliente |
| `booking_participants` | Participantes individuales dentro de una reserva grupal |
| `locations` | Locaciones (operativo, no producto público) |
| `rooms` | Cuartos/espacios dentro de locaciones |

**Relaciones inter-dominio:**
- `bookings` → apunta a `slots` (agenda) y `orders` (transaccional)
- `booking_participants` → detalle de `bookings`
- `locations` / `rooms` → referenciados por `resources` y `slots` para asignación

**Regla:** Los cuartos/locaciones son operación. La experiencia se vende primero; la locación se asigna después.

---

### 2.5 Dominio Transaccional

**Responsabilidad:** Registrar compras de forma inmutable con snapshots para integridad histórica.

**Boundary:** Cross-cutting. Referencia otras capas pero contiene su propia versión (snapshot) de los datos al momento de compra.

| Entidad | Propósito |
|---|---|
| `orders` | Orden de compra con snapshot completo |
| `order_items` | Line items de la orden con snapshot |
| `payments` | Registro de pago Stripe vinculado a orden |
| `tickets` | Tickets emitidos tras pago confirmado |
| `ticket_redemptions` | Registro de escaneos/redenciones de ticket |
| `pass_consumptions` | Registro de uso de pases consumibles |
| `refunds` | Registro de reembolsos procesados |
| `booking_requests` | Solicitudes previas a pago (quote → conversion) |

**Relaciones inter-dominio:**
- `orders` → referencia `experiences`, `slots`, `addons` por ID + contiene **snapshot JSON**
- `order_items` → referencia entidades vivas + contiene **itemSnapshot**
- `tickets` → referencia `orders` + contiene **ticketSnapshot**
- `pass_consumptions` → referencia `passes` (comercial) y `tickets`/`slots`

**Regla:** Toda orden y ticket debe contener snapshot JSON suficiente para no depender de relaciones vivas.

---

### 2.6 Dominio Usuario

**Responsabilidad:** Datos extendidos del cliente más allá de Appwrite Auth.

| Entidad | Propósito |
|---|---|
| `user_profiles` | Perfil extendido (nombre, teléfono, preferencias) |
| `user_preferences` | Preferencias de experiencias (wellness, yoga, etc.) |
| `admin_activity_logs` | Registro de acciones administrativas |

**Relaciones inter-dominio:**
- `user_profiles` → enlazado con Appwrite Auth userId
- `admin_activity_logs` → referencia userId y las entidades afectadas

---

### 2.7 Dominio Configuración

**Responsabilidad:** Settings globales de la plataforma.

| Entidad | Propósito |
|---|---|
| `site_settings` | Configuración general (nombre, logo, horarios, políticas) |
| `notification_templates` | Templates de notificaciones |

---

## 3. Matriz de comunicación inter-dominio

| Desde \ Hacia | Editorial | Comercial | Agenda | Operativo | Transaccional | Usuario | Config |
|---|---|---|---|---|---|---|---|
| **Editorial** | — | Edition referencia Experience | Slot referencia Experience | — | — | — | — |
| **Comercial** | Addon/Package referencia Experience | — | PricingTier puede aplicar a Edition | — | Snapshot en orden | — | — |
| **Agenda** | Slot referencia Experience | Slot vinculado a Edition | — | Booking referencia Slot | OrderItem referencia Slot | — | — |
| **Operativo** | — | — | Booking referencia Slot | — | Booking referencia Order | — | — |
| **Transaccional** | Order snapshot contiene Experience data | Order snapshot contiene Pricing data | OrderItem referencia Slot | Ticket → Booking | — | Order referencia UserId | — |
| **Usuario** | — | — | — | — | User es dueño de sus Orders | — | — |

---

## 4. Superficies y dominios consumidos

| Superficie | Actores | Dominios que consume |
|---|---|---|
| **Sitio público** | Anónimo, visitante | Editorial (read), Comercial (read prices), Agenda (read slots) |
| **Checkout** | Visitante/client | Comercial (read), Agenda (read) → Transaccional (write via Function) |
| **Portal cliente** | `client` | Transaccional (read own), Usuario (read/write own) |
| **Panel admin** | `admin`, `operator` | Todos los dominios |
| **Functions backend** | Servidor | Transaccional (write), Comercial (read), Agenda (read/write) |

---

## 5. Reglas de diseño

1. **Nunca cruzar boundaries sin justificación.** Si un componente de catálogo público necesita precios, lee del dominio comercial, no duplica datos en editorial.
2. **Las relaciones vivas** son para el presente (catálogo, agenda, operación activa).
3. **Los snapshots** son para el pasado (órdenes, tickets, ventas históricas).
4. **Los cuartos no son producto.** Se asignan operativamente post-venta.
5. **Las ediciones no son eventos.** Una edición es una versión comercial; un slot es una ocurrencia agendada.
6. **Los pases no son eventos.** Un pase es saldo consumible; un slot es una fecha reservable.
