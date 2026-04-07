---
description: "Generar un bundle completo de customización AI para OMZONE: agents, instructions, prompts y skills. Útil para bootstrap o expansión del AI Kit."
argument-hint: "Qué tipo de bundle generar (ej: nuevo dominio, expansión de agents, skill pack...)"
tools: [read, edit, search]
---

Quiero que generes un **bundle de customización AI** para el proyecto OMZONE.

---

## Contexto del proyecto

| Clave | Valor |
|---|---|
| Proyecto | OMZONE — plataforma de experiencias wellness premium |
| Backend | Appwrite self-hosted 1.9.0 |
| Endpoint | `https://aprod.racoondevs.com/v1` |
| Project ID | `omzone-dev` |
| Frontend | React + Vite + TailwindCSS |
| Auth | Labels: `root` (ghost), `admin`, `operator`, `client` |
| Pagos | Stripe Checkout Sessions + webhooks |
| Producto | Experiencias (sesiones, inmersiones, retiros, estancias, privadas), addons, paquetes, pases consumibles |

---

## Estructura existente del AI Kit

```
.github/
  agents/          # 15 agents especializados
  instructions/    # 6 archivos de convenciones
  prompts/         # 10 prompts reutilizables
  skills/          # 7 skills con procedimientos
```

---

## Qué quiero generar

{{BUNDLE_DESCRIPTION}}

---

## Reglas para generar cada tipo de archivo

### Agents (`.github/agents/{name}.agent.md`)
- Frontmatter: `description` (frase "Usar para..." con keywords), `tools`
- Secciones obligatorias: misión, contexto fijo, responsabilidades, restricciones, flujo de trabajo, checklist, criterios de aceptación, errores comunes, formato de respuesta
- Específico a OMZONE, nunca genérico
- En español

### Instructions (`.github/instructions/{name}.instructions.md`)
- Frontmatter: `description` (frase "Usar cuando..." con keywords), `applyTo` (glob patterns)
- Secciones: entorno, naming, reglas, patrones, checklist, errores frecuentes
- Concreto y accionable, con tablas y ejemplos
- En español

### Prompts (`.github/prompts/{name}.prompt.md`)
- Frontmatter: `description`, `agent` (opcional), `argument-hint` (opcional), `tools`
- Single task focus — un prompt = una tarea clara
- Variables con `{{VARIABLE_NAME}}`
- Incluir: contexto necesario, pasos, reglas, output esperado
- En español

### Skills (`.github/skills/{slug}/SKILL.md`)
- Frontmatter: `name`, `description` (frase "Use when..." con keywords específicos)
- Secciones: cuándo usar, entradas, procedimiento paso a paso, checklist, errores comunes, output esperado, referencias
- Autocontenido — el agente debe poder ejecutar sin preguntar
- En español

---

## Principios de calidad

1. **Nada genérico**: todo debe mencionar OMZONE, Appwrite 1.9, labels, experiencias wellness, etc.
2. **Accionable**: cada archivo debe ser útil para implementación real, no solo documentación.
3. **Consistente**: seguir los patrones de los archivos existentes del AI Kit.
4. **Sin duplicación**: no repetir lo que ya existe — referenciar archivos existentes.
5. **Descriptions como discovery surface**: la description de cada archivo es lo que el agente usa para decidir si lo carga — incluir keywords relevantes.

---

## Output esperado

Para cada archivo generado, entregar:

```markdown
### Archivo: {path}

**Tipo:** agent | instruction | prompt | skill
**Propósito:** 1 línea

[contenido completo del archivo]
```

Al final, incluir un resumen:

```markdown
### Bundle generado

| Tipo | Archivo | Propósito |
|---|---|---|
| agent | path | descripción corta |
| instruction | path | descripción corta |
| prompt | path | descripción corta |
| skill | path | descripción corta |
```
