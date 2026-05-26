---
title: Plantillas de correo
description: Referencia de todas las plantillas de correo transaccionales y de autenticación en OMZONE — disparadores, variables y cómo desplegarlas
section: referencia
order: 4
lastUpdated: 2026-05-25
---

# Plantillas de correo

OMZONE envía correos automáticos en los momentos clave del recorrido del cliente — confirmación de orden, recordatorios, actualizaciones de reserva y más. Todas las plantillas viven en `docs/email-templates/` y son bilingües (inglés + español).

---

## Inventario de plantillas

| Archivo de plantilla                  | Disparador                                 | Tipo          |
| ------------------------------------- | ------------------------------------------ | ------------- |
| `order-pending.en/es.html`            | Orden creada, en espera de pago            | Transaccional |
| `order-confirmation.en/es.html`       | Pago confirmado, tickets generados         | Transaccional |
| `order-cancelled.en/es.html`          | Orden cancelada (por admin o pago fallido) | Transaccional |
| `order-refunded.en/es.html`           | Orden reembolsada al cliente               | Transaccional |
| `booking-request-received.en/es.html` | Solicitud de reserva privada enviada       | Transaccional |
| `booking-request-quoted.en/es.html`   | Admin envió cotización con enlace de pago  | Transaccional |
| `booking-request-declined.en/es.html` | Admin rechazó una solicitud de reserva     | Transaccional |
| `pass-purchased.en/es.html`           | Orden de pase o paquete completada         | Transaccional |
| `event-reminder.en/es.html`           | 24–48 horas antes de una sesión reservada  | Transaccional |
| `verification.en/es.html`             | Verificación de correo durante el registro | Auth (manual) |

---

## Variables de las plantillas

Las plantillas usan marcadores `{{nombreVariable}}` que la Función de Appwrite reemplaza al momento de enviar.

### Variables comunes

| Variable             | Descripción                                       |
| -------------------- | ------------------------------------------------- |
| `{{customerName}}`   | Nombre del cliente                                |
| `{{orderNumber}}`    | Código único de la orden (ej. `OMZ-20260525-001`) |
| `{{experienceName}}` | Nombre de la experiencia comprada                 |
| `{{date}}`           | Fecha de la sesión                                |
| `{{time}}`           | Hora de la sesión                                 |
| `{{location}}`       | Nombre de la ubicación                            |
| `{{ticketCodes}}`    | Todos los códigos de ticket de la orden           |
| `{{ticketCode}}`     | Código de un ticket individual                    |
| `{{totalAmount}}`    | Monto total pagado (con moneda)                   |
| `{{qrDataUrl}}`      | Imagen QR codificada en base64 para el ticket     |
| `{{portalUrl}}`      | URL al portal del cliente                         |

### Variables de solicitud de reserva

| Variable             | Descripción                           |
| -------------------- | ------------------------------------- |
| `{{quoteAmount}}`    | Monto cotizado por el administrador   |
| `{{paymentLink}}`    | Enlace de pago enviado al cliente     |
| `{{declineReason}}`  | Motivo del rechazo de la reserva      |
| `{{requestSummary}}` | Resumen de lo que solicitó el cliente |

---

## Línea de asunto

Cada archivo de plantilla contiene su línea de asunto como comentario HTML al inicio:

```html
<!-- Subject: Tus tickets de OMZONE están listos — {{orderNumber}} -->
```

Las Funciones de Appwrite `send-confirmation` y `send-notification` extraen este comentario y lo usan como el asunto del correo.

---

## Bloque de solicitud de factura

A partir de esta actualización, las plantillas **order-confirmation**, **order-pending**, **order-cancelled** y **order-refunded** incluyen un **bloque de solicitud de factura** al final:

```
¿Necesitas una factura fiscal para esta orden?
[Solicitar factura →]  ← enlaza a /facturacion?orderCode={{orderNumber}}
```

El enlace pre-rellena el código de orden en el formulario público `/facturacion` para que los clientes puedan solicitar su CFDI en segundos. Cuando un cliente usa este enlace, la solicitud aparece en el panel admin bajo **Mensajes de contacto** con la categoría **Factura**.

→ Ver [Solicitar factura](../landing/facturacion.md) y [Mensajes de contacto](../admin/mensajes.md) para el flujo completo.

---

## Desplegar plantillas transaccionales

Las plantillas transaccionales se almacenan en la colección `notification_templates` de Appwrite y son enviadas por las Funciones `send-confirmation` y `send-notification`. Para sincronizar los archivos HTML a la base de datos:

```bash
APPWRITE_API_KEY=<clave> node scripts/seed-notification-templates.mjs
```

Este script hace upsert de todas las plantillas — es seguro ejecutarlo múltiples veces. Después de ejecutarlo, las Funciones usarán automáticamente el HTML actualizado en el próximo envío.

---

## Desplegar plantillas de autenticación (verificación)

Las plantillas `verification.en/es.html` y de recuperación de contraseña **no** se almacenan en la base de datos. Deben pegarse manualmente en la Consola de Appwrite:

1. Abre **Appwrite Console → Proyecto → Auth → Plantillas**.
2. Selecciona el tipo de plantilla (Verificación, Recuperación, etc.).
3. Pega el contenido HTML para cada locale.
4. Guarda.

Estas plantillas usan la sintaxis propia de Appwrite (`{{url}}`, `{{project}}`) — no confundir con la sintaxis `{{nombreVariable}}` de las plantillas transaccionales.

---

## Editar una plantilla

1. Abre el archivo en `docs/email-templates/` en tu editor.
2. Haz tus cambios. Mantén los estilos en línea (inline) — la mayoría de los clientes de correo no soportan CSS externo.
3. Prueba enviando a una bandeja real (Gmail, Outlook, Apple Mail) antes de desplegar.
4. Ejecuta el script seed o pega en la Consola, según el tipo de plantilla.

---

## Buenas prácticas

- **Siempre estilos en línea** — Los clientes de correo eliminan las hojas de estilo externas.
- **Ambos idiomas** — Actualiza las versiones `.en.html` y `.es.html` juntas para mantener paridad.
- **Valores de prueba realistas** — Usa códigos de orden, nombres y fechas reales al previsualizar.
- **Evita imágenes como contenido** — Las imágenes de fondo están bien para decoración, pero nunca pongas información crítica solo en imágenes (muchos clientes las bloquean por defecto).
