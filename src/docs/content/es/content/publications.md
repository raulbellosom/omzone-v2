---
title: Publicaciones
description: Contenido editorial y SEO para el sitio web público
section: content
order: 1
lastUpdated: 2026-04-25
---

# Publicaciones

Las publicaciones son la **capa editorial** para el contenido de OMZONE, proporcionando la narrativa para el público, copy de marketing y páginas optimizadas para SEO que impulsan el tráfico orgánico. Existen separadamente de la capa comercial (experiencias, precios, ranuras) y sirven puramente como contenido de marketing.

## Publicaciones vs Experiencias

| Aspecto | Publicaciones | Experiencias |
|---------|----------------|--------------|
| Propósito | Editorial, SEO, narrativa de marketing | Comercial, precios, disponibilidad |
| Contenido | Títulos, descripciones, imágenes, contenido de landing page | Niveles de precio, ranuras, capacidad, cumplimiento |
| Estado | `draft`, `published`, `archived` | `draft`, `published`, `paused`, `archived` |
| Precios | Sin campos de precio | Niveles de precio con tipos de precio |
| Programación | Sin programación | Ranuras y disponibilidad |
| Vinculación | Puede vincular a una Experiencia vía `experienceId` | Referenciada por Publicación |

> **Separación de dominio:** Las Publicaciones y las Experiencias son entidades separadas. Una Publicación puede vincular a una Experiencia (vía el campo `experienceId`), pero los cambios en una no afectan automáticamente a la otra. Esta separación permite que el contenido editorial permanezca estable mientras los detalles comerciales cambian.

## Cuándo Usar Publicaciones

Crea una Publicación para:

| Caso de Uso | Descripción |
|-------------|-------------|
| Páginas de Landing SEO | Páginas optimizadas apuntando a keywords específicas |
| Posts de Blog | Contenido editorial, artículos de bienestar, noticias |
| Destacados de Experiencia | Experiencias curadas con narrativa editorial |
| Páginas Institucionales | Acerca de, términos, privacidad, políticas de reembolso |
| Páginas FAQ | Preguntas frecuentes estructuradas |

## Categorías de Publicación

| Categoría | Caso de Uso | Descripción |
|-----------|-------------|-------------|
| `landing` | Páginas de landing principales | Puntos de entrada principales para campañas |
| `blog` | Posts de blog | Artículos, noticias, consejos de bienestar |
| `highlight` | Contenido destacado | Experiencias curadas con narrativa editorial |
| `institutional` | Acerca de, políticas | Info de la empresa, páginas legales |
| `faq` | Páginas FAQ | Contenido estructurado de preguntas/respuestas |

## Crear una Publicación

1. Navega a **Contenido → Publicaciones**
2. Haz clic en **Crear Nueva**
3. Selecciona la **Categoría** (landing, blog, highlight, institutional, faq)
4. Llena los detalles
5. Agrega secciones para contenido modular
6. Establece el estado en `published` cuando esté listo

## Campos de Publicación

### Campos Principales

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título | string | Título de la publicación (soporta i18n) |
| Slug | string | Slug de URL (único por categoría) |
| Categoría | enum | `landing`, `blog`, `highlight`, `institutional`, `faq` |
| Extracto | string | Descripción corta (máx 200 caracteres) |
| Descripción | string | Descripción de contenido completo (soporta i18n) |
| Estado | enum | `draft`, `published`, `archived` |

### Vinculación a Experiencia

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Experiencia | relation | Vinculación opcional a una Experiencia |

Cuando se establece un `experienceId`, la Publicación puede mostrar información relacionada de la experiencia mientras mantiene control editorial separado.

### Imágenes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Miniatura | file | Imagen principal para páginas de listado |
| Imagen Hero | file | Imagen de encabezado de ancho completo |
| Galería | files | Imágenes adicionales para secciones de galería |

### SEO

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título SEO | string | Título override para motores de búsqueda (máx 60 caracteres) |
| Descripción SEO | string | Meta descripción (máx 160 caracteres) |
| URL Canónica | string | URL preferida para contenido duplicado |
| Indexar | boolean | Permitir indexación de motores de búsqueda |
| Seguir | boolean | Permitir seguimiento de motores de búsqueda |

### Etiquetas

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Etiquetas | string[] | Array de nombres de etiquetas para categorización |

## Ciclo de Vida del Estado de Publicación

```
draft → published → archived
         ↓
       paused → published
```

| Estado | Descripción |
|--------|-------------|
| `draft` | No visible al público; en preparación |
| `published` | En vivo y visible al público |
| `paused` | Temporalmente no disponible (puede reanudarse) |
| `archived` | Removido permanentemente de la vista pública |

## Pestañas de Publicación

| Pestaña | Descripción |
|---------|-------------|
| Detalles | Campos principales, vínculo de experiencia, imágenes |
| Secciones | Bloques de contenido modular para el cuerpo de la página |
| SEO | Configuración de optimización para motores de búsqueda |
| Vista Previa | Vista previa desktop/móvil del contenido publicado |

## Errores Comunes

- **Confundir con Experiencia:** Las Publicaciones no contienen precios ni programación. Siempre crea primero la Experiencia, luego opcionalmente crea una Publicación para proporcionar narrativa editorial.
- **Slugs duplicados:** Los slugs deben ser únicos dentro de cada categoría. Usar el mismo slug en diferentes categorías está permitido.
- **Olvidar campos SEO:** Incluso las publicaciones internas se benefician de metadatos SEO para consistencia y preparación futura.
- **No vincular experiencia:** Para páginas de landing sobre experiencias específicas, siempre vincula el `experienceId` para mantener relaciones de dominio apropiadas.
- **Publicar antes de secciones:** Una Publicación publicada sin secciones muestra una página vacía. Agrega secciones significativas antes de publicar.

## Páginas Relacionadas

- [Secciones](/docs/content/sections) — Bloques de contenido modular para publicaciones
- [Experiencias](/docs/catalog/experiences) — Capa comercial vinculada por publicaciones
- [Etiquetas](/docs/catalog/tags) — Categorización para publicaciones y experiencias