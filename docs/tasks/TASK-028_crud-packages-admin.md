# TASK-028: CRUD paquetes de experiencia desde admin + fulfillment rules

## Objetivo

Implementar la gestión de paquetes de experiencia desde el panel administrativo, permitiendo crear, editar, listar y archivar paquetes compuestos por múltiples items (experiencias, addons, beneficios, alojamiento, comidas). Al completar esta tarea, el admin puede configurar paquetes premium con estructura visual de inclusiones que se venderán como unidades fijas.

## Contexto

- **Fase:** 8 — Pases y paquetes
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 8
- **Documento maestro:** Sección 7.5 (Paquete de experiencia fija), RF-06 (Flujo de checkout — paquetes), RF-12 (Paquetes de experiencias)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `packages` (3.6), `package_items` (3.7)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Comercial (packages, package_items)
- **ADR relacionados:** ADR-003 (Separación editorial y comercial) — los paquetes son entidades comerciales con precio fijo total; ADR-004 (Experience-first) — el paquete se vende como experiencia compuesta, no como lista de servicios

## Alcance

Lo que SÍ incluye esta tarea:

1. **Admin — Packages List** (`/admin/packages`):
   - Listado de paquetes con nombre, precio total, duración, status.
   - Filtro por status: draft, published, archived.
   - Actions: crear nuevo, editar, publish/archive.

2. **Admin — Package Form** (`/admin/packages/new`, `/admin/packages/:packageId/edit`):
   - Campos del paquete: `name`, `nameEs`, `description`, `descriptionEs`, `totalPrice`, `currency`, `durationDays`, `capacity`, `heroImageId`, `status`.
   - Validación: name requerido, totalPrice ≥ 0, currency requerido.
   - Hero image selector (referencia a fileId en Storage).

3. **Admin — Package Items Management** (dentro del formulario de paquete):
   - Lista de items incluidos en el paquete (`package_items`).
   - Add item form: `itemType` (experience, addon, benefit, accommodation, meal), `referenceId` (picker para experience o addon si aplica), `description`, `descriptionEs`, `quantity`, `sortOrder`.
   - Remove item.
   - Reorder items (drag o up/down arrows).

4. **Admin — Package Preview:**
   - Vista estructurada de inclusiones: ícono por tipo de item, descripción, cantidad.
   - Preview del paquete tal como se mostraría al público (simplificado).

5. **Publish / Archive workflow:**
   - Draft → Published (requiere al menos 1 item).
   - Published → Archived.
   - Archived → Draft (para re-edición).

## Fuera de alcance

- Compra de paquetes en checkout — TASK-029.
- Vista pública detallada de paquetes — futura task (catálogo público).
- Generación de tickets per-item al fulfillment — TASK-029.
- Pricing rules para paquetes (descuentos, early bird).
- Paquete con fechas específicas obligatorias — en v1 el paquete es atemporal hasta checkout.
- Slug auto-generation.

## Dominio

- [x] Comercial (pricing, addons, paquetes, pases)
- [x] Frontend admin

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `packages` | crear / leer / actualizar | CRUD de paquetes |
| `package_items` | crear / leer / actualizar / borrar | Items dentro de cada paquete |
| `experiences` | leer | Picker de experiencias para items de tipo `experience` |
| `addons` | leer | Picker de addons para items de tipo `addon` |

## Atributos nuevos o modificados

N/A — se usan atributos existentes definidos en el data model.

## Functions implicadas

N/A — las operaciones CRUD se realizan directamente con Appwrite SDK desde frontend (permisos de colección controlan acceso).

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `experience_media` | leer | Para hero image del paquete |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `PackageList` | admin | crear | Listado de paquetes con filtros |
| `PackageForm` | admin | crear | Formulario crear/editar paquete |
| `PackageItemsEditor` | admin | crear | Gestión de items dentro del paquete |
| `PackageItemForm` | admin | crear | Formulario agregar/editar item |
| `PackagePreview` | admin | crear | Vista preview del paquete con estructura |
| `ItemTypeBadge` | admin | crear | Badge visual por tipo de item |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `usePackages` | crear | CRUD de paquetes |
| `usePackageItems` | crear | CRUD de items de un paquete |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/packages` | admin | `admin` | Listado de paquetes |
| `/admin/packages/new` | admin | `admin` | Crear nuevo paquete |
| `/admin/packages/:packageId/edit` | admin | `admin` | Editar paquete + items |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Listar paquetes | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear/editar paquete | ✅ | ✅ | ❌ | ❌ | ❌ |
| Manage package items | ✅ | ✅ | ❌ | ❌ | ❌ |
| Publish/archive | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

### CRUD Packages
1. Admin navega a `/admin/packages`.
2. Ve listado de paquetes con nombre, precio, duración, status.
3. Filtra por status.
4. Click "Crear paquete" → formulario.
5. Llena datos del paquete: nombre, descripción, precio total, moneda, duración, imagen.
6. Guarda → paquete creado en status `draft`.

### Package Items
7. Dentro del formulario de paquete, admin ve sección "Inclusiones".
8. Click "Agregar inclusión" → form con tipo, referencia, descripción, cantidad.
9. Si tipo es `experience` o `addon`: picker de la entidad correspondiente.
10. Si tipo es `benefit`, `accommodation`, `meal`: solo texto descriptivo.
11. Items se listan con ícono por tipo, descripción y cantidad.
12. Admin puede reordenar y eliminar items.

### Publish
13. Admin click "Publicar" → valida que hay al menos 1 item → actualiza status a `published`.
14. Para archivar: click "Archivar" → status `archived`.

## Criterios de aceptación

- [x] La página `/admin/packages` lista todos los paquetes con nombre, precio total, duración, status.
- [x] Se puede filtrar la lista de paquetes por status (draft, published, archived).
- [x] El formulario de paquete valida: name requerido, totalPrice ≥ 0, currency requerido.
- [x] Se puede seleccionar una hero image para el paquete desde Storage.
- [x] Se pueden agregar items al paquete con tipo, referencia, descripción y cantidad.
- [x] Para items de tipo `experience`: se muestra un picker de experiencias publicadas.
- [x] Para items de tipo `addon`: se muestra un picker de addons activos.
- [x] Para items de tipo `benefit`, `accommodation`, `meal`: solo campos de texto descriptivo.
- [x] Los items se pueden reordenar dentro del paquete.
- [x] Los items se pueden eliminar del paquete.
- [x] El preview muestra los items con ícono por tipo, descripción y cantidad.
- [x] No se puede publicar un paquete sin al menos 1 item; se muestra error de validación.
- [x] El flujo draft → published → archived funciona correctamente.
- [x] El formulario y la lista son responsive en mobile (stack en 1 columna < 640px).
- [x] Un usuario sin label `admin` que accede a `/admin/packages` es redirigido.

## Validaciones de seguridad

- [x] Solo usuarios con label `admin` pueden crear, editar y gestionar paquetes.
- [x] Los `referenceId` de items se validan contra experiencias/addons existentes.
- [x] No se permite publicar paquetes con totalPrice negativo.
- [x] El hero image se valida como fileId existente en Storage antes de guardar.

## Dependencias

- **TASK-004:** Schema comercial — provee colecciones `packages`, `package_items`.
- **TASK-010:** Admin layout — sidebar, navigation shell.
- **TASK-011:** CRUD experiencias — provee experiencias para el picker de items.
- **TASK-013:** CRUD addons — provee addons para el picker de items.

## Bloquea a

- **TASK-029:** Checkout para paquetes — requiere paquetes configurados con items.

## Riesgos y notas

- **Precio total vs suma de items:** El `totalPrice` del paquete es un precio fijo definido por el admin, NO la suma de precios individuales de items. Esto es intencional: un paquete puede costar menos que la suma de sus partes (incentivo de bundle).
- **Items sin referenceId:** Items de tipo `benefit`, `accommodation`, `meal` son descriptivos y no requieren `referenceId`. Son "lo que incluye el paquete" sin entidad vendible detrás.
- **Fulfillment complexity:** Al comprar un paquete, el fulfillment (TASK-029) debe generar tickets solo para items de tipo `experience` que tengan `referenceId` y slot asignado. Los items descriptivos no generan tickets.
- **Package capacity:** El campo `capacity` es informativo en v1. No limita ventas automáticamente — eso se maneja en checkout.
- **Reorder pattern:** Para reordenar items, usar `sortOrder` integer. En la UI, botones up/down o drag-and-drop según complejidad deseada. En v1, botones simples son suficientes.
