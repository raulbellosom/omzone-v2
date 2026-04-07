# TASK-057: Admin — Media Manager (explorador de archivos por bucket)

## Objetivo

Implementar la página de gestión de media en el panel admin de OMZONE, reemplazando el placeholder "Próximamente". Al completar esta tarea, un admin puede explorar archivos por bucket, subir archivos, previsualizarlos, copiar URL/ID y eliminarlos, todo desde una interfaz centralizada.

## Contexto

- **Fase:** C — Admin: secciones faltantes (post-fase 15)
- **Documento maestro:** Gestión de media/assets (dominio 11)
- **Estado actual:** La ruta `/admin/media` renderiza `<AdminPlaceholder title="Media" />`.
- **Hooks existentes:** `useBucketFiles` (listar archivos con cursor pagination), `useFileUpload` (subir/eliminar con validación por bucket).
- **Componentes existentes:** `MediaPicker` (modal de browse/upload), `GalleryManager` (gallery con drag-and-drop). Estos son componentes embebidos en forms — la página media es un explorador standalone.
- **Buckets:** 7 configurados (experience_media, publication_media, addon_images, package_images, user_avatars, documents, public-resources).

## Alcance

Lo que SÍ incluye esta tarea:

1. **Página `MediaManagerPage`** en `/admin/media`:
   - Selector de bucket (dropdown o tabs) para elegir qué bucket explorar
   - Grid de archivos del bucket seleccionado con thumbnails (imágenes) o icono genérico (PDFs)
   - Búsqueda por nombre de archivo
   - Paginación con scroll infinito ("Load more") — usa cursor pagination del hook existente
   - Acciones por archivo: preview (modal), copy URL, copy file ID, delete (con confirmación)
   - Upload: botón de subir + zona drag-and-drop con progreso y validación según bucket
   - Metadata visible: nombre, tipo, tamaño, fecha de creación
2. **Componente `MediaGrid`** — grid responsive de thumbnails con acciones.
3. **Componente `FileDetailModal`** — modal con preview, metadata y acciones.
4. **Reutilización de hooks:** `useBucketFiles` y `useFileUpload` ya cubren todas las operaciones.
5. **Reemplazar placeholder** — eliminar ruta de `AdminPlaceholder` para media en `App.jsx`.

## Fuera de alcance

- Renombrar archivos (Appwrite no lo soporta nativamente).
- Mover archivos entre buckets.
- Editar imágenes (crop, resize).
- Gestión de permisos por archivo individual.
- Crear o eliminar buckets desde UI.
- Bulk operations (selección múltiple para eliminar).

## Dominio

- [x] Frontend admin
- [x] Configuración (settings, templates)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| Appwrite Storage (buckets) | leer / crear / eliminar archivos | Operaciones via SDK |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_media` | leer / subir / eliminar | Imágenes de experiencias |
| `publication_media` | leer / subir / eliminar | Imágenes de publicaciones |
| `addon_images` | leer / subir / eliminar | Imágenes de addons |
| `package_images` | leer / subir / eliminar | Imágenes de paquetes |
| `user_avatars` | leer / eliminar | Avatares de usuarios |
| `documents` | leer / subir / eliminar | PDFs y documentos |
| `public-resources` | leer / subir / eliminar | Recursos públicos |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `MediaManagerPage` | admin | crear | Página principal del explorador |
| `MediaGrid` | admin | crear | Grid de thumbnails con acciones |
| `FileDetailModal` | admin | crear | Preview + metadata + acciones |
| `BucketSelector` | admin | crear | Dropdown/tabs de selección de bucket |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useBucketFiles` | reutilizar | Ya existe: listar archivos con paginación y búsqueda |
| `useFileUpload` | reutilizar | Ya existe: upload, delete, preview URL, validación por bucket |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/media` | admin | admin/root | Explorador de media |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Explorar archivos | ✅ | ✅ | ✅ | ❌ | ❌ |
| Subir archivos | ✅ | ✅ | ✅ | ❌ | ❌ |
| Eliminar archivos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Copiar URL/ID | ✅ | ✅ | ✅ | ❌ | ❌ |

## Flujo principal

1. El admin navega a `/admin/media`.
2. Selecciona un bucket del selector (default: `experience_media`).
3. Ve el grid de archivos con thumbnails, nombres y tamaños.
4. Puede buscar archivos por nombre.
5. Hace scroll para cargar más archivos (infinite scroll / load more).
6. Click en un archivo abre `FileDetailModal` con preview ampliado, metadata y botones de copiar URL, copiar ID, eliminar.
7. Click en "Upload" abre zona de drag-and-drop o file picker. El archivo se valida según bucket y sube con barra de progreso.
8. Al confirmar delete, el archivo se elimina y desaparece del grid.

## Criterios de aceptación

- [ ] La ruta `/admin/media` muestra el explorador de archivos.
- [ ] El selector de bucket permite cambiar entre los 7 buckets.
- [ ] Los archivos se muestran como grid de thumbnails (imágenes) o iconos (PDFs).
- [ ] La búsqueda por nombre filtra resultados.
- [ ] El scroll infinito / botón "cargar más" funciona.
- [ ] Click en archivo abre modal con preview, metadata (nombre, tipo, tamaño, fecha).
- [ ] El botón "Copy URL" copia la URL pública del archivo al clipboard.
- [ ] El botón "Copy ID" copia el file ID al clipboard.
- [ ] Delete con confirmación elimina el archivo.
- [ ] Upload funciona con drag-and-drop y click, mostrando progreso.
- [ ] La validación de tipo y tamaño funciona según el bucket seleccionado.
- [ ] Operators pueden explorar y subir pero NO eliminar.
- [ ] Layout responsive: grid 4 cols desktop → 3 tablet → 2 mobile.
- [ ] Loading skeleton mientras carga.
- [ ] Empty state si el bucket está vacío.
- [ ] `npm run build` pasa limpio.

## Dependencias

- **TASK-010:** Admin layout y sidebar.
- Hooks `useBucketFiles` y `useFileUpload` ya implementados.

## Bloquea a

- **TASK-060:** QA integral.

## Riesgos y notas

- Los buckets con `fileSecurity: false` permiten lectura pública — tener cuidado al eliminar archivos que estén en uso por experiencias o publicaciones.
- Considerar mostrar un warning si se intenta eliminar un archivo: "Este archivo podría estar en uso por experiencias o publicaciones."
- El bucket `documents` tiene `encryption: true` — los previews no funcionan. Mostrar icono genérico de documento.
- `user_avatars` solo debe permitir eliminar, no subir desde media manager (los avatares se suben desde perfil).
