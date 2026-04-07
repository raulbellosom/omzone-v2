# TASK-062: Limpieza y cierre — Placeholders, rutas redundantes, documentación

## Objetivo

Eliminar todos los placeholders, rutas redundantes y código muerto del proyecto OMZONE. Actualizar la documentación para reflejar el estado real del proyecto. Al completar esta tarea, el código está limpio, sin secciones "Próximamente", y la documentación está alineada con la implementación.

## Contexto

- **Fase:** E — Limpieza y cierre (post-fase 15)
- **Estado actual:**
  - `App.jsx` tiene rutas con `<AdminPlaceholder>` que deberían estar eliminadas tras TASK-055 a TASK-058.
  - Existen rutas redundantes de ediciones y pricing a nivel top-level que duplican las rutas ya existentes dentro de experiencias.
  - `PENDINGS.md` necesita actualizarse con el estado de todas las tareas.
  - `01_plan_maestro_fases.md` necesita las fases nuevas (A-E).
  - Puede haber imports no usados, componentes muertos, o TODO comments pendientes.

## Alcance

Lo que SÍ incluye esta tarea:

1. **Eliminar AdminPlaceholder:**
   - Verificar que NO quedan rutas con `<AdminPlaceholder>` en `App.jsx`.
   - Eliminar el componente `AdminPlaceholder` si ya no se usa en ningún lugar.

2. **Limpiar rutas redundantes:**
   - Evaluar rutas de ediciones/pricing a nivel top-level (`/admin/editions`, `/admin/pricing`) — si son redundantes con las que existen dentro de experiencias, eliminarlas.
   - Verificar que no hay rutas huérfanas (que apuntan a componentes eliminados).

3. **Limpiar imports y exports:**
   - Buscar imports no usados.
   - Eliminar archivos de componentes que ya no se referencian.

4. **Actualizar PENDINGS.md:**
   - Reflejar estado de TASK-001 a TASK-062.
   - Marcar tareas completas vs pendientes.
   - Agregar sección de tasks nuevos (TASK-051 a TASK-062).

5. **Actualizar plan maestro:**
   - Agregar fases A-E al `docs/core/01_plan_maestro_fases.md`.

6. **Verificar build limpio:** `npm run build` sin warnings relevantes.

## Fuera de alcance

- Refactoring de código existente que funciona.
- Agregar tests.
- Optimización de performance.
- Cambios de diseño o funcionalidad.
- Linting estricto o formateo (si no se usaba previamente).

## Dominio

- [x] Frontend admin
- [x] Frontend público
- [x] Frontend portal

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| Ninguna | — | Solo cambios de código frontend y documentación |

## Componentes frontend implicados

| Componente | Superficie | Operación | Notas |
|---|---|---|---|
| `AdminPlaceholder` | admin | eliminar | Si ya no se usa en ninguna ruta |
| `App.jsx` | todos | modificar | Limpiar rutas redundantes |

## Rutas implicadas

| Ruta | Superficie | Guard | Notas |
|---|---|---|---|
| `/admin/editions` (top-level) | admin | admin | Evaluar si es redundante |
| `/admin/pricing` (top-level) | admin | admin | Evaluar si es redundante |
| Rutas con AdminPlaceholder | admin | admin | Eliminar todas |

## Permisos y labels involucrados

No aplica — no se modifican permisos.

## Flujo principal

1. Buscar todas las instancias de `AdminPlaceholder` en el código.
2. Verificar que cada una tiene un reemplazo implementado (TASK-055 a TASK-058).
3. Eliminar las rutas placeholder y el componente si ya no se usa.
4. Evaluar y limpiar rutas redundantes (ediciones/pricing top-level).
5. Buscar imports no usados y limpiar.
6. Actualizar `PENDINGS.md` con estado completo de todos los tasks.
7. Actualizar `01_plan_maestro_fases.md` con fases A-E.
8. Ejecutar `npm run build` y verificar que pasa limpio.
9. Revisar output de build por warnings relevantes.

## Criterios de aceptación

- [ ] No quedan instancias de `<AdminPlaceholder>` en el código.
- [ ] El componente `AdminPlaceholder` está eliminado (si no se usa).
- [ ] No hay rutas redundantes o huérfanas en `App.jsx`.
- [ ] `PENDINGS.md` refleja el estado real de TASK-001 a TASK-062.
- [ ] `01_plan_maestro_fases.md` incluye las fases A-E.
- [ ] `npm run build` pasa sin errores.
- [ ] No hay imports a componentes que no existen.

## Dependencias

- **TASK-055 a TASK-058:** Las páginas admin que reemplazan los placeholders deben estar implementadas.
- **TASK-060:** QA integral debe haberse ejecutado para que los fixes estén aplicados.
- **TASK-061:** Responsive audit completado.

## Bloquea a

- Ninguno — esta es la tarea final de la fase E.

## Riesgos y notas

- **No eliminar código que esté en uso.** Verificar cada componente/ruta antes de borrar.
- Las rutas top-level de ediciones/pricing (`/admin/editions`, `/admin/pricing`) podrían ser usadas por links en el sidebar admin. Si se eliminan las rutas, verificar que el sidebar no las referencia.
- El `AdminPlaceholder` podría tener un uso futuro para secciones que se agreguen después — pero si TASK-055 a TASK-058 cubren todos los placeholders, es seguro eliminarlo.
- Documentar en PENDINGS.md cualquier trabajo futuro identificado durante la limpieza.
