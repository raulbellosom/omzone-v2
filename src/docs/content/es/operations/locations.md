---
title: Ubicaciones
description: Gestionar ubicaciones físicas y salas donde se realizan las experiencias
section: operations
order: 3
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/resources (Locations tab)
  - /admin/resources/locations/new
  - /admin/resources/locations/:id/edit
  - /admin/resources/rooms/new
  - /admin/resources/rooms/:id/edit
relatedCollections:
  - locations
  - rooms
keywords:
  - location
  - ubicación
  - venue
  - sala
  - espacio
  - estudio
---

# Ubicaciones

Las ubicaciones son lugares físicos donde se realizan las experiencias. Cada ubicación puede contener múltiples salas y espacios.

## Crear una Ubicación

Navega a **Operaciones -> Recursos -> Ubicaciones -> Nueva ubicación**

### Campos de Ubicación

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | Sí | Nombre de la ubicación (ej., "Estudio Tulum") |
| `address` | string | No | Dirección física completa |
| `coordinates` | string | No | Latitud,longitud (ej., "20.2114,-87.4653") |
| `description` | text | No | Descripción de la ubicación |
| `isActive` | boolean | Sí | Si la ubicación está disponible |

### Dirección y Coordenadas

El campo `address` almacena la dirección completa para propósitos de visualización.

El campo `coordinates` (formato: latitud,longitud) habilita:
- Integración de mapas
- Funciones de geolocalización
- Cálculos de distancia

Ambos campos son opcionales pero recomendados para venues que sirven a clientes.

## Crear una Sala

Navega a **Operaciones -> Recursos -> Salas -> Nueva sala**

### Campos de Sala

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `locationId` | reference | Sí | Ubicación padre |
| `name` | string | Sí | Nombre de la sala (ej., "Estudio Principal") |
| `type` | enum | No | `studio`, `therapy_room`, `outdoor`, `pool_area`, `other` |
| `capacity` | integer | No | Máximo número de participantes |
| `description` | text | No | Descripción de la sala |
| `isActive` | boolean | Sí | Si la sala está disponible |

### Tipos de Sala

| Tipo | Descripción |
|------|-------------|
| `studio` | Espacio general de práctica o clase |
| `therapy_room` | Espacio pequeño para tratamientos |
| `outdoor` | Espacio al aire libre |
| `pool_area` | Espacio junto a la piscina |
| `other` | Otros tipos de espacios |

## Jerarquía de Ubicación

```
Ubicación (ej., "Centro de Yoga Tulum")
  ├── Sala 1 (ej., "Estudio Principal")
  ├── Sala 2 (ej., "Sala de Meditación")
  └── Sala 3 (ej., "Terraza al Aire Libre")
```

## Usar Ubicaciones en Ranuras

Al crear o editar una ranura, puedes asignar:
- Una ubicación (el venue)
- Una sala (espacio específico dentro del venue)

La selección de sala solo aparece después de seleccionar una ubicación. Primero debes seleccionar una ubicación, luego seleccionar la sala.

## Ubicación en Visualización de Ranura

Las ranuras muestran su ubicación y sala asignadas:
- **Ubicación** - El nombre del venue
- **Sala** - El espacio específico dentro del venue

Esto ayuda a los clientes a entender dónde se realizará una experiencia.

## Errores Comunes

**Crear salas sin seleccionar una ubicación primero.**
Las salas deben pertenecer a una ubicación. Al crear una sala, debes seleccionar la ubicación padre del dropdown. Si no existe ninguna ubicación, crea una primero.

**No establecer capacidad de sala.**
La capacidad ayuda a prevenir sobreventa. Establece el máximo de participantes basándote en las restricciones del espacio físico.

**Establecer coordenadas de ubicación incorrectamente.**
Las coordenadas deben estar en formato "latitud,longitud" (ej., "20.2114,-87.4653"). No incluyas espacios u otros caracteres.

**Archivar una ubicación con salas activas.**
Si una ubicación ya no se usa, desactívala. Esto se cascada a todas las salas bajo ella, previniendo nuevas asignaciones de ranuras.

## Páginas Relacionadas

- [Ranuras y Agenda](./slots.md) - Donde se asignan ubicaciones y salas
- [Recursos](./resources.md) - Instructores y equipo que trabajan en ubicaciones