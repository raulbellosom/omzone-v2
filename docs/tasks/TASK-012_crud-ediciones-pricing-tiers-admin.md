# TASK-012: CRUD ediciones y pricing tiers desde admin

## Objetivo

Implementar la gestión de ediciones de experiencia y pricing tiers desde el panel administrativo de OMZONE: sub-páginas dentro del detalle de experiencia para listar, crear y editar ediciones, y para cada experiencia/edición gestionar los tiers de precio con reordenamiento. Al completar esta tarea, un admin puede crear ediciones para sus experiencias y definir múltiples variantes de precio con tiers reordenables.

## Contexto

- **Fase:** 3 — CRUD admin básico
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 3
- **Documento maestro:** Secciones:
  - **RF-02:** Gestión de experiencias — incluye ediciones como versiones programadas
  - **RF-03:** Gestión de precios y variantes — tiers, modos de cobro, badges
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Sección 3.1 (`experience_editions`), 3.2 (`pricing_tiers`)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Dominio Comercial (2.2)
- **ADR relacionados:** ADR-003 (Separación editorial/comercial) — ediciones y pricing son dominio comercial, no editorial

Las tablas `experience_editions` (12 atributos) y `pricing_tiers` (16 atributos) fueron creadas en TASK-004. Esta tarea implementa la interfaz admin para gestionarlas.

## Alcance

Lo que SÍ incluye esta tarea:

1. Sub-página de ediciones dentro del detalle de experiencia (`/admin/experiences/:id/editions`):
   - Lista de ediciones de la experiencia en tabla: nombre, fechas, capacidad, status, acciones
   - Botón "Crear edición"
   - Empty state si no hay ediciones
2. Formulario de creación de edición (`/admin/experiences/:id/editions/create`):
   - Campos: `name`, `nameEs`, `description`, `descriptionEs`, `startDate`, `endDate`, `registrationOpens`, `registrationCloses`, `capacity`, `status`, `heroImageId`
   - `experienceId` se asigna automáticamente desde el contexto
   - Validación de campos requeridos (name, status)
   - Validación de fechas (endDate > startDate, registrationCloses < startDate)
3. Formulario de edición de edición (`/admin/experiences/:id/editions/:editionId/edit`):
   - Mismos campos, pre-poblados
4. Página de pricing tiers por experiencia (`/admin/experiences/:id/pricing`):
   - Lista de tiers en tabla reordenable: nombre, priceType, basePrice, currency, badge, isActive, sortOrder, acciones
   - Botón "Crear tier"
   - Los tiers se ordenan por `sortOrder`
   - Empty state si no hay tiers
5. Formulario de creación de pricing tier:
   - Campos: `name`, `nameEs`, `description`, `descriptionEs`, `priceType` (enum), `basePrice`, `currency` (MXN/USD), `minPersons`, `maxPersons`, `badge`, `isHighlighted`, `isActive`, `sortOrder`
   - `experienceId` se asigna automáticamente desde contexto
   - `editionId` opcional (select de ediciones existentes de la experiencia)
   - Validación: `basePrice` > 0, nombre requerido, priceType requerido
6. Formulario de edición de pricing tier:
   - Mismos campos, pre-poblados
7. Reordenamiento inline de tiers:
   - Botones "subir" / "bajar" para cambiar `sortOrder`
   - Actualización inmediata del orden en DB
8. Activar/desactivar tier inline:
   - Toggle de `isActive` directamente desde el listado
9. Navegación contextual:
   - Desde listado de experiencia → tab o link a "Ediciones" y "Precios"
   - Breadcrumbs actualizados (Admin > Experiencias > [Nombre] > Ediciones)

## Fuera de alcance

- Pricing rules (reglas condicionales de descuento: early-bird, promo codes) — tarea futura.
- Visualización pública de precios (Fase 4).
- Integración con checkout (Fase 5).
- Cálculo de totales o simulación de precio.
- Validación de que al menos un tier esté activo para publicar la experiencia.
- Hero image upload para ediciones (se puede agregar el campo pero el upload component se reutiliza de TASK-011).

## Dominio

- [x] Comercial (pricing, addons, paquetes, pases)
- Nota: clasificado como **Comercial + Frontend admin** en el plan maestro.

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experience_editions` | crear / leer / actualizar | CRUD de ediciones por experiencia |
| `pricing_tiers` | crear / leer / actualizar | CRUD de tiers de precio por experiencia/edición |
| `experiences` | leer | Se lee la experiencia padre para contexto y breadcrumbs |

## Atributos nuevos o modificados

N/A — las tablas `experience_editions` (12 attrs) y `pricing_tiers` (16 attrs) fueron creadas en TASK-004.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | CRUD directo via Databases SDK con permisos `Role.label("admin")` |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_images` | usar existente | Reutilizar para heroImageId de edición (si se implementa) |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `EditionListPage` | admin | crear | Sub-página de ediciones dentro de experiencia |
| `EditionCreatePage` | admin | crear | Formulario de creación de edición |
| `EditionEditPage` | admin | crear | Formulario de edición de edición |
| `EditionForm` | admin | crear | Formulario reutilizable (create + edit) |
| `PricingTierListPage` | admin | crear | Sub-página de pricing tiers por experiencia |
| `PricingTierForm` | admin | crear | Formulario de tier (modal o página) |
| `PricingTierTable` | admin | crear | Tabla reordenable de tiers |
| `ExperienceDetailTabs` | admin | crear | Tabs/links de navegación: Info, Ediciones, Precios, Addons, Slots |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useEditions` | crear | Fetch, create, update ediciones filtradas por experienceId |
| `usePricingTiers` | crear | Fetch, create, update, reorder tiers filtrados por experienceId |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/experiences/:id` | admin | heredado | Detalle de experiencia (tabs) |
| `/admin/experiences/:id/editions` | admin | heredado | Listado de ediciones |
| `/admin/experiences/:id/editions/create` | admin | heredado | Crear edición |
| `/admin/experiences/:id/editions/:editionId/edit` | admin | heredado | Editar edición |
| `/admin/experiences/:id/pricing` | admin | heredado | Listado de pricing tiers |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Listar ediciones | ✅ | ✅ | ✅ | ❌ | ❌ |
| Crear edición | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar edición | ✅ | ✅ | ❌ | ❌ | ❌ |
| Listar pricing tiers | ✅ | ✅ | ✅ | ❌ | ❌ |
| Crear pricing tier | ✅ | ✅ | ❌ | ❌ | ❌ |
| Editar pricing tier | ✅ | ✅ | ❌ | ❌ | ❌ |
| Reordenar tiers | ✅ | ✅ | ❌ | ❌ | ❌ |
| Activar/desactivar tier | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

### Flujo A — Gestionar ediciones
1. Admin navega a `/admin/experiences/:id/editions`.
2. Se muestra lista de ediciones de la experiencia.
3. Admin hace click en "Crear edición".
4. Llena formulario: name, fechas, capacidad, status.
5. Se valida y crea el documento en `experience_editions`.
6. Se redirige al listado de ediciones con mensaje de éxito.

### Flujo B — Gestionar pricing tiers
1. Admin navega a `/admin/experiences/:id/pricing`.
2. Se muestra lista de tiers ordenados por sortOrder.
3. Admin hace click en "Crear tier".
4. Llena formulario: name, priceType, basePrice, currency, badge.
5. Se valida (basePrice > 0) y crea el documento en `pricing_tiers`.
6. El nuevo tier aparece en la lista.
7. Admin reordena tiers con botones subir/bajar.
8. Admin activa/desactiva un tier con toggle inline.

## Criterios de aceptación

- [ ] Un admin puede ver la lista de ediciones de una experiencia en `/admin/experiences/:id/editions`.
- [ ] Un admin puede crear una edición con nombre, fechas, capacidad y status.
- [ ] El `experienceId` se asigna automáticamente al crear una edición sin necesidad de seleccionarlo.
- [ ] Al crear una edición, se valida que endDate sea posterior a startDate si ambas están definidas.
- [ ] Un admin puede editar una edición existente con campos pre-poblados.
- [ ] Un admin puede ver la lista de pricing tiers de una experiencia en `/admin/experiences/:id/pricing`.
- [ ] Un admin puede crear un pricing tier con nombre, priceType, basePrice y currency.
- [ ] La validación impide crear un tier con basePrice ≤ 0 o sin campos requeridos.
- [ ] Los tiers se muestran ordenados por `sortOrder` en el listado.
- [ ] Un admin puede reordenar tiers con botones subir/bajar y el cambio se persiste inmediatamente.
- [ ] Un admin puede activar/desactivar un tier con toggle inline desde el listado.
- [ ] La navegación entre tabs (Info, Ediciones, Precios) funciona sin perder contexto de la experiencia.
- [ ] Las breadcrumbs se actualizan correctamente (ej: "Admin > Experiencias > Yoga Sunrise > Ediciones > Editar").
- [ ] En mobile (< 768px), las tablas de ediciones y tiers se transforman en cards.
- [ ] Si no hay ediciones, se muestra empty state con CTA "Crear primera edición".
- [ ] Si no hay pricing tiers, se muestra empty state con CTA "Crear primer precio".

## Validaciones de seguridad

- [ ] Las operaciones CRUD usan permisos de colección `Role.label("admin")` — operator no puede crear/editar precios.
- [ ] Los precios (basePrice) se validan como números positivos antes de guardar.
- [ ] No se permiten valores negativos ni ceros en basePrice.

## Dependencias

- **TASK-003:** Schema dominio editorial — provee la tabla `experiences` como entidad padre.
- **TASK-004:** Schema dominio comercial — provee las tablas `experience_editions` y `pricing_tiers`.
- **TASK-011:** CRUD experiencias desde admin — provee las páginas de experiencia donde se anidan ediciones y precios.

## Bloquea a

- **TASK-014:** CRUD slots y agenda — los slots pueden referenciar ediciones.
- Fase 4 (catálogo público) — necesita tiers para mostrar precios.
- Fase 5 (checkout) — necesita tiers para selección de precio.

## Riesgos y notas

- **Navegación por tabs:** Se debe decidir si las sub-secciones de experiencia (Info, Ediciones, Precios, Addons, Slots) se implementan como tabs en una misma página o como rutas separadas. Recomendación: rutas separadas con tabs de navegación contextual para mantener URLs bookmarkeables.
- **Reorder persistencia:** Cada cambio de sortOrder actualiza dos documentos (el que sube y el que baja). Se puede optimizar con batch update si Appwrite lo soporta, o hacer dos updates secuenciales.
- **Edition heroImage:** El formulario puede incluir el campo `heroImageId` pero reutilizar el componente `ImageUpload` de TASK-011. No requiere nuevo bucket.
- **Pricing rules excluidas:** Las reglas condicionales (`pricing_rules`: early-bird, promo codes, descuentos por cantidad) se excluyen de esta tarea. Solo se gestionan los tiers base.
