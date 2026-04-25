---
title: Niveles de Precio
description: Configurar precios para experiencias con múltiples opciones de precio, tipos de precio y precios específicos por edición
section: catalog
order: 3
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/experiences/:id/pricing
  - /admin/experiences/:id/pricing/new
  - /admin/experiences/:id/pricing/:tierId/edit
relatedCollections:
  - pricing_tiers
  - pricing_rules
keywords:
  - pricing
  - precio
  - nivel
  - costo
  - ticket
---

# Niveles de Precio

Los niveles de precio definen lo que pagan los clientes para reservar una experiencia. Cada experiencia puede tener múltiples niveles para ofrecer diferentes puntos de precio u opciones de reserva (ej., reserva temprana, admisión general, VIP).

> **Importante:** Los niveles de precio pertenecen a las **Experiencias**, no a las Publicaciones. No agregues precios a una Publicación. Si una Publicación necesita información de precios, vincúlala a una Experiencia que tenga niveles de precio.

## Crear un Nivel de Precio

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Precios -> Nuevo nivel**

### Sección de Identidad

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | Sí | Nombre del nivel mostrado a los clientes (ej., "Reserva Temprana") |
| `nameEs` | string | No | Nombre del nivel en español |
| `description` | text | No | Descripción en inglés de qué está incluido |
| `descriptionEs` | text | No | Descripción en español |

### Sección de Precio

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `priceType` | enum | Sí | `fixed`, `per-person`, `per-group`, `from`, `quote` |
| `basePrice` | double | Sí | Valor numérico del precio (debe ser mayor que 0) |
| `currency` | string | Sí | Código de moneda de tres letras (ej., MXN, USD) |

### Tipos de Precio

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| `fixed` | Precio único independiente de los participantes | 1500 MXN total |
| `per-person` | Precio por asistente individual | 500 MXN por persona |
| `per-group` | Precio por grupo (independiente del tamaño) | 3000 MXN para el grupo |
| `from` | Indicador de precio inicial (solo visualización) | "Desde $1,200 MXN" |
| `quote` | Requiere cotización personalizada (sin precio fijo) | Contactar para precio |

### Sección de Personas (Opcional)

Para tipos `per-person` y `per-group`:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `minPersons` | integer | No | Mínimo de participantes requeridos |
| `maxPersons` | integer | No | Máximo de participantes permitidos |

### Sección de Visuales y Asignación

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `badge` | string | No | Etiqueta corta como "Popular", "Más Vendido", "Reserva Temprana" |
| `isHighlighted` | boolean | No | Mostrar como el nivel destacado/recomendado |
| `edition` | reference | No | Vincular a una edición específica (hace el nivel específico por edición) |
| `isActive` | boolean | Sí | Si este nivel está disponible para reserva |
| `sortOrder` | integer | No | Orden de visualización (número menor = aparece primero) |

## Opciones de Nivel de Precio

### Precios Específicos por Edición

Vincular un nivel de precio a una edición específica. Cuando los clientes seleccionan esa edición, solo aparecen los niveles de precio relevantes. Casos de uso de ejemplo:

- Nivel "Reserva Temprana Primavera 2026" vinculado a la edición "Retiro de Primavera 2026"
- Nivel "Temporada Regular" sin vínculo de edición (aplica a todas las demás ediciones)

### Niveles Destacados

La bandera `isHighlighted` marca un nivel como recomendado. En la experiencia para el cliente, los niveles destacados aparecen prominentemente. Usa esto para tu opción de mejor valor o más popular.

### Insignias

Mostrar etiquetas cortas en los niveles de precio para llamar la atención:
- "Popular" - Más reservado
- "Más Vendido" - Mayor generador de ingresos
- "Reserva Temprana" - Descuento por tiempo limitado
- "Limitado" - Mensaje de escasez

## Reglas de Precio

Las reglas de precio pueden modificar el precio mostrado basándose en condiciones:

| Tipo de Regla | Descripción |
|---------------|-------------|
| `early-bird` | Descuento por reservar con mucha anticipación |
| `quantity-discount` | Descuento por grupos más grandes |
| `date-range` | Precio especial durante fechas específicas |
| `promo-code` | Descuentos basados en cupones |

Las reglas de precio se gestionan separadamente y se vinculan a los niveles de precio. Se evalúan al momento del checkout.

## Errores Comunes

**Crear un nivel con basePrice de 0.**
El precio base debe ser mayor que 0 para tipos `fixed`, `per-person`, y `per-group`. Usa `quote` o `from` si necesitas mostrar sin un precio específico.

**Olvidar establecer `isActive` en true.**
Los nuevos niveles mueren por defecto en activos, pero verifica al copiar niveles de otras experiencias. Los niveles inactivos no se muestran a los clientes.

**Vincular un nivel a la edición equivocada.**
Al vincular a una edición, asegúrate de que sea la correcta. Una vez guardado, el vínculo es permanente a menos que editres el nivel.

**Crear precios en una Publicación en lugar de una Experiencia.**
Las Publicaciones no tienen precios. Vincula la Publicación a una Experiencia que tenga los niveles de precio deseados.

## Orden de Visualización de Niveles de Precio

Los niveles se muestran en orden ascendente de valor `sortOrder`. Para controlar qué nivel aparece primero:

1. Establece `sortOrder` a un número menor para el nivel que quieres que aparezca primero
2. Usa `isHighlighted: true` para destacar un nivel específico prominentemente

## Páginas Relacionadas

- [Experiencias](./experiences.md) - Entidad padre para niveles de precio
- [Ediciones](./editions.md) - Precios específicos por edición
- [Paquetes](./packages.md) - Precios打包ados sin configuración por nivel
- [Pases](./passes.md) - Modelo de precios basado en créditos