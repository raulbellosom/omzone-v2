# TASK-065: Stripe PaymentIntent Backend + Webhook + Schema

## Objetivo

Migrar el flujo de pago directo de Stripe Checkout Sessions (redirect) a Stripe PaymentIntents (embedded), permitiendo que el frontend use Payment Element sin redireccionar al usuario fuera de la plataforma. Mantener intacto el flujo de ventas asistidas (PaymentLink/skipStripe).

## Contexto

- `create-checkout` actualmente crea `stripe.checkout.sessions.create()` para ventas directas y retorna `sessionUrl`.
- `stripe-webhook` maneja `checkout.session.completed` como handler primario.
- El frontend redirige a checkout.stripe.com.
- Se requiere migrar a PaymentIntent para soportar Stripe Payment Element embebido (TASK-066).

## Alcance

- Modificar `create-checkout`: para ventas directas → `stripe.paymentIntents.create()`, retornar `clientSecret`
- Modificar `stripe-webhook`: `payment_intent.succeeded` como handler primario para ventas directas, extraer `cardBrand`/`cardLast4`
- Agregar columnas `cardBrand` y `cardLast4` a tabla `payments` en `appwrite.json`
- Mantener `checkout.session.completed` para flujo de PaymentLink (ventas asistidas)
- Actualizar JSDoc de ambas funciones

## Fuera de alcance

- Frontend Payment Element (TASK-066)
- Reembolsos
- Nuevos métodos de pago (OXXO, SPEI)

## Dominio

- [x] Transaccional (pagos, órdenes)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `payments` | modificar schema | Agregar cardBrand, cardLast4 |
| `orders` | sin cambio de schema | Se usa stripePaymentIntentId existente |

## Atributos nuevos

| Tabla | Atributo | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `payments` | `cardBrand` | string(20) | no | Marca de tarjeta (visa, mastercard, etc.) |
| `payments` | `cardLast4` | string(4) | no | Últimos 4 dígitos de la tarjeta |

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `create-checkout` | modificar | PaymentIntent para ventas directas |
| `stripe-webhook` | modificar | card metadata extraction en payment_intent.succeeded |

## Criterios de aceptación

- [x] `create-checkout` con venta directa retorna `clientSecret` (no `sessionUrl`)
- [x] `create-checkout` con venta asistida sigue retornando `paymentLink` o `paid: true`
- [x] `stripe-webhook` procesa `payment_intent.succeeded` y crea payment record con cardBrand/cardLast4
- [x] Idempotencia: mismo evento procesado dos veces no duplica records
- [x] `payments` table tiene columnas cardBrand y cardLast4
- [x] Ventas asistidas no se ven afectadas

## Dependencias

- Ninguna

## Estimación de complejidad

Medio — cambios en dos funciones sensibles + schema.
