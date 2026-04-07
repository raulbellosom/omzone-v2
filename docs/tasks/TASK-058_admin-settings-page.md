# TASK-058: Admin — Página de configuración (settings)

## Objetivo

Implementar la página de configuración del panel admin de OMZONE, reemplazando el placeholder "Próximamente". Al completar esta tarea, un admin puede ver y gestionar los templates de notificación existentes (lista, preview, editar) y ver un panel informativo de la configuración del sistema (buckets, versión, datos de conexión).

## Contexto

- **Fase:** C — Admin: secciones faltantes (post-fase 15)
- **Documento maestro:** RF-15 (Panel admin completo), dominio Configuración
- **Estado actual:** La ruta `/admin/settings` renderiza `<AdminPlaceholder title="Configuración" />`.
- **Collection `notification_templates`:** EXISTE — atributos: `key`, `type` (email/sms/push), `subject`, `subjectEs`, `body`, `bodyEs`, `isActive`. Tiene 1 template seeded: `tpl-order-confirmation`.
- **Collection `site_settings`:** NO EXISTE — fue planeada en TASK-007 pero marcada fuera de alcance. Se pospone su creación.
- **Funciones que usan templates:** `send-confirmation` y `send-reminder` leen de `notification_templates`.

## Alcance

Lo que SÍ incluye esta tarea:

1. **Página `SettingsPage`** en `/admin/settings` con dos secciones:
   - **Sección "Notification Templates":**
     - Listado de templates existentes (key, type, subject, isActive).
     - Edición inline o modal de subject/body (EN y ES) y toggle isActive.
     - Preview renderizado del template HTML (iframe o sanitized render).
   - **Sección "System Info" (solo lectura):**
     - Versión de la app (del package.json).
     - Endpoint de Appwrite.
     - Buckets configurados (nombre, ID).
     - Status informativo (último deploy, etc. si está disponible).
2. **Hook `useNotificationTemplates`** — CRUD de `notification_templates` collection.
3. **Componente `TemplateEditor`** — Formulario de edición de template con tabs EN/ES y preview.
4. **Reemplazar placeholder** — eliminar ruta de `AdminPlaceholder` para settings en `App.jsx`.

## Fuera de alcance

- Creación de la collection `site_settings` (se pospone a fase posterior cuando haya settings reales que gestionar).
- CRUD de site_settings (branding, SEO, etc.).
- Gestión de usuarios o roles (ya existe en auth flow).
- Configuración de pasarela de pago (Stripe keys son env vars, no se gestionan desde UI).
- Editor WYSIWYG completo para templates (se usa textarea con HTML).
- Gestión de variables de entorno desde UI.
- Backup/restore de datos.

## Dominio

- [x] Configuración (settings, templates)
- [x] Frontend admin

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `notification_templates` | leer / actualizar | CRUD de templates de correo |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `SettingsPage` | admin | crear | Página principal de settings |
| `NotificationTemplateList` | admin | crear | Listado de templates |
| `TemplateEditor` | admin | crear | Edición de template (subject/body EN/ES + preview) |
| `SystemInfoPanel` | admin | crear | Panel informativo del sistema |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useNotificationTemplates` | crear | List, get, update templates |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/settings` | admin | admin/root | Página de configuración |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver configuración | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar templates | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver system info | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

1. El admin navega a `/admin/settings`.
2. Ve dos secciones: "Notification Templates" y "System Info".
3. En la sección de templates, ve el listado con key, type, subject e isActive.
4. Hace click en un template para abrir el editor.
5. En el editor, ve tabs EN/ES con subject y body (textarea HTML).
6. Puede previsualizar el template renderizado.
7. Puede activar/desactivar un template con toggle.
8. Guarda cambios.
9. En System Info, ve la configuración del sistema (solo lectura).

## Criterios de aceptación

- [ ] La ruta `/admin/settings` muestra la página de configuración.
- [ ] Se listan los templates de notificación existentes.
- [ ] Se puede editar subject y body (EN y ES) de un template.
- [ ] Se puede activar/desactivar un template con toggle.
- [ ] El preview renderiza el HTML del template correctamente.
- [ ] El panel System Info muestra versión, endpoint y buckets.
- [ ] Solo admin/root pueden acceder.
- [ ] Los cambios se persisten correctamente en la collection.
- [ ] Layout responsive.
- [ ] `npm run build` pasa limpio.

## Validaciones de seguridad

- [ ] Solo admin/root pueden editar templates (collection permissions ya lo restringen).
- [ ] El HTML del template se muestra en sandbox (iframe o sanitized) para evitar XSS en preview.

## Dependencias

- **TASK-007:** Schema usuario y config — provee collection `notification_templates`.
- **TASK-010:** Admin layout.
- Scripts de seed: `seed-notification-templates.mjs` crea el template base.

## Bloquea a

- **TASK-060:** QA integral.

## Riesgos y notas

- El editor de templates es un textarea con HTML — no un WYSIWYG. Los templates ya están escritos en HTML con placeholders (e.g., `{{orderNumber}}`). El admin puede modificarlos pero necesita conocimiento básico de HTML.
- El preview debe sanitizar o usar iframe sandboxed para evitar XSS.
- Si en el futuro se crea `site_settings` collection, se puede expandir esta página agregando una sección adicional.
- Considerar agregar un botón "Reset to default" que restaure el template original del seed.
