---
description: "Ejecutar QA completo sobre una task, módulo o flujo de OMZONE. Audita schema, permisos, Functions, UI, responsive, reglas de negocio y edge cases con reporte estructurado."
agent: "qa"
argument-hint: "Target del QA (ej: 'TASK-012 — CRUD de experiencias desde admin', 'flujo de checkout completo', 'módulo de tickets')"
tools: [read, search, run]
---

Ejecuta **QA completo** sobre el siguiente target de OMZONE:

**{{TARGET_SCOPE}}**

---

## Contexto del proyecto

| Clave | Valor |
|---|---|
| Proyecto | OMZONE — plataforma de experiencias wellness premium |
| Backend | Appwrite self-hosted 1.9.0 |
| Endpoint | `https://aprod.racoondevs.com/v1` |
| Project ID | `omzone-dev` |
| Database | `omzone_db` |
| Frontend | React + Vite + JavaScript + TailwindCSS |
| Auth model | Labels: `root`, `admin`, `operator`, `client` |
| Pagos | Stripe Checkout Sessions, webhooks HMAC-verificados |
| Doc maestro | `docs/core/00_documento_maestro_requerimientos.md` |

---

## Fuentes de verdad

Antes de ejecutar QA, **lee obligatoriamente**:

1. `docs/core/00_documento_maestro_requerimientos.md` — reglas de negocio y definiciones de dominio
2. Task doc del target (en `docs/tasks/`) — alcance, criterios de aceptación, impacto técnico
3. `appwrite.json` — schema actual: tablas, atributos, relaciones, permisos
4. Código fuente de los componentes/Functions/hooks implicados

> Si el target no tiene task doc, basar el QA en el documento maestro y el código implementado.

---

## Proceso de QA — 4 fases

### Fase 1: Preparación

1. Leer el task doc o definir el alcance del QA si no hay task doc
2. Identificar todas las entidades involucradas:

| Entidad | Elementos |
|---|---|
| **Tablas** | Listar colecciones implicadas |
| **Functions** | Listar Functions involucradas |
| **Storage** | Listar buckets si aplica |
| **Componentes** | Listar componentes React |
| **Hooks** | Listar custom hooks |
| **Rutas** | Listar rutas/páginas afectadas |

3. Identificar los roles que interactúan: `admin`, `operator`, `client`, anónimo
4. Listar los criterios de aceptación del task doc (si existe)

> **Criterio de avance:** tengo inventario completo de entidades + roles + criterios.

### Fase 2: Auditoría técnica

Revisar cada área en orden. Documentar hallazgos como issues con ID `QA-NNN`.

#### 2.1 Schema Appwrite
- [ ] Las tablas existen en `appwrite.json` con los atributos correctos
- [ ] Los tipos de dato son correctos (string, integer, boolean, enum, datetime, etc.)
- [ ] Las relaciones están configuradas (tipo, dirección, onDelete)
- [ ] Los índices necesarios existen (búsqueda, filtrado, unicidad)
- [ ] Los atributos required/optional están configurados correctamente
- [ ] Los valores por defecto son correctos
- [ ] No hay atributos huérfanos o sin uso

#### 2.2 Permisos y labels
- [ ] Permisos de colección configurados por rol: quién lee, escribe, actualiza, borra
- [ ] `admin` tiene acceso completo a CRUD de su dominio
- [ ] `operator` tiene acceso limitado según doc maestro (sin borrar, sin config sensible)
- [ ] `client` solo accede a sus propios datos y contenido público
- [ ] `root` no está expuesto en UI, navegación ni logs visibles
- [ ] Guards de ruta implementados en frontend
- [ ] Functions validan labels del caller antes de ejecutar
- [ ] No hay escalación de privilegios posible

#### 2.3 Appwrite Functions
- [ ] Siguen el patrón init→parse→validate→auth→authorize→logic→return
- [ ] Validación de cada campo de entrada con early return
- [ ] Error handling con códigos descriptivos (`ERR_DOMINIO_CAUSA`)
- [ ] Respuestas estructuradas: `{ ok: true, data }` o `{ ok: false, error }`
- [ ] Variables de entorno documentadas en `.env.example`
- [ ] Idempotencia implementada donde aplica (checkout, tickets, webhooks)
- [ ] Snapshots generados en operaciones transaccionales
- [ ] No hay console.log — solo `log()` y `error()` del contexto

#### 2.4 Frontend — Lógica
- [ ] Los hooks manejan estados: loading, error, success, empty
- [ ] Las llamadas API tienen error handling
- [ ] Los formularios validan input antes de enviar
- [ ] El estado global es consistente después de operaciones CRUD
- [ ] La navegación respeta guards de ruta por label
- [ ] No hay datos sensibles en el cliente (API keys, secrets)

#### 2.5 Frontend — UI
- [ ] Los componentes muestran estados de loading/error/empty correctamente
- [ ] Las acciones destructivas requieren confirmación
- [ ] Los formularios muestran errores de validación inline
- [ ] Los toasts/notificaciones son descriptivos
- [ ] La estética es premium/wellness — no marketplace genérico

#### 2.6 Responsive
- [ ] Layout correcto en: xs (<640px), sm (640px), md (768px), lg (1024px), xl (1280px)
- [ ] No hay overflow horizontal en ningún breakpoint
- [ ] Tablas se adaptan (scroll horizontal o card layout en mobile)
- [ ] Modales se adaptan (full-screen o bottom sheet en mobile)
- [ ] Touch targets mínimo 44x44px
- [ ] Formularios se colapsan a single-column en mobile

#### 2.7 Reglas de negocio
- [ ] Distinción editorial vs comercial respetada
- [ ] Tipos de experiencia manejados correctamente (sesión, inmersión, retiro, estancia)
- [ ] Precios/variantes/tiers funcionan según doc maestro
- [ ] Addons se asocian correctamente a experiencias
- [ ] Paquetes/pases consumen correctamente
- [ ] Checkout genera orden + snapshot completo
- [ ] Tickets se emiten después de pago confirmado
- [ ] Redenciones validan stock/disponibilidad

#### 2.8 Edge cases y estados límite
- [ ] ¿Qué pasa si una experiencia no tiene variantes?
- [ ] ¿Qué pasa si el stock llega a 0 durante checkout?
- [ ] ¿Qué pasa si el usuario pierde conexión durante checkout?
- [ ] ¿Qué pasa con datos vacíos o nulos en campos opcionales?
- [ ] ¿Qué pasa si se intenta acceder a un recurso inexistente?
- [ ] ¿Qué pasa si se intenta acceder a un recurso de otro usuario?
- [ ] ¿Qué pasa con caracteres especiales en inputs de texto?
- [ ] ¿Qué pasa si un webhook de Stripe llega duplicado?

> **Criterio de avance:** todas las áreas revisadas, issues documentados como QA-NNN.

### Fase 3: Validación de criterios de aceptación

Si hay task doc con criterios de aceptación:

9. Verificar **cada criterio** individualmente
10. Para cada criterio, documentar:
    - ✅ Pasa — con evidencia
    - ❌ Falla — con QA-NNN asociado
    - ⚠️ Parcial — qué falta

> **Criterio de avance:** todos los criterios evaluados.

### Fase 4: Reporte final

11. Compilar el reporte con el formato de output abajo

---

## Severidades

| Nivel | Criterio | Ejemplo |
|---|---|---|
| **critical** | Funcionalidad rota, datos corrompidos, seguridad comprometida | Checkout cobra pero no genera ticket; usuario ve datos de otro |
| **major** | Funcionalidad degradada, UX severamente afectada | Formulario no muestra errores; admin no puede editar experiencia |
| **minor** | Inconsistencia menor, UX levemente afectada | Spacing incorrecto; toast genérico en vez de descriptivo |
| **cosmetic** | Detalle visual, no afecta funcionalidad ni UX | Color ligeramente off; alignment de 1-2px |

---

## Formato de issue

```markdown
### QA-NNN: [Título descriptivo]

- **Severidad:** critical | major | minor | cosmetic
- **Área:** schema | permisos | function | frontend-lógica | frontend-UI | responsive | negocio | edge-case
- **Componente/archivo:** path exacto
- **Descripción:** qué falla y cómo se manifiesta
- **Expected:** comportamiento esperado según doc maestro o task doc
- **Actual:** comportamiento observado
- **Pasos de reproducción:** si aplica
- **Fix sugerido:** approach, no código completo
```

---

## Output esperado

```markdown
# QA Report: {{TARGET_SCOPE}}

## Resumen ejecutivo

| Severidad | Cantidad |
|---|---|
| Critical | N |
| Major | N |
| Minor | N |
| Cosmetic | N |
| **Total** | **N** |

## Criterios de aceptación

| # | Criterio | Estado | Issue asociado |
|---|---|---|---|
| 1 | descripción | ✅ / ❌ / ⚠️ | QA-NNN |

## Issues detallados

### QA-001: ...
(formato completo por issue)

## Áreas sin issues

- Lista de áreas que pasaron limpiamente

## Recomendación de salida

- **✅ APROBADO** — listo para producción
- **⚠️ APROBADO CON OBSERVACIONES** — puede salir, pero requiere fix de issues minor/cosmetic
- **❌ RECHAZADO** — requiere fix de issues critical/major antes de salir

## Recomendaciones generales
<!-- Patrones recurrentes, deuda técnica detectada, mejoras sugeridas para futuras tasks -->
```
