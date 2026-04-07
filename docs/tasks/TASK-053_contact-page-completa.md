# TASK-053: Contact page completa — formulario funcional e información de contacto

## Objetivo

Reescribir la página de contacto de OMZONE transformándola de un placeholder con iconos a una página completa con formulario funcional (nombre, email, mensaje), información de contacto, redes sociales, ubicación visual y hero. Al completar esta tarea, un visitante puede enviar un mensaje directamente desde la web y encontrar todas las vías de contacto.

## Contexto

- **Fase:** A — Landing & páginas públicas (post-fase 15)
- **Documento maestro:** Sección 3.1 (Sitio público)
- **Estado actual:** `src/pages/public/ContactPage.jsx` es placeholder — título + email/location icons + "form coming soon". Sin formulario real.
- **Instrucciones de contenido:** `.github/instructions/content.instructions.md`

El formulario de contacto almacena mensajes en una nueva collection `contact_messages` en Appwrite. No requiere autenticación — cualquier visitante puede enviar un mensaje.

## Alcance

Lo que SÍ incluye esta tarea:

1. **Hero section** con imagen de fondo y título "Get in Touch" / "Contacto".
2. **Formulario de contacto** con campos:
   - Nombre completo (requerido)
   - Email (requerido, validación de formato)
   - Asunto (opcional)
   - Mensaje (requerido, textarea)
   - Botón "Send Message" / "Enviar Mensaje"
3. **Validación client-side** de campos requeridos y formato email.
4. **Envío a Appwrite** — crear documento en collection `contact_messages`.
5. **Feedback visual** — estado de envío (loading), confirmación de éxito, error si falla.
6. **Sección de información de contacto** — email, ubicación textual (Puerto Vallarta), redes sociales (Instagram, Facebook).
7. **Crear collection `contact_messages`** en `appwrite.json` con atributos:
   - `name` (string, required)
   - `email` (string, required)
   - `subject` (string, optional)
   - `message` (string, required)
   - `isRead` (boolean, default false)
   - `readAt` (datetime, optional)
8. **Permisos de la collection** — `create(any)` para que visitantes anónimos puedan enviar. `read/update/delete` solo admin/root.
9. **Textos bilingües** — EN/ES via i18n.
10. **Responsive** — formulario single-column en mobile, two-column layout (form + info) en desktop.

## Fuera de alcance

- Google Maps embed interactivo.
- Envío de email al admin vía Function (enhancement futuro — TASK-042).
- CAPTCHA o protección anti-spam.
- Notificación push al admin de nuevo mensaje.
- Listado de mensajes en admin (futuro, se puede ver directo en Appwrite console).
- Auto-respuesta al visitante.

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Configuración (settings, templates)
- [x] Frontend público

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `contact_messages` | crear (nueva collection) | Almacena mensajes de contacto |

## Atributos nuevos o modificados

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `contact_messages` | `name` | string(255) | sí | Nombre del remitente |
| `contact_messages` | `email` | email(320) | sí | Email del remitente |
| `contact_messages` | `subject` | string(255) | no | Asunto del mensaje |
| `contact_messages` | `message` | string(5000) | sí | Cuerpo del mensaje |
| `contact_messages` | `isRead` | boolean | no | Marca de lectura (default false) |
| `contact_messages` | `readAt` | datetime | no | Fecha en que se leyó |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | El envío se hace directo con Appwrite SDK. Email notification es futuro. |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `public-resources` | leer | Hero image |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `ContactPage` | público | reescribir | Reescritura completa |
| `ContactHero` | público | crear | Hero con imagen de fondo |
| `ContactForm` | público | crear | Formulario con validación y envío |
| `ContactInfo` | público | crear | Información de contacto y redes |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useContactForm` | crear | Maneja estado del formulario, validación y envío a Appwrite |
| `useLanguage` | usar existente | Textos i18n |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/contact` | público | ninguno | Página de contacto |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver página de contacto | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enviar mensaje de contacto | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leer mensajes recibidos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Marcar como leído | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

1. El visitante navega a `/contact`.
2. Ve hero con imagen y título.
3. Llena el formulario: nombre, email, asunto (opcional), mensaje.
4. Presiona "Send Message".
5. Si validación falla, ve errores inline en los campos.
6. Si validación pasa, se crea documento en `contact_messages`.
7. Ve confirmación de éxito: "Thank you! We'll get back to you soon."
8. El formulario se resetea.
9. Si hay error de red/servidor, ve mensaje de error con opción de reintentar.

## Criterios de aceptación

- [ ] La página `/contact` muestra hero con imagen y título.
- [ ] El formulario tiene campos: nombre, email, asunto (opcional), mensaje.
- [ ] Al enviar sin nombre o email, se muestran errores inline.
- [ ] Al enviar con email inválido, se muestra error de formato.
- [ ] Al enviar con datos válidos, se crea documento en `contact_messages`.
- [ ] Tras envío exitoso, se muestra mensaje de confirmación y el formulario se resetea.
- [ ] Si el envío falla, se muestra error con opción de reintentar.
- [ ] La sección de información muestra email de contacto, ubicación y redes sociales.
- [ ] Todos los textos están en i18n (EN/ES).
- [ ] El formulario es single-column en mobile, two-column layout con info en desktop.
- [ ] Los campos tienen labels accesibles y placeholder text.
- [ ] El botón de envío muestra loading state durante el envío.
- [ ] `SEOHead` tiene title y description para la página de contacto.
- [ ] La collection `contact_messages` está en `appwrite.json` con permisos correctos: `create(any)`, `read(label:admin, label:root)`.
- [ ] `npm run build` pasa limpio.

## Validaciones de seguridad

- [ ] La collection `contact_messages` solo permite `create` para `any` — no allow read/update/delete para anónimos.
- [ ] Input validado: email con formato correcto, nombre y mensaje no vacíos, message max 5000 chars.
- [ ] No se expone información sensible en el frontend.

## Dependencias

- **TASK-016:** Public layout — provee `PublicLayout`.
- **TASK-046:** i18n — provee estructura i18n.

## Bloquea a

- **TASK-061:** Responsive audit.

## Riesgos y notas

- Sin CAPTCHA, la collection podría recibir spam. Mitigación inicial: `maxLength` en message, rate limiting natural de Appwrite. CAPTCHA como enhancement futuro.
- No se envía email automático al admin cuando llega un mensaje. El admin debe revisar en Appwrite console o en un futuro admin view.
- La collection `contact_messages` se crea en esta task y se agrega a `appwrite.json`.
