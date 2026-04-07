---
description: "Usar cuando se diseñen, implementen o modifiquen Appwrite Functions de OMZONE: estructura, validación, permisos, idempotencia, snapshots, error handling y documentación."
applyTo: "functions/**"
---

# Convenciones de Appwrite Functions — OMZONE

## 1. Entorno

| Clave       | Valor                                          |
| ----------- | ---------------------------------------------- |
| Plataforma  | Appwrite self-hosted **1.9.0**                 |
| Runtime     | Node.js `node-22`                              |
| Naming      | `kebab-case` para nombre de Function y carpeta |
| Ubicación   | `functions/{function-name}/`                   |
| Entry point | `src/main.js`                                  |

### Herramientas disponibles

| Herramienta           | Identificador                                               | Uso                                                                                     |
| --------------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **MCP Appwrite API**  | `appwrite-api-omzone-dev`                                   | Crear Functions, configurar variables de entorno, crear deployments, listar ejecuciones |
| **MCP Appwrite Docs** | `appwrite-docs`                                             | Consultar documentación de runtimes, triggers, eventos y API de Functions               |
| **Appwrite CLI**      | `appwrite login --endpoint https://aprod.racoondevs.com/v1` | Deploy de Functions desde local. **Siempre** usar el endpoint self-hosted               |

---

## 2. Catálogo de Functions de OMZONE

### 2.1 Autenticación y usuarios

| Function            | Trigger                 | Propósito                                        |
| ------------------- | ----------------------- | ------------------------------------------------ |
| `assign-user-label` | Event: `users.*.create` | Asigna label `client` a nuevo usuario registrado |
| `invite-operator`   | HTTP (admin)            | Crea usuario con label `operator` por invitación |

### 2.2 Checkout y pagos

| Function          | Trigger       | Propósito                                                                        |
| ----------------- | ------------- | -------------------------------------------------------------------------------- |
| `create-checkout` | HTTP (client) | Valida carrito, lee precios de DB, crea snapshot, genera Stripe Checkout Session |
| `stripe-webhook`  | HTTP (Stripe) | Recibe webhook, verifica firma, reconcilia pago → orden → tickets                |

### 2.3 Tickets y reservas

| Function          | Trigger                | Propósito                                                   |
| ----------------- | ---------------------- | ----------------------------------------------------------- |
| `generate-ticket` | Interno (post-pago)    | Genera ticket con QR, PDF, sube a Storage, asocia a booking |
| `validate-ticket` | HTTP (operator)        | Escanea QR, verifica validez, registra redención            |
| `redeem-pass`     | HTTP (operator/system) | Consume 1 uso de un pase consumible                         |

### 2.4 Agenda y capacidad

| Function                | Trigger                | Propósito                                            |
| ----------------------- | ---------------------- | ---------------------------------------------------- |
| `update-slot-capacity`  | Interno (post-booking) | Decrementa capacidad de slot tras reserva confirmada |
| `release-expired-slots` | Schedule (cron)        | Libera slots de órdenes expiradas/canceladas         |

### 2.5 Reembolsos

| Function         | Trigger      | Propósito                                                                  |
| ---------------- | ------------ | -------------------------------------------------------------------------- |
| `process-refund` | HTTP (admin) | Valida orden, procesa refund en Stripe, actualiza estado, invalida tickets |

### 2.6 Notificaciones

| Function            | Trigger             | Propósito                                             |
| ------------------- | ------------------- | ----------------------------------------------------- |
| `send-confirmation` | Interno (post-pago) | Envía email/notificación de confirmación de compra    |
| `send-reminder`     | Schedule (cron)     | Envía recordatorios previos a la fecha de experiencia |

---

## 3. Estructura obligatoria de cada Function

### 3.1 Estructura de carpeta

```
functions/
  {function-name}/
    src/
      main.js          # Entry point único
    package.json       # Dependencias
    .env.example       # Variables de entorno documentadas (sin valores reales)
```

### 3.2 Header de documentación obligatorio

Cada `main.js` DEBE comenzar con este bloque JSDoc:

```javascript
/**
 * @function {function-name}
 * @description Descripción clara del propósito
 * @trigger HTTP | Event (especificar cuál) | Schedule (cron expression)
 *
 * @input {Object} payload
 * @input {string} payload.campo1 - descripción
 * @input {string} payload.campo2 - descripción
 *
 * @validates
 * - Autenticación: requiere JWT válido
 * - Autorización: label admin|operator|client
 * - Input: tipos, rangos, formato
 * - Negocio: disponibilidad, ownership, etc.
 *
 * @entities
 * - Lee: tabla1, tabla2
 * - Escribe: tabla3, tabla4
 * - Storage: bucket_name (si aplica)
 *
 * @envVars
 * - APPWRITE_FUNCTION_API_ENDPOINT (built-in, auto-injected)
 * - APPWRITE_FUNCTION_PROJECT_ID (built-in, auto-injected)
 * - x-appwrite-key header (dynamic API key, runtime only)
 * - APPWRITE_DATABASE_ID (project-level global)
 * - APPWRITE_COLLECTION_* (project-level globals, las que apliquen)
 * - STRIPE_SECRET_KEY (project-level global, si aplica)
 * - STRIPE_WEBHOOK_SECRET (project-level global, si aplica)
 *
 * @errors
 * - 400: Input inválido
 * - 401: No autenticado
 * - 403: No autorizado (label insuficiente)
 * - 404: Recurso no encontrado
 * - 409: Conflicto (duplicado, ya procesado)
 * - 500: Error interno
 *
 * @returns {Object} { success: boolean, data?: any, error?: string }
 */
```

---

## 4. Patrón de implementación obligatorio

### 4.1 Estructura base de main.js

```javascript
import { Client, Databases, Users } from "node-appwrite";

/**
 * Inicializa el cliente Appwrite usando variables built-in y dynamic API key.
 * APPWRITE_FUNCTION_API_ENDPOINT y APPWRITE_FUNCTION_PROJECT_ID son
 * auto-injected por Appwrite. El API key se obtiene de req.headers
 * en runtime (no de process.env).
 */
function initClient(req) {
  return new Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(req.headers["x-appwrite-key"]);
}

export default async ({ req, res, log, error }) => {
  // 1. INICIALIZAR cliente Appwrite
  const client = initClient(req);
  const db = new Databases(client);

  try {
    // 2. PARSEAR input
    const payload = JSON.parse(req.body || "{}");

    // 3. VALIDAR input (tipo, rango, formato)
    if (!payload.requiredField) {
      return res.json({ success: false, error: "Missing requiredField" }, 400);
    }

    // 4. AUTENTICAR — verificar que hay usuario
    const userId = req.headers["x-appwrite-user-id"];
    if (!userId) {
      return res.json(
        { success: false, error: "Authentication required" },
        401,
      );
    }

    // 5. AUTORIZAR — verificar label
    const users = new Users(client);
    const user = await users.get(userId);
    if (!user.labels.includes("admin")) {
      return res.json(
        { success: false, error: "Insufficient permissions" },
        403,
      );
    }

    // 6. LÓGICA DE NEGOCIO
    // Usar process.env.APPWRITE_DATABASE_ID, process.env.APPWRITE_COLLECTION_*
    // para IDs de DB/colecciones (project-level global vars)

    // 7. RETORNAR resultado
    return res.json({ success: true, data: result });
  } catch (err) {
    error("Function failed: " + err.message);
    return res.json({ success: false, error: "Internal error" }, 500);
  }
};
```

### 4.2 Orden de operaciones (siempre)

1. Inicializar cliente
2. Parsear input
3. Validar input
4. Autenticar (verificar userId)
5. Autorizar (verificar label)
6. Validar reglas de negocio
7. Ejecutar operación
8. Retornar resultado

---

## 5. Reglas de seguridad en Functions

### 5.1 Precios

- **NUNCA** leer precios del payload del cliente.
- **SIEMPRE** leer precios de la tabla `pricing_tiers` en la DB.
- Los precios se leen, se verifican y se usan para crear el snapshot server-side.

### 5.2 Webhooks Stripe

```javascript
// OBLIGATORIO en toda Function que reciba webhooks de Stripe
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const event = stripe.webhooks.constructEvent(
  req.bodyRaw, // body sin parsear
  req.headers["stripe-signature"],
  process.env.STRIPE_WEBHOOK_SECRET,
);
// Si falla → retornar 400 inmediatamente
```

### 5.3 Validación de input

- Validar **tipo** de cada campo (string, number, array).
- Validar **rango** donde aplique (precio > 0, cantidad >= 1).
- Validar **formato** (email, UUID, fecha ISO).
- Validar **longitud** de strings para prevenir payloads abusivos.
- **Nunca** usar `eval()` ni procesar input como código.

### 5.4 Datos de usuario

- **Siempre** filtrar queries por `userId` del JWT para datos privados.
- **Nunca** retornar datos de un usuario a otro.
- **Verificar ownership** antes de operaciones de lectura/escritura sobre recursos del usuario.

---

## 6. Snapshots en Functions

### 6.1 Cuándo crear snapshot

- Al crear una orden (`create-checkout`).
- Al generar un ticket (`generate-ticket`).
- Al procesar un reembolso (`process-refund`).

### 6.2 Qué incluir en snapshot de orden

```javascript
const snapshot = JSON.stringify({
  experienceName: experience.name,
  experienceType: experience.type,
  editionName: edition.name,
  slotDate: slot.date,
  slotTime: slot.time,
  pricingTier: tier.name,
  basePrice: tier.price, // precio al momento de compra
  addons: selectedAddons.map((a) => ({
    name: a.name,
    price: a.price, // precio del addon al momento
  })),
  quantity: payload.quantity,
  subtotal: calculatedSubtotal,
  addonsTotal: calculatedAddonsTotal,
  total: calculatedTotal,
  currency: "MXN",
  snapshotAt: new Date().toISOString(),
});
```

### 6.3 Regla de oro

> El snapshot se crea UNA vez y NUNCA se modifica. Si el admin cambia precios después, las órdenes existentes conservan el precio original.

---

## 7. Idempotencia

### 7.1 Cuándo es obligatoria

- **Webhooks Stripe**: verificar que la orden no esté ya "paid" antes de procesar.
- **Generación de tickets**: verificar que no existan tickets para esa orden antes de crear.
- **Consumo de pases**: verificar que no se haya registrado ya esa redención.

### 7.2 Patrón de idempotencia

```javascript
// Antes de procesar webhook:
const order = await db.getDocument("omzone_db", "orders", orderId);
if (order.status === "paid") {
  // Ya procesado — retornar éxito sin reprocesar
  return res.json({ success: true, message: "Already processed" });
}
// Proceder con lógica normal...
```

---

## 8. Variables de entorno

### 8.1 Variables built-in (auto-injected por Appwrite)

| Variable                         | Disponibilidad   | Propósito                                  |
| -------------------------------- | ---------------- | ------------------------------------------ |
| `APPWRITE_FUNCTION_API_ENDPOINT` | Build + Runtime  | Endpoint del proyecto Appwrite             |
| `APPWRITE_FUNCTION_PROJECT_ID`   | Build + Runtime  | Project ID                                 |
| `APPWRITE_FUNCTION_API_KEY`      | **Build only**   | API key (solo disponible en build time)    |
| `req.headers['x-appwrite-key']`  | **Runtime only** | API key dinámica inyectada en cada request |
| `APPWRITE_FUNCTION_ID`           | Build + Runtime  | ID de la Function                          |
| `APPWRITE_FUNCTION_NAME`         | Build + Runtime  | Nombre de la Function                      |
| `APPWRITE_FUNCTION_DEPLOYMENT`   | Build + Runtime  | ID del deployment activo                   |

> **Regla**: Usar `APPWRITE_FUNCTION_API_ENDPOINT` y `APPWRITE_FUNCTION_PROJECT_ID` para inicializar el cliente.
> Usar `req.headers['x-appwrite-key']` como API key en runtime. **No** crear variables manuales para endpoint, project ID o API key.

### 8.2 Variables project-level (globales para todas las Functions)

Se configuran una vez a nivel proyecto y son accesibles desde **todas** las Functions vía `process.env.*`.

| Variable                                           | Propósito                                  |
| -------------------------------------------------- | ------------------------------------------ |
| `APPWRITE_DATABASE_ID`                             | ID de la base de datos (`omzone_db`)       |
| `APPWRITE_COLLECTION_*`                            | IDs de colecciones (una por colección)     |
| `APPWRITE_BUCKET_*`                                | IDs de buckets de Storage                  |
| `APPWRITE_FUNCTION_*` (custom)                     | IDs de otras Functions (para invocaciones) |
| `STRIPE_SECRET_KEY`                                | `create-checkout`, `process-refund`        |
| `STRIPE_WEBHOOK_SECRET`                            | `stripe-webhook`                           |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | `send-confirmation`, `send-reminder`       |

> Para gestionar variables project-level usar **Appwrite CLI**:
>
> ```bash
> appwrite project create-variable --key VARIABLE_NAME --value "valor"
> appwrite project list-variables
> ```

### 8.3 Regla

- **NUNCA** hardcodear secrets en código.
- **NUNCA** exponer variables en logs.
- **NUNCA** crear variables a nivel función individual — usar variables project-level.
- Documentar todas las variables en `.env.example` del root (fuente de verdad) y en el `.env.example` de cada function (como referencia).
- Las variables built-in de Appwrite NO necesitan configurarse — se documentan como comentarios en `.env.example`.

---

## 9. Error handling

### 9.1 Códigos HTTP estándar

| Código | Uso                                                |
| ------ | -------------------------------------------------- |
| 200    | Operación exitosa                                  |
| 400    | Input inválido o malformado                        |
| 401    | No autenticado (sin JWT)                           |
| 403    | No autorizado (label insuficiente)                 |
| 404    | Recurso no encontrado                              |
| 409    | Conflicto (duplicado, ya procesado, sin capacidad) |
| 500    | Error interno no esperado                          |

### 9.2 Formato de respuesta

```javascript
// Éxito
{ success: true, data: { ... } }

// Error
{ success: false, error: 'Mensaje descriptivo sin detalles internos' }
```

### 9.3 Reglas

- **Nunca** retornar stack traces al cliente.
- **Siempre** loggear el error completo con `error()` para debugging.
- **Mensajes genéricos** al usuario, **detalles completos** en logs internos.

---

## 10. Testing y validación

### 10.1 Antes de deploy

- [ ] Function documenta todos los inputs en header JSDoc
- [ ] Todos los inputs validados (tipo, rango, formato)
- [ ] Autenticación verificada (userId del JWT)
- [ ] Autorización verificada (label del usuario)
- [ ] Precios leídos de DB, nunca del payload
- [ ] Snapshots creados donde corresponde (órdenes, tickets)
- [ ] Idempotencia implementada donde aplica
- [ ] Variables de entorno documentadas en .env.example
- [ ] Error handling con códigos HTTP correctos
- [ ] Sin secrets hardcoded ni en logs
- [ ] Webhook signature verificada (si aplica)
- [ ] Respuestas en formato estándar `{ success, data?, error? }`

---

## 11. Errores frecuentes

| Error                          | Consecuencia                  | Corrección                         |
| ------------------------------ | ----------------------------- | ---------------------------------- |
| Precio del payload del cliente | Compra a precio manipulado    | Leer de `pricing_tiers` en DB      |
| Sin verificar label            | Escalación de privilegios     | Check obligatorio antes de lógica  |
| Webhook sin verificar firma    | Órdenes fraudulentas          | `constructEvent()` siempre         |
| Sin idempotencia en webhook    | Tickets duplicados            | Check status antes de procesar     |
| Stack trace en response        | Information disclosure        | Mensaje genérico al cliente        |
| Secret hardcoded               | Exposición de credenciales    | Variables de entorno               |
| Sin ownership check            | IDOR — acceso a datos ajenos  | Filtrar por userId del JWT         |
| Snapshot incompleto            | No se puede reconstruir venta | Incluir todos los datos necesarios |
