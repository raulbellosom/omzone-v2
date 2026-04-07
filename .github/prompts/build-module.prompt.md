---
description: "Construir un módulo completo de OMZONE: schema, Functions, hooks, componentes, guards, responsive. Respeta documento maestro, tasks y Appwrite 1.9."
agent: "planner"
argument-hint: "Nombre del módulo a implementar (ej: checkout, experiencias, tickets...)"
tools: [read, edit, search, run]
---

Quiero que implementes el módulo **`{{MODULE_NAME}}`** para OMZONE.

---

## Fase 1 — Análisis previo (OBLIGATORIO antes de tocar código)

### 1.1 Consultar fuentes
- Lee el documento maestro: [requerimientos](../../OMZONE_requerimientos_maestros_appwrite_1_9.md)
- Revisa task docs existentes en `docs/tasks/` que mencionen este módulo
- Revisa las instructions relevantes en `.github/instructions/`
- Identifica el dominio del módulo:
  - [ ] Editorial (experiencias, publicaciones, tags)
  - [ ] Comercial (pricing, addons, paquetes, pases)
  - [ ] Agenda (slots, recursos, capacidad)
  - [ ] Operativo (bookings, validación)
  - [ ] Transaccional (órdenes, pagos, tickets, reembolsos)
  - [ ] Usuario (perfiles, preferencias)
  - [ ] Configuración (settings, templates)

### 1.2 Inventario de dependencias
Antes de implementar, enumera:

| Categoría | Elementos involucrados |
|---|---|
| **Tablas Appwrite** | qué colecciones se crean/leen/actualizan |
| **Functions** | qué Functions se crean o modifican |
| **Buckets Storage** | qué buckets intervienen |
| **Hooks** | qué hooks de React se crean o modifican |
| **Componentes** | qué componentes nuevos o actualizados |
| **Rutas** | qué rutas nuevas y con qué guards |
| **Labels involucrados** | qué labels (root/admin/operator/client) interactúan |

### 1.3 Proponer subtasks
Si el módulo es grande (más de 1-3 días de trabajo), divídelo en subtasks con formato:
```
1. [schema] Crear/actualizar tablas X, Y, Z
2. [function] Implementar Function create-xxx
3. [hook] Crear useXxx hook
4. [component] Implementar XxxPage y componentes hijos
5. [permissions] Configurar permisos y guards
6. [responsive] Verificar responsive en todas las superficies
```

Confirma el plan antes de proceder.

---

## Fase 2 — Implementación

### 2.1 Schema Appwrite (si aplica)
- Tablas en `snake_case`, atributos en `camelCase`
- Enums para estados (no booleans separados)
- Float para precios, datetime para fechas (UTC ISO 8601)
- Índices en atributos de query frecuente
- Permisos de colección coherentes:
  - Catálogo público: read `Role.any()`, write `Role.label("admin")`
  - Datos de usuario: read/write `Role.user(userId)` + `Role.label("admin")`
  - Operativos: read `Role.label("operator")` + admin
- Snapshots JSON en tablas transaccionales (órdenes, tickets)

### 2.2 Functions Appwrite (si aplica)
- Nombre en `kebab-case`, carpeta `functions/{name}/`
- Header JSDoc obligatorio (inputs, validaciones, permisos, entidades, env vars, errores)
- Orden de operaciones: parsear → validar → autenticar → autorizar → lógica → retornar
- Precios SIEMPRE de la DB, nunca del payload
- Verificar firma HMAC en webhooks Stripe
- Idempotencia donde aplique
- Respuestas: `{ success: boolean, data?: any, error?: string }`

### 2.3 Hooks de React (si aplica)
- Naming: `useCamelCase`
- Un hook por dominio
- Retornar `{ data, loading, error }` como mínimo
- No hardcodear IDs de database/colecciones

### 2.4 Componentes (si aplica)
- Naming: `PascalCase.jsx`
- Manejar 4 estados: loading, error, empty, success
- Data siempre via hook (no fetch directo)
- Superficie correcta:
  - **Público**: premium, editorial, aspiracional, NO marketplace
  - **Admin**: productivo, claro, tablas + formularios, sidebar colapsable
  - **Portal**: limpio, personal, wellness sutil
- TailwindCSS, mobile-first

### 2.5 Guards y permisos (si aplica)
- `/admin/*` → label `admin` o `root`
- `/portal/*` → label `client`
- Root NUNCA visible en UI
- Operator NO accede a catálogos ni config
- Permisos validados en Function, no solo en frontend

### 2.6 Responsive (si aplica)
- Verificar mínimo en 375px, 768px, 1024px, 1280px
- Grids que colapsan: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Tablas con alternativa móvil (cards o scroll horizontal)
- Touch targets >= 44x44px
- Sin overflow horizontal
- Modales: full-screen en móvil

---

## Fase 3 — Verificación

### Checklist post-implementación
- [ ] Schema con naming correcto y permisos coherentes
- [ ] Functions con validación, auth, autorización y error handling
- [ ] Hooks retornan data/loading/error
- [ ] Componentes manejan 4 estados
- [ ] Guards de ruta configurados
- [ ] Responsive verificado en 4 breakpoints
- [ ] Sin `Role.any()` write en datos sensibles
- [ ] Sin precios del frontend en Functions
- [ ] Root invisible en toda la UI
- [ ] Snapshots creados en tablas transaccionales

---

## Output esperado

```markdown
### Módulo implementado: {{MODULE_NAME}}

**Dominio:** editorial | comercial | agenda | operativo | transaccional | ...
**Fase del roadmap:** N

#### Resumen de cambios
- Schema: tablas creadas/modificadas
- Functions: Functions creadas/modificadas
- Frontend: componentes y hooks
- Permisos: guards y labels configurados

#### Archivos creados
| Archivo | Tipo | Propósito |
|---|---|---|
| path/to/file | schema/function/component/hook | descripción |

#### Archivos modificados
| Archivo | Cambio |
|---|---|
| path/to/file | qué cambió |

#### Riesgos identificados
- Riesgo 1 → mitigación
- Riesgo 2 → mitigación

#### Pruebas manuales sugeridas
1. Prueba 1 — pasos y resultado esperado
2. Prueba 2 — pasos y resultado esperado
```
