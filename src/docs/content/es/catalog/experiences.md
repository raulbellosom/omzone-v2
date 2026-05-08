---
title: Experiencias
description: Configuracion principal de experiencias publicables y vendibles
section: catalog
order: 1
lastUpdated: 2026-05-06
---

# Experiencias

Experiencias es la entidad padre de agenda, precios, addons y comportamiento de checkout.

## Controles Comerciales y de Reserva

### `saleMode`

- `direct`: checkout publico con pago Stripe embebido.
- `request`: flujo de solicitud (sin pago instantaneo directo).
- `assisted`: venta creada por admin/operator en wizard.
- `pass`: acceso enfocado en pases.

### `requiresSchedule`

- `true`: cliente/admin debe seleccionar slot valido en reserva.
- `false`: slot no es obligatorio en los pasos de checkout.

### `allowQuantity`, `minQuantity`, `maxQuantity`

- Definen limites de tamano de orden a nivel experiencia.
- El rango efectivo es la interseccion con reglas del tier y disponibilidad del slot.

### `status`

- `draft`: no reservable en publico.
- `published`: visible y elegible para checkout (siempre sujeto a tier/slot disponible).

## Notas Importantes de Comportamiento

1. La capacidad operativa la manda el slot.
2. Min/max de experiencia no reemplazan capacidad del slot; limitan tamano de compra.
3. Si `requiresSchedule=false`, pueden existir slots operativos pero no son requeridos por UX de checkout.
4. Campos de contenido (`publicName`, descripciones) afectan texto al cliente, no calculo de pago.

## Checklist de Publicacion

Antes de salir a produccion:

1. Experiencia en `status=published`.
2. Al menos un tier activo.
3. Si es agendada, al menos un slot futuro publicado con disponibilidad.
4. Compatibilidad de edicion entre tiers y slots valida.
5. Addons asignados compatibles con tipos soportados en checkout.

## Patrones Comunes de Mala Configuracion

- Experiencia publicada sin tier activo.
- Experiencia agendada con slots solo en draft/pasado/full.
- Tier ligado a edicion sin slots compatibles.
- Experiencia con min/max que conflicta con tier o con cupo de slot.

## Paginas Relacionadas

- [Niveles de Precio](./pricing-tiers.md)
- [Horarios y Agenda](../operations/slots.md)
- [Playbooks de Reservas](../reference/reservation-playbooks.md)
- [Flujos](../reference/flows.md)
