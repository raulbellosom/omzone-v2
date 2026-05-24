---
title: Medios
description: Gestionar imágenes y archivos
section: system
order: 3
lastUpdated: 2026-04-25
---

# Medios

El Gestor de Medios es el repositorio central para todas las imágenes, videos y documentos utilizados en toda la plataforma OMZONE. Proporciona capacidades de carga, organización, búsqueda y entrega con optimización automática.

## Buckets de Almacenamiento

| Bucket | Propósito | Permisos |
|--------|-----------|----------|
| `experiences` | Imágenes de experiencias y galería | Lectura pública |
| `publications` | Medios de publicaciones y secciones | Lectura pública |
| `avatars` | Fotos de perfil de usuarios | Lectura autenticada |
| `documents` | Documentos legales, contratos | Escritura solo admin |
| `marketing` | Materiales promocionales | Lectura pública |
| `general` | Archivos varios | Lectura pública |

## Acceder al Gestor de Medios

Navega a **Sistema → Medios** para acceder a la biblioteca de medios.

### Interfaz de la Biblioteca de Medios

- **Vista de cuadrícula** para explorar imágenes visualmente
- **Vista de lista** para información detallada de archivos
- **Búsqueda** por nombre de archivo, etiquetas o fecha
- **Filtros** por bucket, tipo, rango de fechas

## Guías de Carga

### Requisitos de Imagen

| Tipo | Tamaño Recomendado | Tamaño Máximo |
|------|-------------------|---------------|
| Imágenes hero | 1920 x 1080px | 10MB |
| Miniaturas | 400 x 300px | 2MB |
| Imágenes de galería | 1200 x 800px | 5MB |
| Fotos de perfil | 400 x 400px | 2MB |
| Logotipos | 200 x 200px | 1MB |

### Formatos Soportados

| Tipo | Formatos |
|------|----------|
| Imágenes | JPG, JPEG, PNG, WebP, GIF, AVIF |
| Documentos | PDF |
| Videos | MP4, WebM |

> **Preferencia WebP:** OMZONE convierte automáticamente las imágenes cargadas a formato WebP para entrega optimizada. Los archivos originales se preservan.

### Límites de Tamaño de Archivo

| Tipo | Límite |
|------|--------|
| Imágenes | 10MB |
| Documentos | 25MB |
| Videos | 100MB |

## Organizar Archivos

### Carpetas

| Carpeta | Contenido |
|---------|----------|
| `/experiences` | Imágenes de galería de experiencias |
| `/publications` | Posts de blog, contenido editorial |
| `/marketing` | Materiales de campaña |
| `/profiles` | Avatares de usuarios |
| `/documents` | Legales y contratos |

### Etiquetas

Las etiquetas permiten búsqueda y filtrado entre carpetas:

| Ejemplos de Etiquetas | Descripción |
|----------------------|-------------|
| `yoga` | Imágenes relacionadas con yoga |
| `beach` | Imágenes de playa/ubicación |
| `morning` | Fotos de sesiones matutinas |
| `retreat` | Contenido de retiros |
| `promotional` | Materiales de marketing |

## Optimización de Imágenes

OMZONE optimiza automáticamente todas las imágenes cargadas:

| Proceso | Descripción |
|---------|-------------|
| Redimensionamiento | Múltiples tamaños de salida (miniatura, mediano, grande, hero) |
| Conversión de formato | Convertir a WebP con fallbacks |
| Compresión | Compresión con pérdida para tamaños de archivo más pequeños |
| Placeholders blur | Generar blur hash para carga diferida |

### Tamaños Generados

| Tamaño | Dimensiones | Caso de Uso |
|--------|-------------|-------------|
| `thumb` | 100px ancho | Miniaturas de lista |
| `small` | 400px ancho | Imágenes de tarjeta |
| `medium` | 800px ancho | Vistas previas de galería |
| `large` | 1200px ancho | Galería completa |
| `hero` | 1920px ancho | Banners hero |

## Usar Medios

### En Experiencias

1. Editar Experiencia
2. Navegar a sección **Imágenes**
3. Clic en **Cargar** o **Seleccionar del Gestor de Medios**
4. Para galería: Agregar múltiples imágenes, reordenar vía arrastrar y soltar

### En Publicaciones

1. Editar Publicación
2. Agregar o editar una **Sección**
3. Para secciones Hero/Imagen: Cargar o seleccionar imagen
4. Para secciones de Galería: Agregar múltiples imágenes

### En Secciones

1. Abrir pestaña Secciones de Publicación
2. Agregar/Editar sección
3. Seleccionar o cargar imagen/video
4. Establecer texto alternativo para accesibilidad

## Componente Selector de Medios

El selector de medios proporciona una interfaz consistente para seleccionar medios en toda la plataforma:

### Características

| Característica | Descripción |
|----------------|-------------|
| Búsqueda | Encontrar por nombre de archivo o etiquetas |
| Carga | Arrastrar y soltar o explorar |
| Vista previa | Vista previa en lightbox |
| Selección múltiple | Seleccionar múltiples archivos |
| Navegación de carpetas | Navegar jerarquía de carpetas |

### Accesibilidad

| Campo | Descripción |
|-------|-------------|
| Texto Alternativo | Descripción de imagen para lectores de pantalla |
| Caption | Caption visible opcional |

## Medios en Páginas Públicas

Todas las URLs de medios son de lectura pública y pueden ser embebidas en sitios externos:

```
https://[bucket].racoondevs.com/[file-id]/[filename]
```

> **Entrega por CDN:** Los archivos de medios se sirven a través de un CDN para entrega rápida global.

## Errores Comunes

- **Cargas demasiado grandes:** Las imágenes grandes ralentizan la carga de páginas. Redimensionar antes de cargar.
- **Falta de texto alternativo:** Siempre agregar texto alternativo descriptivo para accesibilidad y SEO.
- **Nombres de archivo duplicados:** Usar nombres de archivo descriptivos (ej. `yoga-session-hero.jpg` no `image001.jpg`).
- **Selección de bucket incorrecto:** Cargar al bucket correcto para permisos y organización.
- **No usar placeholders blur:** Habilitar placeholders blur para mejor rendimiento percibido en páginas con muchas imágenes.

## Páginas Relacionadas

- [Experiencias](/docs/catalog/experiences) — Gestión de imágenes de experiencias
- [Publicaciones](/docs/content/publications) — Secciones de medios de publicaciones
- [Secciones](/docs/content/sections) — Medios en bloques de sección