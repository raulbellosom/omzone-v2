# ADR-001: Modelo híbrido relacional + snapshot JSON

**Fecha:** 2026-04-05
**Estado:** Aceptado
**Dominio(s):** Transaccional, Comercial

---

## Contexto

OMZONE necesita un modelo de datos que soporte tanto la operación en tiempo real (catálogo, agenda, precios editables) como la integridad histórica de transacciones pasadas (órdenes, tickets, ventas que no deben cambiar si el admin actualiza precios futuros).

Appwrite 1.9.0 no tiene tipo JSON nativo, pero soporta atributos `string` de hasta 1 MB que permiten almacenar JSON stringified.

## Opciones evaluadas

### Opción A — Modelo 100% relacional
- **Pros:** Consistencia referencial estricta, queries potentes.
- **Contras:** Si el admin cambia un precio, todas las órdenes pasadas que apuntan a ese precio "mienten". Se requeriría versionado de precios con tablas adicionales.

### Opción B — Modelo 100% snapshot (document store)
- **Pros:** Cada orden es auto-contenida e inmutable.
- **Contras:** No hay relaciones navegables. El admin no puede hacer queries cruzadas fácilmente (ej: "todas las órdenes de esta experiencia").

### Opción C — Modelo híbrido: relaciones vivas + snapshots JSON en capa transaccional
- **Pros:** Mejor de ambos mundos. Las relaciones vivas permiten queries y navegación. Los snapshots garantizan integridad histórica.
- **Contras:** Redundancia controlada. Se debe disciplinar qué va en relación y qué va en snapshot.

## Decisión

**Opción C:** Modelo híbrido.

- Las entidades de catálogo (experiences, editions, pricing_tiers, addons, slots) usan **relaciones vivas** entre sí.
- Las entidades transaccionales (orders, order_items, tickets, refunds) contienen un atributo `snapshot` / `itemSnapshot` / `ticketSnapshot` de tipo `string` con JSON stringified que captura los datos al momento de la transacción.
- Los snapshots son **inmutables**: nunca se editan después de creados.
- Los snapshots son **completos**: contienen todo lo necesario para reconstruir la venta sin leer otras tablas.
- Los snapshots se crean **server-side** en Functions, nunca desde el frontend.

## Entidades impactadas

| Tabla | Efecto |
|---|---|
| `orders` | Atributo `snapshot` con JSON completo de la compra |
| `order_items` | Atributo `itemSnapshot` con datos del item al momento |
| `tickets` | Atributo `ticketSnapshot` con datos del ticket |
| `refunds` | Atributo `refundSnapshot` con datos de la orden al reembolsar |
| `user_passes` | Atributo `passSnapshot` con datos del pase comprado |

## Riesgos

- **Tamaño de snapshot:** Si una orden tiene muchos items/addons, el snapshot puede ser grande. Mitigación: limitar a 50KB por snapshot, que cubre órdenes de hasta ~50 items.
- **Evolución del schema del snapshot:** Si el schema cambia, los snapshots antiguos tienen formato previo. Mitigación: versionar el snapshot con un campo `snapshotVersion` dentro del JSON.

---

**ADR ID:** ADR-001
