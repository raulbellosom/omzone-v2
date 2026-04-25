---
title: Paquetes
description: Experiencias empaquetadas que combinan múltiples elementos a un precio fijo
section: catalog
order: 5
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/packages
  - /admin/packages/new
  - /admin/packages/:id/edit
relatedCollections:
  - packages
  - package_items
keywords:
  - package
  - paquete
  - bundle
  - retiro
  - estadía
---

# Paquetes

Los paquetes son conjuntos pre-configurados que combinan múltiples elementos (experiencias, complementos, beneficios, alojamiento, comidas) a un precio fijo total. A diferencia de las experiencias que tienen múltiples niveles de precio, los paquetes tienen un único precio que incluye todos los elementos打包ados.

## Cuándo Usar Paquetes

Usa paquetes cuando:
- Quieres ofrecer una experiencia de retiro completa a un precio
- Necesitas agrupar múltiples servicios juntos
- Quieres pre-curar una combinación específica para los clientes
- Tienes una oferta de estadía fija con múltiples elementos incluidos

## Crear un Paquete

Navega a **Catálogo -> Paquetes -> Nuevo paquete**

### Sección de Identidad

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | Sí | Nombre del paquete (ej., "Paquete de Retiro de Bienestar") |
| `nameEs` | string | No | Nombre en español |
| `slug` | string | Sí | Identificador amigable para URL (auto-generado, editable) |
| `description` | text | No | Descripción en inglés del paquete |
| `descriptionEs` | text | No | Descripción en español |

### Sección de Precio y Logística

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `totalPrice` | double | Sí | Precio fijo del paquete |
| `currency` | string | Sí | Código de moneda de tres letras |
| `durationDays` | integer | No | Duración en días (para visualización) |
| `capacity` | integer | No | Máximo de participantes para el paquete |

### Sección de Estado

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `status` | enum | Sí | `draft`, `published`, `archived` |
| `sortOrder` | integer | No | Orden de visualización en listados |

### Sección de Imágenes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `heroImageId` | file | Imagen de portada del paquete |
| `galleryImageIds` | file[] | Imágenes adicionales para galería |

## Elementos del Paquete

Un paquete consiste en múltiples elementos. Navega a **Catálogo -> Paquetes -> [Nombre del Paquete] -> Elementos** para agregar elementos.

### Tipos de Elementos

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `experience` | Vincula a una experiencia existente | 5 sesiones de yoga |
| `addon` | Vincula a un complemento existente | Traslado al aeropuerto |
| `benefit` | Inclusión descriptiva (sin referencia) | Cocktail de bienvenida |
| `accommodation` | Detalles de alojamiento | 4 noches en habitación con vista al mar |
| `meal` | Inclusiones de comida | Todas las comidas incluidas |

### Campos de Elementos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `itemType` | enum | Sí | `experience`, `addon`, `benefit`, `accommodation`, `meal` |
| `referenceId` | string | No | ID de la experiencia o complemento vinculado (opcional) |
| `description` | text | Sí | Descripción de lo que está incluido |
| `descriptionEs` | text | No | Descripción en español |
| `quantity` | integer | No | Número de unidades incluidas |
| `sortOrder` | integer | No | Orden de visualización en el listado del paquete |

### Patrones de Ejemplo de Elementos

**Elemento de experiencia:**
```
itemType: "experience"
referenceId: "yoga-session-123"
description: "Sesiones diarias de yoga matutinas"
quantity: 5
```

**Elemento de beneficio (sin referencia):**
```
itemType: "benefit"
referenceId: null
description: "Kit de bienestar de bienvenida"
quantity: 1
```

**Elemento de alojamiento:**
```
itemType: "accommodation"
referenceId: null
description: "4 noches en Suite Garden View"
quantity: 1
```

## Requisitos de Publicación

Un paquete debe tener al menos un elemento antes de poder publicarse. La validación asegura:
- Existe al menos un elemento de paquete
- Los elementos tienen los campos requeridos completados

## Paquete vs Experiencia con Complementos

| Aspecto | Paquete | Experiencia + Complementos |
|---------|---------|----------------------------|
| Precio | Precio fijo único | Precio base + precios de complementos |
| Personalización | Contenidos fijos | El cliente elige complementos |
| Caso de uso | Estadías pre-curadas | Experiencias modulares |
| Gestión | A nivel de paquete | A nivel de experiencia |

## Errores Comunes

**Publicar un paquete sin elementos.**
Un paquete debe tener al menos un elemento antes de poder establecerse en `published`. Agrega elementos en la pestaña de Elementos antes de publicar.

**No vincular experiencias o complementos cuando es apropiado.**
Usa `referenceId` para vincular a experiencias o complementos existentes. Esto crea una relación adecuada y permite al sistema rastrear qué está incluido.

**Olvidar duración o capacidad.**
Establece `durationDays` para paquetes de múltiples días para que los clientes conozcan la duración. Establece `capacity` si el paquete tiene un límite de participantes.

## Visualización del Paquete

Los paquetes aparecen en el catálogo público con:
- Imagen hero
- Nombre y descripción
- Duración y capacidad
- Elementos incluidos (vista previa)
- Precio total

El tipo de cumplimiento para paquetes es `package`, que genera un ticket upon compra.

## Páginas Relacionadas

- [Experiencias](./experiences.md) - Pueden incluirse como elementos en paquetes
- [Complementos](./addons.md) - Pueden incluirse como elementos en paquetes
- [Niveles de Precio](./pricing-tiers.md) - Modelo de precios alternativo para experiencias