---
title: Agenda y horarios
description: Cómo programar horarios para tus experiencias, gestionar la capacidad y usar la agenda global
section: admin
order: 7
lastUpdated: 2026-05-25
---

# Agenda y horarios

La **agenda** es donde programas cuándo se va a realizar cada experiencia. Cada horario tiene una fecha, una hora, un lugar y una capacidad máxima de asistentes.

---

## Cómo llegar

En el menú lateral ve a **Operaciones → Agenda**.

---

## La vista de agenda

La agenda muestra todos los horarios programados en todas las experiencias, en orden cronológico. Puedes:

- Ver los horarios de hoy, esta semana o este mes.
- Filtrar por experiencia o por recurso.
- Ver cuántos lugares quedan disponibles en cada horario.
- Hacer clic en cualquier horario para editarlo.

---

## Crear un horario

Puedes crear horarios desde dos lugares:

- Desde la **Agenda** global: haz clic en **Nuevo horario**.
- Desde la pestaña **Horarios** dentro de una experiencia específica.

Los campos al crear un horario:

### Experiencia

Selecciona a qué experiencia pertenece este horario. Si ya estás dentro de una experiencia, este campo se rellena automáticamente.

### Edición

Si la experiencia tiene varias ediciones (versiones), selecciona a cuál corresponde este horario.

### Fecha y hora de inicio

El día y la hora en que comienza la experiencia.

### Fecha y hora de fin

El día y la hora en que termina. Esto define la duración que verá el cliente.

### Capacidad máxima

Cuántas personas pueden asistir a este horario. Cuando se alcanza este número, el horario aparece como "Lleno" y los clientes no pueden reservar.

### Recursos asignados

Los instructores, salas o equipos necesarios para este horario. Selecciónalos de la lista de recursos que ya tienes registrados.

### Ubicación

El espacio físico donde se realizará la experiencia.

### Tipo de slot

El tipo de sesión:

- **`single_session`** — Evento individual con fecha y hora fijos (el tipo más común).
- **`private`** — Sesión privada, generalmente vinculada a una solicitud de reserva.

### Notas internas

Información adicional para tu equipo (no visible para los clientes).

---

## Estados de un horario

| Estado      | Qué significa                                                      |
| ----------- | ------------------------------------------------------------------ |
| `draft`     | No visible para los clientes — úsalo mientras configuras           |
| `published` | En vivo y reservable por los clientes                              |
| `full`      | Se alcanzó la capacidad máxima — no se aceptan más reservas        |
| `cancelled` | Horario cancelado — todos los tickets asociados quedan invalidados |

El sistema transiciona automáticamente el estado a **`full`** cuando se ocupan todos los lugares. No es necesario hacerlo manualmente.

> Solo los tipos **`single_session`** (sesión individual) y **`private`** (sesión privada) están disponibles en la interfaz. Otros tipos de slot existen en la base de datos para uso interno pero no están expuestos a los usuarios administradores.

---

## Cancelar un horario

Si necesitas cancelar un horario ya publicado:

1. Abre el horario desde la agenda.
2. Haz clic en **Cancelar horario**.
3. Confirma la acción.

> Al cancelar un horario con reservas activas, el sistema envía automáticamente un correo de notificación a los clientes afectados.

---

## Consejos para la agenda

- Programa los horarios con anticipación suficiente para que los clientes puedan planificar.
- Revisa la capacidad antes de publicar — si no tienes suficientes recursos (instructor, sala), no sobreprogrames.
- Usa las notas internas para comunicarte con tu equipo sobre detalles del horario.
