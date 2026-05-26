---
title: Publicaciones
description: Cómo crear y gestionar publicaciones de blog y contenido editorial en OMZONE
section: admin
order: 15
lastUpdated: 2026-05-25
---

# Publicaciones

Una **publicación** es un artículo de blog — la capa editorial de OMZONE. Las publicaciones son donde cuentas la historia de las experiencias, compartes insights de bienestar y creas contenido que los clientes descubren en el sitio público.

Las publicaciones están intencionalmente separadas de la configuración comercial (precios, horarios). Esto te permite actualizar la narrativa sin tocar la lógica de negocio, y viceversa.

---

## Todas las publicaciones son artículos de blog

Las publicaciones en OMZONE son ahora un único tipo de contenido: **blog**. Ya no existen tipos separados para páginas de landing, páginas institucionales o entradas de FAQ. En cambio, usa **etiquetas (tags)** para organizar y contextualizar el contenido:

| Etiqueta        | Propósito                                                      |
| --------------- | -------------------------------------------------------------- |
| `featured`      | Contenido destacado / promovido                                |
| `faq`           | Aparece en el acordeón de la página de Ayuda y FAQ             |
| `landing`       | Contenido originalmente vinculado a la landing de experiencias |
| `institutional` | Acerca de, misión, valores y páginas similares                 |

Una publicación puede tener múltiples etiquetas. Las etiquetas son opcionales — un artículo de blog simple no necesita etiquetas.

---

## Crear una publicación

1. En el menú lateral ve a **Publicaciones**.
2. Haz clic en **Nueva publicación**.
3. Completa lo básico:
   - **Título** — El título visible al público (bilingüe: inglés + español).
   - **Subtítulo** — Línea corta opcional debajo del título.
   - **Extracto** — Un teaser corto (2–3 líneas) que aparece en los listados.
   - **Imagen de portada** — La foto principal que ven los clientes primero.
   - **Etiquetas** — Etiquetas de contexto opcionales (ver tabla arriba).
   - **Experiencia sugerida** — Vincula esta publicación a una experiencia para promoción cruzada. Este es un campo de recomendación — no bloquea la publicación detrás de la experiencia.
4. Guarda. Serás llevado al **Editor de secciones** para construir el contenido.

---

## Construir el contenido

Una vez creada la publicación, construyes su contenido usando el **Editor de secciones** (también llamado SectionManager). Cada sección es un área de contenido (imagen hero, bloque de texto, galería, cita, etc.).

El editor de secciones se abre como un **panel deslizante** en el lado derecho de la pantalla. Puedes:

- **Agregar** una sección desde el panel deslizante.
- **Editar** una sección existente haciendo clic en ella.
- **Reordenar** secciones arrastrándolas.
- **Eliminar** una sección desde su menú de acciones.

Ver **Secciones y bloques** para los detalles sobre cómo estructurar una publicación.

---

## Estado de una publicación

| Estado        | Qué significa                                              |
| ------------- | ---------------------------------------------------------- |
| **Borrador**  | Solo visible para administradores — no en el sitio público |
| **Publicada** | En vivo en el sitio público                                |
| **Archivada** | Retirada del sitio público, conservada como referencia     |

No existe estado "Programada" — publica y archiva manualmente según sea necesario.

---

## Editar una publicación

Puedes editar una publicación en cualquier momento. Los cambios de metadatos (título, etiquetas, campos SEO) toman efecto de inmediato. Los cambios en secciones requieren guardar cada sección individualmente.

> Si una publicación está archivada, aparece un **banner de advertencia naranja** en la parte superior de la página de edición recordándote que no es visible públicamente.

---

## SEO y visibilidad

Las publicaciones soportan:

- **Título SEO** y **descripción SEO** — para resultados en buscadores.
- **Slug** — la ruta URL (ej. `/blog/mi-articulo`). Establécelo una sola vez y evita cambiarlo para preservar el valor SEO.
- Los datos estructurados se generan automáticamente para publicaciones vinculadas a una experiencia.

Mantén títulos y descripciones únicos en todas las publicaciones para el mejor rendimiento en búsquedas.

---

## Publicaciones vs. experiencias

| Publicaciones                                     | Experiencias                                    |
| ------------------------------------------------- | ----------------------------------------------- |
| Cuentan la historia — quién, por qué, qué esperar | Definen el producto — precio, fechas, capacidad |
| Fotos, narrativa, bios de instructores            | Modo de venta, horario, complementos            |
| Artículos de blog independientes                  | Pueden existir sin publicación                  |
| Etiquetadas por contexto                          | Vinculadas a tiers de precios y horarios        |

---

## Archivar y eliminar permanentemente

- **Archivar**: retira la publicación del sitio público. Reversible. Disponible para `admin` y `operator`.
- **Eliminar permanentemente**: borra la publicación y todas sus secciones de forma definitiva. Requiere permisos de super-admin.

Ver [Archivado y eliminación](../referencia/archivado-y-eliminacion.md) para la referencia completa.

---

## Configuración de SEO

Cada publicación tiene su sección de SEO donde puedes configurar:

- **Título SEO** — El título que aparece en Google (diferente al título principal si lo necesitas).
- **Descripción** — El resumen que aparece debajo del título en los resultados de búsqueda.
- **Palabras clave** — Términos relacionados para posicionamiento.
- **Imagen de vista previa** — La imagen que se muestra al compartir en redes sociales.

> Llena siempre el título SEO y la descripción — son los campos más importantes para que tu contenido aparezca en Google.

---

## Publicar una publicación

Cuando el contenido esté listo:

1. Verifica que el estado sea **Publicada**.
2. Asegúrate de que el título SEO y la descripción estén completos.
3. Guarda los cambios.

La publicación aparecerá en el sitio web de forma inmediata.
