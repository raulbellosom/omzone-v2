# Skill: Checkout Flow Validator

## Cuándo usarlo

- Después de implementar o modificar el flujo de checkout de OMZONE
- Cuando una task doc involucra: selección de experiencia → variante → addons → pago → orden → ticket
- Al integrar o modificar la Function `create-checkout` o la interacción con Stripe Checkout Sessions
- Cuando se detecta un bug en el flujo de compra y se necesita validar el fix
- Antes de aprobar una task que toca pricing, variantes, addons, paquetes o pases

**Ejemplos concretos:**
- "Validar que el checkout de una sesión con 2 addons genera orden con snapshot correcto"
- "Verificar que un pase consumible descuenta correctamente al checkout"
- "Confirmar que el precio mostrado en frontend coincide con el cobrado en Stripe"

## Cuándo NO usarlo

- Para construir el checkout desde cero → usar skill `appwrite-function-builder` + prompt `create-function`
- Para validar solo la parte de webhooks → usar skill `stripe-webhook-validator`
- Para validar solo la emisión de tickets post-pago → usar skill `ticketing-flow-tester`
- Para auditar responsive del formulario de checkout → usar skill `responsive-auditor`

## Entradas necesarias

- [ ] Documento maestro leído — secciones de checkout, órdenes, pricing, variantes, addons, paquetes
- [ ] Task doc disponible (si la validación es sobre una task específica)
- [ ] `appwrite.json` revisado — tablas: `orders`, `order_items`, `tickets`, `experiences`, `editions`, `variants`, `addons`, `packages`, `passes`
- [ ] Código de la Function de checkout: `functions/create-checkout/src/main.js`
- [ ] Código del componente de checkout en frontend (si existe)
- [ ] Configuración de Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` en `.env.example`

## Procedimiento paso a paso

### Fase 1: Preparación

**Paso 1 — Mapear el flujo completo**
Documentar el flujo de checkout de punta a punta:
1. Usuario selecciona experiencia + edición + variante
2. Usuario agrega addons opcionales
3. Usuario aplica paquete/pase (si tiene)
4. Frontend muestra resumen con desglose de precios
5. Frontend invoca Function `create-checkout`
6. Function valida stock, precios, permisos
7. Function crea Stripe Checkout Session
8. Usuario paga en Stripe hosted checkout
9. Stripe envía webhook `checkout.session.completed`
10. Function de webhook crea orden + items + tickets
11. Usuario ve confirmación y tickets en customer portal

> ✅ Hecho cuando: tengo los 11 pasos mapeados con archivos/Functions responsables de cada uno.

**Paso 2 — Inventariar precios y variantes**
Para el caso de prueba, listar:
- Experiencia y tipo (sesión, inmersión, retiro, estancia)
- Edición específica con fecha y capacidad
- Variante(s) disponibles con precios
- Addon(s) disponibles con precios
- Paquete/pase aplicable (si hay)
- Precio final esperado: `variante + sum(addons) - descuento_pase`

> ✅ Hecho cuando: tengo tabla con desglose de precios y total esperado.

### Fase 2: Ejecución

**Paso 3 — Validar selección en frontend**
Verificar que el componente de checkout:
- Muestra variantes disponibles con precios correctos (leyendo de `variants` table)
- Muestra addons disponibles para esa experiencia (leyendo de `addons` table)
- Calcula subtotal en tiempo real al agregar/quitar items
- No permite seleccionar variantes agotadas (`stock <= 0`)
- No permite cantidades que excedan stock disponible
- Muestra precio del pase/descuento si aplica

> ✅ Hecho cuando: el frontend refleja precios correctos y bloquea selecciones inválidas.

**Paso 4 — Validar Function `create-checkout`**
Verificar que la Function:
- Recibe: `editionId`, `variantId`, `addonIds[]`, `quantity`, `passId` (opcional)
- Valida cada campo con early return y error code
- Lee precios VIVOS de la base de datos (no confía en precios enviados por frontend)
- Verifica stock disponible en el momento de la solicitud
- Verifica que la edición está activa y la fecha no ha pasado
- Verifica labels del caller (`client` puede comprar, `admin`/`operator` no deberían en flujo normal)
- Calcula total en servidor: `variantPrice * quantity + sum(addonPrices)`
- Aplica descuento de pase si es válido y tiene usos disponibles
- Crea Stripe Checkout Session con `line_items` que reflejan precios del servidor
- Incluye `metadata` en la session de Stripe para reconciliación: `orderId`, `userId`, `editionId`
- Devuelve `{ ok: true, data: { checkoutUrl, sessionId } }`

**Validaciones críticas de seguridad:**
- ⚠️ El precio NUNCA viene del frontend — se lee de la base de datos en la Function
- ⚠️ El stock se verifica en la Function, no en el frontend
- ⚠️ Si el pase tiene usos = 0, se rechaza con error específico

> ✅ Hecho cuando: la Function calcula precios en servidor, valida todo, y el monto en Stripe coincide.

**Paso 5 — Validar snapshot en la orden**
Después de que el webhook de Stripe confirma el pago, verificar que la orden contiene:
- Referencia al usuario (`userId`)
- Estado: `paid` o `confirmed`
- Snapshot JSON con:
  - Experiencia: nombre, tipo, ID
  - Edición: fecha, lugar, ID
  - Variante: nombre, precio unitario, ID
  - Addons: array con nombre, precio, ID de cada uno
  - Cantidad
  - Descuento aplicado (pase, si hubo)
  - Total cobrado
  - Stripe Session ID
  - Timestamp de la compra
- Los order_items detallan cada línea individualmente
- El snapshot permite reconstruir la venta completa SIN leer datos vivos

> ✅ Hecho cuando: el snapshot tiene toda la información y coincide con lo cobrado en Stripe.

**Paso 6 — Validar consistencia de montos**
Cruzar 3 fuentes que DEBEN coincidir:

| Fuente | Monto |
|---|---|
| Frontend (mostrado al usuario) | `$X.XX` |
| Stripe Checkout Session (`amount_total`) | `$X.XX` (en cents) |
| Snapshot de la orden (`totalAmount`) | `$X.XX` |

Si los 3 no coinciden → **bug crítico**.

> ✅ Hecho cuando: los 3 montos son idénticos.

**Paso 7 — Validar edge cases**

| Edge case | Comportamiento esperado |
|---|---|
| Variante agotada al momento del checkout | Function rechaza con `ERR_CHECKOUT_OUT_OF_STOCK` |
| Edición con fecha pasada | Function rechaza con `ERR_CHECKOUT_EDITION_EXPIRED` |
| Addon que no pertenece a la experiencia | Function rechaza con `ERR_CHECKOUT_INVALID_ADDON` |
| Pase sin usos disponibles | Function rechaza con `ERR_CHECKOUT_PASS_EXHAUSTED` |
| Cantidad = 0 o negativa | Function rechaza con `ERR_CHECKOUT_INVALID_QUANTITY` |
| Usuario no autenticado | Function rechaza con `ERR_AUTH_REQUIRED` |
| Precio cambia entre selección y pago | Function usa precio vivo del servidor, no el del frontend |
| Doble click en botón de pago | Idempotency key previene checkout duplicado |
| Stripe webhook llega duplicado | Webhook handler es idempotente — no crea orden dos veces |
| Red caída entre pago y webhook | Stripe reintenta. Si orden queda en limbo, reconciliación manual/cron |

> ✅ Hecho cuando: cada edge case se probó o se verificó en código.

**Paso 8 — Validar experiencia post-compra**
- El usuario es redirigido a página de confirmación después del pago
- La página de confirmación muestra resumen de la compra
- Los tickets aparecen en el customer portal
- El stock se decrementó correctamente
- Si hubo pase, los usos restantes se decrementaron

> ✅ Hecho cuando: el flujo post-pago es coherente y el usuario tiene acceso a sus tickets.

### Fase 3: Validación

**Paso 9 — Cruzar con documento maestro**
Verificar que el flujo implementado cumple todas las reglas del documento maestro para:
- Checkout y órdenes
- Pricing y variantes
- Snapshots y datos históricos
- Permisos por label

> ✅ Hecho cuando: no hay discrepancia entre implementación y doc maestro.

**Paso 10 — Compilar reporte**
Generar reporte con el formato de output especificado abajo.

> ✅ Hecho cuando: reporte completo con issues numerados y recomendación.

## Checklist de entrega

- [ ] Flujo de 11 pasos mapeado con archivos responsables
- [ ] Precios se calculan en servidor, NUNCA del frontend
- [ ] Stock se valida en Function antes de crear Checkout Session
- [ ] Stripe Checkout Session tiene `metadata` para reconciliación
- [ ] Snapshot de orden contiene TODOS los datos para reconstruir la venta
- [ ] Montos coinciden: frontend ↔ Stripe ↔ snapshot
- [ ] Idempotencia implementada en checkout y webhook
- [ ] Edge cases cubiertos: stock=0, fecha pasada, addon inválido, pase agotado, doble click
- [ ] Labels verificados: `client` puede comprar, otros roles tienen restricciones correctas
- [ ] Post-compra: tickets visibles en customer portal, stock decrementado, pase consumido
- [ ] No hay datos sensibles expuestos en frontend (Stripe secret key, API key)
- [ ] Error codes descriptivos en cada punto de fallo

## Errores comunes

❌ **Confiar en el precio que envía el frontend** → ✅ La Function SIEMPRE lee precios de la base de datos. El frontend puede ser manipulado via DevTools. El body del request solo envía IDs y cantidades, nunca montos.

❌ **No verificar stock en la Function** → ✅ El frontend puede mostrar stock disponible, pero entre la carga de página y el click de "Pagar" otro usuario pudo agotar el stock. Verificar en servidor justo antes de crear la session de Stripe.

❌ **Snapshot incompleto que no permite reconstruir la venta** → ✅ El snapshot debe contener nombre, precio, ID de experiencia, edición, variante, cada addon, descuento de pase, total y timestamp. Si falta un campo, no se puede generar factura ni resolver disputa futura.

❌ **No implementar idempotencia y cobrar dos veces** → ✅ Usar idempotency key basada en `userId + editionId + variantId + timestamp` para prevenir checkouts duplicados por doble click.

❌ **Webhook que crea orden sin verificar si ya existe** → ✅ Antes de crear la orden, verificar si ya existe una con el mismo `stripeSessionId`. Si existe, retornar ok sin duplicar.

❌ **Permitir checkout de edición con fecha pasada** → ✅ Comparar `edition.date` contra `new Date()` en la Function. No depender de que el frontend filtre ediciones expiradas.

❌ **No decrementar stock después de compra confirmada** → ✅ En el webhook handler, después de crear la orden y tickets, decrementar el stock de la variante. Usar update atómico si es posible.

## Output esperado

```markdown
# Checkout Flow Validation Report

## Resumen
| Aspecto | Estado |
|---|---|
| Pricing en servidor | ✅ / ❌ |
| Stock validado | ✅ / ❌ |
| Snapshot completo | ✅ / ❌ |
| Montos consistentes | ✅ / ❌ |
| Idempotencia | ✅ / ❌ |
| Edge cases | ✅ / ❌ |
| Post-compra | ✅ / ❌ |

## Issues encontrados
### CHK-001: [título]
- Severidad: critical / major / minor
- Descripción: ...
- Fix sugerido: ...

## Recomendación
- ✅ APROBADO / ⚠️ CON OBSERVACIONES / ❌ RECHAZADO
```

## Referencias cruzadas

- Documento maestro: `docs/core/00_documento_maestro_requerimientos.md` — secciones de checkout, órdenes, pricing
- Instrucción de Functions: `.github/instructions/functions.instructions.md`
- Instrucción de schema: `.github/instructions/appwrite-schema.instructions.md`
- Agente que invoca este skill: `.github/agents/stripe.agent.md`, `.github/agents/functions.agent.md`
- Prompt relacionado: `.github/prompts/create-function.prompt.md`
- Skill complementario: `.github/skills/stripe-webhook-validator/` (para la parte de webhook)
- Skill complementario: `.github/skills/ticketing-flow-tester/` (para la parte post-pago)
- Skill complementario: `.github/skills/appwrite-function-builder/` (para construir la Function)
