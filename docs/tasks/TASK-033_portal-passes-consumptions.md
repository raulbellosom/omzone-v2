# TASK-033: Mis pases y consumos

## Objetivo

Implementar la sección "Mis Pases" en el portal de cliente con listado de pases comprados, barra de créditos, historial de consumos y flujo "Usar pase" para consumir un crédito seleccionando experiencia y slot. Al completar esta tarea, un cliente puede ver sus pases activos, consultar cuántos créditos le quedan, revisar su historial de uso y consumir créditos directamente desde el portal.

## Contexto

- **Fase:** 9 — Portal de cliente
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 9
- **Documento maestro:** Sección 7.6 (Pase consumible), RF-07, RF-13 (Pases consumibles), RF-12 (Portal de cliente)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `user_passes` (6.7), `pass_consumptions` (6.6), `passes` (3.8), `slots` (4.1), `experiences` (2.1)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Portal cliente: Comercial (read passes), Transaccional (read own user_passes, write via Function)
- **ADR relacionados:** ADR-005 (Lógica sensible en Functions) — el consumo de créditos se ejecuta vía Function `consume-pass`, no cliente-side

## Alcance

Lo que SÍ incluye esta tarea:

1. **My Passes List** (`/portal/passes`):
   - Listado de user_passes del usuario autenticado.
   - Card para cada pase: nombre del tipo de pase (del passSnapshot), créditos restantes/totales como barra visual, status badge, fecha de expiración (si aplica).
   - Filtro: activos, depleted, expired, todos.
   - Pases activos primero; depleted y expired en sección separada "Pases anteriores".

2. **Pass Detail** (`/portal/passes/:userPassId`):
   - Header: nombre del pase, status, barra de créditos grande.
   - Info: créditos totales, restantes, fecha de activación, fecha de expiración.
   - Experiencias válidas: lista de experiencias cubiertas (de `validExperienceIds` del passSnapshot o tipo de pase).
   - Historial de consumos: lista de `pass_consumptions` con fecha, experiencia, slot.

3. **"Usar pase" flow:**
   - CTA "Usar pase" en el pass detail (solo si `status === "active"` y `remainingCredits > 0`).
   - Step 1: Seleccionar experiencia — mostrar experiencias válidas para el pase.
   - Step 2: Seleccionar slot — mostrar slots disponibles de la experiencia seleccionada.
   - Step 3: Confirmar — resumen con experiencia, fecha, hora, créditos a usar.
   - Submit: invocar Function `consume-pass` con `userPassId` y `slotId`.
   - Success: mostrar ticket generado con QR y actualizar créditos restantes.
   - Error: mostrar mensaje del error (slot full, no credits, etc.).

4. **Credits progress indicator:**
   - Barra visual de progreso (créditos usados / totales).
   - Color coding: verde (>50%), amarillo (25-50%), rojo (<25% restante).

## Fuera de alcance

- Compra de pases (checkout — TASK-029).
- Pass gifting / transfer.
- Pass extension / renewal.
- Pass refund.
- Push notifications de expiración.
- Bulk pass consumption.

## Dominio

- [x] Comercial (pricing, addons, paquetes, pases)
- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Frontend portal

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `user_passes` | leer | Listar por userId; detalle de un user pass |
| `passes` | leer | Tipo de pase para info adicional (validExperienceIds) |
| `pass_consumptions` | leer | Historial de consumo para detalle |
| `experiences` | leer | Lista de experiencias válidas para el flow "Usar pase" |
| `slots` | leer | Slots disponibles para consumo |
| `tickets` | leer | Ticket generado tras consumo (para mostrar QR) |

## Atributos nuevos o modificados

N/A — se leen atributos existentes.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `consume-pass` | usar existente | Invocada en el flow "Usar pase" |

## Buckets / Storage implicados

N/A.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `PassList` | portal | crear | Listado de pases del usuario |
| `PassCard` | portal | crear | Card de pase con barra de créditos |
| `PassDetail` | portal | crear | Detalle de un pase |
| `CreditBar` | portal | crear | Barra visual de créditos restantes |
| `ConsumptionHistory` | portal | crear | Lista de consumos de un pase |
| `UsePassFlow` | portal | crear | Multi-step: experiencia → slot → confirmar |
| `ExperienceSelector` | portal | crear | Lista de experiencias válidas para el pase |
| `SlotSelector` | portal | crear | Selector de slots disponibles |
| `ConsumeConfirm` | portal | crear | Pantalla de confirmación pre-consumo |
| `ConsumeSuccess` | portal | crear | Resultado exitoso con ticket y QR |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useUserPasses` | crear | Lista user_passes del usuario con filtros |
| `usePassDetail` | crear | Detalle de un user pass con consumos |
| `useConsumePass` | crear | Invoca consume-pass Function, maneja loading/error |
| `useValidSlots` | crear | Slots disponibles para una experiencia válida |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/portal/passes` | portal | `client` | Listado de pases |
| `/portal/passes/:userPassId` | portal | `client` | Detalle de un pase |
| `/portal/passes/:userPassId/use` | portal | `client` | Flow "Usar pase" |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Listar pases propios | ✅ | ✅ | ❌ | ✅ (solo propios) | ❌ |
| Ver detalle de pase propio | ✅ | ✅ | ❌ | ✅ (solo propio) | ❌ |
| Usar pase (consumir crédito) | ✅ | ✅ | ❌ | ✅ (solo propio) | ❌ |

## Flujo principal

### My Passes
1. Cliente navega a `/portal/passes`.
2. Query `user_passes` por `userId = current`.
3. Se muestra lista de PassCards con barra de créditos, status, expiración.
4. Filtro por status (activos por defecto); pases depleted/expired en sección separada.
5. Click en un pase → `/portal/passes/:userPassId`.

### Pass Detail
6. Se carga user pass + pass type + consumption history.
7. Se muestra: nombre, créditos (barra visual), experiencias válidas, historial de consumos.
8. Si `status === "active"` y `remainingCredits > 0`: CTA "Usar pase".

### Use Pass Flow
9. Click "Usar pase" → `/portal/passes/:userPassId/use`.
10. Step 1: lista de experiencias válidas (de validExperienceIds, filtrada a publicadas).
11. Cliente selecciona experiencia.
12. Step 2: slots disponibles de esa experiencia (status = available, startDatetime futuro, con capacidad).
13. Cliente selecciona slot.
14. Step 3: resumen — experiencia, fecha, hora, 1 crédito será consumido.
15. Click "Confirmar" → invoke `consume-pass` Function.
16. Si éxito: mostrar ticket generado con QR, créditos restantes actualizados.
17. Si error: mostrar mensaje (slot full, expired, no credits, experience not valid).

## Criterios de aceptación

- [x] La página `/portal/passes` lista todos los pases del usuario autenticado.
- [x] Cada pase muestra: nombre, barra de créditos (restantes/totales), status badge, fecha de expiración.
- [x] La barra de créditos tiene color coding: verde (>50%), amarillo (25-50%), rojo (<25%).
- [x] Se puede filtrar por status; pases activos se muestran primero.
- [x] Pases depleted y expired aparecen en sección "Pases anteriores".
- [x] El detalle del pase muestra: info completa, experiencias válidas, historial de consumos.
- [x] El historial de consumos muestra fecha, experiencia, slot para cada consumo.
- [x] El CTA "Usar pase" solo aparece si el pase tiene `status === "active"` y `remainingCredits > 0`.
- [x] En el flow "Usar pase", el step 1 muestra solo experiencias válidas para ese pase (publicadas).
- [x] En el step 2, se muestran solo slots disponibles (status = available, fecha futura, con capacidad).
- [x] En el step 3, se muestra resumen claro antes de confirmar.
- [x] Tras consumo exitoso, se muestra el ticket generado con QR y créditos actualizados.
- [x] Si el consumo falla, se muestra mensaje de error descriptivo (slot lleno, pase expirado, etc.).
- [x] El flow completo es responsive en mobile.
- [x] Un usuario solo puede ver y usar sus propios pases.
- [x] Si no hay pases, se muestra empty state con CTA para explorar pases disponibles.

## Validaciones de seguridad

- [x] Las queries a `user_passes` filtran por `userId` del usuario autenticado — enforced por Appwrite permissions.
- [x] El consumo de pase se ejecuta vía Function `consume-pass` que valida ownership server-side.
- [x] El frontend no permite consumir si `status !== "active"` o `remainingCredits === 0` (defensa en profundidad, server valida también).
- [x] No se expone `validExperienceIds` de pases de otros usuarios.

## Dependencias

- **TASK-006:** Schema transaccional — provee `user_passes`, `pass_consumptions`.
- **TASK-026:** CRUD pases admin — provee tipos de pase y user_passes.
- **TASK-027:** Function `consume-pass` — invocada en el flow "Usar pase".
- **TASK-030:** Portal layout — provee PortalLayout.

## Bloquea a

N/A — esta es una task terminal dentro de la fase 9.

## Riesgos y notas

- **validExperienceIds lookup:** Para mostrar experiencias válidas, se debe parsear `validExperienceIds` (JSON string array) del tipo de pase y fetchear las experiencias por IDs. Si la lista es grande, hacer batch query. Si `validExperienceIds` es null/vacío, asumir "cualquier experiencia" o indicar que el pase no tiene restricciones.
- **Slot availability refresh:** Los slots disponibles pueden cambiar entre que el usuario ve la lista y confirma. El server (Function) hace la validación final. Si el slot se llena entre selección y confirmación, mostrar error amable.
- **Multi-step UX:** El flow "Usar pase" es tres pasos. Considerar si implementar como páginas separadas o como stepper/wizard inline dentro de la misma ruta. Stepper inline es mejor UX en mobile (no pierde contexto).
- **Expiration display:** Si `expiresAt` es null, mostrar "Sin vencimiento". Si es futuro, mostrar días restantes. Si pasó, mostrar "Vencido" en rojo.
- **Performance:** El historial de consumos puede crecer. Limitar a últimos 20 consumos con "Ver más" si hay más.
