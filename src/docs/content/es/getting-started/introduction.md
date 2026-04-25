---
title: Introducción al Admin de OMZONE
description: Comenzar con el panel administrativo de OMZONE - navegación, conceptos y flujos de trabajo principales
section: getting-started
order: 1
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin
  - /admin/dashboard
  - /help/docs
relatedCollections:
  - user_profiles
keywords:
  - admin
  - comenzar
  - navegación
  - conceptos
  - flujo de trabajo
---

# Introducción al Admin de OMZONE

El panel de OMZONE Admin es tu centro de control para gestionar toda la plataforma de bienestar. Desde aquí controlas ofertas del catálogo, programación, ventas, contenido editorial y configuración del sistema.

## Acceder al Panel de Admin

Accede al panel de admin navegando a `/admin` después de iniciar sesión. Debes tener uno de los siguientes labels asignados a tu cuenta:

| Label | Nombre a Mostrar | Nivel de Acceso |
|-------|------------------|----------------|
| `root` | Admin | Acceso completo al sistema, invisible en listados |
| `admin` | Admin | Acceso completo a todas las funciones de admin |
| `operator` | Operador | Acceso programado a operaciones y ventas |
| `client` | Cliente | Acceso solo al portal, sin admin |

> **Importante:** El label `root` es invisible en toda la plataforma. Los usuarios root nunca aparecen en listados de clientes u órdenes, y root nunca se muestra como nombre de rol. Al mostrar roles, siempre usa "Admin" para ambos labels root y admin.

## Estructura de Navegación del Admin

La barra lateral contiene siete secciones principales:

### General
- **Dashboard** (`/admin/dashboard`) - Resumen de órdenes, ingresos, ranuras próximas y solicitudes pendientes
- **Mi Cuenta** (`/admin/account`) - Perfil y configuración de seguridad

### Catálogo
- **Experiencias** (`/admin/experiences`) - Ofertas principales de bienestar (sesiones, inmersiones, retiros, estadías)
- **Complementos** (`/admin/addons`) - Extras opcionales que pueden adjuntarse a experiencias
- **Paquetes** (`/admin/packages`) - Experiencias打包adas con precio fijo
- **Pases** (`/admin/passes`) - Pases de crédito consumibles para visitas repetidas

### Operaciones
- **Agenda** (`/admin/agenda`) - Vista global de todas las ranuras programadas en todas las experiencias
- **Recursos** (`/admin/resources`) - Instructores, facilitadores, terapeutas, equipos, ubicaciones y salas

### Ventas
- **Solicitudes** (`/admin/booking-requests`) - Consultas de reserva entrantes para experiencias con `saleMode: request`
- **Órdenes** (`/admin/orders`) - Todas las compras de clientes en todos los canales
- **Tickets** (`/admin/tickets`) - Tickets validables con códigos QR para check-in
- **Clientes** (`/admin/clients`) - Cuentas de clientes registradas

### Contenido
- **Publicaciones** (`/admin/publications`) - Contenido editorial y de páginas de landing
- **Medios** (`/admin/media`) - Gestor de archivos para todos los buckets

### Sistema
- **Configuración** (`/admin/settings`) - Plantillas de notificación y configuración del sistema

## Concepto Principal: Publicaciones vs Experiencias

Una distinción fundamental en OMZONE:

| Aspecto | Experiencia | Publicación |
|---------|------------|-------------|
| **Propósito** | Operacional, comercial | Editorial, SEO, narrativa |
| **Contiene** | Niveles de precio, ediciones, ranuras | Secciones con bloques de contenido |
| **Visibilidad** | Disponibilidad y reserva | Páginas de landing y blog |
| **Se vincula a** | Complementos, ranuras, recursos | Experiencia vía `experienceId` |

> **Regla Clave:** Los niveles de precio pertenecen a las **Experiencias**, no a las Publicaciones. No agregues precios a una Publicación. Una Publicación puede vincular a una Experiencia, pero son entidades separadas.

### Cuándo Crear Cada Una

**Crea una Experiencia cuando:**
- Quieres vender una oferta de bienestar
- Necesitas gestión de precios y disponibilidad
- Quieres que los clientes reserven o soliciten reserva

**Crea una Publicación cuando:**
- Necesitas una página de landing para SEO
- Quieres contenido de narrativa editorial
- Necesitas posts de blog, páginas institucionales o FAQs

## Flujo de Trabajo Estándar: Agregar una Nueva Experiencia

Sigue esta secuencia cuando configures una nueva experiencia:

### Paso 1: Crear la Experiencia

Navega a **Catálogo -> Experiencias -> Nueva experiencia**

Llena los campos principales:
- **Nombre** - Identificador interno (no visible para clientes)
- **Nombre público (EN/ES)** - Nombre para el cliente en ambos idiomas
- **Slug** - Identificador amigable para URL (auto-generado del nombre público)
- **Tipo** - `session`, `immersion`, `retreat`, `stay`, `private`, o `package`
- **Modo de venta** - `direct` (reservar ahora), `request` (se requiere consulta), `assisted` (admin crea orden), `pass` (basado en créditos)
- **Cumplimiento** - `ticket` (genera QR), `booking` (sin ticket), `pass` (redeención de crédito), `package` (paquete)

Configura los toggles de comportamiento:
- **Requiere ranura** - Habilitar si se necesita selección de fecha/hora específica
- **Genera tickets** - Habilitar para crear tickets con código QR al comprar
- **Permite múltiples asistentes** - Habilitar para reservas grupales con cantidad mín/máx

### Paso 2: Agregar Ediciones (Opcional)

Para experiencias con múltiples rangos de fechas o versiones:

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Ediciones -> Nueva edición**

Las Ediciones permiten:
- Diferentes rangos de fechas con `startDate` y `endDate`
- Ventanas de registro con `registrationOpens` y `registrationCloses`
- Límites de capacidad específicos por edición
- Imágenes de portada específicas por edición

### Paso 3: Agregar Niveles de Precio

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Precios -> Nuevo nivel**

Campos del nivel de precio:
- **Nombre (EN/ES)** - Etiqueta del nivel (ej., "Reserva Temprana", "Admisión General")
- **Tipo de precio** - `fixed`, `per-person`, `per-group`, `from`, `quote`
- **Precio base** - Valor numérico del precio
- **Moneda** - Código de tres letras (ej., MXN, USD)
- **Insignia** - Etiqueta opcional como "Popular" o "Más Vendido"
- **Destacado** - Mostrar como nivel preferido
- **Edición** - Vinculación opcional a una edición específica

### Paso 4: Agregar Ranuras (Si se Requiere)

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Ranuras -> Nueva ranura**

Campos de la ranura:
- **Tipo de ranura** - `single_session`, `multi_day`, `retreat_day`, `private`
- **Fecha/hora de inicio/fin** - Fecha y hora con zona horaria
- **Capacidad** - Máximo de participantes
- **Ubicación** - Ubicación física (de ubicaciones predefinidas)
- **Sala** - Sala específica dentro de la ubicación
- **Estado** - `draft`, `published`, `full`, `cancelled`

Para ranuras recurrentes, usa **Creación Rápida** para generar múltiples ranuras basándose en un patrón.

### Paso 5: Asignar Recursos (Opcional)

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Ranuras -> [Nombre de Ranura] -> Recursos**

Los recursos pueden asignarse a ranuras con roles:
- **Principal** - Instructor o facilitador principal
- **Asistente** - Maestro o помощник secundario
- **Soporte** - Soporte técnico o logístico
- **Equipo** - Equipo being utilizado

### Paso 6: Asignar Complementos (Opcional)

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Complementos -> Asignar complemento**

Los complementos pueden ser:
- **Requeridos** - Incluidos automáticamente con la experiencia
- **Por defecto** - Pre-seleccionados durante el checkout
- **Opcionales** - Disponibles pero no pre-seleccionados

### Paso 7: Crear Publicación (Opcional)

Solo crea una Publicación si necesitas contenido editorial visible al público:

Navega a **Contenido -> Publicaciones -> Nueva publicación**

Campos de la publicación:
- **Título (EN/ES)** - Título para el público
- **Slug** - Identificador de URL
- **Categoría** - `landing`, `blog`, `highlight`, `institutional`, `faq`
- **Experiencia** - Vinculación opcional a una Experiencia (no transfiere precios ni ranuras)

Las secciones de publicación se construyen usando bloques de contenido modular:
- `hero`, `text`, `gallery`, `highlights`, `faq`, `itinerary`, `testimonials`, `inclusions`, `restrictions`, `cta`, `video`

## Ciclo de Vida del Estado de Experiencia

```
draft -> published -> archived
```

| Estado | Visibilidad | Reserva |
|--------|-------------|---------|
| `draft` | Solo admin | No disponible |
| `published` | Catálogo público | Disponible para reserva |
| `archived` | Solo admin | No disponible, puede reactivarse |

## Comportamientos del Modo de Venta

| Modo de Venta | Acción del Cliente | Acción del Admin |
|---------------|--------------------|-------------------|
| `direct` | Reservar y pagar inmediatamente | Revisar órdenes completadas |
| `request` | Enviar consulta con detalles | Revisar solicitud, cotizar precio, convertir a orden |
| `assisted` | Contactar al admin directamente | Usar asistente de Venta Asistida para crear orden |
| `pass` | Usar créditos de pase existentes | Monitorear consumo de pases |

## Tipos de Cumplimiento

| Cumplimiento | Genera Ticket | Notas |
|--------------|----------------|-------|
| `ticket` | Sí - código QR | Flujo completo de check-in |
| `booking` | No | Solo confirmación simple |
| `pass` | No | Redención basada en créditos |
| `package` | Sí - uno por paquete | Redención de paquete |

## Resumen de Roles y Permisos

| Acción | Root | Admin | Operador | Cliente |
|--------|------|-------|----------|---------|
| Crear Experiencias | Sí | Sí | No | No |
| Editar Experiencias | Sí | Sí | No | No |
| Crear Ranuras | Sí | Sí | Sí | No |
| Ver Órdenes | Sí | Sí | Sí | Solo propias |
| Crear Ventas Asistidas | Sí | Sí | No | No |
| Gestionar Recursos | Sí | Sí | No | No |
| Ver Tickets | Sí | Sí | Sí | Solo propios |
| Check-in de Tickets | Sí | Sí | Sí | No |
| Editar Publicaciones | Sí | Sí | No | No |
| Acceder a Configuración | Sí | Sí | No | No |

## Obtener Ayuda

Si necesitas asistencia:
- Usa la navegación de la barra lateral para explorar secciones de documentación
- Consulta [Referencia - Glosario](../reference/glossary) para definiciones de terminología
- Revisa [Referencia - Solución de Problemas](../reference/troubleshooting) para soluciones de errores comunes