# OMZONE — Modelo de Datos Completo

Versión: 1.0
Fecha: 2026-04-05
Database: `omzone_db`
Plataforma: Appwrite 1.9.0 self-hosted

---

## 1. Convenciones

- Tablas: `snake_case`
- Atributos: `camelCase`
- Enums: valores `lowercase` o `kebab-case`
- Índices: `idx_` + columnas
- Relaciones: `manyToOne` o `oneToMany`; N:N via tabla intermedia
- Todos los documentos tienen `$id`, `$createdAt`, `$updatedAt` autogenerados por Appwrite

---

## 2. Dominio Editorial

### 2.1 `experiences`

Catálogo maestro de experiencias. Entidad central del sistema.

| Atributo             | Tipo         | Requerido | Descripción                                                     |
| -------------------- | ------------ | --------- | --------------------------------------------------------------- |
| `name`               | string(255)  | sí        | Nombre interno                                                  |
| `publicName`         | string(255)  | sí        | Nombre público EN                                               |
| `publicNameEs`       | string(255)  | no        | Nombre público ES                                               |
| `slug`               | string(255)  | sí        | URL slug (único)                                                |
| `type`               | enum         | sí        | `session`, `immersion`, `retreat`, `stay`, `private`, `package` |
| `saleMode`           | enum         | sí        | `direct`, `request`, `assisted`, `pass`                         |
| `fulfillmentType`    | enum         | sí        | `ticket`, `booking`, `pass`, `package`                          |
| `shortDescription`   | string(500)  | no        | Resumen corto EN                                                |
| `shortDescriptionEs` | string(500)  | no        | Resumen corto ES                                                |
| `longDescription`    | string(5000) | no        | Descripción larga EN                                            |
| `longDescriptionEs`  | string(5000) | no        | Descripción larga ES                                            |
| `heroImageId`        | string(255)  | no        | fileId de portada en Storage                                    |
| `galleryImageIds`    | string(5000) | no        | JSON array de fileIds                                           |
| `requiresSchedule`   | boolean      | sí        | ¿Requiere selección de fecha/slot?                              |
| `requiresDate`       | boolean      | sí        | ¿Requiere fecha específica?                                     |
| `allowQuantity`      | boolean      | sí        | ¿Permite múltiples asistentes?                                  |
| `maxQuantity`        | integer      | no        | Máximo de asistentes por compra                                 |
| `minQuantity`        | integer      | no        | Mínimo de asistentes por compra                                 |
| `generatesTickets`   | boolean      | sí        | ¿Genera tickets tras compra?                                    |
| `status`             | enum         | sí        | `draft`, `published`, `archived`                                |
| `sortOrder`          | integer      | no        | Orden de visualización                                          |
| `seoTitle`           | string(255)  | no        | Título SEO                                                      |
| `seoDescription`     | string(500)  | no        | Meta description                                                |
| `ogImageId`          | string(255)  | no        | fileId de OG image                                              |

**Índices:**

- `idx_slug` (unique) en `slug`
- `idx_status` en `status`
- `idx_type` en `type`
- `idx_type_status` en `type`, `status`

**Permisos:**

- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

---

### 2.2 `publications`

Contenido CMS editorial: landings, blog posts, highlights.

| Atributo         | Tipo         | Requerido | Descripción                                            |
| ---------------- | ------------ | --------- | ------------------------------------------------------ |
| `title`          | string(255)  | sí        | Título EN                                              |
| `titleEs`        | string(255)  | no        | Título ES                                              |
| `slug`           | string(255)  | sí        | URL slug (único)                                       |
| `subtitle`       | string(500)  | no        | Subtítulo EN                                           |
| `subtitleEs`     | string(500)  | no        | Subtítulo ES                                           |
| `excerpt`        | string(1000) | no        | Extracto EN                                            |
| `excerptEs`      | string(1000) | no        | Extracto ES                                            |
| `category`       | enum         | sí        | `landing`, `blog`, `highlight`, `institutional`, `faq` |
| `experienceId`   | string(255)  | no        | Relación a experiencia (si aplica)                     |
| `heroImageId`    | string(255)  | no        | fileId portada                                         |
| `status`         | enum         | sí        | `draft`, `published`, `archived`                       |
| `publishedAt`    | datetime     | no        | Fecha de publicación                                   |
| `seoTitle`       | string(255)  | no        | SEO title                                              |
| `seoDescription` | string(500)  | no        | SEO description                                        |
| `ogImageId`      | string(255)  | no        | OG image                                               |

**Índices:**

- `idx_slug` (unique) en `slug`
- `idx_status` en `status`
- `idx_category_status` en `category`, `status`
- `idx_experienceId` en `experienceId`

**Permisos:**

- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

---

### 2.3 `publication_sections`

Bloques modulares dentro de una publicación.

| Atributo        | Tipo          | Requerido | Descripción                                                                                                               |
| --------------- | ------------- | --------- | ------------------------------------------------------------------------------------------------------------------------- |
| `publicationId` | string(255)   | sí        | Relación a publicación                                                                                                    |
| `sectionType`   | enum          | sí        | `hero`, `text`, `gallery`, `highlights`, `faq`, `itinerary`, `testimonials`, `inclusions`, `restrictions`, `cta`, `video` |
| `title`         | string(255)   | no        | Título de la sección EN                                                                                                   |
| `titleEs`       | string(255)   | no        | Título ES                                                                                                                 |
| `content`       | string(10000) | no        | Contenido EN (markdown/richtext)                                                                                          |
| `contentEs`     | string(10000) | no        | Contenido ES                                                                                                              |
| `mediaIds`      | string(5000)  | no        | JSON array de fileIds                                                                                                     |
| `metadata`      | string(5000)  | no        | JSON con datos extra de la sección                                                                                        |
| `sortOrder`     | integer       | sí        | Orden de visualización                                                                                                    |
| `isVisible`     | boolean       | sí        | ¿Visible en público?                                                                                                      |

**Índices:**

- `idx_publicationId` en `publicationId`
- `idx_publicationId_sortOrder` en `publicationId`, `sortOrder`

**Permisos:**

- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

---

### 2.4 `tags`

Etiquetas reutilizables para categorización y filtrado.

| Atributo    | Tipo        | Requerido | Descripción                                                         |
| ----------- | ----------- | --------- | ------------------------------------------------------------------- |
| `name`      | string(100) | sí        | Nombre EN                                                           |
| `nameEs`    | string(100) | no        | Nombre ES                                                           |
| `slug`      | string(100) | sí        | Slug (único)                                                        |
| `category`  | enum        | no        | `wellness`, `activity`, `level`, `duration`, `location`, `audience` |
| `sortOrder` | integer     | no        | Orden                                                               |

**Índices:**

- `idx_slug` (unique)
- `idx_category`

**Permisos:**

- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

---

### 2.5 `experience_tags`

Tabla intermedia N:N entre experiencias y tags.

| Atributo       | Tipo        | Requerido | Descripción        |
| -------------- | ----------- | --------- | ------------------ |
| `experienceId` | string(255) | sí        | FK a `experiences` |
| `tagId`        | string(255) | sí        | FK a `tags`        |

**Índices:**

- `idx_experienceId` en `experienceId`
- `idx_tagId` en `tagId`
- `idx_experienceId_tagId` (unique)

**Permisos:**

- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

---

## 3. Dominio Comercial

### 3.1 `experience_editions`

Ediciones programadas de una experiencia (temporadas, versiones comerciales).

| Atributo             | Tipo         | Requerido | Descripción                                         |
| -------------------- | ------------ | --------- | --------------------------------------------------- |
| `experienceId`       | string(255)  | sí        | FK a `experiences`                                  |
| `name`               | string(255)  | sí        | Nombre de edición EN                                |
| `nameEs`             | string(255)  | no        | Nombre ES                                           |
| `description`        | string(2000) | no        | Descripción EN                                      |
| `descriptionEs`      | string(2000) | no        | Descripción ES                                      |
| `startDate`          | datetime     | no        | Fecha inicio                                        |
| `endDate`            | datetime     | no        | Fecha fin                                           |
| `registrationOpens`  | datetime     | no        | Apertura de registro                                |
| `registrationCloses` | datetime     | no        | Cierre de registro                                  |
| `capacity`           | integer      | no        | Capacidad total                                     |
| `status`             | enum         | sí        | `draft`, `open`, `closed`, `completed`, `cancelled` |
| `heroImageId`        | string(255)  | no        | fileId portada                                      |

**Índices:**

- `idx_experienceId` en `experienceId`
- `idx_status` en `status`
- `idx_experienceId_status` en `experienceId`, `status`
- `idx_startDate` en `startDate`

**Permisos:**

- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

---

### 3.2 `pricing_tiers`

Variantes de precio para una experiencia o edición.

| Atributo        | Tipo         | Requerido | Descripción                                         |
| --------------- | ------------ | --------- | --------------------------------------------------- |
| `experienceId`  | string(255)  | sí        | FK a `experiences`                                  |
| `editionId`     | string(255)  | no        | FK a `experience_editions` (si aplica)              |
| `name`          | string(255)  | sí        | Nombre del tier EN                                  |
| `nameEs`        | string(255)  | no        | Nombre ES                                           |
| `description`   | string(1000) | no        | Descripción comercial EN                            |
| `descriptionEs` | string(1000) | no        | Descripción ES                                      |
| `priceType`     | enum         | sí        | `fixed`, `per-person`, `per-group`, `from`, `quote` |
| `basePrice`     | float        | sí        | Precio base en moneda base                          |
| `currency`      | string(3)    | sí        | `MXN`, `USD`                                        |
| `minPersons`    | integer      | no        | Mínimo personas (para per-person)                   |
| `maxPersons`    | integer      | no        | Máximo personas                                     |
| `badge`         | string(50)   | no        | Badge visual (ej: "Más popular")                    |
| `isHighlighted` | boolean      | no        | ¿Tier destacado visualmente?                        |
| `isActive`      | boolean      | sí        | ¿Activo para venta?                                 |
| `sortOrder`     | integer      | no        | Orden de visualización                              |

**Índices:**

- `idx_experienceId` en `experienceId`
- `idx_editionId` en `editionId`
- `idx_experienceId_isActive` en `experienceId`, `isActive`

**Permisos:**

- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

---

### 3.3 `pricing_rules`

Reglas condicionales de pricing (descuentos, early bird, por cantidad).

| Atributo        | Tipo         | Requerido | Descripción                                                   |
| --------------- | ------------ | --------- | ------------------------------------------------------------- |
| `pricingTierId` | string(255)  | sí        | FK a `pricing_tiers`                                          |
| `ruleType`      | enum         | sí        | `early-bird`, `quantity-discount`, `date-range`, `promo-code` |
| `condition`     | string(2000) | sí        | JSON con condiciones de la regla                              |
| `adjustment`    | string(1000) | sí        | JSON con tipo y valor del ajuste                              |
| `priority`      | integer      | no        | Prioridad de aplicación                                       |
| `isActive`      | boolean      | sí        | ¿Regla activa?                                                |
| `validFrom`     | datetime     | no        | Vigencia inicio                                               |
| `validUntil`    | datetime     | no        | Vigencia fin                                                  |

**Índices:**

- `idx_pricingTierId` en `pricingTierId`
- `idx_ruleType_isActive` en `ruleType`, `isActive`

**Permisos:**

- Read: `Role.label("admin")`
- Create/Update/Delete: `Role.label("admin")`

---

### 3.4 `addons`

Complementos vendibles.

| Atributo              | Tipo         | Requerido | Descripción                                                           |
| --------------------- | ------------ | --------- | --------------------------------------------------------------------- |
| `name`                | string(255)  | sí        | Nombre EN                                                             |
| `nameEs`              | string(255)  | no        | Nombre ES                                                             |
| `slug`                | string(255)  | sí        | Slug (único)                                                          |
| `description`         | string(2000) | no        | Descripción EN                                                        |
| `descriptionEs`       | string(2000) | no        | Descripción ES                                                        |
| `addonType`           | enum         | sí        | `service`, `transport`, `food`, `accommodation`, `equipment`, `other` |
| `priceType`           | enum         | sí        | `fixed`, `per-person`, `per-day`, `per-unit`, `quote`                 |
| `basePrice`           | float        | sí        | Precio base                                                           |
| `currency`            | string(3)    | sí        | `MXN`, `USD`                                                          |
| `isStandalone`        | boolean      | sí        | ¿Se puede comprar sin experiencia?                                    |
| `isPublic`            | boolean      | sí        | ¿Visible en catálogo público?                                         |
| `followsMainDuration` | boolean      | no        | ¿Su duración depende del principal?                                   |
| `maxQuantity`         | integer      | no        | Máximo seleccionable                                                  |
| `heroImageId`         | string(255)  | no        | fileId de imagen                                                      |
| `status`              | enum         | sí        | `active`, `inactive`                                                  |
| `sortOrder`           | integer      | no        | Orden                                                                 |

**Índices:**

- `idx_slug` (unique)
- `idx_status`
- `idx_addonType_status`

**Permisos:**

- Read: `Role.any()` (si `isPublic`)
- Create/Update/Delete: `Role.label("admin")`

---

### 3.5 `addon_assignments`

Relación addon ↔ experiencia/edición con reglas.

| Atributo        | Tipo        | Requerido | Descripción                            |
| --------------- | ----------- | --------- | -------------------------------------- |
| `addonId`       | string(255) | sí        | FK a `addons`                          |
| `experienceId`  | string(255) | sí        | FK a `experiences`                     |
| `editionId`     | string(255) | no        | FK a `experience_editions` (si aplica) |
| `isRequired`    | boolean     | sí        | ¿Obligatorio con esta experiencia?     |
| `isDefault`     | boolean     | no        | ¿Pre-seleccionado en UI?               |
| `overridePrice` | float       | no        | Precio override para este contexto     |
| `sortOrder`     | integer     | no        | Orden en el checkout                   |

**Índices:**

- `idx_experienceId` en `experienceId`
- `idx_addonId_experienceId` (unique)

**Permisos:**

- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

---

### 3.6 `packages`

Paquetes fijos compuestos por múltiples experiencias + addons.

| Atributo          | Tipo         | Requerido | Descripción                                                   |
| ----------------- | ------------ | --------- | ------------------------------------------------------------- |
| `name`            | string(255)  | sí        | Nombre EN                                                     |
| `nameEs`          | string(255)  | no        | Nombre ES                                                     |
| `slug`            | string(255)  | sí        | Slug (único)                                                  |
| `description`     | string(5000) | no        | Descripción editorial EN                                      |
| `descriptionEs`   | string(5000) | no        | Descripción ES                                                |
| `totalPrice`      | float        | sí        | Precio fijo total del paquete                                 |
| `currency`        | string(3)    | sí        | Moneda                                                        |
| `durationDays`    | integer      | no        | Duración en días                                              |
| `capacity`        | integer      | no        | Capacidad máxima                                              |
| `heroImageId`     | string(255)  | no        | fileId portada (bucket: `package_images`)                     |
| `galleryImageIds` | text(65535)  | no        | JSON array de fileIds para galería (bucket: `package_images`) |
| `status`          | enum         | sí        | `draft`, `published`, `archived`                              |
| `sortOrder`       | integer      | no        | Orden                                                         |

**Índices:**

- `idx_slug` (unique)
- `idx_status`

**Permisos:**

- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

---

### 3.7 `package_items`

Items dentro de un paquete.

| Atributo        | Tipo         | Requerido | Descripción                                               |
| --------------- | ------------ | --------- | --------------------------------------------------------- |
| `packageId`     | string(255)  | sí        | FK a `packages`                                           |
| `itemType`      | enum         | sí        | `experience`, `addon`, `benefit`, `accommodation`, `meal` |
| `referenceId`   | string(255)  | no        | FK a experience/addon si aplica                           |
| `description`   | string(1000) | sí        | Descripción del item EN                                   |
| `descriptionEs` | string(1000) | no        | Descripción ES                                            |
| `quantity`      | integer      | no        | Cantidad incluida                                         |
| `sortOrder`     | integer      | no        | Orden                                                     |

**Índices:**

- `idx_packageId` en `packageId`

**Permisos:**

- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

---

### 3.8 `passes`

Tipos de pases consumibles.

| Atributo             | Tipo         | Requerido | Descripción                         |
| -------------------- | ------------ | --------- | ----------------------------------- |
| `name`               | string(255)  | sí        | Nombre EN                           |
| `nameEs`             | string(255)  | no        | Nombre ES                           |
| `slug`               | string(255)  | sí        | Slug (único)                        |
| `description`        | string(2000) | no        | Descripción EN                      |
| `descriptionEs`      | string(2000) | no        | Descripción ES                      |
| `totalCredits`       | integer      | sí        | Créditos/sesiones incluidas         |
| `basePrice`          | float        | sí        | Precio                              |
| `currency`           | string(3)    | sí        | Moneda                              |
| `validityDays`       | integer      | no        | Días de vigencia desde compra       |
| `validExperienceIds` | string(5000) | no        | JSON array de experienceIds válidas |
| `heroImageId`        | string(255)  | no        | fileId imagen                       |
| `status`             | enum         | sí        | `active`, `inactive`                |
| `sortOrder`          | integer      | no        | Orden                               |

**Índices:**

- `idx_slug` (unique)
- `idx_status`

**Permisos:**

- Read: `Role.any()`
- Create/Update/Delete: `Role.label("admin")`

---

## 4. Dominio Agenda

### 4.1 `slots`

Fechas/horarios disponibles con capacidad.

| Atributo        | Tipo         | Requerido | Descripción                                   |
| --------------- | ------------ | --------- | --------------------------------------------- |
| `experienceId`  | string(255)  | sí        | FK a `experiences`                            |
| `editionId`     | string(255)  | no        | FK a `experience_editions`                    |
| `slotType`      | enum         | sí        | `single`, `recurring`, `range`, `all-day`     |
| `startDatetime` | datetime     | sí        | Inicio (UTC)                                  |
| `endDatetime`   | datetime     | sí        | Fin (UTC)                                     |
| `timezone`      | string(50)   | sí        | Zona horaria original                         |
| `capacity`      | integer      | sí        | Cupos totales                                 |
| `bookedCount`   | integer      | sí        | Cupos ocupados                                |
| `locationId`    | string(255)  | no        | FK a `locations`                              |
| `roomId`        | string(255)  | no        | FK a `rooms`                                  |
| `status`        | enum         | sí        | `available`, `full`, `cancelled`, `completed` |
| `notes`         | string(1000) | no        | Notas internas                                |

**Índices:**

- `idx_experienceId` en `experienceId`
- `idx_editionId` en `editionId`
- `idx_startDatetime` en `startDatetime`
- `idx_status` en `status`
- `idx_experienceId_status_start` en `experienceId`, `status`, `startDatetime`

**Permisos:**

- Read: `Role.any()`
- Create/Update: `Role.label("admin")`, `Role.label("operator")`
- Delete: `Role.label("admin")`

---

### 4.2 `slot_resources`

Recursos asignados a un slot.

| Atributo     | Tipo        | Requerido | Descripción                                     |
| ------------ | ----------- | --------- | ----------------------------------------------- |
| `slotId`     | string(255) | sí        | FK a `slots`                                    |
| `resourceId` | string(255) | sí        | FK a `resources`                                |
| `role`       | enum        | sí        | `instructor`, `assistant`, `equipment`, `space` |
| `notes`      | string(500) | no        | Notas                                           |

**Índices:**

- `idx_slotId` en `slotId`
- `idx_resourceId` en `resourceId`

**Permisos:**

- Read: `Role.label("admin")`, `Role.label("operator")`
- Create/Update/Delete: `Role.label("admin")`

---

### 4.3 `resources`

Catálogo de recursos operativos.

| Atributo      | Tipo         | Requerido | Descripción                                   |
| ------------- | ------------ | --------- | --------------------------------------------- |
| `name`        | string(255)  | sí        | Nombre                                        |
| `type`        | enum         | sí        | `instructor`, `space`, `equipment`, `vehicle` |
| `description` | string(1000) | no        | Descripción                                   |
| `photoId`     | string(255)  | no        | fileId de foto                                |
| `contactInfo` | string(500)  | no        | Datos de contacto                             |
| `isActive`    | boolean      | sí        | ¿Disponible?                                  |
| `metadata`    | string(2000) | no        | JSON con datos adicionales                    |

**Índices:**

- `idx_type` en `type`
- `idx_type_isActive` en `type`, `isActive`

**Permisos:**

- Read: `Role.label("admin")`, `Role.label("operator")`
- Create/Update/Delete: `Role.label("admin")`

---

## 5. Dominio Operativo

### 5.1 `bookings`

Reserva confirmada.

| Atributo           | Tipo         | Requerido | Descripción                                       |
| ------------------ | ------------ | --------- | ------------------------------------------------- |
| `orderId`          | string(255)  | sí        | FK a `orders`                                     |
| `orderItemId`      | string(255)  | no        | FK a `order_items`                                |
| `slotId`           | string(255)  | sí        | FK a `slots`                                      |
| `userId`           | string(255)  | sí        | Appwrite Auth userId                              |
| `participantCount` | integer      | sí        | Cantidad de asistentes                            |
| `status`           | enum         | sí        | `confirmed`, `checked-in`, `no-show`, `cancelled` |
| `checkedInAt`      | datetime     | no        | Fecha/hora de check-in                            |
| `notes`            | string(1000) | no        | Notas internas                                    |

**Índices:**

- `idx_orderId` en `orderId`
- `idx_slotId` en `slotId`
- `idx_userId` en `userId`
- `idx_slotId_status` en `slotId`, `status`

**Permisos:**

- Read: `Role.user("{userId}")`, `Role.label("admin")`, `Role.label("operator")`
- Create: `Role.label("admin")` (via Function)
- Update: `Role.label("admin")`, `Role.label("operator")`
- Delete: `Role.label("admin")`

---

### 5.2 `booking_participants`

Participantes individuales de una reserva.

| Atributo    | Tipo        | Requerido | Descripción     |
| ----------- | ----------- | --------- | --------------- |
| `bookingId` | string(255) | sí        | FK a `bookings` |
| `fullName`  | string(255) | sí        | Nombre completo |
| `email`     | string(255) | no        | Email           |
| `phone`     | string(50)  | no        | Teléfono        |
| `notes`     | string(500) | no        | Notas           |

**Índices:**

- `idx_bookingId` en `bookingId`

**Permisos:**

- Read: `Role.label("admin")`, `Role.label("operator")`
- Create/Update/Delete: `Role.label("admin")`

---

### 5.3 `locations`

Locaciones operativas.

| Atributo      | Tipo         | Requerido | Descripción |
| ------------- | ------------ | --------- | ----------- |
| `name`        | string(255)  | sí        | Nombre      |
| `description` | string(1000) | no        | Descripción |
| `address`     | string(500)  | no        | Dirección   |
| `coordinates` | string(100)  | no        | Lat/lng     |
| `isActive`    | boolean      | sí        | ¿Activa?    |

**Permisos:**

- Read: `Role.label("admin")`, `Role.label("operator")`
- Create/Update/Delete: `Role.label("admin")`

---

### 5.4 `rooms`

Cuartos/espacios dentro de locaciones.

| Atributo      | Tipo         | Requerido | Descripción                                            |
| ------------- | ------------ | --------- | ------------------------------------------------------ |
| `locationId`  | string(255)  | sí        | FK a `locations`                                       |
| `name`        | string(255)  | sí        | Nombre                                                 |
| `description` | string(1000) | no        | Descripción                                            |
| `capacity`    | integer      | no        | Capacidad                                              |
| `type`        | enum         | no        | `studio`, `outdoor`, `beach`, `conference`, `multiuse` |
| `isActive`    | boolean      | sí        | ¿Activo?                                               |

**Índices:**

- `idx_locationId` en `locationId`

**Permisos:**

- Read: `Role.label("admin")`, `Role.label("operator")`
- Create/Update/Delete: `Role.label("admin")`

---

## 6. Dominio Transaccional

### 6.1 `orders`

Orden de compra — entidad transaccional principal.

| Atributo                | Tipo          | Requerido | Descripción                                                |
| ----------------------- | ------------- | --------- | ---------------------------------------------------------- |
| `userId`                | string(255)   | sí        | Appwrite Auth userId                                       |
| `orderNumber`           | string(50)    | sí        | Número legible (ej: OMZ-20260405-001)                      |
| `orderType`             | enum          | sí        | `direct`, `assisted`, `request-conversion`                 |
| `status`                | enum          | sí        | `pending`, `paid`, `confirmed`, `cancelled`, `refunded`    |
| `paymentStatus`         | enum          | sí        | `pending`, `processing`, `succeeded`, `failed`, `refunded` |
| `currency`              | string(3)     | sí        | Moneda                                                     |
| `subtotal`              | float         | sí        | Subtotal antes de impuestos                                |
| `taxAmount`             | float         | no        | Impuestos                                                  |
| `totalAmount`           | float         | sí        | Total final                                                |
| `stripeSessionId`       | string(255)   | no        | Stripe Checkout Session ID                                 |
| `stripePaymentIntentId` | string(255)   | no        | Stripe PaymentIntent ID                                    |
| `snapshot`              | string(50000) | sí        | JSON snapshot completo de la compra                        |
| `customerName`          | string(255)   | no        | Nombre del cliente al comprar                              |
| `customerEmail`         | string(255)   | no        | Email del cliente al comprar                               |
| `notes`                 | string(2000)  | no        | Notas internas                                             |
| `paidAt`                | datetime      | no        | Fecha de pago confirmado                                   |
| `cancelledAt`           | datetime      | no        | Fecha de cancelación                                       |

**Índices:**

- `idx_userId` en `userId`
- `idx_orderNumber` (unique) en `orderNumber`
- `idx_status` en `status`
- `idx_paymentStatus` en `paymentStatus`
- `idx_userId_status` en `userId`, `status`
- `idx_stripeSessionId` en `stripeSessionId`

**Permisos:**

- Read: `Role.user("{userId}")`, `Role.label("admin")`
- Create: `Role.label("admin")` (via Function only)
- Update: `Role.label("admin")`
- Delete: ninguno (las órdenes no se borran)

---

### 6.2 `order_items`

Line items de la orden.

| Atributo       | Tipo          | Requerido | Descripción                              |
| -------------- | ------------- | --------- | ---------------------------------------- |
| `orderId`      | string(255)   | sí        | FK a `orders`                            |
| `itemType`     | enum          | sí        | `experience`, `addon`, `package`, `pass` |
| `referenceId`  | string(255)   | sí        | FK a la entidad original                 |
| `slotId`       | string(255)   | no        | FK a `slots` (si aplica)                 |
| `name`         | string(255)   | sí        | Nombre al momento de compra              |
| `quantity`     | integer       | sí        | Cantidad                                 |
| `unitPrice`    | float         | sí        | Precio unitario al momento de compra     |
| `totalPrice`   | float         | sí        | Precio total (qty × unitPrice)           |
| `currency`     | string(3)     | sí        | Moneda                                   |
| `itemSnapshot` | string(10000) | sí        | JSON snapshot del item                   |

**Índices:**

- `idx_orderId` en `orderId`
- `idx_itemType` en `itemType`

**Permisos:**

- Read: `Role.user("{orderId.userId}")`, `Role.label("admin")`
- Create: `Role.label("admin")` (via Function)
- Update/Delete: `Role.label("admin")`

---

### 6.3 `payments`

Registros de pago Stripe.

| Atributo                | Tipo         | Requerido | Descripción                                  |
| ----------------------- | ------------ | --------- | -------------------------------------------- |
| `orderId`               | string(255)  | sí        | FK a `orders`                                |
| `stripePaymentIntentId` | string(255)  | sí        | Stripe PI ID                                 |
| `amount`                | float        | sí        | Monto cobrado                                |
| `currency`              | string(3)    | sí        | Moneda                                       |
| `status`                | enum         | sí        | `pending`, `succeeded`, `failed`, `refunded` |
| `method`                | string(100)  | no        | Método (card, oxxo, etc.)                    |
| `receiptUrl`            | string(500)  | no        | URL de recibo Stripe                         |
| `metadata`              | string(5000) | no        | JSON con datos Stripe                        |

**Índices:**

- `idx_orderId` en `orderId`
- `idx_stripePaymentIntentId` en `stripePaymentIntentId`
- `idx_status` en `status`

**Permisos:**

- Read: `Role.label("admin")`
- Create: `Role.label("admin")` (via Function)
- Update: `Role.label("admin")`

---

### 6.4 `tickets`

Tickets emitidos tras pago confirmado.

| Atributo           | Tipo          | Requerido | Descripción                              |
| ------------------ | ------------- | --------- | ---------------------------------------- |
| `orderId`          | string(255)   | sí        | FK a `orders`                            |
| `orderItemId`      | string(255)   | no        | FK a `order_items`                       |
| `userId`           | string(255)   | sí        | Dueño del ticket                         |
| `experienceId`     | string(255)   | sí        | FK a `experiences`                       |
| `slotId`           | string(255)   | no        | FK a `slots`                             |
| `ticketCode`       | string(50)    | sí        | Código único (para QR)                   |
| `participantName`  | string(255)   | no        | Nombre del participante                  |
| `participantEmail` | string(255)   | no        | Email del participante                   |
| `status`           | enum          | sí        | `active`, `used`, `cancelled`, `expired` |
| `usedAt`           | datetime      | no        | Fecha de uso/check-in                    |
| `ticketSnapshot`   | string(10000) | sí        | JSON snapshot completo                   |

**Índices:**

- `idx_orderId` en `orderId`
- `idx_userId` en `userId`
- `idx_ticketCode` (unique) en `ticketCode`
- `idx_status` en `status`
- `idx_userId_status` en `userId`, `status`
- `idx_slotId` en `slotId`

**Permisos:**

- Read: `Role.user("{userId}")`, `Role.label("admin")`, `Role.label("operator")`
- Create: `Role.label("admin")` (via Function)
- Update: `Role.label("admin")`, `Role.label("operator")`

---

### 6.5 `ticket_redemptions`

Registro de escaneos/redenciones.

| Atributo     | Tipo        | Requerido | Descripción                     |
| ------------ | ----------- | --------- | ------------------------------- |
| `ticketId`   | string(255) | sí        | FK a `tickets`                  |
| `redeemedBy` | string(255) | sí        | userId del operador que escaneó |
| `redeemedAt` | datetime    | sí        | Fecha/hora                      |
| `location`   | string(255) | no        | Lugar de escaneo                |
| `notes`      | string(500) | no        | Notas                           |

**Índices:**

- `idx_ticketId` en `ticketId`

**Permisos:**

- Read: `Role.label("admin")`, `Role.label("operator")`
- Create: `Role.label("admin")`, `Role.label("operator")`

---

### 6.6 `pass_consumptions`

Historial de consumo de pases.

| Atributo      | Tipo        | Requerido | Descripción                     |
| ------------- | ----------- | --------- | ------------------------------- |
| `userPassId`  | string(255) | sí        | FK a `user_passes`              |
| `slotId`      | string(255) | no        | FK a `slots` (sesión consumida) |
| `ticketId`    | string(255) | no        | FK a `tickets` generado         |
| `creditsUsed` | integer     | sí        | Créditos consumidos             |
| `consumedAt`  | datetime    | sí        | Fecha de consumo                |
| `notes`       | string(500) | no        | Notas                           |

**Índices:**

- `idx_userPassId` en `userPassId`
- `idx_consumedAt` en `consumedAt`

**Permisos:**

- Read: `Role.user("{userPassId.userId}")`, `Role.label("admin")`
- Create: `Role.label("admin")` (via Function)

---

### 6.7 `user_passes`

Instancias compradas de un pase por un usuario.

| Atributo           | Tipo         | Requerido | Descripción                                  |
| ------------------ | ------------ | --------- | -------------------------------------------- |
| `userId`           | string(255)  | sí        | Appwrite Auth userId                         |
| `passId`           | string(255)  | sí        | FK a `passes` (tipo de pase)                 |
| `orderId`          | string(255)  | sí        | FK a `orders`                                |
| `totalCredits`     | integer      | sí        | Créditos totales al momento de compra        |
| `remainingCredits` | integer      | sí        | Créditos restantes                           |
| `status`           | enum         | sí        | `active`, `depleted`, `expired`, `cancelled` |
| `activatedAt`      | datetime     | sí        | Fecha de activación                          |
| `expiresAt`        | datetime     | no        | Fecha de expiración                          |
| `passSnapshot`     | string(5000) | sí        | JSON snapshot del pase comprado              |

**Índices:**

- `idx_userId` en `userId`
- `idx_passId` en `passId`
- `idx_orderId` en `orderId`
- `idx_userId_status` en `userId`, `status`

**Permisos:**

- Read: `Role.user("{userId}")`, `Role.label("admin")`
- Create: `Role.label("admin")` (via Function)
- Update: `Role.label("admin")`

---

### 6.8 `refunds`

Registro de reembolsos.

| Atributo         | Tipo          | Requerido | Descripción                           |
| ---------------- | ------------- | --------- | ------------------------------------- |
| `orderId`        | string(255)   | sí        | FK a `orders`                         |
| `paymentId`      | string(255)   | sí        | FK a `payments`                       |
| `stripeRefundId` | string(255)   | no        | Stripe Refund ID                      |
| `amount`         | float         | sí        | Monto reembolsado                     |
| `currency`       | string(3)     | sí        | Moneda                                |
| `reason`         | string(1000)  | no        | Razón del reembolso                   |
| `status`         | enum          | sí        | `pending`, `succeeded`, `failed`      |
| `refundedBy`     | string(255)   | sí        | userId del admin que procesó          |
| `refundSnapshot` | string(10000) | sí        | JSON snapshot al momento de reembolso |

**Índices:**

- `idx_orderId` en `orderId`
- `idx_paymentId` en `paymentId`
- `idx_status` en `status`

**Permisos:**

- Read: `Role.label("admin")`
- Create: `Role.label("admin")` (via Function)

---

### 6.9 `booking_requests`

Solicitudes previas a pago.

| Atributo           | Tipo         | Requerido | Descripción                                                      |
| ------------------ | ------------ | --------- | ---------------------------------------------------------------- |
| `userId`           | string(255)  | no        | Auth userId (si autenticado)                                     |
| `experienceId`     | string(255)  | sí        | FK a `experiences`                                               |
| `requestType`      | enum         | sí        | `quote`, `private-session`, `group`, `custom`                    |
| `preferredDate`    | datetime     | no        | Fecha preferida                                                  |
| `participantCount` | integer      | no        | Asistentes estimados                                             |
| `contactName`      | string(255)  | sí        | Nombre                                                           |
| `contactEmail`     | string(255)  | sí        | Email                                                            |
| `contactPhone`     | string(50)   | no        | Teléfono                                                         |
| `message`          | string(5000) | no        | Mensaje del solicitante                                          |
| `status`           | enum         | sí        | `new`, `reviewing`, `quoted`, `converted`, `declined`, `expired` |
| `adminNotes`       | string(5000) | no        | Notas del admin                                                  |
| `quotedAmount`     | float        | no        | Monto cotizado                                                   |
| `convertedOrderId` | string(255)  | no        | FK a `orders` si se convirtió                                    |

**Índices:**

- `idx_userId` en `userId`
- `idx_experienceId` en `experienceId`
- `idx_status` en `status`

**Permisos:**

- Read: `Role.user("{userId}")`, `Role.label("admin")`
- Create: `Role.any()` (visitantes pueden solicitar)
- Update: `Role.label("admin")`

---

## 7. Dominio Usuario

### 7.1 `user_profiles`

Perfil extendido del usuario. El `$id` del documento es el Auth userId (no hay atributo `userId` separado).

| Atributo      | Tipo         | Requerido | Descripción      |
| ------------- | ------------ | --------- | ---------------- |
| `displayName` | string(255)  | no        | Nombre a mostrar |
| `firstName`   | string(255)  | no        | Nombre           |
| `lastName`    | string(255)  | no        | Apellido         |
| `phone`       | string(50)   | no        | Teléfono         |
| `language`    | enum         | no        | `es`, `en`       |
| `photoId`     | string(255)  | no        | fileId de foto   |
| `bio`         | string(1000) | no        | Bio/descripción  |

**Índices:**

- Ninguno (el `$id` ya actúa como lookup primario)

**Permisos:**

- Read: `Role.user("{userId}")`, `Role.label("admin")`
- Create: `Role.label("admin")` (via Function on signup)
- Update: `Role.user("{userId}")`, `Role.label("admin")`

---

### 7.2 `admin_activity_logs`

Registro de acciones administrativas para trazabilidad.

| Atributo     | Tipo         | Requerido | Descripción               |
| ------------ | ------------ | --------- | ------------------------- |
| `userId`     | string(255)  | sí        | userId del admin/operator |
| `action`     | string(100)  | sí        | Acción realizada          |
| `entityType` | string(100)  | sí        | Tipo de entidad afectada  |
| `entityId`   | string(255)  | sí        | ID de entidad afectada    |
| `details`    | string(5000) | no        | JSON con detalles         |
| `ipAddress`  | string(50)   | no        | IP del actor              |

**Índices:**

- `idx_userId` en `userId`
- `idx_entityType_entityId` en `entityType`, `entityId`
- `idx_action` en `action`

**Permisos:**

- Read: `Role.label("admin")`
- Create: `Role.label("admin")`, `Role.label("operator")`

---

## 8. Dominio Configuración

### 8.1 `site_settings`

Configuración general de la plataforma.

| Atributo      | Tipo          | Requerido | Descripción                                               |
| ------------- | ------------- | --------- | --------------------------------------------------------- |
| `key`         | string(100)   | sí        | Clave de configuración (única)                            |
| `value`       | string(10000) | sí        | Valor (puede ser JSON)                                    |
| `category`    | enum          | sí        | `general`, `branding`, `checkout`, `notifications`, `seo` |
| `description` | string(500)   | no        | Descripción de la configuración                           |

**Índices:**

- `idx_key` (unique)
- `idx_category`

**Permisos:**

- Read: `Role.label("admin")`
- Create/Update/Delete: `Role.label("admin")`

---

### 8.2 `notification_templates`

Templates de notificaciones.

| Atributo    | Tipo          | Requerido | Descripción                        |
| ----------- | ------------- | --------- | ---------------------------------- |
| `key`       | string(100)   | sí        | Identificador del template (único) |
| `type`      | enum          | sí        | `email`, `sms`, `push`             |
| `subject`   | string(255)   | no        | Asunto EN                          |
| `subjectEs` | string(255)   | no        | Asunto ES                          |
| `body`      | string(10000) | sí        | Body EN (con placeholders)         |
| `bodyEs`    | string(10000) | no        | Body ES                            |
| `isActive`  | boolean       | sí        | ¿Activo?                           |

**Índices:**

- `idx_key` (unique)
- `idx_type_isActive`

**Permisos:**

- Read: `Role.label("admin")`
- Create/Update/Delete: `Role.label("admin")`

---

## 9. Resumen de colecciones

| #   | Dominio       | Colección                | Relación principal           |
| --- | ------------- | ------------------------ | ---------------------------- |
| 1   | Editorial     | `experiences`            | Entidad central              |
| 2   | Editorial     | `publications`           | → `experiences` (opcional)   |
| 3   | Editorial     | `publication_sections`   | → `publications`             |
| 4   | Editorial     | `tags`                   | Independiente                |
| 5   | Editorial     | `experience_tags`        | `experiences` ↔ `tags`       |
| 6   | Comercial     | `experience_editions`    | → `experiences`              |
| 7   | Comercial     | `pricing_tiers`          | → `experiences` / `editions` |
| 8   | Comercial     | `pricing_rules`          | → `pricing_tiers`            |
| 9   | Comercial     | `addons`                 | Independiente                |
| 10  | Comercial     | `addon_assignments`      | `addons` ↔ `experiences`     |
| 11  | Comercial     | `packages`               | Independiente                |
| 12  | Comercial     | `package_items`          | → `packages`                 |
| 13  | Comercial     | `passes`                 | Independiente                |
| 14  | Agenda        | `slots`                  | → `experiences` / `editions` |
| 15  | Agenda        | `slot_resources`         | `slots` ↔ `resources`        |
| 16  | Agenda        | `resources`              | Independiente                |
| 17  | Operativo     | `bookings`               | → `orders`, `slots`          |
| 18  | Operativo     | `booking_participants`   | → `bookings`                 |
| 19  | Operativo     | `locations`              | Independiente                |
| 20  | Operativo     | `rooms`                  | → `locations`                |
| 21  | Transaccional | `orders`                 | → userId                     |
| 22  | Transaccional | `order_items`            | → `orders`                   |
| 23  | Transaccional | `payments`               | → `orders`                   |
| 24  | Transaccional | `tickets`                | → `orders`, userId           |
| 25  | Transaccional | `ticket_redemptions`     | → `tickets`                  |
| 26  | Transaccional | `user_passes`            | → `passes`, `orders`, userId |
| 27  | Transaccional | `pass_consumptions`      | → `user_passes`              |
| 28  | Transaccional | `refunds`                | → `orders`, `payments`       |
| 29  | Transaccional | `booking_requests`       | → `experiences`              |
| 30  | Usuario       | `user_profiles`          | → userId                     |
| 31  | Usuario       | `admin_activity_logs`    | → userId                     |
| 32  | Config        | `site_settings`          | Independiente                |
| 33  | Config        | `notification_templates` | Independiente                |

**Total: 33 colecciones**

---

## Storage Buckets

| #   | Bucket ID          | Nombre            | Permisos                     | Descripción                                                                                                                                                         |
| --- | ------------------ | ----------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `experience_media` | Experience Media  | read(any), CRUD(admin)       | Imágenes de portada y galerías de experiencias                                                                                                                      |
| 2   | `public-resources` | Recursos Publicos | read(any), CRUD(admin, root) | Stock de imágenes reutilizables en toda la plataforma (backgrounds, placeholders, decorativos). ~30MB max por archivo. Formatos: jpg, png, webp, svg, gif, mp4, pdf |
