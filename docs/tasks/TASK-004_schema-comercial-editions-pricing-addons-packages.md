# TASK-004: Schema dominio comercial — editions, pricing, addons, packages, passes

## Objetivo

Crear en Appwrite todas las colecciones del dominio comercial de OMZONE: ediciones de experiencia, tiers de precio, reglas de pricing, addons, asignaciones de addon, paquetes, items de paquete y pases consumibles. Al completar esta tarea, las 8 colecciones existen en `omzone_db` con todos sus atributos, índices y permisos, y están registradas en `appwrite.json` para despliegue reproducible.

## Contexto

- **Fase:** 1 — Schema core (Appwrite)
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 1
- **Documento maestro:** Secciones de Precios/Variantes (RF-02, RF-03), Addons (RF-05), Paquetes/Pases (RF-11, RF-12, RF-13), Checkout (RF-06)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Secciones 3.1 a 3.8
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Dominio Comercial (2.2)
- **RF relacionados:** RF-02 (Pricing), RF-03 (Variantes), RF-05 (Addons), RF-06 (Checkout — schema solo), RF-11 (Pases), RF-12 (Paquetes), RF-13 (Bundle rules)
- **ADR relacionados:** ADR-003 (Separación editorial/comercial) — el dominio comercial define cómo se vende, no la narrativa pública.

El dominio comercial define la estructura de venta de cada experiencia. Las tablas de pricing, addons y paquetes son consumidas por el checkout (dominio transaccional) y por el admin panel. Los precios NUNCA se leen directamente por el cliente para calcular totales — los totales se calculan en Functions server-side.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear la colección `experience_editions` con los 12 atributos, 4 índices y permisos.
2. Crear la colección `pricing_tiers` con los 16 atributos, 3 índices y permisos.
3. Crear la colección `pricing_rules` con los 8 atributos, 2 índices y permisos.
4. Crear la colección `addons` con los 16 atributos, 3 índices y permisos.
5. Crear la colección `addon_assignments` con los 7 atributos, 2 índices y permisos.
6. Crear la colección `packages` con los 11 atributos, 2 índices y permisos.
7. Crear la colección `package_items` con los 7 atributos, 1 índice y permisos.
8. Crear la colección `passes` con los 13 atributos, 2 índices y permisos.
9. Configurar permisos de colección según el modelo de datos.
10. Registrar las 8 colecciones en `appwrite.json`.
11. Desplegar via CLI y verificar en consola.

## Fuera de alcance

- Colecciones del dominio editorial — ya creadas en TASK-003.
- Colecciones del dominio agenda (slots, resources) — TASK-005.
- Colecciones del dominio transaccional (orders, tickets) — TASK-006.
- Lógica de pricing en Functions (cálculo de totales, aplicación de reglas).
- Checkout flow o Function `create-checkout`.
- Cualquier componente frontend o UI.
- Seed data o datos de prueba.
- Validación de reglas de pricing (eso se implementa en Functions).
- Buckets de Storage.

## Dominio

- [x] Comercial (pricing, addons, paquetes, pases)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `experience_editions` | crear | Ediciones programadas (temporadas, versiones comerciales) |
| `pricing_tiers` | crear | Variantes de precio por experiencia/edición |
| `pricing_rules` | crear | Reglas condicionales de pricing |
| `addons` | crear | Complementos vendibles (servicios, transporte, etc.) |
| `addon_assignments` | crear | Relación addon ↔ experiencia/edición con reglas |
| `packages` | crear | Paquetes compuestos de experiencias + addons |
| `package_items` | crear | Items dentro de un paquete |
| `passes` | crear | Tipos de pases consumibles |
| `experiences` | leer | FK target — debe existir (creada en TASK-003) |

## Atributos nuevos o modificados

### `experience_editions`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `experience_editions` | `experienceId` | string(255) | sí | FK a `experiences` |
| `experience_editions` | `name` | string(255) | sí | Nombre de edición EN |
| `experience_editions` | `nameEs` | string(255) | no | Nombre ES |
| `experience_editions` | `description` | string(2000) | no | Descripción EN |
| `experience_editions` | `descriptionEs` | string(2000) | no | Descripción ES |
| `experience_editions` | `startDate` | datetime | no | Fecha inicio |
| `experience_editions` | `endDate` | datetime | no | Fecha fin |
| `experience_editions` | `registrationOpens` | datetime | no | Apertura de registro |
| `experience_editions` | `registrationCloses` | datetime | no | Cierre de registro |
| `experience_editions` | `capacity` | integer | no | Capacidad total |
| `experience_editions` | `status` | enum [`draft`, `open`, `closed`, `completed`, `cancelled`] | sí | Estado de la edición |
| `experience_editions` | `heroImageId` | string(255) | no | fileId portada |

### `pricing_tiers`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `pricing_tiers` | `experienceId` | string(255) | sí | FK a `experiences` |
| `pricing_tiers` | `editionId` | string(255) | no | FK a `experience_editions` (si aplica) |
| `pricing_tiers` | `name` | string(255) | sí | Nombre del tier EN |
| `pricing_tiers` | `nameEs` | string(255) | no | Nombre ES |
| `pricing_tiers` | `description` | string(1000) | no | Descripción comercial EN |
| `pricing_tiers` | `descriptionEs` | string(1000) | no | Descripción ES |
| `pricing_tiers` | `priceType` | enum [`fixed`, `per-person`, `per-group`, `from`, `quote`] | sí | Tipo de precio |
| `pricing_tiers` | `basePrice` | float | sí | Precio base en moneda base |
| `pricing_tiers` | `currency` | string(3) | sí | `MXN`, `USD` |
| `pricing_tiers` | `minPersons` | integer | no | Mínimo personas (para per-person) |
| `pricing_tiers` | `maxPersons` | integer | no | Máximo personas |
| `pricing_tiers` | `badge` | string(50) | no | Badge visual (ej: "Más popular") |
| `pricing_tiers` | `isHighlighted` | boolean | no | ¿Tier destacado visualmente? |
| `pricing_tiers` | `isActive` | boolean | sí | ¿Activo para venta? |
| `pricing_tiers` | `sortOrder` | integer | no | Orden de visualización |

### `pricing_rules`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `pricing_rules` | `pricingTierId` | string(255) | sí | FK a `pricing_tiers` |
| `pricing_rules` | `ruleType` | enum [`early-bird`, `quantity-discount`, `date-range`, `promo-code`] | sí | Tipo de regla |
| `pricing_rules` | `condition` | string(2000) | sí | JSON con condiciones de la regla |
| `pricing_rules` | `adjustment` | string(1000) | sí | JSON con tipo y valor del ajuste |
| `pricing_rules` | `priority` | integer | no | Prioridad de aplicación |
| `pricing_rules` | `isActive` | boolean | sí | ¿Regla activa? |
| `pricing_rules` | `validFrom` | datetime | no | Vigencia inicio |
| `pricing_rules` | `validUntil` | datetime | no | Vigencia fin |

### `addons`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `addons` | `name` | string(255) | sí | Nombre EN |
| `addons` | `nameEs` | string(255) | no | Nombre ES |
| `addons` | `slug` | string(255) | sí | Slug (único) |
| `addons` | `description` | string(2000) | no | Descripción EN |
| `addons` | `descriptionEs` | string(2000) | no | Descripción ES |
| `addons` | `addonType` | enum [`service`, `transport`, `food`, `accommodation`, `equipment`, `other`] | sí | Tipo de addon |
| `addons` | `priceType` | enum [`fixed`, `per-person`, `per-day`, `per-unit`, `quote`] | sí | Tipo de precio |
| `addons` | `basePrice` | float | sí | Precio base |
| `addons` | `currency` | string(3) | sí | `MXN`, `USD` |
| `addons` | `isStandalone` | boolean | sí | ¿Se puede comprar sin experiencia? |
| `addons` | `isPublic` | boolean | sí | ¿Visible en catálogo público? |
| `addons` | `followsMainDuration` | boolean | no | ¿Su duración depende del principal? |
| `addons` | `maxQuantity` | integer | no | Máximo seleccionable |
| `addons` | `heroImageId` | string(255) | no | fileId de imagen |
| `addons` | `status` | enum [`active`, `inactive`] | sí | Estado |
| `addons` | `sortOrder` | integer | no | Orden |

### `addon_assignments`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `addon_assignments` | `addonId` | string(255) | sí | FK a `addons` |
| `addon_assignments` | `experienceId` | string(255) | sí | FK a `experiences` |
| `addon_assignments` | `editionId` | string(255) | no | FK a `experience_editions` (si aplica) |
| `addon_assignments` | `isRequired` | boolean | sí | ¿Obligatorio con esta experiencia? |
| `addon_assignments` | `isDefault` | boolean | no | ¿Pre-seleccionado en UI? |
| `addon_assignments` | `overridePrice` | float | no | Precio override para este contexto |
| `addon_assignments` | `sortOrder` | integer | no | Orden en el checkout |

### `packages`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `packages` | `name` | string(255) | sí | Nombre EN |
| `packages` | `nameEs` | string(255) | no | Nombre ES |
| `packages` | `slug` | string(255) | sí | Slug (único) |
| `packages` | `description` | string(5000) | no | Descripción editorial EN |
| `packages` | `descriptionEs` | string(5000) | no | Descripción ES |
| `packages` | `totalPrice` | float | sí | Precio fijo total del paquete |
| `packages` | `currency` | string(3) | sí | Moneda |
| `packages` | `durationDays` | integer | no | Duración en días |
| `packages` | `capacity` | integer | no | Capacidad máxima |
| `packages` | `heroImageId` | string(255) | no | fileId portada |
| `packages` | `status` | enum [`draft`, `published`, `archived`] | sí | Estado |
| `packages` | `sortOrder` | integer | no | Orden |

### `package_items`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `package_items` | `packageId` | string(255) | sí | FK a `packages` |
| `package_items` | `itemType` | enum [`experience`, `addon`, `benefit`, `accommodation`, `meal`] | sí | Tipo de item |
| `package_items` | `referenceId` | string(255) | no | FK a experience/addon si aplica |
| `package_items` | `description` | string(1000) | sí | Descripción del item EN |
| `package_items` | `descriptionEs` | string(1000) | no | Descripción ES |
| `package_items` | `quantity` | integer | no | Cantidad incluida |
| `package_items` | `sortOrder` | integer | no | Orden |

### `passes`

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `passes` | `name` | string(255) | sí | Nombre EN |
| `passes` | `nameEs` | string(255) | no | Nombre ES |
| `passes` | `slug` | string(255) | sí | Slug (único) |
| `passes` | `description` | string(2000) | no | Descripción EN |
| `passes` | `descriptionEs` | string(2000) | no | Descripción ES |
| `passes` | `totalCredits` | integer | sí | Créditos/sesiones incluidas |
| `passes` | `basePrice` | float | sí | Precio |
| `passes` | `currency` | string(3) | sí | Moneda |
| `passes` | `validityDays` | integer | no | Días de vigencia desde compra |
| `passes` | `validExperienceIds` | string(5000) | no | JSON array de experienceIds válidas |
| `passes` | `heroImageId` | string(255) | no | fileId imagen |
| `passes` | `status` | enum [`active`, `inactive`] | sí | Estado |
| `passes` | `sortOrder` | integer | no | Orden |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Esta tarea es solo schema |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Ninguno | — | Los atributos de imageId son strings; los buckets se crean en otra task |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| Ninguno | — | — | Esta tarea no involucra frontend |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| Ninguno | — | — |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| Ninguna | — | — | — |

## Permisos y labels involucrados

### `experience_editions`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `pricing_tiers`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `pricing_rules`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `addons`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `addon_assignments`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `packages`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `package_items`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

### `passes`

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create | ✅ | ✅ | ❌ | ❌ | ❌ |
| Update | ✅ | ✅ | ❌ | ❌ | ❌ |
| Delete | ✅ | ✅ | ❌ | ❌ | ❌ |

**Implementación Appwrite:**
- `experience_editions`, `pricing_tiers`, `addons`, `addon_assignments`, `packages`, `package_items`, `passes`: read `Role.any()`, create/update/delete `Role.label("admin")`
- `pricing_rules`: read/create/update/delete `Role.label("admin")` — reglas de precio NO son públicas.

## Flujo principal

1. Verificar que la colección `experiences` existe en `omzone_db` (creada en TASK-003).
2. Crear la colección `experience_editions` con los 12 atributos y 4 índices.
3. Crear la colección `pricing_tiers` con los 16 atributos y 3 índices.
4. Crear la colección `pricing_rules` con los 8 atributos y 2 índices.
5. Crear la colección `addons` con los 16 atributos y 3 índices.
6. Crear la colección `addon_assignments` con los 7 atributos y 2 índices.
7. Crear la colección `packages` con los 11 atributos y 2 índices.
8. Crear la colección `package_items` con los 7 atributos y 1 índice.
9. Crear la colección `passes` con los 13 atributos y 2 índices.
10. Asignar permisos de colección según el modelo de datos (especial: `pricing_rules` es solo `admin`).
11. Registrar las 8 colecciones en `appwrite.json`.
12. Ejecutar `appwrite deploy` y verificar en consola.

## Criterios de aceptación

- [x] La colección `experience_editions` existe con los 12 atributos definidos en `01_data-model.md` sección 3.1, incluido `status` como enum con 5 valores.
- [x] Los 4 índices de `experience_editions` están creados, incluyendo el compuesto `idx_experienceId_status`.
- [x] La colección `pricing_tiers` existe con los 15 atributos (la tabla define 15, no 16), incluidos `priceType` (5 valores enum) e `isActive` (boolean).
- [x] Los 3 índices de `pricing_tiers` están creados, incluyendo `idx_experienceId_isActive`.
- [x] La colección `pricing_rules` existe con los 8 atributos, `condition` como TEXT y `adjustment` como TEXT.
- [x] `pricing_rules` tiene permisos restringidos: solo `Role.label("admin")` para read/create/update/delete — NO es público.
- [x] La colección `addons` existe con 16 atributos, `addonType` (6 valores) y `priceType` (5 valores) como enums.
- [x] `addons` tiene `idx_slug` como unique.
- [x] La colección `addon_assignments` existe con 7 atributos y `idx_addonId_experienceId` como unique.
- [x] La colección `packages` existe con 12 atributos (la tabla define 12), `idx_slug` unique, y `status` enum con 3 valores.
- [x] La colección `package_items` existe con 7 atributos, `itemType` enum con 5 valores.
- [x] La colección `passes` existe con 13 atributos, `idx_slug` unique, `validExperienceIds` como TEXT.
- [x] Todas las colecciones (excepto `pricing_rules`) tienen read `Role.any()`.
- [x] Las 8 colecciones están registradas en `appwrite.json` y el deploy es reproducible.
- [x] Un usuario anónimo puede listar `pricing_tiers` via SDK pero NO puede listar `pricing_rules` — verificado por permisos de colección: pricing_tiers tiene `read("any")`, pricing_rules tiene `read("label:admin")`.
- [x] Un usuario sin label `admin` NO puede crear documentos en ninguna colección comercial — verificado: todas las colecciones tienen create/update/delete restringido a `label:admin`.

## Validaciones de seguridad

- [x] `pricing_rules` NO tiene permisos de lectura pública — solo `Role.label("admin")`. Verificado: `read("label:admin")`.
- [x] Los permisos de escritura (create/update/delete) están restringidos a `Role.label("admin")` en todas las colecciones.
- [x] Los campos `condition` y `adjustment` de `pricing_rules` almacenan JSON como TEXT — la validación del JSON se hará en Functions, no en schema.
- [x] Los índices unique (`idx_slug` en addons, packages, passes; `idx_addonId_experienceId`) previenen duplicados a nivel de base de datos. Verificado: todos con type `unique` y status `available`.

## Dependencias

- **TASK-003:** Schema dominio editorial — provee la colección `experiences` que es FK target de `experience_editions`, `pricing_tiers`, `addon_assignments` y referenciada por `passes`.

## Bloquea a

- **TASK-005:** Schema dominio agenda — `slots` referencia `experience_editions` via FK.
- **TASK-006:** Schema dominio transaccional — `order_items` referencia pricing, addons, packages; `user_passes` referencia `passes`.
- **TASK-012:** CRUD ediciones y pricing tiers desde admin.
- **TASK-013:** CRUD addons y addon assignments desde admin.
- **TASK-026:** CRUD pases consumibles desde admin.
- **TASK-028:** CRUD paquetes de experiencia desde admin.
- **TASK-029:** Checkout adaptado para pases y paquetes.

## Riesgos y notas

- **Cantidad de enums:** Este dominio tiene muchos atributos enum (14 en total). Verificar que Appwrite 1.9.0 maneja correctamente la creación secuencial de enums. Crear atributos uno por uno y esperar que cada uno quede en estado `available`.
- **`pricing_rules` es sensible:** Es la única colección del dominio comercial con permisos solo de admin (no público). Las reglas contienen condiciones y ajustes como JSON strings que se interpretan en Functions — asegurar que el tamaño de string es suficiente (2000 y 1000 respectivamente).
- **`validExperienceIds` en `passes`:** Es un JSON array serializado como string(5000). Si un pase aplica a muchas experiencias, este tamaño puede quedarse corto. Vigilar y considerar tabla intermedia si crece.
- **Precios como float:** Los precios se almacenan como `float`. Para operaciones de cobro, el cálculo final se hace en Functions con redondeo explícito a 2 decimales. El schema no valida rangos — eso es responsabilidad del Function de checkout.
- **`overridePrice` en `addon_assignments`:** Es opcional (float, no requerido). Cuando es null, se usa el `basePrice` del addon. Esta lógica se implementa en Functions, no en schema.
