---
title: Venta Asistida
description: Flujo guiado de reserva para admin/operator con pago manual o link Stripe
section: sales
order: 2
lastUpdated: 2026-05-06
---

# Venta Asistida

Venta Asistida es el wizard de admin/operator para crear reservas en nombre de un cliente.

## Flujo del Wizard

1. Cliente
2. Experiencia
3. Tier de Precio
4. Slot (obligatorio cuando `requiresSchedule=true`)
5. Addons
6. Cantidad
7. Revision + Metodo de Pago

## Reglas Criticas

### Slot Obligatorio en Experiencias Agendadas

Si la experiencia seleccionada tiene `requiresSchedule=true`, el wizard exige un slot valido.  
En esta fase no hay bypass/skip de slot.

### Compatibilidad Tier-Slot por Edicion

- Tier con `editionId` solo acepta slots con el mismo `editionId`.
- Selecciones incompatibles deben rechazarse.

### Restricciones de Cantidad

Cantidad se valida por interseccion efectiva de:
- Min/max de experiencia
- Min/max de tier
- Disponibilidad del slot

### Addons en Checkout Asistido

- Tipos soportados: `fixed`, `per-person`.
- No soportados en esta fase: `per-day`, `per-unit`, `quote`.
- Addons requeridos no soportados bloquean cierre.

## Metodos de Pago

### Pago Manual
- Crea orden asistida en ruta manual confirmada/succeeded.
- Dispara side effects de cumplimiento (tickets) tras crear orden.

### Link Stripe
- Crea orden + link de pago.
- Confirmacion final llega por webhook cuando paga el cliente.

## Buenas Practicas Operativas

1. Verifica cupo del slot antes de confirmar.
2. Confirma email del cliente si enviaras link Stripe.
3. Revisa soporte de tipos de addon antes de cerrar.
4. Si no hay slots, corrige configuracion de agenda antes de continuar.

## Paginas Relacionadas

- [Playbooks de Reservas](../reference/reservation-playbooks.md)
- [Ordenes](./orders.md)
- [Niveles de Precio](../catalog/pricing-tiers.md)
- [Horarios y Agenda](../operations/slots.md)
