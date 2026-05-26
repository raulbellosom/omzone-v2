# ADR-002: Labels de Appwrite Auth como modelo principal de autorización

**Fecha:** 2026-04-05
**Estado:** Aceptado
**Dominio(s):** Usuario, Infraestructura

---

## Contexto

OMZONE necesita un modelo de autorización que diferencie entre super-admin, admin, operator y client. Appwrite 1.9.0 soporta labels en Auth users y permisos por label en colecciones (`Role.label("admin")`).

## Opciones evaluadas

### Opción A — Tabla de roles y permisos custom

- **Pros:** Granularidad fina, configurable por el admin.
- **Contras:** Requiere tabla adicional, join manual en cada query, complejidad innecesaria para 4 roles fijos.

### Opción B — Labels de Appwrite Auth como fuente de verdad

- **Pros:** Nativo de Appwrite. Los permisos de colección usan `Role.label()` directamente. Sin joins. Sin tablas extra. El frontend lee `user.labels` de la sesión.
- **Contras:** Menos granular (es label, no permiso por entidad). Si se necesita granularidad fina futura, habrá que añadir una capa.

### Opción C — Appwrite Teams

- **Pros:** Nativo de Appwrite, soporta membresías.
- **Contras:** Diseñado para multi-tenant. OMZONE es single-tenant. Overhead innecesario.

## Decisión

**Opción B:** Labels de Appwrite Auth.

Labels base:

- `super-admin` → Acceso total técnico. Invisible en UI.
- `admin` → Acceso total de negocio al panel.
- `operator` → Acceso operativo restringido al panel.
- `client` → Acceso al portal de cliente.

Reglas:

1. El frontend lee `user.labels` para guards de ruta y visibilidad de UI.
2. Las colecciones usan `Role.label("admin")`, `Role.label("operator")`, etc.
3. Las Functions sensibles validan labels del token JWT, no confían solo en UI.
4. `super-admin` usa los mismos permisos que `admin` a nivel de colección pero se oculta en UI.
5. Si en el futuro se necesita granularidad fina, se añade una tabla `operator_permissions` complementaria, pero NO se elimina el sistema de labels.

### Regla de invisibilidad del super-admin (usuario fantasma)

El usuario `super-admin` es un **usuario fantasma**. No basta con no mostrar el rol en la UI — el super-admin debe ser completamente invisible en toda la plataforma para cualquier otro rol:

| Regla                       | Descripción                                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **Listados de usuarios**    | Un admin/operator/client NO debe ver usuarios super-admin en ninguna lista (equipo, perfiles, asignaciones). |
| **Transacciones y órdenes** | Órdenes, tickets, pagos y movimientos de un super-admin NO aparecen para admin/operator/client.              |
| **Actividad y logs**        | Cualquier log o historial de actividad de un super-admin se oculta para no super-admin.                      |
| **Nombre de rol en UI**     | Si se muestra el rol de un super-admin (solo visible para otro super-admin), se muestra como "Admin".        |
| **Excepción**               | Un usuario super-admin SÍ puede ver a otros super-admin en todos los listados y transacciones.               |

**Implementación frontend:**

- `src/constants/roles.js` exporta `isGhostUser()`, `excludeGhostUsers()` y `displayRoleName()`.
- Todo componente que liste usuarios, órdenes, tickets o actividad DEBE pasar los resultados por `excludeGhostUsers(items, viewerLabels, getLabels)` antes de renderizar.
- `AuthContext` expone `isAdminViewer` para que los componentes sepan si el viewer es super-admin y si deben hacer el filtrado.

**Implementación backend (Functions):**

- Toda Function que retorne listas de usuarios o entidades con owner debe excluir documentos pertenecientes a usuarios super-admin, a menos que el caller sea super-admin.
- El filtrado se hace server-side con Query filters sobre `userId` o verificación de labels del owner.

## Entidades impactadas

| Tabla           | Efecto                                            |
| --------------- | ------------------------------------------------- |
| Todas           | Permisos de colección usan `Role.label()`         |
| `user_profiles` | Se crea on signup via Function con label asignado |
| Rutas frontend  | Protegidas por guard que lee `user.labels`        |

## Riesgos

- **Escalabilidad de permisos:** Si surgen necesidades de permisos finos por módulo para operators, habrá que agregar capa complementaria. Mitigación: diseñar la tabla futura pero no implementarla ahora.
- **Super-admin expuesto:** Si la UI no oculta el super-admin correctamente, se expone un actor técnico. Mitigación: el frontend NUNCA muestra el rol super-admin como opción ni como label visible.

## Limitaciones conocidas de `Role.label()` en Appwrite 1.9.0

> **Descubierto:** 2026-04-11

### Storage buckets NO soportan `label:` como scope

Appwrite 1.9.0 self-hosted **acepta** `create("label:admin")` y `create("label:super-admin")` al configurar permisos de un bucket de Storage, pero los **rechaza en runtime** al intentar subir un archivo:

```
Missing "create" permission for role "label:super-admin". Only ["any","guests"] scopes are allowed
and ["label:admin","label:super-admin"] was given.
```

**Scopes válidos a nivel de bucket de Storage:** `any`, `guests`, `users`.

**Impacto:** Los 7 buckets de OMZONE (`experience_media`, `publication_media`, `addon_images`, `package_images`, `user_avatars`, `documents`, `public-resources`) fueron corregidos para usar `users` en lugar de `label:admin`/`label:super-admin`.

**Mitigación:** La restricción de que solo admins puedan subir archivos de catálogo se implementa en dos capas:

1. **Route guards de frontend:** Solo usuarios con label `admin` acceden al panel admin donde están los formularios de upload.
2. **Contexto de UI:** Los componentes `ImageUpload` y `GalleryManager` solo se renderizan dentro de formularios admin protegidos.

**Nota:** Esta limitación **NO aplica** a colecciones de base de datos. `Role.label("admin")` funciona correctamente para permisos de colecciones y documentos. Solo Storage buckets tienen esta restricción.

### Donde SÍ funciona `Role.label()`

| Recurso                                | `Role.label()` soportado              |
| -------------------------------------- | ------------------------------------- |
| Colecciones (databases)                | ✅ Sí                                 |
| Documentos (rows)                      | ✅ Sí                                 |
| Buckets de Storage                     | ❌ No — solo `any`, `guests`, `users` |
| Archivos (file-level con fileSecurity) | ✅ Sí                                 |

---

**ADR ID:** ADR-002
