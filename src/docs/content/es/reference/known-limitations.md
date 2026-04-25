---
title: Limitaciones Conocidas
description: Restricciones intencionales y casos límite conocidos en OMZONE
section: reference
order: 2
lastUpdated: 2026-04-25
relatedRoutes:
  - /admin/experiences
  - /admin/orders
  - /portal
relatedCollections:
  - experiences
  - orders
  - slots
keywords:
  - limitaciones
  - restricciones
  - casos límite
  - comportamiento intencional
  - solución de problemas
---

# Limitaciones Conocidas

Este documento describe restricciones de diseño intencionales, casos límite conocidos y matices de comportamiento en OMZONE. Comprender estos ayuda a distinguir entre comportamiento esperado y problemas que pueden necesitar resolución.

---

## Restricciones Intencionales (Decisiones de Diseño)

Estos comportamientos están implementados intencionalmente y no deben ser cambiados sin consideración cuidadosa de los efectos posteriores.

### 1. Unicidad de Slug Entre Experiencias Y Publicaciones

| Restricción | Comportamiento Esperado | Razonamiento |
|-------------|------------------------|--------------|
| El slug debe ser único entre experiencias Y publicaciones | No puede haber experiencia `slug="yoga"` y publicación `slug="yoga"` | Espacio de URL simple - `/experiences/yoga` y `/yoga` entrarían en conflicto |

**Impacto:** Si creas una experiencia con slug "yoga", ninguna publicación puede usar "yoga" como su slug, y viceversa.

**Solución alternativa:** Elegir slugs cuidadosamente. Considerar usar prefijos como `experience-yoga` para experiencias o `article-yoga` para publicaciones.

---

### 2. Experiencias Publicadas No Pueden Ser Eliminadas

| Restricción | Comportamiento Esperado | Razonamiento |
|-------------|------------------------|--------------|
| Experiencia en estado `published` no puede ser eliminada | Debe moverse a `draft` antes de la eliminación | Previene pérdida accidental de datos; experiencias archivadas pueden ser recuperadas |

**Impacto:** Si publicas una experiencia y luego decides que ya no la necesitas, debes:
1. Mover estado a `archived` (remueve del catálogo público)
2. Mover estado a `draft` (habilita eliminación)
3. Eliminar la experiencia

**Solución alternativa:** Siempre archivar antes de intentar eliminar una experiencia publicada.

---

### 3. Estado de Pago y Estado de Pedido Son Separados

| Restricción | Comportamiento Esperado | Razonamiento |
|-------------|------------------------|--------------|
| El pedido puede estar `cancelled` con pago `succeeded` | Permite rastrear estado de reembolso separadamente | Habilita seguimiento parcial de estado para pedidos con pagos capturados |

**Ejemplo de Combinación Válida:**
```
orderStatus = "cancelled"
paymentStatus = "succeeded"
```
Esto indica que el pedido fue cancelado pero el pago fue capturado y aún no reembolsado.

**Otra Combinación Válida:**
```
orderStatus = "cancelled"
paymentStatus = "refunded"
```
Esto indica que el pedido fue cancelado y el pago ha sido devuelto.

---

### 4. Descripción Corta No Retrocede Automáticamente a Descripción Larga

| Restricción | Comportamiento Esperado | Razonamiento |
|-------------|------------------------|--------------|
| Si `shortDescription` está vacío, el sistema NO auto-genera desde `longDescription` | Debe manualmente completar shortDescription | Control manual para optimización SEO |

**Impacto:** Si solo completas `longDescription`, el sistema no usará automáticamente una versión truncada como `shortDescription`.

**Solución alternativa:** Siempre proporcionar tanto `shortDescription` (500 chars máx) como `longDescription` (5000 chars máx) para comportamiento SEO y visualización adecuados.

---

### 5. Imagen Hero Sin Fallback

| Restricción | Comportamiento Esperado | Razonamiento |
|-------------|------------------------|--------------|
| Si `heroImageId` está vacío, muestra color placeholder | El sistema NO retrocede automáticamente a `galleryImageIds[0]` | Selección de imagen explícita requerida; imágenes de galería pueden tener diferentes proporciones |

**Impacto:** Remover la imagen hero deja un placeholder coloreado en lugar de promover la primera imagen de la galería.

**Solución alternativa:** Siempre establecer una imagen hero cuando quieras que se muestre una imagen de portada.

---

### 6. Modo de Venta Pase Requiere FulfillmentType="pass"

| Restricción | Comportamiento Esperado | Razonamiento |
|-------------|------------------------|--------------|
| `saleMode="pass"` solo puede tener `fulfillmentType="pass"` | Compra directa y canje de créditos no pueden coexistir | Separación clara de tipos de compra |

**Combinaciones Inválidas:**
- `saleMode="pass"` + `fulfillmentType="ticket"` ❌
- `saleMode="pass"` + `fulfillmentType="booking"` ❌
- `saleMode="pass"` + `fulfillmentType="package"` ❌

**Solución alternativa:** Si necesitas reservas basadas en pases, usar `fulfillmentType="pass"`. Para tickets comprados, usar `saleMode="direct"` con `fulfillmentType="ticket"`.

---

### 7. Modo de Venta Directo No Puede Usar Cumplimiento de Pase

| Restricción | Comportamiento Esperado | Razonamiento |
|-------------|------------------------|--------------|
| `saleMode="direct"` no puede tener `fulfillmentType="pass"` | No puede pagar Y canjear créditos simultáneamente | Stripe Checkout maneja el pago, no el canje de créditos |

**Solución alternativa:** Crear experiencias separadas para canje de pase vs compra directa, o usar `saleMode="assisted"` para escenarios mixtos.

---

### 8. Orden de Galería Determina Orden de Visualización

| Restricción | Comportamiento Esperado | Razonamiento |
|-------------|------------------------|--------------|
| Las imágenes de galería se muestran en orden del array | La primera imagen de galería NO se usa como fallback de hero | Control explícito sobre presentación de imágenes |

**Impacto:** El orden en que arreglas las imágenes en la galería es el orden en que aparecerán.

**Solución alternativa:** Arrastrar y soltar para reordenar imágenes de galería según sea necesario.

---

### 9. Fallback de Contenido en Español

| Restricción | Comportamiento Esperado | Razonamiento |
|-------------|------------------------|--------------|
| Campos vacíos `*Es` retroceden a la versión en inglés | `publicNameEs` → `publicName`, `shortDescriptionEs` → `shortDescription` | El sistema NO auto-traduce |

**Impacto:** Usuarios con `locale=es` verán contenido en inglés si no se proporcionan traducciones al español.

**Solución alternativa:** Siempre proporcionar traducciones al español (`*Es` campos) para la mejor experiencia bilingüe.

---

### 10. Cantidad Mín/Máx Solo Aplicada en Checkout

| Restricción | Comportamiento Esperado | Razonamiento |
|-------------|------------------------|--------------|
| Validación de `minQuantity` y `maxQuantity` solo ocurre durante el checkout | Puede guardar experiencia con cualquier configuración de cantidad | Validación del lado del servidor al momento de creación del pedido |

**Impacto:** Puedes establecer `minQuantity=5` pero la UI de admin no previene guardar la experiencia.

**Solución alternativa:** Validar requisitos de cantidad antes de publicar una experiencia. Considerar agregar advertencias de admin para configuraciones potencialmente problemáticas.

---

## Casos Límite Conocidos

Estos son escenarios que se comportan de manera inesperada pero no son errores. Pueden requerir intervención manual o manejo específico.

### 1. Pedido Cancelado Después de Tickets Generados

| Caso Límite | Comportamiento Actual | Acción Recomendada |
|-------------|----------------------|-------------------|
| El pedido se cancela después de que los tickets han sido generados | Los tickets permanecen válidos hasta ser invalidados manualmente | El admin debe invalidar/anular tickets manualmente |

**Por qué Sucede:** Los tickets se generan cuando el pedido transiciona a `confirmed`, antes de que la cancelación sea posible.

**Resolución Manual:**
1. Navegar al pedido en Admin
2. Ir a la sección de Tickets
3. Invalidar cada ticket
4. Cancelar el pedido

---

### 2. Experiencia Despublicada Con Pedidos Activos

| Caso Límite | Comportamiento Actual | Acción Recomendada |
|-------------|----------------------|-------------------|
| La experiencia se mueve a `archived` con pedidos pendientes/activos | Los pedidos continúan normalmente (la instantánea preserva datos) | Asegurar comunicación al cliente si la experiencia ya no está disponible |

**Por qué Sucede:** Los pedidos almacenan una instantánea de datos de experiencia al momento de la compra. Cambiar la experiencia no afecta pedidos existentes.

**Resolución Manual:** Contactar clientes afectados si la experiencia ya no estará disponible.

---

### 3. Slug Cambiado Después de Publicación

| Caso Límite | Comportamiento Actual | Acción Recomendada |
|-------------|----------------------|-------------------|
| El slug se cambia después de que la experiencia ha sido publicada | Las URLs antiguas devuelven 404 | Configurar redirect manualmente o actualizar enlaces externos |

**Por qué Sucede:** El slug se usa en la URL; cambiarlo crea una nueva ruta de URL.

**Solución alternativa:** Antes de cambiar un slug:
1. Anotar el slug antiguo
2. Actualizar el slug
3. Configurar un redirect (fuera del alcance de OMZONE - requiere cambios a nivel de servidor/config)

---

### 4. Nivel de Precio Eliminado Después de Compra

| Caso Límite | Comportamiento Actual | Acción Recomendada |
|-------------|----------------------|-------------------|
| El nivel de precio se elimina después de que se han realizado pedidos | La instantánea del pedido preserva el precio | Precisión histórica mantenida; no se necesita acción |

**Por qué Sucede:** Los pedidos almacenan una instantánea de datos de precios al momento de la compra.

**No Se Requiere Acción:** Los pedidos históricos siempre mostrarán el precio correcto que se cobró.

---

### 5. Múltiples Asistentes Con Un Solo Ticket

| Caso Límite | Comportamiento Actual | Acción Recomendada |
|-------------|----------------------|-------------------|
| Pedido con `quantity > 1` genera UN ticket con cantidad | El ticket muestra "Cantidad: 5" no nombres individuales | Recopilar info de invitados en check-in |

**Por qué Sucede:** El sistema genera un ticket por artículo de línea del pedido, no por asistente.

**Solución alternativa:** En check-in, solicitar lista de invitados o verificación de ID para confirmar que todos los asistentes están presentes.

---

### 6. Créditos de Pase Permanecen Después de Experiencia Archivada

| Caso Límite | Comportamiento Actual | Acción Recomendada |
|-------------|----------------------|-------------------|
| Existen créditos de pase pero la experiencia vinculada está archivada | Los créditos aún pueden consumirse para otras experiencias válidas | Sin ajuste automático de créditos |

**Por qué Sucede:** Los pases no están vinculados a experiencias específicas (a menos que `validExperienceIds` esté establecido).

**Resolución Manual:** Si necesitas invalidar créditos, ajustarlos manualmente en el panel de Admin.

---

### 7. Slot Cancelado Con Reservas Existentes

| Caso Límite | Comportamiento Actual | Acción Recomendada |
|-------------|----------------------|-------------------|
| El slot se cancela pero tiene reservas activas | El estado del slot cambia a `cancelled` | Contactar clientes manualmente; sin notificación automática |

**Por qué Sucede:** La cancelación de slot no dispara notificaciones automáticas a clientes.

**Resolución Manual:**
1. Identificar clientes afectados de la lista de pedidos
2. Contactarlos directamente sobre la cancelación
3. Emitir reembolsos si corresponde

---

## Características Con Restricciones

Estas características tienen limitaciones específicas que los administradores deben conocer.

### Múltiples Asistentes en Un Solo Ticket

| Restricción | Detalles | Solución Alternativa |
|-------------|----------|----------------------|
| El ticket muestra cantidad, no nombres individuales | `allowQuantity=true` genera un ticket con `quantity=N` | Solicitar info de invitados en check-in |

---

### Orden de Imagen de Galería

| Restricción | Detalles | Solución Alternativa |
|-------------|----------|----------------------|
| El orden del array determina el orden de visualización | `galleryImageIds[0]` es el primero, pero NO se usa como fallback de hero | Arrastrar-soltar para reordenar |

---

### Fallback de Traducción al Español

| Restricción | Detalles | Solución Alternativa |
|-------------|----------|----------------------|
| Campo ES vacío retrocede a EN | El sistema NO auto-traduce | Proporcionar traducciones manualmente |

---

### Validación de Cantidad

| Restricción | Detalles | Solución Alternativa |
|-------------|----------|----------------------|
| `minQuantity`/`maxQuantity` solo aplicadas en checkout | UI de admin permite cualquier valor | Validar antes de publicar |

---

### Omitir Slot en Venta Asistida

| Restricción | Detalles | Solución Alternativa |
|-------------|----------|----------------------|
| El pedido puede ser creado sin slot asignado | Opción `skipSlot` en asistente de venta asistida | Asignar slot después desde detalle del pedido |

---

## Distinguir Comportamiento Intencional vs No Intencional

Usa esta guía para determinar si algo es una restricción intencional o un problema que requiere resolución.

### Indicadores de Comportamiento Intencional

| Señal | Descripción |
|-------|-------------|
| Documentado en esta página | El comportamiento coincide con una restricción intencional listada |
| Consistente con el modelo de dominio | El comportamiento se alinea con la arquitectura de datos del sistema |
| Sin solución alternativa en código | Arreglar requeriría cambios arquitectónicos |
| Tiene razonamiento claro | La restricción sirve a un propósito (ej. previene pérdida de datos, mantiene consistencia) |

### Indicadores que Requieren Resolución

| Señal | Descripción |
|-------|-------------|
| No documentado aquí | El comportamiento no coincide con ninguna restricción conocida |
| Inconsistente | La misma acción produce diferentes resultados en diferentes contextos |
| Corrupción de datos | Combinaciones inválidas que deberían ser prevenidos |
| Concern de seguridad | El comportamiento expone datos o acceso que no debería ser permitido |

---

## Reportar Problemas

Si encuentras comportamiento que:

1. **No coincide** con ninguna restricción listada en este documento
2. **Se siente como un error** más que un diseño intencional
3. **Causa inconsistencias o corrupción de datos**

Por favor repórtalo al equipo de desarrollo con:
- Pasos para reproducir
- Comportamiento esperado
- Comportamiento actual
- Capturas de pantalla si aplica

---

## Páginas Relacionadas

- [Experiencias](../catalog/experiences.md) - Documentación de campos
- [Pedidos](../sales/orders.md) - Transiciones de estado de pedido
- [Flujos](./flows.md) - Árboles de decisión y diagramas
- [Solución de Problemas](./troubleshooting.md) - Problemas comunes y soluciones