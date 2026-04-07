# TASK-009: Route guards por label — admin, operator, client, anónimo

## Objetivo

Refinar y completar el sistema de route guards de OMZONE para soportar múltiples labels, definir el árbol de rutas completo con protección por label, crear la página 403 Forbidden y garantizar que cada superficie (pública, admin, portal) solo es accesible por los roles correspondientes. Al completar esta tarea, las rutas del sistema están protegidas end-to-end: anónimos ven solo rutas públicas, `client` accede al portal, `admin`/`root`/`operator` acceden al panel, y los accesos no autorizados ven una página 403.

## Contexto

- **Fase:** 2 — Auth y roles
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 2
- **Documento maestro:** Sección 12 (Modelo de roles y permisos)
  - **RF-12.2:** Reglas generales de labels
  - **RF-12.3:** Reglas de implementación — rutas protegidas por labels, Functions validan labels
  - **RF-12.4:** El label `root` no se muestra como rol normal en UI
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Superficies y dominios consumidos (sección 4)
- **ADR relacionados:** ADR-002 (Labels como modelo de auth) — el frontend lee `user.labels` para guards de ruta

TASK-002 implementó `RequireAuth`, `RequireLabel` y `RedirectIfAuth` como guards iniciales. Esta tarea los refina para soportar el árbol completo de rutas y el acceso de `operator` al panel admin.

## Alcance

Lo que SÍ incluye esta tarea:

1. Refinar componente `RequireLabel` para aceptar array de labels y verificar que el usuario tenga al menos uno (OR lógico): `<RequireLabel labels={["admin", "root", "operator"]}>`.
2. Crear componente `ProtectedRoute` que combina `RequireAuth` + `RequireLabel` en un solo wrapper reutilizable.
3. Definir árbol de rutas completo:
   - `/` — público, sin auth
   - `/experiences`, `/experiences/:slug` — público, sin auth
   - `/login` — `RedirectIfAuth` (redirige según label si ya autenticado)
   - `/register` — `RedirectIfAuth`
   - `/admin/*` — requiere labels `admin` | `root` | `operator`
   - `/portal/*` — requiere labels `client` | `admin` | `root`
   - `/checkout` — requiere auth (cualquier label)
   - `/forbidden` — público (página 403)
   - `*` — NotFound (404)
4. Crear página `Forbidden` (403):
   - Mensaje claro: "No tienes permisos para acceder a esta sección"
   - Botón para volver al inicio
   - Diseño consistente con el shell de la app
5. Ajustar lógica de redirección en `RedirectIfAuth`:
   - Si `admin` o `root` → `/admin`
   - Si `operator` → `/admin`
   - Si `client` → `/portal`
   - Si autenticado sin label funcional → `/`
6. Garantizar que `root` obtiene el mismo acceso que `admin` en todos los guards sin exposición del label en UI.
7. Ajustar `Navbar` para mostrar links de navegación correctos según labels del usuario.

## Fuera de alcance

- Restricciones por módulo para `operator` dentro del admin panel (futuras tasks).
- Filtrado del sidebar admin por label (eso es TASK-010).
- Páginas funcionales de admin o portal (solo guards y routing tree).
- Permisos a nivel de API/colección en Appwrite (eso ya está en el schema).
- OAuth o login social.
- Middleware server-side (todo es client-side routing guards).

## Dominio

- [x] Configuración (settings, templates)
- [x] Usuario (perfiles, preferencias)
- Nota: clasificado como **Infraestructura + Usuario** en el plan maestro.

## Entidades / tablas implicadas

| Tabla                 | Operación | Notas                                        |
| --------------------- | --------- | -------------------------------------------- |
| Appwrite Auth (users) | leer      | Se leen `user.labels` para determinar acceso |

## Atributos nuevos o modificados

N/A — esta tarea no modifica atributos de base de datos.

## Functions implicadas

| Function | Operación | Notas                       |
| -------- | --------- | --------------------------- |
| Ninguna  | —         | Esta tarea es frontend-only |

## Buckets / Storage implicados

N/A — esta tarea no involucra Storage.

## Componentes frontend implicados

| Componente       | Superficie      | Operación | Notas                                          |
| ---------------- | --------------- | --------- | ---------------------------------------------- |
| `RequireLabel`   | infraestructura | modificar | Aceptar array de labels con OR lógico          |
| `ProtectedRoute` | infraestructura | crear     | Wrapper que combina RequireAuth + RequireLabel |
| `RedirectIfAuth` | infraestructura | modificar | Mejorar lógica de redirección por label        |
| `Forbidden`      | público         | crear     | Página 403 — acceso no autorizado              |
| `Navbar`         | público         | modificar | Ajustar links según labels del usuario         |

## Hooks implicados

| Hook      | Operación             | Notas                                                 |
| --------- | --------------------- | ----------------------------------------------------- |
| `useAuth` | leer (usar existente) | Se consulta `user`, `labels`, `hasLabel()`, `isAdmin` |

## Rutas implicadas

| Ruta                 | Superficie | Guard                                                 | Notas                                       |
| -------------------- | ---------- | ----------------------------------------------------- | ------------------------------------------- |
| `/`                  | público    | ninguno                                               | Home page                                   |
| `/experiences`       | público    | ninguno                                               | Catálogo de experiencias (futuro)           |
| `/experiences/:slug` | público    | ninguno                                               | Detalle de experiencia (futuro)             |
| `/login`             | público    | `RedirectIfAuth`                                      | Redirige si ya autenticado                  |
| `/register`          | público    | `RedirectIfAuth`                                      | Redirige si ya autenticado                  |
| `/admin/*`           | admin      | `ProtectedRoute labels={["admin","root","operator"]}` | Panel administrativo                        |
| `/portal/*`          | portal     | `ProtectedRoute labels={["client","admin","root"]}`   | Portal de cliente                           |
| `/checkout`          | público    | `RequireAuth`                                         | Requiere autenticación sin label específico |
| `/forbidden`         | público    | ninguno                                               | Página 403                                  |
| `*`                  | público    | ninguno                                               | Página 404 NotFound                         |

## Permisos y labels involucrados

| Acción                                         | root | admin | operator | client | anónimo |
| ---------------------------------------------- | ---- | ----- | -------- | ------ | ------- |
| Acceder a rutas públicas (`/`, `/experiences`) | ✅   | ✅    | ✅       | ✅     | ✅      |
| Acceder a `/admin/*`                           | ✅   | ✅    | ✅       | ❌     | ❌      |
| Acceder a `/portal/*`                          | ✅   | ✅    | ❌       | ✅     | ❌      |
| Acceder a `/checkout`                          | ✅   | ✅    | ✅       | ✅     | ❌      |
| Ver link a Admin en Navbar                     | ✅   | ✅    | ✅       | ❌     | ❌      |
| Ver link a Portal en Navbar                    | ✅   | ✅    | ❌       | ✅     | ❌      |

## Flujo principal

1. El usuario navega a una ruta protegida (ej: `/admin/experiences`).
2. El `ProtectedRoute` wrapper verifica si hay sesión activa (via `useAuth`).
3. Si no hay sesión → redirige a `/login`.
4. Si hay sesión → verifica si el usuario tiene al menos uno de los labels requeridos.
5. Si tiene el label → renderiza la ruta hija normalmente.
6. Si NO tiene el label → redirige a `/forbidden`.
7. La página `/forbidden` muestra mensaje claro y botón para volver al inicio.

## Criterios de aceptación

- [x] `RequireLabel` acepta prop `labels` como array y permite acceso si el usuario tiene al menos uno de los labels listados.
- [x] `ProtectedRoute` combina auth check + label check en un solo componente reutilizable.
- [x] Un usuario con label `admin` puede acceder a `/admin/*`.
- [x] Un usuario con label `root` puede acceder a `/admin/*` (mismo acceso que admin).
- [x] Un usuario con label `operator` puede acceder a `/admin/*`.
- [x] Un usuario con label `client` NO puede acceder a `/admin/*` y ve página 403.
- [x] Un usuario con label `client` puede acceder a `/portal/*`.
- [x] Un usuario con label `admin` o `root` puede acceder a `/portal/*`.
- [x] Un usuario anónimo que intenta acceder a `/admin/*` es redirigido a `/login`.
- [x] Un usuario anónimo que intenta acceder a `/portal/*` es redirigido a `/login`.
- [x] La página `/forbidden` muestra mensaje "No tienes permisos" y botón para volver al inicio.
- [x] `RedirectIfAuth` redirige admin/root a `/admin`, operator a `/admin`, client a `/portal`.
- [x] El label `root` nunca aparece como texto visible en Navbar ni en ningún componente de UI.
- [x] La Navbar muestra link a "Admin" para usuarios con label `admin`, `root` u `operator`.
- [x] La Navbar muestra link a "Mi Portal" para usuarios con label `client`.

## Validaciones de seguridad

- [x] Los guards verifican labels del objeto `user` retornado por Appwrite `account.get()`, no de localStorage ni de headers manipulables.
- [x] Si `user.labels` es undefined o no es array, se trata como usuario sin labels (acceso mínimo).
- [x] El label `root` NUNCA se muestra en la UI — si el usuario es root, se muestra como "Admin".
- [x] La página 403 no revela qué label se requiere para acceder (no exponer lógica de permisos).

## Dependencias

- **TASK-002:** Auth flow — login, registro, sesión y guards por label — provee `useAuth`, `RequireAuth`, `RequireLabel`, `RedirectIfAuth`, `Navbar`.
- **TASK-008:** Function assign-user-label — provee la asignación automática de labels para que los guards funcionen end-to-end con usuarios reales.

## Bloquea a

- **TASK-010:** Admin layout — sidebar, navigation, breadcrumbs, shell — necesita que las rutas `/admin/*` estén protegidas.
- **TASK-011+:** Todas las tasks de admin y portal dependen de que los guards estén completos.

## Riesgos y notas

- **Race condition con TASK-008:** Si la Function `assign-user-label` no ha ejecutado aún al momento del primer login post-registro, el usuario no tendrá label `client`. El guard debe manejar este caso sin crash — tratar como usuario autenticado sin label (redirigir a `/`).
- **Operator sin restricciones de módulo:** En esta tarea, `operator` accede a todo `/admin/*` igual que `admin`. Las restricciones por módulo se implementan en tasks futuras. Documentar esto como limitación conocida.
- **Root invisibilidad:** Verificar que en ningún punto de la UI (Navbar, perfil, guards de ruta, redirects) se muestre o se mencione el texto "root". Si un usuario root inspecciona la UI, debe ver "Admin" en todos los contextos.
- **Rutas placeholder:** Las rutas `/experiences`, `/experiences/:slug`, `/checkout`, `/portal/*` son placeholders que se implementan en tasks posteriores. Los guards deben estar en su lugar aunque las páginas sean placeholder.
