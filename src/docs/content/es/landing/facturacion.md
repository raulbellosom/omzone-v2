---
title: Solicitar factura
description: La página pública de solicitud de factura en OMZONE — cómo funciona, qué necesitan los clientes y cómo llegan las solicitudes al panel de administración
section: landing
order: 5
lastUpdated: 2026-05-25
---

# Solicitar factura

La página de **Solicitar factura** (`/facturacion`) permite a los clientes solicitar una factura electrónica (CFDI) por cualquier orden que hayan realizado en OMZONE. Es una página pública — no requiere iniciar sesión — y es accesible directamente desde el correo de confirmación que recibe cada cliente tras una compra.

---

## Cómo llegan los clientes

Cada correo de confirmación de orden incluye un botón **"Solicitar factura"** que enlaza directamente a:

```
https://omzone.mx/facturacion?orderCode=TU-CODIGO-DE-ORDEN
```

El parámetro `orderCode` en la URL pre-rellena el campo del código de orden en el formulario, para que el cliente no tenga que escribirlo manualmente.

Los clientes también pueden ir a `/facturacion` directamente desde el footer del sitio.

---

## El formulario de solicitud

El formulario recopila todo lo necesario para generar un CFDI:

| Campo                     | Obligatorio | Descripción                                               |
| ------------------------- | ----------- | --------------------------------------------------------- |
| **Nombre**                | ✅          | Nombre completo del solicitante                           |
| **Correo**                | ✅          | Correo de contacto (recibe confirmación)                  |
| **WhatsApp**              | ✅          | Número de teléfono para seguimiento                       |
| **Código de orden**       | ✅          | Número de orden de OMZONE (pre-rellenado desde el enlace) |
| **RFC**                   | ✅          | Registro Federal de Contribuyentes                        |
| **Régimen fiscal**        | —           | El régimen bajo el que tributa (lista desplegable)        |
| **Uso de CFDI**           | —           | Uso de CFDI (lista desplegable)                           |
| **Correo fiscal**         | —           | Correo donde debe enviarse el PDF de la factura           |
| **Información adicional** | —           | Notas extra (ej. dirección fiscal específica)             |

Se requiere marcar el checkbox de **reCAPTCHA v2** para enviar el formulario. Esto previene el abuso automatizado.

---

## Qué pasa después del envío

1. Los datos del formulario se envían a la Función de Appwrite `submit-contact`.
2. La función valida los datos, verifica el token reCAPTCHA en el servidor y crea un nuevo registro en la colección `contact_messages` con:
   - `category: "invoice_request"`
   - Los campos fiscales guardados en el campo JSON `categoryData`
3. El mensaje aparece en el panel de administración bajo **Mensajes de contacto** con un badge ámbar de **Factura**.
4. El equipo de administración revisa la solicitud y gestiona o genera la factura fuera de OMZONE.

> OMZONE no genera facturas automáticamente. El formulario es un canal estructurado de solicitud.

---

## Validación y errores

- Todos los campos obligatorios deben estar completos antes de enviar.
- El correo se valida con formato correcto.
- El reCAPTCHA debe completarse.
- Si el reCAPTCHA falla o la solicitud está malformada, el usuario ve un mensaje de error y puede intentar de nuevo.

---

## Para administradores: gestionar solicitudes de factura

Las solicitudes de factura llegan a **Mensajes de contacto** con la categoría **Factura**. Al abrir cualquier mensaje de factura verás el panel completo con los datos fiscales:

- Código de orden, RFC, régimen fiscal, uso de CFDI, correo fiscal, WhatsApp y notas adicionales.
- Usa el campo de **Notas internas** para registrar lo que hiciste (ej. "CFDI enviado por correo el 25-may-2026").

→ Ver [Mensajes de contacto](../admin/mensajes.md) para el flujo completo en el admin.

---

## Después del envío exitoso

La página muestra un mensaje de confirmación indicando que la solicitud fue recibida. Los clientes pueden enviar otra solicitud usando el botón "Enviar otra" (el formulario se reinicia automáticamente).
