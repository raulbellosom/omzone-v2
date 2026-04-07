# TASK-014: CRUD slots y agenda desde admin

## Objetivo

Implementar la gestión de slots (disponibilidad agendable) desde el panel administrativo de OMZONE: listado de slots por experiencia, creación individual y recurrente (quick-create), edición, cancelación, vista de calendario simple, y asignación de recursos a slots. Al completar esta tarea, un admin puede crear slots con fecha, hora, capacidad y locación, visualizarlos en tabla y calendario, generar slots recurrentes, y asignar recursos (instructores, espacios) a cada slot.

## Contexto

- **Fase:** 3 — CRUD admin básico
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 3
- **Documento maestro:** Secciones:
  - **RF-04:** Gestión de agenda y disponibilidad — horarios fijos, recurrencias, rangos de fecha, cupos, ventanas de reserva
- **Modelo de datos:** `docs/architecture/01_data-model.md` — Sección 4.1 (`slots`), 4.2 (`slot_resources`)
- **Mapa de dominios:** `docs/architecture/00_domain-map.md` — Dominio Agenda (2.3) — slots son ocurrencias agendadas con capacidad; no confundir con ediciones ni pases
- **ADR relacionados:** ADR-004 (Experience-first, not room-first) — la experiencia se vende primero, la locación/cuarto se asigna operativamente después

Las tablas `slots` (13 atributos), `slot_resources` (4 atributos), y `resources` (7 atributos) fueron creadas en TASK-005. Las tablas `locations` y `rooms` también en TASK-005.

## Alcance

Lo que SÍ incluye esta tarea:

1. Sub-página de slots dentro de experiencia (`/admin/experiences/:id/slots`):
   - Tabla de slots: fecha, hora inicio/fin, capacidad, bookedCount, locationId (nombre), status, acciones
   - Filtro por status (available, full, cancelled, completed)
   - Filtro por rango de fechas
   - Botón "Crear slot"
   - Empty state si no hay slots
2. Formulario de creación de slot:
   - Campos: `experienceId` (auto del contexto), `editionId` (select opcional), `slotType` (enum select), `startDatetime`, `endDatetime`, `timezone`, `capacity`, `locationId` (select de locations), `roomId` (select de rooms filtrado por locationId), `status`, `notes`
   - `bookedCount` se inicializa en 0
   - Validación: startDatetime < endDatetime, capacity > 0, campos requeridos
3. Formulario de edición de slot:
   - Mismos campos, pre-poblados
   - No se puede editar `experienceId` ni `bookedCount` manualmente
4. Cancelar slot:
   - Cambiar status a `cancelled` con confirmación
   - Si `bookedCount` > 0, mostrar advertencia: "Este slot tiene reservas activas"
5. Vista de calendario simple:
   - Visualización semanal o mensual de slots de la experiencia
   - Cada slot se muestra como bloque con nombre de experiencia, hora y ocupación
   - Click en un slot → ir a edición
   - Implementación básica (grid por día/hora), no requiere librería de calendario compleja
6. Quick-create de slots recurrentes:
   - Formulario especial: seleccionar días de la semana, hora inicio/fin, fecha de inicio/fin del rango, timezone, capacity, locationId, roomId
   - Generar múltiples slots automáticamente (ej: "cada Lunes y Miércoles de 8:00 a 9:00, desde 2026-04-06 hasta 2026-04-27" → genera 8 slots)
   - Preview de los slots a generar antes de confirmar
   - Todos los slots generados tienen `slotType = "recurring"`
7. Asignación de recursos a slot:
   - Dentro del detalle de un slot, sección "Recursos asignados"
   - Lista de `slot_resources` asignados: nombre del recurso, role, notes
   - Botón "Asignar recurso"
   - Select de recurso (de la lista global de `resources` activos)
   - Select de role: instructor, assistant, equipment, space
   - Eliminar asignación de recurso
8. Página global de agenda (`/admin/slots`):
   - Calendario general con todos los slots de todas las experiencias
   - Filtro por experiencia
   - Filtro por fecha
9. Tab "Agenda/Slots" en el detalle de experiencia.

## Fuera de alcance

- Vista pública de agenda / disponibilidad (Fase 4).
- Booking logic (reserva de cupos, decremento de capacity) — eso es la Function de checkout.
- Validación de conflictos de horario entre slots (mismo recurso en dos slots simultáneos).
- Validación automática de capacidad (Function `update-slot-capacity`).
- Notificaciones de slot cancelado a clientes con reserva.
- Drag & drop para mover slots en el calendario.
- Integración con Google Calendar u otros.

## Dominio

- [x] Agenda (slots, recursos, capacidad)
- Nota: clasificado como **Agenda + Frontend admin** en el plan maestro.

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `slots` | crear / leer / actualizar | CRUD de slots por experiencia |
| `slot_resources` | crear / leer / eliminar | Asignaciones de recursos a slots |
| `resources` | leer | Para select de recursos disponibles |
| `locations` | leer | Para select de locación |
| `rooms` | leer | Para select de room (filtrado por locationId) |
| `experiences` | leer | Experiencia padre para contexto |
| `experience_editions` | leer | Para select de edición (opcional) |

## Atributos nuevos o modificados

N/A — las tablas `slots`, `slot_resources`, `resources`, `locations` y `rooms` fueron creadas en TASK-005.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | CRUD directo via Databases SDK. Operators pueden crear/editar slots por permisos de colección. |

## Buckets / Storage implicados

N/A — esta tarea no involucra Storage.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `SlotListPage` | admin | crear | Sub-página de slots por experiencia (tabla + filtros) |
| `SlotCreatePage` | admin | crear | Formulario de creación de slot individual |
| `SlotEditPage` | admin | crear | Formulario de edición de slot |
| `SlotForm` | admin | crear | Formulario reutilizable (create + edit) |
| `SlotCalendarView` | admin | crear | Vista de calendario simple (semana/mes) |
| `SlotQuickCreate` | admin | crear | Formulario de creación recurrente con preview |
| `SlotResourceSection` | admin | crear | Sección de recursos asignados dentro de detalle de slot |
| `SlotResourceForm` | admin | crear | Formulario de asignación de recurso (modal o inline) |
| `AgendaGlobalPage` | admin | crear | Calendario global `/admin/slots` con filtros |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useSlots` | crear | Fetch, create, update, cancel slots filtrados por experienceId |
| `useSlotResources` | crear | Fetch, create, delete slot_resources por slotId |
| `useLocations` | crear | Fetch locations activas para select |
| `useRooms` | crear | Fetch rooms filtrados por locationId para select |
| `useResources` | crear | Fetch resources activos para select |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/slots` | admin | heredado de `/admin` | Calendario global de todos los slots |
| `/admin/experiences/:id/slots` | admin | heredado | Slots de una experiencia (tabla + calendario) |
| `/admin/experiences/:id/slots/create` | admin | heredado | Crear slot individual |
| `/admin/experiences/:id/slots/quick-create` | admin | heredado | Crear slots recurrentes |
| `/admin/experiences/:id/slots/:slotId/edit` | admin | heredado | Editar slot |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Listar slots | ✅ | ✅ | ✅ | ❌ | ❌ |
| Crear slot | ✅ | ✅ | ✅ | ❌ | ❌ |
| Editar slot | ✅ | ✅ | ✅ | ❌ | ❌ |
| Cancelar slot | ✅ | ✅ | ❌ | ❌ | ❌ |
| Asignar recurso a slot | ✅ | ✅ | ❌ | ❌ | ❌ |
| Eliminar asignación de recurso | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver calendario global | ✅ | ✅ | ✅ | ❌ | ❌ |

Nota: Operator puede crear y editar slots (por permisos de colección: `Role.label("operator")` en create/update) pero no puede cancelar ni gestionar recursos asignados.

## Flujo principal

### Flujo A — Crear slot individual
1. Admin navega a `/admin/experiences/:id/slots`.
2. Ve tabla de slots existentes con filtros por status y fecha.
3. Hace click en "Crear slot".
4. Llena formulario: slotType (single), startDatetime, endDatetime, timezone, capacity (20), locationId (selecciona "Estudio principal"), roomId (selecciona "Sala yoga").
5. Se valida y crea el documento en `slots` con bookedCount = 0.
6. El slot aparece en la tabla y en la vista de calendario.

### Flujo B — Quick-create recurrente
1. Admin hace click en "Crear recurrentes" desde la página de slots.
2. Se abre formulario de quick-create.
3. Selecciona: Lunes y Miércoles, 08:00-09:00, timezone America/Mexico_City, desde 2026-04-06 hasta 2026-04-27, capacity 15, locación "Playa".
4. Preview muestra 8 slots a generar.
5. Admin confirma.
6. Se crean 8 documentos en `slots` secuencialmente.
7. Todos aparecen en la tabla y calendario.

### Flujo C — Asignar recurso a slot
1. Admin hace click en "Editar" en un slot.
2. En la página de edición, sección "Recursos asignados".
3. Hace click en "Asignar recurso".
4. Selecciona recurso "María García" con role "instructor".
5. Se crea documento en `slot_resources`.
6. María aparece en la lista de recursos del slot.

## Criterios de aceptación

- [ ] Un admin puede ver la lista de slots de una experiencia en tabla con fecha, hora, capacidad, bookedCount, status y acciones.
- [ ] Un admin puede crear un slot individual con startDatetime, endDatetime, timezone, capacity, locationId y status.
- [ ] La validación impide crear un slot donde endDatetime ≤ startDatetime o capacity ≤ 0.
- [ ] El `bookedCount` se inicializa en 0 al crear un slot nuevo.
- [ ] Un admin puede editar un slot existente (cambiar hora, capacidad, locación, notas).
- [ ] Un admin puede cancelar un slot cambiando su status a `cancelled`, con confirmación previa.
- [ ] Si un slot tiene `bookedCount` > 0 y se intenta cancelar, se muestra advertencia.
- [ ] La vista de calendario muestra los slots como bloques visuales en una grid semanal/mensual.
- [ ] Un admin puede usar quick-create para generar múltiples slots recurrentes (ej: cada Lunes y Miércoles de 8-9).
- [ ] Quick-create muestra preview de los slots a generar antes de confirmar creación.
- [ ] Un admin puede asignar un recurso a un slot seleccionando de la lista de resources activos.
- [ ] Un admin puede eliminar la asignación de un recurso a un slot.
- [ ] La página global `/admin/slots` muestra calendario con slots de todas las experiencias con filtros.
- [ ] Los filtros de slots por status y rango de fechas funcionan correctamente.
- [ ] El select de rooms se filtra dinámicamente por locationId seleccionado.
- [ ] En mobile (< 768px), la tabla de slots se transforma en cards y el calendario muestra vista de lista.

## Validaciones de seguridad

- [ ] Las operaciones de creación usan permisos de colección: admin y operator pueden crear/editar slots.
- [ ] Solo admin puede cancelar slots (delete permission en `Role.label("admin")`).
- [ ] `bookedCount` no se puede modificar manualmente desde el formulario (solo via Function en checkout/booking).
- [ ] Las fechas se validan como datetimes válidos en formato ISO.

## Dependencias

- **TASK-003:** Schema dominio editorial — provee `experiences` como entidad padre.
- **TASK-005:** Schema dominio agenda — provee tablas `slots`, `slot_resources`, `resources`, `locations`, `rooms`.
- **TASK-011:** CRUD experiencias desde admin — provee páginas de experiencia donde se anidan los slots.

## Bloquea a

- Fase 4 (catálogo público): necesita slots para mostrar disponibilidad.
- Fase 5 (checkout): necesita slots para selección de fecha/hora en la compra.
- **TASK-015:** CRUD resources y locations — provee datos de resources y locations para los selects (puede desarrollarse en paralelo si los selects manejan el caso de listas vacías).

## Riesgos y notas

- **Quick-create bulk:** La creación de muchos slots recurrentes (ej: 52 semanas × 3 días = 156 slots) puede ser lenta si se hacen requests secuenciales. Considerar un límite razonable (ej: max 50 slots por operación) o crear en batches.
- **Timezone handling:** Los slots se almacenan en UTC pero se crean en timezone local. El formulario debe mostrar la hora local y convertir a UTC antes de guardar. Usar `timezone` para reconvertir al mostrar.
- **Calendario simple:** No se requiere librería de calendario compleja (FullCalendar, etc.) en esta tarea. Un grid simple con Tailwind es suficiente. Se puede mejorar en iteraciones futuras.
- **Conflictos de horario:** No se validan conflictos (mismo instructor en dos slots simultáneos, mismo room ocupado). Esto es mejora futura. En esta tarea es responsabilidad del admin evitar conflictos manualmente.
- **TASK-015 interdependencia:** Los selects de locations, rooms y resources pueden estar vacíos si TASK-015 no está completada. Los formularios deben manejar gracefully el caso de listas vacías (mostrar mensaje "No hay locaciones registradas" en el select).
