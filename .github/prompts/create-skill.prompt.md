---
description: "Crear un skill completo para OMZONE: SKILL.md con procedimiento detallado, checklist, errores comunes, referencias cruzadas y assets sugeridos."
argument-hint: "Nombre, slug y propósito del skill (ej: 'checkout-flow-validator — validar flujo completo de checkout contra reglas de negocio')"
tools: [read, edit, search, run]
---

Quiero que generes un **skill completo** para OMZONE.

---

## Skill solicitado

- **Nombre:** {{SKILL_NAME}}
- **Slug:** {{SKILL_SLUG}}
- **Propósito:** {{SKILL_PURPOSE}}
- **Ruta:** `.github/skills/{{SKILL_SLUG}}/`

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

## Estructura de archivos requerida

```
.github/skills/{{SKILL_SLUG}}/
  SKILL.md              # Documento principal del skill
  assets/               # Templates, snippets, ejemplos (si aplica)
  references/           # Links o extractos de doc maestro (si aplica)
```

> Solo crea `assets/` y `references/` si el skill los necesita realmente. No generar carpetas vacías.

---

## Plantilla obligatoria — `SKILL.md`

El archivo SKILL.md debe seguir esta estructura exacta:

```markdown
# Skill: {{SKILL_NAME}}

## Cuándo usarlo
<!-- Describir las situaciones específicas de OMZONE donde este skill aplica -->
<!-- Incluir ejemplos concretos: "Después de implementar un checkout", "Al crear una Function de webhook" -->

## Cuándo NO usarlo
<!-- Definir límites claros del skill -->
<!-- Evitar scope creep: qué queda fuera de este skill -->

## Entradas necesarias
<!-- Qué información, archivos o contexto necesita el agente antes de ejecutar -->
<!-- Listar con checkbox: [ ] documento maestro leído, [ ] task doc disponible, etc. -->

## Procedimiento paso a paso

### Fase 1: Preparación
<!-- 1-3 pasos de setup: leer docs, identificar alcance, listar entidades -->

### Fase 2: Ejecución
<!-- 3-8 pasos del trabajo principal, numerados, con sub-pasos si es necesario -->
<!-- Cada paso debe ser verificable -->

### Fase 3: Validación
<!-- 2-4 pasos de verificación final: checklist, pruebas, revisión cruzada -->

## Checklist de entrega
<!-- Lista de checks con [ ] que el agente debe completar antes de entregar -->
<!-- Mínimo 8 items. Incluir aspectos técnicos + reglas de negocio OMZONE -->

## Errores comunes
<!-- Lista de errors frecuentes con formato: -->
<!-- ❌ Error → ✅ Corrección -->
<!-- Mínimo 5 errores. Específicos de OMZONE, no genéricos -->

## Output esperado
<!-- Qué debe entregar el agente al terminar. Formato, archivos, estructura -->

## Referencias cruzadas
<!-- Links al documento maestro, task docs, instrucciones, otros skills -->
```

---

## Reglas de calidad

### Contenido
1. El skill debe ser **específico de OMZONE**, no genérico ni reutilizable para otros proyectos
2. Todos los ejemplos deben usar entidades reales del dominio: experiencias, sesiones, inmersiones, retiros, estancias, addons, paquetes, pases, tickets, órdenes
3. Los procedimientos deben ser ejecutables por un agente IA sin ambigüedad
4. Cada paso del procedimiento debe tener un criterio de "hecho" verificable
5. No omitir seguridad: permisos, labels, validación, snapshots donde aplique

### Relación con el ecosistema OMZONE
6. Referenciar el documento maestro con paths exactos: `docs/core/00_documento_maestro_requerimientos.md`
7. Referenciar task docs cuando el skill opera sobre implementaciones: `docs/tasks/`
8. Referenciar instrucciones relacionadas: `.github/instructions/`
9. Referenciar agentes que invocarían este skill: `.github/agents/`
10. Si el skill involucra schema, referenciar `appwrite.json` y la instrucción `appwrite-schema.instructions.md`

### Errores comunes — Qué incluir
11. Errores de permisos: olvidar verificar labels, exponer datos entre usuarios
12. Errores de snapshot: depender de datos vivos para reconstruir transacciones pasadas
13. Errores de naming: mezclar convenciones (`snake_case` vs `camelCase` vs `kebab-case`)
14. Errores de dominio: tratar OMZONE como marketplace genérico, ignorar la distinción editorial vs comercial
15. Errores de seguridad: validar solo en frontend, confiar en input del cliente

### Estructura
16. No generar secciones vacías — si una sección no aplica, omitirla y documentar por qué
17. Procedimiento mínimo de 8 pasos totales entre las 3 fases
18. Checklist mínimo de 8 items
19. Errores comunes mínimo de 5

---

## Tabla de skills existentes

Revisar estos skills existentes antes de crear uno nuevo para evitar duplicación y asegurar coherencia:

| Skill | Propósito |
|---|---|
| `appwrite-function-builder` | Crear/refactorizar Functions de Appwrite |
| `checkout-flow-validator` | Validar flujo de checkout completo |
| `qa-tester` | Ejecutar QA funcional, visual y de reglas de negocio |
| `responsive-auditor` | Auditar responsive design de vistas y componentes |
| `stripe-webhook-validator` | Validar implementación de webhooks de Stripe |
| `task-doc-writer` | Traducir objetivos del doc maestro a task docs |
| `ticketing-flow-tester` | Probar flujo de tickets/reservas/redenciones |

---

## Criterios de aceptación del skill

- [ ] SKILL.md sigue la plantilla completa sin secciones faltantes
- [ ] Todos los ejemplos usan dominio OMZONE real
- [ ] Procedimiento es ejecutable por agente IA sin intervención humana
- [ ] Cada paso tiene criterio de verificación
- [ ] Checklist cubre técnico + negocio + seguridad
- [ ] Errores comunes son específicos de OMZONE (no genéricos)
- [ ] Referencias cruzadas apuntan a archivos reales del proyecto
- [ ] No hay contenido placeholder ni Lorem ipsum
- [ ] El skill no duplica otro skill existente
- [ ] `assets/` y `references/` se crean solo si se usan

---

## Output esperado

1. **`SKILL.md`** completo siguiendo la plantilla
2. **`assets/`** con templates o snippets si el skill los requiere
3. **`references/`** con extractos relevantes del doc maestro si aplica
4. **Nota** indicando qué agentes y prompts deberían referenciar este skill
