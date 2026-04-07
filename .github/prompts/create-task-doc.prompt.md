---
description: "Crear un task doc formal de OMZONE a partir del documento maestro. Genera alcance definido, dependencias, impacto técnico, criterios de aceptación verificables y riesgos."
agent: "planner"
argument-hint: "Título y objetivo de la task (ej: 'CRUD de experiencias — implementar alta, edición y baja de experiencias desde admin')"
tools: [read, search]
---

Quiero que generes un **task doc** formal para OMZONE.

---

## Task solicitada

- **Título tentativo:** {{TASK_TITLE}}
- **Objetivo:** {{TASK_OBJECTIVE}}
- **Ruta destino:** `docs/tasks/{{TASK_FILENAME}}.md`

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

## Fuente de verdad

Antes de redactar la task, **lee obligatoriamente**:

1. `docs/core/00_documento_maestro_requerimientos.md` — para entender el dominio, entidades, reglas de negocio y relaciones
2. `appwrite.json` — para verificar tablas, atributos y relaciones existentes
3. `docs/tasks/` — para revisar tasks existentes y evitar duplicación o conflicto
4. La instrucción `.github/instructions/task-docs.instructions.md` — para seguir las reglas de redacción

---

## Plantilla obligatoria del task doc

```markdown
# {{TASK_ID}}: {{TASK_TITLE}}

## Objetivo
<!-- Una descripción clara y concisa de qué logra esta task -->
<!-- Debe responder: ¿qué puede hacer el usuario/admin después de completar esta task? -->

## Dependencias
<!-- Tasks o módulos que deben estar completos antes de iniciar -->
<!-- Formato: [TASK-XXX](path) — descripción breve -->
<!-- Si no hay dependencias, indicar "Ninguna" -->

## Alcance — Qué incluye
<!-- Lista numerada de todo lo que se implementa -->
<!-- Ser específico: "CRUD de experiencias desde admin" no "módulo de experiencias" -->

## Alcance — Qué NO incluye
<!-- Lista explícita de lo que queda fuera -->
<!-- Esto evita scope creep y aclara expectativas -->

## Impacto técnico

### Tablas/colecciones implicadas
<!-- Tabla con: nombre | acción (crear/modificar/leer) | atributos clave -->
| Tabla | Acción | Atributos clave |
|---|---|---|
| `nombre_tabla` | crear / modificar / leer | `attr1`, `attr2`, ... |

### Appwrite Functions implicadas
<!-- Lista con: nombre | trigger | propósito -->
| Function | Trigger | Propósito |
|---|---|---|
| `function-name` | HTTP POST / Event / Schedule | descripción |

### Storage implicado
<!-- Buckets que se crean o usan. "Ninguno" si no aplica -->

### Pantallas / componentes implicados
<!-- Lista de páginas o componentes React que se crean o modifican -->
| Componente | Superficie | Acción |
|---|---|---|
| `ComponentName` | admin / público / client portal | crear / modificar |

### Roles y labels implicados
<!-- Qué labels interactúan con esta task -->
| Label | Acceso | Restricciones |
|---|---|---|
| `admin` | CRUD completo | — |
| `operator` | lectura + edición | sin borrar |
| `client` | lectura pública | sin acceso admin |

## Criterios de aceptación
<!-- Lista con [ ] — cada criterio debe ser verificable por QA -->
<!-- Incluir happy path + edge cases + permisos + responsive -->
- [ ] criterio verificable 1
- [ ] criterio verificable 2
- ...

## Riesgos y notas
<!-- Decisiones de diseño, puntos de atención, posibles bloqueos -->
<!-- Incluir nota si afecta datos existentes o requiere migración -->
```

---

## Reglas de redacción

### Alcance
1. Una task debe poder completarse en **1-3 días de trabajo enfocado** — si es más grande, descomponerla
2. El alcance debe cubrir **un flujo funcional completo**, no un fragmento arbitrario
3. "Qué NO incluye" es tan importante como "Qué incluye" — ser explícito

### Criterios de aceptación
4. Cada criterio debe ser **verificable sin ambigüedad** — nada de "funciona correctamente" o "se ve bien"
5. Incluir criterios de: happy path, validación de input, permisos/labels, responsive, edge cases
6. Mínimo **8 criterios** por task
7. Al menos 1 criterio de permisos y 1 de responsive si la task tiene UI

### Dependencias
8. Toda dependencia debe tener **referencia concreta**: task ID, módulo, tabla
9. Si la task crea tablas, verificar que no existan ya en `appwrite.json`
10. Si la task usa Functions, verificar que la Function exista o incluirla en el alcance

### Impacto técnico
11. Listar **todas** las tablas, Functions, buckets, componentes afectados — no solo los creados
12. Indicar acción por tabla: crear nueva, modificar existente, solo lectura
13. Si se modifican atributos de tablas existentes, documentar implicaciones de migración

### Consistencia
14. Usar naming conventions OMZONE: tablas=`snake_case`, atributos=`camelCase`, Functions=`kebab-case`, componentes=`PascalCase`
15. ID de task: `TASK-NNN` con numeración secuencial
16. Nombre de archivo: `TASK-NNN_titulo-kebab-case.md`

### Dominio
17. Respetar la distinción editorial vs comercial: una experiencia tiene narrativa pública distinta a su configuración vendible
18. En tasks transaccionales: exigir snapshots, no dependencia de datos vivos
19. Nunca mezclar accesos: `admin`, `operator`, `client` tienen permisos distintos definidos en el doc maestro
20. No exponer `root` en ninguna superficie visible

---

## Dominios de referencia

Al redactar la task, ubicarla en uno de estos dominios:

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

---

## Checklist de calidad del task doc

- [ ] Título claro y específico
- [ ] Objetivo responde "¿qué puede hacer el usuario/admin después?"
- [ ] Alcance es completable en 1-3 días
- [ ] "Qué NO incluye" está explícito
- [ ] Todas las tablas/Functions/componentes listados con acción
- [ ] Cada criterio de aceptación es verificable
- [ ] Mínimo 8 criterios de aceptación
- [ ] Dependencias tienen referencia concreta
- [ ] Naming conventions OMZONE respetadas
- [ ] No hay ambigüedad en alcance ni criterios
- [ ] Riesgos y notas documentados
- [ ] Task no duplica otra existente en `docs/tasks/`

---

## Output esperado

1. **Archivo de task doc** completo siguiendo la plantilla
2. **Task ID** asignado secuencialmente
3. **Nombre de archivo** en formato `TASK-NNN_titulo-kebab-case.md`
4. **Lista de dependencias** verificadas contra tasks existentes
