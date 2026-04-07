# TASK-013: CRUD addons y addon assignments desde admin

## Objetivo

Implementar la gestión de addons (complementos vendibles) y sus asignaciones a experiencias desde el panel administrativo de OMZONE: listado global de addons con búsqueda y filtros, creación y edición de addons, y dentro del detalle de experiencia gestionar qué addons están asignados con reglas de obligatoriedad, precio override y orden. Al completar esta tarea, un admin puede crear addons, activarlos/desactivarlos y asignarlos a experiencias con configuración por contexto.

## Contexto

- **Fase:** 3 — CRUD admin básico
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 3
- **Documento maestro:** Secciones:
  - **RF-05:** Gestión de addons — precio, tipo, dependencia de producto principal, obligatoriedad
  - **RF-11:** Addons en checkout — selección, precio, display
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Sección 3.4 (`addons`), 3.5 (`addon_assignments`)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Dominio Comercial (2.2) — addons son complementos que se enlazan a experiencias

Las tablas `addons` (16 atributos) y `addon_assignments` (7 atributos) fueron creadas en TASK-004.

## Alcance

Lo que SÍ incluye esta tarea:

1. Página global de addons (`/admin/addons`):
   - Tabla con columnas: nombre, tipo (addonType), priceType, basePrice, currency, status, acciones
   - Búsqueda por nombre
   - Filtro por tipo (service, transport, food, accommodation, equipment, other)
   - Filtro por status (active, inactive)
   - Botón "Crear addon"
   - Empty state cuando no hay addons
2. Formulario de creación de addon (`/admin/addons/create`):
   - Campos: `name`, `nameEs`, `slug` (auto-generado), `description`, `descriptionEs`, `addonType` (enum select), `priceType` (enum select), `basePrice`, `currency`, `isStandalone`, `isPublic`, `followsMainDuration`, `maxQuantity`, `heroImageId`, `status`, `sortOrder`
   - Validación: name requerido, slug requerido y único, basePrice > 0, addonType y priceType requeridos
3. Formulario de edición de addon (`/admin/addons/:id/edit`):
   - Mismos campos, pre-poblados
4. Activar/desactivar addon inline:
   - Toggle de status (active ↔ inactive) desde el listado
5. Sub-página de addon assignments dentro de experiencia (`/admin/experiences/:id/addons`):
   - Lista de addons asignados a esta experiencia: nombre del addon, isRequired, isDefault, overridePrice, sortOrder, acciones
   - Botón "Asignar addon"
   - Empty state si no hay addons asignados
6. Formulario de asignación de addon:
   - Select de addon (de la lista global de addons activos)
   - Campos: `isRequired`, `isDefault`, `overridePrice` (opcional — si vacío, se usa precio base), `sortOrder`
   - `experienceId` se asigna automáticamente del contexto
   - Validación: addon seleccionado requerido, no asignar el mismo addon dos veces a la misma experiencia
7. Edición de asignación:
   - Modificar isRequired, isDefault, overridePrice, sortOrder de una asignación existente
8. Eliminar asignación:
   - Remover la asignación addon ↔ experiencia (no elimina el addon global)
9. Tab/link "Addons" en el detalle de experiencia (integrar con tabs de TASK-012).

## Fuera de alcance

- Display de addons en vista pública / checkout (Fase 4-5).
- Pricing rules para addons (descuentos, condiciones).
- Addon assignments por edición (`editionId`) — solo por experiencia en esta tarea.
- Addon images / galería.
- Validación de que addons required estén presentes en checkout (eso es la Function de checkout).
- Bulk assign addons a múltiples experiencias.
- Estadísticas de ventas de addons.

## Dominio

- [x] Comercial (pricing, addons, paquetes, pases)
- Nota: clasificado como **Comercial + Frontend admin** en el plan maestro.

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `addons` | crear / leer / actualizar | CRUD global de addons |
| `addon_assignments` | crear / leer / actualizar / eliminar | Asignaciones addon ↔ experiencia |
| `experiences` | leer | Se lee la experiencia padre para contexto |

## Atributos nuevos o modificados

N/A — las tablas `addons` (16 attrs) y `addon_assignments` (7 attrs) fueron creadas en TASK-004.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | CRUD directo via Databases SDK |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_images` | usar existente | Reutilizar para heroImageId de addon (opcional) |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `AddonListPage` | admin | crear | Listado global de addons con tabla, filtros, búsqueda |
| `AddonCreatePage` | admin | crear | Formulario de creación de addon |
| `AddonEditPage` | admin | crear | Formulario de edición de addon |
| `AddonForm` | admin | crear | Formulario reutilizable (create + edit) |
| `AddonAssignmentListPage` | admin | crear | Sub-página de addons asignados a una experiencia |
| `AddonAssignmentForm` | admin | crear | Formulario de asignación (modal o inline) |
| `AddonAssignmentTable` | admin | crear | Tabla de asignaciones con acciones |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useAddons` | crear | Fetch, create, update addons globales |
| `useAddonAssignments` | crear | Fetch, create, update, delete asignaciones por experienceId |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/addons` | admin | heredado de `/admin` | Listado global de addons |
| `/admin/addons/create` | admin | heredado | Crear addon |
| `/admin/addons/:id/edit` | admin | heredado | Editar addon |
| `/admin/experiences/:id/addons` | admin | heredado | Addons asignados a experiencia |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Listar addons | ✅ | ✅ | ✅ | ❌ | ❌ |
| Crear addon | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar addon | ✅ | ✅ | ❌ | ❌ | ❌ |
| Activar/desactivar addon | ✅ | ✅ | ❌ | ❌ | ❌ |
| Listar asignaciones | ✅ | ✅ | ✅ | ❌ | ❌ |
| Crear asignación | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar asignación | ✅ | ✅ | ❌ | ❌ | ❌ |
| Eliminar asignación | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

### Flujo A — Gestionar addons globales
1. Admin navega a `/admin/addons`.
2. Ve la lista de addons con filtros por tipo y status.
3. Hace click en "Crear addon".
4. Llena formulario: name, addonType (ej: "transport"), priceType (ej: "fixed"), basePrice (ej: 500), currency (MXN), status (active).
5. Al escribir name, el slug se genera automáticamente.
6. Se valida y crea el documento en `addons`.
7. Se redirige al listado con mensaje de éxito.

### Flujo B — Asignar addon a experiencia
1. Admin navega a `/admin/experiences/:id/addons`.
2. Ve la lista de addons ya asignados a esta experiencia (vacía si es primera vez).
3. Hace click en "Asignar addon".
4. Selecciona un addon de la lista global (ej: "Airport Transfer").
5. Configura: isRequired = false, isDefault = false, overridePrice = null (usa precio base), sortOrder = 1.
6. Se valida que no esté duplicado y se crea el documento en `addon_assignments`.
7. El addon aparece en la lista de asignados.
8. Admin puede editar la asignación (ej: cambiar a isRequired = true) o eliminarla.

## Criterios de aceptación

- [ ] Un admin puede ver el listado global de addons en tabla con columnas: nombre, tipo, priceType, basePrice, status, acciones.
- [ ] Un admin puede crear un addon con name, addonType, priceType, basePrice, currency y status.
- [ ] El slug del addon se genera automáticamente desde el nombre y se puede override manualmente.
- [ ] La validación impide crear un addon con basePrice ≤ 0 o sin campos requeridos.
- [ ] El listado global soporta búsqueda por nombre y filtro por addonType y status.
- [ ] Un admin puede activar/desactivar un addon con toggle inline desde el listado.
- [ ] Un admin puede ver la lista de addons asignados a una experiencia en `/admin/experiences/:id/addons`.
- [ ] Un admin puede asignar un addon a una experiencia seleccionándolo de la lista global.
- [ ] La asignación permite configurar isRequired, isDefault, overridePrice y sortOrder.
- [ ] No se permite asignar el mismo addon dos veces a la misma experiencia (validación de unicidad).
- [ ] Un admin puede editar los parámetros de una asignación existente.
- [ ] Un admin puede eliminar una asignación addon ↔ experiencia.
- [ ] El tab "Addons" está integrado en la navegación del detalle de experiencia junto a Info, Ediciones y Precios.
- [ ] Si no hay addons globales, se muestra empty state con CTA "Crear primer addon".
- [ ] Si no hay addons asignados a una experiencia, se muestra empty state con CTA "Asignar primer addon".
- [ ] En mobile (< 768px), las tablas se transforman en cards.

## Validaciones de seguridad

- [ ] Las operaciones CRUD usan permisos de colección `Role.label("admin")`.
- [ ] Los precios (basePrice, overridePrice) se validan como números positivos.
- [ ] El slug se sanitiza (lowercase, hyphens, alfanuméricos).
- [ ] No se puede asignar el mismo addon dos veces (constraint por índice unique `idx_addonId_experienceId`).

## Dependencias

- **TASK-003:** Schema dominio editorial — provee `experiences` como entidad padre para asignaciones.
- **TASK-004:** Schema dominio comercial — provee tablas `addons` y `addon_assignments`.
- **TASK-011:** CRUD experiencias desde admin — provee páginas de experiencia donde se anidan las asignaciones.

## Bloquea a

- Fase 4 (catálogo público): necesita addons asignados para mostrar en detalle de experiencia.
- Fase 5 (checkout): necesita addon assignments para incluir addons en el flujo de compra.

## Riesgos y notas

- **Addon assignments por edición:** El modelo de datos incluye `editionId` opcional en `addon_assignments` para asignar addons específicos a una edición. En esta tarea solo se implementa asignación por experiencia (sin editionId). La asignación por edición es mejora futura.
- **overridePrice semántica:** Si `overridePrice` es null/vacío, se usa el `basePrice` del addon global. El formulario debe comunicar esto claramente ("Dejar vacío para usar precio base del addon").
- **Addon standalone:** Los addons con `isStandalone = true` pueden comprarse sin experiencia. Este comportamiento no se implementa en esta tarea (es parte del checkout — Fase 5).
- **Slug unicidad addons:** Verificar unicidad de slug antes de crear, similar a experiencias.
