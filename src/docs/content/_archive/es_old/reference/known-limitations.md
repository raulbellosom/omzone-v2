---
title: Limitaciones Conocidas
description: Restricciones intencionales y limites de fase en reservas y pagos
section: reference
order: 4
lastUpdated: 2026-05-06
---

# Limitaciones Conocidas

Esta pagina describe restricciones intencionales de la fase actual. No deben tratarse como bugs por defecto.

## Reserva y Capacidad

1. La capacidad final operativa en checkout la manda el slot.
2. Min/max de experiencia y tier limitan tamano de orden, pero no sustituyen disponibilidad de slot.
3. `editions.capacity` es informativo en esta fase (sin enforcement en checkout).

## Compatibilidad Tier-Slot

1. Tier con `editionId` requiere slot con mismo `editionId`.
2. Una mala configuracion de edicion puede ocultar todos los slots para ese tier.

## Limites de Addons en Checkout Directo/Asistido

Soportados:
- `fixed`
- `per-person`

No soportados:
- `per-day`
- `per-unit`
- `quote`

Un addon requerido con tipo no soportado bloquea checkout por diseno.

## Restricciones de Venta Asistida

1. Para `requiresSchedule=true`, slot obligatorio en wizard.
2. En esta fase no existe bypass de slot para experiencias agendadas.

## Matiz Stripe y Estado de Orden

1. Checkout directo es embebido (`ui_mode=custom` + Payment Element), no redirect hosted legacy.
2. Ruta principal de exito: `pending -> confirmed` con `paymentStatus=succeeded`.
3. `paid` se conserva como estado legacy de compatibilidad operativa/historica.

## Limites de Calidad de Datos

1. Puede existir data legacy invalida en min/max.
2. Formularios admin deben bloquear nuevos valores invalidos, pero backend checkout sigue validando y puede rechazar legacy.

## Paginas Relacionadas

- [Playbooks de Reservas](./reservation-playbooks.md)
- [Flujos](./flows.md)
- [Solucion de Problemas](./troubleshooting.md)
