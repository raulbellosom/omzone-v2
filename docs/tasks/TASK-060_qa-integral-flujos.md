# TASK-060: QA integral — Flujos completos, permisos, responsive y edge cases

## Objetivo

Ejecutar una auditoría integral de calidad sobre todos los módulos implementados de OMZONE, verificando flujos completos (crear experiencia → checkout → ticket → validación), permisos por label, responsive en todos los breakpoints, y edge cases. Al completar esta tarea, se tiene un reporte de bugs y un listado de fixes aplicados.

## Contexto

- **Fase:** D — Datos de demostración y QA (post-fase 15)
- **Documento maestro:** Todos los RF — prueba funcional transversal.
- **Estado actual:** Todos los módulos están implementados pero no se ha ejecutado QA integral. El sitio está deployado en `https://omzone.sites.aprod.racoondevs.com/`.
- **Datos requeridos:** TASK-059 debe completarse primero para tener datos de demostración.

## Alcance

Lo que SÍ incluye esta tarea:

1. **QA funcional — Admin:**
   - CRUD de experiencias: crear, editar, publicar, despublicar, eliminar.
   - CRUD de ediciones: crear edición, asignar pricing tiers, activar/desactivar.
   - CRUD de addons: crear, asignar a experiencia, editar, eliminar.
   - CRUD de slots/agenda: crear slot, modificar capacidad, cancelar.
   - CRUD de publicaciones: crear, agregar secciones, publicar.
   - Gestión de recursos y locations.
   - Listado de órdenes y detalle.
   - Listado de tickets y detalle (TASK-055).
   - Listado de clientes y detalle (TASK-056).
   - Media manager (TASK-057).
   - Settings y notification templates (TASK-058).
   - Check-in con scan de QR.
   - Venta asistida.
   - Paquetes y pases.

2. **QA funcional — Público:**
   - Landing page con secciones (TASK-051).
   - Catálogo de experiencias con filtros (TASK-054).
   - Detalle de experiencia: hero, pricing, agenda, addons, booking.
   - Checkout: selección → Stripe → confirmación.
   - Publicaciones.
   - About y Contact (TASK-052, TASK-053).

3. **QA funcional — Portal cliente:**
   - Dashboard.
   - Mis órdenes y detalle.
   - Mis tickets con QR.
   - Mis pases.
   - Perfil y preferencias.

4. **QA de permisos:**
   - Verificar que cada ruta respeta guards (root, admin, operator, client, anón).
   - Verificar que root es invisible en todos los listados.
   - Verificar que operator no puede acceder a secciones restringidas.
   - Verificar que client no puede acceder a admin.

5. **QA responsive:**
   - Probar en 375px (mobile), 768px (tablet), 1024px (laptop), 1280px (desktop).
   - Verificar: overflow, truncamiento, touch targets, modales, tablas→cards.

6. **Reporte de bugs:** Documentar cada bug encontrado con severidad (critical/major/minor), ruta, descripción y screenshot si aplica.

7. **Fixes inmediatos:** Corregir bugs critical y major encontrados.

## Fuera de alcance

- Tests automatizados (unit tests, e2e tests).
- Testing de carga o performance (load testing).
- Testing de seguridad avanzado (pentest).
- Testing de accesibilidad formal (WCAG audit).
- Testing en navegadores legacy (IE, Safari < 16).

## Dominio

- [x] Editorial (experiencias, publicaciones, tags)
- [x] Comercial (pricing, addons, paquetes, pases)
- [x] Agenda (slots, recursos, capacidad)
- [x] Operativo (bookings, validación, asignación)
- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Usuario (perfiles, preferencias)
- [x] Configuración (settings, templates)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| Todas las tablas | leer / crear / actualizar | Verificación transversal |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| Todos | público / admin / portal | verificar | Testing funcional y responsive |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| Todas las rutas definidas | público / admin / portal | verificar guards | Testing de acceso por label |

## Permisos y labels involucrados

| Verificación | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Admin accesible | ✅ | ✅ | ✅ (parcial) | ❌ redirect | ❌ redirect |
| Portal accesible | ✅ | ❌ | ❌ | ✅ | ❌ redirect |
| Público accesible | ✅ | ✅ | ✅ | ✅ | ✅ |
| Root invisible | filtrado | filtrado | invisible | invisible | invisible |

## Flujo principal

1. Preparar entorno: ejecutar seeds (TASK-059), verificar que el sitio carga.
2. Ejecutar QA funcional del admin con usuario admin.
3. Ejecutar QA funcional del público como usuario anónimo.
4. Ejecutar QA funcional del portal como usuario client.
5. Ejecutar pruebas de permisos con cada tipo de usuario.
6. Ejecutar audit responsive en todos los breakpoints.
7. Documentar bugs encontrados en reporte.
8. Corregir bugs critical y major.
9. Re-verificar correcciones.
10. Actualizar reporte final.

## Criterios de aceptación

- [ ] Todos los CRUD del admin funcionan sin errores (crear, editar, eliminar, listar).
- [ ] El catálogo público muestra experiencias y funciona con filtros.
- [ ] El detalle de experiencia carga correctamente con hero, pricing, agenda.
- [ ] El checkout Stripe funciona end-to-end (test mode).
- [ ] El portal de cliente muestra órdenes, tickets y pases del usuario.
- [ ] Las publicaciones se renderizan correctamente.
- [ ] Landing, About y Contact funcionan correctamente.
- [ ] Los guards de ruta redireccionan correctamente según label.
- [ ] Root es invisible en todos los listados (no root viewer).
- [ ] No hay overflow horizontal en ningún breakpoint (375/768/1024/1280).
- [ ] Los modales y drawers no se desbordan en mobile.
- [ ] Los touch targets tienen al menos 44px en mobile.
- [ ] Se genera un reporte de bugs con severidad.
- [ ] Todos los bugs critical y major están corregidos.
- [ ] `npm run build` pasa limpio después de los fixes.

## Dependencias

- **TASK-051 a TASK-058:** Todas las tareas de la fase A-C deben estar completas.
- **TASK-059:** Se necesitan datos de demostración para probar flujos.

## Bloquea a

- **TASK-062:** Limpieza y cierre.

## Riesgos y notas

- El QA puede revelar bugs en módulos existentes (TASK-001 a TASK-050) que requieran fixes adicionales fuera del alcance original de esta tarea.
- El checkout Stripe en test mode puede requerir que las keys de test estén configuradas. Verificar `STRIPE_TEST_SETUP.md`.
- El QA responsive puede requerir ajustes en componentes compartidos (headers, sidebars, modales) que afecten múltiples páginas.
- Sugerencia: usar el skill `qa-tester` para guiar la ejecución.
