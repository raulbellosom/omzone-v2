---
title: Archivado y eliminación
description: Cómo funciona el sistema de archivado y eliminación en OMZONE — soft-archive, hard-delete, permisos y cascadas
section: referencia
order: 5
lastUpdated: 2026-05-25
---

# Archivado y eliminación

OMZONE usa un enfoque de dos niveles para eliminar contenido: **archivar** (reversible) y **eliminar permanentemente** (definitivo). Entender la diferencia previene pérdidas accidentales de datos.

---

## Los dos niveles

### Archivar (soft-archive)

Archivar oculta un registro de la vista activa pero lo conserva en la base de datos. Es completamente reversible.

- El registro se etiqueta con `archivedAt` (timestamp), `archivedBy` (ID de usuario) y `archiveReason` (texto opcional).
- Los registros archivados desaparecen de las listas y del sitio público.
- Pueden restaurarse en cualquier momento.
- **Quién puede archivar / restaurar:** `admin`, `operator`.

### Eliminar permanentemente (hard-delete)

La eliminación permanente borra el registro de la base de datos para siempre. **No se puede deshacer.**

- **Quién puede eliminar permanentemente:** solo super-admin (acceso restringido).
- Se requiere un diálogo de confirmación con texto explícito antes de proceder.
- Pensado para limpiar datos de prueba, registros duplicados o registros que nunca debieron existir.

---

## Archivar en la interfaz

Cada página de lista que permite archivar tiene un menú desplegable de **Acciones** (tres puntos) en cada fila:

- **Archivar** → abre una superposición de confirmación que solicita un motivo opcional.
- Tras archivar, la fila desaparece de la lista activa.

Las páginas con registros archivables muestran una pestaña **Archivados** que lista todos los elementos archivados. Desde allí puedes **Restaurarlos**.

### Advertencia de contenido archivado

Al abrir un registro archivado para editarlo (ej. una publicación), aparece un banner de advertencia en la parte superior recordándote que el registro está archivado y no será visible públicamente hasta que lo restaures.

---

## Eliminar permanentemente en la interfaz

La acción **Eliminar permanentemente** solo es visible para super-admin. Aparece en el mismo menú de acciones, debajo de Archivar.

Un modal te pide escribir el nombre o ID del registro para confirmar — esto previene clics accidentales.

---

## Comportamiento de cascada

Algunos registros soportan archivado en cascada:

| Padre       | Cascada hacia                               |
| ----------- | ------------------------------------------- |
| Experiencia | Ediciones → Horarios (opcional, no forzado) |
| Publicación | Secciones → Bloques (automático)            |

La cascada es **opcional** para experiencias — se te pregunta si también quieres archivar las ediciones y horarios relacionados. Di sí si estás quitando una experiencia completamente del sitio. Di no si solo quieres ocultar temporalmente la experiencia.

---

## Archivo personal (portal)

La función `archive-personal` permite a un cliente autenticado ocultar un registro de su propia vista del portal sin afectar ninguna vista del admin. Es un ocultamiento personal del lado del cliente — no se establece el campo `archivedAt` en el registro principal. Se revierte desde la configuración del portal.

---

## Qué registros pueden archivarse

| Colección            | Archivar | Eliminar permanentemente |
| -------------------- | -------- | ------------------------ |
| Experiencias         | ✅       | ✅ (super-admin)         |
| Ediciones            | ✅       | ✅ (super-admin)         |
| Horarios             | ✅       | ✅ (super-admin)         |
| Publicaciones        | ✅       | ✅ (super-admin)         |
| Paquetes             | ✅       | ✅ (super-admin)         |
| Pases                | ✅       | ✅ (super-admin)         |
| Slides del hero      | ✅       | ✅ (super-admin)         |
| Mensajes de contacto | ✅       | —                        |
| Órdenes              | —        | —                        |
| Tickets              | —        | —                        |

> Las órdenes y tickets son **inmutables** — nunca se archivan ni eliminan. Esto preserva el historial completo de transacciones. Si una orden es inválida, se cancela (no se elimina).

---

## Las funciones del backend

Tres Funciones de Appwrite manejan las operaciones de archivado:

| Función                | Qué hace                                                                |
| ---------------------- | ----------------------------------------------------------------------- |
| `archive-document`     | Archiva suavemente cualquier documento, establece los campos de archivo |
| `restore-document`     | Limpia los campos de archivo, restaura al estado activo                 |
| `hard-delete-document` | Elimina permanentemente un documento (solo super-admin)                 |
| `archive-personal`     | Agrega un registro a la lista de ocultamiento personal del cliente      |

Todas las funciones validan los permisos del solicitante antes de operar.

---

## Campos agregados a las colecciones archivables

```json
{
  "archivedAt": "<datetime o null>",
  "archivedBy": "<user_id o null>",
  "archiveReason": "<string o null>"
}
```

Un registro se considera archivado cuando `archivedAt` no es null.
