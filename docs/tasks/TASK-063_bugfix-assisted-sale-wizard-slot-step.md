# TASK-063: Bugfix — Venta asistida se queda trabada en paso Slot

## Objetivo

Corregir el wizard de venta asistida (`/admin/sales/new`) que se queda trabado en el paso 4 (Slot) cuando no hay slots publicados o cuando ocurre un error al cargarlos, impidiendo que el admin/operator complete el flujo de venta.

## Contexto

- Reportado en documento de pruebas manuales del panel administrador.
- El wizard de venta asistida tiene 7 pasos: Customer → Experience → Tier → Slot → Addons → Quantity → Review.
- El paso Slot (step 4) es condicional: solo se muestra si `experience.requiresSchedule === true`.
- Cuando se muestra y no hay slots disponibles, el botón "Siguiente" queda deshabilitado permanentemente sin forma de avanzar.

## Alcance

- Corregir `SlotSelectStep.jsx` para manejar el caso de 0 slots disponibles (auto-skip o permitir avanzar).
- Corregir `SlotSelectStep.jsx` para mostrar estado de error cuando `useSlots` falla.
- Ajustar `canProceed()` en `AssistedSaleWizard.jsx` para el caso de experiencias con schedule pero sin slots.
- Verificar que la lógica no rompa el flujo de experiencias SIN `requiresSchedule`.

## Fuera de alcance

- CRUD de slots desde este wizard (se crean desde la agenda).
- Checkout público: el flujo público ya maneja slots correctamente en `SelectionStep.jsx`.
- Creación automática de slots ficticios para experiencias sin agenda.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Agenda (slots, recursos, capacidad)

## Entidades / tablas implicadas

| Tabla         | Operación | Notas                                                       |
| ------------- | --------- | ----------------------------------------------------------- |
| `slots`       | leer      | Se leen slots publicados futuros por `experienceId`         |
| `experiences` | leer      | Se lee `requiresSchedule` para decidir si mostrar paso Slot |

## Componentes frontend implicados

| Componente           | Superficie | Operación | Notas                                                                                 |
| -------------------- | ---------- | --------- | ------------------------------------------------------------------------------------- |
| `SlotSelectStep`     | admin      | modificar | Agregar manejo de 0 slots y error state                                               |
| `AssistedSaleWizard` | admin      | modificar | Ajustar `canProceed("slot")` para permitir avanzar sin slot cuando no hay disponibles |

## Hooks implicados

| Hook       | Operación          | Notas                                                                |
| ---------- | ------------------ | -------------------------------------------------------------------- |
| `useSlots` | leer (sin cambios) | Ya retorna `{ data, loading, error }` — el componente no usa `error` |

## Rutas implicadas

| Ruta               | Superficie | Guard          | Notas                    |
| ------------------ | ---------- | -------------- | ------------------------ |
| `/admin/sales/new` | admin      | admin/operator | Wizard de venta asistida |

## Permisos y labels involucrados

| Acción               | root | admin | operator | client | anónimo |
| -------------------- | ---- | ----- | -------- | ------ | ------- |
| Crear venta asistida | ✅   | ✅    | ✅       | ❌     | ❌      |

## Bugs identificados

### BUG-1 (crítico): Wizard trabado cuando no hay slots disponibles

- **Severidad:** crítica
- **Capa:** frontend
- **Reproducción:**
  1. Ir a Dashboard → "Nueva venta"
  2. Seleccionar un customer
  3. Seleccionar una experiencia con `requiresSchedule: true`
  4. Seleccionar un pricing tier
  5. Llegar al paso Slot
  6. Si no hay slots publicados futuros → se muestra "No hay horarios disponibles"
  7. El botón "Siguiente" queda deshabilitado permanentemente
- **Causa raíz:** `canProceed("slot")` retorna `!!wizard.slot`, que es `false` si no se seleccionó ningún slot. No hay forma de seleccionar un slot si no existen.
- **Archivos:** `AssistedSaleWizard.jsx` (línea 93), `SlotSelectStep.jsx` (línea 118-120)

### BUG-2 (alta): Error de carga de slots no se muestra al usuario

- **Severidad:** alta
- **Capa:** frontend
- **Reproducción:**
  1. Si `useSlots` falla (error de permisos, red, etc.)
  2. El hook retorna `{ error: "mensaje", data: [], loading: false }`
  3. El componente muestra "No hay horarios disponibles" en vez del error real
  4. El admin no sabe que hubo un error de carga
- **Causa raíz:** `SlotSelectStep.jsx` no consume `error` del hook `useSlots`.
- **Archivos:** `SlotSelectStep.jsx` (línea 89)

## Flujo principal del fix

1. En `SlotSelectStep.jsx`:
   - Destructurar `error` de `useSlots`
   - Cuando `error` existe, mostrar mensaje de error con opción de reintentar
   - Cuando `slots.length === 0` y no hay error, mostrar mensaje informativo y setear `wizard.slot` a `null` explícitamente indicando "sin slot"
2. En `AssistedSaleWizard.jsx`:
   - Modificar `canProceed("slot")` para permitir avanzar cuando la experiencia requiere schedule pero no hay slots disponibles (wizard.slotSkipped o equivalente)
3. En `SlotSelectStep.jsx`:
   - Agregar un botón/toggle "Continuar sin horario" que setee un flag `slotSkipped: true` en el wizard

## Criterios de aceptación

- [x] Si hay slots disponibles, el admin puede seleccionar uno y avanzar (happy path sin regresión)
- [x] Si no hay slots disponibles, se muestra mensaje claro y un botón "Continuar sin horario" que permite avanzar
- [x] Si `useSlots` retorna error, se muestra el error con botón "Reintentar"
- [x] Si la experiencia no tiene `requiresSchedule`, el paso Slot se omite correctamente (sin regresión)
- [x] El botón "Siguiente" no queda permanentemente deshabilitado en ningún escenario del paso Slot
- [x] El `ReviewConfirmStep` muestra correctamente cuando se avanzó sin slot (indicando "Sin horario asignado" o similar)
- [x] El admin puede volver atrás desde el paso Slot y cambiar de experiencia sin errores
- [x] El wizard funciona correctamente en mobile (responsive, botones touchable)
- [x] Los permisos no se ven afectados (admin y operator pueden completar el flujo)

## Dependencias

- TASK-014: CRUD de slots / agenda admin — provee los slots que se consultan
- TASK-012: CRUD de ediciones y pricing tiers admin — provee el paso anterior (tier)

## Riesgos y notas

- **Riesgo:** Si se permite avanzar sin slot, la Function `create-checkout` valida `if (experience.requiresSchedule && !slotId)` y retorna error. Hay que decidir: ¿la venta asistida permite crear orden sin slot (venta manual/override admin)? ¿O se debe crear un slot ad-hoc? → Para este bugfix, la solución mínima es permitir al admin continuar con `slotId: null` y que `create-checkout` lo acepte solo si viene de venta asistida (flag `assistedSale: true`).
- **Alternativa:** Si no se quiere modificar `create-checkout`, el fix mínimo es mostrar un mensaje claro de "No hay horarios — crea uno primero desde la Agenda" con link directo a `/admin/agenda` en vez de trabar el wizard.
