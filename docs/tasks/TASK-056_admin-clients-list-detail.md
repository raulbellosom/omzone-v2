# TASK-056: Admin — Gestión de clientes (listado + detalle)

## Objetivo

Implementar las páginas de gestión de clientes en el panel administrativo de OMZONE, reemplazando el placeholder "Próximamente". Al completar esta tarea, un admin puede listar usuarios registrados con label `client`, buscar por nombre o email, y ver el detalle de cada cliente con su historial de órdenes, tickets y pases.

## Contexto

- **Fase:** C — Admin: secciones faltantes (post-fase 15)
- **Documento maestro:** RF-10 (Portal de cliente), sección de gestión de usuarios
- **Estado actual:** La ruta `/admin/clients` renderiza `<AdminPlaceholder title="Clientes" />`. La collection `user_profiles` existe con atributos: `displayName`, `firstName`, `lastName`, `phone`, `language`, `photoId`, `bio`. **No existe collection `customers`** — los clientes se identifican por el label `client` en Appwrite Auth + su `user_profiles` document.
- **Hook existente:** `useCustomerSearch` existe — puede ser base para este módulo.
- **Referencia de patterns:** `OrderListPage` para listado con filtros.

## Alcance

Lo que SÍ incluye esta tarea:

1. **Página `ClientListPage`** en `/admin/clients`:
   - Listado de usuarios con label `client` (desde Appwrite Users API via Function o SDK admin)
   - Columnas: nombre, email, teléfono, fecha de registro, acciones
   - Búsqueda por nombre o email
   - Paginación (25 por página)
   - Mobile responsive: tabla → cards
2. **Página `ClientDetailPage`** en `/admin/clients/:userId`:
   - Datos del perfil: nombre, email, teléfono, idioma, fecha de registro
   - Avatar (si tiene `photoId`)
   - **Órdenes del cliente** — listado resumido con orderNumber, status, total, fecha (fetch `orders` con userId)
   - **Tickets del cliente** — listado resumido con ticketCode, experiencia, status (fetch `tickets` con userId)
   - **Pases del cliente** — listado resumido con tipo de pase, créditos restantes, status (fetch `passes` con userId)
   - Links desde cada item al detalle correspondiente (orden, ticket)
3. **Hook `useAdminClients`** — listar usuarios con label `client`, buscar, paginar.
4. **Hook `useClientDetail`** — fetch perfil + órdenes + tickets + pases por userId.
5. **Reemplazar placeholder** — eliminar ruta de `AdminPlaceholder` para clients en `App.jsx`.

## Fuera de alcance

- Crear clientes desde admin (vienen del registro público).
- Editar datos del cliente desde admin.
- Eliminar/desactivar clientes.
- Asignar o cambiar labels de usuario (TASK-008 existente).
- Gestión de operadores.
- Chat o comunicación directa con clientes.
- Export de clientes a CSV.

## Dominio

- [x] Usuario (perfiles, preferencias)
- [x] Frontend admin

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `user_profiles` | leer | Datos extendidos del perfil |
| `orders` | leer | Órdenes del cliente (por userId) |
| `tickets` | leer | Tickets del cliente (por userId) |
| `passes` | leer | Pases del cliente (por userId) |
| Appwrite Users | leer | Lista de usuarios con label `client` (email, registration date) |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna directa | — | Se usa Appwrite SDK con permisos admin para leer Users y collections. Nota: listar Users del Auth requiere API key server-side o Function. Si el frontend no puede listar Users, se crea un endpoint simple. |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `user_avatars` | leer | Avatar del cliente si existe |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `ClientListPage` | admin | crear | Listado con búsqueda y paginación |
| `ClientDetailPage` | admin | crear | Detalle con perfil + historial |
| `ClientOrdersTab` | admin | crear | Tab/sección con órdenes del cliente |
| `ClientTicketsTab` | admin | crear | Tab/sección con tickets del cliente |
| `ClientPassesTab` | admin | crear | Tab/sección con pases del cliente |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useAdminClients` | crear | Listar clientes con búsqueda y paginación |
| `useClientDetail` | crear | Fetch perfil + órdenes + tickets + pases |
| `useCustomerSearch` | evaluar/reutilizar | Hook existente — evaluar si se puede extender |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/clients` | admin | admin/root | Listado de clientes |
| `/admin/clients/:userId` | admin | admin/root | Detalle de cliente |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver listado de clientes | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver detalle de cliente | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

1. El admin navega a `/admin/clients`.
2. Ve tabla de clientes con nombre, email, teléfono, fecha de registro.
3. Puede buscar por nombre o email.
4. Hace click en un cliente para ver detalle.
5. En el detalle ve: información del perfil y tabs con órdenes, tickets y pases.
6. Puede navegar a detalles de orden o ticket desde los links en las tabs.

## Criterios de aceptación

- [ ] La ruta `/admin/clients` muestra listado de usuarios con label `client`.
- [ ] La búsqueda por nombre o email funciona.
- [ ] La paginación funciona (25 por página).
- [ ] El detalle `/admin/clients/:userId` muestra datos del perfil (nombre, email, teléfono).
- [ ] El detalle muestra las órdenes del cliente con orderNumber, status y total.
- [ ] El detalle muestra los tickets del cliente con ticketCode, experiencia y status.
- [ ] El detalle muestra los pases del cliente con tipo, créditos y status.
- [ ] Links de órdenes navegan a `/admin/orders/:orderId`.
- [ ] Links de tickets navegan a `/admin/tickets/:ticketId`.
- [ ] Usuarios root se excluyen del listado — `excludeGhostUsers()`.
- [ ] Solo admin/root pueden acceder (no operator).
- [ ] La tabla se transforma a cards en mobile (< 768px).
- [ ] Loading skeleton mientras carga.
- [ ] Empty state si no hay clientes registrados.
- [ ] `npm run build` pasa limpio.

## Validaciones de seguridad

- [ ] Solo admin/root pueden ver datos de clientes.
- [ ] Usuarios root se excluyen del listado si el viewer no es root.
- [ ] No se exponen contraseñas ni tokens de usuario.

## Dependencias

- **TASK-007:** Schema usuario — provee collection `user_profiles`.
- **TASK-008:** Function assign-user-label — gestiona labels.
- **TASK-022:** Admin orders — provee page de detalle de orden para links.
- **TASK-055:** Admin tickets — provee page de detalle de ticket para links.
- **TASK-010:** Admin layout.

## Bloquea a

- **TASK-060:** QA integral.

## Riesgos y notas

- **Listar Users de Appwrite Auth requiere API key server-side.** El SDK client no puede listar todos los usuarios. Opciones:
  1. Crear una Function admin-list-clients que usa server SDK para listar usuarios con label `client`.
  2. Usar `user_profiles` como fuente principal + datos del Auth del viewer para enriquecer.
  3. Usar la API con API key directamente (solo si el admin tiene la API key configurada).
  
  **Decisión recomendada:** Opción 2 — listar `user_profiles` como fuente principal, ya que cada cliente tiene un profile creado por la Function `assign-user-label`. Si se necesita email, se almacena también en `user_profiles` o se lee del SDK.
- Si `user_profiles` no tiene email, se puede agregar un atributo `email` a la collection.
- El hook `useCustomerSearch` existente (de venta asistida) ya tiene lógica de búsqueda de clientes. Evaluar reutilización.
