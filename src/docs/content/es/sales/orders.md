---
title: Pedidos
description: Rastrear y gestionar compras de clientes
section: sales
order: 1
lastUpdated: 2026-04-25
---

# Pedidos

Los pedidos representan compras realizadas por clientes a través de la plataforma OMZONE. Cada pedido captura una instantánea de los artículos comprados al momento de la venta, asegurando precisión histórica independientemente de cambios futuros en experiencias o precios.

## Valores de Estado del Pedido

El estado del pedido rastrea el ciclo de vida de una compra desde la creación hasta el cumplimiento o cancelación.

| Estado | Descripción | Terminal? | Admin Puede Establecer | Sistema Establece Cuando |
|--------|-------------|-----------|------------------------|-------------------------|
| `pending` | Pedido creado, esperando confirmación de pago de Stripe | No | Sí (cancelar) | Pedido primeramente creado |
| `paid` | Pago confirmado; pedido listo para cumplimiento | No | Sí (cancelar, markRefunded) | Webhook de Stripe `payment_intent.succeeded` |
| `confirmed` | El cumplimiento ha iniciado (tickets generados, pase activado) | No | No | Función `create-checkout` dispara el cumplimiento |
| `cancelled` | Pedido cancelado antes de completarse | Sí | Sí | Admin cancela desde pending/paid |
| `refunded` | Pago reembolsado al cliente | Sí | Sí | Admin emite reembolso O automático vía Stripe |

### Detalles del Estado

#### `pending`

**Descripción:** El pedido ha sido creado pero el pago aún no ha sido confirmado. Este es el estado inicial para todos los pedidos.

**Cuando el Sistema Establece:**
- Cliente inicia checkout (compra directa)
- Admin crea pedido de venta asistida

**Cuando el Admin Puede Establecer:**
- Cancelar el pedido (mueve a `cancelled`)

**Acciones Disponibles:**
- Cancelar pedido
- Ver detalles del pedido
- Modificar info de facturación/envío (si aplica)

**Qué Sucede Después:**
- `paid` — Pago confirmado vía webhook de Stripe
- `cancelled` — Admin cancela antes del pago

---

#### `paid`

**Descripción:** El pago ha sido exitosamente capturado. Los fondos están en la cuenta del comerciante y el pedido está listo para cumplimiento.

**Cuando el Sistema Establece:**
- Stripe envía webhook `payment_intent.succeeded`
- Estado del pago cambia de `processing` a `succeeded`

**Cuando el Admin Puede Establecer:**
- Cancelar el pedido (mueve a `cancelled`, puede disparar reembolso)
- Marcar como reembolsado (mueve a `refunded` directamente)

**Acciones Disponibles:**
- Cancelar pedido
- Ver detalles de pago
- Ver intento de pago de Stripe

**Qué Sucede Después:**
- `confirmed` — Cumplimiento disparado automáticamente cuando la función de checkout procesa
- `refunded` — Admin procesa reembolso manualmente
- `cancelled` — Admin cancela antes del cumplimiento

---

#### `confirmed`

**Descripción:** El cumplimiento ha sido iniciado. Los tickets han sido generados, los pases han sido activados, u otras acciones de cumplimiento han sido tomadas.

**Cuando el Sistema Establece:**
- Función Appwrite `create-checkout` completa exitosamente
- Tickets generados vía Función `generate-ticket`
- Créditos de pase activados vía Función `consume-pass`

**Cuando el Admin Puede Establecer:**
- Sin transición admin directa. Este estado es controlado por el sistema.

**Acciones Disponibles:**
- Ver tickets
- Ver activaciones de pase
- Emitir reembolso (mueve a `refunded`)

**Qué Sucede Después:**
- `refunded` — Admin emite reembolso después del cumplimiento

**Importante:** En esta etapa, los tickets ya pueden ser válidos para check-in. Si se emite reembolso, considerar invalidar cualquier ticket emitido manualmente.

---

#### `cancelled`

**Descripción:** El pedido fue cancelado antes de completarse. Este es un estado terminal.

**Cuando el Sistema Establece:**
- Nunca establecido automáticamente por el sistema

**Cuando el Admin Puede Establecer:**
- Desde estado `pending` — Sin pago capturado, no se necesita acción
- Desde estado `paid` — Pago capturado pero aún no cumplido; se debe procesar reembolso

**Acciones Disponibles:**
- Emitir reembolso (si el pago fue capturado)
- Ver detalles del pedido para registros

**Qué Sucede Después:**
- `refunded` — Si el pago fue capturado, admin debe emitir reembolso

---

#### `refunded`

**Descripción:** El pago ha sido devuelto al cliente. Este es un estado terminal.

**Cuando el Sistema Establece:**
- Reembolso de Stripe procesado exitosamente

**Cuando el Admin Puede Establecer:**
- Desde estado `paid` — Reembolso directo sin pasar por cancelación
- Desde estado `confirmed` — Reembolso después del cumplimiento (considerar invalidación de tickets)

**Acciones Disponibles:**
- Ver detalles del reembolso
- Ver información de pago original

**Qué Sucede Después:**
- Estado terminal — Sin más transiciones

---

## Valores de Estado del Pago

El estado del pago rastrea el estado del pago de Stripe separadamente del estado de cumplimiento del pedido.

| Estado | Descripción | Integración Stripe |
|--------|-------------|-------------------|
| `pending` | Sesión de checkout creada, sin intento de pago | Sesión de Stripe Checkout iniciada |
| `processing` | Intención de pago en vuelo | Stripe procesando pago |
| `succeeded` | Pago capturado exitosamente | Intención de pago exitosa |
| `failed` | Pago declinado o error | Intención de pago fallida |
| `refunded` | Pago devuelto al cliente | Reembolso emitido vía Stripe |

### Detalles del Estado de Pago

#### `pending`

**Descripción:** El proceso de checkout ha sido iniciado pero no se ha intentado ningún pago. El cliente no ha completado el flujo de pago de Stripe.

**Referencia Stripe:** Sesión de checkout creada, esperando completitud del cliente.

**Lo que esto significa:**
- El estado del pedido también puede ser `pending`
- Sin fondos capturados
- El cliente puede haber abandonado el checkout

---

#### `processing`

**Descripción:** El pago está siendo procesado actualmente por Stripe. La intención de pago está en vuelo.

**Referencia Stripe:** El estado de la intención de pago es `processing`.

**Lo que esto significa:**
- El estado del pedido es típicamente `pending`
- El cliente ha enviado el pago
- Stripe aún no ha confirmado éxito o fallo
- NO cancelar pedidos en este estado — esperar estado final

---

#### `succeeded`

**Descripción:** El pago fue capturado exitosamente. Los fondos están en la cuenta del comerciante.

**Referencia Stripe:** Intención de pago exitosa.

**Lo que esto significa:**
- El estado del pedido puede ser `paid` o `confirmed`
- Fondos capturados y disponibles
- El pago puede ser reembolsado si se necesita

---

#### `failed`

**Descripción:** El pago fue declinado o ocurrió un error durante el procesamiento.

**Referencia Stripe:** Intención de pago fallida con error.

**Lo que esto significa:**
- El estado del pedido es típicamente `pending`
- Sin fondos capturados
- El cliente puede necesitar reintentar con diferente método de pago

---

#### `refunded`

**Descripción:** Un reembolso total o parcial ha sido emitido al cliente.

**Referencia Stripe:** Reembolso creado vía Dashboard de Stripe o API.

**Lo que esto significa:**
- El estado del pedido es típicamente `refunded`
- Fondos devueltos al cliente
- El reembolso puede ser total o parcial

---

## Matriz de Estados

La relación entre el estado del pedido y el estado del pago determina los estados válidos de un pedido.

### Combinaciones Válidas

| Estado del Pedido | Estados de Pago Válidos | Notas |
|-------------------|------------------------|-------|
| `pending` | `pending`, `processing`, `failed` | Pago no confirmado; esperando, en vuelo, o fallido |
| `paid` | `succeeded` | Pago capturado; esperando cumplimiento |
| `confirmed` | `succeeded` | Pago confirmado; cumplimiento en progreso |
| `cancelled` | `succeeded`, `refunded` | Pago capturado pero pedido cancelado; puede necesitar reembolso |
| `refunded` | `refunded` | Pago devuelto |

### Combinaciones Inválidas

Estas combinaciones nunca deben ocurrir en operación normal:

| Combinación Inválida | Razón |
|---------------------|-------|
| `orderStatus="pending"` + `paymentStatus="succeeded"` | Pago exitoso debería disparar que el pedido se convierta en `paid` |
| `orderStatus="paid"` + `paymentStatus="pending"` | El pedido no puede estar pagado sin pago exitoso |
| `orderStatus="confirmed"` + `paymentStatus="pending"` | No puede confirmar sin pago |
| `orderStatus="cancelled"` + `paymentStatus="processing"` | No puede cancelar mientras el pago aún se procesa |
| `orderStatus="refunded"` + `paymentStatus="succeeded"` | Si se reembolsó, el estado del pago debería reflejar el reembolso |
| `orderStatus="cancelled"` + `paymentStatus="failed"` | Sin pago que cancelar si falló |

### Diagrama de Flujo de Estados

```
                                     ┌─────────────────────────────────────────┐
                                     │                                         │
                                     ▼                                         │
 ┌─────────┐    payment succeeded    ┌─────┐    fulfillment triggered     ┌───────────┐    admin refund    ┌──────────┐
 │ PENDING │ ──────────────────────► │ PAID │ ───────────────────────────► │ CONFIRMED │ ──────────────────► │ REFUNDED │
 └─────────┘                        └─────┘                              └───────────┘                     └──────────┘
      │                                     │                                     │
      │ cancel                              │ cancel                              │
      ▼                                     ▼                                     │
 ┌───────────┐                         ┌───────────┐                             │
 │ CANCELLED │ ◄────────────────────── │ CANCELLED │                             │
 └───────────┘                         └───────────┘                             │
      │                                     │                                     │
      │ (if payment captured)               │ (if payment captured)               │
      ▼                                     ▼                                     │
 ┌──────────┐                         ┌──────────┐ ────────────────────────────────┘
 │ REFUNDED │                         │ REFUNDED │
 └──────────┘                         └──────────┘
```

### Matriz de Transición: Acciones Admin vs Sistema

| Estado Actual | Admin Puede Transicionar A | Sistema Transiciona A | Disparadores Automáticos |
|---------------|---------------------------|-----------------------|-------------------------|
| `pending` | `cancelled` | `paid` | Webhook de Stripe `payment_intent.succeeded` |
| `paid` | `cancelled`, `refunded` | `confirmed` | Función `create-checkout` |
| `confirmed` | `refunded` | — (terminal para auto) | Validación de ticket completa |
| `cancelled` | `refunded` (si pagó) | — (terminal) | — |
| `refunded` | — | — (terminal) | — |

---

## Flujo de Decisión: Transiciones de Estado del Pedido

```
INICIO: Pedido Creado (status = "pending")
│
├──► ¿El pago está confirmado?
│    │
│    ├──► NO ─ ¿El checkout fue abandonado/expiró?
│    │         └──► SÍ ─ El pedido permanece pending (limpieza eventual)
│    │         └──► NO ─ Esperar webhook de Stripe
│    │
│    └──► SÍ ─ Webhook de Stripe recibido
│              └──► status se convierte en "paid"
│
├──► ¿Admin decide cancelar?
│    └──► SÍ ─ status se convierte en "cancelled"
│              └──► ¿El pago fue capturado?
│                    ├──► SÍ ─ Admin debería emitir reembolso → "refunded"
│                    └──► NO ─ Estado terminal
│
└──► Pago capturado (status = "paid")
      │
      ├──► Cumplimiento disparado automáticamente
      │     └──► status se convierte en "confirmed"
      │           └──► Tickets/pase activado
      │
      └──► Admin emite reembolso antes del cumplimiento
            └──► status se convierte en "refunded"
```

---

## Filtrar Pedidos

Navega a **Ventas → Pedidos** para acceder a la lista de pedidos.

### Filtro de Estado

| Opción de Filtro | Muestra Pedidos Con |
|-----------------|---------------------|
| Todos los Estados | Todos los pedidos sin importar el estado |
| Pendiente | Pedidos esperando pago |
| Pagado | Pedidos con pago confirmado |
| Confirmado | Pedidos con cumplimiento iniciado |
| Cancelado | Pedidos cancelados |
| Reembolsado | Pedidos reembolsados |

### Filtro de Estado de Pago

| Opción de Filtro | Muestra Pedidos Con |
|-----------------|---------------------|
| Todos los Pagos | Todos los pedidos |
| Pendiente | Checkout iniciado, sin pago |
| Procesando | Pago en vuelo |
| Exitoso | Pago capturado |
| Fallido | Pago declinado |
| Reembolsado | Pago devuelto |

---

## Acciones de Admin por Estado

### Pedidos Pendientes

| Acción | Descripción | Efecto |
|--------|-------------|--------|
| Ver Detalles | Abrir página de detalle del pedido | Navegar a vista completa del pedido |
| Cancelar | Cancelar el pedido | `status → cancelled` |

### Pedidos Pagados

| Acción | Descripción | Efecto |
|--------|-------------|--------|
| Ver Detalles | Abrir página de detalle del pedido | Navegar a vista completa del pedido |
| Cancelar | Cancelar antes del cumplimiento | `status → cancelled` |
| Marcar Reembolsado | Procesar reembolso directamente | `status → refunded`, pago reembolsado |

### Pedidos Confirmados

| Acción | Descripción | Efecto |
|--------|-------------|--------|
| Ver Detalles | Abrir página de detalle del pedido | Navegar a vista completa del pedido |
| Ver Tickets | Ver tickets generados | Lista de tickets para este pedido |
| Emitir Reembolso | Reembolsar después del cumplimiento | `status → refunded`, pago reembolsado |

### Pedidos Cancelados

| Acción | Descripción | Efecto |
|--------|-------------|--------|
| Ver Detalles | Abrir página de detalle del pedido | Navegar a vista completa del pedido |
| Emitir Reembolso | Reembolsar pago capturado | `paymentStatus → refunded` |

### Pedidos Reembolsados

| Acción | Descripción | Efecto |
|--------|-------------|--------|
| Ver Detalles | Abrir página de detalle del pedido | Navegar a vista completa del pedido |
| Ver Reembolso | Ver detalles del reembolso | Registros de pago con info del reembolso |

---

## Errores Comunes

### Cancelar Sin Reembolso

**Problema:** Cancelar un pedido pagado sin emitir un reembolso.

**Impacto:** El pago del cliente es capturado pero no devuelto.

**Flujo Correcto:**
1. Cancelar pedido → status se convierte en `cancelled`
2. Emitir reembolso → pago devuelto, status se convierte en `refunded`

---

### Emitir Reembolso Antes de Cancelación

**Problema:** Intentar reembolsar sin cancelar primero (cuando el estado del pedido requiere cancelación).

**Flujo Correcto:**
1. Cancelar el pedido primero
2. Luego emitir el reembolso

---

### Cancelar Durante Procesamiento

**Problema:** Intentar cancelar un pedido con `paymentStatus = "processing"`.

**Impacto:** No se puede cancelar mientras el pago aún está en vuelo.

**Flujo Correcto:**
1. Esperar que el pago alcance estado final (`succeeded` o `failed`)
2. Luego proceder con cancelación o cumplimiento

---

### Ignorar Tickets Después del Reembolso

**Problema:** Reembolsar un pedido confirmado sin considerar los tickets emitidos.

**Impacto:** Los tickets permanecen válidos hasta ser invalidados manualmente.

**Flujo Correcto:**
1. Emitir reembolso para el pedido
2. Invalidar/cancelar manualmente cualquier ticket emitido en **Ventas → Tickets**

---

### Modificar Precios Después de la Compra

**Problema:** Ajustar niveles de precio después de que se han realizado compras.

**Impacto:** Los pedidos históricos mantienen instantáneas congeladas; los cambios no afectan pedidos pasados.

**Nota:** Los cambios de precio solo afectan nuevos pedidos. Los pedidos existentes preservan el precio al momento de la compra.

---

## Línea de Tiempo del Pedido

Cada pedido mantiene una línea de tiempo de eventos:

```
1. Pedido Creado
   └── status: "pending"
   └── paymentStatus: "pending"
   
2. Pago Iniciado (si Stripe Checkout)
   └── paymentStatus: "processing"
   
3a. Pago Exitoso ───────────────────────────────────────────┐
   └── paymentStatus: "succeeded"                           │
   └── status: "paid"                                       │
                                                               │
3b. Pago Fallido                                             │
   └── paymentStatus: "failed"                               │
   └── status permanece: "pending"                           │
                                                               │
4. Cumplimiento Disparado (automático)                      │
   └── status: "confirmed"                                   │
   └── Tickets generados                                     │
   └── Créditos de pase activados                            │
                                                               │
5. Reembolso Emitido (si aplica)                            │
   └── paymentStatus: "refunded"                             │
   └── status: "refunded"                                    │
                                                               │
6. Pedido Cancelado (si aplica) ───────────────────────────┘
   └── status: "cancelled"
```

---

## Páginas Relacionadas

- [Venta Asistida](/docs/sales/assisted-sale) — Crear pedidos manualmente en nombre de los clientes
- [Tickets](/docs/system/tickets) — Ver y validar tickets para check-in
- [Clientes](/docs/system/clients) — Ver historial de compras de clientes

---

## Referencia de Base de Datos

**Colección:** `orders` (definida en `appwrite.json`)

**Atributos Clave:**

| Atributo | Tipo | Descripción |
|----------|------|-------------|
| `status` | enum | Estado del pedido: pending, paid, confirmed, cancelled, refunded |
| `paymentStatus` | enum | Estado del pago: pending, processing, succeeded, failed, refunded |
| `stripeSessionId` | string | ID de sesión de Stripe Checkout |
| `stripePaymentIntentId` | string | ID de Intención de Pago de Stripe |
| `paidAt` | datetime | Timestamp cuando el pago fue confirmado |
| `cancelledAt` | datetime | Timestamp cuando el pedido fue cancelado |

**Índices:**
- `idx_status` — Filtrar por estado del pedido
- `idx_paymentStatus` — Filtrar por estado del pago
- `idx_userId` — Filtrar por cliente
- `idx_orderNumber` — Búsqueda de número de pedido único