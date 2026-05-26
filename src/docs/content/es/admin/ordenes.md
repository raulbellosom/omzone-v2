---
title: Órdenes
description: Cómo ver, filtrar y gestionar todas las órdenes de compra en OMZONE
section: admin
order: 10
lastUpdated: 2026-05-25
---

# Órdenes

Las **órdenes** son el registro de todas las compras y reservas realizadas en la plataforma. Cada vez que un cliente completa una compra —ya sea directamente en el sitio o a través de una venta asistida— se crea una orden.

---

## Cómo llegar

En el menú lateral ve a **Ventas → Órdenes**.

---

## La lista de órdenes

Verás todas las órdenes ordenadas de la más reciente a la más antigua. Puedes:

- **Buscar** por nombre del cliente, número de orden o experiencia.
- **Filtrar** por estado, por fecha o por tipo de experiencia.
- **Hacer clic** en cualquier orden para ver su detalle completo.

---

## Estados de una orden

| Estado      | Qué significa                                                  |
| ----------- | -------------------------------------------------------------- |
| Pendiente   | La compra está en proceso, aún no se ha confirmado el pago     |
| Confirmada  | El pago fue exitoso y la orden está activa                     |
| Completada  | La experiencia ya se realizó                                   |
| Cancelada   | La orden fue cancelada (por el cliente o por el administrador) |
| Reembolsada | Se procesó un reembolso al cliente                             |

---

## Detalle de una orden

Al abrir una orden verás:

- **Número de orden** — Un identificador único para esta compra.
- **Cliente** — Nombre y correo de quien compró.
- **Experiencia** — Qué compró el cliente.
- **Precio pagado** — El monto exacto en el momento de la compra (este valor no cambia aunque modifiques los precios después).
- **Complementos** — Si el cliente agregó extras.
- **Fecha de la compra** — Cuándo se realizó.
- **Estado** — El estado actual de la orden.
- **Tickets asociados** — Los tickets generados para esta orden (si aplica).

---

## Acciones desde una orden

Dependiendo del estado de la orden, puedes:

- **Ver los tickets** — Ir directamente a los tickets de esta orden.
- **Cancelar la orden** — Solo si aún no se ha realizado la experiencia.
- **Exportar** — Descargar el detalle de la orden (para registros contables o de atención al cliente).

---

## Órdenes de venta asistida

Las órdenes creadas desde el panel (venta asistida) se identifican con una etiqueta especial. En su detalle verás quién del equipo creó la orden.

→ Ver cómo crear una venta asistida en **Venta asistida**.

---

## Solicitudes de factura

Cuando una orden es confirmada, el **correo de confirmación** incluye un botón que lleva al cliente a la página pública `/facturacion` con el código de orden pre-llenado:

```
¿Necesitas factura? [Solicitar factura →]  ← enlaza a /facturacion?orderCode=OMZ-XXXX
```

El cliente llena sus datos fiscales (RFC, régimen fiscal, uso del CFDI, correo fiscal). La solicitud se envía como un **Mensaje de contacto** con la categoría **Factura**. La verás en la bandeja de **Mensajes** del panel admin.

→ Ver [Mensajes de contacto](../admin/mensajes.md) para gestionar las solicitudes y [Plantillas de correo](../referencia/email-templates.md) para los detalles del bloque CTA.

---

## Preguntas frecuentes

**¿Puedo editar el precio de una orden ya confirmada?**
No. El precio de una orden confirmada es definitivo y no puede modificarse. Si necesitas hacer un ajuste, debes cancelar la orden y crear una nueva.

**¿Cómo proceso un reembolso?**
Los reembolsos se gestionan a través de la pasarela de pagos. Desde la orden, usa la opción **Reembolsar** si está disponible, o procésalo directamente en tu cuenta de Stripe y el estado de la orden se actualizará automáticamente.

**¿Las órdenes canceladas se eliminan?**
No. Las órdenes canceladas quedan en el historial con el estado "Cancelada" para mantener el registro completo de transacciones.
