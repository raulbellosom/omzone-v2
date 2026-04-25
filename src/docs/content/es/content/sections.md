---
title: Secciones
description: Bloques de contenido modular para publicaciones
section: content
order: 2
lastUpdated: 2026-04-25
---

# Secciones

Las secciones son bloques de contenido modular que componen el cuerpo de una Publicación. Cada tipo de sección sirve un propósito específico, desde mostrar banners hero hasta organizar contenido de FAQ. Las secciones se agregan a las Publicaciones vía la pestaña **Secciones** y pueden reordenarse mediante arrastrar y soltar.

## Tipos de Sección Disponibles

| Tipo | Descripción | Caso de Uso |
|------|-------------|-------------|
| `hero` | Encabezado de ancho completo con título, subtítulo y medios | Punto de entrada visual principal |
| `text` | Bloque de contenido de texto enriquecido | Copia del cuerpo, descripciones |
| `gallery` | Cuadrícula de imágenes con lightbox | Colecciones de fotos |
| `highlights` | Experiencias o características destacadas | Mostrar ofertas clave |
| `faq` | Preguntas y respuestas estilo acordeón | Preguntas frecuentes |
| `itinerary` | Horario día por día | Itinerarios de retiros y estadías |
| `testimonials` | Cotizaciones y calificaciones de clientes | Prueba social |
| `inclusions` | Lista de qué está incluido | Comodidades, servicios |
| `restrictions` | Qué no está incluido o restricciones | Avisos importantes |
| `cta` | Botón o formulario de llamada a la acción | Indicadores de conversión |
| `video` | Reproductor de video embebido | Videos promocionales o informativos |

## Estructura de Sección

Cada sección contiene:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Tipo | enum | Identificador del tipo de sección |
| Orden | integer | Orden de visualización dentro de la publicación |
| Estado | enum | `active` o `inactive` |
| Contenido | object | Campos específicos del tipo |

> **Activo vs Inactivo:** Las secciones inactivas están ocultas de la página publicada pero preservadas para activación futura.

## Detalles del Tipo de Sección

### Sección Hero

La sección hero sirve como el encabezado visual principal para una publicación.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título | string | Texto del encabezado principal |
| Subtítulo | string | Texto descriptivo secundario |
| Tipo de Medio | enum | `image` o `video` |
| Imagen/Video | file/URL | Contenido visual |
| Superposición | boolean | Agregar superposición oscura para legibilidad del texto |
| Opacidad de Superposición | number | Porcentaje 0-100 |
| Alineación | enum | `left`, `center`, `right` |
| Altura | enum | `small`, `medium`, `full` |

### Sección de Texto

Contenido de texto enriquecido para secciones narrativas detalladas.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Contenido | string | Texto enriquecido HTML o Markdown |
| Alineación | enum | `left`, `center`, `right` |
| Fondo | enum | `white`, `light`, `dark` |

### Sección de Galería

Galería de imágenes con vista lightbox.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Imágenes | files[] | Array de archivos de imagen |
| Diseño | enum | `grid`, `masonry`, `carousel` |
| Columnas | integer | Número de columnas (1-6) |
| Espaciado | enum | `tight`, `normal`, `loose` |
| Lightbox | boolean | Habilitar lightbox al hacer clic |

### Sección de Destacados

Mostrar experiencias o destacados destacados.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título | string | Encabezado de sección |
| Elementos | relation[] | Array de experiencias a destacar |
| Visualización | enum | `cards`, `list`, `carousel` |
| Mostrar Precios | boolean | Mostrar información de precios |
| Mostrar Descripciones | boolean | Mostrar descripciones de experiencias |

### Sección de FAQ

Preguntas frecuentes estilo acordeón.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título | string | Encabezado de sección |
| Elementos | array | Array de pares pregunta/respuesta |

**Estructura del elemento FAQ:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Pregunta | string | El texto de la pregunta |
| Respuesta | string | El texto de la respuesta |
| Orden | integer | Orden de visualización |

### Sección de Itinerario

Horario día por día para experiencias de múltiples días.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título | string | Encabezado de sección |
| Días | array | Array de entradas de día |

**Estructura del día del itinerario:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Día | integer | Número del día |
| Título | string | Título del día (ej., "Día 1: Llegada") |
| Descripción | string | Descripción de actividades |
| Comidas | string[] | Comidas incluidas |
| Imagen | file | Imagen opcional del día |

### Sección de Testimonios

Testimonios de clientes con fotos opcionales.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título | string | Encabezado de sección |
| Elementos | array | Array de testimonios |
| Diseño | enum | `carousel`, `grid`, `single` |
| Mostrar Calificación | boolean | Mostrar calificaciones con estrellas |

**Estructura del testimonio:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Cotización | string | Texto del testimonio del cliente |
| Autor | string | Nombre del cliente |
| Foto | file | Foto opcional del cliente |
| Calificación | number | Calificación con estrellas (1-5) |
| Fecha | date | Fecha del testimonio |

### Sección de Inclusiones

Lista de elementos incluidos (comodidades, servicios).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título | string | Encabezado de sección |
| Elementos | string[] | Lista de elementos incluidos |
| Estilo de Ícono | enum | `check`, `plus`, `none` |
| Columnas | integer | Número de columnas |

### Sección de Restricciones

Lista de exclusiones o restricciones importantes.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título | string | Encabezado de sección |
| Elementos | string[] | Lista de restricciones |
| Estilo de Ícono | enum | `x`, `warning`, `none` |
| Columnas | integer | Número de columnas |

### Sección de CTA

Botón de llamada a la acción o formulario embebido.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título | string | Encabezado del CTA |
| Descripción | string | Texto de apoyo |
| Texto del Botón | string | Etiqueta del botón |
| URL del Botón | string | Destino del enlace |
| Estilo | enum | `primary`, `secondary`, `outline` |
| ID de Formulario | string | ID de formulario embebido opcional |

### Sección de Video

Reproductor de video embebido.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Título | string | Encabezado de sección |
| Tipo de Video | enum | `youtube`, `vimeo`, `self-hosted` |
| URL/ID del Video | string | URL o ID del video |
| Miniatura | file | Imagen de miniatura personalizada |
| Auto-play | boolean | Reproducir automáticamente al cargar |
| Controles | boolean | Mostrar controles del video |

## Agregar y Gestionar Secciones

### Agregar una Sección

1. Abre una Publicación
2. Haz clic en la pestaña **Secciones**
3. Haz clic en **Agregar Sección**
4. Selecciona el tipo de sección del modal
5. Llena el contenido de la sección
6. Haz clic en **Guardar Sección**

### Reordenar Secciones

1. En la pestaña Secciones, haz clic y mantén el **handle de arrastrar** (⋮⋮) en el lado izquierdo de una sección
2. Arrastra a la posición deseada
3. Suelta para soltar
4. Los números de orden se actualizan automáticamente

### Editar una Sección

1. Haz clic en el **ícono de editar** (lápiz) en la tarjeta de la sección
2. Modifica el contenido en el modal de edición
3. Haz clic en **Guardar Cambios**

### Eliminar una Sección

1. Haz clic en el **ícono de eliminar** (basura) en la tarjeta de la sección
2. Confirma la eliminación en el modal

### Cambiar Estado de Sección

- Haz clic en el **toggle de estado** en la tarjeta de la sección
- Las secciones activas son visibles en las páginas publicadas
- Las secciones inactivas están ocultas pero preservadas

## Errores Comunes

- **Secciones vacías:** Publicar una página sin secciones resulta en una página en blanco. Agrega contenido significativo antes de publicar.
- **Tipo de sección incorrecto:** El contenido de texto pertenece en una sección `text`, no en un `hero`. Usar el tipo correcto asegura el estilo apropiado.
- **Respuestas de FAQ faltantes:** Las secciones de FAQ con preguntas pero sin respuestas crean UX confusa. Siempre proporciona respuestas completas.
- **Fechas de itinerario incorrectas:** Los números de día del itinerario deben ser secuenciales. Los huecos crean confusión para los clientes.
- **Video sin controles:** Los videos con `controls: false` y `autoplay: true` pueden frustrar a los usuarios que no pueden detener la reproducción.

## Páginas Relacionadas

- [Publicaciones](/docs/content/publications) — Publicaciones que contienen secciones