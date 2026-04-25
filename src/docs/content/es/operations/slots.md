---
title: Horarios y Agenda
description: Crear y gestionar franjas horarias de disponibilidad para experiencias programadas, incluyendo patrones recurrentes y asignaciones de recursos
section: operations
order: 1
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/agenda
  - /admin/experiences/:id/slots
  - /admin/experiences/:id/slots/new
  - /admin/experiences/:id/slots/:slotId/edit
  - /admin/experiences/:id/slots/quick-create
relatedCollections:
  - slots
  - slot_resources
  - resources
  - locations
  - rooms
keywords:
  - horario
  - agenda
  - calendario
  - disponibilidad
  - reservación
---

# Horarios y Agenda

Los horarios representan instancias específicas de fecha/hora cuando una experiencia está disponible para reservación. Los horarios son la capa de disponibilidad que conecta las experiencias con el calendario.

## Comprensión de los Horarios

Un horario contiene:
- A qué experiencia pertenece (requerido)
- A qué edición pertenece (opcional)
- Rango de fecha/hora con zona horaria
- Capacidad (máximo de participantes)
- Asignaciones de ubicación y sala
- Asignaciones de recursos (instructores, equipo)
- Estado

## Acceso a los Horarios

### Horarios a Nivel de Experiencia

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Horarios**

Utiliza esto para crear horarios para una experiencia específica.

### Agenda Global

Navega a **Operaciones -> Agenda**

Visualiza todos los horarios de todas las experiencias en un calendario unificado. Utiliza la agenda global para:
- Ver todas las sesiones programadas de un vistazo
- Identificar conflictos de programación
- Planificar la asignación de recursos

## Crear un Solo Horario

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Horarios -> Nuevo horario**

### Sección de Información Básica

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `slotType` | enum | Sí | `single_session`, `multi_day`, `retreat_day`, `private` |
| `edition` | referencia | No | Enlace a una edición específica |

**Tipos de Horario:**

| Tipo | Caso de Uso |
|------|-------------|
| `single_session` | Sesión única con fecha y hora de inicio y fin |
| `multi_day` | Abarca múltiples días con fecha y hora de inicio y fin |
| `retreat_day` | Un solo día dentro de un retiro de varios días |
| `private` | Sesión privada con participantes específicos |

### Sección de Fecha y Hora

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `startDatetime` | datetime | Sí | Fecha y hora de inicio |
| `endDatetime` | datetime | Sí | Fecha y hora de fin |
| `timezone` | string | Sí | Zona horaria (ej. America/Mexico_City) |

**Zonas Horarias Disponibles:**
- Ciudad de México (CST) - `America/Mexico_City`
- Cancún (EST) - `America/Cancun`
- Tijuana (PST) - `America/Tijuana`

### Sección de Ubicación

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `locationId` | referencia | No | Ubicación física |
| `roomId` | referencia | No | Sala o espacio dentro de la ubicación |

Las ubicaciones y salas se crean en **Operaciones -> Recursos -> Ubicaciones** y la pestaña **Salas**.

### Sección de Capacidad

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `capacity` | integer | Sí | Máximo de participantes (debe ser mayor que 0) |

### Sección de Estado y Notas

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `status` | enum | Sí | `draft`, `published`, `full`, `cancelled` |
| `notes` | text | No | Notas internas (no visibles para los clientes) |

**Valores de Estado del Horario:**

| Estado | Significado |
|--------|-------------|
| `draft` | No publicado aún, no visible para los clientes |
| `published` | Disponible para reservación |
| `full` | Capacidad alcanzada, no más reservaciones |
| `cancelled` | Ya no disponible |

## Crear Horarios Recurrentes (Creación Rápida)

Para horarios recurrentes regulares (ej. "Todos los lunes a las 9am"), utiliza Creación Rápida:

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Horarios -> Creación Rápida**

### Paso 1: Definir el Patrón

Selecciona días de la semana:
- Lunes, Martes, Miércoles, Jueves, Viernes, Sábado, Domingo

Selecciona al menos un día.

### Paso 2: Definir el Rango de Fechas

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `startDate` | date | Sí | Primera ocurrencia |
| `endDate` | date | Sí | Última ocurrencia |
| `startTime` | time | Sí | Hora de inicio de la sesión |
| `endTime` | time | Sí | Hora de fin de la sesión |
| `timezone` | string | Sí | Zona horaria |

### Paso 3: Definir Logística

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `capacity` | integer | Sí | Máx. participantes por horario |
| `locationId` | referencia | No | Ubicación para todos los horarios |
| `roomId` | referencia | No | Sala para todos los horarios |
| `slotType` | enum | Sí | Tipo para todos los horarios |

La Creación Rápida generará horarios para cada día que coincida dentro del rango de fechas.

## Asignar Recursos a Horarios

Los recursos (instructores, facilitadores, terapeutas, equipo) pueden ser asignados a horarios:

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Horarios -> [Nombre del Horario] -> Recursos**

### Campos de Asignación

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `resourceId` | referencia | Sí | El recurso a asignar |
| `role` | enum | Sí | `lead`, `assistant`, `support`, `equipment` |

**Roles de Recurso:**

| Rol | Descripción |
|-----|-------------|
| `lead` | Instructor o facilitador principal |
| `assistant` | Maestro o ayudante de apoyo |
| `support` | Soporte técnico o logístico |
| `equipment` | Equipo en uso |

### Flujo de Trabajo de Asignación de Recursos

1. Abre un horario
2. Ve a la pestaña Recursos
3. Haz clic en "Asignar recurso"
4. Busca y selecciona un recurso
5. Elige el rol
6. Agrega notas opcionales
7. Confirma la asignación

## Ciclo de Vida del Estado del Horario

```
draft -> published -> full | cancelled
```

### Publicar un Horario

Establece el estado en `published` para hacer el horario visible y reservable.

### Cancelar un Horario con Reservaciones Activas

Si un horario tiene reservaciones existentes y necesita cancelarse:
1. Una advertencia muestra la cantidad de reservaciones activas
2. Confirma la cancelación
3. Los clientes con reservaciones existentes deben ser notificados manualmente

### Horarios Completos

Cuando `bookedCount` iguala a `capacity`, el estado del horario puede establecerse manualmente en `full` o puede actualizarse automáticamente según la configuración.

## Errores Comunes

**Crear horarios sin verificar las fechas de la edición.**
Si el horario está vinculado a una edición, asegúrate de que la fecha/hora del horario caiga dentro de las fechas de inicio y fin de la edición.

**No establecer la capacidad.**
La capacidad debe ser mayor que 0. Considera las restricciones físicas de la sala y los requisitos de la experiencia.

**Olvidar publicar los horarios.**
Los horarios default al estado `draft`. Los horarios en draft no son visibles para los clientes. Recuerda publicar los horarios cuando estén listos.

**Establecer endDatetime antes de startDatetime.**
La hora de fin debe ser posterior a la hora de inicio. El formulario mostrará un error.

**No asignar recursos cuando se necesitan.**
Si una experiencia requiere instructores o equipo específico, asigna recursos a los horarios para rastrear disponibilidad y requisitos.

## Vista de Agenda Global

La agenda global (**Operaciones -> Agenda**) muestra todos los horarios de todas las experiencias:
- Filtrar por estado (todos, publicados, cancelados)
- Filtrar por tipo de experiencia
- Ver en formato tabla o calendario
- Navegación rápida a horarios individuales

Utiliza la agenda global para:
- Identificar conflictos de programación
- Planificar la asignación de personal
- Vista general de las actividades de la semana

## Páginas Relacionadas

- [Experiencias](../catalog/experiences.md) - Entidad padre para horarios
- [Ediciones](../catalog/editions.md) - Enlace opcional a edición
- [Recursos](./resources.md) - Instructores, facilitadores y equipo
- [Ubicaciones](./locations.md) - Ubicaciones físicas y salas