---
title: Complementos
description: Extras opcionales que se pueden adjuntar a las experiencias - servicios, transporte, comida, equipamiento y más
section: catalog
order: 4
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/addons
  - /admin/addons/new
  - /admin/addons/:id/edit
  - /admin/experiences/:id/addons
relatedCollections:
  - addons
  - addon_assignments
keywords:
  - addon
  - complemento
  - extra
  - servicio
  - upgrade
  - transporte
---

# Complementos

Los complementos son extras opcionales que los clientes pueden agregar a su reserva de experiencia. Ejemplos incluyen traslados al aeropuerto, paquetes de comidas, alquiler de equipos, mejoras de alojamiento y servicios de spa.

## Estructura de los Complementos

Hay dos conceptos:
1. **Complemento (independiente)** - La definición del complemento con nombre, descripción, tipo y precio base
2. **Asignación de Complemento** - El vínculo entre un complemento y una experiencia específica, con anulaciones opcionales

## Crear un Complemento

Navega a **Catálogo -> Complementos -> Nuevo complemento**

### Sección de Identidad

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | Sí | Nombre del complemento (ej., "Traslado al Aeropuerto") |
| `nameEs` | string | No | Nombre en español |
| `slug` | string | Sí | Identificador amigable para URL (auto-generado, editable) |
| `description` | text | No | Descripción en inglés del complemento |
| `descriptionEs` | text | No | Descripción en español |

### Sección de Tipo y Precio

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `addonType` | enum | Sí | `service`, `transport`, `food`, `accommodation`, `equipment`, `other` |
| `priceType` | enum | Sí | `fixed`, `per-person`, `per-day`, `per-unit`, `quote` |
| `basePrice` | double | Sí | Valor del precio base |
| `currency` | string | Sí | Código de moneda de tres letras |

**Tipos de Complemento:**

| Tipo | Caso de Uso |
|------|-------------|
| `service` | Tratamiento de spa, masaje, sesión privada |
| `transport` | Recogida en aeropuerto, servicio de shuttle |
| `food` | Paquete de comidas, catering, cena de bienvenida |
| `accommodation` | Mejora de habitación, extensión de alojamiento |
| `equipment` | Alquiler de colchoneta de yoga, props, equipo |
| `other` | Cualquier cosa no cubierta arriba |

**Tipos de Precio:**

| Tipo | Descripción |
|------|-------------|
| `fixed` | Precio único sin importar el contexto |
| `per-person` | Por asistente individual |
| `per-day` | Por día de la experiencia |
| `per-unit` | Por unidad/artículo |
| `quote` | Requiere cotización personalizada |

### Sección de Opciones

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `isStandalone` | boolean | Sí | Puede venderse de forma independiente (no vinculado a una experiencia) |
| `isPublic` | boolean | Sí | Visible para los clientes en el sitio público |
| `followsMainDuration` | boolean | No | Extender automáticamente si cambia la duración de la experiencia principal |
| `maxQuantity` | integer | No | Cantidad máxima por reserva (dejar vacío para ilimitado) |

### Sección de Estado

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `status` | enum | Sí | `active`, `inactive` |
| `sortOrder` | integer | No | Orden de visualización en los listados |

## Asignar Complementos a Experiencias

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Complementos -> Asignar complemento**

### Opciones de Asignación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `addonId` | reference | El complemento a asignar |
| `editionId` | reference | Opcional - vincular a una edición específica |
| `isRequired` | boolean | Incluido automáticamente (el cliente no puede optar por no incluirlo) |
| `isDefault` | boolean | Pre-seleccionado durante el checkout |
| `overridePrice` | double | Opcional - precio diferente al precio base |
| `sortOrder` | integer | Orden de visualización en la lista de complementos |

### Comportamiento de la Asignación

| Requerido | Por Defecto | Comportamiento |
|-----------|-------------|----------------|
| No | No | Complemento opcional, el cliente elige |
| Sí | No | Complemento requerido, incluido automáticamente, no puede removerse |
| No | Sí | Pre-seleccionado pero el cliente puede deseleccionarlo |
| Sí | Sí | Requerido Y pre-seleccionado |

## Complementos Independientes vs Vinculados a Experiencia

**Complementos independientes (`isStandalone: true`):**
- Pueden comprarse separadamente mediante enlace directo o búsqueda
- Útiles para complementos que los clientes podrían querer sin reservar una experiencia primero
- Ejemplo: "Alquiler de Equipo" que cualquier visitante puede agregar

**Complementos vinculados a experiencia (`isStandalone: false`):**
- Solo disponibles al reservar una experiencia específica
- Aparecen durante el flujo de checkout de esa experiencia
- Ejemplo: "Cena al Atardecer" solo disponible al reservar "Semana de Retiro"

## Errores Comunes

**Crear complementos sin verificar el modo de venta de la experiencia.**
Los complementos se adjuntan a experiencias. Asegúrate de que la experiencia exista y tenga el modo de venta correcto antes de asignar complementos.

**Establecer `isRequired` sin entender el impacto.**
Los complementos requeridos se incluyen automáticamente y el cliente no puede removerlos. Usa esto para tarifas obligatorias como cuotas ambientales o seguros.

**Olvidar establecer `isPublic`.**
Si `isPublic` es false, el complemento no aparecerá en las interfaces para clientes incluso si está asignado a una experiencia.

**No establecer un precio de anulación cuando es necesario.**
Si una experiencia necesita un precio diferente al precio base del complemento, usa `overridePrice` en la asignación. De lo contrario, se aplica el precio base.

## Flujo de Complementos en el Checkout

Cuando un cliente reserva una experiencia con complementos asignados:

1. El cliente selecciona el nivel de precio
2. Si se requiere ranura, el cliente selecciona la ranura
3. Aparece la selección de complementos (complementos opcionales mostrados)
4. Los complementos requeridos se incluyen automáticamente
5. Los complementos por defecto están pre-seleccionados pero pueden removerse
6. El cliente puede agregar complementos opcionales
7. El total se calcula incluyendo todos los complementos seleccionados

## Páginas Relacionadas

- [Experiencias](./experiences.md) - La entidad padre para las asignaciones de complementos
- [Venta Asistida](../sales/assisted-sale.md) - Complementos en el flujo de venta manual
- [Paquetes](./packages.md) - Enfoque alternativo de agrupación