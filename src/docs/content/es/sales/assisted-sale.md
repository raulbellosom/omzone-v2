---
title: Venta Asistida
description: Crear pedidos en nombre de los clientes
section: sales
order: 2
lastUpdated: 2026-04-25
---

# Venta Asistida

La Venta Asistida permite a los operadores crear pedidos en nombre de los clientes, gestionando reservas por teléfono, punto de venta en persona, reservaciones complimentary y reservas corporativas de grupos donde se requiere interacción directa con el cliente.

## Cuándo Usar la Venta Asistida

| Escenario | Descripción |
|-----------|-------------|
| Reservas por teléfono | El cliente llama para reservar, el operador completa la transacción |
| Punto de venta en persona | Cliente que llega y paga en el mostrador |
| Reservaciones complimentary | Personal, VIP o socios |
| Reservas corporativas/grupales | Múltiples asistentes con una sola factura |

> **Nota:** Los clientes gestionados a través de Venta Asistida no requieren una cuenta de portal existente. Sin embargo, se puede crear una cuenta para acceso futuro de autoservicio.

## Acceder a la Venta Asistida

Navega a **Ventas → Venta Asistida** o presiona `Ctrl+K` y busca "Nueva Venta".

## El Asistente de 7 Pasos

El asistente de Venta Asistida te guía a través de la creación del pedido en pasos secuenciales. El progreso se guarda en cada paso, permitiéndote regresar para completar la venta más tarde.

### Paso 1: Cliente

Selecciona o crea el cliente para este pedido.

| Opción | Descripción |
|--------|-------------|
| Buscar Existente | Buscar por nombre, email o número de teléfono |
| Crear Nuevo Cliente | Registrar una nueva cuenta de cliente con nombre, email y teléfono |

> **Validación de teléfono:** Los números de teléfono deben estar en formato E.164 (`+52 55 1234 5678`). Utiliza la utilidad `sanitizePhone()` para formatear los números correctamente.

**Campos para nuevo cliente:**
- Nombre Completo (requerido)
- Email (requerido)
- Teléfono (requerido, formato E.164)
- Contraseña (opcional, para crear acceso al portal)

### Paso 2: Experiencia

Selecciona la experiencia a reservar.

| Filtro | Descripción |
|--------|-------------|
| Búsqueda | Encontrar por nombre de experiencia |
| Filtro de Tipo | Filtrar por tipo de experiencia (sesión, inmersión, retiro, estadía, privado, paquete) |
| Filtro de Estado | Mostrar solo experiencias publicadas |

**La tarjeta de experiencia muestra:**
- Nombre y insignia de tipo
- Nombre público (si es diferente del nombre)
- Imagen en miniatura
- Indicador de modo de venta (`direct`, `request`, `assisted`, `pass`)
- Precio inicial

**Información requerida:**
- Experiencia (requerido)
- Edición (requerido para experiencias basadas en ediciones)

### Paso 3: Nivel de Precio

Selecciona el nivel de precio para la experiencia elegida.

| Campo | Descripción |
|-------|-------------|
| Nombre del Nivel | Nombre del nivel (ej. "Individual", "Pareja", "Grupo") |
| Tipo de Precio | `fixed`, `perPerson`, `perGroup`, `from`, `quote` |
| Monto | Monto calculado o cotizado |

**Explicaciones de tipos de precio:**

| Tipo de Precio | Descripción |
|----------------|-------------|
| `fixed` | Tarifa plana independiente de los asistentes |
| `perPerson` | Tarifa multiplicada por el número de personas |
| `perGroup` | Tarifa para todo el grupo |
| `from` | Precio inicial; precio final calculado al finalizar compra |
| `quote` | Precio personalizado ingresado por el operador |

### Paso 4: Horario (Condicional)

Este paso aparece solo si la experiencia seleccionada tiene `requiresSchedule` habilitado.

| Campo | Descripción |
|-------|-------------|
| Fecha del Horario | Seleccionar de los horarios publicados disponibles |
| Hora del Horario | Horas disponibles para la fecha seleccionada |
| Asistentes | Número de espacios a reservar |

**Información del horario mostrada:**
- Fecha y hora
- Ubicación y sala
- Capacidad disponible
- Instructor/facilitador asignado

> **Paso condicional:** Si la experiencia no requiere programación (ej. inmersiones bajo demanda), este paso se omite y procedes directamente a Complementos.

### Paso 5: Complementos

Selecciona complementos opcionales a incluir con la reservación.

| Opción | Descripción |
|--------|-------------|
| Complementos Requeridos | Pre-seleccionados; no pueden ser removidos |
| Complementos Predeterminados | Pre-seleccionados; pueden ser removidos |
| Complementos Opcionales | Disponibles para agregar |

**Tipos de asignación de complementos:**

| Tipo | Comportamiento |
|------|----------------|
| `required` | Incluido automáticamente; no puede ser removido |
| `default` | Pre-seleccionado pero removable |
| `optional` | Disponible para agregar si se desea |

**Tipos de complementos:**
- `service` — Tratamientos de spa, sesiones de terapia
- `transport` — Traslados al aeropuerto, transporte
- `food` — Comidas, catering
- `accommodation` — Noches de hotel, alojamiento
- `equipment` — Equipo de alquiler, materiales
- `other` — Complementos diversos

### Paso 6: Cantidad

Especifica la cantidad para cada línea de artículo.

| Campo | Descripción |
|-------|-------------|
| Cantidad | Número de unidades (afecta el precio total para niveles por persona) |
| Notas | Instrucciones especiales para este artículo |

> **Precio por persona:** Cuando se selecciona un nivel por persona, la cantidad representa el número de personas, y el total se calcula como: `precio unitario × cantidad`.

### Paso 7: Revisión

Revisión final antes de procesar el pago.

**La revisión muestra:**
- Información del cliente
- Experiencia y edición seleccionada
- Nivel de precio seleccionado
- Fecha/hora del horario (si aplica)
- Cantidad
- Complementos seleccionados
- Desglose de precio (subtotal, complementos, total)
- Sección de pago

**Opciones de pago:**

| Opción | Descripción |
|--------|-------------|
| Nuevo Pago | Ingresar información de tarjeta para procesamiento Stripe |
| Complimentary | Marcar como gratuito (requiere razón) |
| Pago Existente en Archivo | Usar método de pago almacenado |

**Ventas complimentary:**
- Seleccionar opción de pago "Complimentary"
- Ingresar razón (requerido)
- El pedido se completa con estado `paid` pero sin cargo
- Los tickets aún se generan para el cliente

## Procesar la Venta

1. **Revisar todos los detalles** en el paso final
2. **Seleccionar método de pago:**
   - Para ventas pagadas: Ingresar detalles de tarjeta o usar pago en archivo
   - Para complimentary: Seleccionar "Complimentary" y proporcionar razón
3. **Hacer clic en "Completar Venta"**
4. **Confirmación del pedido:**
   - El pedido se crea con estado `paid`
   - El estado transiciona a `confirmed`
   - Los tickets se generan automáticamente
   - Los créditos de pase se activan (si aplica)
   - El email de confirmación se envía al cliente

## Errores Comunes

- **Omitir selección de horario:** Para experiencias programadas, siempre seleccionar un horario. Falta de información del horario significa que los tickets no pueden ser generados.
- **Cliente incorrecto seleccionado:** Siempre verificar el nombre del cliente antes de completar la venta. Los pedidos no pueden ser reasignados a un cliente diferente.
- **Cantidad incorrecta:** Para precios por persona, la cantidad significa número de personas. Ingresar el número correcto de asistentes.
- **Olvidar complementos requeridos:** Los complementos requeridos se incluyen automáticamente pero verificar que sean apropiados para la reservación.
- **Complimentary sin razón:** Las ventas complimentary requieren una razón para propósitos de auditoría. Siempre documentar la justificación del negocio.

## Páginas Relacionadas

- [Pedidos](/docs/sales/orders) — Ver y gestionar todos los pedidos
- [Horarios](/docs/operations/slots) — Gestionar disponibilidad y capacidad
- [Clientes](/docs/system/clients) — Acceder a la gestión de clientes