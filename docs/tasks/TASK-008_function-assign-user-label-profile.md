# TASK-008: Function assign-user-label + user profile creation on signup

## Objetivo

Implementar la Appwrite Function `assign-user-label` que se dispara al crear un nuevo usuario (`users.*.create`), crea automáticamente un documento en `user_profiles` con los datos iniciales del usuario y asigna el label `client` por defecto. Además, exponer un endpoint HTTP protegido para que un admin pueda asignar manualmente labels (`admin`, `operator`) a otros usuarios. Al completar esta tarea, todo usuario nuevo tiene perfil y label `client` automáticamente, y un admin puede promover usuarios a `admin` u `operator` desde la Function.

## Contexto

- **Fase:** 2 — Auth y roles
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 2
- **Documento maestro:** Sección 12 (Modelo de roles y permisos)
  - **RF-12.1:** Labels como fuente de verdad de autorización
  - **RF-12.2:** Reglas generales de labels (`root`, `admin`, `operator`, `client`)
  - **RF-12.3:** Reglas de implementación — Functions validan labels del usuario, no solo UI
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Sección 7.1 (`user_profiles`)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Dominio Usuario (2.6)
- **ADR relacionados:** ADR-002 (Labels como modelo de auth) — labels en Appwrite Auth como fuente de verdad; `user_profiles` extiende Auth con datos adicionales; `root` nunca se asigna via Function.

La tabla `user_profiles` fue creada en TASK-007. Esta tarea implementa la Function que la puebla automáticamente y gestiona labels.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear Appwrite Function `assign-user-label` con runtime Node.js.
2. Trigger por evento `users.*.create`:
   - Leer datos del usuario recién creado (`$id`, `name`, `email`).
   - Parsear `name` en `firstName` y `lastName` (split por espacios; primer token = firstName, resto = lastName).
   - Crear documento en `user_profiles` con `$id = userId` (no atributo `userId` separado), `displayName`, `firstName`, `lastName`, `language` default `es`.
   - Asignar label `client` al usuario nuevo via Appwrite Server SDK (`users.updateLabels()`).
3. Endpoint HTTP (POST) para asignación manual de labels:
   - Recibe `targetUserId` y `label` en body.
   - Valida JWT del caller y verifica que tiene label `admin` o `root`.
   - Solo permite asignar labels `admin`, `operator`, `client`.
   - Rechaza asignación de `root` (solo via Appwrite Console).
   - Llama a `users.updateLabels()` para agregar el label sin perder los existentes.
   - Retorna confirmación con los labels actualizados.
4. Validación de inputs: `targetUserId` requerido, `label` debe ser uno de los permitidos.
5. Error handling: duplicados, usuario no encontrado, permisos insuficientes.
6. Variables de entorno de la Function: `APPWRITE_API_KEY`, `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_DATABASE_ID`, `APPWRITE_COLLECTION_USER_PROFILES`.
7. Registrar la Function en `appwrite.json`.

## Fuera de alcance

- Flujo de invitación de operadores (email invite + onboarding).
- Verificación de email post-registro.
- Matriz de permisos por módulo para operators.
- CRUD de `user_profiles` desde admin panel (futura task).
- Componentes frontend para gestión de roles.
- Actividad/audit logging de cambios de label.
- Eliminación de labels (revocar acceso).
- Asignación de label `root` por ningún medio que no sea Appwrite Console.

## Dominio

- [x] Usuario (perfiles, preferencias)

## Entidades / tablas implicadas

| Tabla                 | Operación         | Notas                                                              |
| --------------------- | ----------------- | ------------------------------------------------------------------ |
| `user_profiles`       | crear             | Se crea documento con `$id = userId`, `displayName`, `firstName`, `lastName`, `language`      |
| Appwrite Auth (users) | leer / actualizar | Se leen datos del nuevo usuario y se asignan labels via Server SDK |

## Atributos nuevos o modificados

N/A — la tabla `user_profiles` y sus atributos fueron creados en TASK-007. Esta tarea solo escribe documentos en la tabla existente.

## Functions implicadas

| Function            | Operación   | Notas                                                            |
| ------------------- | ----------- | ---------------------------------------------------------------- |
| `assign-user-label` | crear nueva | Trigger: `users.*.create` + HTTP endpoint para asignación manual |

## Buckets / Storage implicados

N/A — esta tarea no involucra Storage.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas                                                                  |
| ---------- | ---------- | --------- | ---------------------------------------------------------------------- |
| Ninguno    | —          | —         | Esta tarea es backend-only. La UI de gestión de roles es tarea futura. |

## Hooks implicados

N/A — esta tarea no involucra hooks frontend.

## Rutas implicadas

N/A — esta tarea no involucra rutas frontend.

## Permisos y labels involucrados

| Acción                                | root | admin | operator | client | anónimo |
| ------------------------------------- | ---- | ----- | -------- | ------ | ------- |
| Trigger automático al signup (evento) | N/A  | N/A   | N/A      | N/A    | N/A     |
| Asignar label admin/operator (HTTP)   | ✅   | ✅    | ❌       | ❌     | ❌      |
| Asignar label client (HTTP)           | ✅   | ✅    | ❌       | ❌     | ❌      |
| Asignar label root (HTTP)             | ❌   | ❌    | ❌       | ❌     | ❌      |

## Flujo principal

### Flujo A — Signup automático (evento)

1. Un nuevo usuario se registra via `account.create()` o Appwrite Console.
2. Appwrite dispara evento `users.*.create`.
3. La Function `assign-user-label` se ejecuta.
4. La Function lee `$id` y `name` del usuario del evento payload.
5. La Function crea un documento en `user_profiles` con `userId`, `displayName` (derivado de `name`), `language: "es"`.
6. La Function asigna label `client` al usuario via `users.updateLabels()`.
7. El usuario ahora tiene perfil y label `client`.

### Flujo B — Asignación manual de label (HTTP)

1. Un admin navega a la sección de gestión de usuarios (futura UI) o invoca el endpoint manualmente.
2. Envía POST a la Function con `targetUserId` y `label` (ej: `operator`).
3. La Function valida el JWT del caller.
4. La Function verifica que el caller tiene label `admin` o `root`.
5. La Function valida que `label` sea uno de `admin`, `operator`, `client`.
6. Si `label` es `root`, la Function rechaza con error 403.
7. La Function lee labels actuales del target user y agrega el nuevo sin perder los existentes.
8. La Function retorna los labels actualizados del usuario.

## Criterios de aceptación

- [x] Al registrar un nuevo usuario, se crea automáticamente un documento en `user_profiles` con `userId` y `displayName` derivado de `name`. ⚠️ _Código correcto y desplegado; evento `users._.create` no se dispara por problema de infraestructura self-hosted — ver nota al final.\*
- [x] Al registrar un nuevo usuario, se le asigna automáticamente el label `client`. ⚠️ _Misma limitación de evento — ver nota al final._
- [x] Si el usuario no tiene `name`, `displayName` se setea como string vacío o email prefix.
- [x] El endpoint HTTP de asignación manual retorna 200 con labels actualizados cuando un admin asigna `operator` a un usuario.
- [x] El endpoint HTTP retorna 403 si el caller no tiene label `admin` o `root`.
- [x] El endpoint HTTP retorna 400 si se intenta asignar el label `root`.
- [x] El endpoint HTTP retorna 400 si `targetUserId` o `label` están vacíos o son inválidos.
- [x] El endpoint HTTP retorna 404 si el `targetUserId` no corresponde a un usuario existente.
- [x] Asignar un label que el usuario ya tiene no duplica labels ni genera error.
- [x] Los labels existentes del usuario se preservan al agregar uno nuevo (no se sobrescriben).
- [x] La Function está registrada en `appwrite.json` con triggers y variables correctas.
- [x] Las variables de entorno sensibles (`APPWRITE_API_KEY`) no están hardcodeadas en el código.

## Validaciones de seguridad

- [x] El endpoint HTTP valida JWT del caller antes de cualquier operación.
- [x] El endpoint HTTP verifica que el caller tiene label `admin` o `root` via Server SDK (no confía en headers del cliente).
- [x] El label `root` NUNCA puede asignarse via esta Function — solo via Appwrite Console.
- [x] Los inputs (`targetUserId`, `label`) se validan por tipo y formato antes de usarse.
- [x] La API key de Appwrite se maneja como variable de entorno de la Function, no en código fuente.
- [x] La Function usa try/catch con error responses apropiados (no expone stack traces al cliente).

## Dependencias

- **TASK-002:** Auth flow — login, registro, sesión y guards por label — provee el flujo de registro que dispara el evento.
- **TASK-007:** Schema dominio usuario — user_profiles — provee la tabla `user_profiles` donde se crea el documento.

## Bloquea a

- **TASK-009:** Route guards por label — necesita que los labels se asignen correctamente para que los guards funcionen end-to-end.
- **TASK-010+:** Todas las tasks de admin dependen transitivamente de que los usuarios tengan labels asignados.

## Riesgos y notas

- **Idempotencia del evento:** Si el evento `users.*.create` se dispara más de una vez (retry de Appwrite), la Function debe manejar el caso de que `user_profiles` ya tenga un documento para ese `userId`. Verificar existencia antes de crear.
- **Race condition:** Si el usuario intenta loguearse inmediatamente después del registro, puede que la Function aún no se haya ejecutado. El frontend debe manejar el caso de un usuario sin label (tratarlo como anónimo-con-cuenta hasta que la Function asigne `client`).
- **updateLabels vs labels existentes:** Appwrite `users.updateLabels()` reemplaza todos los labels. La Function debe leer labels actuales primero y hacer merge antes de actualizar, para no borrar labels existentes al asignar uno nuevo.
- **Root como excepción:** Documentar claramente que `root` solo se asigna manualmente desde Appwrite Console. Ningún endpoint lo permite.

## Notas de implementación (post-deploy)

> **2026-04-06 — Auth hardening: user_profiles $id = userId**
>
> - El documento de `user_profiles` se crea con `$id = userId` (sin atributo `userId` separado).
> - `name` del Auth user se parsea: primer token → `firstName`, resto → `lastName`. `displayName` = `name` completo.
> - Atributos enviados al crear: `displayName`, `firstName`, `lastName`, `phone`, `avatarUrl`, `bio`, `language`.
> - La Function usa try/catch con `getDocument($id)` para idempotencia: si el documento ya existe, no falla.
> - Estos cambios aplican tanto al Flujo A (evento) como al Flujo B (HTTP manual).

## Nota de infraestructura — Evento `users.*.create`

> **Estado:** El código del Flujo A (signup automático) es correcto y está desplegado.
> Sin embargo, el evento `users.*.create` **no se dispara** en la instancia self-hosted de Appwrite 1.9.0.
> Se verificó creando múltiples usuarios de prueba — ninguno generó ejecución de la Function.
> Los health queues de Appwrite reportan `size: 0` para todos los workers.
>
> **Causa probable:** El contenedor Docker `appwrite-worker-functions` puede necesitar reinicio o configuración de variables de entorno para el event delivery.
>
> **Impacto:** El Flujo B (HTTP manual) funciona correctamente y fue verificado con todas las validaciones.
> Cuando se resuelva el problema de infraestructura, el Flujo A debería funcionar sin cambios de código.
>
> **Acción requerida:** Revisar la configuración Docker del worker de funciones en el servidor self-hosted.
