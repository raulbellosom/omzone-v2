---
title: Niveles de Precio
description: Configura precios por tier, compatibilidad por edicion y limites de personas
section: catalog
order: 3
lastUpdated: 2026-05-06
---

# Niveles de Precio

Los tiers definen opciones comprables para una experiencia.

## Campos que Impactan Checkout

### `isActive`

Solo tiers activos se pueden seleccionar en checkout.

### `editionId` (opcional)

Si existe, el tier solo funciona con slots de la misma edicion.

### `minPersons` / `maxPersons` (opcional)

Limites de cantidad a nivel tier.  
Se intersectan con:
- Min/max de experiencia
- Disponibilidad del slot

### `priceType`

El tipo de precio del tier afecta el calculo base de la orden (item principal).  
Para reglas de addons en checkout, revisa [Playbooks de Reservas](../reference/reservation-playbooks.md).

## Regla de Compatibilidad (Tier -> Slot)

1. Tier con `editionId = X` -> solo slots con `editionId = X`.
2. Tier sin `editionId` -> puede usar slots generales compatibles.

Si no quedan slots compatibles, el cliente no puede avanzar en checkout agendado para ese tier.

## Errores Comunes de Configuracion

1. `minPersons > maxPersons`.
2. Tier ligado a edicion sin slots futuros publicados.
3. Tier activo pero slots compatibles en pasado o sin cupo.

## Validacion Esperada en Admin

- Nuevos limites invalidos deben bloquearse al guardar.
- Datos legacy invalidos pueden existir y se rechazan en validacion de checkout.

## Paginas Relacionadas

- [Experiencias](./experiences.md)
- [Horarios y Agenda](../operations/slots.md)
- [Playbooks de Reservas](../reference/reservation-playbooks.md)
