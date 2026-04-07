# TASK-041: Dashboard admin — métricas de ventas, tickets, ocupación

## Objetivo

Implementar la página de dashboard del panel admin que muestre métricas clave de negocio: ventas del mes, ingresos, tickets activos, slots próximos, solicitudes pendientes, órdenes recientes y acciones rápidas. Al completar esta tarea, un admin tiene visibilidad operativa inmediata al entrar al panel de administración.

## Contexto

- **Fase:** 12 — Venta asistida y operaciones admin
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 12
- **Documento maestro:** Secciones:
  - 13.3 (Módulos admin — dashboard interno)
  - **RF-15:** Panel admin completo (RF-13.3 dashboard)
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `orders` (6.1), `tickets` (6.4), `slots` (4.1), `booking_requests` (6.9)
- **ADR relacionados:** Ninguno específico — es frontend-only con queries de lectura.

El dashboard es la página home del panel admin. Agrega datos de múltiples colecciones para dar contexto operativo sin necesidad de navegar a secciones específicas.

## Alcance

Lo que SÍ incluye esta tarea:

1. Página de dashboard admin (`/admin` o `/admin/dashboard`):
   - Nombre de bienvenida del admin autenticado
   - Periodo de referencia: mes actual
2. Tarjetas de métricas (cards):
   - **Órdenes del mes:** conteo de órdenes con `status === "paid"` o `status === "confirmed"` del mes actual
   - **Ingresos del mes:** suma de `totalAmount` de órdenes pagadas del mes actual (formato moneda)
   - **Tickets activos:** conteo de tickets con `status === "active"`
   - **Slots próximos:** conteo de slots con `startDatetime` dentro de los próximos 7 días y `status === "available"`
3. Tabla de órdenes recientes:
   - Últimas 10 órdenes ordenadas por fecha
   - Columnas: número de orden, cliente, total, status, fecha
   - Link a detalle de orden
4. Slots próximos con capacidad:
   - Próximos 5 slots (7 días) con: experiencia, fecha/hora, cupos (bookedCount / capacity)
   - Indicador visual de ocupación (barra de progreso o porcentaje)
   - Link al slot en agenda admin
5. Solicitudes pendientes:
   - Conteo de booking requests con `status === "new"`
   - Link a la página de booking requests
6. Acciones rápidas (quick actions):
   - Botón "Crear experiencia" → `/admin/experiences/create`
   - Botón "Crear slot" → `/admin/slots/create`
   - Botón "Nueva venta" → `/admin/sales/new`
7. Mobile responsive:
   - Cards de métricas: 2×2 grid en mobile, 4 en fila en desktop
   - Tabla de órdenes → tarjetas en mobile
   - Cards y acciones rápidas apiladas en mobile

## Fuera de alcance

- Gráficos o charts (barras, líneas, pie).
- Filtro por rango de fechas personalizado.
- Export de métricas a CSV/PDF.
- Análisis histórico (comparación con mes anterior).
- Métricas de conversión (visitas → checkout → compra).
- Notificaciones en tiempo real.
- Widgets configurables por admin.

## Dominio

- [x] Frontend admin
- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Agenda (slots, recursos, capacidad)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `orders` | leer | Conteo y suma del mes, últimas 10 |
| `tickets` | leer | Conteo de tickets activos |
| `slots` | leer | Próximos 7 días con capacidad |
| `booking_requests` | leer | Conteo de status `new` |
| `experiences` | leer | Nombre de experiencia para slots y órdenes |
| `user_profiles` | leer | Nombre del admin para bienvenida |

## Atributos nuevos o modificados

N/A — todas las consultas son de lectura sobre atributos existentes.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| Ninguna | — | Queries directas con Appwrite Databases SDK (permisos label admin) |

## Buckets / Storage implicados

Ninguno.

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `AdminDashboardPage` | admin | crear | Página contenedor del dashboard |
| `MetricCard` | admin | crear | Card reutilizable para métrica (valor, label, icono) |
| `RecentOrdersTable` | admin | crear | Tabla de últimas 10 órdenes |
| `UpcomingSlotsCard` | admin | crear | Lista de slots próximos con ocupación |
| `PendingRequestsBadge` | admin | crear | Badge con conteo de solicitudes nuevas |
| `QuickActions` | admin | crear | Grid de botones de acciones rápidas |

## Hooks implicados

| Hook | Operación | Notas |
|---|---|---|
| `useDashboardMetrics` | crear | Fetch de métricas agregadas (órdenes, ingresos, tickets, slots) |
| `useRecentOrders` | crear | Fetch de últimas 10 órdenes |
| `useUpcomingSlots` | crear | Fetch de slots próximos con experiencia |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin` o `/admin/dashboard` | admin | admin | Dashboard principal |

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Ver dashboard | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver métricas de ingresos | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver órdenes recientes | ✅ | ✅ | ✅ | ❌ | ❌ |
| Ver slots próximos | ✅ | ✅ | ✅ | ❌ | ❌ |
| Acciones rápidas (crear/venta) | ✅ | ✅ | ❌ | ❌ | ❌ |

Nota: Operator puede ver el dashboard pero con métricas limitadas (no ve ingresos ni acciones de venta). Las cards de ingresos y la acción "Nueva venta" se ocultan para operator.

## Flujo principal

1. Admin inicia sesión y es redirigido a `/admin`.
2. El dashboard carga métricas del mes actual: órdenes, ingresos, tickets activos, slots próximos.
3. Se muestran 4 cards de métricas con valores numéricos claros.
4. Debajo, se muestra tabla de últimas 10 órdenes con link a cada una.
5. Se muestra sección de slots próximos con barra de ocupación.
6. Se muestra badge de solicitudes pendientes con link.
7. Se muestran acciones rápidas para tareas comunes.

## Criterios de aceptación

- [ ] Al acceder a `/admin`, se carga el dashboard como página principal.
- [ ] Se muestran 4 cards de métricas: órdenes del mes, ingresos del mes, tickets activos, slots próximos.
- [ ] Las métricas de órdenes e ingresos contabilizan solo órdenes con status `paid` o `confirmed` del mes actual.
- [ ] Los ingresos se muestran con formato de moneda (e.g., `$12,500 MXN`).
- [ ] Se muestra tabla de las últimas 10 órdenes con: número, cliente, total, status, fecha.
- [ ] Cada fila de orden tiene link al detalle de la orden.
- [ ] Se muestran los próximos 5 slots (7 días) con: nombre de experiencia, fecha/hora, ocupación (bookedCount/capacity).
- [ ] La ocupación se muestra con indicador visual (barra de progreso o porcentaje con color).
- [ ] Se muestra conteo de booking requests con status `new` con link a la página de solicitudes.
- [ ] Se muestran acciones rápidas: "Crear experiencia", "Crear slot", "Nueva venta".
- [ ] En mobile, las cards de métricas se muestran en grid 2×2.
- [ ] En mobile, la tabla de órdenes se transforma en tarjetas.
- [ ] Si no hay órdenes del mes, la card muestra "0" y la tabla muestra estado vacío.
- [ ] Un operator ve el dashboard pero sin card de ingresos y sin acción "Nueva venta".
- [ ] El dashboard carga en tiempo razonable (queries paralelas).
- [ ] Nombre de bienvenida del admin se muestra en el header del dashboard.

## Validaciones de seguridad

- [ ] Las queries de métricas respetan permisos de colección — solo admin/operator pueden leer órdenes y tickets.
- [ ] Los montos de ingresos no se exponen vía API a roles no autorizados.
- [ ] Las acciones rápidas respetan labels del usuario (operator no ve acciones restringidas).
- [ ] No se cachean datos sensibles (ingresos) en localStorage.

## Dependencias

- **TASK-022:** Reconciliación de órdenes — provee órdenes con status y paymentStatus actualizados.
- **TASK-023:** Function generate-ticket — provee tickets con status para conteo.
- **TASK-010:** Admin layout — provee shell admin.

## Bloquea a

Ninguna — es una página de lectura/resumen.

## Riesgos y notas

- **Performance de queries:** Las métricas requieren queries de agregación (count, sum) que Appwrite no soporta nativamente. Opciones: (a) traer documentos y contar/sumar en frontend, (b) crear Function que calcule métricas, (c) usar queries con filtro de fecha y contar resultados. Para v1, opción (a) es suficiente con paginación de 100 docs max. Si crece, migrar a opción (b).
- **Periodo del mes:** El "mes actual" se define como desde el 1er día del mes UTC hasta ahora. Considerar timezone del admin en futuras iteraciones.
- **Datos vacíos:** En un sistema nuevo sin órdenes ni slots, el dashboard mostrará todos zeros. Diseñar un estado vacío amigable con CTAs para crear las primeras entidades.
- **Operator dashboard:** La versión operator del dashboard es simplificada. Para v1, se ocultan cards y acciones sensibles. Si se necesita un dashboard específico para operator, es otra tarea futura.
