# ADR-005: Lógica sensible en Appwrite Functions, no en frontend

**Fecha:** 2026-04-05
**Estado:** Aceptado
**Dominio(s):** Transaccional, Seguridad

---

## Contexto

OMZONE tiene flujos comerciales sensibles: checkout, cálculo de precios, emisión de tickets, procesamiento de webhooks Stripe, asignación de labels. Si esta lógica se ejecuta en el frontend, queda expuesta a manipulación.

## Opciones evaluadas

### Opción A — Frontend calcula totales y crea órdenes
- **Pros:** Simple. Menos Functions.
- **Contras:** El cliente puede manipular precios, cantidades, descuentos. Inseguro.

### Opción B — Appwrite Functions para toda lógica sensible
- **Pros:** Los precios se leen server-side. Los snapshots se crean server-side. Los webhooks se validan con HMAC. Los labels se asignan sin intervención del cliente.
- **Contras:** Más Functions que mantener. Cada Function necesita deploy.

## Decisión

**Opción B:** Functions para toda lógica sensible.

Functions planificadas:

| Function | Propósito |
|---|---|
| `create-checkout` | Validar carrito, leer precios de DB, calcular total, crear orden, crear Stripe session |
| `stripe-webhook` | Recibir y verificar webhook Stripe, actualizar orden y payment |
| `generate-ticket` | Emitir tickets con QR y snapshot tras pago confirmado |
| `validate-ticket` | Escanear QR y registrar redención |
| `consume-pass` | Validar y descontar crédito de pase |
| `assign-user-label` | Asignar label a usuario (signup o invitación) |
| `process-refund` | Iniciar reembolso vía Stripe y registrar |
| `send-confirmation` | Enviar email/notificación post-compra |
| `send-reminder` | Enviar recordatorio de evento próximo |

Regla: **El frontend NUNCA calcula precios finales ni crea órdenes directamente.** Envía intención (experienceId, slotId, addons, quantity) y la Function valida todo.

## Riesgos

- **Latencia:** Una Function que lee múltiples colecciones puede tardar. Mitigación: optimizar queries, usar índices correctos, cache donde sea posible.
- **Cold starts:** Appwrite Functions tienen cold start. Mitigación: aceptable para checkout (~2s). Considerar keep-warm en producción.

---

**ADR ID:** ADR-005
