---
title: Tickets
description: Gestionar tickets de reserva y check-ins
section: system
order: 1
lastUpdated: 2026-04-25
---

# Tickets

Los tickets son confirmaciones digitales de reserva generadas cuando los clientes compran experiencias con `fulfillmentType: ticket`. Cada ticket contiene detalles de la reserva, información de asistentes y un código QR único para validación de check-in en el lugar.

## Ciclo de Vida del Ticket

```
pending → confirmed → used
     ↓         ↓
  cancelled  expired
```

| Estado | Descripción |
|--------|-------------|
| `pending` | Ticket creado pero pedido aún no confirmado |
| `confirmed` | Ticket válido y listo para usar |
| `used` | Cliente ha hecho check-in en el lugar |
| `cancelled` | Ticket cancelado (pedido cancelado o manual) |
| `expired` | Ticket posterior a la fecha/hora del slot programado |

> **Generación automática:** Los tickets se generan automáticamente cuando un pedido transiciona al estado `confirmed`. Esto sucede después del procesamiento exitoso del pago.

## Campos del Ticket

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ID del Ticket | string | Identificador único |
| Código QR | string | Código QR único para check-in |
| ID del Pedido | relación | Referencia al pedido padre |
| Slot | relación | Slot programado |
| Experiencia | relación | Experiencia reservada |
| Edición | relación | Edición (si aplica) |
| Nivel de Precio | relación | Nivel de precio seleccionado |
| Nombre del Cliente | string | Nombre completo del asistente |
| Email del Cliente | string | Email del asistente |
| Cantidad | integer | Número de espacios |
| Estado | enum | `pending`, `confirmed`, `used`, `cancelled`, `expired` |
| Checked In A las | datetime | Timestamp del check-in |
| Checked In Por | relación | Operador que validó |

## Ver Tickets

Navega a **Sistema → Tickets** para acceder a la lista de tickets.

### Filtrar Tickets

| Filtro | Opciones |
|--------|----------|
| Estado | Todos, pending, confirmed, used, cancelled, expired |
| Rango de Fecha | Filtrar por fecha del slot |
| Experiencia | Filtrar por experiencia |
| Ubicación | Filtrar por lugar |

### Acciones de Ticket

| Acción | Descripción |
|--------|-------------|
| Ver Detalles | Abrir página de detalle del ticket con información completa |
| Validar QR | Abrir escáner de check-in |
| Cancelar Ticket | Cancelar y liberar capacidad del slot |
| Reenviar Email | Reenviar confirmación al cliente |
| Imprimir Ticket | Generar versión imprimible |

## Proceso de Check-In

El proceso de check-in valida los tickets y registra la asistencia al lugar.

### Acceder al Check-In

Navega a **Sistema → Check-In** o presiona `Ctrl+K` → "Escáner de Check-In"

### Flujo de Validación

1. **Escanear código QR** o buscar por ID de pedido/ticket
2. **El sistema valida:**
   - El ticket existe y es válido
   - El estado del ticket es `confirmed`
   - El estado de pago del pedido es `paid` o `confirmed`
   - La fecha/hora del slot coincide con la ventana de tiempo actual
   - El ticket no ha sido registrado previamente
3. **Mostrar resultado:**
   - Éxito: Muestra nombre del cliente y detalles de la reserva
   - Fallo: Muestra mensaje de error explicando por qué

### Errores de Validación

| Error | Causa |
|-------|-------|
| Ticket no encontrado | Código QR no reconocido |
| Ticket ya usado | Check-in ya registrado |
| Pedido no pagado | Pago no confirmado |
| Ventana de tiempo incorrecta | Check-in fuera de la ventana permitida |
| Slot cancelado | El slot asociado fue cancelado |

### Completar Check-In

1. Escanear o buscar ticket válido
2. Verificar identidad del asistente (nombre coincide)
3. Clic en botón **Check In**
4. El sistema registra timestamp y operador

## Reportes de Check-In

| Reporte | Descripción |
|---------|-------------|
| Asistencia Diaria | Tickets check-in por fecha |
| Desglose por Experiencia | Asistencia por experiencia |
| Reporte de No Presentados | Tickets confirmados sin check-in |
| Check-Ins Tardíos | Check-ins después de la hora de inicio del slot |

## Página de Detalle del Ticket

### Secciones de Información

**Detalles de la Reserva:**
- Nombre y tipo de experiencia
- Fecha, hora, ubicación y sala del slot
- Nombre de la edición (si aplica)
- Nivel de precio

**Información del Cliente:**
- Nombre completo
- Email
- Teléfono
- Número de asistentes

**Línea de Tiempo de Estado:**
- Creado (pedido realizado)
- Confirmado (pago recibido)
- Check In (timestamp y operador)

### Visualización del Código QR

La página de detalle del ticket muestra:
- Código QR grande para escaneo
- ID del ticket en texto plano
- Imagen del código QR descargable

## Errores Comunes

- **Check-in de ticket incorrecto:** Siempre verificar que el nombre del cliente coincida con la reserva antes de marcar como check-in.
- **Double check-in:** El sistema previene check-ins duplicados, pero verificar manualmente si el error parece incorrecto.
- **Ventana de tiempo incorrecta:** Los tickets solo pueden ser marcados como check-in durante la ventana permitida (típicamente 30 minutos antes a 30 minutos después del inicio del slot).
- **Ignorar cancelación de slot:** Si un slot es cancelado, todos los tickets asociados se vuelven inválidos incluso si previamente fueron confirmados.
- **Liberar capacidad incorrectamente:** Al cancelar tickets, asegurar que la capacidad del slot sea liberada correctamente para re-reserva.

## Páginas Relacionadas

- [Pedidos](/docs/sales/orders) — Ver pedidos que generaron tickets
- [Horarios](/docs/operations/slots) — Gestionar disponibilidad de slots
- [Check-In](/docs/operations/check-in) — Interfaz dedicada de check-in