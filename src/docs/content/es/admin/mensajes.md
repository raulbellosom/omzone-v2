---
title: Mensajes de contacto
description: Cómo gestionar mensajes de contacto, solicitudes de factura y tickets de soporte desde el panel de OMZONE
section: admin
order: 2
lastUpdated: 2026-05-25
---

# Mensajes de contacto

**Mensajes de contacto** es la bandeja unificada para todas las comunicaciones entrantes desde el sitio público — consultas generales, solicitudes de factura, preguntas frecuentes y tickets de soporte. Cada formulario que un visitante llena en el sitio llega aquí.

---

## Cómo llegar

En el menú lateral ve a **Mensajes**.

---

## La lista de mensajes

La lista muestra todos los mensajes entrantes del más reciente al más antiguo. Puedes filtrar por:

- **Leídos / No leídos** — Enfócate en los que aún no has revisado.
- **Categoría** — Filtra por tipo de mensaje.
- **Búsqueda** — Encuentra por nombre, correo o asunto.

La paginación carga 25 mensajes a la vez.

---

## Categorías de mensajes

Cada mensaje se etiqueta automáticamente con una de cinco categorías:

| Categoría    | Color del badge | Qué significa                                             |
| ------------ | --------------- | --------------------------------------------------------- |
| **Contacto** | Gris            | Consulta general enviada desde el formulario de contacto  |
| **Factura**  | Ámbar           | Solicitud de factura fiscal para una orden anterior       |
| **FAQ**      | Azul            | Pregunta enviada desde la página de Ayuda y FAQ           |
| **Soporte**  | Morado          | Solicitud de soporte o reporte de problema                |
| **Otro**     | Gris            | Cualquier cosa que no encaje en las categorías anteriores |

---

## Abrir un mensaje

Haz clic en cualquier mensaje para ver su detalle. Verás:

- **Remitente** — Nombre, correo y teléfono (si lo proporcionó).
- **Asunto y mensaje** — El texto completo que escribió el remitente.
- **Badge de categoría** — A simple vista qué tipo de mensaje es.
- **Método de contacto preferido** — Cómo quiere el remitente que le respondas (correo, llamada o WhatsApp). Disponible para las categorías Contacto, Soporte y Otro.
- **Estado de lectura** — Si el mensaje ya fue abierto.
- **Recibido el** — Fecha y hora en que llegó el mensaje.

---

## Marcar como leído / no leído

Usa el botón **Marcar como leído** / **Marcar como no leído** en la parte superior del detalle. Al abrir un mensaje por primera vez se marca automáticamente como leído. Puedes revertirlo a no leído si necesitas retomarlo después.

La marca de tiempo `readAt` se registra cuando el mensaje pasa de no leído a leído.

---

## Notas internas

El campo **Notas internas** al final del detalle te permite escribir apuntes privados sobre el mensaje — acción tomada, seguimiento pendiente, resultado. Las notas son privadas y nunca las ve el cliente.

Haz clic en **Guardar notas** para conservarlas.

---

## Panel de solicitud de factura

Cuando un mensaje tiene la categoría **Factura** (`invoice_request`), aparece un panel adicional en la vista de detalle con toda la información fiscal que envió el cliente:

| Campo                     | Descripción                                                      |
| ------------------------- | ---------------------------------------------------------------- |
| **Código de orden**       | El número de orden de OMZONE sobre la que se solicita la factura |
| **WhatsApp**              | Número de WhatsApp del cliente                                   |
| **RFC**                   | Registro Federal de Contribuyentes                               |
| **Régimen fiscal**        | El régimen bajo el que tributa el cliente                        |
| **Uso de CFDI**           | El uso que se le dará a la factura                               |
| **Correo fiscal**         | El correo donde debe entregarse la factura                       |
| **Información adicional** | Notas extra que agregó el cliente                                |
| **Orden encontrada**      | Si el sistema pudo asociar el código de orden                    |

Las solicitudes de factura provienen de la página pública `/facturacion`. Ve a [Solicitar factura](../landing/facturacion.md) para conocer ese flujo.

---

## Archivar un mensaje

Si quieres mantener la bandeja limpia sin eliminar datos permanentemente, usa la opción **Archivar** en el menú de acciones. Los mensajes archivados pueden restaurarse en cualquier momento.

Ver [Archivado y eliminación](../referencia/archivado-y-eliminacion.md) para la referencia completa.

---

## Badge en el dashboard

El panel de inicio muestra un banner combinado que te alerta cuando hay **mensajes no leídos** o **solicitudes de reserva pendientes**. Este badge cuenta todos los mensajes donde `isRead = false`.

---

## Consejos

- Atiende las solicitudes de factura lo más rápido posible — el cliente espera un documento que generalmente necesita para su contabilidad.
- Usa las notas internas para llevar un registro de qué pasó (ej. "Factura enviada por correo el 25-may-2026").
- Usa el filtro **No leídos** cada mañana para triaje rápido.
- Copia el correo del cliente con el botón de copiar para responderle directamente desde tu cliente de correo.
