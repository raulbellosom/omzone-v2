---
description: "Usar cuando se edite modelado Appwrite de OMZONE: tablas, atributos, relaciones, índices, snapshots, permisos y despliegue de schema."
applyTo: "appwrite.json,**/appwrite*.json"
---

# Convenciones de Schema Appwrite — OMZONE

## 1. Entorno

| Clave                 | Valor                             |
| --------------------- | --------------------------------- |
| Plataforma            | Appwrite self-hosted **1.9.0**    |
| Endpoint              | `https://aprod.racoondevs.com/v1` |
| Project ID            | `omzone-dev`                      |
| Database principal    | `omzone_db`                       |
| Organización de datos | 7 dominios, ~30 colecciones       |

### Herramientas disponibles

| Herramienta           | Identificador                                               | Uso                                                                                                 |
| --------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **MCP Appwrite API**  | `appwrite-api-omzone-dev`                                   | Crear/modificar tablas, atributos, relaciones, índices, permisos directamente en el proyecto        |
| **MCP Appwrite Docs** | `appwrite-docs`                                             | Consultar documentación oficial sobre tipos de atributos, relaciones y permisos soportados en 1.9.0 |
| **Appwrite CLI**      | `appwrite login --endpoint https://aprod.racoondevs.com/v1` | Push de schema desde `appwrite.json`. **Siempre** apuntar al dominio self-hosted, nunca al cloud    |

---

## 2. Naming obligatorio

| Elemento             | Convención                                         | Ejemplo                                   |
| -------------------- | -------------------------------------------------- | ----------------------------------------- |
| Tablas / colecciones | `snake_case`                                       | `experience_editions`, `order_items`      |
| Atributos            | `camelCase`                                        | `basePrice`, `heroImageId`, `isPublished` |
| Relaciones           | nombre semántico del destino                       | `experienceId`, `slotId`, `userId`        |
| Enums                | `camelCase` con valores `lowercase` o `kebab-case` | `status: ["active", "draft", "archived"]` |
| Índices              | `idx_` + columnas                                  | `idx_status`, `idx_experienceId_date`     |

---

## 3. Arquitectura de datos — 7 dominios

### 3.1 Dominio editorial

Narrativa pública de experiencias. No se usa para vender directamente.

| Tabla                  | Propósito                                                                       |
| ---------------------- | ------------------------------------------------------------------------------- |
| `experiences`          | Catálogo maestro de experiencias (sesión, inmersión, retiro, estancia, privada) |
| `publications`         | Contenido CMS: páginas editoriales, blog, highlights                            |
| `publication_sections` | Bloques de contenido dentro de una publicación                                  |
| `tags`                 | Etiquetas reutilizables para filtrado y SEO                                     |
| `experience_tags`      | Relación N:N experiencias ↔ tags                                                |

### 3.2 Dominio comercial

Configuración vendible de experiencias. Separada del editorial para permitir narrativas distintas.

| Tabla                 | Propósito                                                        |
| --------------------- | ---------------------------------------------------------------- |
| `experience_editions` | Ediciones programadas de una experiencia (temporadas, versiones) |
| `pricing_tiers`       | Variantes de precio (early bird, regular, VIP, grupal)           |
| `pricing_rules`       | Reglas de pricing por fecha, cantidad o condición                |
| `addons`              | Complementos vendibles (masaje, comida, transporte)              |
| `addon_assignments`   | Relación addon ↔ experiencia/edición                             |
| `packages`            | Paquetes que agrupan experiencias + addons                       |
| `package_items`       | Items dentro de un paquete                                       |
| `passes`              | Pases consumibles (N sesiones, membresía temporal)               |

### 3.3 Dominio agenda

Gestión de fechas, horarios y capacidad.

| Tabla            | Propósito                                                  |
| ---------------- | ---------------------------------------------------------- |
| `slots`          | Fechas/horarios disponibles con capacidad                  |
| `slot_resources` | Recursos asignados a un slot (instructor, espacio, equipo) |
| `resources`      | Catálogo de recursos operativos                            |

### 3.4 Dominio operativo

Ejecución: reservas, validaciones, asignaciones.

| Tabla                  | Propósito                                    |
| ---------------------- | -------------------------------------------- |
| `bookings`             | Reserva confirmada de un slot por un cliente |
| `booking_participants` | Participantes dentro de una reserva grupal   |

### 3.5 Dominio transaccional

Órdenes, pagos, tickets. Contiene **snapshots** para integridad histórica.

| Tabla                | Propósito                                  |
| -------------------- | ------------------------------------------ |
| `orders`             | Orden de compra con snapshot completo      |
| `order_items`        | Line items de la orden                     |
| `payments`           | Registro de pago Stripe vinculado a orden  |
| `tickets`            | Tickets emitidos tras pago confirmado      |
| `ticket_redemptions` | Registro de escaneos/redenciones de ticket |
| `pass_consumptions`  | Registro de uso de pases consumibles       |
| `refunds`            | Registro de reembolsos procesados          |

### 3.6 Dominio usuario

Datos del cliente más allá de Auth.

| Tabla              | Propósito                                                     |
| ------------------ | ------------------------------------------------------------- |
| `user_profiles`    | Perfil extendido del cliente (nombre, teléfono, preferencias) |
| `user_preferences` | Preferencias de experiencias (wellness, yoga, meditación)     |

### 3.7 Dominio configuración

Settings globales de la plataforma.

| Tabla                    | Propósito                                                 |
| ------------------------ | --------------------------------------------------------- |
| `site_settings`          | Configuración general (nombre, logo, horarios, políticas) |
| `notification_templates` | Templates de notificaciones (email, push)                 |

---

## 4. Reglas de atributos

### 4.1 Atributos comunes obligatorios

Toda tabla debe tener estos atributos gestionados por Appwrite o por la Function:

- `$id` — autogenerado por Appwrite
- `$createdAt` — autogenerado
- `$updatedAt` — autogenerado

### 4.2 Atributos de estado

- Siempre usar **enum** para estados, no booleans separados.
- Valores de enum en **lowercase** o **kebab-case**.
- Ejemplo: `status: ["draft", "published", "archived"]` en vez de `isPublished: true/false` + `isArchived: true/false`.

### 4.3 Atributos de referencia

- Relaciones se nombran con el ID de la entidad destino: `experienceId`, `userId`, `slotId`.
- Tipo de relación preferido: **manyToOne** o **oneToMany** según cardinalidad.
- Para N:N usar tabla intermedia explícita (ej: `experience_tags`, `addon_assignments`).

### 4.4 Atributos de precio

- Tipo: `float` (Appwrite no tiene decimal).
- Siempre en la **moneda base** (MXN).
- Nunca almacenar precios calculados — los totales se calculan en Function.
- Los precios en órdenes van dentro del **snapshot**, no como referencia viva.

### 4.5 Atributos de fecha/hora

- Tipo: `datetime` de Appwrite.
- Formato: ISO 8601 (`2025-03-15T09:00:00.000Z`).
- Siempre en **UTC** — la conversión a zona horaria es responsabilidad del frontend.

### 4.6 Atributos de media

- Almacenar solo el **fileId** de Appwrite Storage, nunca URLs absolutas.
- Tipo: `string` para single file, o `string[]` (si Appwrite lo soporta) / JSON string para arrays.

---

## 5. Snapshots — regla de integridad histórica

### 5.1 Qué es un snapshot

Una copia JSON inmutable de los datos al momento de la transacción. Se guarda **dentro** del documento de orden/ticket para que un cambio futuro de precios o catálogo no altere ventas pasadas.

### 5.2 Dónde se usan snapshots

| Tabla         | Atributo                 | Contenido del snapshot                                                                             |
| ------------- | ------------------------ | -------------------------------------------------------------------------------------------------- |
| `orders`      | `snapshot` (string/JSON) | Experiencia, edición, pricing tier, addons, cantidades, precios unitarios, subtotal, total, moneda |
| `order_items` | `itemSnapshot`           | Nombre, tipo, precio unitario, cantidad al momento de compra                                       |
| `tickets`     | `ticketSnapshot`         | Datos del ticket: experiencia, fecha, hora, ubicación, participante, QR data                       |
| `refunds`     | `refundSnapshot`         | Datos de la orden al momento del reembolso                                                         |

### 5.3 Reglas de snapshots

1. **Inmutables**: un snapshot NUNCA se modifica después de creado.
2. **Completos**: deben contener TODO lo necesario para reconstruir la venta sin consultar otras tablas.
3. **Creados server-side**: solo Functions crean snapshots, nunca el frontend.
4. **Tipo string**: almacenados como JSON stringified en atributo de tipo `string` (Appwrite no tiene tipo JSON nativo).

---

## 6. Permisos de colecciones

### 6.1 Modelo de labels

| Label      | Rol           | Acceso general                                   |
| ---------- | ------------- | ------------------------------------------------ |
| `root`     | Ghost admin   | Todo — invisible en UI                           |
| `admin`    | Administrador | Todo el panel admin y configuración              |
| `operator` | Operador      | Lectura operativa (agenda, reservas, validación) |
| `client`   | Cliente       | Sus propios datos (órdenes, tickets, perfil)     |
| (anónimo)  | Visitante     | Catálogo público de solo lectura                 |

### 6.2 Patrones de permisos por tipo de colección

**Catálogo público** (experiences, publications, tags, addons publicados):

```
read:  Role.any()
create: Role.label("admin")
update: Role.label("admin")
delete: Role.label("admin")
```

**Datos operativos** (slots, bookings, resources):

```
read:  Role.label("admin"), Role.label("operator")
create: Role.label("admin")
update: Role.label("admin"), Role.label("operator") // operator solo campos operativos
delete: Role.label("admin")
```

**Datos de usuario** (orders, tickets, user_profiles):

```
read:  Role.user(userId), Role.label("admin")
create: Role.label("admin") // creado por Functions server-side
update: Role.label("admin")
delete: Role.label("admin")
```

**Configuración** (site_settings, notification_templates):

```
read:  Role.label("admin")
create: Role.label("admin")
update: Role.label("admin")
delete: Role.label("admin")
```

### 6.3 Reglas estrictas

- **Nunca** `Role.any()` para write en datos sensibles.
- **Nunca** dar write a `operator` en catálogos o pricing.
- **Nunca** dar read de datos de usuario a otros usuarios.
- `root` **DEBE declararse explícitamente** en cada colección — Appwrite NO tiene herencia de labels. Añadir `label:root` con los mismos permisos que `label:admin` (o superiores).

---

## 7. Índices

### 7.1 Cuándo crear índices

- Atributos usados en queries frecuentes (`experienceId`, `status`, `userId`).
- Combinaciones de filtros comunes (`experienceId` + `status`, `userId` + `createdAt`).
- Atributos de ordenamiento (`createdAt`, `date`, `sortOrder`).

### 7.2 Naming de índices

```
idx_{atributo}                    → idx_status
idx_{atributo1}_{atributo2}       → idx_experienceId_status
idx_{atributo}_asc|desc           → idx_createdAt_desc
```

### 7.3 Índices comunes

| Tabla         | Índice                  | Tipo   | Atributos              |
| ------------- | ----------------------- | ------ | ---------------------- |
| `experiences` | `idx_status`            | key    | `status`               |
| `experiences` | `idx_type_status`       | key    | `type`, `status`       |
| `slots`       | `idx_experienceId_date` | key    | `experienceId`, `date` |
| `slots`       | `idx_status_date`       | key    | `status`, `date`       |
| `orders`      | `idx_userId`            | key    | `userId`               |
| `orders`      | `idx_status`            | key    | `status`               |
| `orders`      | `idx_stripeSessionId`   | unique | `stripeSessionId`      |
| `tickets`     | `idx_orderId`           | key    | `orderId`              |
| `tickets`     | `idx_userId`            | key    | `userId`               |
| `tickets`     | `idx_code`              | unique | `code`                 |
| `bookings`    | `idx_slotId`            | key    | `slotId`               |
| `bookings`    | `idx_userId`            | key    | `userId`               |

---

## 8. Relaciones

### 8.1 Tipos de relación en Appwrite 1.9

- **oneToOne**: un documento se relaciona con exactamente uno.
- **oneToMany**: un documento padre tiene muchos hijos.
- **manyToOne**: muchos hijos apuntan a un padre.
- **manyToMany**: relación N:N (usa tabla intermedia).

### 8.2 Relaciones clave de OMZONE

| Origen                 | Relación | Destino                  | Tipo                           |
| ---------------------- | -------- | ------------------------ | ------------------------------ |
| `experience_editions`  | →        | `experiences`            | manyToOne                      |
| `pricing_tiers`        | →        | `experience_editions`    | manyToOne                      |
| `slots`                | →        | `experience_editions`    | manyToOne                      |
| `addon_assignments`    | →        | `addons` + `experiences` | manyToOne × 2                  |
| `orders`               | →        | `users` (Auth)           | referencia por `userId` string |
| `order_items`          | →        | `orders`                 | manyToOne                      |
| `tickets`              | →        | `orders`                 | manyToOne                      |
| `tickets`              | →        | `bookings`               | oneToOne                       |
| `bookings`             | →        | `slots`                  | manyToOne                      |
| `bookings`             | →        | `users` (Auth)           | referencia por `userId` string |
| `pass_consumptions`    | →        | `passes` + `tickets`     | manyToOne × 2                  |
| `publication_sections` | →        | `publications`           | manyToOne                      |

### 8.3 Cuándo usar relación vs referencia string

- **Relación Appwrite**: cuando necesitas queries con expand/joins frecuentes.
- **String (userId, fileId)**: cuando referencias entidades fuera de la DB (Auth users, Storage files) o cuando la relación es informativa y no necesitas expand.

---

## 9. Validación post-cambio de schema

Después de CUALQUIER modificación al schema, verificar:

- [ ] **Naming**: tablas en `snake_case`, atributos en `camelCase`
- [ ] **Tipos**: float para precios, datetime para fechas, enum para estados
- [ ] **Permisos**: coherentes con la matriz de la sección 6
- [ ] **Índices**: creados para queries frecuentes
- [ ] **Relaciones**: tipo correcto (manyToOne vs oneToMany)
- [ ] **Snapshots**: tablas transaccionales tienen atributo de snapshot
- [ ] **Impacto en Functions**: las Functions que leen/escriben la tabla afectada siguen funcionando
- [ ] **Impacto en frontend**: los componentes que consumen la tabla reflejan los cambios
- [ ] **JSON válido**: `appwrite.json` es JSON válido y parseable
- [ ] **Sin datos sensibles expuestos**: no hay permisos abiertos en colecciones privadas

---

## 10. Errores frecuentes

| Error                               | Consecuencia                   | Corrección                         |
| ----------------------------------- | ------------------------------ | ---------------------------------- |
| Tabla en `camelCase` o `PascalCase` | Inconsistencia con convención  | Renombrar a `snake_case`           |
| Atributo en `snake_case`            | Inconsistencia con frontend JS | Renombrar a `camelCase`            |
| Precio como `integer`               | Pérdida de decimales           | Usar `float`                       |
| Boolean en vez de enum para estado  | No escala a múltiples estados  | Usar enum con valores descriptivos |
| URL absoluta en vez de fileId       | Se rompe al cambiar dominio    | Almacenar solo fileId              |
| `Role.any()` write en órdenes       | Cualquiera modifica órdenes    | Permisos por user + admin          |
| Snapshot modificado post-creación   | Corrompe integridad histórica  | Inmutabilidad estricta             |
| Relación sin índice                 | Queries lentas                 | Crear índice en FK                 |
| Fecha en formato local              | Inconsistencia entre zonas     | Siempre UTC ISO 8601               |
