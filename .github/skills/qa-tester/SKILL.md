# Skill: QA Tester

## Cuándo usarlo

- Cuando una task se marca como completada y necesita validación antes de aprobarla
- Al ejecutar QA sobre un módulo o flujo completo de OMZONE (experiencias, checkout, tickets, admin, customer portal)
- Cuando se detectan bugs y se necesita un barrido sistemático de la funcionalidad afectada
- Antes de aprobar un deploy que toca lógica de negocio, permisos o transacciones
- Después de corregir un bug para verificar que no se introdujeron regresiones

**Ejemplos concretos:**
- "Ejecutar QA sobre TASK-012: CRUD de experiencias desde admin"
- "Validar el flujo completo de checkout después del fix de pricing"
- "Auditar permisos del customer portal — un client no debe ver datos de otro"

## Cuándo NO usarlo

- Para auditar solo responsive → usar skill `responsive-auditor`
- Para validar solo el flujo de checkout → usar skill `checkout-flow-validator`
- Para validar solo webhooks de Stripe → usar skill `stripe-webhook-validator`
- Para validar solo la emisión de tickets → usar skill `ticketing-flow-tester`
- Para escribir la task doc → usar skill `task-doc-writer`

## Entradas necesarias

- [ ] Documento maestro leído: `docs/core/00_documento_maestro_requerimientos.md`
- [ ] Task doc del target (si existe): `docs/tasks/TASK-NNN_*.md`
- [ ] `appwrite.json` revisado: tablas, atributos, relaciones, permisos implicados
- [ ] Código fuente de componentes, hooks y Functions involucrados
- [ ] Identificación del target: task ID, módulo o flujo a probar
- [ ] Lista de roles que interactúan: `admin`, `operator`, `client`, anónimo

## Procedimiento paso a paso

### Fase 1: Preparación

**Paso 1 — Definir alcance del QA**
Leer el task doc (si existe) o definir el alcance basado en la solicitud:
- Qué funcionalidad se prueba
- Qué roles interactúan
- Qué superficie (pública, admin, client portal)
- Criterios de aceptación del task doc (si los hay)

> ✅ Hecho cuando: tengo alcance claro con lista de funcionalidades a probar.

**Paso 2 — Inventariar entidades**
Listar todas las piezas involucradas:

| Entidad | Elementos |
|---|---|
| Tablas | Colecciones Appwrite implicadas |
| Functions | Functions que se invocan |
| Storage | Buckets si aplica |
| Componentes | Componentes React afectados |
| Hooks | Custom hooks usados |
| Rutas | Páginas/rutas del router |

> ✅ Hecho cuando: tengo inventario completo.

**Paso 3 — Preparar matriz de pruebas**
Para cada funcionalidad, definir:
- Happy path: flujo normal exitoso
- Validación: qué pasa con input inválido
- Permisos: qué pasa con cada label
- Edge cases: estados límite
- Responsive: si tiene UI

> ✅ Hecho cuando: tengo matriz con escenarios por funcionalidad.

### Fase 2: Ejecución

**Paso 4 — Auditar schema Appwrite**
Verificar en `appwrite.json`:
- [ ] Las tablas implicadas existen con atributos correctos
- [ ] Tipos de dato correctos: string, integer, boolean, float, enum, datetime
- [ ] Relaciones configuradas: tipo (oneToOne, oneToMany, manyToOne, manyToMany), dirección, `onDelete`
- [ ] Índices necesarios: búsqueda, filtrado, unicidad
- [ ] Atributos required/optional configurados correctamente
- [ ] Valores por defecto correctos

Documentar como `QA-NNN` cualquier discrepancia.

> ✅ Hecho cuando: schema revisado, issues documentados.

**Paso 5 — Auditar permisos y labels**
Verificar por cada rol:

| Aspecto | admin | operator | client | anónimo |
|---|---|---|---|---|
| Permisos de colección | ¿correcto? | ¿correcto? | ¿correcto? | ¿correcto? |
| Guards de ruta frontend | ¿correcto? | ¿correcto? | ¿correcto? | ¿correcto? |
| Verificación de labels en Functions | ¿correcto? | ¿correcto? | ¿correcto? | ¿correcto? |
| UI condicional | ¿correcto? | ¿correcto? | ¿correcto? | ¿correcto? |

Reglas clave:
- `admin` → CRUD completo de su dominio
- `operator` → lectura + edición, sin borrar, sin config sensible
- `client` → solo sus propios datos y contenido público
- `root` → NO debe aparecer en UI, navegación ni logs visibles
- Un `client` NUNCA debe ver datos de otro `client`

> ✅ Hecho cuando: permisos verificados por rol, issues documentados.

**Paso 6 — Auditar Functions**
Para cada Function involucrada:
- [ ] Sigue el patrón: init → parse → validate → auth → authorize → logic → return
- [ ] Valida cada campo de entrada con early return
- [ ] Verifica labels del caller
- [ ] Error codes descriptivos: `ERR_DOMINIO_CAUSA`
- [ ] Respuesta estructurada: `{ ok: true, data }` o `{ ok: false, error: { code, message } }`
- [ ] Idempotencia donde aplica (pagos, webhooks)
- [ ] Snapshots donde aplica (transacciones)
- [ ] No hay `console.log`, solo `log()` / `error()`
- [ ] Variables de entorno documentadas en `.env.example`

> ✅ Hecho cuando: Functions auditadas, issues documentados.

**Paso 7 — Auditar lógica de frontend**
Para cada componente/hook involucrado:
- [ ] Hooks manejan estados: loading, error, success, empty
- [ ] Llamadas API tienen error handling
- [ ] Formularios validan input antes de enviar
- [ ] Estado es consistente después de operaciones CRUD
- [ ] Navegación respeta guards de ruta por label
- [ ] No hay datos sensibles en el cliente (API keys, secrets)
- [ ] Acciones destructivas requieren confirmación
- [ ] Toasts/notificaciones son descriptivos

> ✅ Hecho cuando: lógica frontend auditada, issues documentados.

**Paso 8 — Auditar UI y responsive**
- [ ] Componentes muestran estados loading/error/empty
- [ ] Formularios muestran errores inline
- [ ] Layout correcto en: xs, sm, md, lg, xl
- [ ] No hay overflow horizontal
- [ ] Touch targets mínimo 44x44px
- [ ] Tablas se adaptan en mobile (scroll horizontal o cards)
- [ ] Modales se adaptan en mobile (full-screen o bottom sheet)
- [ ] Estética premium/wellness mantenida — no marketplace genérico

> ✅ Hecho cuando: UI y responsive auditados, issues documentados.

**Paso 9 — Auditar reglas de negocio**
Verificar contra el documento maestro:
- [ ] Tipos de experiencia manejados correctamente (sesión, inmersión, retiro, estancia)
- [ ] Distinción editorial vs comercial respetada
- [ ] Precios/variantes/tiers según doc maestro
- [ ] Addons se asocian correctamente a experiencias
- [ ] Paquetes/pases consumen correctamente
- [ ] Snapshots preservan datos históricos en transacciones
- [ ] Stock se valida y decrementa correctamente

> ✅ Hecho cuando: reglas de negocio verificadas, issues documentados.

**Paso 10 — Probar edge cases**
Casos límite estándar de OMZONE:

| Edge case | Verificar |
|---|---|
| Experiencia sin variantes | ¿Se muestra mensaje? ¿No se rompe? |
| Edición con stock = 0 | ¿Se bloquea la selección? |
| Edición con fecha pasada | ¿Se oculta o muestra como expirada? |
| Input vacío en campos requeridos | ¿Validation error inline? |
| Caracteres especiales en textos | ¿No hay XSS ni quiebre de layout? |
| Recurso inexistente (ID inválido en URL) | ¿404 elegante? |
| Acceso a recurso de otro usuario | ¿403 o redirección? |
| Sesión expirada durante operación | ¿Redirección a login? |

> ✅ Hecho cuando: edge cases probados, issues documentados.

### Fase 3: Validación

**Paso 11 — Verificar criterios de aceptación del task doc**
Si hay task doc con criterios:
- Evaluar cada criterio individualmente
- Marcar: ✅ pasa, ❌ falla (con QA-NNN), ⚠️ parcial (con nota)

Si no hay task doc:
- Verificar contra las reglas del documento maestro

> ✅ Hecho cuando: todos los criterios evaluados.

**Paso 12 — Compilar reporte**
Generar el reporte con formato estándar (ver Output esperado).

> ✅ Hecho cuando: reporte completo con todos los issues, severidades y recomendación.

## Checklist de entrega

- [ ] Alcance del QA definido con funcionalidades, roles y superficie
- [ ] Schema Appwrite auditado: tablas, atributos, relaciones, índices
- [ ] Permisos verificados por cada rol: admin, operator, client, anónimo
- [ ] Functions auditadas: patrón, validación, auth, error codes, idempotencia, snapshots
- [ ] Frontend — lógica auditada: hooks, estados, error handling, guards
- [ ] Frontend — UI auditada: loading/error/empty states, responsiva, estética premium
- [ ] Reglas de negocio verificadas contra documento maestro
- [ ] Edge cases probados: stock=0, fecha pasada, input inválido, acceso cruzado
- [ ] Criterios de aceptación del task doc evaluados (si aplica)
- [ ] Issues numerados con severidad y formato QA-NNN
- [ ] Recomendación de salida clara: aprobado / con observaciones / rechazado
- [ ] `root` no expuesto en ningún punto del flujo

## Errores comunes

❌ **Probar solo el happy path** → ✅ El happy path es el mínimo. QA debe cubrir validación, permisos, edge cases y responsive. Un flujo puede funcionar perfecto con datos correctos y romperse con un campo vacío.

❌ **No probar con diferentes roles/labels** → ✅ Un `client` no debe ver datos de otro `client`. Un `operator` no debe poder borrar. Probar cada acción con cada rol involucrado.

❌ **No cruzar con el documento maestro** → ✅ El task doc puede omitir reglas que el doc maestro sí define. Siempre verificar contra la fuente de verdad, no solo contra el task doc.

❌ **Auditar responsive solo en desktop** → ✅ Revisar al menos en xs (<640px), md (768px) y xl (1280px). Los quiebres más comunes ocurren en mobile.

❌ **No verificar snapshots en operaciones transaccionales** → ✅ Si el flujo involucra checkout, orden o ticket, verificar que el snapshot contiene TODOS los datos necesarios para reconstruir sin leer datos vivos.

❌ **Issues sin pasos de reproducción** → ✅ Cada issue QA-NNN debe incluir pasos claros para reproducir. "No funciona" no es un reporte — "Al hacer X con rol Y, se espera Z pero ocurre W" sí lo es.

❌ **Ignorar la estética premium** → ✅ OMZONE no es un marketplace genérico. Si la UI se ve como un CRUD administrativo básico en la superficie pública, es un issue minor o major según el contexto.

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

## Criterios de aceptación (si hay task doc)

| # | Criterio | Estado | Issue |
|---|---|---|---|
| 1 | descripción | ✅ / ❌ / ⚠️ | QA-NNN |

## Issues detallados

### QA-001: [Título descriptivo]
- **Severidad:** critical | major | minor | cosmetic
- **Área:** schema | permisos | function | frontend-lógica | frontend-UI | responsive | negocio | edge-case
- **Componente/archivo:** path exacto
- **Descripción:** qué falla
- **Expected:** comportamiento esperado
- **Actual:** comportamiento observado
- **Pasos de reproducción:** 1-2-3
- **Fix sugerido:** approach

## Áreas sin issues
- Lista de áreas clean

## Recomendación
- ✅ APROBADO — listo para producción
- ⚠️ CON OBSERVACIONES — puede salir, fix minor/cosmetic pendientes
- ❌ RECHAZADO — fix de critical/major antes de salir
```

### Severidades de referencia

| Nivel | Criterio |
|---|---|
| **critical** | Funcionalidad rota, datos corrompidos, seguridad comprometida, pérdida de dinero |
| **major** | UX severamente degradada, permisos incorrectos, feature incompleta |
| **minor** | Inconsistencia menor, spacing off, mensaje genérico |
| **cosmetic** | Detalle visual, no afecta funcionalidad |

## Referencias cruzadas

- Documento maestro: `docs/core/00_documento_maestro_requerimientos.md`
- Task docs: `docs/tasks/`
- Schema: `appwrite.json`
- Instrucción de schema: `.github/instructions/appwrite-schema.instructions.md`
- Instrucción de componentes: `.github/instructions/react-components.instructions.md`
- Instrucción de responsive: `.github/instructions/responsive.instructions.md`
- Agente que invoca este skill: `.github/agents/qa.agent.md`
- Prompt relacionado: `.github/prompts/run-qa.prompt.md`
- Skills complementarios: `checkout-flow-validator`, `stripe-webhook-validator`, `ticketing-flow-tester`, `responsive-auditor`
