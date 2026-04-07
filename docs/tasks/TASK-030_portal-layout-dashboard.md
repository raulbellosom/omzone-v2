# TASK-030: Portal layout — navegación, dashboard, shell

## Objetivo

Implementar el layout shell del portal de cliente con navegación, dashboard resumen y estructura base para las secciones internas. Al completar esta tarea, un usuario con label `client` puede acceder a su portal, ver un dashboard con resumen de actividad y navegar entre las secciones del portal (órdenes, tickets, pases, perfil) con una estética premium consistente con el sitio público.

## Contexto

- **Fase:** 9 — Portal de cliente
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 9
- **Documento maestro:** Sección 3.2 (Portal de cliente), RF-12 (Portal de cliente)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `orders` (6.1), `tickets` (6.4), `user_passes` (6.7), `user_profiles` (7.1)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Portal cliente: Transaccional (read own), Usuario (read/write own)

## Alcance

Lo que SÍ incluye esta tarea:

1. **PortalLayout component:**
   - Shell layout con header y navigation.
   - Desktop: sidebar with links to Dashboard, Mis Órdenes, Mis Tickets, Mis Pases, Mi Perfil.
   - Mobile: bottom tab bar or collapsible hamburger nav.
   - User info display: name, avatar (from `user_profiles`), email.
   - Logout button.
   - Premium/wellness aesthetic consistent with public site (not generic admin feel).

2. **Dashboard** (`/portal`):
   - Welcome message with user's displayName.
   - Upcoming reservations widget: next 3 upcoming bookings/tickets (by slot startDatetime, status = active).
   - Active tickets count: badge with total active tickets.
   - Active passes count: badge with total active user_passes with remaining credits.
   - Quick links: "Ver mis tickets", "Ver mis órdenes", "Ver mis pases".
   - Empty state: if no activity, show welcoming message and CTA to explore experiences.

3. **Route structure:**
   - `/portal` — Dashboard (default)
   - `/portal/orders` — placeholder (TASK-031)
   - `/portal/orders/:orderId` — placeholder (TASK-031)
   - `/portal/tickets` — placeholder (TASK-032)
   - `/portal/tickets/:ticketId` — placeholder (TASK-032)
   - `/portal/passes` — placeholder (TASK-033)
   - `/portal/passes/:userPassId` — placeholder (TASK-033)
   - `/portal/profile` — placeholder (TASK-034)

4. **Guard:** All `/portal/*` routes require label `client` (or `admin`/`root` for inspection).

## Fuera de alcance

- Actual data pages for orders, tickets, passes, profile — TASK-031 through TASK-034.
- Notification center / activity feed.
- Favorites or wishlist.
- Settings or preferences (beyond profile).
- Dark mode.
- Portal for operators (admin panel serves that).

## Dominio

- [x] Frontend portal
- [x] Usuario (perfiles, preferencias)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `tickets` | leer | Count active tickets for dashboard widget |
| `user_passes` | leer | Count active passes for dashboard widget |
| `user_profiles` | leer | Display user name and avatar |
| `bookings` | leer | Upcoming reservations widget |
| `slots` | leer | Get startDatetime for upcoming reservations |

## Atributos nuevos o modificados

N/A — se leen atributos existentes.

## Functions implicadas

N/A.

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| `user_avatars` | leer | User avatar photo display (si existe) |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `PortalLayout` | portal | crear | Shell layout con nav, sidebar/tabs |
| `PortalSidebar` | portal | crear | Sidebar desktop con links y user info |
| `PortalBottomTabs` | portal | crear | Bottom tab bar para mobile |
| `PortalDashboard` | portal | crear | Dashboard resumen |
| `UpcomingReservations` | portal | crear | Widget de próximas reservas |
| `ActivitySummary` | portal | crear | Badges de tickets y pases activos |
| `UserAvatar` | compartido | crear | Componente de avatar reutilizable |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `usePortalDashboard` | crear | Fetch dashboard data: upcoming, counts |
| `useUserProfile` | crear | Leer perfil del usuario autenticado |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/portal` | portal | `client` | Dashboard |
| `/portal/orders` | portal | `client` | Placeholder para TASK-031 |
| `/portal/tickets` | portal | `client` | Placeholder para TASK-032 |
| `/portal/passes` | portal | `client` | Placeholder para TASK-033 |
| `/portal/profile` | portal | `client` | Placeholder para TASK-034 |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Acceder al portal | ✅ | ✅ | ❌ | ✅ | ❌ |
| Ver dashboard | ✅ | ✅ | ❌ | ✅ | ❌ |
| Ver datos propios | ✅ | ✅ | ❌ | ✅ (solo propios) | ❌ |

## Flujo principal

1. Usuario autenticado con label `client` navega a `/portal`.
2. Guard verifica label; si no tiene `client` (ni `admin`/`root`) → redirect a landing o login.
3. Se renderiza `PortalLayout` con sidebar (desktop) o bottom tabs (mobile).
4. Dashboard carga:
   a. Lee `user_profiles` por userId → muestra nombre y avatar.
   b. Query `tickets` donde `userId = current` y `status = "active"` → cuenta.
   c. Query `user_passes` donde `userId = current` y `status = "active"` → cuenta.
   d. Query `bookings` + `slots` donde `userId = current` y `startDatetime` futuro → próximas 3 reservas.
5. Dashboard muestra: bienvenida, próximas reservas, badges de actividad, quick links.
6. Si no hay actividad → empty state con CTA "Explorar experiencias".
7. Navigation links a secciones (placeholder pages con "Próximamente" hasta TASK-031-034).

## Criterios de aceptación

- [x] El layout del portal tiene sidebar en desktop (≥ 1024px) con links a Dashboard, Órdenes, Tickets, Pases, Perfil.
- [x] El layout del portal tiene bottom tabs o collapsible nav en mobile (< 640px).
- [x] El sidebar muestra el nombre del usuario y avatar (o placeholder si no tiene foto).
- [x] El dashboard muestra un mensaje de bienvenida con el displayName del usuario.
- [x] El dashboard muestra las próximas 3 reservas (fecha, experiencia) si las tiene.
- [x] El dashboard muestra un badge con la cuenta de tickets activos.
- [x] El dashboard muestra un badge con la cuenta de pases activos con créditos restantes.
- [x] Si el usuario no tiene actividad, se muestra un empty state con CTA "Explorar experiencias".
- [x] El botón de logout funciona y redirige a la landing pública.
- [x] Un usuario sin label `client` que navega a `/portal` es redirigido.
- [x] Las rutas placeholder (`/portal/orders`, `/portal/tickets`, etc.) renderizan una página con mensaje "Próximamente".
- [x] El portal tiene estética premium/wellness, no apariencia de admin panel genérico.
- [x] La transición entre secciones es fluida (no recarga completa de página).
- [x] El layout es responsive: sidebar collapsa o desaparece en tablet (768px), bottom tabs en mobile.

## Validaciones de seguridad

- [x] Route guard verifica label `client` antes de renderizar el portal.
- [x] Las queries de dashboard filtran estrictamente por `userId` del usuario autenticado.
- [x] No se muestran datos de otros usuarios en el dashboard.
- [x] El avatar se carga desde Storage con permisos del usuario autenticado.

## Dependencias

- **TASK-001:** Scaffold proyecto — routing base, Appwrite SDK.
- **TASK-009:** Route guards — guard por label `client`.
- **TASK-007:** Schema usuario — provee `user_profiles`.

## Bloquea a

- **TASK-031:** Mis órdenes y detalle — requiere PortalLayout.
- **TASK-032:** Mis tickets — requiere PortalLayout.
- **TASK-033:** Mis pases y consumos — requiere PortalLayout.
- **TASK-034:** Perfil del cliente — requiere PortalLayout.

## Riesgos y notas

- **Aesthetic consistency:** El portal de cliente NO debe verse como un panel admin. Debe tener una estética premium, editorial, wellness. Considerar: colores cálidos, tipografía elegante, spacing generoso, imágenes de fondo sutiles.
- **Data loading:** El dashboard hace múltiples queries (tickets, passes, bookings). Considerar un hook `usePortalDashboard` que combine todas las queries y maneje loading states individuales.
- **Upcoming reservations:** "Upcoming" se define como bookings cuyo slot tiene `startDatetime` en el futuro. Ordenar por `startDatetime` ASC y limitar a 3.
- **Empty state design:** El empty state es la primera impresión para un cliente nuevo. Debe ser acogedor, no un mensaje de error. Incluir ilustración wellness o mensaje aspiracional.
- **Label `admin` en portal:** Los administradores deben poder acceder al portal (para debugging/impersonación), pero el guard debe ser permisivo: `client OR admin OR root`.
