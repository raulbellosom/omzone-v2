---
title: Clientes
description: Cuentas y perfiles de clientes
section: system
order: 2
lastUpdated: 2026-04-25
---

# Clientes

Los clientes son cuentas de usuarios registrados en la plataforma OMZONE. Pueden iniciar sesión en el portal de clientes para ver pedidos, descargar tickets, gestionar pases y actualizar su información de perfil.

## Cliente vs Perfiles de Usuario

| Entidad | Descripción |
|---------|-------------|
| Usuario (Auth) | Cuenta de Appwrite Auth (email, contraseña, teléfono) |
| Perfil de Usuario | Datos de perfil extendidos (nombre, preferencias, notas) |

> **Separación de dominio:** Una cuenta de Usuario puede existir sin un Perfil de Usuario (ej. registros no verificados). Todos los clientes deben tener ambos registros de Usuario y Perfil de Usuario para funcionalidad completa.

## Campos del Cliente

### Campos del Perfil de Usuario

| Campo | Tipo | Descripción |
|-------|------|-------------|
| ID de Usuario | string | Referencia al ID de usuario de Appwrite |
| Nombre | string | Nombre completo para mostrar |
| Email | string | Dirección de email de contacto |
| Teléfono | string | Teléfono de contacto (formato E.164) |
| Avatar | file | Foto de perfil |
| Etiquetas | string[] | Etiquetas de rol (`client`, `admin`, `operator`, `root`) |
| Estado | enum | `active`, `inactive`, `suspended` |
| Creado En | datetime | Timestamp de registro |
| Actualizado En | datetime | Última actualización del perfil |
| Preferencias | JSON | Preferencias del usuario (locale, notificaciones) |
| Notas | string | Notas internas de admin |

### Atributos de Usuario de Appwrite

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Verificación de Email | boolean | Estado de verificación de email |
| Verificación de Teléfono | boolean | Estado de verificación de teléfono |
| Registro | datetime | Fecha de creación de la cuenta |
| Etiquetas | string[] | Etiquetas de seguridad |

## Etiquetas y Roles de Cliente

| Etiqueta | Acceso | Descripción |
|----------|--------|-------------|
| `root` | Sistema completo | Admin invisible (nunca mostrado como rol) |
| `admin` | Panel de admin | Acceso completo de admin |
| `operator` | Panel de admin | Acceso limitado de admin |
| `client` | Portal de clientes | Acceso estándar de cliente |

> **Los usuarios root son invisibles:** La etiqueta `root` se usa para administración del sistema y se filtra de todos los listados de usuarios vía `excludeGhostUsers()`. Tanto las etiquetas `root` como `admin` se muestran como "Admin" en la interfaz.

### Jerarquía de Etiquetas

```
root (invisible)
  └── admin
        └── operator
              └── client
```

## Ver Clientes

Navega a **Sistema → Clientes** para acceder a la lista de clientes.

### Filtrar Clientes

| Filtro | Opciones |
|--------|----------|
| Estado | Todos, activo, inactivo, suspendido |
| Etiquetas | Filtrar por etiqueta de rol |
| Rango de Fecha | Filtro de fecha de registro |
| Búsqueda | Nombre, email o teléfono |

### Columnas de Lista de Clientes

| Columna | Descripción |
|---------|-------------|
| Nombre | Nombre para mostrar del cliente |
| Email | Email de contacto |
| Teléfono | Teléfono de contacto |
| Rol | Nombre del rol mostrado |
| Estado | Estado de la cuenta |
| Registrado | Fecha de registro |
| Pedidos | Conteo total de pedidos |

## Página de Perfil del Cliente

### Secciones

**Información de Contacto:**
- Nombre, email, teléfono
- Insignias de verificación de email/teléfono
- Editar información de contacto

**Historial de Compras:**
- Conteo total de pedidos
- Total gastado
- Lista de pedidos recientes

**Pases Activos:**
- Pases actuales con créditos restantes
- Fechas de expiración
- Historial de uso de pases

**Historial de Tickets:**
- Tickets pasados
- Estado de check-in

**Notas:**
- Notas internas de admin (no visibles para el cliente)
- Editables por operadores y admins

### Acciones

| Acción | Permiso | Descripción |
|--------|---------|-------------|
| Editar Perfil | operator+ | Actualizar información de contacto |
| Ver Pedidos | operator+ | Ver todos los pedidos del cliente |
| Gestionar Pases | operator+ | Ver y ajustar créditos de pase |
| Agregar Notas | operator+ | Agregar notas internas |
| Suspender Cuenta | admin | Deshabilitar acceso del cliente |
| Eliminar Cuenta | admin | Remover cuenta permanentemente |

## Crear Clientes Manualmente

Los operadores pueden crear cuentas de cliente para reservas por teléfono o clientes que llegan:

1. Navega a **Sistema → Clientes**
2. Haz clic en **Crear Cliente**
3. Completa los campos requeridos:
   - Nombre Completo (requerido)
   - Email (requerido, único)
   - Teléfono (requerido, formato E.164)
4. Establece contraseña inicial (opcional)
5. Haz clic en **Crear**

> **Cuentas existentes:** Si el email o teléfono ya existe, el sistema previene la creación de duplicados. Busca primero para evitar errores.

## Gestionar Etiquetas de Cliente

### Agregar Etiquetas

1. Abre el perfil del cliente
2. Haz clic en la sección **Etiquetas**
3. Agrega etiqueta del menú desplegable (`client`, `operator`, `admin`)
4. Guarda los cambios

### Remover Etiquetas

1. Abre el perfil del cliente
2. Haz clic en la sección **Etiquetas**
3. Remueve la etiqueta
4. Guarda los cambios

> **No se puede remover el propio acceso de admin:** Los administradores no pueden degradarse a sí mismos por debajo del nivel de operador.

## Notas Internas

El campo de notas almacena observaciones internas sobre los clientes:

- Preferencias y solicitudes especiales
- Reportes de incidentes
- Designaciones VIP
- Historial de comunicación

> **Las notas son privadas:** Las notas internas solo son visibles para usuarios del panel de admin y nunca se muestran al cliente en el portal.

## Errores Comunes

- **Confundir etiquetas con permisos:** Verificar los permisos reales otorgados por una etiqueta, no solo el nombre de la etiqueta.
- **Eliminar clientes activos:** Eliminar un cliente con pedidos activos puede causar registros huérfanos. Archivar en su lugar.
- **Editar cliente equivocado:** Siempre confirmar el nombre del cliente antes de hacer cambios. Nombres similares pueden causar confusión.
- **Errores de formato de teléfono:** Los números de teléfono deben estar en formato E.164 (`+52 55 1234 5678`). Formatos inválidos fallarán la verificación por SMS.
- **No excluir usuarios fantasma:** Al listar usuarios para cualquier propósito, usar `excludeGhostUsers()` para filtrar cuentas root.

## Páginas Relacionadas

- [Pedidos](/docs/sales/orders) — Ver historial de compras del cliente
- [Pases](/docs/catalog/passes) — Gestionar pases y créditos del cliente
- [Tickets](/docs/system/tickets) — Ver historial de tickets del cliente