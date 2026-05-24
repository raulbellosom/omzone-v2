---
title: Flujos
description: Flujos operativos actuales para experiencias, checkout y ciclo de vida de orden
section: reference
order: 2
lastUpdated: 2026-05-06
relatedRoutes:
  - /admin/experiences
  - /admin/sales/new
  - /checkout
relatedCollections:
  - experiences
  - pricing_tiers
  - slots
  - orders
  - payments
keywords:
  - flujos
  - checkout
  - stripe
  - venta asistida
---

# Flujos

Esta pagina resume el comportamiento real actual. Para escenarios paso a paso usa [Playbooks de Reservas](./reservation-playbooks.md).

## Flujo Base de Reserva (Directo)

1. Cliente selecciona tier de precio.
2. Si `requiresSchedule=true`, cliente debe seleccionar un slot futuro compatible.
3. Cantidad se valida con limites efectivos:
   - Min/max de experiencia
   - Min/max de tier
   - Disponibilidad del slot (`capacity - bookedCount`)
4. Cliente revisa addons y datos.
5. Sistema crea contexto de checkout y muestra Stripe Payment Element embebido.
6. Webhook confirma pago y acciones del ciclo de vida.

## Flujo Base de Reserva (Asistido)

1. Admin/operator usa wizard: Cliente -> Experiencia -> Tier -> Slot -> Addons -> Cantidad -> Revision.
2. Slot es obligatorio en experiencias agendadas (`requiresSchedule=true`).
3. Metodo de pago:
   - Pago manual, o
   - Link Stripe para pago posterior del cliente.
4. Backend confirma orden y dispara cadena de cumplimiento.

## Reglas de Compatibilidad

### Compatibilidad Tier-Slot

- Si tier tiene `editionId`, solo acepta slots con el mismo `editionId`.
- Si tier no tiene `editionId`, puede usar slots generales compatibles.

### Autoridad de Capacidad

- La capacidad operativa siempre la manda el slot.
- Disponibilidad efectiva: `capacity - bookedCount`.
- `editions.capacity` es informativo en esta fase.

### Tipos de Precio de Addons en Checkout

- Soportados: `fixed`, `per-person`.
- No soportados en checkout directo/asistido en esta fase: `per-day`, `per-unit`, `quote`.

## Flujo de Pago Stripe (Actual)

- Checkout directo usa Stripe Checkout Session con `ui_mode=custom`.
- El pago es embebido (Payment Element) dentro de OMZONE.
- La confirmacion oficial de pago/cumplimiento se toma desde webhook.
- No tomar solo el estado de frontend como confirmacion final.

## Ciclo de Vida de Orden (Modelo Operativo)

- Ruta principal exitosa: `pending -> confirmed` con `paymentStatus=succeeded`.
- `paid` se documenta como estado legacy/compatibilidad operativa.
- Cancelacion y reembolso siguen por acciones admin.

## Puntero de Diagnostico

Si no aparecen fechas/horarios, ejecuta la checklist de [Playbooks de Reservas](./reservation-playbooks.md#checklist-rapida-admin-si-no-aparecen-fechas-u-horarios).

## Paginas Relacionadas

- [Playbooks de Reservas](./reservation-playbooks.md)
- [Limitaciones Conocidas](./known-limitations.md)
- [Experiencias](../catalog/experiences.md)
- [Niveles de Precio](../catalog/pricing-tiers.md)
- [Horarios y Agenda](../operations/slots.md)
- [Ordenes](../sales/orders.md)
