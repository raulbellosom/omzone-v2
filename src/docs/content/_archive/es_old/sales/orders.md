---
title: Ordenes
description: Estados operativos de orden y pago para checkout y venta asistida
section: sales
order: 1
lastUpdated: 2026-05-06
---

# Ordenes

Las ordenes guardan snapshots inmutables de compra y son la fuente principal para operacion de reservas y pagos.

## Modelo Actual de Estados de Orden

| Estado de Orden | Significado | Disparador Tipico |
|---|---|---|
| `pending` | Orden creada, pago sin confirmar | Contexto de checkout creado |
| `confirmed` | Pago validado e inicio de cumplimiento | Webhook Stripe o ruta manual asistida |
| `cancelled` | Orden cancelada | Accion admin |
| `refunded` | Pago reembolsado | Accion admin / flujo de reembolso |
| `paid` | Estado legacy de compatibilidad | Ruta historica/legacy |

## Modelo de Estado de Pago

| Estado de Pago | Significado |
|---|---|
| `pending` | Pago no finalizado |
| `processing` | Pago en proceso |
| `succeeded` | Pago confirmado |
| `failed` | Pago fallido |
| `refunded` | Pago reembolsado |

## Aclaracion Importante sobre `paid`

`paid` se conserva por compatibilidad e historial.  
La ruta principal de exito actual es:

`pending -> confirmed` con `paymentStatus=succeeded`.

Si aparece `paid`, tratalo como estado transicional/legacy, no como endpoint principal del checkout directo actual.

## Ciclo de Vida Checkout Directo (Actual)

1. Orden inicia en `pending`.
2. Pago embebido Stripe se confirma.
3. Webhook valida evento y actualiza orden.
4. Orden pasa a `confirmed`.
5. Se registra pago en `payments`.
6. Se reconcilia capacidad de slot y se dispara generacion de tickets.

## Ciclo de Vida Venta Asistida (Actual)

### Pago Manual
- Ruta asistida puede terminar en `confirmed/succeeded` directamente despues de validar.

### Link Stripe
- Orden queda pendiente hasta confirmacion por webhook.
- Luego pasa a `confirmed/succeeded`.

## Operacion Admin

Acciones comunes:
- Cancelar orden (`cancelled`)
- Marcar reembolsada (`refunded`)
- Reintentar side effects de cumplimiento (si aplica)

Antes de cancelar/reembolsar una reserva confirmada, valida impacto en tickets y asistencia.

## Snapshot y Trazabilidad

- El snapshot congela valores de experiencia/tier/addon al momento de compra.
- No reconstruir historico con relaciones mutables en vivo.
- El contexto de restricciones aplicadas debe mantenerse trazable.

## Paginas Relacionadas

- [Playbooks de Reservas](../reference/reservation-playbooks.md)
- [Venta Asistida](./assisted-sale.md)
- [Flujos](../reference/flows.md)
- [Limitaciones Conocidas](../reference/known-limitations.md)
