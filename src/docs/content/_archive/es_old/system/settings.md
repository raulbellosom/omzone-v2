---
title: Configuración
description: Configuración de la plataforma y preferencias
section: system
order: 4
lastUpdated: 2026-04-25
---

# Configuración

La página de Configuración contiene opciones de configuración en toda la plataforma que controlan el comportamiento del negocio, localización, integraciones y seguridad. La mayoría de la configuración requiere acceso a nivel admin para modificar.

## Configuración General

### Información del Negocio

| Campo | Descripción |
|-------|-------------|
| Nombre del Negocio | Nombre para mostrar de la empresa |
| Nombre Legal | Nombre de la entidad legal oficial |
| Email de Contacto | Email de contacto principal |
| Teléfono | Número de teléfono del negocio |
| Dirección | Dirección física |

### Marca

| Campo | Descripción |
|-------|-------------|
| Logo | Imagen del logo principal (variante clara) |
| Logo Oscuro | Logo para fondos oscuros |
| Favicon | Icono de la pestaña del navegador |
| Color Primario | Color de acento principal de la marca |
| Color Secundario | Color de acento secundario |

## Localización

| Campo | Opciones | Default |
|-------|---------|---------|
| Moneda Predeterminada | MXN, USD | MXN |
| Zona Horaria | America/Mexico_City, America/Cancun, America/Tijuana | America/Mexico_City |
| Formato de Fecha | DD/MM/YYYY, MM/DD/YYYY | DD/MM/YYYY |
| Formato de Hora | 12-hour, 24-hour | 24-hour |
| Locale Predeterminado | en, es | en |

> **Importancia de la zona horaria:** Los horarios de los slots se almacenan en la zona horaria configurada. Cambiar la zona horaria después de que existen reservas puede causar inconsistencias de visualización.

## Configuración de Reservas

### Reglas de Reserva

| Campo | Descripción |
|-------|-------------|
| Aviso Mínimo Previo | Horas antes del slot cuando se cierra la reserva |
| Reserva Máxima Anticipada | Días de anticipación con que los clientes pueden reservar |
| Ventana de Cancelación | Horas antes del slot cuando termina la cancelación gratuita |
| Política de Cancelación | Texto de política mostrado al finalizar compra |

### Configuración de Capacidad

| Campo | Descripción |
|-------|-------------|
| Capacidad Predeterminada | Máximo de asistentes por slot por defecto |
| Permitir Sobreventa | Permitir reservas más allá de la capacidad |
| Límite de Sobreventa | Porcentaje máximo de sobreventa |

### Valores Predeterminados de Experiencia

| Campo | Descripción |
|-------|-------------|
| Estado Predeterminado | Estado predeterminado para nuevas experiencias |
| Modo de Venta Predeterminado | Modo de venta predeterminado para nuevas experiencias |
| Auto-publicar Slots | Publicar automáticamente slots con la experiencia |

## Configuración de Pago

### Configuración de Moneda

| Campo | Descripción |
|-------|-------------|
| Moneda Predeterminada | Moneda principal para precios |
| Monedas Soportadas | MXN, USD |
| Conversión Automática | Convertir precios a la moneda de visualización |

### Integración Stripe

| Campo | Descripción |
|-------|-------------|
| Clave Publicable de Stripe | Clave publicable de la API de Stripe |
| Clave Secreta de Stripe | Clave secreta de la API de Stripe (oculta) |
| Secreto de Webhook | Secreto de firma de webhook de Stripe |
| Modo de Prueba | Alternar modo de prueba de Stripe |

> **Configuración de webhook:** Los webhooks de Stripe deben estar configurados en el dashboard de Stripe apuntando al endpoint de la Función de Appwrite para la reconciliación de pagos.

### Métodos de Pago

| Método | Estado |
|--------|--------|
| Tarjeta | Habilitado/Deshabilitado |
| Pagar en el Lugar | Habilitado/Deshabilitado |
| Transferencia Bancaria | Habilitado/Deshabilitado |

## Configuración de Notificaciones

### Plantillas de Email

Personalizar contenido de emails de notificación:

| Plantilla | Variables |
|-----------|-----------|
| Confirmación de Pedido | `{{customerName}}`, `{{orderId}}`, `{{items}}`, `{{total}}` |
| Recordatorio de Reserva | `{{customerName}}`, `{{experienceName}}`, `{{slotDateTime}}` |
| Aviso de Cancelación | `{{customerName}}`, `{{orderId}}`, `{{reason}}` |
| Expiración de Pase | `{{customerName}}`, `{{passName}}`, `{{expirationDate}}` |

### Timing de Recordatorios

| Recordatorio | Timing Predeterminado |
|--------------|----------------------|
| Recordatorio de 48 horas | Habilitado, 48 horas antes del slot |
| Recordatorio de 24 horas | Habilitado, 24 horas antes del slot |
| Recordatorio de 1 hora | Deshabilitado |

### Información del Remitente

| Campo | Descripción |
|-------|-------------|
| Nombre del Remitente | Nombre para mostrar del remitente del email |
| Email del Remitente | Email de envío verificado |
| Email de Respuesta | Dirección de respuesta |

## Configuración de Seguridad

### Política de Contraseña

| Campo | Default |
|-------|---------|
| Longitud Mínima | 8 caracteres |
| Requerir Mayúsculas | Sí |
| Requerir Números | Sí |
| Requerir Caracteres Especiales | No |
| Expiración de Contraseña | Nunca |

### Configuración de Sesión

| Campo | Default |
|-------|---------|
| Tiempo de Expiración de Sesión | 30 minutos |
| Sesiones Concurrentes Máximas | 3 |
| Recordar Dispositivo | Habilitado |

### Acceso de Admin

| Campo | Descripción |
|-------|-------------|
| 2FA Requerido | Requerir 2FA para cuentas de admin |
| Lista Blanca de IPs | Restringir acceso de admin a IPs |
| Registro de Auditoría | Registrar todas las acciones de admin |

## Información del Sistema

Ver estado de la plataforma e información de versión:

| Campo | Descripción |
|-------|-------------|
| Versión de Appwrite | Versión del servidor |
| Estado de la Base de Datos | Estado de la conexión |
| Estado del Almacenamiento | Conectividad del almacenamiento |
| Estado de la API | Salud del endpoint de la API |
| Última Despliegue | Timestamp de despliegue |

### Estado de Integración

| Servicio | Estado |
|----------|--------|
| Stripe | Conectado/Desconectado |
| Email | Configurado/No configurado |
| CDN | Activo/Inactivo |

## Configuración de Buckets

### Buckets de Almacenamiento

| Bucket | Permisos | Tipos de Archivo |
|--------|----------|-----------------|
| `experiences` | Lectura pública | jpg, png, webp, gif |
| `publications` | Lectura pública | jpg, png, webp, gif, mp4 |
| `avatars` | Lectura autenticada | jpg, png, webp, gif |
| `documents` | Escritura admin | pdf |
| `marketing` | Lectura pública | jpg, png, webp, gif, mp4 |

## Errores Comunes

- **Cambiar moneda afecta solo nuevos pedidos:** Los cambios de moneda no convierten retroactivamente pedidos existentes o niveles de precio.
- **Desajuste de zona horaria:** Si el negocio opera entre zonas horarias, asegurar que la zona horaria coincida con la ubicación principal para horarios precisos de slots.
- **Deshabilitar método de pago sin alternativas:** Siempre mantener al menos un método de pago habilitado.
- **Malconfiguración de URL de webhook:** Los webhooks de Stripe deben apuntar al endpoint correcto de la Función de Appwrite.
- **Remover requisito de 2FA:** Deshabilitar 2FA para admins compromete la seguridad. Mantener habilitado.

## Páginas Relacionadas

- [Pedidos](/docs/sales/orders) — La configuración de pago afecta el checkout
- [Experiencias](/docs/catalog/experiences) — La configuración predeterminada aplica a nuevas experiencias
- [Medios](/docs/system/media) — Configuración de buckets de almacenamiento