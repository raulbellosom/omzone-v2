---
description: "Diseñar e implementar una Appwrite Function para OMZONE. Genera estructura, código, validación, permisos, error handling y documentación siguiendo las convenciones del proyecto."
agent: "functions"
argument-hint: "Nombre y propósito de la Function (ej: 'create-checkout — iniciar Checkout Session de Stripe')"
tools: [read, edit, search, run]
---

Quiero que diseñes e implementes una **Appwrite Function** para OMZONE.

---

## Function a crear

- **Nombre:** {{FUNCTION_NAME}}
- **Propósito:** {{FUNCTION_PURPOSE}}
- **Ruta:** `functions/{{FUNCTION_NAME}}/`

---

## Contexto del proyecto

| Clave      | Valor                                                |
| ---------- | ---------------------------------------------------- |
| Proyecto   | OMZONE — plataforma de experiencias wellness premium |
| Backend    | Appwrite self-hosted 1.9.0                           |
| Endpoint   | `https://aprod.racoondevs.com/v1`                    |
| Project ID | `omzone-dev`                                         |
| Database   | `omzone_db`                                          |
| Runtime    | `node-22`                                            |
| Auth model | Labels: `root`, `admin`, `operator`, `client`        |
| Pagos      | Stripe Checkout Sessions, webhooks HMAC-verificados  |

---

## Estructura de archivos requerida

```
functions/{{FUNCTION_NAME}}/
  src/
    main.js          # Entry point
  package.json       # Dependencias
  .env.example       # Variables de entorno (sin valores reales)
```

---

## Plantilla de implementación

### `main.js` — Patrón obligatorio

```javascript
/**
 * {{FUNCTION_NAME}}
 *
 * @description {{FUNCTION_PURPOSE}}
 * @trigger [HTTP / Event / Schedule]
 * @method [GET / POST / PUT / DELETE]
 * @auth [required / optional / none]
 * @labels [qué labels pueden invocar]
 * @input { campo: tipo, ... }
 * @output { campo: tipo, ... }
 * @errors [ { code, message }, ... ]
 * @idempotent [sí / no]
 * @snapshots [qué datos congela si aplica]
 */

import { Client, Databases, Users } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  // 1. Init — crear client y servicios Appwrite
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  // 2. Parse — extraer y validar input
  // 3. Auth — verificar identidad del caller
  // 4. Authorize — verificar labels/permisos
  // 5. Logic — ejecutar lógica de negocio
  // 6. Snapshot — congelar datos si es transaccional
  // 7. Return — respuesta estructurada
};
```

---

## Reglas de implementación

### Seguridad

1. NUNCA confiar en datos del frontend — validar todo en la Function
2. Verificar labels del usuario contra la operación requerida
3. Para webhooks de Stripe: verificar HMAC signature antes de procesar
4. No exponer API keys, secrets ni datos internos en respuestas
5. Sanitizar todo input contra injection

### Validación

6. Validar tipos, rangos y formatos de cada campo de entrada
7. Usar early return con error descriptivo para cada validación fallida
8. Formato de error: `{ ok: false, error: { code: "ERR_XXX", message: "..." } }`

### Idempotencia

9. Si la operación es de pago/checkout: implementar idempotency key
10. Si crea documentos: verificar duplicados antes de insertar
11. Webhooks deben ser idempotentes — procesar una vez, ignorar reintentos

### Snapshots

12. En operaciones transaccionales (checkout, ticket): congelar datos al momento de la venta
13. El snapshot incluye: experiencia, variante, precio, addons, fecha — todo lo necesario para reconstruir sin leer datos vivos
14. Guardar snapshot como campo JSON en el documento de orden/ticket

### Permisos y labels

| Label      | Puede invocar          | Restricciones                       |
| ---------- | ---------------------- | ----------------------------------- |
| `root`     | Todo                   | Sin restricción                     |
| `admin`    | Todo excepto root-only | No puede modificar root             |
| `operator` | Operación y contenido  | No checkout, no config sensible     |
| `client`   | Sus propios recursos   | Solo lectura/acción sobre sus datos |

### Naming y convenciones

15. Function name: `kebab-case`
16. Variables internas: `camelCase`
17. Constantes: `UPPER_SNAKE_CASE`
18. Error codes: `ERR_` + dominio + `_` + causa (ej: `ERR_CHECKOUT_INVALID_VARIANT`)

### Variables de entorno requeridas

Listarlas en `.env.example`:

```
APPWRITE_ENDPOINT=
APPWRITE_PROJECT_ID=
APPWRITE_API_KEY=
# Agregar las específicas de esta Function
```

---

## Checklist de entrega

- [ ] Entry point sigue el patrón init→parse→validate→auth→authorize→logic→return
- [ ] JSDoc header completo con todos los campos de la plantilla
- [ ] Validación de cada campo de entrada con early return
- [ ] Verificación de labels del caller
- [ ] Error handling con códigos descriptivos
- [ ] Idempotencia si la operación lo requiere
- [ ] Snapshots si es transaccional
- [ ] `.env.example` con todas las variables
- [ ] `package.json` con dependencias mínimas
- [ ] No hay console.log — usar `log()` y `error()` del contexto
- [ ] No hay secrets hardcodeados
- [ ] Respuesta siempre estructurada: `{ ok: true, data: {...} }` o `{ ok: false, error: {...} }`

---

## Output esperado

1. **Archivo `main.js`** completo y funcional
2. **Archivo `package.json`** con dependencias
3. **Archivo `.env.example`** con variables necesarias
4. **Nota de registro** para `appwrite.json` si aplica
