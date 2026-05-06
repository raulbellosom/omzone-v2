# OMZONE - Stripe Test Setup

Ultima revision: 2026-05-06

Esta guia explica como probar pagos de punta a punta en OMZONE con **Stripe Checkout Sessions + Payment Element embebido**.

OMZONE no usa Stripe Hosted Checkout para venta directa. El cliente permanece dentro del checkout React existente.

---

## 1) Arquitectura actual

### Venta directa

```
React checkout -> create-checkout -> Checkout Session ui_mode=custom -> Payment Element embebido -> webhook -> reserva confirmada + voucher/QR
```

- `functions/create-checkout` crea una orden pendiente con snapshot y luego crea una **Checkout Session** con:
  - `mode: "payment"`
  - `ui_mode: "custom"`
  - `client_reference_id: orderId`
  - `metadata.orderId`
  - `payment_intent_data.metadata.orderId`
- La Function devuelve `session.client_secret` como `clientSecret`.
- El frontend monta `CheckoutElementsProvider` y `PaymentElement` dentro de nuestra pantalla actual.
- El frontend confirma el pago, pero **no marca reservas como pagadas o confirmadas**.
- `functions/stripe-webhook` valida `checkout.session.completed` y confirma la orden/reserva.

### Venta asistida

```
Admin assisted sale -> pago manual o Payment Link -> webhook/admin action -> reserva confirmada + voucher/QR
```

- Pago manual: una accion admin registra el pago y confirma la reserva.
- Payment Link: Stripe genera una Checkout Session al pagar; el webhook confirma la reserva.

---

## 2) Reglas importantes

- No usar `session.url` para venta directa.
- No redirigir al cliente a `checkout.stripe.com` en el checkout directo.
- No reemplazar la pantalla React de checkout con Hosted Checkout.
- No confiar en estados de pago del frontend.
- Solo el webhook con firma verificada puede marcar:
  - pago validado;
  - reserva confirmada;
  - voucher/QR disponible.
- No mostrar al cliente IDs tecnicos como `cs_*`, `pi_*`, `plink_*`.
- Los admins deben usar acciones de negocio, no editar estados crudos directamente.

---

## 3) Variables

### Frontend `.env`

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXX
VITE_APPWRITE_ENDPOINT=https://aprod.racoondevs.com/v1
VITE_APPWRITE_PROJECT_ID=omzone-dev
VITE_APPWRITE_DATABASE_ID=omzone_db
VITE_SITE_URL=http://localhost:5173
```

Nunca pongas `STRIPE_SECRET_KEY` ni `STRIPE_WEBHOOK_SECRET` en `.env` frontend.

### Appwrite variables

| Variable | Valor |
| --- | --- |
| `STRIPE_SECRET_KEY` | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` |
| `FRONTEND_URL` | `http://localhost:5173` |
| `APPWRITE_DATABASE_ID` | `omzone_db` |
| `APPWRITE_FUNCTION_ADMIN_ORDER_ACTION` | `admin-order-action` |
| `APPWRITE_FUNCTION_GENERATE_TICKET` | `generate-ticket` |
| `APPWRITE_FUNCTION_SEND_CONFIRMATION` | `send-confirmation` |

---

## 4) Stripe Dashboard

1. Activar **Test mode**.
2. Copiar:
   - Publishable key `pk_test_...` para frontend.
   - Secret key `sk_test_...` para Appwrite.
3. Crear/editar webhook endpoint:

```text
https://aprod.racoondevs.com/v1/functions/stripe-webhook/executions
```

Eventos requeridos:

| Evento | Uso |
| --- | --- |
| `checkout.session.completed` | Happy path principal |
| `checkout.session.async_payment_succeeded` | Metodos asincronos |
| `checkout.session.async_payment_failed` | Fallo asincrono |
| `checkout.session.expired` | Sesion expirada |
| `payment_intent.succeeded` | Fallback legacy |
| `payment_intent.payment_failed` | Fallback legacy |

4. Copiar el signing secret `whsec_...` a `STRIPE_WEBHOOK_SECRET`.

---

## 5) Appwrite Functions

Verifica permisos:

| Function | Execute |
| --- | --- |
| `create-checkout` | `users` |
| `stripe-webhook` | `any` |
| `admin-order-action` | `users` |
| `generate-ticket` | `users` |

Redeploy recomendado despues de cambios:

```bash
appwrite deploy function --function-id create-checkout
appwrite deploy function --function-id stripe-webhook
appwrite deploy function --function-id admin-order-action
appwrite deploy function --function-id generate-ticket
```

Tambien despliega el schema si agregaste `payments.stripeSessionId`.

---

## 6) Probar venta directa

1. Iniciar frontend:

```bash
npm run dev
```

2. Entrar como cliente.
3. Abrir una experiencia `published` con `saleMode: direct`.
4. Completar checkout.
5. En el paso Review, el frontend llama `create-checkout`.
6. La Function devuelve:

```json
{
  "clientSecret": "cs_test_..._secret_...",
  "checkoutSessionId": "cs_test_...",
  "orderId": "...",
  "orderNumber": "OMZ-..."
}
```

7. El Payment Element aparece dentro de OMZONE.
8. Pagar con una tarjeta de prueba.
9. Verificar:
   - Stripe muestra el pago como exitoso.
   - Webhook recibe HTTP 2xx.
   - `orders.status` pasa a `confirmed`.
   - `orders.paymentStatus` pasa a `succeeded`.
   - `payments` contiene el registro interno.
   - Se generan tickets/voucher/QR.

---

## 7) Tarjetas de prueba

Usa fecha futura y cualquier CVC.

| Tarjeta | Resultado |
| --- | --- |
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0025 0000 3155` | 3DS |
| `4000 0000 0000 9995` | Fondos insuficientes |
| `4000 0000 0000 0002` | Declinada |
| `5555 5555 5555 4444` | Mastercard exitosa |

Referencia: https://docs.stripe.com/testing

---

## 8) Checklist

- [ ] `create-checkout` crea Checkout Session con `ui_mode: "custom"`.
- [ ] No se usa `session.url` en venta directa.
- [ ] El cliente no sale a Hosted Checkout.
- [ ] El Payment Element renderiza dentro del checkout React.
- [ ] El frontend no cambia estados de orden, pago, reserva ni voucher.
- [ ] `checkout.session.completed` confirma pago y reserva.
- [ ] El webhook valida `orderId`, session, monto, moneda y `payment_status`.
- [ ] Webhook duplicado no duplica `payments`, tickets ni bookings.
- [ ] Cliente ve estados amigables: Payment pending, Payment validated, Reservation confirmed, Voucher available.
- [ ] Cliente no ve `cs_*`, `pi_*`, `plink_*`.
- [ ] Admin usa acciones de negocio para pago manual, cancelacion, reembolso y reenvio.

---

## 9) Troubleshooting

### Payment Element no aparece

- Verifica `VITE_STRIPE_PUBLISHABLE_KEY`.
- Reinicia `npm run dev`.
- Revisa logs de `create-checkout`.

### Orden queda pendiente aunque Stripe cobro

- `stripe-webhook` debe tener execute `any`.
- El endpoint debe terminar en `/executions`.
- El webhook debe escuchar `checkout.session.completed`.
- `STRIPE_WEBHOOK_SECRET` debe coincidir con el endpoint correcto.

### Error por firma invalida

Actualiza `STRIPE_WEBHOOK_SECRET` con el signing secret del endpoint en modo test y redeploy `stripe-webhook`.

### Mezcla de test/live

Todas las llaves deben pertenecer al mismo modo: `pk_test_` con `sk_test_`, o `pk_live_` con `sk_live_`.

---

## 10) Produccion

1. Desactivar Test mode en Stripe.
2. Crear webhook live nuevo.
3. Configurar:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...`
   - `VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `FRONTEND_URL=https://...`
4. Redeploy Functions.
5. Probar un pago real de monto bajo.
