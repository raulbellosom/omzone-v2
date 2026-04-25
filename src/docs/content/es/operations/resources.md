---
title: Recursos
description: Gestionar instructores, facilitadores, terapeutas, equipos y otros recursos operacionales
section: operations
order: 2
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/resources
  - /admin/resources/new
  - /admin/resources/:id/edit
relatedCollections:
  - resources
  - slot_resources
keywords:
  - resource
  - recurso
  - instructor
  - facilitador
  - terapeuta
  - equipo
---

# Recursos

Los recursos son las personas y equipos que apoyan la entrega de experiencias. Incluyen instructores, facilitadores, terapeutas y equipos que pueden asignarse a ranuras.

## Tipos de Recursos

| Tipo | Descripción |
|------|-------------|
| `instructor` | Maestro de yoga o bienestar |
| `facilitator` | Facilitador de programa o sesión |
| `therapist` | Terapeuta de masaje, trabajo corporal o bienestar |
| `equipment` | Equipo necesario para sesiones |

## Crear un Recurso

Navega a **Operaciones -> Recursos -> Nuevo recurso**

### Sección de Identidad

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | string | Sí | Nombre del recurso (ej., "María García") |
| `type` | enum | Sí | `instructor`, `facilitator`, `therapist`, `equipment` |
| `description` | text | No | Descripción o bio |
| `contactInfo` | string | No | Correo, teléfono u otro contacto |
| `photoId` | file | No | Foto del recurso |
| `isActive` | boolean | Sí | Si el recurso está disponible |

### Sección de Metadatos

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `metadata` | JSON | No | Datos estructurados adicionales |

Los metadatos pueden incluir certificaciones, idiomas, especializaciones, etc. Ejemplo:
```json
{
  "certifications": ["RYT-200", "RYT-500"],
  "languages": ["es", "en"],
  "specializations": ["vinyasa", "yin"]
}
```

## Gestionar Recursos

Navega a **Operaciones -> Recursos** para:
- Ver todos los recursos
- Filtrar por tipo
- Buscar por nombre
- Editar detalles del recurso
- Cambiar estado activo/inactivo

## Recursos en Asignación de Ranuras

Los recursos se asignan a ranuras para rastrear:
- Quién está liderando una sesión
- Quién está asistiendo
- Qué equipo se necesita

La asignación sucede a nivel de ranura, no a nivel de experiencia. Un recurso puede asignarse a cualquier ranura en cualquier experiencia.

## Estado del Recurso

Los recursos tienen una bandera `isActive`:
- `true` - Disponible para asignación
- `false` - No disponible (archivado o ya no trabaja)

Los recursos inactivos no aparecen en los dropdowns de selección de recursos.

## Errores Comunes

**No mantener la información de contacto del recurso actualizada.**
La información de contacto ayuda con la coordinación de programación. Mantén correo y teléfono actualizados.

**Establecer `isActive` en false sin verificar asignaciones de ranuras.**
Si un recurso se vuelve no disponible, verifica las asignaciones de ranuras existentes. Cancela o reasigna antes de desactivar.

**Olvidar agregar certificaciones o especializaciones.**
Usa el campo de metadatos para almacenar calificaciones relevantes. Esto ayuda cuando se busca el recurso correcto para una experiencia particular.

## Páginas Relacionadas

- [Ranuras y Agenda](./slots.md) - Donde se asignan recursos
- [Ubicaciones](./locations.md) - Lugares donde trabajan los recursos