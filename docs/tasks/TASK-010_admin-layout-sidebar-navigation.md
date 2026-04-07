# TASK-010: Admin layout — sidebar, navigation, breadcrumbs, shell

## Objetivo

Implementar el layout completo del panel administrativo de OMZONE: sidebar de navegación con secciones de módulos, top bar con usuario y rol, sistema de breadcrumbs contextuales, área de contenido principal y comportamiento responsive con hamburger menu en mobile. Al completar esta tarea, el shell admin está funcional y listo para recibir las páginas CRUD de las tasks siguientes.

## Contexto

- **Fase:** 3 — CRUD admin básico
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 3
- **Documento maestro:** Sección 13.3 (Módulos funcionales — Admin / Operator)
  - Dashboard interno, experiencias, contenido editorial, agendas, precios, addons, paquetes, pases, órdenes, tickets, clientes, venta asistida, recursos, media, settings, auditoría
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Panel admin consume todos los dominios
- **ADR relacionados:** ADR-002 (Labels como modelo de auth) — `root` se oculta en UI, se muestra como "Admin"

TASK-001 creó un `AdminLayout` placeholder. Esta tarea lo reemplaza con un layout completo y funcional.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear componente `AdminLayout` completo con:
   - Sidebar fijo a la izquierda (desktop) con navegación por secciones
   - Top bar con nombre del usuario, label visible (nunca "root"), botón de logout
   - Área de contenido principal con `<Outlet />`
   - Sistema de breadcrumbs dinámicos
2. Sidebar con secciones de navegación:
   - **Dashboard** → `/admin`
   - **Experiencias** → `/admin/experiences`
   - **Ediciones** → `/admin/editions`
   - **Precios** → `/admin/pricing`
   - **Addons** → `/admin/addons`
   - **Paquetes** → `/admin/packages`
   - **Pases** → `/admin/passes`
   - **Agenda** → `/admin/slots`
   - **Recursos** → `/admin/resources`
   - **Órdenes** → `/admin/orders`
   - **Tickets** → `/admin/tickets`
   - **Clientes** → `/admin/clients`
   - **Publicaciones** → `/admin/publications`
   - **Media** → `/admin/media`
   - **Configuración** → `/admin/settings`
3. Mobile responsive:
   - Sidebar colapsa a hamburger menu en pantallas < 1024px
   - Overlay sidebar que se abre/cierra con animación
   - Backdrop overlay al abrir sidebar mobile
4. Breadcrumb component:
   - Muestra ruta actual como breadcrumb (ej: "Admin > Experiencias > Crear")
   - Cada segmento es clickeable y navega a esa ruta
5. Top bar:
   - Muestra nombre del usuario autenticado
   - Muestra label visible: "Admin" para admin y root, "Operador" para operator
   - Botón de logout
   - Hamburger toggle en mobile
6. Página `AdminDashboard` placeholder:
   - Título "Dashboard"
   - Mensaje placeholder: "Panel de administración de OMZONE"
   - Cards placeholder para métricas futuras
7. Destacar la sección activa en el sidebar (active state).
8. Estilo visual limpio, profesional, con TailwindCSS.

## Fuera de alcance

- Páginas CRUD reales (experiencias, ediciones, etc.) — tasks TASK-011 a TASK-015.
- Dashboard con métricas reales (ventas, tickets, ocupación).
- Filtrado del sidebar por label de operator (restricciones por módulo).
- Notificaciones o alertas en el top bar.
- Tema oscuro / claro.
- Breadcrumbs automáticos por react-router metadata (se implementa con contexto manual o helper).

## Dominio

- [x] Configuración (settings, templates)
- Nota: clasificado como **Frontend admin** en el plan maestro.

## Entidades / tablas implicadas

| Tabla                 | Operación | Notas                                                   |
| --------------------- | --------- | ------------------------------------------------------- |
| Appwrite Auth (users) | leer      | Se lee `user.name` y `user.labels` para top bar display |

## Atributos nuevos o modificados

N/A — esta tarea no modifica atributos de base de datos.

## Functions implicadas

| Function | Operación | Notas                       |
| -------- | --------- | --------------------------- |
| Ninguna  | —         | Esta tarea es frontend-only |

## Buckets / Storage implicados

N/A — esta tarea no involucra Storage.

## Componentes frontend implicados

| Componente       | Superficie | Operación                          | Notas                                                           |
| ---------------- | ---------- | ---------------------------------- | --------------------------------------------------------------- |
| `AdminLayout`    | admin      | modificar (reemplazar placeholder) | Layout completo con sidebar, top bar, breadcrumbs, content area |
| `AdminSidebar`   | admin      | crear                              | Sidebar de navegación con secciones y active states             |
| `AdminTopBar`    | admin      | crear                              | Top bar con user info, label, logout, hamburger toggle          |
| `Breadcrumbs`    | admin      | crear                              | Breadcrumb dinámico basado en ruta actual                       |
| `AdminDashboard` | admin      | modificar                          | Página dashboard placeholder con cards                          |

## Hooks implicados

| Hook             | Operación             | Notas                                                |
| ---------------- | --------------------- | ---------------------------------------------------- |
| `useAuth`        | leer (usar existente) | Se consulta `user.name` y `user.labels` para display |
| `useBreadcrumbs` | crear (opcional)      | Helper para generar breadcrumbs desde la ruta actual |

## Rutas implicadas

| Ruta                  | Superficie | Guard                                                 | Notas                  |
| --------------------- | ---------- | ----------------------------------------------------- | ---------------------- |
| `/admin`              | admin      | `ProtectedRoute labels={["admin","root","operator"]}` | Dashboard placeholder  |
| `/admin/experiences`  | admin      | heredado del parent                                   | Placeholder (TASK-011) |
| `/admin/editions`     | admin      | heredado                                              | Placeholder (TASK-012) |
| `/admin/pricing`      | admin      | heredado                                              | Placeholder (TASK-012) |
| `/admin/addons`       | admin      | heredado                                              | Placeholder (TASK-013) |
| `/admin/packages`     | admin      | heredado                                              | Placeholder futuro     |
| `/admin/passes`       | admin      | heredado                                              | Placeholder futuro     |
| `/admin/slots`        | admin      | heredado                                              | Placeholder (TASK-014) |
| `/admin/resources`    | admin      | heredado                                              | Placeholder (TASK-015) |
| `/admin/orders`       | admin      | heredado                                              | Placeholder futuro     |
| `/admin/tickets`      | admin      | heredado                                              | Placeholder futuro     |
| `/admin/clients`      | admin      | heredado                                              | Placeholder futuro     |
| `/admin/publications` | admin      | heredado                                              | Placeholder futuro     |
| `/admin/media`        | admin      | heredado                                              | Placeholder futuro     |
| `/admin/settings`     | admin      | heredado                                              | Placeholder futuro     |

## Permisos y labels involucrados

| Acción                              | root | admin | operator | client | anónimo |
| ----------------------------------- | ---- | ----- | -------- | ------ | ------- |
| Ver admin layout y sidebar          | ✅   | ✅    | ✅       | ❌     | ❌      |
| Ver label "Admin" en top bar        | ✅   | ✅    | ❌       | ❌     | ❌      |
| Ver label "Operador" en top bar     | ❌   | ❌    | ✅       | ❌     | ❌      |
| Ver todas las secciones del sidebar | ✅   | ✅    | ✅\*     | ❌     | ❌      |

\*Operator ve todas las secciones en esta tarea. Restricciones por módulo se implementan después.

## Flujo principal

1. Un usuario con label `admin`, `root` u `operator` accede a `/admin`.
2. El guard `ProtectedRoute` verifica auth y label — acceso permitido.
3. Se renderiza `AdminLayout` con sidebar a la izquierda y contenido a la derecha.
4. El top bar muestra el nombre del usuario y su rol visible ("Admin" o "Operador").
5. El sidebar muestra todas las secciones de navegación con la sección "Dashboard" activa.
6. El usuario hace click en "Experiencias" en el sidebar.
7. El sidebar marca "Experiencias" como activa y la breadcrumb se actualiza a "Admin > Experiencias".
8. Se renderiza el contenido de `/admin/experiences` (placeholder hasta TASK-011).
9. En mobile (< 1024px), el sidebar está colapsado. El usuario toca el hamburger.
10. El sidebar se abre como overlay con backdrop. El usuario navega y el sidebar se cierra.

## Criterios de aceptación

- [x] El `AdminLayout` renderiza sidebar, top bar y área de contenido con `<Outlet />`.
- [x] El sidebar muestra las 15 secciones de navegación listadas en el alcance.
- [x] La sección activa del sidebar tiene estilo diferenciado (highlight/active state).
- [x] El top bar muestra el nombre del usuario autenticado.
- [x] El top bar muestra "Admin" como label para usuarios con `admin` o `root`, y "Operador" para `operator`.
- [x] El label `root` NUNCA aparece como texto en el top bar ni en ningún otro lugar de la UI.
- [x] El botón de logout en el top bar cierra sesión y redirige a `/login`.
- [x] Las breadcrumbs reflejan la ruta actual (ej: "Admin > Experiencias > Crear").
- [x] En pantallas < 1024px, el sidebar colapsa y aparece un botón hamburger en el top bar.
- [x] Al tocar el hamburger, el sidebar se abre como overlay con animación y backdrop.
- [x] Al tocar el backdrop o navegar a otra sección, el sidebar mobile se cierra.
- [x] La página `/admin` muestra un dashboard placeholder con mensaje y cards vacías.
- [x] Todas las rutas del sidebar navegan sin recarga de página (SPA routing).
- [x] Si se accede a una subruta de admin no definida, se muestra NotFound dentro del admin layout.

## Validaciones de seguridad

- [x] El layout lee labels del objeto `user` de Appwrite (no de localStorage).
- [x] El label `root` se traduce a "Admin" en todos los puntos de display.
- [x] El botón de logout invoca `useAuth.logout()` que limpia la sesión correctamente.

## Dependencias

- **TASK-001:** Scaffold React + Vite + Tailwind — provee el proyecto base y `AdminLayout` placeholder.
- **TASK-009:** Route guards por label — provee `ProtectedRoute` y el routing tree de `/admin/*`.

## Bloquea a

- **TASK-011:** CRUD experiencias desde admin — primer CRUD real dentro del admin layout.
- **TASK-012:** CRUD ediciones y pricing tiers.
- **TASK-013:** CRUD addons y addon assignments.
- **TASK-014:** CRUD slots y agenda.
- **TASK-015:** CRUD resources y locations.

## Riesgos y notas

- **Secciones placeholder:** Todas las secciones del sidebar excepto Dashboard renderizan placeholder pages en esta tarea. El contenido real se implementa en TASK-011 a TASK-015 y tasks posteriores.
- **Breadcrumbs implementation:** Se puede implementar con un hook custom que parsea `useLocation().pathname` y genera los segmentos, o con un contexto de breadcrumbs que cada página setea. Ambos enfoques son válidos — usar el más simple.
- **Responsive breakpoint:** Se usa 1024px (lg en Tailwind) como breakpoint para sidebar colapsable. Esto es consistente con patterns de admin panels.
- **Operator acceso completo (temporal):** En esta tarea, operator ve todas las secciones del sidebar. Las restricciones de acceso por módulo para operator son una task futura y deben documentarse como limitación conocida.
- **Diseño no final:** El diseño del admin layout es funcional y limpio, no premium/editorial. El admin no necesita el mismo tratamiento visual que el sitio público.
