# Skill: Task Doc Writer

## Cuándo usarlo

- Cuando un objetivo del documento maestro de OMZONE debe traducirse a una task implementable y verificable
- Al descomponer un módulo grande (ej: "checkout completo") en tasks incrementales de 1-3 días cada una
- Cuando se necesita definir alcance, dependencias, impacto técnico y criterios de aceptación antes de empezar a implementar
- Al iniciar una nueva fase del proyecto y se necesita planificar las tasks del sprint
- Cuando una task existente es demasiado grande y debe subdividirse

**Ejemplos concretos:**
- "Crear task doc para el CRUD de experiencias desde admin"
- "Descomponer el módulo de checkout en tasks incrementales"
- "Documentar la task de integración de Stripe webhooks con dependencias claras"
- "Crear task para implementar el customer portal — sección de tickets activos"

## Cuándo NO usarlo

- Para ejecutar QA sobre una task ya completada → usar skill `qa-tester`
- Para implementar una Function directamente → usar skill `appwrite-function-builder`
- Para crear contenido editorial → usar instrucción `content.instructions.md`
- Para auditar responsive de una implementación → usar skill `responsive-auditor`
- Para investigar bugs → usar prompt `fix-bug.prompt.md`

## Entradas necesarias

- [ ] Documento maestro leído: `docs/core/00_documento_maestro_requerimientos.md` — reglas de negocio, entidades, dominios
- [ ] `appwrite.json` revisado — para verificar qué tablas/atributos ya existen
- [ ] Carpeta `docs/tasks/` revisada — para saber qué tasks existen y asignar ID secuencial
- [ ] Instrucción de task docs leída: `.github/instructions/task-docs.instructions.md`
- [ ] Objetivo claro del solicitante: qué funcionalidad se quiere implementar
- [ ] Dominio identificado: en cuál de los 12 dominios de OMZONE cae la task

## Procedimiento paso a paso

### Fase 1: Preparación

**Paso 1 — Entender el objetivo y ubicarlo en el dominio**

Leer el documento maestro y ubicar el objetivo dentro de los 12 dominios:

| # | Dominio | Entidades principales |
|---|---|---|
| 1 | Experiencias | sesiones, inmersiones, retiros, estancias, experiencias privadas |
| 2 | Agenda / Ediciones | calendar, ediciones, slots, horarios |
| 3 | Precios / Variantes | tiers, variantes, pricing rules |
| 4 | Addons | complementos vendibles por experiencia |
| 5 | Paquetes / Pases | bundles, pases consumibles, redenciones |
| 6 | Checkout / Órdenes | cart, órdenes, pagos, Stripe sessions |
| 7 | Tickets / Reservas | tickets emitidos, QR, check-in, redenciones |
| 8 | Customer portal | perfil, historial, tickets activos, favoritos |
| 9 | Admin panel | dashboard, CRUD, reportes, configuración |
| 10 | CMS / Editorial | contenido público, narrativa, bloques, secciones |
| 11 | Media / Assets | imágenes, documentos, galerías, previews |
| 12 | Operación interna | asignación de recursos, facilitadores, espacios |

Identificar:
- Qué entidades del doc maestro están involucradas
- Qué reglas de negocio aplican
- Qué roles interactúan (admin, operator, client, anónimo)

> ✅ Hecho cuando: dominio identificado, entidades listadas, reglas de negocio entendidas.

**Paso 2 — Verificar estado actual del proyecto**

Antes de redactar, verificar:
- ¿Las tablas necesarias ya existen en `appwrite.json`? → Si sí, la task las usa; si no, la task las crea
- ¿Hay Functions relacionadas ya implementadas? → Si sí, la task las referencia; si no, las incluye en alcance
- ¿Hay tasks existentes en `docs/tasks/` que sean dependencia o se solapen? → Si sí, referenciar como dependencia y ajustar alcance
- ¿Cuál es el último ID de task asignado? → Asignar el siguiente secuencial

> ✅ Hecho cuando: estado actual verificado, ID asignado, dependencias identificadas.

**Paso 3 — Definir alcance mínimo viable**

El alcance debe cumplir:
- **Completable en 1-3 días** de trabajo enfocado
- **Flujo funcional completo**: desde la acción del usuario hasta el resultado (no fragmentos sueltos)
- **Verificable**: al terminar, se puede probar el flujo end-to-end

Si el objetivo es demasiado grande, descomponerlo:
- Task A: schema + backend (tablas, Functions)
- Task B: frontend admin (CRUD, formularios)
- Task C: frontend público (visualización, detalle)
- Task D: integración (checkout, tickets)

> ✅ Hecho cuando: alcance definido, completable en 1-3 días, con flujo funcional completo.

### Fase 2: Ejecución

**Paso 4 — Redactar el título y objetivo**

- **Título**: `TASK-NNN: [acción] + [entidad] + [contexto]`
  - Bien: `TASK-015: CRUD de experiencias desde admin panel`
  - Mal: `TASK-015: Experiencias` (demasiado ambiguo)
  - Mal: `TASK-015: Implementar módulo completo de experiencias con admin, público, checkout, tickets` (demasiado grande)

- **Objetivo**: responder "¿qué puede hacer el usuario/admin después de completar esta task?"
  - Bien: "Un admin puede crear, editar, ver y archivar experiencias desde el panel de administración"
  - Mal: "Implementar experiencias" (no dice qué se puede hacer al terminar)

> ✅ Hecho cuando: título específico, objetivo verificable.

**Paso 5 — Redactar alcance: qué incluye y qué NO incluye**

**Qué incluye** — lista numerada de todo lo que se implementa:
1. Ser específico con cada punto
2. Incluir backend (tablas, Functions) y frontend (componentes, páginas) si aplica
3. Indicar qué superficie: admin, público, client portal

**Qué NO incluye** — lista explícita de exclusiones:
1. Esto previene scope creep
2. Aclara expectativas
3. Debe incluir cosas que alguien podría asumir que están incluidas pero no lo están

> ✅ Hecho cuando: alcance y exclusiones son explícitos y sin ambigüedad.

**Paso 6 — Documentar impacto técnico**

Completar las 5 tablas de impacto:

**Tablas/colecciones:**

| Tabla | Acción | Atributos clave |
|---|---|---|
| `nombre` | crear / modificar / leer | `attr1`, `attr2` |

Reglas:
- Si la tabla existe en `appwrite.json`: indicar "modificar" o "leer"
- Si no existe: indicar "crear" y listar todos los atributos
- Usar naming `snake_case` para tablas, `camelCase` para atributos

**Functions:**

| Function | Trigger | Propósito |
|---|---|---|
| `function-name` | HTTP/Event/Schedule | descripción |

**Storage:** buckets involucrados o "Ninguno"

**Componentes:**

| Componente | Superficie | Acción |
|---|---|---|
| `ComponentName` | admin/público/portal | crear/modificar |

**Roles y labels:**

| Label | Acceso | Restricciones |
|---|---|---|
| `admin` | CRUD completo | — |
| `operator` | lectura + edición | sin borrar |
| `client` | lectura pública | sin acceso admin |

> ✅ Hecho cuando: las 5 tablas de impacto están completas.

**Paso 7 — Redactar criterios de aceptación**

Cada criterio debe ser **verificable sin ambigüedad** por QA. Mínimo 8 criterios.

Categories obligatorias:
1. **Happy path** (mínimo 2-3): flujo normal exitoso
2. **Validación** (mínimo 1-2): input inválido, campos faltantes
3. **Permisos** (mínimo 1): verificar que cada rol tiene el acceso correcto
4. **Responsive** (mínimo 1 si hay UI): verificar en mobile
5. **Edge cases** (mínimo 1-2): estados límite, datos vacíos

Formato:
```markdown
- [ ] Un admin puede crear una experiencia con título, tipo, descripción y categoría
- [ ] Al intentar crear sin título, se muestra error inline "El título es obligatorio"
- [ ] Un operator puede ver y editar experiencias pero NO puede eliminarlas
- [ ] El formulario de creación se colapsa a single-column en mobile (< 640px)
- [ ] Si no hay experiencias creadas, se muestra empty state con CTA "Crear primera experiencia"
```

Criterios que **NO** son aceptables:
- ❌ "Funciona correctamente" → ¿qué significa "correctamente"?
- ❌ "Se ve bien en mobile" → ¿qué es "bien"?
- ❌ "El admin puede gestionar experiencias" → ¿qué acciones específicas?

> ✅ Hecho cuando: mínimo 8 criterios verificables que cubren happy path, validación, permisos, responsive y edge cases.

**Paso 8 — Documentar dependencias, riesgos y notas**

**Dependencias:**
- Referencia concreta: `TASK-NNN: [título]` — qué provee
- Si tiene dependencias no resueltas, indicar que es bloqueante

**Riesgos:**
- Decisiones de diseño pendientes
- Posibles bloqueos técnicos
- Implicaciones de migración si modifica schema existente
- Puntos de atención para QA

> ✅ Hecho cuando: dependencias con referencia concreta, riesgos documentados.

### Fase 3: Validación

**Paso 9 — Validar contra el documento maestro**

Cruzar la task redactada contra el documento maestro:
- ¿El alcance es consistente con las reglas de negocio del doc maestro?
- ¿Los roles/permisos son correctos según la definición del doc maestro?
- ¿No se omite una regla de negocio que el doc maestro sí define?
- ¿La distinción editorial vs comercial se respeta?
- ¿Los snapshots se exigen donde el doc maestro los requiere?

> ✅ Hecho cuando: task es consistente con el documento maestro.

**Paso 10 — Validar calidad del task doc**

Pasar la checklist de calidad completa antes de entregar.

> ✅ Hecho cuando: todos los checks de la checklist pasan.

## Checklist de entrega

- [ ] ID asignado secuencialmente: `TASK-NNN`
- [ ] Archivo nombrado: `TASK-NNN_titulo-kebab-case.md`
- [ ] Título claro: `[acción] + [entidad] + [contexto]`
- [ ] Objetivo responde "¿qué puede hacer el usuario/admin después?"
- [ ] Alcance completable en 1-3 días de trabajo enfocado
- [ ] "Qué NO incluye" redactado explícitamente
- [ ] Todas las tablas de impacto completas (tablas, Functions, storage, componentes, roles)
- [ ] Naming conventions OMZONE respetadas: tablas `snake_case`, atributos `camelCase`, Functions `kebab-case`, componentes `PascalCase`
- [ ] Mínimo 8 criterios de aceptación verificables
- [ ] Al menos 1 criterio de permisos si la task tiene acceso diferenciado
- [ ] Al menos 1 criterio de responsive si la task tiene UI
- [ ] Dependencias con referencia concreta a tasks existentes
- [ ] Riesgos y notas documentados
- [ ] Task no duplica otra existente en `docs/tasks/`
- [ ] Task es consistente con el documento maestro

## Errores comunes

❌ **Tasks demasiado grandes: "implementar módulo de checkout completo"** → ✅ Descomponer en tasks de 1-3 días. Un checkout puede ser: Task A (schema + Function crear sesión), Task B (UI de selección y cart), Task C (webhook + orden), Task D (ticket + confirmación).

❌ **Criterios de aceptación ambiguos: "funciona correctamente"** → ✅ Cada criterio debe ser verificable por QA sin interpretación. "Un admin puede crear una experiencia con título y tipo" es verificable. "Las experiencias funcionan" no lo es.

❌ **Olvidar "Qué NO incluye"** → ✅ El scope creep viene de expectations implícitas. Si la task es "CRUD de experiencias", indicar explícitamente que NO incluye pricing, NO incluye media gallery, NO incluye vista pública.

❌ **No verificar schema existente antes de redactar** → ✅ Si la tabla ya existe en `appwrite.json`, la task la modifica o lee, no la "crea". Si un atributo ya existe, no duplicarlo. Revisar siempre antes de documentar impacto técnico.

❌ **Mezclar roles: "el usuario puede editar y borrar"** → ✅ ¿Qué usuario? El `admin` puede borrar, el `operator` puede editar pero NO borrar, el `client` no tiene acceso admin. Cada acción debe especificar el label.

❌ **Ignorar snapshots en tasks transaccionales** → ✅ Si la task involucra checkout, órdenes o tickets, los criterios DEBEN exigir snapshot completo. Nunca depender de datos vivos para reconstruir transacciones pasadas.

❌ **Dependencias vagas: "requiere backend listo"** → ✅ Cada dependencia debe ser una referencia concreta: `TASK-003: Schema de experiencias y ediciones` — no "requiere que el backend funcione".

## Output esperado

El archivo de task doc completo en formato Markdown, ubicado en `docs/tasks/TASK-NNN_titulo-kebab-case.md`, siguiendo la plantilla obligatoria con todas las secciones.

```
docs/tasks/TASK-NNN_titulo-kebab-case.md
```

Estructura del archivo:
```markdown
# TASK-NNN: [Título]
## Objetivo
## Dependencias
## Alcance — Qué incluye
## Alcance — Qué NO incluye
## Impacto técnico
### Tablas/colecciones implicadas
### Appwrite Functions implicadas
### Storage implicado
### Pantallas / componentes implicados
### Roles y labels implicados
## Criterios de aceptación
## Riesgos y notas
```

## Referencias cruzadas

- Documento maestro: `docs/core/00_documento_maestro_requerimientos.md`
- Task docs existentes: `docs/tasks/`
- Schema actual: `appwrite.json`
- Instrucción de task docs: `.github/instructions/task-docs.instructions.md`
- Prompt de creación: `.github/prompts/create-task-doc.prompt.md`
- Agente que invoca este skill: `.github/agents/planner.agent.md`
- Agente complementario: `.github/agents/architect.agent.md` (para decisiones de diseño previas a la task)
