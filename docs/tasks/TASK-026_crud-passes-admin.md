# TASK-026: CRUD pases consumibles desde admin + reglas de consumo

## Objetivo

Implementar la gestión de pases consumibles (pass types) desde el panel administrativo, permitiendo crear, editar, listar y archivar tipos de pase con sus créditos, validez, precios y experiencias válidas. Adicionalmente, permitir al admin ver los pases comprados por usuarios (`user_passes`) y ajustar manualmente sus créditos. Al completar esta tarea, el admin puede configurar la oferta de pases consumibles de OMZONE.

## Contexto

- **Fase:** 8 — Pases y paquetes
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 8
- **Documento maestro:** Sección 7.6 (Pase consumible), RF-07 (Procesamiento de pagos — pass sale mode), RF-13 (Pases consumibles)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `passes` (3.8), `user_passes` (6.7)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Comercial (passes), Transaccional (user_passes)
- **ADR relacionados:** ADR-003 (Separación editorial y comercial) — los pases son entidades comerciales, no editoriales

## Alcance

Lo que SÍ incluye esta tarea:

1. **Admin — Pass Types List** (`/admin/passes`):
   - Listado de tipos de pase (`passes` collection) con nombre, créditos, precio, status.
   - Filtro por status: active, inactive.
   - Actions: crear nuevo, editar, cambiar status.

2. **Admin — Pass Type Form** (`/admin/passes/new`, `/admin/passes/:passId/edit`):
   - Campos: `name`, `nameEs`, `description`, `descriptionEs`, `totalCredits`, `basePrice`, `currency`, `validityDays`, `validExperienceIds`, `status`, `heroImageId`.
   - Experience picker: multi-select de experiencias publicadas para `validExperienceIds`.
   - Validación: name requerido, totalCredits ≥ 1, basePrice ≥ 0, currency requerido.
   - Guardar: crear o actualizar documento `passes`.

3. **Admin — User Passes Management** (`/admin/passes/user-passes`):
   - Listado de pases comprados por usuarios (`user_passes`).
   - Mostrar: usuario, tipo de pase, créditos total / restantes, status, fecha de activación, expiración.
   - Filtro por status: active, depleted, expired.
   - Detalle de user pass: consumption history (preview — lectura de `pass_consumptions`).
   - Admin puede ajustar manualmente `remainingCredits` (con registro en `admin_activity_logs`).

## Fuera de alcance

- Compra de pases desde checkout — TASK-029.
- Consumo de pases (redención de créditos) — TASK-027.
- Vista pública de pases disponibles para compra — futura task.
- Slug generation automática para pases.
- Pass gifting o transfer entre usuarios.
- Notificaciones de expiración próxima.

## Dominio

- [x] Comercial (pricing, addons, paquetes, pases)
- [x] Frontend admin

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `passes` | crear / leer / actualizar | CRUD de tipos de pase |
| `user_passes` | leer / actualizar | Ver pases de usuarios; ajustar créditos |
| `pass_consumptions` | leer | Mostrar historial de consumo en detalle |
| `experiences` | leer | Picker de experiencias válidas |
| `admin_activity_logs` | crear | Registrar ajustes manuales de créditos |

## Atributos nuevos o modificados

N/A — se usan atributos existentes definidos en el data model.

## Functions implicadas

N/A — las operaciones CRUD se realizan directamente con Appwrite SDK desde frontend (permisos de colección controlan acceso).

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_media` | leer | Para hero image del pase (si se referencia) |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `PassList` | admin | crear | Listado de tipos de pase con filtros |
| `PassForm` | admin | crear | Formulario crear/editar tipo de pase |
| `ExperiencePicker` | admin | crear | Multi-select de experiencias publicadas |
| `UserPassesList` | admin | crear | Listado de pases comprados por usuarios |
| `UserPassDetail` | admin | crear | Detalle de user pass con historial de consumo |
| `CreditAdjustForm` | admin | crear | Modal para ajustar créditos manualmente |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `usePasses` | crear | CRUD de tipos de pase |
| `useUserPasses` | crear | Lista user_passes con filtros |
| `usePassConsumptions` | crear | Historial de consumos para un user_pass |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/passes` | admin | `admin` | Listado de tipos de pase |
| `/admin/passes/new` | admin | `admin` | Crear nuevo tipo de pase |
| `/admin/passes/:passId/edit` | admin | `admin` | Editar tipo de pase |
| `/admin/passes/user-passes` | admin | `admin` | Listado de pases de usuarios |
| `/admin/passes/user-passes/:userPassId` | admin | `admin` | Detalle de user pass |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Listar tipos de pase | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear/editar tipo de pase | ✅ | ✅ | ❌ | ❌ | ❌ |
| Cambiar status de pase | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver user passes | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ajustar créditos manualmente | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

### CRUD Pass Types
1. Admin navega a `/admin/passes`.
2. Ve listado de tipos de pase con nombre, créditos, precio, status.
3. Puede filtrar por status (active/inactive).
4. Click "Crear pase" → formulario con campos del pass type.
5. En el formulario, usa ExperiencePicker para seleccionar experiencias válidas.
6. Guarda → crea documento en colección `passes`.
7. Para editar: click en pass → formulario pre-llenado → guardar actualización.

### User Passes Management
1. Admin navega a `/admin/passes/user-passes`.
2. Ve listado de pases comprados: usuario, tipo, créditos, status.
3. Click en un user pass → detalle con historial de consumo.
4. Admin puede hacer click en "Ajustar créditos" → modal con nuevo valor y razón.
5. Al guardar: se actualiza `remainingCredits` y se crea `admin_activity_logs` entry.

## Criterios de aceptación

- [ ] La página `/admin/passes` lista todos los tipos de pase con nombre, créditos totales, precio, currency y status.
- [ ] Se puede filtrar la lista por status (active, inactive).
- [ ] El formulario de creación valida: name requerido, totalCredits ≥ 1, basePrice ≥ 0, currency requerido.
- [ ] El ExperiencePicker muestra solo experiencias con `status === "published"` y permite selección múltiple.
- [ ] Al guardar, se crea/actualiza el documento `passes` en la colección correspondiente.
- [ ] La lista de user passes muestra: nombre de usuario, tipo de pase, créditos restantes/totales, status, expiración.
- [ ] Se puede filtrar user passes por status (active, depleted, expired).
- [ ] El detalle de un user pass muestra el historial de consumos (`pass_consumptions`).
- [ ] El admin puede ajustar manualmente `remainingCredits` de un user pass.
- [ ] Cada ajuste manual se registra en `admin_activity_logs` con userId del admin, acción, entityId y detalles.
- [ ] El formulario y la lista son responsive en mobile (stack en 1 columna < 640px).
- [ ] Un usuario sin label `admin` que accede a `/admin/passes` es redirigido.
- [ ] El campo `validExperienceIds` se persiste como JSON array string.

## Validaciones de seguridad

- [ ] Solo usuarios con label `admin` pueden crear, editar y gestionar tipos de pase.
- [ ] El ajuste manual de créditos siempre genera un registro de auditoría en `admin_activity_logs`.
- [ ] Los `validExperienceIds` se validan contra experiencias existentes al guardar.
- [ ] No se permite establecer `remainingCredits` en valor negativo.

## Dependencias

- **TASK-004:** Schema comercial — provee colección `passes`.
- **TASK-006:** Schema transaccional — provee `user_passes`, `pass_consumptions`.
- **TASK-010:** Admin layout — sidebar, navigation shell.
- **TASK-011:** CRUD experiencias — provee las experiencias para el ExperiencePicker.

## Bloquea a

- **TASK-027:** Function `consume-pass` — requiere tipos de pase configurados.
- **TASK-029:** Checkout para pases — requiere tipos de pase disponibles para venta.
- **TASK-033:** Mis pases en portal — requiere user_passes existentes.

## Riesgos y notas

- **validExperienceIds como JSON string:** El campo `validExperienceIds` es un JSON array string, no una relación Appwrite nativa. El ExperiencePicker debe serializar/deserializar correctamente. Verificar que el query "experiencia incluida en el pase" funcione buscando dentro del JSON string.
- **Ajuste de créditos:** El ajuste manual es una operación sensible. Considerar si requiere confirmación de doble paso (modal de confirmación) para prevenir errores.
- **User pass sin orden:** En v1, los user passes se crean solo vía checkout (TASK-029). El admin puede ajustar créditos pero no crear user passes manualmente.
- **Expiración:** `expiresAt` se calcula como `activatedAt + validityDays`. Si `validityDays` es null, el pase no expira. La UI debe reflejar ambos casos.
