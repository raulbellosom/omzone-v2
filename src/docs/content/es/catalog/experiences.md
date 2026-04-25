---
title: Experiencias
description: Ofertas principales de bienestar - sesiones, inmersiones, retiros, estadías y paquetes
section: catalog
order: 1
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/experiences
  - /admin/experiences/new
  - /admin/experiences/:id/edit
relatedCollections:
  - experiences
  - editions
  - pricing_tiers
  - addon_assignments
keywords:
  - experience
  - experiencias
  - catálogo
  - oferta
  - sesión
  - inmersión
  - retiro
  - estadía
  - paquete
---

# Experiencias

Las experiencias son las ofertas principales en OMZONE. Cada experiencia define qué pueden reservar los clientes, cómo pueden reservarlo y qué reciben al comprar.

## Resumen

Navega a **Catálogo -> Experiencias** para ver todas las experiencias. Desde aquí puedes:
- Filtrar por tipo, estado o buscar por nombre
- Crear nuevas experiencias
- Editar experiencias existentes
- Actualizar estado (borrador, publicada, archivada)
- Acceder a ediciones, precios, complementos y ranuras

---

## Referencia de Campos

Documentación completa para todos los campos del formulario del editor de Experiencias.

### Sección de Identidad

Los campos en la sección de Identidad controlan cómo se identifica la experiencia internamente y se muestra a los clientes.

#### `name` (Nombre Interno)

| Atributo | Valor |
|----------|-------|
| Tipo | string |
| Requerido | Sí |
| Longitud Máxima | 255 |
| Visible para Clientes | No |

**Propósito:** Identificador interno para referencia del admin.

**Análisis de Impacto:**
```
name → Listas de admin e informes internos
name → NO visible en ninguna página para clientes
name → NO usado en correos electrónicos o tickets del cliente
name → Sin impacto en SEO o flujo de checkout
```

**Mejores Prácticas:**
- Usa nombres descriptivos para organización interna (ej., "Yoga Amanecer — nombre interno")
- No necesita traducción ya que es solo para admins

---

#### `publicName` (Nombre Público EN)

| Atributo | Valor |
|----------|-------|
| Tipo | string |
| Requerido | Sí |
| Longitud Máxima | 255 |
| Visible para Clientes | Sí (locale inglés) |

**Propósito:** Nombre principal para clientes en inglés.

**Análisis de Impacto:**
```
publicName → Título en listados de experiencias (locale=en)
publicName → Encabezado de página de checkout
publicName → Confirmaciones por correo (locale=en)
publicName → Nombre del ticket (si generatesTickets=true)
publicName → Auto-genera slug cuando se llena primero (si slug está vacío)
```

**Importante:** Este campo es obligatorio y impulsa múltiples sistemas posteriores.

---

#### `publicNameEs` (Nombre Público ES)

| Atributo | Valor |
|----------|-------|
| Tipo | string |
| Requerido | No |
| Longitud Máxima | 255 |
| Visible para Clientes | Sí (locale español) |

**Propósito:** Traducción al español del nombre público.

**Comportamiento:**
- Solo se muestra cuando el locale del usuario es `es-MX` o `es`
- Recurre a `publicName` si este campo está vacío

**Análisis de Impacto:**
```
publicNameEs → Título en listados en español (locale=es)
publicNameEs → Encabezado de checkout en español (locale=es)
publicNameEs → Correo de confirmación en español (locale=es)
```

---

#### `slug` (Identificador de URL)

| Atributo | Valor |
|----------|-------|
| Tipo | string |
| Requerido | Sí |
| Patrón | Solo letras minúsculas, números, guiones |
| Singularidad | Debe ser único entre TODAS las experiencias Y publicaciones |

**Comportamiento de Auto-generación:**
- Cuando `publicName` se llena primero y `slug` está vacío, el slug se auto-genera del nombre público
- Una vez establecido, cambiar `publicName` NO actualiza automáticamente el slug
- El usuario puede editar manualmente el slug en cualquier momento

**Análisis de Impacto:**
```
slug → Estructura de URL: /experiences/{slug}
slug → No debe entrar en conflicto con /{slug} para publicaciones
slug → Cambiar rompe marcadores existentes y enlaces externos
slug → Usado para URLs canónicas en SEO
```

**Ejemplos Válidos:**
| Ejemplo | ¿Válido? | Notas |
|---------|----------|-------|
| `yoga-session` | Sí | Formato estándar |
| `yoga-session-2026` | Sí | Con números |
| `Yoga Session` | No | Contiene mayúsculas y espacio |
| `yoga%session` | No | Contiene carácter inválido `%` |
| `yoga session` | No | Contiene espacio |

**Restricción Crítica:** Los slugs deben ser únicos entre experiencias Y publicaciones. Un slug como "yoga" no puede usarse para una experiencia y una publicación.

---

### Sección de Clasificación

Los campos en la sección de Clasificación determinan cómo compran los clientes y qué reciben.

#### `type` (Tipo de Experiencia)

| Atributo | Valor |
|----------|-------|
| Tipo | enum |
| Requerido | Sí |
| Opciones | `session`, `immersion`, `retreat`, `stay`, `private`, `package` |

**Análisis de Opciones:**

| Tipo | Descripción | Duración Típica | insignia de Listado |
|------|-------------|-----------------|---------------------|
| `session` | Sesión individual de yoga o bienestar | 1-2 horas | "Sesión" |
| `immersion` | Experiencia intensiva de múltiples horas | 3-8 horas | "Inmersión" |
| `retreat` | Programa extendido de varios días | 1-14 días | "Retiro" |
| `stay` | Experiencia basada en alojamiento | 1+ noches | "Estadía" |
| `private` | Uno a uno o grupo exclusivo | Variable | "Privado" |
| `package` | Experiencias combinadas en paquete | Variable | "Paquete" |

**Análisis de Impacto:**
```
type → insignia de clasificación en listados
type → Opciones de filtrado en admin
type → Sin puertas funcionales ni restricciones
type → Puramente organizacional y establecimiento de expectativas del cliente
```

**Nota:** El tipo NO afecta la funcionalidad. Puede combinarse con cualquier saleMode y fulfillmentType.

---

#### `saleMode` (Modo de Venta)

| Atributo | Valor |
|----------|-------|
| Tipo | enum |
| Requerido | Sí |
| Opciones | `direct`, `request`, `assisted`, `pass` |

**Análisis de Opciones:**

| Modo | Comportamiento de Checkout | Participación Admin | Integración Stripe |
|------|----------------------------|----------------------|--------------------|
| `direct` | Compra inmediata en línea | Ninguna requerida | Sí — Stripe Checkout |
| `request` | Cliente envía solicitud | Admin revisa y cotiza | No — seguimiento manual |
| `assisted` | Admin crea orden manualmente | Completo guiado por asistente | Sí — admin inicia |
| `pass` | Cliente usa créditos existentes | Ninguna | No — redención de crédito |

**Relación Crítica con `fulfillmentType`:**

| Modo de Venta | Tipos de Cumplimiento Válidos | Combinaciones Inválidas |
|---------------|-------------------------------|------------------------|
| `direct` | `ticket`, `booking`, `package` | `pass` |
| `request` | `ticket`, `booking`, `pass`, `package` | — |
| `assisted` | `ticket`, `booking`, `pass`, `package` | — |
| `pass` | `pass` | `ticket`, `booking`, `package` |

**Por Qué Estas Combinaciones Son Inválidas:**

| Combinación | Razón |
|-------------|-------|
| `saleMode="direct"` + `fulfillmentType="pass"` | No se puede pagar Y canjear créditos simultáneamente |
| `saleMode="pass"` + `fulfillmentType="ticket"` | Los créditos del pase se consumen, no se compran |
| `saleMode="pass"` + `fulfillmentType="booking"` | Los créditos del pase se consumen, no se compran |
| `saleMode="pass"` + `fulfillmentType="package"` | Los créditos del pase se consumen, no se compran |

**Impacto en el Flujo de Checkout:**

| saleMode | Comportamiento de UI del Cliente |
|----------|----------------------------------|
| `direct` | Checkout completo con pago Stripe, botón "Reservar Ahora" |
| `request` | Botón "Solicitar Reserva" en lugar de "Reservar Ahora", sin paso de pago |
| `assisted` | No disponible para auto-servicio (admin crea solo mediante asistente) |
| `pass` | Botón "Canjear Pase", ingresa código del pase o selecciona de los poseídos |

---

#### `fulfillmentType` (Tipo de Cumplimiento)

| Atributo | Valor |
|----------|-------|
| Tipo | enum |
| Requerido | Sí |
| Opciones | `ticket`, `booking`, `pass`, `package` |

**Análisis de Opciones:**

| Cumplimiento | Qué Recibe el Cliente | ¿Ticket Generado? | ¿Check-in Requerido? |
|--------------|------------------------|-------------------|---------------------|
| `ticket` | Ticket con código QR con ID único | Sí | Sí (validar en entrada) |
| `booking` | Solo correo de confirmación | No | No (sistema de honor) |
| `pass` | Crédito deducido del pase | No | Sí (consumir pase) |
| `package` | Ticket(s) para items incluidos | Sí (por item) | Sí (validar cada ticket) |

**Restricciones Críticas:**

| Restricción | Descripción |
|-------------|-------------|
| Dependencia de `generatesTickets` | Cuando `fulfillmentType` = "ticket" o "package", `generatesTickets` debe ser típicamente `true` |
| Compatibilidad con `requiresSchedule` | Para cumplimiento "ticket", `requiresSchedule` debe ser típicamente `true` |
| Múltiples asistentes | Cuando `allowQuantity` = `true`, el ticket genera UN ticket con cantidad, no múltiples tickets individuales |

---

### Sección de Descripción

Los campos en la sección de Descripción controlan el contenido textual mostrado a los clientes.

#### `shortDescription` (Descripción Corta EN)

| Atributo | Valor |
|----------|-------|
| Tipo | string |
| Requerido | No |
| Longitud Máxima | 500 caracteres |

**Ubicaciones de Visualización:**
- Tarjeta de experiencia en listados
- Arriba del pliegue en página de detalle
- Puede usarse como alternativa de meta descripción para SEO

**Comportamiento de Respaldo:**
- Si está vacía y `longDescription` está llena, el sistema puede usar `longDescription` truncada
- Sin generación automática desde otros campos

---

#### `shortDescriptionEs` (Descripción Corta ES)

| Atributo | Valor |
|----------|-------|
| Tipo | string |
| Requerido | No |
| Longitud Máxima | 500 caracteres |

**Ubicación de Visualización:** Tarjeta de experiencia en español y arriba del pliegue (locale=es)

**Comportamiento de Respaldo:**
- Si está vacía, recurre a `shortDescription` (inglés)
- El sistema NO auto-traduce

---

#### `longDescription` (Descripción Larga EN)

| Atributo | Valor |
|----------|-------|
| Tipo | text |
| Requerido | No |
| Longitud Máxima | 5,000 caracteres |

**Ubicación de Visualización:** Debajo del pliegue en la página de detalle de la experiencia

**Comportamiento de Respaldo:**
- Si está vacía y `shortDescription` está lleno, el sistema puede extender shortDescription
- Sin generación automática

**Nota SEO:** Contribuye al SEO del contenido de la página. Asegúrate de que los primeros 155 caracteres sean convincentes ya que los motores de búsqueda pueden usar esta porción.

---

#### `longDescriptionEs` (Descripción Larga ES)

| Atributo | Valor |
|----------|-------|
| Tipo | text |
| Requerido | No |
| Longitud Máxima | 5,000 caracteres |

**Ubicación de Visualización:** Debajo del pliegue en página de detalle (locale=es)

**Comportamiento de Respaldo:**
- Si está vacía, recurre a `longDescription` (inglés)
- El sistema NO auto-traduce

---

### Sección de Portada/Galería

#### `heroImageId` (Imagen de Portada)

| Atributo | Valor |
|----------|-------|
| Tipo | file |
| Cantidad Máxima | 1 |

**Comportamiento de Visualización:**
- Mostrada como fondo en tarjeta de experiencia con superposición de texto
- Sección hero en página de detalle de la experiencia
- Usada como alternativa de imagen OG si no hay imagen OG establecida en la publicación

**Recomendaciones:**
- Resolución: 1920x1080 o mayor
- Formato: JPG o WebP
- Relación de aspecto: 16:9 recomendada

**Importante:** Si se remove la imagen hero, se muestra un color placeholder. El sistema NO recurre automáticamente a gallery[0].

---

#### `galleryImageIds` (Imágenes de Galería)

| Atributo | Valor |
|----------|-------|
| Tipo | file[] |
| Cantidad Máxima | 10 |

**Comportamiento de Visualización:**
- Mostradas como carrusel clickeable en página de detalle de la experiencia
- Array ordenado — la primera imagen NO se usa como respaldo para hero

**Recomendaciones:**
- Relación de aspecto consistente en toda la galería
- Ancho mínimo: 1200px
- Formato: JPG o WebP

---

### Sección de Comportamiento

Campos de alternancia que controlan el comportamiento de reserva.

#### `requiresSchedule` (Requiere Selección de Fecha/Ranura)

| Atributo | Valor |
|----------|-------|
| Tipo | boolean |
| Por Defecto | false |

**Cuando Está Habilitado:**
- El cliente debe seleccionar una ranura de fecha+hora específica durante el checkout
- Solo ranuras con `status = "open"` están disponibles
- La capacidad de ranura se cumple

**Cuando Está Deshabilitado:**
- El cliente selecciona solo fecha (si `requiresDate = true`)
- O sin selección de fecha (tiempo abierto o basado en cita)

**Árbol de Decisión:**
```
¿La experiencia tiene ranuras de tiempo fijo que los clientes deben reservar?
├── SÍ → requiresSchedule = true
└── NO → ¿La experiencia sucede en fechas específicas pero no horas?
          ├── SÍ → requiresDate = true
          └── NO → Ambos false (tiempo abierto o basado en cita)
```

---

#### `requiresDate` (Requiere Fecha Específica)

| Atributo | Valor |
|----------|-------|
| Tipo | boolean |
| Por Defecto | false |

**Cuando Está Habilitado:**
- El cliente debe seleccionar una fecha durante el checkout
- Selección de ranura de tiempo NO requerida (a menos que `requiresSchedule = true`)

**Cuando Está Deshabilitado:**
- Sin selección de fecha requerida
- Útil para experiencias con tiempo abierto

---

#### `allowQuantity` (Permite Múltiples Asistentes)

| Atributo | Valor |
|----------|-------|
| Tipo | boolean |
| Por Defecto | false |

**Cuando Está Habilitado:**
- Múltiples asistentes permitidos en una orden
- Aparecen campos `minQuantity` y `maxQuantity`

**Cuando Está Deshabilitado:**
- Exactamente 1 ticket por orden
- Campos de cantidad ocultos

**Configuración de Cantidad:**

| allowQuantity | minQuantity | maxQuantity | Comportamiento |
|---------------|-------------|-------------|----------------|
| false | — | — | Exactamente 1 ticket por orden |
| true | vacío | vacío | 1 a ilimitado por orden |
| true | 2 | vacío | Mínimo 2, sin máximo |
| true | vacío | 5 | Máximo 5, mínimo 1 |
| true | 2 | 5 | Mínimo 2, máximo 5 |

**Importante:** Cuando cantidad > 1, el sistema genera UN ticket con la cantidad, no tickets individuales por persona. Para tickets nombrados individuales, puede ser necesaria la recolección de información de invitados adicionales en el check-in.

---

#### `generatesTickets` (Genera Tickets Después de la Compra)

| Atributo | Valor |
|----------|-------|
| Tipo | boolean |
| Por Defecto | true |

**Relación de Generación de Tickets:**

| generatesTickets | fulfillmentType | Comportamiento Esperado |
|------------------|------------------|--------------------------|
| true | `ticket` | Ticket QR generado con código único |
| true | `booking` | Ticket generado (considera usar "booking" en su lugar) |
| false | `ticket` | Sin ticket generado (puede ser inconsistente) |
| false | `booking` | Sin ticket (correcto para tipo booking) |
| true/false | `pass` | Sin ticket generado (el consumo del pase es separado) |
| true/false | `package` | Ticket generado por item del paquete |

---

### Sección de Publicación

#### `status` (Estado de Publicación)

| Atributo | Valor |
|----------|-------|
| Tipo | enum |
| Requerido | Sí |
| Opciones | `draft`, `published`, `archived` |

**Ciclo de Vida del Estado:**

```
┌─────────┐     publish      ┌───────────┐     archive     ┌──────────┐
│  DRAFT  │ ───────────────► │ PUBLISHED │ ──────────────► │ ARCHIVED │
└─────────┘                  └───────────┘                  └──────────┘
     ▲                           │                              │
     │         unpublish         │         return to draft      │
     └───────────────────────────┴──────────────────────────────┘
```

**Impacto del Estado:**

| Estado | Visibilidad en Catálogo | Reserva Disponible | Puede Editar | Puede Eliminar |
|--------|-------------------------|--------------------|--------------|----------------|
| `draft` | No | No | Sí | Sí |
| `published` | Sí | Sí (si existe precio) | Sí | No |
| `archived` | No | No | Sí | No |

**Restricción de Eliminación:** Una experiencia en estado `published` puede moverse a `archived` pero NO puede eliminarse. Primero debes moverla a `draft` antes de eliminarla.

---

#### `sortOrder` (Orden de Visualización)

| Atributo | Valor |
|----------|-------|
| Tipo | integer |
| Requerido | No |

**Comportamiento:**
- Los números más bajos aparecen primero en los listados
- Vacío/0 se trata como última posición
- Mismo orden de visualización resulta en desempate alfabético por `publicName`

---

### Sección de SEO

#### `seoTitle` (Título SEO)

| Atributo | Valor |
|----------|-------|
| Tipo | string |
| Requerido | No |
| Longitud Máxima | 255 caracteres |

**Propósito:** Título de página personalizado para motores de búsqueda.

**Respaldo:** Usa `publicName` si está vacío.

**Mejores Prácticas:**
- Debe ser convincente e incluir términos clave
- Debe ser único por página (sin títulos duplicados)
- Incluir nombre de marca para búsquedas de marca

---

#### `seoDescription` (Descripción SEO)

| Atributo | Valor |
|----------|-------|
| Tipo | string |
| Requerido | No |
| Longitud Máxima | 500 caracteres |

**Propósito:** Meta descripción para motores de búsqueda.

**Respaldo:** Usa los primeros 155 caracteres de `shortDescription` o `longDescription` si está vacío.

**Mejores Prácticas:**
- Debe incluir llamada a la acción
- Debe ser única por página
- Primeros 155 caracteres mostrados en resultados de búsqueda

---

## Árbol de Decisión del Modo de Venta

Usa este árbol de decisión para seleccionar el modo de venta apropiado:

```
¿El cliente compra en línea sin participación del admin?
│
├── SÍ → ¿El cliente usa créditos existentes?
│         │
│         ├── SÍ → saleMode = "pass"
│         │         fulfillmentType = "pass"
│         │
│         └── NO → saleMode = "direct"
│                  fulfillmentType = "ticket" o "booking" o "package"
│
└── NO → ¿El cliente envía solicitud y el admin cotiza?
          │
          ├── SÍ → saleMode = "request"
          │         fulfillmentType = cualquier
          │
          └── NO → saleMode = "assisted"
                   fulfillmentType = cualquier
```

---

## Errores Comunes

### Establecer precios en una Publicación en lugar de la Experiencia

Los niveles de precio pertenecen a la Experiencia. Las Publicaciones son solo para contenido editorial. Si necesitas que los precios sean visibles en una Publicación, vincula la Publicación a una Experiencia que tenga niveles de precio.

### Usar un `slug` que pueda entrar en conflicto con publicaciones futuras

El slug es permanente una vez establecido. Elige cuidadosamente. Un slug como "yoga-retreat" evitará que cualquier publicación use ese slug como su URL.

### Crear una experiencia sin niveles de precio

Los clientes no pueden reservar una experiencia que no tenga niveles de precio. Siempre agrega al menos un nivel de precio antes de publicar.

### Establecer `requiresSchedule` en false pero luego crear ranuras

Si una experiencia no requiere programación, no se提示ará a los clientes que seleccionen una ranura. Las ranuras pueden crearse pero no se mostrarán durante el checkout.

### Usar combinaciones inválidas de saleMode + fulfillmentType

| Combinación | Problema |
|-------------|----------|
| `direct` + `pass` | No se puede pagar Y canjear créditos simultáneamente |
| `pass` + `ticket` | Los créditos del pase se consumen, no se compran |

---

## Pestañas de Experiencia

Después de crear una experiencia, aparecen pestañas adicionales:

### Pestaña de Info

Editar los datos principales de la experiencia (mismos campos que en la creación).

### Pestaña de Ediciones

Gestionar versiones vinculadas al tiempo de una experiencia (ver [Ediciones](./editions.md)).

### Pestaña de Precios

Agregar y gestionar niveles de precio (ver [Niveles de Precio](./pricing-tiers.md)).

### Pestaña de Complementos

Asignar complementos opcionales a esta experiencia (ver [Complementos](./addons.md)).

### Pestaña de Ranuras

Crear ranuras de disponibilidad para reserva programada (ver [Ranuras y Agenda](../operations/slots.md)).

---

## Ciclo de Vida del Estado de Experiencia

```
draft -> published -> archived
```

| Estado | Visibilidad en Catálogo | Reserva Disponible | Puede Editar |
|--------|--------------------------|-------------------|--------------|
| `draft` | Solo admin | No | Sí |
| `published` | Público | Sí | Sí |
| `archived` | Solo admin | No | Sí |

Para publicar: Edita la experiencia y establece el estado en `published`.
Para archivar: Edita la experiencia y establece el estado en `archived`.
Desde archivado, puedes volver a `draft` y luego a `published` de nuevo.

---

## Páginas Relacionadas

- [Ediciones](./editions.md) - Versiones vinculadas al tiempo de experiencias
- [Niveles de Precio](./pricing-tiers.md) - Establecer precios para experiencias
- [Complementos](./addons.md) - Extras opcionales
- [Ranuras y Agenda](../operations/slots.md) - Crear disponibilidad
- [Órdenes](../sales/orders.md) - Estado de órdenes y transiciones
- [Flujos](../reference/flows.md) - Árboles de decisión y diagramas de flujo
- [Limitaciones Conocidas](../reference/known-limitations.md) - Restricciones intencionales y casos edge