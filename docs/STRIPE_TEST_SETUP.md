# OMZONE — Stripe modo prueba (setup paso a paso)

Ultima revision: 2026-04-11

Esta guia es para dejar funcionando pagos de prueba de punta a punta en OMZONE (React + Appwrite Functions) con Stripe **Payment Element** (embebido) + webhook.

---

## 1) Arquitectura actual de pagos

### Venta directa (cliente compra desde la web)

```
Checkout (5 pasos) → Review → "Next" crea PaymentIntent → Payment Element embebido → Pago → Webhook → Success
```

- Function `create-checkout` crea un **PaymentIntent** y devuelve `clientSecret` al frontend.
- Frontend usa `@stripe/react-stripe-js` con `<PaymentElement>` embebido (el cliente nunca sale de OMZONE).
- Al confirmar pago, Stripe procesa y emite `payment_intent.succeeded`.
- Function `stripe-webhook` recibe el evento, actualiza orden/pagos y extrae `cardBrand` + `cardLast4`.
- Frontend redirige a `/checkout/success?order_id=...`.

### Venta asistida (admin crea orden para un cliente)

```
Admin checkout → PaymentLink (redirect a Stripe) → Pago → Webhook → Orden paid
```

- Function `create-checkout` genera un **Payment Link** de Stripe (o marca pagado directamente con `skipStripe`).
- Webhook escucha `checkout.session.completed` para este flujo.
- Este flujo NO cambió con la migración a Payment Element.

### Referencias de codigo

| Archivo                                          | Rol                                                   |
| ------------------------------------------------ | ----------------------------------------------------- |
| `functions/create-checkout/src/main.js`          | Crea PaymentIntent (directa) o PaymentLink (asistida) |
| `functions/stripe-webhook/src/main.js`           | Recibe eventos, actualiza ordenes, crea payments      |
| `src/hooks/useCheckout.js`                       | Hook del checkout, llama `createPaymentIntent()`      |
| `src/components/public/checkout/PaymentStep.jsx` | Payment Element + consentimiento + botón pay          |
| `src/lib/stripe.js`                              | Singleton `loadStripe()`                              |
| `src/config/env.js`                              | `stripePublishableKey` y demás config                 |

---

## 2) Reglas de seguridad

- **NUNCA** pongas `sk_test_` ni `sk_live_` (secret key) en frontend ni en `.env` de Vite.
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` van **solo** en variables de Appwrite (server-side).
- `pk_test_` (publishable key) SÍ va en frontend — es segura y pública por diseño.
- Si compartiste capturas con llaves visibles, **rota las llaves** inmediatamente en Stripe Dashboard.
- Cumplimiento PCI: SAQ-A — los datos de tarjeta nunca tocan nuestro servidor (Payment Element los maneja Stripe).

---

## 3) Stripe Dashboard — paso a paso

### 3.1 Activar modo de prueba

1. Abre [dashboard.stripe.com](https://dashboard.stripe.com).
2. Arriba a la derecha, activa el toggle **"Test mode"** (modo de prueba).
3. Verifica que aparece la barra naranja/amarilla: **"Test data — You're viewing test data"**.

### 3.2 Obtener llaves de API

1. Click en **"Developers"** en la barra lateral izquierda (o en el icono **`</>`** si estas en la vista nueva "Workbench").
2. Ve a la seccion **"API keys"**.
3. Veras dos llaves:

| Llave               | Prefijo       | Donde va                       | Para que                                 |
| ------------------- | ------------- | ------------------------------ | ---------------------------------------- |
| **Publishable key** | `pk_test_...` | `.env` del frontend (Vite)     | Inicializar `loadStripe()` en el browser |
| **Secret key**      | `sk_test_...` | Variables de Appwrite (server) | Crear PaymentIntents, Payment Links      |

4. **Publishable key**: click en "Reveal test key" → copiar. Esta es tu `VITE_STRIPE_PUBLISHABLE_KEY`.
5. **Secret key**: click en "Reveal test key" → copiar. Esta es tu `STRIPE_SECRET_KEY`.

> ⚠️ Si no ves la secret key, puede ser que tu rol en la cuenta Stripe no tenga permisos de developer. Pide acceso al owner de la cuenta.

### 3.3 Crear/verificar webhook endpoint

1. En **Developers** → **Webhooks** (o **"Event destinations"** en la vista Workbench).
2. Si ya existe un endpoint para `aprod.racoondevs.com`, click para editarlo. Si no, click **"Add endpoint"** / **"Add destination"**.
3. Configurar:

| Campo            | Valor                                                                 |
| ---------------- | --------------------------------------------------------------------- |
| **Endpoint URL** | `https://aprod.racoondevs.com/v1/functions/stripe-webhook/executions` |
| **Description**  | `OMZONE webhook — test` (opcional)                                    |
| **Listen to**    | Events seleccionados (ver abajo)                                      |

4. **Eventos requeridos** — selecciona exactamente estos 4:

| Evento                          | Flujo          | Descripcion                           |
| ------------------------------- | -------------- | ------------------------------------- |
| `payment_intent.succeeded`      | Venta directa  | Pago exitoso via Payment Element      |
| `payment_intent.payment_failed` | Venta directa  | Pago falló (tarjeta declinada, etc.)  |
| `checkout.session.completed`    | Venta asistida | Pago completado via Payment Link      |
| `checkout.session.expired`      | Venta asistida | Session de checkout expirada sin pago |

5. Click **"Add endpoint"** o **"Save"**.
6. Una vez creado, entra al detalle del endpoint → sección **"Signing secret"** → click **"Reveal"** → copiar el valor `whsec_...`.

> Esto es tu `STRIPE_WEBHOOK_SECRET`. Cada endpoint tiene su propio signing secret — NO confundas el de test con el de produccion.

### 3.4 Verificar Payment Methods habilitados

1. Ve a **Settings** → **Payments** → **Payment methods**.
2. Asegúrate de que al menos **"Cards"** está habilitado.
3. Opcionalmente habilita: Apple Pay, Google Pay, OXXO (para México) según lo que quieras probar.
4. El Payment Element de Stripe muestra automáticamente los métodos habilitados en tu cuenta.

---

## 4) Frontend — archivo `.env`

En la raíz del proyecto (`d:\RacoonDevs\omzone-v2`), crea o edita el archivo `.env`:

```bash
# Stripe — publishable key (safe for frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXX

# Appwrite
VITE_APPWRITE_ENDPOINT=https://aprod.racoondevs.com/v1
VITE_APPWRITE_PROJECT_ID=omzone-dev
VITE_APPWRITE_DATABASE_ID=omzone_db

# Site URL (para return_url de Stripe)
VITE_SITE_URL=http://localhost:5173
```

> Solo `VITE_STRIPE_PUBLISHABLE_KEY` es nueva. Las demás ya deberian existir.
>
> **NO** pongas `STRIPE_SECRET_KEY` ni `STRIPE_WEBHOOK_SECRET` aqui. Esas van en Appwrite.

---

## 5) Appwrite Console — paso a paso

### 5.1 Variables globales del proyecto

1. Abre Appwrite Console → proyecto **`omzone-dev`**.
2. Ve a **Settings** → **Variables** (variables globales de proyecto).
3. Crea o verifica que existan estas variables:

| Variable                | Valor                   | Notas                                                                                          |
| ----------------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `STRIPE_SECRET_KEY`     | `sk_test_...`           | De Stripe Dashboard → API keys                                                                 |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...`             | De Stripe Dashboard → Webhooks → tu endpoint → Signing secret                                  |
| `FRONTEND_URL`          | `http://localhost:5173` | URL base del frontend (para Payment Links de venta asistida). Cambiar a URL real en produccion |
| `APPWRITE_DATABASE_ID`  | `omzone_db`             | Ya debería existir                                                                             |

> Las variables globales de proyecto se inyectan automáticamente a todas las Functions. No necesitas setearlas por Function.

### 5.2 Verificar Function `create-checkout`

1. Ve a **Functions** → **`create-checkout`**.
2. Verifica:

| Check               | Valor esperado                  |
| ------------------- | ------------------------------- |
| Runtime             | Node.js 18+                     |
| Entrypoint          | `src/main.js`                   |
| Execute permissions | `users` (usuarios autenticados) |
| Último deployment   | exitoso (badge verde)           |

3. Si cambiaste código o variables recientemente, haz **redeploy**: click "Create deployment" → seleccionar Git o subir manual.

### 5.3 Verificar Function `stripe-webhook`

1. Ve a **Functions** → **`stripe-webhook`**.
2. Verifica:

| Check               | Valor esperado                                              |
| ------------------- | ----------------------------------------------------------- |
| Runtime             | Node.js 18+                                                 |
| Entrypoint          | `src/main.js`                                               |
| Execute permissions | **`any`** (Stripe llama al endpoint directamente, sin auth) |
| Último deployment   | exitoso (badge verde)                                       |

> ⚠️ **MUY IMPORTANTE**: `stripe-webhook` DEBE tener permiso `any`. Si está en `users`, Stripe no podrá llamar al endpoint y los pagos nunca se reconciliarán.

### 5.4 Redeploy después de cambios

Si acabas de cambiar variables de entorno o actualizaste código de Functions:

```bash
# Desde la raíz del proyecto, con Appwrite CLI:
appwrite login --endpoint https://aprod.racoondevs.com/v1
appwrite deploy function --function-id create-checkout
appwrite deploy function --function-id stripe-webhook
```

O desde la Console: cada Function → "Create deployment" → manual upload o desde Git.

---

## 6) Probar el flujo completo

### 6.1 Iniciar frontend

```bash
cd d:\RacoonDevs\omzone-v2
npm run dev
```

### 6.2 Flujo de compra directa (Payment Element)

1. Inicia sesión con un usuario normal en `http://localhost:5173`.
2. Navega a una experiencia con `status: published` y `saleMode: direct`.
3. Click en "Book" / "Reservar" para entrar al checkout.
4. **Paso 1 — Selection**: elige tier, slot (si aplica) y cantidad.
5. **Paso 2 — Addons**: selecciona complementos opcionales (o skip).
6. **Paso 3 — Details**: llena nombre, email (y phone opcional).
7. **Paso 4 — Review**: verifica el resumen → click "Next".
   - En este momento, el frontend llama a `create-checkout` y obtiene el `clientSecret`.
8. **Paso 5 — Payment**: aparece el formulario de Stripe embebido (Payment Element).
   - Marca el checkbox de consentimiento (Terms, Privacy, Refund Policy).
   - Ingresa tarjeta de prueba (ver sección 7).
   - Click "Pay $X MXN".
9. Si el pago es exitoso → redirige a `/checkout/success?order_id=...`.
10. Si la tarjeta es declinada → muestra error inline sin salir de la página.

### 6.3 Flujo de venta asistida (sin cambios)

1. Inicia sesión como admin.
2. Crea una venta asistida desde el panel.
3. Si usa Payment Link → el admin recibe link, lo comparte al cliente.
4. El cliente paga en Stripe → webhook procesa → orden pagada.

---

## 7) Tarjetas de prueba

Usa fecha de expiración futura (ej: `12/30`) y cualquier CVC de 3 dígitos (ej: `123`).

| Tarjeta               | Resultado                        | Cuándo usarla                                        |
| --------------------- | -------------------------------- | ---------------------------------------------------- |
| `4242 4242 4242 4242` | Pago exitoso                     | Happy path                                           |
| `4000 0025 0000 3155` | Requiere autenticación 3DS       | Probar flujo de 3D Secure (modal en Payment Element) |
| `4000 0000 0000 9995` | Declinada (fondos insuficientes) | Probar manejo de errores                             |
| `4000 0000 0000 0002` | Declinada (tarjeta genérica)     | Error genérico                                       |
| `5555 5555 5555 4444` | Mastercard exitosa               | Probar cardBrand "mastercard"                        |
| `3782 822463 10005`   | Amex exitosa                     | Probar CVC de 4 dígitos                              |

> Referencia completa: [stripe.com/docs/testing](https://docs.stripe.com/testing)

---

## 8) Validación de punta a punta (checklist)

### Venta directa (Payment Element)

- [ ] El checkout muestra 5 pasos (Selection, Addons, Details, Review, Payment).
- [ ] Al hacer "Next" en Review, no hay error y aparece el formulario de Stripe.
- [ ] El Payment Element renderiza con los colores de OMZONE (sage, charcoal, warm-gray).
- [ ] El checkbox de consentimiento es obligatorio — sin él, el botón Pay no procede.
- [ ] Con tarjeta `4242...`, el pago se completa y redirige a `/checkout/success?order_id=...`.
- [ ] La success page muestra el resumen de la orden, monto y tickets (si aplica).
- [ ] Con tarjeta `4000...9995` (declinada), se muestra error inline en la misma página.
- [ ] Con tarjeta `4000...3155` (3DS), aparece modal de autenticación dentro del Payment Element.
- [ ] En Stripe Dashboard (test) → **Payments**: aparece el pago con status `succeeded`.
- [ ] En Stripe Dashboard → **Webhooks** → tu endpoint: el evento muestra HTTP 2xx.
- [ ] En Appwrite → `orders`: el documento cambia de `status: pending` → `status: paid`, `paymentStatus: succeeded`.
- [ ] En Appwrite → `payments`: se crea registro con `cardBrand` y `cardLast4` poblados.
- [ ] En logs de Appwrite → `stripe-webhook`: no hay errores de firma ni de procesamiento.

### Venta asistida (Payment Link — sin cambios)

- [ ] Admin puede crear orden asistida sin error.
- [ ] Si usa Payment Link, el link funciona y al pagar el webhook procesa correctamente.
- [ ] En la success page, el flujo `?session_id=...` sigue funcionando.

---

## 9) Errores comunes y soluciones

### "Payment Element no aparece" / pantalla vacía en paso 5

- **Causa**: `VITE_STRIPE_PUBLISHABLE_KEY` no está en `.env` o es inválida.
- **Solución**: verifica que `.env` tenga `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` y reinicia `npm run dev` (Vite no recarga `.env` en hot reload).

### Error: "Could not initialize payment" en paso 5

- **Causa**: `create-checkout` falló al crear el PaymentIntent.
- **Solución**: revisa logs de la Function `create-checkout` en Appwrite Console. Causas comunes:
  - `STRIPE_SECRET_KEY` falta o es incorrecta.
  - La experiencia no está `published` o no tiene `saleMode: direct`.
  - El tier no está activo.

### Error: firma webhook inválida (400 en logs de `stripe-webhook`)

- **Causa**: `STRIPE_WEBHOOK_SECRET` no coincide con el signing secret del endpoint.
- **Solución**: ve a Stripe Dashboard → Webhooks → tu endpoint → "Reveal" signing secret → copia exacto → actualiza en Appwrite Console → **redeploy** `stripe-webhook`.

### Pago exitoso en Stripe pero orden sigue en "pending"

- **Causa 1**: Function `stripe-webhook` no tiene permiso `any` → Stripe no puede llamar.
- **Causa 2**: El evento `payment_intent.succeeded` no está suscrito en el webhook.
- **Causa 3**: URL del endpoint mal escrita (falta `/executions` al final).
- **Solución**: verificar los 3 puntos arriba. En Stripe Dashboard → Webhooks → revisa si el evento se envió y qué HTTP status recibió.

### Error: "Payment service not configured"

- **Causa**: falta `STRIPE_SECRET_KEY` en variables de Appwrite.
- **Solución**: agregar la variable y hacer redeploy de `create-checkout`.

### Stripe muestra "Invalid API Key"

- **Causa**: estás mezclando llaves test/live (ej: `pk_test_` en frontend pero `sk_live_` en backend).
- **Solución**: asegúrate de que TODAS las llaves sean del mismo entorno (todas `_test_` o todas `_live_`).

---

## 10) Resumen de llaves y dónde va cada una

| Llave           | Prefijo       | Dónde conseguirla                                               | Dónde configurarla                                                   |
| --------------- | ------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| Publishable Key | `pk_test_...` | Stripe → Developers → API keys                                  | `.env` del frontend como `VITE_STRIPE_PUBLISHABLE_KEY`               |
| Secret Key      | `sk_test_...` | Stripe → Developers → API keys                                  | Appwrite Console → Settings → Variables como `STRIPE_SECRET_KEY`     |
| Webhook Secret  | `whsec_...`   | Stripe → Developers → Webhooks → [tu endpoint] → Signing secret | Appwrite Console → Settings → Variables como `STRIPE_WEBHOOK_SECRET` |

---

## 11) Para pasar a producción

Cuando todo esté estable en pruebas:

1. En Stripe Dashboard, desactiva "Test mode" para ver llaves live.
2. Crea un webhook endpoint **nuevo** para producción (misma URL pero con llaves live).
3. Actualiza en Appwrite:
   - `STRIPE_SECRET_KEY` → `sk_live_...`
   - `STRIPE_WEBHOOK_SECRET` → `whsec_...` (el del endpoint live)
4. Actualiza en el frontend de producción:
   - `VITE_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - `FRONTEND_URL` → URL real de producción
5. Haz redeploy de `create-checkout` y `stripe-webhook`.
6. Prueba un pago real de monto bajo antes de abrir al público.
7. Fijar `apiVersion` explícita en el constructor de Stripe en las Functions para evitar breaking changes.
