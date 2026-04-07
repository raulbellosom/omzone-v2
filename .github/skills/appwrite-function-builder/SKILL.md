# Skill: Appwrite Function Builder

## Cuándo usarlo

- Al crear una nueva Appwrite Function para OMZONE (checkout, webhooks, emisión de tickets, validaciones, emails, PDFs)
- Al refactorizar una Function existente que no cumple el patrón estándar del proyecto
- Cuando una task doc indica que se necesita lógica en servidor: transacciones, permisos sensibles, integraciones externas
- Después de que el agente `functions` reciba un requerimiento que implica crear `functions/nombre-function/`

**Ejemplos concretos:**
- "Crear la Function `create-checkout` para iniciar Stripe Checkout Session"
- "Implementar `emit-ticket` para generar ticket después de pago confirmado"
- "Crear `validate-redemption` para validar y consumir un pase en check-in"

## Cuándo NO usarlo

- Para lógica que puede resolverse con queries directos desde frontend (listados públicos, lecturas simples)
- Para modificar schema Appwrite (tablas, atributos, relaciones) → usar instrucción `appwrite-schema.instructions.md`
- Para crear componentes React que solo consumen Functions ya existentes → usar instrucción `react-components.instructions.md`
- Para auditar una Function ya implementada → usar skill `qa-tester`

## Entradas necesarias

- [ ] Documento maestro leído: `docs/core/00_documento_maestro_requerimientos.md`
- [ ] Task doc disponible (si existe): `docs/tasks/TASK-NNN_*.md`
- [ ] `appwrite.json` revisado para tablas, atributos y relaciones implicadas
- [ ] Nombre de la Function en `kebab-case`
- [ ] Propósito claro: qué hace, quién la invoca, qué trigger usa
- [ ] Labels/roles que pueden invocarla
- [ ] Si es transaccional: qué datos se congelan en snapshot

## Procedimiento paso a paso

### Fase 1: Preparación

**Paso 1 — Entender el caso de negocio**
Leer el documento maestro y/o task doc para entender:
- Qué problema resuelve la Function
- Qué entidades toca (experiencias, órdenes, tickets, addons, pases, etc.)
- Qué usuario la invoca y con qué label
- Si es HTTP, Event o Schedule

> ✅ Hecho cuando: puedo describir en una frase qué hace la Function y por qué existe.

**Paso 2 — Inventariar entidades y dependencias**
Revisar `appwrite.json` y listar:
- Tablas que la Function lee
- Tablas que la Function escribe/modifica
- Relaciones entre esas tablas
- Otras Functions que podrían verse afectadas
- Servicios externos (Stripe, SMTP, etc.)

> ✅ Hecho cuando: tengo tabla de entidades con acción (leer/escribir/crear).

**Paso 3 — Definir contrato de entrada/salida**
Documentar:
- Input: campos, tipos, requeridos/opcionales
- Output éxito: `{ ok: true, data: { ... } }`
- Output error: `{ ok: false, error: { code: "ERR_...", message: "..." } }`
- Códigos de error posibles con formato `ERR_DOMINIO_CAUSA`

> ✅ Hecho cuando: tengo JSDoc header completo con `@input`, `@output`, `@errors`.

### Fase 2: Ejecución

**Paso 4 — Crear estructura de archivos**
```
functions/{function-name}/
  src/
    main.js
  package.json
  .env.example
```

> ✅ Hecho cuando: los 3 archivos existen con contenido base.

**Paso 5 — Implementar el patrón estándar en `main.js`**
Seguir el flujo obligatorio:
1. **Init** — crear Client, Databases, Users con env vars
2. **Parse** — extraer body/params del request
3. **Validate** — validar cada campo con early return y código de error
4. **Auth** — verificar que hay usuario autenticado (si aplica)
5. **Authorize** — verificar labels del caller contra la operación
6. **Logic** — ejecutar lógica de negocio
7. **Snapshot** — congelar datos si es transaccional (checkout, ticket, orden)
8. **Return** — respuesta estructurada

```javascript
import { Client, Databases, Users } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  // 1. Init
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
  const db = new Databases(client);

  // 2. Parse
  const body = JSON.parse(req.body ?? '{}');

  // 3. Validate — early return por cada campo
  // 4. Auth — verificar req.headers['x-appwrite-user-id']
  // 5. Authorize — verificar labels
  // 6. Logic
  // 7. Snapshot (si aplica)
  // 8. Return
  return res.json({ ok: true, data: { ... } });
};
```

> ✅ Hecho cuando: `main.js` compila y sigue los 8 pasos en orden.

**Paso 6 — Implementar validaciones**
Para cada campo de entrada:
- Verificar presencia si es requerido
- Verificar tipo (string, number, boolean, array)
- Verificar formato (email, UUID, fecha ISO, enum)
- Verificar rango (min/max para números, maxLength para strings)
- Early return con error descriptivo:
```javascript
if (!body.editionId || typeof body.editionId !== 'string') {
  return res.json({ ok: false, error: { code: 'ERR_CHECKOUT_MISSING_EDITION', message: 'editionId is required' } }, 400);
}
```

> ✅ Hecho cuando: cada campo tiene al menos una validación con error code único.

**Paso 7 — Implementar autorización por labels**
```javascript
const users = new Users(client);
const caller = await users.get(req.headers['x-appwrite-user-id']);
const labels = caller.labels || [];

// Verificar contra tabla de permisos
if (!labels.includes('admin') && !labels.includes('root')) {
  return res.json({ ok: false, error: { code: 'ERR_UNAUTHORIZED', message: 'Insufficient permissions' } }, 403);
}
```

Tabla de referencia:

| Label | Puede invocar | Restricciones |
|---|---|---|
| `root` | Cualquier Function | Sin restricción, invisible en UI |
| `admin` | Todas excepto root-only | No puede modificar root |
| `operator` | Operación y contenido | Sin checkout, sin config sensible |
| `client` | Solo sus propios recursos | Solo lectura/acción sobre sus datos |

> ✅ Hecho cuando: la Function rechaza callers sin label válido con 403.

**Paso 8 — Implementar lógica de negocio + snapshots**
- Ejecutar queries a Appwrite Databases
- Si es transaccional: construir snapshot JSON con todos los datos necesarios para reconstruir la operación sin leer datos vivos
- Snapshot incluye: experiencia, variante, precio, addons, fecha, cantidad, usuario
- Guardar snapshot como campo JSON en el documento de orden/ticket

> ✅ Hecho cuando: la lógica ejecuta correctamente y los snapshots (si aplican) congelan datos completos.

**Paso 9 — Implementar idempotencia (si aplica)**
- Para checkout/pagos: usar idempotency key basada en input
- Para webhooks: verificar si el evento ya fue procesado
- Para creación de documentos: verificar duplicados antes de insertar
```javascript
// Verificar si ya se procesó
const existing = await db.listDocuments(DB, COLLECTION, [
  Query.equal('idempotencyKey', [key])
]);
if (existing.total > 0) {
  return res.json({ ok: true, data: existing.documents[0] });
}
```

> ✅ Hecho cuando: un segundo llamado idéntico no duplica datos ni cobra dos veces.

**Paso 10 — Completar `package.json` y `.env.example`**

`package.json`:
```json
{
  "name": "{function-name}",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "node-appwrite": "^13.0.0"
  }
}
```

`.env.example`:
```
APPWRITE_ENDPOINT=
APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
# Variables específicas de esta Function
```

> ✅ Hecho cuando: `package.json` tiene solo dependencias necesarias y `.env.example` lista todas las variables.

### Fase 3: Validación

**Paso 11 — Recorrer checklist de entrega**
Verificar cada item del checklist abajo. Si alguno falla, corregir antes de entregar.

> ✅ Hecho cuando: todos los items del checklist están en ✅.

**Paso 12 — Verificar consistencia con schema**
- Las tablas referenciadas en la Function existen en `appwrite.json`
- Los atributos usados existen con el tipo correcto
- Las relaciones se navegan correctamente
- Los permisos de colección permiten la operación con API key

> ✅ Hecho cuando: no hay referencia a tablas/atributos inexistentes.

**Paso 13 — Documentar para `appwrite.json`**
Si la Function es nueva, indicar qué registro se necesita en `appwrite.json`:
- Name, ID, runtime, entrypoint
- Variables de entorno
- Schedule (si es cron)
- Events (si es trigger)

> ✅ Hecho cuando: hay nota clara de cómo registrar la Function.

## Checklist de entrega

- [ ] Entry point sigue el patrón: init → parse → validate → auth → authorize → logic → snapshot → return
- [ ] JSDoc header completo: `@description`, `@trigger`, `@method`, `@auth`, `@labels`, `@input`, `@output`, `@errors`, `@idempotent`, `@snapshots`
- [ ] Validación de cada campo de entrada con early return y error code `ERR_DOMINIO_CAUSA`
- [ ] Verificación de labels del caller con tabla de permisos
- [ ] Error handling con respuesta estructurada: `{ ok: false, error: { code, message } }`
- [ ] Idempotencia implementada si la operación es de pago, webhook o creación única
- [ ] Snapshots generados si es transaccional (checkout, ticket, orden)
- [ ] `.env.example` con todas las variables de entorno sin valores reales
- [ ] `package.json` con dependencias mínimas necesarias
- [ ] No hay `console.log` — solo `log()` y `error()` del contexto de Appwrite
- [ ] No hay secrets hardcodeados en código
- [ ] Naming: Function=`kebab-case`, variables=`camelCase`, constantes=`UPPER_SNAKE_CASE`, error codes=`ERR_DOMINIO_CAUSA`
- [ ] Respuesta siempre estructurada: éxito `{ ok: true, data }` o error `{ ok: false, error }`
- [ ] No se confía en datos del frontend — todo se valida en la Function

## Errores comunes

❌ **Validar solo en frontend y confiar en el body** → ✅ Validar cada campo en la Function con early return. El frontend puede ser manipulado.

❌ **Usar `console.log` en vez de `log()` del contexto** → ✅ Appwrite Functions proveen `log()` y `error()` en el contexto — usar esos para que aparezcan en los logs de la consola.

❌ **Hardcodear database ID o collection ID** → ✅ Usar constantes al inicio del archivo: `const DB = 'omzone_db'; const COLLECTION = 'orders';` — o mejor aún, env vars para IDs que podrían cambiar entre entornos.

❌ **Olvidar verificar labels del caller** → ✅ Siempre leer el usuario con `Users.get()` y verificar `labels` contra la tabla de permisos. Un `client` no puede ejecutar operaciones de `admin`.

❌ **No implementar idempotencia en checkout/webhooks** → ✅ Stripe puede enviar webhooks duplicados. Un usuario puede hacer doble click en "Pagar". Siempre verificar si la operación ya fue procesada antes de ejecutarla.

❌ **Depender de datos vivos en lugar de snapshots** → ✅ En operaciones transaccionales (checkout, ticket), congelar precio, variante, addons y experiencia en el momento de la venta. Si mañana cambia el precio, la orden pasada debe conservar el precio original.

❌ **Devolver error genérico sin code** → ✅ Cada error debe tener un `code` descriptivo: `ERR_CHECKOUT_INVALID_VARIANT`, `ERR_TICKET_ALREADY_REDEEMED`, `ERR_ADDON_OUT_OF_STOCK`. Esto permite al frontend mostrar mensajes específicos.

❌ **Mezclar naming conventions** → ✅ Function name en `kebab-case`, variables internas en `camelCase`, constantes en `UPPER_SNAKE_CASE`. Nunca `snake_case` para variables JS ni `PascalCase` para Functions.

## Output esperado

1. **`src/main.js`** — Function completa y funcional siguiendo el patrón de 8 pasos
2. **`package.json`** — con dependencias mínimas y `"type": "module"`
3. **`.env.example`** — con todas las variables de entorno documentadas
4. **Nota de registro** — indicaciones para agregar la Function a `appwrite.json`

## Referencias cruzadas

- Documento maestro: `docs/core/00_documento_maestro_requerimientos.md`
- Instrucción de Functions: `.github/instructions/functions.instructions.md`
- Instrucción de schema: `.github/instructions/appwrite-schema.instructions.md`
- Agente que invoca este skill: `.github/agents/functions.agent.md`
- Prompt relacionado: `.github/prompts/create-function.prompt.md`
- Skill complementario: `.github/skills/checkout-flow-validator/` (para Functions de checkout)
- Skill complementario: `.github/skills/stripe-webhook-validator/` (para Functions de webhook)
