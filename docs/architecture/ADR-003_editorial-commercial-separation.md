# ADR-003: Separación editorial / comercial como capas distintas

**Fecha:** 2026-04-05
**Estado:** Aceptado
**Dominio(s):** Editorial, Comercial

---

## Contexto

OMZONE vende experiencias premium con una narrativa editorial fuerte. La forma en que se comunica una experiencia al público (storytelling, galerías, testimonios) es diferente de la forma en que se configura su venta (precios, tiers, addons, capacidad). Mezclar ambas en una sola entidad genera acoplamiento: cambiar la narrativa afecta la venta y viceversa.

## Opciones evaluadas

### Opción A — Una sola tabla `experiences` con todos los campos
- **Pros:** Simple. Un solo query para todo.
- **Contras:** La tabla crece a 50+ atributos. Cambiar copy obliga a tocar la misma tabla que define precios. No permite publicaciones editoriales sin experiencia comercial (ej: blog post institucional).

### Opción B — Tabla `experiences` como catálogo maestro + `publications` para contenido editorial extendido
- **Pros:** `experiences` contiene datos core + datos públicos básicos (nombre, slug, descripción, imagen). `publications` contiene storytelling modular con secciones. Una publicación puede existir sin experiencia (contenido institucional). Una experiencia puede existir sin publicación (solo catálogo directo).
- **Contras:** Requiere diseñar secciones modulares y vincular opcionalmente.

### Opción C — Separación total: `experience_editorial` + `experience_commercial`
- **Pros:** Separación perfecta.
- **Contras:** Over-engineering. Dos tablas extra para algo que se resuelve con `experiences` + `publications`.

## Decisión

**Opción B:** `experiences` como catálogo maestro + `publications` como CMS editorial.

- `experiences` contiene: nombre público, slug, tipo, saleMode, descripción corta/larga, imagen hero, configuración de venta.
- `publications` contiene: storytelling largo, secciones modulares, SEO avanzado, y opcionalmente enlaza a una experiencia.
- `publication_sections` son bloques modulares (hero, gallery, faq, itinerary, etc.) dentro de una publicación.

Esto permite:
1. Una experiencia simple se muestra con sus propios datos públicos en `experiences`.
2. Un retiro premium tiene además una `publication` con secciones ricas.
3. Un blog post institucional es una `publication` sin experiencia comercial.

## Entidades impactadas

| Tabla | Efecto |
|---|---|
| `experiences` | Contiene datos públicos básicos + configuración comercial |
| `publications` | CMS editorial modular, opcionalmente enlazada a experiencia |
| `publication_sections` | Bloques de contenido dentro de publicación |

## Flujo de datos

- Sitio público → lee `experiences` para catálogo + `publications` para detalle rico
- Admin panel → gestiona `experiences` en un CRUD y `publications` en otro
- Checkout → solo lee datos de `experiences` + dominio comercial (nunca publications)

## Riesgos

- **Duplicación parcial:** Los datos públicos básicos de una experiencia (nombre, descripción corta) viven en `experiences`, no en `publications`. Si el admin quiere un nombre editorial diferente, lo pone en la publicación. Mitigación: el frontend prioriza datos de `publications` si existe; fallback a `experiences`.
- **Huérfanos:** Una experiencia borrada puede dejar una publicación huérfana. Mitigación: soft-delete (status: archived) y validación en admin.

---

**ADR ID:** ADR-003
