# ADR-004: Experience-first, no room-first

**Fecha:** 2026-04-05
**Estado:** Aceptado
**Dominio(s):** Editorial, Operativo

---

## Contexto

OMZONE tiene 6 cuartos multiuso en su recinto principal, además de espacios exteriores y locaciones especiales. En el proyecto anterior existía confusión entre "reservar un cuarto" y "comprar una experiencia". El recinto NO es un hotel; los cuartos no son el producto.

## Opciones evaluadas

### Opción A — Room-first: el cliente elige un cuarto y luego una experiencia
- **Pros:** Familiar para modelos de hotel/co-working.
- **Contras:** Contradice el modelo de negocio. OMZONE vende experiencias, no espacios. Un cuarto es un recurso operativo asignable después de la venta.

### Opción B — Experience-first: el cliente elige una experiencia y el cuarto se asigna internamente
- **Pros:** Alineado con el modelo de negocio. El catálogo público se diseña alrededor de experiencias, no de cuartos. Operativamente, el admin asigna cuartos después.
- **Contras:** El cuarto no es visible al público como filtro primario (es intencional).

## Decisión

**Opción B:** Experience-first.

Reglas:
1. Las `experiences` son el producto. Los `rooms` son operación.
2. El catálogo público muestra experiencias. Los cuartos NO aparecen como categoría de producto.
3. Los `rooms` viven en dominio operativo, separados del editorial/comercial.
4. Un `slot` puede tener un `roomId` y `locationId` opcionales, asignados por el admin para operación.
5. El admin puede filtrar slots por room internamente, pero el público no ve eso.
6. Las estancias con hospedaje se venden como experiencia con addon de acomodación, no como "reserva de cuarto".

## Entidades impactadas

| Tabla | Efecto |
|---|---|
| `locations` | Operativo. No visible al público como filtro. |
| `rooms` | Operativo. Asignable a slots. |
| `slots` | Campos `locationId` y `roomId` opcionales para asignación interna. |
| `experiences` | NO contiene referencia a room. Es el producto. |

## Riesgos

- **Experiencias ubicadas:** Algunas experiencias solo pueden ocurrir en cierto cuarto (ej: yoga aéreo requiere studio con telas). Mitigación: el admin crea slots para esa experiencia y les asigna el room correcto. La experiencia no depende del room; el admin gestiona la disponibilidad correcta.

---

**ADR ID:** ADR-004
