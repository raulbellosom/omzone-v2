---
title: Ediciones
description: Versiones vinculadas al tiempo de una experiencia con rangos de fechas específicos, ventanas de registro y capacidad
section: catalog
order: 2
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/experiences/:id/editions
  - /admin/experiences/:id/editions/new
  - /admin/experiences/:id/editions/:editionId/edit
relatedCollections:
  - editions
keywords:
  - edition
  - editiones
  - rango de fechas
  - capacidad
  - registro
  - retiro
---

# Ediciones

Las ediciones representan versiones o entregas específicas de una experiencia, cada una con su propio rango de fechas, ventana de registro y capacidad. Usa ediciones cuando necesites múltiples iteraciones vinculadas a fechas de la misma plantilla de experiencia.

## Cuándo Usar Ediciones

Las ediciones son ideales para:
- **Retiros** con fechas de inicio/fin específicas (ej., "Retiro de Primavera 2026")
- **Programas estacionales** con ventanas de inscripción limitadas
- **Programas de múltiples sesiones** donde cada entrega tiene logística diferente
- **Eventos de capacidad limitada** con cortes de registro

No todas las experiencias necesitan ediciones. Si una experiencia es una sesión recurrente con disponibilidad continua, solo podrías necesitar ranuras sin ediciones.

## Crear una Edición

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Ediciones -> Nueva edición**

### Sección de Identidad

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | Sí | Nombre de la edición (ej., "Retiro de Verano 2026") |
| `nameEs` | string | No | Nombre de la edición en español |
| `description` | text | No | Descripción en inglés para esta edición específica |
| `descriptionEs` | text | No | Descripción en español |

### Sección de Fechas

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `startDate` | datetime | No | Cuándo comienza esta edición |
| `endDate` | datetime | No | Cuándo termina esta edición |
| `registrationOpens` | datetime | No | Cuándo se habilita el registro |
| `registrationCloses` | datetime | No | Cuándo se cierra el registro (debe ser antes de startDate) |

### Sección de Capacidad y Estado

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `capacity` | integer | No | Máximo de participantes para esta edición (dejar vacío para ilimitado) |
| `status` | enum | Sí | `draft`, `open`, `closed`, `completed`, `cancelled` |
| `heroImageId` | file | No | Imagen de portada específica de la edición (anulación opcional) |

## Valores de Estado de Edición

| Estado | Significado |
|--------|-------------|
| `draft` | La edición existe pero no acepta registros |
| `open` | El registro está activo |
| `closed` | El registro está cerrado |
| `completed` | La edición ha concluido |
| `cancelled` | La edición fue cancelada |

## Flujo de Trabajo de Ediciones

```
draft -> open -> closed -> completed
              |
              v
          cancelled
```

### Ventanas de Registro

Usa `registrationOpens` y `registrationCloses` para crear períodos de inscripción vinculados al tiempo:

- `registrationOpens` - Fecha cuando los clientes pueden comenzar a reservar esta edición
- `registrationCloses` - Fecha cuando ya no se permite la reserva (típicamente antes de que comience la experiencia)

Si `registrationCloses` no está establecido, el registro permanece abierto hasta que comience la edición.

## Gestión de Capacidad

La `capacity` de la edición es separada de las capacidades de las ranuras. Usa la capacidad de edición para:
- Límites de inscripción generales para la edición
- Coordinar con capacidad externa (sede, socios)
- Comercializar ofertas de disponibilidad limitada

Las capacidades de las ranuras dentro de una edición no deben exceder la capacidad de la edición.

## Vincular Precios a Ediciones

Al crear [Niveles de Precio](../catalog/pricing-tiers.md), puedes opcionalmente vinculalos a una edición específica. Esto permite diferentes precios para diferentes rangos de fechas de la misma experiencia.

Por ejemplo:
- Nivel de precio "Reserva Temprana" vinculado a la edición "Retiro de Primavera 2026"
- Nivel de precio "Regular" vinculado a la edición "Retiro de Verano 2026"

## Errores Comunes

**Establecer endDate antes de startDate.**
La fecha de fin debe ser posterior a la fecha de inicio. El formulario mostrará un error si esto se viola.

**Establecer registrationCloses después de startDate.**
La fecha de cierre del registro debe ser antes de que comience la experiencia para permitir tiempo de preparación.

**Crear ediciones cuando solo las ranuras serían suficientes.**
Las ediciones agregan complejidad. Si solo necesitas programación basada en fechas, considera usar ranuras con `editionId` para referenciar una edición opcional en lugar de crear múltiples ediciones completas.

**Olvidar establecer la capacidad.**
Si una edición no tiene límite de capacidad, depende entièrement de las capacidades de las ranuras individuales. Si necesitas un tope de inscripción general, establece la capacidad de la edición.

## Páginas Relacionadas

- [Experiencias](./experiences.md) - Entidad padre para las ediciones
- [Niveles de Precio](./pricing-tiers.md) - Vincular precios a ediciones específicas
- [Ranuras y Agenda](../operations/slots.md) - Crear disponibilidad dentro de ediciones