# TASK-066: Stripe Payment Element frontend — embedded payment + consent

## Estado: done

## Objetivo

Un cliente que realiza una compra directa completa el checkout **sin salir de la plataforma**, utilizando el formulario de pago embebido de Stripe (Payment Element). Se requiere aceptar Términos, Privacidad y Política de Reembolso antes de pagar.

## Dominio

Checkout / Órdenes / Pagos (#6)

## Dependencias

- `TASK-064: Legal pages — Terms, Privacy, Refund Policy (bilingüe)` — provee las páginas legales enlazadas desde el consentimiento
- `TASK-065: Stripe PaymentIntent backend + webhook + schema` — provee el `clientSecret` desde `create-checkout` y el manejo de `payment_intent.succeeded` en el webhook

## Alcance

### Qué incluye

1. Instalación de `@stripe/stripe-js` y `@stripe/react-stripe-js`
2. Configuración de `VITE_STRIPE_PUBLISHABLE_KEY` en `env.js` + singleton `loadStripe` en `src/lib/stripe.js`
3. Checkout reestructurado de 4 a 5 pasos: Selection → Addons → Customer → **Review** → **Payment**
4. Step 4 (Review/Summary) convertido en solo lectura (sin botón de pago)
5. Step 5 (Payment) con Stripe Payment Element embebido, checkbox de consentimiento legal, botón "Pagar", y disclosure de Stripe
6. `useCheckout.js` modificado: almacena `clientSecret`/`orderId`, crea PaymentIntent al transicionar de Review→Payment, elimina lógica de redirect a Stripe
7. Success page soporta lookup por `order_id` (nuevo flujo) y `session_id` (legacy/asistido)
8. i18n completo EN/ES para paso de pago, consentimiento, errores e indicadores

### Qué NO incluye

- Flujo de ventas asistidas (PaymentLink / skipStripe) — sin cambios
- Webhook processing — cubierto en TASK-065
- Contenido de páginas legales — cubierto en TASK-064
- Tests automatizados / Cypress / Playwright
- Tematización dark mode del Payment Element
- Manejo de 3DS (Stripe lo maneja automáticamente dentro del elemento)

## Impacto técnico

### Paquetes

| Paquete | Versión | Acción |
|---|---|---|
| `@stripe/stripe-js` | ^6 | instalar |
| `@stripe/react-stripe-js` | ^3 | instalar |

### Archivos creados

| Archivo | Propósito |
|---|---|
| `src/lib/stripe.js` | Singleton `loadStripe()` con publishable key |
| `src/components/public/checkout/PaymentStep.jsx` | Stripe Payment Element + consentimiento + botón pay |

### Archivos modificados

| Archivo | Cambio |
|---|---|
| `src/config/env.js` | `stripePublishableKey` agregada |
| `src/hooks/useCheckout.js` | 5 pasos, `clientSecret`/`orderId` state, `createPaymentIntent()`, sin redirect |
| `src/components/public/checkout/CheckoutStepper.jsx` | 5 step keys |
| `src/components/public/checkout/OrderSummaryStep.jsx` | Solo lectura (sin botón submit, sin submitting/error props) |
| `src/pages/public/CheckoutPage.jsx` | Importa PaymentStep, 5 steps, botón Next en Review crea PaymentIntent |
| `src/pages/public/CheckoutSuccessPage.jsx` | Soporta `order_id` query param |
| `src/hooks/useOrderBySession.js` | Soporta lookup por `orderId` directo además de `sessionId` |
| `src/i18n/en/checkout.json` | step5, paymentStep keys |
| `src/i18n/es/checkout.json` | step5, paymentStep keys |
| `package.json` | Stripe packages |

### Componentes

| Componente | Superficie | Acción |
|---|---|---|
| `PaymentStep` | público/checkout | crear |
| `OrderSummaryStep` | público/checkout | modificar (solo lectura) |
| `CheckoutStepper` | público/checkout | modificar (5 pasos) |
| `CheckoutPage` | público/checkout | modificar (5 pasos + Payment Element) |
| `CheckoutSuccessPage` | público/checkout | modificar (order_id param) |

### Roles

| Label | Acceso |
|---|---|
| anónimo/client | Flujo completo de checkout con Payment Element |
| admin/operator | No afectados (ventas asistidas sin cambios) |

## Criterios de aceptación

- [x] El checkout muestra 5 pasos: Selection, Addons, Details, Review, Payment (EN) / Selección, Complementos, Datos, Resumen, Pago (ES)
- [x] El paso Review (4) muestra resumen de línea sin botón de pago; el botón "Next" avanza a Payment
- [x] Al transicionar de Review a Payment, se ejecuta `create-checkout` y se obtiene `clientSecret`
- [x] El paso Payment (5) muestra el Stripe Payment Element con apariencia OMZONE (colores sage, warm-gray borders, Inter font)
- [x] Existe un checkbox de consentimiento con links funcionales a Terms, Privacy y Refund Policy que abren en nueva pestaña
- [x] El botón "Pay $X MXN" está deshabilitado hasta que el checkbox de consentimiento esté marcado Y el formulario de pago esté listo
- [x] Al pagar con tarjeta de prueba `4242 4242 4242 4242`, el pago se procesa y redirige a success page con `order_id=...`
- [x] La success page carga y muestra la orden cuando se navega con `?order_id=X` (nuevo flujo)
- [x] La success page sigue funcionando con `?session_id=X` (flujo legacy asistido)
- [x] Al pagar con tarjeta declinada `4000 0000 0000 9995`, se muestra error inline sin salir de la página
- [x] El formulario de pago es usable en viewport de 375px (mobile)
- [x] Se muestra disclosure "Payments processed securely by Stripe..." debajo del botón de pago
- [x] Las ventas asistidas (PaymentLink/skipStripe) no se ven afectadas
- [x] Si el `clientSecret` ya existe (usuario regresa de Payment a Review y vuelve), no se crea un nuevo PaymentIntent

## Configuración requerida

1. Agregar `VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...` al archivo `.env`
2. En Stripe Dashboard, asegurar que el webhook endpoint tenga los eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed` (para ventas asistidas)

## Notas

- El Payment Element de Stripe maneja automáticamente 3DS, Apple Pay, Google Pay y otros métodos según la configuración de la cuenta Stripe
- PCI compliance: SAQ-A (los datos de tarjeta nunca tocan nuestro servidor)
- La apariencia del Payment Element está configurada con design tokens de OMZONE (charcoal, sage, warm-gray, Inter font)
- El singleton `loadStripe()` garantiza que el SDK se carga una sola vez
