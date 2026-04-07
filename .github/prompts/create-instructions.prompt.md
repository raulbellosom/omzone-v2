---
description: "Crear un nuevo archivo de instructions (.instructions.md) para el AI Kit de OMZONE. Convenciones, reglas y patrones para un dominio específico del proyecto."
argument-hint: "Nombre y dominio de las instructions (ej: 'stripe — reglas para integración con Stripe')"
tools: [read, edit, search]
---

Quiero que crees un nuevo **archivo de instructions** para el AI Kit de OMZONE.

---

## Instruction a crear

- **Archivo:** `.github/instructions/{{INSTRUCTION_FILE}}.instructions.md`
- **Dominio:** {{INSTRUCTION_PURPOSE}}

---

## Contexto del proyecto

| Clave | Valor |
|---|---|
| Proyecto | OMZONE — plataforma de experiencias wellness premium |
| Backend | Appwrite self-hosted 1.9.0 |
| Frontend | React + Vite + JavaScript + TailwindCSS |
| Auth model | Labels: `root` (ghost), `admin`, `operator`, `client` |
| Naming | tablas=`snake_case`, atributos=`camelCase`, Functions=`kebab-case`, componentes=`PascalCase` |

---

## Estructura obligatoria

### Frontmatter YAML

```yaml
---
description: "Usar cuando se [acción específica con keywords del dominio]..."
applyTo: "glob/pattern/**"
---
```

**Reglas del frontmatter:**
- `description`: frase que empieza con "Usar cuando se..." seguida de keywords que el agente usará para decidir si carga el archivo
- `applyTo`: glob pattern que indica a qué archivos aplican estas instrucciones (ej: `src/**/*.jsx`, `functions/**`, `appwrite.json`)

### Body — Secciones requeridas

#### 1. Entorno y contexto
Datos del proyecto relevantes al dominio. Tabla con claves y valores concretos.

#### 2. Naming y convenciones
Reglas de nomenclatura específicas al dominio. Tabla de patrones con ejemplos correctos e incorrectos.

#### 3. Reglas obligatorias
Lista numerada de reglas que siempre deben cumplirse. Mínimo 10 reglas. Concretas y verificables.

#### 4. Patrones aprobados
Ejemplos de código/configuración que representan el patrón correcto. Con bloques de código.

#### 5. Anti-patrones
Ejemplos de lo que NO debe hacerse, con explicación de por qué y la alternativa correcta.

#### 6. Checklist de validación
Lista `- [ ]` de verificación que el agente debe revisar antes de considerar completa una tarea en este dominio.

#### 7. Errores frecuentes
Tabla con "Error", "Por qué ocurre" y "Corrección". Mínimo 5 filas.

#### 8. Referencias
Links a archivos del repo, documentación o secciones del master doc relevantes al dominio.

---

## Reglas de calidad

1. **En español**
2. **Específico a OMZONE** — mencionar datos concretos del proyecto, no reglas genéricas
3. **Accionable** — cada regla debe ser verificable mecánicamente
4. **Con ejemplos** — al menos 2 bloques de código por sección de patrones
5. **applyTo correcto** — el glob pattern debe cubrir exactamente los archivos afectados
6. **Consistente** — revisar las 6 instructions existentes en `.github/instructions/` para mantener estilo
7. **Sin duplicación** — si otra instruction ya cubre algo, referenciar en vez de copiar
8. **Mínimo 100 líneas** — instrucciones útiles no pueden ser más cortas

---

## Output

Genera el archivo completo listo para guardar en `.github/instructions/{{INSTRUCTION_FILE}}.instructions.md`.
