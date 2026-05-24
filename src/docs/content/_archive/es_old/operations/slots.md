---
title: Horarios y Agenda
description: Gestiona disponibilidad agendada y capacidad operativa para reservas
section: operations
order: 1
lastUpdated: 2026-05-06
---

# Horarios y Agenda

Los slots definen cuando se puede reservar una experiencia agendada y cuanto cupo real existe.

## Estados de Slot en Reserva

| Estado | Significado en flujo actual |
|---|---|
| `draft` | No visible para reserva |
| `published` | Elegible para reserva (si es futuro y compatible) |
| `full` | Sin disponibilidad |
| `cancelled` | No reservable |

## Autoridad de Capacidad

En checkout la capacidad la manda el slot:

`effectiveAvailable = capacity - bookedCount`

Este valor limita el maximo efectivo de cantidad al reservar.

## Compatibilidad por Edicion

Slots pueden estar ligados a edicion.

- Tier con `editionId` requiere slot con mismo `editionId`.
- Si no coincide, el slot se filtra/rechaza para ese tier.

## Minimo para que un Slot aparezca en Checkout

1. `status=published`
2. fecha/hora futura
3. disponibilidad positiva
4. compatibilidad por edicion con el tier seleccionado

## Ubicacion mostrada en Checkout

Cuando existe, checkout muestra metadatos de ubicacion del slot:
- nombre de location
- direccion
- nombre de room

Si falta direccion, no debe bloquear compra; se muestra lo disponible.

## Errores Operativos Comunes

1. Publicar tiers dejando slots en draft.
2. Crear slots con edicion incorrecta.
3. Asumir que el maximo de experiencia manda sobre cupo de slot.

## Paginas Relacionadas

- [Niveles de Precio](../catalog/pricing-tiers.md)
- [Experiencias](../catalog/experiences.md)
- [Playbooks de Reservas](../reference/reservation-playbooks.md)
