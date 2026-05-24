---
title: Solicitudes de Reserva
description: Gestionar consultas de reserva entrantes para experiencias con saleMode establecido en 'request'
section: operations
order: 4
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/booking-requests
  - /admin/booking-requests/:id
relatedCollections:
  - booking_requests
  - experiences
  - editions
keywords:
  - booking request
  - solicitud de reserva
  - consulta
  - cotización
  - solicitud
---

# Solicitudes de Reserva

Las solicitudes de reserva vienen de clientes para experiencias con `saleMode: request`. En lugar de reservar directamente, los clientes envían una consulta que incluye sus detalles y requisitos. Los admins luego revisan, cotizan un precio y convierten clientes interesados en órdenes.

## Cómo Funcionan las Solicitudes de Reserva

### Flujo del Cliente

1. El cliente ve una experiencia con `saleMode: request`
2. El cliente hace clic en "Solicitar Reserva" (o similar)
3. El cliente llena un formulario con:
   - Fecha preferida
   - Número de participantes
   - Nombre de contacto, correo, teléfono
   - Mensaje o solicitudes especiales
4. La solicitud se envía y aparece en el admin

### Flujo del Admin

1. Revisar solicitudes entrantes
2. Evaluar viabilidad y recursos
3. Establecer precios y agregar notas
4. Responder (aprobar/cotizar, rechazar, o solicitar más información)
5. Para solicitudes aprobadas: convertir a una orden y enviar enlace de pago

## Ver Solicitudes de Reserva

Navega a **Operaciones -> Solicitudes**

La lista muestra:
- Nombre de contacto
- Nombre de la experiencia
- Fecha solicitada
- Número de participantes
- Estado

Filtra por estado para enfocarte en solicitudes pendientes.

## Detalle de Solicitud de Reserva

Haz clic en una solicitud para ver sus detalles completos:

### Información de Contacto
- Nombre, correo, teléfono
- Mensaje o solicitudes especiales

### Contexto de la Experiencia
- Qué experiencia se solicitó
- Qué edición (si alguna)
- Fecha preferida

### Sección del Admin
- `adminNotes` - Notas internas (no visibles para el cliente)
- `quotedAmount` - Precio cotizado al cliente (en MXN)
- `status` - Estado actual de la solicitud

## Valores de Estado de Solicitud de Reserva

| Estado | Descripción |
|--------|-------------|
| `pending` | Solicitud nueva, esperando revisión |
| `reviewing` | El admin está activamente revisando y respondiendo |
| `approved` | Cotizado y esperando confirmación del cliente |
| `rejected` | El admin rechazó la solicitud |
| `converted` | Cliente confirmó, orden creada |

## Transiciones de Estado

```
pending -> reviewing -> approved -> converted
              |
              v
          rejected
```

### Reglas de Transición

- `pending` a `reviewing` - El admin inicia la revisión
- `reviewing` a `approved` - El admin cotiza precio y espera
- `reviewing` a `rejected` - El admin rechaza
- `approved` a `converted` - El cliente confirma, orden creada

## Responder a una Solicitud

### Paso 1: Iniciar Revisión

Establece el estado en `reviewing` para indicar que estás trabajando en ello.

### Paso 2: Agregar Notas de Admin

Agrega notas internas sobre la solicitud:
- Evaluación de viabilidad
- Disponibilidad de recursos
- Decisiones de precios
- Seguimiento necesario

### Paso 3: Establecer Monto Cotizado

Ingresa el `quotedAmount` en MXN. Este es el precio que estás ofreciendo al cliente.

### Paso 4: Aprobar

Establece el estado en `approved` para enviar la cotización al cliente.

### Paso 5: Convertir a Orden

Cuando el cliente confirma y el pago está listo:

1. Haz clic en "Convertir a Orden"
2. El sistema crea una orden con:
   - Información del cliente
   - Experiencia/edición
   - Monto cotizado
3. El `convertedOrderId` se almacena en la solicitud
4. El estado cambia a `converted`

## Convertir a Venta Asistida

La orden convertida se crea como una venta asistida (tipo de orden: `request-conversion`). El admin puede entonces:

1. Navegar a **Ventas -> Órdenes -> [Número de Orden]**
2. Enviar el enlace de pago al cliente
3. Marcar como pagado cuando se reciba

## Errores Comunes

**No ingresar un monto cotizado antes de aprobar.**
El `quotedAmount` es requerido para la conversión. Si approving sin cotizar, puede que necesites editar la solicitud para agregar el monto antes de convertir.

**Olvidar agregar notas de admin.**
Las notas internas ayudan a otros miembros del equipo a entender el contexto. Documenta tu evaluación y decisiones.

**Convertir sin confirmación del cliente.**
La conversión crea una orden inmediatamente. Asegúrate de que el cliente haya confirmado antes de convertir.

**Establecer estado muy temprano.**
Moverse a `reviewing` o `approved` envía señales al cliente. Asegúrate de tener suficiente información antes de cambiar el estado.

## Páginas Relacionadas

- [Órdenes](../sales/orders.md) - Donde aparecen las solicitudes convertidas
- [Venta Asistida](../sales/assisted-sale.md) - Creación manual de órdenes
- [Experiencias](../catalog/experiences.md) - Configurar saleMode