---
title: "Caso de uso: Dar de alta a un nuevo instructor"
description: Cómo agregar un nuevo instructor al sistema y asignarlo a experiencias en OMZONE
section: casosDeUso
order: 5
lastUpdated: 2026-05-23
---

# Caso de uso: Dar de alta a un nuevo instructor

**Escenario:** Tienes un nuevo instructor de meditación que va a impartir clases. Necesitas registrarlo en el sistema para asignarlo como recurso en los horarios correspondientes.

---

## Cómo funciona en OMZONE

Los instructores se manejan como **Recursos** dentro del panel. Un recurso puede ser una persona (instructor), un espacio (sala), o un equipo (material especial). Al crear un recurso-instructor, puedes asignarlo a horarios específicos para que el sistema sepa quién está a cargo.

---

## Paso 1 — Crea el recurso del instructor

1. Ve a **Recursos** en el panel.
2. Haz clic en **Nuevo recurso**.
3. Llena los datos:
   - **Nombre** — El nombre del instructor.
   - **Tipo** — `Persona` o `Instructor` (según las opciones disponibles).
   - **Capacidad** — Cuántas sesiones puede tener al mismo tiempo (normalmente 1).
   - **Descripción** — Una breve bio del instructor (opcional, puede aparecer en publicaciones).
4. Guarda el recurso.

---

## Paso 2 — Asigna el instructor a un horario

Cuando crees o edites un horario:

1. Abre el horario desde **Agenda global** o desde la experiencia.
2. En el campo **Recursos asignados**, busca y selecciona al instructor.
3. Guarda el horario.

Ahora el sistema sabe que ese instructor está asignado a ese horario. Si el instructor ya está ocupado en otro horario simultáneo, el sistema te lo indicará.

---

## Paso 3 — Mostrar al instructor en el sitio (opcional)

Si quieres que los clientes puedan ver quién imparte la sesión:

1. Abre la **publicación** vinculada a la experiencia.
2. Agrega una sección de tipo **"Sobre el instructor"** o **"Equipo"**.
3. Escribe la bio del instructor y sube su foto.
4. Guarda y actualiza la publicación.

---

## Consideraciones importantes

- Un instructor no necesita cuenta de usuario en el sistema para existir como recurso. Los recursos son entidades de logística, no usuarios de la plataforma.
- Si el instructor también va a tener acceso al panel para operaciones (registrar asistencia, revisar su agenda), necesita una cuenta con el acceso correspondiente. Ese es un proceso separado (ver _Roles y permisos_).

---

## Checklist

- [ ] Recurso creado con nombre y tipo correcto
- [ ] Asignado a los horarios correspondientes
- [ ] Bio y foto en la publicación (si aplica)
