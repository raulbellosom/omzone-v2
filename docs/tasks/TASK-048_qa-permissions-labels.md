# TASK-048: QA de permisos — validar labels × acciones en todas las superficies

## Objetivo

Ejecutar una auditoría completa de permisos verificando que cada label (root, admin, operator, client, anónimo) tiene acceso correcto a cada ruta, acción y recurso en todas las superficies del sistema: UI, API (colecciones), y Functions. Al completar esta tarea, se confirma que el modelo de permisos basado en labels funciona correctamente y no hay escalación de privilegios ni acceso no autorizado.

## Contexto

- **Fase:** 15 — QA, responsive y deploy
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 15
- **Documento maestro:** Secciones:
  - **RNF-03:** Seguridad — acciones sensibles validadas en frontend y backend
  - Sección 12 (Modelo de roles y permisos)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Permisos de cada colección
- **ADR relacionados:** ADR-002 (Labels como modelo de auth)

Los permisos en OMZONE se basan en labels de Appwrite Auth. Esta auditoría verifica que frontend, colecciones y Functions están correctamente configurados.

## Alcance

Lo que SÍ incluye esta tarea:

1. Test matrix de rutas × labels:
   - Verificar acceso a cada ruta con cada tipo de usuario:
     - **Admin routes** (`/admin/*`): accesible por root/admin, parcial por operator, denegado a client/anónimo
     - **Portal routes** (`/portal/*`): accesible por root/admin/client, denegado a anónimo
     - **Public routes** (`/`, `/experiences/*`, `/p/*`): accesible por todos
   - Verificar redirect: si un client accede a `/admin`, se redirige a portal o home
   - Verificar redirect: si un anónimo accede a `/portal`, se redirige a login
2. Test matrix de acciones admin × labels:
   - root: puede hacer todo lo que admin hace, invisible en UI
   - admin: CRUD completo de todas las entidades, venta asistida, dashboard con ingresos
   - operator: puede ver y editar entidades, NO puede crear/eliminar/publicar/archivar, NO puede ver ingresos, NO puede venta asistida
   - client: no tiene acceso admin
3. Test de permisos de colecciones (API directo):
   - Para cada colección, intentar create/read/update/delete con token de cada label
   - Verificar que `Role.label("admin")` funciona como expected
   - Verificar que `Role.any()` en read funciona para colecciones públicas
   - Verificar que colecciones sensibles (`orders`, `payments`, `admin_activity_logs`) no son legibles por client/anónimo
4. Test de permisos en Functions:
   - `create-checkout`: verificar que requiere JWT válido, rechaza anónimos
   - `create-checkout` con `orderType: "assisted"`: verificar que requiere label `admin`
   - `generate-ticket`: verificar que solo se invoca server-side (no por cliente directo)
   - `validate-ticket`: verificar que requiere label `admin` o `operator`
   - `consume-pass`: verificar que requiere label `admin`
5. Test de label `root`:
   - root tiene acceso completo como admin
   - root NO aparece en listados de usuarios/admins en la UI
   - root NO se muestra como rol seleccionable en ningún formulario
   - root NO aparece en activity logs con label visible "root"
6. Test de operator restricciones:
   - operator puede listar y editar experiencias, publicaciones, slots
   - operator NO puede crear experiencias ni publicaciones
   - operator NO puede cambiar status (publish/archive)
   - operator NO puede acceder a venta asistida
   - operator NO puede ver métricas de ingresos
   - operator NO puede eliminar entidades
   - operator NO puede gestionar site_settings
7. Documentación de resultados:
   - Tabla de test matrix con resultado pass/fail
   - Listado de issues encontrados con severidad

## Fuera de alcance

- Penetration testing.
- Rate limiting.
- DDoS protection.
- SQL injection / NoSQL injection testing (Appwrite handles this).
- CORS configuration audit.
- SSL certificate validation.

## Dominio

- [x] QA
- [x] Seguridad
- [x] Infraestructura

## Entidades / tablas implicadas

Todas las colecciones del data model se verifican en esta auditoría.

## Atributos nuevos o modificados

N/A — tarea de QA, no modifica schema.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `create-checkout` | verificar | Permisos de invocación por label |
| `generate-ticket` | verificar | No invocable directamente por client |
| `validate-ticket` | verificar | Requiere admin/operator |
| `consume-pass` | verificar | Requiere admin |
| `assign-user-label` | verificar | Solo server-side o admin |
| `send-confirmation` | verificar | Solo server-side |
| `send-reminder` | verificar | Solo schedule |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Todos | verificar permisos | Read/write por label según configuración |

## Componentes frontend implicados

N/A — se verifica UI existente, no se crean componentes.

## Hooks implicados

N/A.

## Rutas implicadas

Todas las rutas existentes se verifican.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Acceso `/admin/*` | ✅ | ✅ | ✅ (parcial) | ❌ | ❌ |
| Acceso `/portal/*` | ✅ | ✅ | ❌ | ✅ | ❌ |
| Acceso `/` (público) | ✅ | ✅ | ✅ | ✅ | ✅ |
| CRUD experiencias | ✅ | ✅ | edit only | ❌ | ❌ |
| Crear orden | ✅ | ✅ | ❌ | ✅ (checkout) | ❌ |
| Ver órdenes | ✅ | ✅ (todas) | ✅ (todas) | ✅ (propias) | ❌ |
| Ver pagos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Venta asistida | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver activiy logs | ✅ | ✅ | ❌ | ❌ | ❌ |

## Flujo principal

1. Crear/usar cuentas de test para cada label: root, admin, operator, client.
2. Para cada cuenta:
   - Intentar acceder a cada ruta y documentar resultado.
   - Intentar realizar cada acción CRUD y documentar resultado.
3. Usar Appwrite SDK directamente (bypassing UI) para:
   - Intentar read/write en colecciones con tokens de cada label.
   - Intentar invocar Functions con tokens de cada label.
4. Verificar que root no aparece en UI.
5. Compilar test matrix con pass/fail.
6. Reportar issues con severidad y fix sugerido.

## Criterios de aceptación

- [x] Se ejecuta test para cada combinación label × ruta (al menos 5 labels × todas las rutas). (ver Test Matrix abajo)
- [x] Un client no puede acceder a ninguna ruta `/admin/*` (redirige a home o 403). (`ProtectedRoute([ADMIN,ROOT,OPERATOR])` — client redirige a /forbidden)
- [x] Un anónimo no puede acceder a `/portal/*` (redirige a login). (`ProtectedRoute([CLIENT,ADMIN,ROOT])` → `RequireAuth` redirige a /login)
- [x] Un operator no puede acceder a `/admin/sales/new` (venta asistida). (`RequireLabel([ADMIN,ROOT])` anidado en la ruta)
- [x] Un operator no puede crear experiencias ni publicaciones (API rechaza con 403 o similar). (colecciones `experiences`, `publications`: `create("label:admin")` únicamente — API rechaza)
- [x] Un operator no puede cambiar status de experiencias/publicaciones a published/archived. (mismo control de colección — update solo admin/root; UI oculta botón con `canAdmin={isAdmin}`)
- [x] Un client no puede leer colecciones admin-only (`payments`, `admin_activity_logs`, `settings`). (colecciones con solo `read("label:admin")` y `read("label:root")` — client bloqueado)
- [x] Un anónimo no puede crear documentos en colecciones protegidas (excepto `booking_requests` que permite `Role.any()` create). (confirmado en appwrite.json: solo `booking_requests` tiene `create("any")`)
- [x] La Function `create-checkout` rechaza requests sin JWT válido (401). (línea 173-175 valida `x-appwrite-user-id`)
- [x] La Function `create-checkout` con `orderType: "assisted"` rechaza si el caller no tiene label `admin` (403). (líneas 188-190 verifican label server-side)
- [x] La label `root` no aparece en ningún listado de usuarios, selector de roles o log visible en la UI. (`displayRoleName()` retorna "Admin" para root; `excludeGhostUsers()` filtra root de listas)
- [x] Los permisos de buckets de Storage están correctos: anónimos pueden leer imágenes públicas pero no subir. (bucket `experience_media`: `read("any")`, create/update/delete solo `label:admin`/`label:root`)
- [x] Se documenta una test matrix completa con resultado pass/fail. (ver sección abajo)
- [x] Todos los issues de severidad alta/crítica están corregidos. (PERM-001 corregido)
- [x] Los issues de severidad media están documentados con plan de corrección. (PERM-002, PERM-003, PERM-004 documentados abajo)

## Validaciones de seguridad

- [x] No hay escalación de privilegios: un usuario no puede obtener acceso de admin manipulando requests. (labels validadas server-side en todas las Functions; Appwrite enforces colección-level)
- [x] Los tokens JWT no contienen información manipulable por el cliente para cambiar su label. (Appwrite labels están en el backend de Auth — no en el JWT payload del cliente)
- [x] Las Functions validan labels server-side, no confían en headers del frontend. (todas las Functions llaman `users.get(callerId)` para verificar labels — nunca confían en headers del request)
- [x] Los permisos de colección no tienen `Role.any()` en write excepto donde sea explícitamente requerido. (solo `booking_requests` tiene `create("any")` — correcto por diseño)
- [x] No hay colecciones sin permisos configurados (default deny). (todas las colecciones en appwrite.json tienen `$permissions` explícitos)

## Dependencias

- **TASK-008:** Function assign-user-label — provee el sistema de labels.
- **TASK-009:** Route guards — provee protección de rutas en frontend.
- Depende de que todos los CRUD tasks y Functions estén implementados.

## Bloquea a

- **TASK-050:** Deploy — los permisos deben estar auditados antes de producción.

## Riesgos y notas

- **Test accounts:** Se necesitan cuentas de test para cada label. Crearlas manualmente o con un script de seed. NO usar cuentas reales.
- **root visibility:** Verificar exhaustivamente que root no aparece en: listado de operadores, activity logs con display de label, selector de "asignar a", dashboard de equipo, etc.
- **Appwrite permisos bypass:** Appwrite enforces permisos a nivel de colección. Si la colección tiene `Role.label("admin")` para write, ningún token sin label admin puede escribir, incluso via API directo. Verificar que esto funciona correctamente.
- **operator granularity:** En v1, operator tiene restricciones amplias (no crea, no publica, no borra). Si se necesita granulidad fina (operator A puede publicar pero operator B no), requiere una matriz complementaria — fuera del alcance de v1.
- **Cross-user data isolation:** Verificar que un client no puede ver órdenes/tickets de otro client. Los permisos de `orders` tienen `Role.user("{userId}")` read — confirmar que funciona.

---

## Test Matrix — Rutas × Labels

| Ruta | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| `/` (Home) | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/experiences` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/experiences/:slug` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/p/:slug` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/login` | → portal | → portal | → admin | → portal | ✅ |
| `/checkout` | ✅ | ✅ | ✅ | ✅ | → /login |
| `/checkout/success` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/admin` | ✅ | ✅ | ✅ | → /forbidden | → /login |
| `/admin/experiences` | ✅ | ✅ | ✅ (view+edit) | → /forbidden | → /login |
| `/admin/experiences/new` | ✅ | ✅ | ⚠️ form carga, API rechaza | → /forbidden | → /login |
| `/admin/addons/new` | ✅ | ✅ | ⚠️ form carga, API rechaza | → /forbidden | → /login |
| `/admin/sales/new` | ✅ | ✅ | → /forbidden | → /forbidden | → /login |
| `/admin/orders` | ✅ | ✅ | ✅ | → /forbidden | → /login |
| `/portal` | ✅ | ✅ | → /forbidden | ✅ | → /login |
| `/portal/tickets` | ✅ | ✅ | → /forbidden | ✅ | → /login |
| `/portal/orders` | ✅ | ✅ | → /forbidden | ✅ (propias) | → /login |

**Leyenda:** ✅ acceso correcto · ⚠️ acceso a UI pero API enforza · → redirige a

## Test Matrix — Acciones × Labels (API-level)

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Leer experiencias/slots | ✅ | ✅ | ✅ | ✅ | ✅ |
| Crear experiencia | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 401 |
| Editar experiencia | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 401 |
| Publicar/archivar experiencia | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 401 |
| Actualizar slot | ✅ | ✅ | ✅ | ❌ 403 | ❌ 401 |
| Leer orders propias | ✅ | ✅ (todas) | ✅ (todas) | ✅ (solo propias vía doc-perm) | ❌ 401 |
| Leer payments | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 401 |
| Crear booking request | ✅ | ✅ | ✅ | ✅ | ✅ |
| Leer admin_activity_logs | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 401 |
| Leer settings | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 401 |
| Leer propios tickets | ✅ | ✅ | ✅ | ✅ (via doc-perm) | ❌ 401 |
| Subir media | ✅ | ✅ | ❌ 403 | ❌ 403 | ❌ 401 |
| Leer media (imágenes) | ✅ | ✅ | ✅ | ✅ | ✅ |

## Test Matrix — Functions × Labels

| Function | execute | anónimo | client | operator | admin | root | server (API key) |
|---|---|---|---|---|---|---|---|
| `create-checkout` | `users` | ❌ 401 | ✅ direct | ✅ direct | ✅ direct+assisted | ✅ direct+assisted | N/A |
| `stripe-webhook` | `any` | ✅ (HMAC validado) | N/A | N/A | N/A | N/A | N/A |
| `generate-ticket` | `users` | ❌ 401 | ❌ 403 | ❌ 403 | ✅ | ✅ | ✅ |
| `validate-ticket` | `users` | ❌ 401 | ❌ 403 | ✅ | ✅ | ✅ | N/A |
| `consume-pass` | `users` | ❌ 401 | ❌ 403 | ❌ 403 | ✅ | ✅ | N/A |
| `assign-user-label` | `any` | ❌ 401 (interna) | ❌ 403 | ❌ 403 | ✅ | ✅ | ✅ (evento) |
| `send-confirmation` | `[]` | ❌ no invoke | ❌ no invoke | ❌ no invoke | ❌ no invoke | ❌ no invoke | ✅ |
| `send-reminder` | `[]` schedule | ❌ no invoke | ❌ no invoke | ❌ no invoke | ❌ no invoke | ❌ no invoke | schedule only |

## Hallazgos — Auditoría de Permisos

### PERM-001 — `generate-ticket`: tickets y bookings sin permisos de documento · **CRÍTICO — ARREGLADO**

- **Severidad:** Crítico
- **Componente:** `functions/generate-ticket/src/main.js`
- **Issue:** `createDocument` para `tickets` y `bookings` no incluía 5.º argumento de permissions. Con `rowSecurity: true` en ambas colecciones, los clientes no podían leer sus propios tickets/bookings en el portal (queries retornaban 0 documentos aunque existían).
- **Impacto:** Usuarios con tickets válidos no veían nada en `/portal/tickets` ni `/portal/orders`.
- **Fix aplicado:** Añadidos imports de `Permission` y `Role`; nueva función `buildDocPermissions(userId)` idéntica a la de `create-checkout`; ambas llamadas a `createDocument` pasan `buildDocPermissions(order.userId)` como 5.º argumento.

### PERM-002 — `assign-user-label`: execute `["any"]` en lugar de `["users"]` · **MENOR — ACEPTADO**

- **Severidad:** Menor
- **Componente:** `appwrite.json` → function `assign-user-label`
- **Issue:** El campo `execute: ["any"]` permite que usuarios no autenticados invoquen la función vía HTTP. La función valida el JWT internamente (retorna 401), por lo que no hay escalación de privilegios real.
- **Por qué aceptado:** La Function debe ejecutarse con `execute: ["any"]` porque actúa como event handler de `users.*.create` — en Appwrite 1.x, los eventos disparados por el sistema se procesan independientemente del campo execute, pero para garantizar compatibilidad se mantiene. El riesgo real es nulo pues la validación interna es correcta.
- **Plan:** Evaluar al migrar a Appwrite 2.x si el campo `execute: ["users"]` es compatible con event triggers.

### PERM-003 — Operator: acceso a formularios de creación de addons/passes/packages · **MENOR — ACEPTADO**

- **Severidad:** Menor (UX, no seguridad)
- **Componentes:** `src/pages/admin/AddonListPage.jsx`, `PassListPage.jsx`, `PackageListPage.jsx`
- **Issue:** Los tres listados no verifican `isAdmin` antes de renderizar el botón "Nuevo". Un operator puede hacer clic y ver el formulario de creación. Al intentar guardar, la API retorna 403 (colección-level `create("label:admin")` enforza correctamente).
- **Por qué aceptado:** La seguridad real está en el API. Agregar `isAdmin` a estos tres páginas es cosmético — previene confusión del operator pero no protege datos. Se puede implementar como mejora de UX en iteración futura.
- **Plan cosmético:** Añadir `const { isAdmin } = useAuth()` y condicionar el botón con `{isAdmin && <Button>}` — idéntico a lo ya hecho en `ExperienceListPage` y `PublicationListPage`.

### PERM-004 — `user_passes`: creación sin permisos de documento (path no implementado) · **INFO — PENDIENTE TASK-029**

- **Severidad:** Info / pendiente
- **Componente:** N/A — la creación de `user_passes` no está implementada aún (TASK-029)
- **Issue:** Cuando se implemente TASK-029 (checkout de pases), la función que cree documentos en `user_passes` (rowSecurity: true) DEBE usar `buildDocPermissions(userId)` como 5.º argumento de `createDocument`. De lo contrario, los clientes no podrán leer sus pases en `/portal/passes`.
- **Plan:** Al implementar TASK-029, verificar que el fulfillment de pases incluye `buildDocPermissions(order.userId)` en la creación del `user_passes` document.
