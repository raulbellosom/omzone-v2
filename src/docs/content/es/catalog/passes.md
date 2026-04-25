---
title: Pases
description: Pases de crédito consumibles para visitas repetidas y paquetes de sesiones
section: catalog
order: 6
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/passes
  - /admin/passes/new
  - /admin/passes/:id/edit
relatedCollections:
  - passes
  - user_passes
  - pass_consumptions
keywords:
  - pass
  - pases
  - créditos
  - membresía
  - bundle
  - sesiones
---

# Pases

Los pases son créditos prepagados que los clientes compran para acceder a múltiples sesiones o experiencias durante un período definido. Los pases proporcionan flexibilidad para clientes recurrentes y crean ingresos recurrentes para el negocio.

## Conceptos de Pases

1. **Definición de Pase** - La plantilla que define créditos, precio y validez
2. **Pase de Usuario** - Una instancia de un pase asignada a un cliente específico
3. **Consumo de Pase** - Un registro de créditos being usados para una reserva

## Crear un Pase

Navega a **Catálogo -> Pases -> Nuevo pase**

### Sección de Identidad

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | Sí | Nombre del pase (ej., "Pase de 10 Sesiones") |
| `nameEs` | string | No | Nombre en español |
| `slug` | string | Sí | Identificador amigable para URL (auto-generado, editable) |
| `description` | text | No | Descripción en inglés |
| `descriptionEs` | text | No | Descripción en español |

### Sección de Créditos y Precio

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `totalCredits` | integer | Sí | Número de sesiones/usos incluidos (debe ser al menos 1) |
| `basePrice` | double | Sí | Precio de compra del pase |
| `currency` | string | Sí | Código de moneda de tres letras |

### Sección de Validez

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `validityDays` | integer | No | Días hasta que expire el pase (dejar vacío para sin expiración) |

Si `validityDays` no está establecido, el pase no expira.

### Sección de Experiencias Válidas

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `validExperienceIds` | string | No | Array JSON de IDs de experiencias (si no se selecciona ninguno, el pase aplica a todas) |

Por defecto, un pase aplica a todas las experiencias. Para restringir un pase a experiencias específicas, selecciónalas en este campo.

### Sección de Estado

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `status` | enum | Sí | `active`, `inactive` |
| `sortOrder` | integer | No | Orden de visualización en listados |

### Sección de Imagen de Portada

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `heroImageId` | file | Imagen de portada opcional |

## Cumplimiento de Pases

Los pases usan `fulfillmentType: pass`. Cuando un cliente compra un pase:
1. Se crea un registro de `user_passes`
2. El cliente recibe créditos iguales a `totalCredits`
3. Los créditos pueden consumirse para futuras reservas

## Ciclo de Vida del Pase de Usuario

Cuando se compra un pase, se crea un registro de Pase de Usuario:

```
active -> exhausted | expired | cancelled
```

| Estado | Significado |
|--------|-------------|
| `active` | El pase tiene créditos restantes y es válido |
| `exhausted` | Todos los créditos han sido usados |
| `expired` | El período de validez ha terminado |
| `cancelled` | Cancelado manualmente por el admin |

## Consumir Créditos

Cuando un cliente con un pase activo reserva una experiencia con `saleMode: pass`:

1. El sistema busca user_passes activos con créditos restantes
2. Si se encuentra, los créditos se consumen para la reserva
3. Un registro de `pass_consumptions` rastrea el uso

### Ajuste Manual de Créditos

Los admins pueden consumir o restaurar créditos manualmente:
- **Consumir** - Deducir créditos (ej., para una sesión no rastreada de otra manera)
- **Restaurar** - Agregar créditos de vuelta (ej., para corregir un error)

Navega a **Sistema -> Clientes -> [Cliente] -> Pases -> [Pase] -> Ajustar créditos**

## Créditos de Pase Por Experiencia

Diferentes experiencias consumen diferentes cantidades de créditos:

| Configuración de Experiencia | Créditos Consumidos |
|------------------------------|---------------------|
| Modo de venta pass con ranura | 1 crédito por ranura |
| Modo de venta pass sin ranura | 1 crédito por reserva |

Algunas experiencias pueden consumir múltiples créditos basándose en la duración o complejidad. Esto depende de cómo está configurada la experiencia.

## Errores Comunes

**Crear un pase con 0 créditos.**
El `totalCredits` debe ser al menos 1. Los créditos representan sesiones o usos que el cliente recibe.

**Establecer validityDays demasiado corto.**
Considera la perspectiva del cliente. Un pase de 30 sesiones debe tener validez suficiente para que el cliente las use. Períodos de validez comunes: 30, 60, 90, 180, 365 días.

**No explicar claramente el consumo de créditos.**
Asegúrate de que los clientes entiendan cómo funcionan los créditos: "1 crédito = 1 sesión" es el valor por defecto, pero algunas experiencias pueden consumir más créditos.

**Olvidar restringir experiencias válidas.**
Si un pase solo debe funcionar para experiencias específicas, establece el `validExperienceIds`. De lo contrario, el pase aplica a todas las experiencias.

## Resumen del Flujo de Trabajo de Pases

1. El admin crea una plantilla de pase con créditos y precio
2. El cliente compra el pase mediante checkout
3. Se crea el pase de usuario con estado `active` y créditos completos
4. El cliente reserva experiencias usando créditos del pase
5. Cada reserva consume créditos y crea registros de consumo
6. Cuando los créditos llegan a 0, el estado del pase de usuario se convierte en `exhausted`
7. Si el período de validez termina, el estado se convierte en `expired`

## Páginas Relacionadas

- [Experiencias](./experiences.md) - Modo de venta y configuración de pase
- [Órdenes](../sales/orders.md) - Donde aparecen las compras de pases
- [Tickets](../system/tickets.md) - Las reservas con pase pueden generar tickets
- [Clientes](../system/clients.md) - Ver pases asignados