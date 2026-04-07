# TASK-038: Componente de galería y media picker reutilizable

## Objetivo

Crear los componentes reutilizables `MediaPicker`, `GalleryManager` e `ImagePreview` que permitan a los admins seleccionar, reordenar y gestionar imágenes en formularios de experiencias, publicaciones, addons y paquetes. Al completar esta tarea, cualquier formulario admin puede integrar selección y gestión visual de media desde Appwrite Storage.

## Contexto

- **Fase:** 11 — Media y storage
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 11
- **Documento maestro:** Secciones:
  - **RF-15:** Media management — gestión de imágenes y archivos
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Atributos `heroImageId`, `galleryImageIds`, `mediaIds`, `photoId`, `heroImageId` en múltiples colecciones.
- **ADR relacionados:** Ninguno específico.

Depende de TASK-037 que provee los buckets configurados y el hook `useFileUpload`. Esta tarea extiende la funcionalidad con componentes de mayor nivel para selección múltiple y gestión de galerías.

## Alcance

Lo que SÍ incluye esta tarea:

1. Componente `MediaPicker`:
   - Permite navegar archivos ya subidos a un bucket específico
   - Lista archivos con preview thumbnail
   - Permite seleccionar uno o múltiples archivos (configurable via prop `multiple`)
   - Búsqueda/filtrado por nombre de archivo
   - Botón para subir nuevo archivo desde el picker (integra `ImageUpload`)
   - Modal o drawer que se abre desde cualquier formulario
   - Retorna `fileId` (single) o `fileId[]` (multiple) al padre
2. Componente `GalleryManager`:
   - Gestiona una lista ordenada de `imageIds` (para `galleryImageIds` de experiencias, `mediaIds` de secciones)
   - Muestra grid de thumbnails de las imágenes seleccionadas
   - Permite agregar imágenes (abre `MediaPicker`)
   - Permite eliminar imagen de la galería (desvincular, no borrar del bucket)
   - Permite reordenar imágenes con drag-and-drop
   - Prop `value` (array de fileIds) y `onChange(fileIds)` para integración con formularios
3. Componente `ImagePreview`:
   - Muestra preview de una imagen de Appwrite Storage por fileId
   - Soporta diferentes tamaños via props (`width`, `height`)
   - Lazy loading de imágenes
   - Fallback/placeholder si la imagen no existe o falla
   - Usa preview API de Appwrite Storage
4. Integración con formularios existentes:
   - Experiencia form: heroImage (single `ImagePreview` + `MediaPicker`), gallery (`GalleryManager`)
   - Publication form: heroImage, ogImage
   - Publication section form: mediaIds (`GalleryManager`)
   - Addon form: heroImage
   - Package form: heroImage
5. Responsive:
   - Grid de galería: 2 cols mobile, 3 cols tablet, 4 cols desktop
   - MediaPicker modal: fullscreen en mobile, centrado en desktop
   - Drag-and-drop en GalleryManager con fallback de botones up/down en mobile

## Fuera de alcance

- Edición de imágenes (cropping, resizing, filtros).
- CDN optimization o image transformation.
- Bulk delete de archivos de storage.
- Organización de archivos en carpetas dentro del bucket.
- Metadata de archivos (tags, descriptions).
- Video upload o preview.

## Dominio

- [x] Media / Assets
- [x] Frontend admin

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experiences` | actualizar | Integración con `heroImageId`, `galleryImageIds` |
| `publications` | actualizar | Integración con `heroImageId`, `ogImageId` |
| `publication_sections` | actualizar | Integración con `mediaIds` |
| `addons` | actualizar | Integración con `heroImageId` |
| `packages` | actualizar | Integración con `heroImageId` |

## Atributos nuevos o modificados

N/A — se usan atributos existentes (`heroImageId`, `galleryImageIds`, `mediaIds`).

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Operaciones directas con Appwrite Storage SDK |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_images` | leer / crear | Browse y upload de imágenes de experiencias |
| `publication_media` | leer / crear | Browse y upload de media de publicaciones |
| `addon_images` | leer / crear | Browse y upload de imágenes de addons |
| `package_images` | leer / crear | Browse y upload de imágenes de paquetes |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `MediaPicker` | admin | crear | Modal/drawer de selección de media con browse y upload |
| `GalleryManager` | admin | crear | Grid ordenable de imágenes con add/remove/reorder |
| `ImagePreview` | admin + público | crear | Display de imagen de Appwrite con lazy loading y fallback |
| `ImageUpload` | admin | modificar | Integrar como sub-componente dentro de MediaPicker |
| `ExperienceForm` | admin | modificar | Integrar GalleryManager para galleryImageIds |
| `PublicationForm` | admin | modificar | Integrar MediaPicker para heroImage y ogImage |
| `SectionForm` | admin | modificar | Integrar GalleryManager para mediaIds |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useFileUpload` | usar existente | Upload y preview URL (creado en TASK-037) |
| `useBucketFiles` | crear | Listar archivos de un bucket con paginación |

## Rutas implicadas

N/A — los componentes se usan dentro de formularios, no crean rutas nuevas.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Browse archivos en buckets públicos | ✅ | ✅ | ✅ | ❌ | ❌ |
| Seleccionar archivos | ✅ | ✅ | ✅ | ❌ | ❌ |
| Subir nuevo archivo | ✅ | ✅ | ❌ | ❌ | ❌ |
| Eliminar archivo de galería (desvincular) | ✅ | ✅ | ✅ | ❌ | ❌ |
| Eliminar archivo de bucket | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

1. Admin edita una experiencia y necesita agregar galería de imágenes.
2. Hace click en "Agregar imagen" en el `GalleryManager`.
3. Se abre `MediaPicker` como modal mostrando archivos del bucket `experience_images`.
4. Admin puede seleccionar una imagen existente o subir una nueva.
5. Al seleccionar, el fileId se añade al array de `galleryImageIds`.
6. La imagen aparece en el grid de `GalleryManager` con thumbnail.
7. Admin puede drag-and-drop para reordenar.
8. Admin puede click "×" para desvincular una imagen de la galería.
9. Al guardar el formulario, el array de fileIds se persiste en el atributo correspondiente.

## Criterios de aceptación

- [x] `MediaPicker` muestra una lista de archivos existentes del bucket especificado con thumbnails — `useBucketFiles` con `Query.orderDesc("$createdAt")` + paginación cursor; grilla 3-4 cols con `ImagePreview` 200×200.
- [x] `MediaPicker` permite seleccionar un archivo y retorna su `fileId` al componente padre — modo single: `setSelected([fileId])`; `onSelect(selected)` en confirm.
- [x] `MediaPicker` en modo `multiple` permite seleccionar varios archivos y retorna array de `fileId` — prop `multiple`; toggle agrega/elimina del array `selected[]`; confirm llama `onSelect(selected)`.
- [x] `MediaPicker` incluye botón para subir nuevo archivo desde dentro del picker — tab "Subir nuevo" (`UploadTab`) con drag-and-drop + progress; solo visible cuando `isAdmin=true`.
- [x] `MediaPicker` se muestra como modal centrado en desktop y fullscreen en mobile — `w-full h-[92dvh] rounded-t-2xl` en mobile; `sm:w-[640px] sm:h-[580px] sm:rounded-2xl` en desktop; backdrop blur.
- [x] `GalleryManager` muestra grid de thumbnails para los fileIds proporcionados — `SortableContext` + `SortableItem` con `ImagePreview` 300×300; grilla `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`.
- [x] `GalleryManager` permite agregar imágenes abriendo `MediaPicker` — botón "Agregar imagen" abre `MediaPicker` en modo `multiple`; nuevos IDs se añaden al array sin duplicados.
- [x] `GalleryManager` permite desvincular imágenes de la lista (no las borra del bucket) — botón X en `SortableItem.onRemove` filtra el fileId del array; no llama a `storage.deleteFile`.
- [x] `GalleryManager` permite reordenar imágenes con drag-and-drop — `DndContext` + `@dnd-kit/sortable` con `PointerSensor` (activationConstraint distance:5) + `KeyboardSensor`; `arrayMove` en `handleDragEnd`.
- [x] `GalleryManager` tiene fallback de botones up/down para reorder en mobile — `ChevronLeft`/`ChevronRight` buttons visibles en `sm:hidden` sobre cada thumbnail; `arrayMove(value, index, index±1)`.
- [x] `ImagePreview` renderiza imagen de Appwrite Storage con el tamaño especificado via props — `storage.getFilePreview(bucketId, fileId, width, height, undefined, quality)` con defaults `width=800, height=600`.
- [x] `ImagePreview` muestra placeholder/skeleton si la imagen está cargando — `animate-pulse bg-warm-gray` superpuesto mientras `status !== "loaded"`.
- [x] `ImagePreview` muestra fallback visual si el fileId no existe o falla la carga — `onError → setStatus("error")` renderiza `<ImageIcon>` placeholder; también cuando `fileId` es null/undefined.
- [x] `ImagePreview` usa lazy loading — `<img loading="lazy" />`; no carga hasta que entra al viewport.
- [x] El grid de `GalleryManager` es responsive: 2 cols mobile, 3 cols tablet, 4 cols desktop — `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2`.
- [x] Los componentes se integran correctamente con el formulario de experiencias (heroImage + gallery) — `ExperienceForm.jsx`: `ImageUpload` para `heroImageId`, `GalleryManager` para `galleryImageIds` (parseado de JSON string, serializado a JSON en submit).
- [x] Los componentes se integran correctamente con el formulario de secciones de publicación (mediaIds) — `SectionForm.jsx`: cuando `sectionType === "gallery"` se muestra `GalleryManager` con `bucketPublicationMedia`; para otros tipos se mantiene textarea JSON.
- [x] Un operator puede browse y seleccionar archivos pero no subir nuevos — prop `isAdmin` controla la visibilidad del tab "Subir nuevo"; operator recibe `isAdmin=false` → solo ve "Explorar".

## Validaciones de seguridad

- [x] Los permisos de bucket se validan server-side; el componente respeta las restricciones — `useBucketFiles` llama `storage.listFiles` con sesión del usuario; Appwrite rechaza si no tiene `read` en el bucket; errores capturados en `error` state.
- [x] No se permite subir archivos desde el picker si el usuario no tiene permisos de create en el bucket — tab "Subir nuevo" solo se muestra cuando `isAdmin=true`; la UI gatea el acceso; y aunque se llame `upload()`, Appwrite rechaza el `createFile` si el label no tiene `create` en el bucket.
- [x] Las URLs de preview se generan solo con fileIds válidos del proyecto Appwrite — `storage.getFilePreview(bucketId, fileId, ...)` genera URLs con el `projectId` del SDK configurado; IDs de otros proyectos devuelven 404 de Appwrite.
- [x] El componente no expone fileIds internos en la URL del navegador — los fileIds se mantienen solo en estado React (`value`, `selected`); no hay manipulación de `window.location` ni query params con fileIds.

## Dependencias

- **TASK-037:** Storage buckets — provee buckets configurados, `useFileUpload` hook, `ImageUpload` componente.

## Bloquea a

Ninguna tarea directamente, pero mejora la UX de:
- **TASK-011:** CRUD experiencias — integración de galería.
- **TASK-035:** CRUD publicaciones — integración de media en secciones.

## Riesgos y notas

- **Listado de archivos:** Appwrite Storage SDK `listFiles` retorna archivos con paginación. Para buckets con muchos archivos, implementar scroll infinito o paginación en el picker.
- **Drag-and-drop librería:** Reutilizar la misma librería elegida en TASK-035 para secciones (ej: `@dnd-kit/core`).
- **Performance:** Si el `GalleryManager` tiene muchas imágenes (>20), las thumbnails deben usar tamaño pequeño (200px width) via preview API para no sobrecargar la carga.
- **FileId persistence:** Los fileIds se almacenan como JSON string en atributos `string(5000)`. Asegurarse de que el parse/stringify sea robusto y no pierda datos.
- **Archivos huérfanos:** Si un admin sube un archivo pero no guarda el formulario, queda en el bucket sin referencia. No se implementa cleanup automático.
