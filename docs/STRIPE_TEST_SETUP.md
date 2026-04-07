# OMZONE - Stripe modo prueba (setup paso a paso)

Ultima revision: 2026-04-07

Esta guia es para dejar funcionando pagos de prueba de punta a punta en OMZONE (React + Appwrite Functions) con Stripe Checkout + webhook.

## 1) Estado actual del proyecto (ya existente)

- Function `create-checkout` ya crea Checkout Sessions y Payment Links en Stripe.
- Function `stripe-webhook` ya valida firma `Stripe-Signature` y actualiza ordenes/pagos.
- Frontend ya redirige a `sessionUrl` de Stripe en checkout.

Referencias:
- `functions/create-checkout/src/main.js`
- `functions/stripe-webhook/src/main.js`
- `src/hooks/useCheckout.js`
- `src/config/env.js`

## 2) Antes de empezar

- NO pongas `sk_test_` ni `sk_live_` en frontend.
- `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET` van solo en Appwrite (server).
- Si compartiste capturas con llaves visibles, rota llaves en Stripe por seguridad.

## 3) Stripe Dashboard (clic por clic)

### 3.1 Confirmar entorno de pruebas

1. En Stripe Dashboard, activa el switch **Modo de prueba** (arriba a la derecha).
2. Verifica la barra de aviso de datos de prueba.

### 3.2 Obtener llaves de prueba

1. Ve a **Developers** (o **Workbench**) -> **API keys**.
2. Copia:
- `pk_test_...` (publicable, solo si despues usas Stripe.js/Elements).
- `sk_test_...` (secreta, para Appwrite Functions).
3. Guarda la `sk_test_...` para `STRIPE_SECRET_KEY`.

### 3.3 Registrar webhook para Appwrite

1. Ve a **Developers / Workbench** -> **Webhooks** (o **Event destinations**).
2. Click en **Add destination** -> **Webhook endpoint**.
3. Endpoint URL:
- `https://aprod.racoondevs.com/v1/functions/stripe-webhook/executions`
4. Selecciona eventos:
- `checkout.session.completed`
- `checkout.session.expired`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
5. Guarda el endpoint.
6. En el detalle del endpoint, revela y copia el **Signing secret** (`whsec_...`).

## 4) Appwrite Console (clic por clic)

### 4.1 Variables globales del proyecto

1. En Appwrite Console -> tu proyecto `omzone-dev`.
2. Ve a **Settings** -> **Variables** (globales de proyecto).
3. Crea o actualiza:
- `STRIPE_SECRET_KEY=sk_test_...`
- `STRIPE_WEBHOOK_SECRET=whsec_...`
- `FRONTEND_URL=http://localhost:5173` (local) o tu URL real de frontend
- `APPWRITE_DATABASE_ID=omzone_db` (si no esta)
- IDs de colecciones usadas por checkout/webhook (`orders`, `order_items`, `payments`, etc.).

### 4.2 Verificar Functions

1. Ve a **Functions** -> `create-checkout`.
2. Verifica:
- Runtime Node compatible
- Permiso de ejecucion para usuarios autenticados
- Ultimo deployment exitoso
3. Ve a **Functions** -> `stripe-webhook`.
4. Verifica:
- Permiso de ejecucion `any` (Stripe necesita endpoint publico)
- Ultimo deployment exitoso

### 4.3 Despliegue recomendado (para asegurar config fresca)

Si acabas de cambiar variables o codigo, redeploy de:
- `create-checkout`
- `stripe-webhook`

## 5) Frontend local (Vite)

1. En raiz del proyecto:
```bash
npm run dev
```
2. Inicia sesion con usuario normal (flujo compra directa).
3. Entra a una experiencia `published` y con `saleMode=direct`.
4. Avanza checkout hasta confirmar pago.

Nota: En este proyecto actual no se usa Stripe.js directo en frontend para cobrar (se usa redireccion a URL de Checkout Session), asi que `VITE_STRIPE_PUBLISHABLE_KEY` no es bloqueante para este flujo.

## 6) Tarjetas de prueba para QA rapido

Usa fecha futura y CVC cualquiera.

- Exito: `4242 4242 4242 4242`
- Requiere 3DS: `4000 0025 0000 3155`
- Rechazada: `4000 0000 0000 9995`

## 7) Validacion de punta a punta (checklist)

1. El frontend redirige a Stripe Checkout sin error.
2. Al pagar, vuelve a `/checkout/success?session_id=...`.
3. En Stripe Dashboard (test), el pago aparece en **Payments**.
4. En Stripe -> **Webhooks**, el endpoint muestra entrega 2xx del evento.
5. En Appwrite:
- `orders.status` cambia de `pending` a `paid`.
- `orders.paymentStatus` pasa a `succeeded`.
- Se crea registro en `payments`.
6. En logs de function `stripe-webhook`, no hay error de firma.

## 8) Errores comunes

### Error: firma webhook invalida

- Causa frecuente: `STRIPE_WEBHOOK_SECRET` incorrecto (confundir test/live o endpoint distinto).
- Solucion: copiar de nuevo el `whsec_...` del endpoint correcto y guardar en Appwrite.

### Error: Stripe crea pago pero orden no cambia

- Revisar si el webhook endpoint esta en `any`.
- Revisar eventos suscritos.
- Revisar URL exacta del endpoint de Appwrite.

### Error: Payment service not configured

- Falta `STRIPE_SECRET_KEY` en variables de Appwrite.

## 9) Paso siguiente recomendado

Cuando este estable en pruebas:

1. Agregar pruebas QA formales de `success`, `3DS`, `decline`.
2. Revisar upgrade de SDK Stripe en funciones (`stripe` package) y fijar `apiVersion` explicita.
3. Solo al final pasar a llaves `live` en entorno productivo.

