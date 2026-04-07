# TASK-002: Auth flow — login, registro, sesión y guards por label

## Objetivo

Implementar el flujo completo de autenticación de OMZONE: login por email/password, registro de nuevos usuarios, persistencia de sesión, lectura de labels del usuario autenticado, y protección de rutas según labels (`admin`, `operator`, `client`, `root`). Al completar esta tarea, un usuario puede registrarse, iniciar sesión, cerrar sesión, y las rutas del sistema están protegidas según el label del usuario.

## Contexto

- **Fase:** 0 — Setup del proyecto
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 0
- **Documento maestro:** Sección 12 (Modelo de roles y permisos), especialmente:
  - **RF-12.2:** Reglas generales de labels (`root`, `admin`, `operator`, `client`)
  - **RF-12.3:** Reglas de implementación (frontend lee sesión + labels, rutas protegidas por labels, Functions validan labels)
  - **RF-12.4:** El label `root` no se muestra como rol normal en la interfaz
- **ADR relacionados:**
  - `ADR-002_labels-as-auth-model.md` — labels como modelo de autorización principal
- **Dominio mapa:** Dominio Usuario (`user_profiles`, `admin_activity_logs`), pero esta tarea se limita a Appwrite Auth nativo sin tocar `user_profiles`.
- **Appwrite Auth:** Se usa como fuente de identidad. Los labels se leen del objeto usuario de Appwrite Auth.

### Sobre labels en Appwrite Auth

Los labels se asignan al usuario en Appwrite Auth (no en una tabla separada). El frontend los lee del objeto `account.get()` que retorna un campo `labels: string[]`. Las rutas y componentes se condicionan según estos labels.

En esta tarea, los labels se **asignan manualmente** desde la consola de Appwrite o vía API directa para testing. La asignación automática de labels vía Function se implementa en TASK-008.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear hook `useAuth` que expone:
   - `user` — objeto del usuario autenticado (o `null`)
   - `labels` — array de labels del usuario (`[]` si no está autenticado)
   - `loading` — estado de carga de sesión
   - `login(email, password)` — iniciar sesión con Appwrite Account
   - `register(name, email, password)` — crear cuenta con Appwrite Account
   - `logout()` — cerrar sesión
   - `hasLabel(label)` — helper que verifica si el usuario tiene un label específico
   - `isAdmin` — shortcut para `hasLabel('admin') || hasLabel('root')`
   - `isClient` — shortcut para `hasLabel('client')`
   - `isOperator` — shortcut para `hasLabel('operator')`
2. Crear `AuthContext` y `AuthProvider` que envuelve la app y provee el estado de auth a todos los componentes.
3. En `AuthProvider`, al montar la app:
   - Intentar recuperar sesión existente vía `account.get()`
   - Si hay sesión activa, setear `user` y `labels`
   - Si no hay sesión, setear `user = null`, `labels = []`
   - Manejar estado `loading` durante la verificación
4. Crear página `Login` con formulario funcional:
   - Campos: email, password
   - Botón de submit
   - Manejo de errores (credenciales inválidas, red)
   - Redirección post-login según label: admin → `/admin`, client → `/portal`, sin label → `/`
   - Link a página de registro
5. Crear página `Register` con formulario funcional:
   - Campos: nombre, email, password
   - Botón de submit
   - Manejo de errores (email duplicado, password débil, red)
   - Redirección post-registro a `/` o `/portal` (usuario nuevo no tiene label aún)
   - Link a página de login
6. Crear componentes de route guard:
   - `RequireAuth` — redirige a `/login` si no hay sesión activa
   - `RequireLabel` — recibe prop `labels` (array), redirige si el usuario no tiene al menos uno de los labels requeridos
   - `RedirectIfAuth` — redirige usuarios autenticados fuera de login/register (a su landing según label)
7. Configurar routing con guards:
   - Rutas públicas (`/`, páginas editoriales futuras): sin guard
   - `/login`, `/register`: envueltas en `RedirectIfAuth`
   - `/admin` y subrutas: envueltas en `RequireAuth` + `RequireLabel` con `['admin', 'root']`
   - `/portal` y subrutas: envueltas en `RequireAuth` + `RequireLabel` con `['client']`
8. Crear componente `Navbar` básico:
   - Si no autenticado: mostrar links a Login y Register
   - Si autenticado: mostrar nombre del usuario, links de navegación según labels, botón de Logout
   - Si admin/root: mostrar link a `/admin`
   - Si client: mostrar link a `/portal`
   - No mostrar el label `root` como texto visible — tratarlo como `admin` en UI
9. Integrar `Navbar` en `PublicLayout`.

## Fuera de alcance

- Creación de `user_profiles` en base de datos — eso es TASK-008 (`create-user-profile` Function).
- Asignación automática de labels al registrarse — eso es TASK-008.
- Flujo de recuperación de contraseña (password recovery / reset).
- Verificación de email post-registro — **implementado en auth hardening (ver notas de implementación abajo)**.
- Flujo de invitación de operadores.
- Estilo premium o diseño editorial del login/register — solo funcionalidad con TailwindCSS básico.
- Admin activity logging.
- OAuth / login social.
- Refresh token management (el SDK de Appwrite lo maneja internamente).
- Tests unitarios o e2e.

## Dominio

- [x] Usuario (perfiles, preferencias)
- [x] Configuración (settings, templates)
- Nota: clasificado como **Usuario + Infraestructura** en el plan maestro.

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| Appwrite Auth (users) | leer / crear | Se usa `Account` del SDK para login, register, getSession. No es una tabla de Databases. |

Nota: Esta tarea no crea ni lee tablas de Appwrite Databases. Solo interactúa con el servicio Auth nativo.

## Atributos nuevos o modificados

N/A — esta tarea no crea ni modifica atributos de base de datos. Los labels son parte del modelo de Auth nativo de Appwrite.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | La asignación de labels vía Function es TASK-008. En esta tarea, los labels se asignan manualmente para testing. |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Ninguno | — | No hay archivos involucrados en auth |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `AuthProvider` | app-wide | crear | Context provider que envuelve toda la app |
| `Login` | público | modificar | Reemplaza placeholder con formulario funcional |
| `Register` | público | modificar | Reemplaza placeholder con formulario funcional |
| `RequireAuth` | app-wide | crear | Wrapper de ruta que exige sesión activa |
| `RequireLabel` | app-wide | crear | Wrapper de ruta que exige label(s) específico(s) |
| `RedirectIfAuth` | app-wide | crear | Wrapper que redirige si ya está autenticado |
| `Navbar` | público | crear | Barra de navegación con estado de auth |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useAuth` | crear | Expone: `user`, `labels`, `loading`, `login()`, `register()`, `logout()`, `hasLabel()`, `isAdmin`, `isClient`, `isOperator` |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/` | público | ninguno | Home — accesible por todos |
| `/login` | público | `RedirectIfAuth` | Redirige a landing si ya autenticado |
| `/register` | público | `RedirectIfAuth` | Redirige a landing si ya autenticado |
| `/admin` | admin | `RequireAuth` + `RequireLabel(['admin', 'root'])` | Solo admin y root |
| `/admin/*` | admin | `RequireAuth` + `RequireLabel(['admin', 'root'])` | Subrutas admin protegidas |
| `/portal` | portal | `RequireAuth` + `RequireLabel(['client'])` | Solo client |
| `/portal/*` | portal | `RequireAuth` + `RequireLabel(['client'])` | Subrutas portal protegidas |
| `*` | público | ninguno | 404 — accesible por todos |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver Home `/` | ✅ | ✅ | ✅ | ✅ | ✅ |
| Acceder a `/login` | redirige | redirige | redirige | redirige | ✅ |
| Acceder a `/register` | redirige | redirige | redirige | redirige | ✅ |
| Acceder a `/admin` | ✅ | ✅ | ❌ (redirect) | ❌ (redirect) | ❌ (redirect a login) |
| Acceder a `/portal` | ❌ (redirect) | ❌ (redirect) | ❌ (redirect) | ✅ | ❌ (redirect a login) |
| Ver Navbar con opciones admin | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver Navbar con opciones portal | ❌ | ❌ | ❌ | ✅ | ❌ |
| Logout | ✅ | ✅ | ✅ | ✅ | N/A |

Nota sobre `operator`: en esta tarea, operator NO tiene acceso a `/admin`. El acceso de operator al admin panel se define en tasks de Fase 3+ cuando se implementen los módulos específicos. Por ahora el guard de admin exige `['admin', 'root']`.

## Flujo principal

### Login
1. Usuario anónimo navega a `/login`.
2. `RedirectIfAuth` verifica que no hay sesión activa → permite acceso.
3. Usuario ingresa email y password.
4. Se invoca `account.createEmailPasswordSession(email, password)`.
5. Si éxito: se obtiene usuario con `account.get()`, se extraen labels.
6. Se redirige según labels:
   - Si tiene `admin` o `root` → `/admin`
   - Si tiene `client` → `/portal`
   - Si no tiene labels funcionales → `/`
7. Si error: se muestra mensaje de error inline.

### Register
1. Usuario anónimo navega a `/register`.
2. `RedirectIfAuth` verifica que no hay sesión activa → permite acceso.
3. Usuario ingresa nombre, email y password.
4. Se invoca `account.create(ID.unique(), email, password, name)`.
5. Si éxito: se invoca login automático con las mismas credenciales.
6. Post-login: como es usuario nuevo sin labels, se redirige a `/`.
7. Si error: se muestra mensaje de error inline (email duplicado, password requirements).

### Persistencia de sesión
1. `AuthProvider` al montar ejecuta `account.get()`.
2. Si hay sesión cookies válida → setea `user` y `labels`.
3. Si no hay sesión → setea `user = null`, queda en estado anónimo.
4. Mientras verifica: `loading = true`, las rutas guardadas muestran loading o nada.

### Logout
1. Usuario autenticado clickea "Cerrar sesión" en Navbar.
2. Se invoca `account.deleteSession('current')`.
3. Se limpia estado: `user = null`, `labels = []`.
4. Se redirige a `/`.

### Guard de rutas
1. `RequireAuth`: si `loading` → mostrar nada o spinner. Si `!user` → redirect a `/login`.
2. `RequireLabel({ labels })`: si el usuario no tiene al menos uno de los labels requeridos → redirect a `/` (o página de acceso denegado).
3. `RedirectIfAuth`: si `user` existe → redirect según labels (misma lógica que post-login).

## Criterios de aceptación

- [ ] Un usuario anónimo puede acceder a `/login` y ver el formulario de login con campos email y password.
- [ ] Un usuario puede registrarse desde `/register` con nombre, email y password, y queda autenticado automáticamente tras el registro.
- [ ] Un usuario registrado puede iniciar sesión con email y password correctos, y es redirigido según su label principal.
- [ ] Un usuario con label `admin` es redirigido a `/admin` después de login.
- [ ] Un usuario con label `client` es redirigido a `/portal` después de login.
- [ ] Un usuario autenticado que intenta acceder a `/login` o `/register` es redirigido automáticamente a su landing correspondiente.
- [ ] Un usuario anónimo que intenta acceder a `/admin` es redirigido a `/login`.
- [ ] Un usuario con label `client` que intenta acceder a `/admin` es redirigido fuera (no tiene acceso).
- [ ] Un usuario anónimo que intenta acceder a `/portal` es redirigido a `/login`.
- [ ] Un usuario con label `admin` que intenta acceder a `/portal` es redirigido fuera (no tiene label `client`).
- [ ] La sesión persiste al recargar la página: si el usuario ya tenía sesión activa, no necesita volver a hacer login.
- [ ] El `Navbar` muestra "Login" y "Register" cuando no hay sesión activa.
- [ ] El `Navbar` muestra el nombre del usuario, link a admin y botón de logout cuando el usuario tiene label `admin` o `root`.
- [ ] El `Navbar` muestra el nombre del usuario, link a portal y botón de logout cuando el usuario tiene label `client`.
- [ ] El label `root` no aparece como texto visible en la interfaz — el usuario root ve las mismas opciones que admin.
- [ ] Al hacer logout, el usuario es redirigido a `/` y el `Navbar` vuelve a estado anónimo.
- [ ] Si se ingresan credenciales inválidas en login, se muestra un mensaje de error descriptivo sin recargar la página.
- [ ] Si se intenta registrar con un email ya existente, se muestra un mensaje de error descriptivo.
- [ ] El formulario de login no envía si los campos están vacíos (validación client-side mínima).
- [ ] Mientras se verifica la sesión al cargar la app (`loading = true`), las rutas protegidas no hacen flash de redirección.

## Validaciones de seguridad

- [ ] Las credenciales se envían exclusivamente a través del SDK de Appwrite (que usa HTTPS al endpoint configurado).
- [ ] No se almacenan passwords en state, localStorage ni cookies manuales — el SDK maneja la sesión.
- [ ] El guard de rutas es defensa en profundidad (UI layer) — las validaciones reales de permisos se refuerzan en Functions en tasks posteriores.
- [ ] No se expone el label `root` en la UI, logs del navegador ni atributos de DOM.
- [ ] Los mensajes de error de login no revelan si el email existe o no (usar mensaje genérico como "Credenciales inválidas").
- [ ] Los formularios tienen protección básica contra doble submit (deshabilitar botón durante request).

## Dependencias

- **TASK-001:** Scaffold proyecto React + Vite + TailwindCSS + Appwrite SDK — provee el proyecto base, SDK configurado, routing skeleton y layouts.

## Bloquea a

- **TASK-008:** Function assign-user-label + user profile creation on signup — extiende la lógica de registro creando perfil y asignando labels automáticamente.
- **TASK-009:** Route guards por label (si se hace como refinamiento separado).
- **TASK-010:** Admin layout — requiere guards y auth funcional para el panel admin.
- **TASK-016:** Public layout — puede usar Navbar con estado de auth.
- Todas las tasks que requieren autenticación dependen transitivamente de esta tarea.

## Riesgos y notas

- **Labels se asignan manualmente para testing:** En esta tarea no hay Function que asigne labels automáticamente al registrarse. Para probar los guards, se deben asignar labels manualmente desde la consola de Appwrite o vía Server SDK. Esto se automatiza en TASK-008.
- **Operator sin acceso a admin por ahora:** El guard de `/admin` exige `['admin', 'root']`. El acceso de `operator` al panel admin se implementará cuando se definan módulos específicos (Fase 3). Si se necesita antes, ajustar el guard para incluir `operator`.
- **Redirección post-login puede cambiar:** La lógica de "a dónde redirigir según label" puede evolucionar. Por ahora: admin→`/admin`, client→`/portal`, sin label→`/`. Si un usuario tiene múltiples labels, usar el primer label funcional en orden de prioridad: `root` > `admin` > `operator` > `client`.
- **Appwrite session cookies:** El SDK web de Appwrite maneja sesiones vía cookies httpOnly. En self-hosted, las cookies requieren que frontend y backend compartan dominio o se configure CORS/cookies correctamente. Verificar que `aprod.racoondevs.com` acepta cookies del dominio del frontend.
- **Sin email verification:** El registro no exige verificación de email en esta tarea. Si se requiere, se implementará en una task futura. **→ Implementado, ver notas de implementación.**
- **Mensaje de error genérico en login:** Por seguridad, no diferenciar entre "email no existe" y "password incorrecto". Usar un único mensaje como "Credenciales inválidas".

## Notas de implementación (post-deploy)

> **2026-04-06 — Auth hardening: verificación de email + UX mejorado**
>
> ### Verificación de email (antes "Fuera de alcance")
> - Tras el registro, el usuario recibe un email de verificación y es redirigido a `/verify-email-pending`.
> - Flujo: `register()` → `createVerification()` → `logout()` → redirect a `/verify-email-pending`.
> - Nuevas páginas: `VerifyEmailPendingPage` (espera confirmación, botón reenviar), `VerifyEmailPage` (procesa el link `?userId=...&secret=...`).
> - Nuevas rutas: `/verify-email-pending`, `/verify-email`.
> - `LoginPage` detecta `emailVerification === false` y redirige a `/verify-email-pending` con aviso.
> - `AuthContext` expone `resendVerification()`.
>
> ### RegisterPage — UX mejorada
> - Campos: `firstName`, `lastName` (se envían como `name = firstName + " " + lastName`), `email`, `phone` (opcional), `password`.
> - Componente `PasswordStrengthMeter` integrado con indicador visual y reglas.
> - Iconos en cada campo (`Input` recibe prop `icon`).
> - Eye toggle para mostrar/ocultar password.
>
> ### LoginPage — UX mejorada
> - Iconos en campos email y password.
> - Eye toggle para password.
> - Detección de `email_not_verified` en catch → redirect a `/verify-email-pending`.
>
> ### AuthContext — cambios
> - `register()` ahora envía verification email y hace logout (el usuario no queda logueado hasta verificar).
> - `login()` verifica `emailVerification` antes de completar; si es `false`, logout + redirect.
> - Nuevo método `resendVerification()`.
> - `isRoot` expuesto para la regla de invisibilidad del root.
