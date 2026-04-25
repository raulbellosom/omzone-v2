---
title: Glosario
description: Términos clave y definiciones
section: reference
order: 1
lastUpdated: 2026-04-25
---

# Glosario

Este glosario define los términos y conceptos clave utilizados en toda la plataforma OMZONE.

## A

### Addon

Extras opcionales que mejoran una reservación. Los addons pueden ser requeridos (incluidos automáticamente), predeterminados (pre-seleccionados pero removibles), u opcionales (disponibles para agregar).

| Tipo | Comportamiento |
|------|----------------|
| `service` | Tratamientos de spa, sesiones de terapia |
| `transport` | Traslados al aeropuerto, transporte |
| `food` | Comidas, catering |
| `accommodation` | Noches de hotel, alojamiento |
| `equipment` | Equipo de alquiler, materiales |
| `other` | Extras diversos |

### Agenda

La capa operacional que contiene slots, recursos y ubicaciones que definen cuándo y dónde están disponibles las experiencias.

### Venta Asistida

Pedido creado por admin en nombre de un cliente. Usado para reservas por teléfono, ventas en persona, reservaciones complimentary y reservas corporativas.

## B

### Solicitud de Reserva

Consulta para experiencias con `saleMode: request` que requieren revisión y aprobación del admin antes de la confirmación. Los clientes envían solicitudes que los operadores revisan, cotizan precios y aprueban o rechazan.

| Estado | Descripción |
|--------|-------------|
| `pending` | Esperando revisión |
| `reviewing` | Bajo revisión del admin |
| `approved` | Aprobado con precio cotizado |
| `rejected` | Rechazado por el admin |
| `converted` | Convertido a pedido de venta asistida |

## C

### Cliente

Cuenta de cliente con acceso al portal. Los clientes pueden ver pedidos, descargar tickets, gestionar pases y actualizar su perfil.

### Colección

Tabla de base de datos de Appwrite. Las colecciones contienen documentos con atributos tipados.

### Contenido

La capa editorial que contiene publicaciones y secciones. Las publicaciones proporcionan la narrativa pública y contenido SEO separado de las operaciones comerciales.

## D

### Separación de Dominio

Principio arquitectónico de OMZONE que separa preocupaciones:

| Capa | Contenido | Propósito |
|------|-----------|-----------|
| Editorial | Publicaciones, Secciones, Etiquetas | SEO, narrativa de marketing |
| Comercial | Experiencias, Ediciones, Niveles de Precio, Addons, Paquetes | Precios, operaciones |
| Agenda | Slots, Recursos, Ubicaciones | Programación, capacidad |
| Transaccional | Pedidos, Tickets, Consumos de Pase | Registros de compra inmutables |
| Usuario | Perfiles de Usuario, Registros de Actividad | Cuentas, auditoría |

## E

### Edición

Variación basada en tiempo de una Experiencia con su propio rango de fechas, capacidad y precios. Las ediciones permiten que la misma experiencia se ejecute múltiples veces (ej. "Primavera 2026", "Verano 2026").

| Campo | Descripción |
|-------|-------------|
| Nombre | Identificador de la edición |
| Fecha de Inicio | Inicio de la edición |
| Fecha de Fin | Fin de la edición |
| Inicio de Registro | Cuando abre el registro |
| Fin de Registro | Cuando cierra el registro |
| Capacidad | Máx. asistentes |
| Estado | `draft`, `open`, `closed`, `completed`, `cancelled` |

### Experiencia

Oferta central disponible para reservación. La unidad comercial con precios, disponibilidad y reglas de cumplimiento.

| Tipo | Descripción |
|------|-------------|
| `session` | Sesión única (ej. clase de yoga) |
| `immersion` | Sesión extendida (ej. baño de sonido) |
| `retreat` | Programa de múltiples días |
| `stay` | Experiencia basada en alojamiento |
| `private` | Reservación privada |
| `package` | Experiencias agrupadas |

### Pestañas de Experiencia

| Pestaña | Descripción |
|---------|-------------|
| Detalles | Campos principales, clasificación, imágenes |
| Niveles de Precio | Puntos de precio y precios por edición |
| Slots | Programación de disponibilidad |
| Addons | Asignaciones de addons |
| Publicaciones | Publicaciones vinculadas |
| SEO | Configuración de motores de búsqueda |

## F

### Tipo de Cumplimiento

Define cómo se entrega la reservación.

| Tipo | Descripción |
|------|-------------|
| `ticket` | Genera tickets con código QR para check-in |
| `booking` | Reservación confirmada sin tickets |
| `pass` | Activa créditos de pase |
| `package` | Seguimiento de cumplimiento agrupado |

## G

### Usuario Fantasma

Usuarios de Appwrite a nivel root que deben ser excluidos de los listados. La etiqueta `root` identifica a los usuarios fantasma.

## L

### Etiqueta

Etiqueta de permiso de Appwrite adjunta a usuarios para control de acceso basado en roles.

| Etiqueta | Acceso |
|----------|--------|
| `root` | Sistema completo (invisible) |
| `admin` | Acceso al panel de admin |
| `operator` | Acceso limitado de admin |
| `client` | Acceso al portal de clientes |

## O

### Pedido

Compra de cliente que contiene uno o más artículos de línea. Los pedidos almacenan instantáneas congeladas de datos de precios y experiencias para precisión histórica.

| Estado | Descripción |
|--------|-------------|
| `pending` | Esperando pago |
| `paid` | Pago confirmado |
| `confirmed` | Cumplimiento iniciado |
| `completed` | Todos los artículos consumidos |
| `cancelled` | Pedido cancelado |
| `refunded` | Pago reembolsado |

### Artículo de Línea del Pedido

Artículo individual en un pedido con datos de instantánea congelada:

| Campo | Descripción |
|-------|-------------|
| Tipo de Artículo | `experience`, `package`, `pass`, `addon` |
| ID del Artículo | Referencia al artículo comprado |
| Instantánea | Datos congelados al momento de la compra |
| Cantidad | Unidades compradas |
| Precio Unitario | Precio al momento de la compra |
| Subtotal | Total de la línea |

## P

### Paquete

Conjunto de experiencias y/o addons vendidos a un precio combinado con descuento. Los paquetes agrupan múltiples artículos juntos.

| Tipo de Artículo | Descripción |
|------------------|-------------|
| `experience` | Slot de experiencia incluida |
| `addon` | Addon incluido |
| `benefit` | Beneficio o servicio incluido |
| `accommodation` | Inclusión de alojamiento |
| `meal` | Inclusión de comida |

### Pase

Suscripción que permite múltiples reservaciones dentro de un período de validez. Los pases tienen créditos que se consumen cuando se usan.

| Estado | Descripción |
|--------|-------------|
| `active` | Válido y usable |
| `exhausted` | Todos los créditos consumidos |
| `expired` | Período de validez pasado |
| `cancelled` | Cancelado manualmente |

### Consumo de Pase

Registro del uso de crédito de pase cuando una reservación usa créditos de pase.

| Campo | Descripción |
|-------|-------------|
| ID del Pase de Usuario | Referencia al pase padre |
| ID del Pedido | Pedido asociado |
| Créditos Consumidos | Número de créditos usados |
| Rol | Contexto de uso |

### Nivel de Precio

Punto de precio para una Experiencia. Los niveles pueden ser específicos por edición y soportar múltiples tipos de precio.

| Tipo de Precio | Descripción |
|----------------|-------------|
| `fixed` | Tarifa plana independiente de los asistentes |
| `perPerson` | Tarifa multiplicada por el número de personas |
| `perGroup` | Tarifa para todo el grupo |
| `from` | Precio inicial para precio variable |
| `quote` | Precio personalizado ingresado por el operador |

### Publicación

Capa de contenido editorial/SEO para el sitio web público. Las publicaciones existen separadamente de las Experiencias y proporcionan la narrativa, imágenes y contenido SEO.

| Categoría | Caso de Uso |
|-----------|-------------|
| `landing` | Páginas de destino principales |
| `blog` | Artículos editoriales |
| `highlight` | Contenido destacado |
| `institutional` | Acerca de, políticas |
| `faq` | Páginas de preguntas frecuentes |

## R

### Recurso

Persona o equipo asignado a slots para gestión de disponibilidad y capacidad.

| Tipo | Descripción |
|------|-------------|
| `instructor` | Maestro/facilitador principal |
| `facilitator` | Facilitador de apoyo |
| `therapist` | Proveedor de terapia |
| `equipment` | Recurso de equipo |

### Rol de Asignación de Recurso

Rol de un recurso asignado dentro de un slot:

| Rol | Descripción |
|-----|-------------|
| `lead` | Persona asignada principal |
| `assistant` | Persona de apoyo |
| `support` | Soporte adicional |
| `equipment` | Provisión de equipo |

### Rol

Permiso basado en etiquetas que determina el nivel de acceso. Ver Etiqueta.

## S

### Modo de Venta

Cómo los clientes compran la experiencia.

| Modo | Descripción |
|------|-------------|
| `direct` | Compra inmediata |
| `request` | Requiere aprobación de solicitud de reserva |
| `assisted` | Venta por teléfono/en persona asistida por admin |
| `pass` | Requiere pase activo |

### Sección

Bloque de contenido modular dentro de una Publicación.

| Tipo | Descripción |
|------|-------------|
| `hero` | Encabezado de ancho completo |
| `text` | Contenido de texto rico |
| `gallery` | Cuadrícula de imágenes |
| `highlights` | Experiencias destacadas |
| `faq` | Acordeón de preguntas y respuestas |
| `itinerary` | Programa día por día |
| `testimonials` | Citas de clientes |
| `inclusions` | Lista de elementos incluidos |
| `restrictions` | Lista de exclusiones |
| `cta` | Llamada a la acción |
| `video` | Video embebido |

### Slot

Instancia de fecha/hora específica cuando una Experiencia está disponible para reservación.

| Tipo | Descripción |
|------|-------------|
| `singleSession` | Sesión única |
| `multiDay` | Múltiples días consecutivos |
| `retreatDay` | Día dentro de un retiro |
| `private` | Reservación privada |

| Estado | Descripción |
|--------|-------------|
| `draft` | No publicado aún |
| `published` | Disponible para reservación |
| `full` | En capacidad máxima |
| `cancelled` | Cancelado |

### Instantánea

Copia JSON de datos de precio/experiencia almacenada al momento de la compra. Las instantáneas aseguran precisión histórica independientemente de cambios futuros.

### Información del Sistema

Estado de la plataforma y datos de versión mostrados en admin para monitoreo.

## T

### Ticket

Confirmación de reservación con código QR para validación de check-in. Los tickets se generan para experiencias con `fulfillmentType: ticket`.

| Estado | Descripción |
|--------|-------------|
| `pending` | Esperando confirmación |
| `confirmed` | Válido y listo |
| `used` | Check-in realizado |
| `cancelled` | Ticket cancelado |
| `expired` | Fecha del slot pasada |

### Validación de Ticket

Proceso de verificar autenticidad y elegibilidad del ticket para check-in. Valida:
- El ticket existe y es válido
- El estado es `confirmed`
- El pago del pedido es `paid` o `confirmed`
- La fecha/hora del slot coincide
- No se ha hecho check-in previamente

## U

### Pase de Usuario

Pase comprado y activado por un cliente. Vincula la definición del pase al usuario comprador.

### Perfil de Usuario

Datos de perfil extendidos para usuarios de Appwrite incluyendo nombre, teléfono, preferencias y notas internas.