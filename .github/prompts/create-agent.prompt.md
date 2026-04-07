---
description: "Crear un nuevo agent (.agent.md) para el AI Kit de OMZONE. Genera el archivo completo con 11 secciones, frontmatter, contexto OMZONE y reglas de calidad."
argument-hint: "Nombre y propósito del agent (ej: 'notifications — gestión de messaging y correos transaccionales')"
tools: [read, edit, search]
---

Quiero que crees un nuevo **agent file** para el AI Kit de OMZONE.

---

## Agent a crear

- **Nombre:** {{AGENT_NAME}}
- **Propósito:** {{AGENT_PURPOSE}}
- **Archivo destino:** `.github/agents/{{AGENT_NAME}}.agent.md`

---

## Contexto fijo del proyecto

| Clave | Valor |
|---|---|
| Proyecto | OMZONE — plataforma de experiencias wellness premium |
| Backend | Appwrite self-hosted 1.9.0 |
| Endpoint | `https://aprod.racoondevs.com/v1` |
| Project ID | `omzone-dev` |
| Database | `omzone_db` |
| Frontend | React + Vite + JavaScript + TailwindCSS |
| Auth model | Labels: `root` (ghost), `admin`, `operator`, `client` |
| Pagos | Stripe Checkout Sessions + webhooks |
| Producto | Experiencias wellness (sesiones, inmersiones, retiros, estancias, privadas), addons, paquetes, pases consumibles |
| Naming | tablas=`snake_case`, atributos=`camelCase`, Functions=`kebab-case` |
| Docs | `docs/core/00_documento_maestro_requerimientos.md` |
| Tasks | `docs/tasks/` |

---

## Estructura obligatoria del agent

El archivo debe tener este frontmatter YAML:

```yaml
---
description: "Usar para [keywords específicas del dominio del agent]..."
tools: [lista de tools relevantes]
---
```

Y las siguientes 11 secciones en el body:

### 1. Misión
Párrafo breve describiendo exactamente qué hace este agent en OMZONE. Específico, no genérico.

### 2. Contexto fijo
Tabla con los datos del proyecto que este agent necesita tener siempre presentes.

### 3. Documentos de referencia
Lista de archivos del repo que el agent debe leer antes de actuar (master doc, task docs, instructions relevantes).

### 4. Alcance y responsabilidades
Tabla con 2 columnas: "Responsabilidad" y "Incluye". Mínimo 6 filas específicas al dominio.

### 5. Restricciones y reglas
Lista numerada de reglas que el agent NUNCA debe violar. Mínimo 8 reglas. Incluir reglas de seguridad, naming, permisos.

### 6. Flujo de trabajo
Pasos numerados que el agent debe seguir siempre, desde leer contexto hasta entregar resultado.

### 7. Checklist antes de entregar
Lista de verificación final. Mínimo 8 items. Checkbox format `- [ ]`.

### 8. Criterios de aceptación
Lista con formato `- [ ]` de lo que debe cumplirse para que el output sea válido.

### 9. Patrones y convenciones
Patrones específicos del dominio del agent, con ejemplos de código o configuración cuando aplique.

### 10. Errores comunes a evitar
Tabla con 2 columnas: "Error" y "Corrección". Mínimo 5 filas.

### 11. Formato de respuesta
Especificar cómo debe estructurar su output (markdown, código, tablas, etc.).

---

## Reglas de calidad

1. **Todo en español**
2. **Específico a OMZONE** — nunca genérico. Mencionar experiencias, wellness, Appwrite, labels, etc.
3. **Accionable** — cada sección debe ser útil para implementación real
4. **Consistente con agents existentes** — revisar `.github/agents/` para mantener el patrón
5. **Description como discovery surface** — la description debe contener las keywords que harán que el agent sea encontrado cuando se necesite
6. **No duplicar** — si otro agent ya cubre algo, referenciar en vez de repetir
7. **Mínimo 120 líneas** — un agent bien desarrollado no puede ser más corto

---

## Output

Genera el archivo completo listo para guardar en `.github/agents/{{AGENT_NAME}}.agent.md`.
