# TASK-034: Perfil del cliente — datos editables

## Objetivo

Implementar la sección "Mi Perfil" en el portal de cliente, permitiendo al usuario ver y editar sus datos de perfil extendido (nombre, teléfono, idioma preferido, foto) almacenados en `user_profiles`. Al completar esta tarea, un cliente puede personalizar su perfil, subir una foto, configurar idioma preferido y ver su email registrado.

## Contexto

- **Fase:** 9 — Portal de cliente
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 9
- **Documento maestro:** Sección 3.2 (Portal de cliente), RF-12 (Portal de cliente)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `user_profiles` (7.1)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Portal cliente: Usuario (read/write own)

## Alcance

Lo que SÍ incluye esta tarea:

1. **Profile Page** (`/portal/profile`):
   - Display current profile data: displayName, firstName, lastName, phone, language, photo, bio.
   - Show email from Appwrite Auth (read-only, not editable).
   - Edit mode: inline form or toggle to edit mode.

2. **Profile Form:**
   - Editable fields:
     - `displayName` (string, optional)
     - `firstName` (string, optional)
     - `lastName` (string, optional)
     - `phone` (string, optional — format validation)
     - `language` (enum toggle: `es` / `en`)
     - `bio` (string, optional, max 1000 chars)
   - Validación:
     - `phone`: formato telefónico válido (permite +, dígitos, espacios, mínimo 10 chars si presente).
     - Character limit para `bio` (1000).
     - Al menos `displayName` o `firstName` debe estar presente.
   - Save: actualizar documento `user_profiles` por `userId`.
   - Success feedback: toast o mensaje inline "Perfil actualizado".

3. **Photo Upload:**
   - Área de foto con avatar actual o placeholder.
   - Click para abrir file picker (images only: jpg, png, webp).
   - Upload a Storage bucket (user_avatars o equivalente).
   - Actualizar `photoId` en `user_profiles` con el fileId.
   - Preview de la imagen antes de guardar.
   - Max file size: 2MB.

4. **Language Preference:**
   - Toggle ES / EN (or dropdown).
   - Guardar en `user_profiles.language`.
   - Nota: el cambio de idioma en v1 es un flag guardado. La i18n real del portal puede implementarse después.

5. **Email display:**
   - Mostrar email del usuario desde Appwrite Auth (session data).
   - Read-only con nota "Para cambiar tu email, contacta a soporte".

## Fuera de alcance

- Password change.
- Email change.
- Account deletion / deactivation.
- Notification preferences.
- Two-factor authentication.
- Social login connections.
- Address / billing info (no required in v1).

## Dominio

- [x] Usuario (perfiles, preferencias)
- [x] Frontend portal

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `user_profiles` | leer / actualizar | Leer perfil actual; guardar cambios |

## Atributos nuevos o modificados

N/A — se usan atributos existentes definidos en el data model.

## Functions implicadas

N/A — updates directos con Appwrite SDK (permisos `Role.user("{userId}")` permiten que el usuario edite su propio perfil).

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `user_avatars` | crear (upload) / leer | Subir y mostrar foto de perfil |

Nota: Si el bucket `user_avatars` no existe, debe crearse con permisos: Create `Role.users()`, Read `Role.users()`, Update/Delete `Role.user("{userId}")`.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `ProfilePage` | portal | crear | Página principal de perfil |
| `ProfileForm` | portal | crear | Formulario editable de perfil |
| `AvatarUpload` | portal | crear | Upload y preview de foto de perfil |
| `LanguageToggle` | portal | crear | Toggle ES/EN para preferencia de idioma |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useUserProfile` | usar/crear | Leer/actualizar perfil del usuario (puede existir de TASK-030) |
| `useAvatarUpload` | crear | Upload de imagen a Storage, retorna fileId |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/portal/profile` | portal | `client` | Página de perfil |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver perfil propio | ✅ | ✅ | ❌ | ✅ | ❌ |
| Editar perfil propio | ✅ | ✅ | ❌ | ✅ | ❌ |
| Subir foto de perfil | ✅ | ✅ | ❌ | ✅ | ❌ |

## Flujo principal

1. Cliente navega a `/portal/profile`.
2. Se carga `user_profiles` por `userId` del usuario autenticado.
3. Se muestra perfil actual: avatar, displayName, firstName, lastName, phone, email (read-only), language, bio.
4. Cliente click "Editar" (o los campos son editables inline).
5. Modifica campos deseados.
6. Para cambiar foto: click en área de avatar → file picker → preview → confirma.
7. Imagen se sube a Storage → se obtiene fileId → se guarda en `photoId`.
8. Click "Guardar" → se actualiza `user_profiles`.
9. Success feedback: "Perfil actualizado correctamente".
10. Para cambiar idioma: toggle ES/EN → actualiza `language`.

## Criterios de aceptación

- [x] La página `/portal/profile` muestra los datos actuales del perfil del usuario.
- [x] El email se muestra como read-only con nota "Para cambiar tu email, contacta a soporte".
- [x] Se pueden editar: displayName, firstName, lastName, phone, language, bio.
- [x] La validación de phone acepta formatos con +, dígitos, espacios; mínimo 10 caracteres si presente.
- [x] La validación de bio limita a 1000 caracteres con contador visible.
- [x] Al guardar, se muestra feedback de éxito (toast o mensaje inline).
- [x] Se puede subir una foto de perfil (jpg, png, webp) de máximo 2MB.
- [x] Se muestra preview de la imagen antes de confirmar el upload.
- [x] Si la imagen excede 2MB, se muestra error de validación antes del upload.
- [x] La foto se sube a Storage y el `photoId` se actualiza en `user_profiles`.
- [x] El toggle de idioma guarda la preferencia en `user_profiles.language`.
- [x] Si el usuario no tiene perfil (`user_profiles` doc no existe), se maneja el caso con creación automática o mensaje descriptivo.
- [x] La página es responsive: form stack en 1 columna en mobile (< 640px).
- [x] Un usuario solo puede editar su propio perfil.

## Validaciones de seguridad

- [x] El update de `user_profiles` usa permisos `Role.user("{userId}")` — el usuario solo puede editar su propio documento.
- [x] El upload de foto valida: tipo de archivo (solo imágenes), tamaño (max 2MB), no ejecutables.
- [x] No se permite a un usuario editar el perfil de otro usuario.
- [x] Los campos de texto se sanitizan (trim whitespace, no HTML injection).
- [ ] El `photoId` viejo se puede eliminar de Storage al subir nueva foto (cleanup).

## Dependencias

- **TASK-007:** Schema usuario — provee `user_profiles`.
- **TASK-030:** Portal layout — provee PortalLayout.

## Bloquea a

N/A — esta es una task terminal dentro de la fase 9.

## Riesgos y notas

- **Profile document existence:** El `user_profiles` doc debería crearse en signup (TASK-008 — Function assign-user-label). Si no existe, el profile page debe manejar este caso: crear el doc on first save o mostrar campos vacíos editables.
- **Avatar bucket:** Verificar que el bucket `user_avatars` existe en `appwrite.json`. Si no, esta task debe incluir su creación con permisos correctos. Alternativa: usar un bucket genérico `user_media`.
- **Photo cleanup:** Cuando el usuario sube una nueva foto, la anterior queda en Storage sin referencia. Implementar cleanup async o aceptar el "leak" en v1 (low priority).
- **Language impact:** En v1, cambiar `language` guarda la preferencia pero no traduce la UI automáticamente. La i18n del portal es una futura task. El valor guardado se usará cuando la i18n se implemente.
- **Phone validation:** Usar regex simple que acepte formatos internacionales (`+52 55 1234 5678`, `+1-555-123-4567`). No validar contra base de datos de country codes en v1.
- **Appwrite Auth email:** El email se lee de la session/account data de Appwrite Auth, no de `user_profiles`. Asegurar que el componente accede a `account.get()` para el email.
