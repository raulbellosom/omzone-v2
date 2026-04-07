---
description: "Investigar y corregir un bug de OMZONE con diagnóstico de causa raíz, fix mínimo correcto, validación cruzada de flujos y pruebas de regresión."
agent: "bugfixer"
argument-hint: "Descripción del bug (ej: 'checkout falla con addon que tiene variante agotada — no muestra error, queda spinner infinito')"
tools: [read, edit, search, run]
---

Quiero que investigues y corrijas este **bug** en OMZONE:

**{{BUG_DESCRIPTION}}**

---

## Contexto del proyecto

| Clave | Valor |
|---|---|
| Proyecto | OMZONE — plataforma de experiencias wellness premium |
| Backend | Appwrite self-hosted 1.9.0 |
| Endpoint | `https://aprod.racoondevs.com/v1` |
| Project ID | `omzone-dev` |
| Database | `omzone_db` |
| Frontend | React + Vite + JavaScript + TailwindCSS |
| Auth model | Labels: `root`, `admin`, `operator`, `client` |
| Pagos | Stripe Checkout Sessions, webhooks HMAC-verificados |
| Doc maestro | `docs/core/00_documento_maestro_requerimientos.md` |

---

## Proceso obligatorio — 6 fases

### Fase 1: Reproducción

1. Leer la descripción del bug y entender el comportamiento reportado
2. Identificar el **flujo afectado**: qué hace el usuario, en qué superficie (pública / admin / client portal), con qué rol
3. Localizar los archivos involucrados: componentes, hooks, Functions, tablas
4. Reproducir el escenario exacto — documentar los pasos de reproducción
5. Si no se puede reproducir, documentar por qué y qué información falta

> **Criterio de avance:** tengo pasos de reproducción claros o evidencia del error en código.

### Fase 2: Diagnóstico de causa raíz

6. Trazar el flujo de datos desde el punto de fallo hacia atrás:
   - **Frontend:** componente → hook → llamada API → respuesta
   - **Function:** input → validación → lógica → base de datos → respuesta
   - **Permisos:** label del usuario → permisos de colección → guards de ruta → UI condicional
   - **Schema:** atributos, relaciones, índices, tipos de dato
7. Identificar la **causa raíz exacta** — no el síntoma
8. Clasificar la capa del bug:

| Capa | Ejemplos |
|---|---|
| **Schema/Appwrite** | Atributo faltante, relación rota, índice ausente, tipo incorrecto |
| **Function** | Validación incompleta, error no capturado, lógica incorrecta, snapshot ausente |
| **Permisos** | Label no verificado, permiso de colección incorrecto, guard de ruta ausente |
| **Frontend — lógica** | Hook mal implementado, estado inconsistente, llamada API incorrecta |
| **Frontend — UI** | Componente no maneja estado de error/loading, responsive roto |
| **Integración** | Stripe webhook no procesado, evento Appwrite no capturado |

> **Criterio de avance:** puedo señalar la línea o bloque exacto que causa el bug.

### Fase 3: Evaluación de impacto

9. Determinar qué otros flujos podrían verse afectados por el bug O por el fix:
   - ¿Otros componentes consumen el mismo hook/data?
   - ¿Otras Functions dependen de la misma tabla/atributo?
   - ¿El fix cambia una interfaz que otros módulos usan?
10. Listar flujos que requieren prueba post-fix

> **Criterio de avance:** tengo lista de flujos potencialmente afectados.

### Fase 4: Implementación del fix

11. Aplicar el **fix mínimo correcto** — no refactorizar, no agregar features, no "mejorar" código adyacente
12. Reglas del fix:
    - Corregir solo la causa raíz identificada
    - No cambiar la interfaz pública de Functions/hooks/componentes a menos que el bug lo requiera
    - Si el fix requiere cambio de schema: documentar la migración necesaria
    - Si el fix toca permisos: verificar que no abre acceso indebido
    - Si el fix toca transacciones: asegurar que snapshots siguen intactos
13. Si hay múltiples formas de corregir, elegir la de menor impacto lateral

> **Criterio de avance:** el fix está aplicado y el bug no se reproduce.

### Fase 5: Validación cruzada

14. Verificar que el fix **no rompe flujos adyacentes** revisando la lista de la Fase 3
15. Checklist de validación post-fix:

- [ ] El escenario del bug ya no se reproduce
- [ ] El happy path del flujo afectado funciona completo
- [ ] Los permisos no se alteraron (a menos que el bug fuera de permisos)
- [ ] Los snapshots transaccionales siguen intactos
- [ ] No hay errores de consola nuevos en frontend
- [ ] No hay errores en logs de Function
- [ ] El fix respeta naming conventions OMZONE
- [ ] El fix no expone datos entre usuarios/roles

> **Criterio de avance:** todos los checks pasan.

### Fase 6: Reporte

16. Documentar el fix con el formato de output abajo

---

## Reglas de seguridad durante el fix

1. **No ampliar permisos** para "solucionar" un bug de acceso — investigar por qué el permiso legítimo falla
2. **No eliminar validaciones** para evitar errores — corregir el dato o flujo que causa la validación fallida
3. **No bypassear guards de ruta o labels** — si el usuario no tiene acceso, el fix no es darle acceso
4. **No confiar en input del frontend** — si el bug es que el frontend envía datos incorrectos, validar en la Function
5. **No tocar snapshots de transacciones pasadas** — son inmutables. Si el bug es un snapshot mal construido, corregir la lógica que lo genera, no parchear datos existentes

---

## Errores comunes al corregir bugs en OMZONE

| Error | Consecuencia | Corrección |
|---|---|---|
| Arreglar el síntoma sin buscar causa raíz | El bug reaparece con variantes | Trazar el flujo completo antes de tocar código |
| Cambiar permisos de colección para "solucionar" | Abre acceso no autorizado | Investigar por qué el permiso legítimo no funciona |
| Agregar `try/catch` genérico que traga errores | Oculta el problema real | Manejar errores específicos con códigos descriptivos |
| Corregir en frontend lo que debe validarse en Function | Deja el backend vulnerable | Validar siempre en la capa correcta |
| Tocar datos vivos para compensar snapshot roto | Rompe integridad histórica | Corregir la lógica de snapshot, no los datos |
| Refactorizar "de paso" mientras se corrige | Introduce bugs nuevos | Fix mínimo correcto, refactor en task separada |
| No probar con otros roles/labels | El fix rompe acceso de otro rol | Verificar con `admin`, `operator` y `client` |

---

## Output esperado

```markdown
# Bug Fix Report

## Bug
<!-- Descripción del bug tal como fue reportado -->

## Pasos de reproducción
1. ...
2. ...
3. ...

## Causa raíz
<!-- Capa + explicación exacta -->
- **Capa:** [Schema / Function / Permisos / Frontend-lógica / Frontend-UI / Integración]
- **Causa:** explicación precisa
- **Archivo(s):** path/to/file (líneas aprox.)

## Fix aplicado
<!-- Descripción del cambio realizado -->
- **Archivo(s) modificados:** lista
- **Tipo de cambio:** [corrección de lógica / validación agregada / permiso corregido / atributo corregido / estado UI corregido]
- **Líneas cambiadas:** descripción breve de cada cambio

## Flujos validados post-fix
- [ ] flujo principal afectado
- [ ] flujo adyacente 1
- [ ] flujo adyacente 2
- [ ] permisos verificados
- [ ] responsive verificado (si aplica UI)

## Riesgos residuales
<!-- Algo que no se pudo validar completamente o merece atención futura -->
<!-- "Ninguno" si todo se validó -->
```
