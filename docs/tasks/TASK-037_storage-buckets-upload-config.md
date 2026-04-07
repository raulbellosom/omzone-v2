# TASK-037: Buckets de storage — configuración, permisos, upload desde admin

## Objetivo

Configurar todos los buckets de Appwrite Storage necesarios para OMZONE con permisos adecuados por rol, agregar la configuración a `appwrite.json` y crear el hook `useFileUpload` y el componente `ImageUpload` reutilizable para admin. Al completar esta tarea, el sistema tiene la infraestructura completa de almacenamiento de archivos y los admins pueden subir imágenes desde cualquier formulario.

## Contexto

- **Fase:** 11 — Media y storage
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 11
- **Documento maestro:** Secciones:
  - **RF-15:** Media management — gestión de imágenes y archivos
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Buckets referenciados por atributos `heroImageId`, `galleryImageIds`, `photoId`, `mediaIds`, `ogImageId` en múltiples colecciones.
- **ADR relacionados:** Ninguno específico — es infraestructura base de storage.

Varios tasks anteriores (TASK-011, TASK-035) referencian buckets de storage pero sin crear la infraestructura formal. Esta tarea centraliza la configuración de todos los buckets.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear buckets de Appwrite Storage:
   - `experience_images` — portadas y galerías de experiencias
   - `publication_media` — media de publicaciones y secciones
   - `user_avatars` — fotos de perfil de usuarios
   - `addon_images` — imágenes de addons
   - `package_images` — imágenes de paquetes
   - `documents` — documentos descargables (tickets PDF, comprobantes futuros)
2. Configurar permisos por bucket:
   - `experience_images`: read `Role.any()`, create/update/delete `Role.label("admin")`
   - `publication_media`: read `Role.any()`, create/update/delete `Role.label("admin")`
   - `addon_images`: read `Role.any()`, create/update/delete `Role.label("admin")`
   - `package_images`: read `Role.any()`, create/update/delete `Role.label("admin")`
   - `user_avatars`: read `Role.any()`, create/update `Role.users()`, delete `Role.label("admin")`
   - `documents`: read `Role.users()`, create/delete `Role.label("admin")`
3. Configurar restricciones por bucket:
   - `experience_images`, `publication_media`, `addon_images`, `package_images`: max 10MB, tipos permitidos: jpg, jpeg, png, webp, gif
   - `user_avatars`: max 2MB, tipos: jpg, jpeg, png, webp
   - `documents`: max 20MB, tipos: pdf, jpg, png
4. Agregar configuración de buckets a `appwrite.json`.
5. Crear hook `useFileUpload`:
   - `uploadFile(bucketId, file)` → retorna `{ fileId, previewUrl }`
   - `deleteFile(bucketId, fileId)` → void
   - `getPreviewUrl(bucketId, fileId, width?, height?)` → URL de preview
   - Estado: `uploading`, `error`, `progress`
6. Crear componente `ImageUpload` para admin:
   - Drag-and-drop zone para soltar archivos
   - Click para seleccionar archivo
   - Preview de imagen cargada
   - Botón para eliminar imagen cargada
   - Validación de tipo y tamaño antes de upload
   - Indicador de progreso durante upload
   - Feedback de error (tipo inválido, tamaño excedido, error de API)
   - Prop `bucketId` para indicar destino
   - Prop `onUpload(fileId)` callback tras subida exitosa
   - Prop `initialFileId` para mostrar imagen ya cargada
7. Deploy de buckets con `appwrite deploy` o configuración en `appwrite.json`.

## Fuera de alcance

- Optimización automática de imágenes (resize server-side, CDN).
- Batch upload (subir múltiples archivos a la vez).
- Media library browser (listado de todos los archivos — TASK-038).
- Generación de thumbnails personalizadas.
- Compresión de imágenes antes de upload.
- Migración de archivos existentes.

## Dominio

- [x] Media / Assets
- [x] Infraestructura

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| Ninguna tabla | — | Esta tarea opera sobre Storage, no sobre Databases |

## Atributos nuevos o modificados

N/A — esta tarea configura Storage buckets, no colecciones de base de datos.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Upload y delete se hacen directamente con Appwrite Storage SDK |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_images` | crear | Portadas y galerías de experiencias |
| `publication_media` | crear | Media de publicaciones y secciones |
| `user_avatars` | crear | Fotos de perfil |
| `addon_images` | crear | Imágenes de addons |
| `package_images` | crear | Imágenes de paquetes |
| `documents` | crear | Documentos descargables |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `ImageUpload` | admin | crear | Componente reutilizable de upload con drag-and-drop |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useFileUpload` | crear | Upload, delete, preview URL, estado de progreso |

## Rutas implicadas

N/A — no se crean rutas nuevas; el componente se usa dentro de formularios existentes.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver imágenes públicas (experience, publication, addon, package) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver avatares | ✅ | ✅ | ✅ | ✅ | ✅ |
| Ver documentos propios | ✅ | ✅ | ✅ | ✅ (propios) | ❌ |
| Subir imágenes a buckets públicos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Subir avatar propio | ✅ | ✅ | ✅ | ✅ | ❌ |
| Eliminar archivos | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

1. Desarrollador configura los 6 buckets en `appwrite.json` o vía consola/CLI.
2. Se despliegan buckets con `appwrite deploy`.
3. El hook `useFileUpload` se integra en componentes de formulario.
4. Admin abre formulario de experiencia/publicación/addon.
5. Admin arrastra imagen al drop zone o hace click para seleccionar.
6. Se valida tipo y tamaño del archivo.
7. Se sube el archivo al bucket correspondiente.
8. Se muestra preview de la imagen cargada.
9. El fileId se almacena en el campo correspondiente del formulario (heroImageId, etc.).
10. Admin puede eliminar imagen y subir una nueva.

## Criterios de aceptación

- [x] Los 6 buckets están creados en Appwrite Storage: `experience_media`, `publication_media`, `user_avatars`, `addon_images`, `package_images`, `documents` — desplegados con `appwrite push buckets --all`; confirmado: "Successfully pushed 6 buckets."
- [x] Los permisos de cada bucket están correctamente configurados según la matriz de permisos — configurados en `appwrite.json` y aplicados en servidor (read `any`/`users`, create/update/delete `label:admin`/`label:root` por bucket).
- [x] Los buckets de imágenes aceptan solo jpg, jpeg, png, webp, gif con max 10MB — `maximumFileSize: 10485760`, `allowedFileExtensions: ["jpg","jpeg","png","webp","gif"]` en `experience_media`, `publication_media`, `addon_images`, `package_images`.
- [x] El bucket `user_avatars` acepta solo jpg, jpeg, png, webp con max 2MB — `maximumFileSize: 2097152`, `allowedFileExtensions: ["jpg","jpeg","png","webp"]`.
- [x] El bucket `documents` acepta solo pdf, jpg, png con max 20MB — `maximumFileSize: 20971520`, `allowedFileExtensions: ["pdf","jpg","png"]`.
- [x] La configuración de buckets está incluida en `appwrite.json` — sección `"buckets"` con los 7 buckets (6 nuevos + `public-resources` existente).
- [x] El hook `useFileUpload` permite subir un archivo y retorna `{ fileId, previewUrl }` — `src/hooks/useFileUpload.js`; `upload(file)` retorna `{ fileId, previewUrl }`.
- [x] El hook permite eliminar un archivo por `bucketId` + `fileId` — `deleteFile(fileId)` usa el `bucketId` con que se instanció el hook.
- [x] El hook expone `getPreviewUrl(fileId, { width, height, quality })` para obtener previews de diferentes tamaños — configurable; retorna null para bucket `documents`.
- [x] El componente `ImageUpload` permite drag-and-drop de archivos — `onDragOver`/`onDragLeave`/`onDrop` handlers; visual feedback con `border-sage bg-sage/10 scale-[1.01]` y "Suelta aquí" overlay.
- [x] El componente `ImageUpload` permite click para seleccionar archivo del sistema — `onClick` abre `<input type="file" className="hidden" />` vía `inputRef.current.click()`.
- [x] El componente muestra preview de la imagen cargada — `getPreviewUrl(fileId, {width:800,height:533})`; con overlay hover y botón X para eliminar.
- [x] El componente muestra indicador de progreso durante el upload — `<ProgressBar progress={progress} />` con barra sage + texto `{progress}%`; progreso real via `onProgress` callback de Appwrite.
- [x] Si se intenta subir un archivo con tipo inválido, se muestra error descriptivo sin hacer upload — `validate(file)` en hook y componente antes de llamar a `storage.createFile`; muestra mensaje con tipos aceptados.
- [x] Si se intenta subir un archivo que excede el tamaño máximo, se muestra error descriptivo — `validate(file)` chequea `file.size > config.maxSize`; muestra `"El archivo supera el tamaño máximo de X MB"`.
- [x] El componente `ImageUpload` es responsive y funciona en mobile — `w-full aspect-video`, layout flex column, tamaño touch-friendly; funciona con input file nativo en mobile.
- [x] Un usuario anónimo puede ver imágenes públicas (experience_media, publication_media) pero no puede subir — permisos server-side: `read("any")` permite ver; `create` solo `label:admin`/`label:root`; Appwrite rechaza el upload.
- [x] Un admin puede subir y eliminar archivos de todos los buckets públicos — permisos `create/update/delete("label:admin")` + `("label:root")` en todos los buckets públicos.

## Validaciones de seguridad

- [x] Los permisos de bucket se validan server-side por Appwrite; el frontend no bypassa restricciones — permisos configurados en `appwrite.json` y aplicados en Appwrite server; el frontend llama SDK que envía el token de sesión del usuario y Appwrite verifica labels.
- [x] El tipo de archivo se valida tanto en frontend (antes de upload) como en el bucket — `validate(file)` en `useFileUpload.js` chequea `config.allowedTypes.includes(file.type)` antes del upload; `allowedFileExtensions` en bucket rechaza server-side.
- [x] El tamaño máximo se valida en frontend y enforced por el bucket — `file.size > config.maxSize` en `validate()`; `maximumFileSize` en bucket rechaza server-side.
- [x] El bucket `documents` no es legible por usuarios anónimos — solo `read("users")` (requiere sesión autenticada); `read("any")` NO está en el bucket `documents`.
- [x] No se exponen URLs de archivos del bucket `documents` a usuarios no autenticados — `getPreviewUrl()` retorna `null` para bucket `documents`; `getFileViewUrl()` genera la URL pero Appwrite rechaza la petición si no hay sesión válida con `read("users")`.

## Dependencias

- **TASK-001:** Scaffold proyecto — provee Appwrite SDK configurado y `appwrite.json` base.

## Bloquea a

- **TASK-038:** Componente de galería y media picker — necesita buckets y hook de upload.
- **TASK-045:** Performance — image optimization — necesita los buckets configurados para usar preview API.

## Riesgos y notas

- **Appwrite.json buckets:** Verificar que `appwrite.json` soporte la configuración de buckets con restricciones de tipo y tamaño. Si no, la configuración se hace manualmente en la consola y se documenta.
- **Permisos `user_avatars`:** El permiso `Role.users()` para create permite que cualquier usuario autenticado suba. Para restringir a "solo su propio avatar", la lógica debe estar en el frontend o en una Function. En esta versión se confía en la UX.
- **Archivos huérfanos:** Si un admin sube una imagen y luego no guarda el formulario, el archivo queda huérfano en Storage. No se implementa cleanup en esta tarea — es mejora futura.
- **Preview API sizing:** Appwrite Storage provee preview con parámetros `width` y `height`. Documentar los tamaños estándar para cada contexto (thumbnail: 200px, card: 600px, hero: 1200px).
