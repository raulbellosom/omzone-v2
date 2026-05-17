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

| Label      | Nombre a Mostrar | Nivel de Acceso                                   |
| ---------- | ---------------- | ------------------------------------------------- |
| `root`     | Admin            | Acceso completo al sistema, invisible en listados |
| `admin`    | Admin            | Acceso completo a todas las funciones de admin    |
| `operator` | Operador         | Acceso programado a operaciones y ventas          |
| `client`   | Cliente          | Acceso solo al portal, sin admin                  |

> **Importante:** El label `root` es invisible en toda la plataforma. Los usuarios root nunca aparecen en listados de clientes u órdenes, y root nunca se muestra como nombre de rol. Al mostrar roles, siempre usa "Admin" para ambos labels root y admin.

## Estructura de Navegación del Admin

La barra lateral contiene siete secciones principales:

### General

- **Dashboard** (`/admin/dashboard`) - Resumen de órdenes, ingresos, próximos horarios y solicitudes pendientes
- **Mi Cuenta** (`/admin/account`) - Perfil y configuración de seguridad

### Catálogo

- **Experiencias** (`/admin/experiences`) - Ofertas principales de bienestar (sesiones, inmersiones, retiros, estadías)
- **Complementos** (`/admin/addons`) - Extras opcionales que pueden adjuntarse a experiencias
- **Paquetes** (`/admin/packages`) - Experiencias打包adas con precio fijo
- **Pases** (`/admin/passes`) - Pases de crédito consumibles para visitas repetidas

### Operaciones

- **Agenda** (`/admin/agenda`) - Vista global de todos los horarios programados en todas las experiencias
- **Recursos** (`/admin/resources`) - Instructores, facilitadores, terapeutas, equipos, ubicaciones y salas

### Ventas

- **Solicitudes** (`/admin/booking-requests`) - Consultas de reserva entrantes para experiencias en modo "Por solicitud"
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

| Aspecto          | Experiencia                            | Publicación                        |
| ---------------- | -------------------------------------- | ---------------------------------- |
| **Propósito**    | Operacional, comercial                 | Editorial, SEO, narrativa          |
| **Contiene**     | Niveles de precio, ediciones, horarios | Secciones con bloques de contenido |
| **Visibilidad**  | Disponibilidad y reserva               | Páginas de landing y blog          |
| **Se vincula a** | Complementos, horarios, recursos       | Experiencia vía su publicación     |

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

- **Nombre interno** - Solo para ti, el cliente no lo ve
- **Nombre público (EN/ES)** - El nombre que verá el cliente en ambos idiomas
- **Slug (URL)** - Dirección web de la experiencia (se genera automáticamente)
- **Tipo** - Sesión, Inmersión, Retiro, Estancia, Privada o Paquete
- **Modo de venta** - Directa (pago inmediato), Por solicitud (confirmas tú), Asistida (el admin crea la orden), Por pase (requiere pase activo)
- **Tipo de entrega** - Ticket (genera código QR), Reserva (sin ticket), Pase, Paquete

Configura los comportamientos:

- **Requiere selección de horario** - Activar si el cliente debe elegir una fecha/hora específica
- **Genera tickets después de la compra** - Activar para crear tickets con código QR al comprar
- **Permite múltiples asistentes** - Activar para compras grupales con cantidad mín/máx

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

- **Nombre (EN/ES)** - Cómo aparece este precio al cliente (ej., "Early Bird", "Precio Regular")
- **Tipo de precio** - Precio fijo, Por persona, Por grupo, Desde, Cotización
- **Precio base** - El monto en números
- **Moneda** - MXN o USD
- **Badge** - Etiqueta opcional como "Más popular" o "¡Solo por hoy!"
- **Destacado** - Mostrarlo resaltado visualmente
- **Edición** - Vinculación opcional a una edición específica

### Paso 4: Agregar Horarios (Si se Requiere)

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Horarios -> Nuevo horario**

Campos del horario:

- **Tipo de horario** - Sesión individual, Multi-día, Día de retiro, Privado
- **Fecha y hora de inicio/fin** - Fecha, hora y zona horaria
- **Capacidad** - Máximo de participantes
- **Ubicación** - Espacio físico donde ocurre
- **Sala** - Sala específica dentro de la ubicación
- **Estado** - Borrador (no visible) o Publicado (disponible para reservar)

Para horarios recurrentes, usa **Creación Rápida** para generar múltiples horarios con un patrón.

### Paso 5: Asignar Recursos (Opcional)

Navega a **Catálogo -> Experiencias -> [Nombre de Experiencia] -> Horarios -> [Nombre de Horario] -> Recursos**

Los recursos pueden asignarse a horarios con roles:

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
- **Experiencia** - Vinculación opcional a una Experiencia (no transfiere precios ni horarios)

Las secciones de publicación se construyen usando bloques de contenido modular:

- `hero`, `text`, `gallery`, `highlights`, `faq`, `itinerary`, `testimonials`, `inclusions`, `restrictions`, `cta`, `video`

## Ciclo de Vida del Estado de Experiencia

Borrador → Publicada → Archivada

| Estado        | Visibilidad             | Reserva                          |
| ------------- | ----------------------- | -------------------------------- |
| **Borrador**  | Solo el equipo de admin | No disponible                    |
| **Publicada** | Catálogo público        | Disponible para reservar         |
| **Archivada** | Solo el equipo de admin | No disponible, puede reactivarse |

## Comportamientos del Modo de Venta

| Modo de Venta     | Acción del Cliente              | Acción del Admin                                     |
| ----------------- | ------------------------------- | ---------------------------------------------------- |
| **Directa**       | Reservar y pagar inmediatamente | Revisar órdenes completadas                          |
| **Por solicitud** | Enviar consulta con detalles    | Revisar solicitud, cotizar precio, convertir a orden |
| **Asistida**      | Contactar al admin directamente | Usar Venta Asistida para crear la orden              |
| **Por pase**      | Usar créditos de su pase activo | Monitorear consumo de pases                          |

## Tipos de Entrega

| Tipo de entrega | Genera Ticket        | Notas                                                |
| --------------- | -------------------- | ---------------------------------------------------- |
| **Ticket**      | Sí — código QR       | El cliente recibe un ticket escaneable para check-in |
| **Reserva**     | No                   | Solo confirmación de reserva                         |
| **Pase**        | No                   | Se descuenta del pase del cliente                    |
| **Paquete**     | Sí — uno por paquete | Redención de paquete                                 |

## Resumen de Roles y Permisos

| Acción                  | Root | Admin | Operador | Cliente      |
| ----------------------- | ---- | ----- | -------- | ------------ |
| Crear Experiencias      | Sí   | Sí    | No       | No           |
| Editar Experiencias     | Sí   | Sí    | No       | No           |
| Crear Horarios          | Sí   | Sí    | Sí       | No           |
| Ver Órdenes             | Sí   | Sí    | Sí       | Solo propias |
| Crear Ventas Asistidas  | Sí   | Sí    | No       | No           |
| Gestionar Recursos      | Sí   | Sí    | No       | No           |
| Ver Tickets             | Sí   | Sí    | Sí       | Solo propios |
| Check-in de Tickets     | Sí   | Sí    | Sí       | No           |
| Editar Publicaciones    | Sí   | Sí    | No       | No           |
| Acceder a Configuración | Sí   | Sí    | No       | No           |

## Obtener Ayuda

Si necesitas asistencia:

- Usa la navegación de la barra lateral para explorar secciones de documentación
- Consulta [Referencia - Glosario](../reference/glossary) para definiciones de terminología
- Revisa [Referencia - Solución de Problemas](../reference/troubleshooting) para soluciones de errores comunes
