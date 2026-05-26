---
title: Slides del hero
description: Cómo gestionar el carrusel principal de la landing de OMZONE desde el panel de administración
section: admin
order: 18
lastUpdated: 2026-05-25
---

# Slides del hero

**Slides del hero** controla el carrusel de imágenes a pantalla completa que los visitantes ven en la parte superior de la página de inicio de OMZONE. Cada slide puede tener una imagen de fondo, un llamado a la acción y una programación opcional para que solo aparezca durante un rango de fechas específico.

---

## Cómo llegar

En el menú lateral ve a **Contenido → Slides del hero**.

---

## La lista de slides

La lista muestra todos los slides en su orden actual de visualización. El número a la izquierda de cada tarjeta indica su posición en el carrusel — el slide 1 se muestra primero.

Desde la lista puedes:

- **Reordenar** los slides arrastrándolos.
- **Activar / desactivar** la visibilidad sin necesidad de archivar.
- **Editar** cualquier slide.
- **Archivar** un slide que ya no necesitas.

---

## Crear un slide

Haz clic en **Nuevo slide** y completa los campos:

### Imagen

Selecciona una imagen de la biblioteca de medios. Las imágenes del hero deben ser en **formato horizontal** (mínimo recomendado 1920 × 1080 px). Las imágenes verticales o cuadradas no se verán bien en el carrusel.

### Texto alternativo (bilingüe)

Proporciona texto alternativo descriptivo tanto en inglés como en español. Es obligatorio para accesibilidad y SEO.

### Llamado a la acción (CTA)

Opcional. Si se configura, aparece un botón sobre el slide:

- **Etiqueta** — El texto del botón (ej. "Explorar retiros", "Reservar ahora").
- **URL** — A dónde lleva el botón. Puede ser una ruta interna (`/experiences`) o una URL externa.

### Programación

Opcional. Si quieres que el slide solo aparezca durante una campaña o temporada específica:

- **Inicia el** — Fecha y hora en que el slide se vuelve visible.
- **Termina el** — Fecha y hora en que el slide se oculta automáticamente.

Si ambos campos están vacíos, el slide siempre es visible (siempre que no esté archivado).

### Visibilidad

Usa el interruptor **Activo** para mostrar u ocultar el slide de inmediato sin programación. Útil para ajustes rápidos.

---

## Reordenar slides

Arrastra una tarjeta de slide por su control para moverla hacia arriba o hacia abajo en la lista. El orden se guarda automáticamente. El carrusel en el sitio público refleja el nuevo orden de inmediato.

---

## Buenas prácticas

- **Mantén entre 3 y 5 slides** — Demasiados slides hacen que los visitantes pierdan el mensaje.
- **Usa overlays de alto contraste** — El texto debe ser legible sobre la imagen. Si la imagen es clara, el overlay debe ser oscuro y viceversa.
- **Un solo CTA por slide** — No le pidas al visitante hacer dos cosas en el mismo slide.
- **Programa los slides de temporada** — Usa `Inicia el` / `Termina el` para campañas de temporada y nunca olvides quitarlas.
- **Siempre agrega el texto alternativo** — Obligatorio para lectores de pantalla y para el indexado SEO de la imagen.

---

## Archivar y restaurar slides

Archiva un slide desde el menú de acciones (tres puntos → Archivar). Los slides archivados desaparecen del carrusel pero se conservan en el sistema. Puedes restaurarlos en cualquier momento.

Para eliminación permanente, solo los usuarios `root` pueden hacer un hard-delete. Ver [Archivado y eliminación](../referencia/archivado-y-eliminacion.md).
