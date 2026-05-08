---
title: Playbooks de Reservas
description: Casos reales de reservas y pagos para checkout directo y venta asistida
section: reference
order: 3
lastUpdated: 2026-05-06
relatedRoutes:
  - /admin/experiences
  - /admin/experiences/:id/pricing
  - /admin/experiences/:id/slots
  - /admin/sales/new
  - /checkout
relatedCollections:
  - experiences
  - pricing_tiers
  - slots
  - orders
  - order_items
  - payments
keywords:
  - checkout
  - stripe
  - capacidad
  - venta asistida
  - reservas
---

# Playbooks de Reservas

Esta pagina es la guia operativa principal para flujos reales de reserva y pago en OMZONE.

## Checklist Rapida Admin (Si no aparecen fechas u horarios)

1. La experiencia esta en `published`.
2. El `saleMode` coincide con el flujo:
   - Checkout publico: `direct`
   - Wizard admin: `assisted` (o flujo asistido con orderType assisted)
3. Si es agendada, `requiresSchedule = true`.
4. El tier esta activo (`isActive = true`).
5. El `editionId` del tier es el correcto.
6. El slot esta en `published`.
7. El slot tiene fecha/hora futura.
8. El slot tiene disponibilidad positiva (`capacity - bookedCount > 0`).
9. Compatibilidad tier-slot por edicion:
   - Si tier tiene `editionId`, el slot debe tener el mismo `editionId`.
10. Si todo lo anterior cumple y no aparece, revisar filtros y zona horaria mostrada.

---

## Playbook 1: Checkout Directo Agendado (Stripe Embebido)

### Contexto
Cliente compra en checkout publico para una experiencia con horario.

### Precondiciones
- `saleMode=direct`, `status=published`.
- `requiresSchedule=true`.
- Al menos un tier activo y un slot compatible publicado/futuro.

### Flujo
1. Cliente selecciona tier.
2. Cliente selecciona slot (fecha/hora y ubicacion disponible).
3. Se habilita cantidad con limites efectivos.
4. Cliente revisa addons y datos.
5. En resumen se ejecuta `create-checkout`.
6. Backend devuelve `clientSecret` y Checkout Session `ui_mode=custom`.
7. Payment Element se muestra dentro de OMZONE (sin redirect hosted clasico).
8. Cliente confirma pago.
9. Webhook confirma orden, registra pago, reconcilia capacidad del slot y dispara tickets.

### Resultado Esperado
- UI: pagina de exito con contexto de orden.
- Backend:
  - `orders.status = confirmed`
  - `orders.paymentStatus = succeeded`
  - existe registro en `payments`
  - `bookedCount` del slot reconciliado

---

## Playbook 2: Checkout Directo con baja de cupo (Autoajuste de Cantidad)

### Contexto
Cliente cambia tier o slot y el nuevo cupo permitido es menor.

### Regla
La cantidad efectiva se calcula por interseccion de:
- Min/max de experiencia
- Min/max de tier
- Disponibilidad real del slot (`capacity - bookedCount`)

### Comportamiento Esperado
- UI autoajusta cantidad y muestra aviso visible.
- UI bloquea avance con cantidad fuera de rango.
- Backend vuelve a validar y rechaza cantidad invalida aunque UI este desfasada.

---

## Playbook 3: Addons en checkout directo y asistido

### Tipos soportados
- `per-person`: cobra por asistente.
- `fixed`: cobra una sola vez por orden.

### Tipos no soportados en esta fase
- `per-day`, `per-unit`, `quote`.

### Comportamiento esperado
- Addon requerido con tipo no soportado bloquea checkout con error claro.
- Addon opcional no soportado no se puede comprar en este flujo.
- Totales usan `chargeQuantity` real del addon.

---

## Playbook 4: Venta Asistida (Pago Manual)

### Contexto
Admin/operator vende a nombre del cliente y registra pago manual.

### Precondiciones
- Experiencia y tier validos.
- Si `requiresSchedule=true`, slot obligatorio (sin bypass).

### Flujo
1. Cliente -> Experiencia -> Tier -> Slot (si aplica) -> Addons -> Cantidad -> Revision.
2. Admin elige pago manual.
3. `create-checkout` crea orden asistida en ruta manual.
4. Orden queda confirmada/succeeded en el flujo manual.
5. Se dispara generacion de tickets.

### Resultado Esperado
- Orden creada lista para cumplimiento.
- Sin dependencia de hosted checkout para el paso manual.

---

## Playbook 5: Venta Asistida (Stripe Link)

### Contexto
Admin prepara orden y cliente paga despues por link.

### Flujo
1. Wizard captura cliente, experiencia, tier, slot obligatorio, addons y cantidad.
2. Admin elige metodo Stripe link.
3. Backend crea orden + link de pago.
4. Cliente paga en Stripe.
5. Webhook confirma orden y dispara cadena de cumplimiento.

### Resultado Esperado
- Orden termina en confirmed/succeeded tras webhook.
- Pago y reconciliacion de slot se registran de forma idempotente.

---

## Playbook 6: Diagnostico "No aparecen fechas/horarios"

### Causas mas comunes
- Tier ligado a edicion pero slots sin edicion o con otra edicion.
- Slots en draft/cancelled/full o sin disponibilidad.
- Experiencia sin `requiresSchedule`.
- Slots en pasado.

### Recuperacion
1. Ejecutar checklist rapida de esta pagina.
2. Corregir primero compatibilidad tier-slot por `editionId`.
3. Publicar slots futuros con capacidad valida.
4. Verificar lista de slots en checkout antes de pagar.

---

## Paginas Relacionadas

- [Flujos](./flows.md)
- [Experiencias](../catalog/experiences.md)
- [Niveles de Precio](../catalog/pricing-tiers.md)
- [Horarios y Agenda](../operations/slots.md)
- [Venta Asistida](../sales/assisted-sale.md)
- [Ordenes](../sales/orders.md)
