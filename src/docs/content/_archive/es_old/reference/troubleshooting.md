---
title: Solución de Problemas
description: Problemas comunes y soluciones
section: reference
order: 2
lastUpdated: 2026-04-25
---

# Solución de Problemas

Esta guía cubre los problemas comunes encontrados en el panel de admin de OMZONE y sus soluciones.

## Problemas de Reserva

### El cliente no puede completar el pago

**Síntomas:** El checkout falla o la página de pago no carga.

**Pasos de Diagnóstico:**
1. Verificar configuración de Stripe en Configuración → Pago
2. Confirmar que las claves de Stripe son correctas (no claves de prueba en producción)
3. Verificar que la cuenta de Stripe está en buen estado
4. Revisar el dashboard de Stripe para mensajes de error específicos

**Soluciones:**
- Verificar que la clave publicable coincide con el entorno
- Verificar si la tarjeta del cliente es válida y tiene fondos
- Confirmar que el webhook de Stripe está configurado y recibiendo eventos
- Revisar registros de transacciones de Stripe para razones de Decline

### El slot muestra "Lleno" pero debería tener disponibilidad

**Síntomas:** La capacidad del slot parece agotada pero se esperaban lugares abiertos.

**Pasos de Diagnóstico:**
1. Verificar configuraciones de capacidad del slot
2. Verificar que no haya conflictos de recursos (disponibilidad del instructor)
3. Revisar reservas existentes para ese slot
4. Verificar fechas bloqueadas o bloqueos manuales de capacidad

**Soluciones:**
- Aumentar capacidad del slot en la página de edición del slot
- Agregar recursos adicionales para resolver conflictos
- Cancelar reservas innecesarias para liberar capacidad
- Verificar si el límite de sobreventa está restringiendo la disponibilidad

### La solicitud de reserva no aparece

**Síntomas:** El cliente envió la solicitud pero no es visible en la lista de solicitudes.

**Pasos de Diagnóstico:**
1. Verificar filtros de estado de solicitud (por defecto puede mostrar solo `pending`)
2. Verificar que la experiencia tiene `saleMode: request`
3. Confirmar que el cliente envió la solicitud correctamente
4. Revisar la solicitud en la base de datos si aún falta

**Soluciones:**
- Cambiar filtro a "Todos" para ver solicitudes no pendientes
- Confirmar que la configuración de la experiencia incluye `saleMode: request`
- Verificar email de confirmación del cliente
- Verificar que la función de Appwrite se ejecutó exitosamente

### Pedido atascado en "Pendiente"

**Síntomas:** El pedido muestra estado `pending` indefinidamente.

**Pasos de Diagnóstico:**
1. Verificar estado de pago en dashboard de Stripe
2. Revisar registros de webhook en Appwrite
3. Confirmar que la URL del webhook está correctamente configurada en Stripe

**Soluciones:**
- Si el pago成功了 en Stripe: Verificar y actualizar manualmente el estado vía admin
- Si el pago falló: Contactar al cliente para nuevo método de pago
- Reproducir webhook desde el dashboard de Stripe si el webhook falló
- Verificar que el secreto del webhook coincide con la configuración

## Problemas de Cuenta

### El cliente no puede iniciar sesión

**Síntomas:** El cliente reporta fallos de inicio de sesión.

**Pasos de Diagnóstico:**
1. Verificar que la dirección de email es correcta
2. Verificar estado de la cuenta en Sistema → Clientes
3. Confirmar que las etiquetas incluyen `client`
4. Verificar si la contraseña cumple los requisitos

**Soluciones:**
- Enviar restablecimiento de contraseña desde la página de inicio de sesión
- Verificar que el estado de la cuenta es `active` (no `inactive` o `suspended`)
- Revisar etiquetas en el perfil del cliente
- Confirmar que la verificación de email está completa

### No se recibió email de restablecimiento de contraseña

**Síntomas:** El cliente reporta que el email de restablecimiento no llega.

**Pasos de Diagnóstico:**
1. Revisar carpeta de spam/correo no deseado
2. Verificar que la dirección de email es correcta
3. Verificar si la función de Appwrite envió el email
4. Revisar registros de email

**Soluciones:**
- Revisar carpeta de spam primero
- Verificar que la dirección de email coincide con la cuenta registrada
- Reenviar email de verificación desde el panel de admin
- Confirmar que las plantillas de email de Appwrite están configuradas
- Verificar si los filtros de email de la empresa están bloqueando mensajes

### No se puede acceder al panel de admin

**Síntomas:** Usuario con etiqueta de admin no puede acceder a rutas de admin.

**Pasos de Diagnóstico:**
1. Verificar que el usuario tiene las etiquetas correctas (`admin`, `operator`)
2. Revisar asignación de etiquetas en el perfil del cliente
3. Confirmar configuración del guardia de ruta

**Soluciones:**
- Agregar etiqueta apropiada vía Sistema → Clientes → Editar Etiquetas
- Contactar admin con acceso `root` para verificar permisos
- Limpiar caché del navegador y almacenamiento de sesión
- Verificar que no hay restricciones de IP bloqueando el acceso

## Problemas de Pago

### Webhook de Stripe no funciona

**Síntomas:** Los pagos confirman pero el estado del pedido no se actualiza.

**Pasos de Diagnóstico:**
1. Verificar URL del webhook en dashboard de Stripe
2. Verificar configuración del secreto del webhook
3. Revisar registros de webhook en Stripe
4. Verificar registros de funciones de Appwrite

**Soluciones:**
- Configurar URL del webhook apuntando al endpoint de la Función de Appwrite
- Verificar que el secreto del webhook coincide con la configuración de Appwrite
- Verificar "El secreto de firma es válido" en dashboard de Stripe
- Revisar registros de ejecución de funciones de Appwrite para errores
- Reproducir eventos de webhook perdidos desde dashboard de Stripe

### El reembolso falla

**Síntomas:** El botón de reembolso no funciona o devuelve error.

**Pasos de Diagnóstico:**
1. Verificar que el estado del pedido permite reembolso (`paid` o `confirmed`)
2. Verificar capacidad de reembolso en dashboard de Stripe
3. Confirmar que el reembolso no ha sido procesado ya

**Soluciones:**
- Solo reembolsar pedidos con estado `paid` o `confirmed`
- Cancelar primero, luego reembolsar para mantener el flujo de estado
- Verificar que la cuenta de Stripe tiene capacidad de reembolso
- Verificar límite de reembolso de Stripe (límite estándar de 90 días)

## Problemas de Check-In

### El código QR no escanea

**Síntomas:** El escáner no puede leer el código QR del ticket.

**Pasos de Diagnóstico:**
1. Probar permisos de cámara en el navegador
2. Verificar que el código QR no está dañado (si está impreso)
3. Verificar que el estado del ticket permite check-in

**Soluciones:**
- Otorgar permisos de cámara en configuración del navegador
- Usar búsqueda manual de ticket en lugar de escaneo
- Limpiar código QR si está impreso (sin manchas)
- Verificar que el ticket no está `cancelled` o `expired`
- Probar diferente navegador si los problemas de cámara persisten

### Error de ticket ya usado

**Síntomas:** Un ticket válido muestra error de "ya check-in".

**Pasos de Diagnóstico:**
1. Verificar con el cliente el estado de su ticket
2. Revisar historial de check-in del ticket
3. Confirmar que no hubo check-in duplicado accidental

**Soluciones:**
- Verificar que el nombre del cliente coincide con el ticket
- Revisar línea de tiempo en detalle del ticket para timestamp de check-in
- Si es error genuino: Puede requerirse anulación de supervisor
- Contactar admin si el ticket fue incorrectamente marcado como usado

### El reporte de check-in no muestra tickets

**Síntomas:** El reporte diario no muestra todos los check-ins esperados.

**Pasos de Diagnóstico:**
1. Verificar filtro de fecha en el reporte
2. Revisar filtros de estado de ticket
3. Confirmar que los tickets realmente fueron check-in

**Soluciones:**
- Asegurar que el rango de fechas del reporte incluye la fecha del slot
- Verificar si algunas reservas usaron pases (seguimiento diferente)
- Verificar que el filtro de estado de ticket incluye `confirmed`
- Revisar estado de completación del slot

## Problemas del Catálogo

### La experiencia no aparece en el sitio público

**Síntomas:** La experiencia publicada no aparece en el listado.

**Pasos de Diagnóstico:**
1. Verificar que el estado de la experiencia es `published`
2. Verificar que existen slots y están publicados
3. Confirmar que existen niveles de precio
4. Verificar si la publicación vincula la experiencia

**Soluciones:**
- Establecer estado de experiencia a `published`
- Crear y publicar al menos un slot
- Agregar al menos un nivel de precio
- Verificar vinculación de experienceId de publicación si usa página de destino

### El nivel de precio no se aplica

**Síntomas:** El precio incorrecto muestra en el checkout.

**Pasos de Diagnóstico:**
1. Verificar que el nivel está vinculado a la experiencia correcta
2. Verificar si precios específicos por edición sobrescriben
3. Confirmar que el nivel está activo y no archivado

**Soluciones:**
- Verificar asignación de nivel en pestaña Niveles de Precio de la experiencia
- Revisar configuración de precios específicos por edición
- Establecer estado del nivel como activo
- Limpiar caché del checkout y reintentar

### El addon no aparece en checkout

**Síntomas:** El addon requerido no muestra en checkout.

**Pasos de Diagnóstico:**
1. Verificar que el addon está vinculado a la experiencia
2. Revisar tipo de asignación del addon (`required`, `default`, `optional`)
3. Confirmar que el addon está activo

**Soluciones:**
- Agregar addon a la experiencia vía pestaña Addons
- Revisar tipo de asignación: los addons `required` son automáticos, `optional` requieren selección
- Establecer estado del addon como activo
- Verificar que el addon pertenece a la experiencia correcta

## Problemas de Slot y Disponibilidad

### El slot no aparece para reserva

**Síntomas:** El slot existe pero los clientes no pueden seleccionarlo.

**Pasos de Diagnóstico:**
1. Verificar que el estado del slot es `published`
2. Verificar que la fecha del slot es en el futuro
3. Confirmar que la capacidad no es cero
4. Verificar si la experiencia tiene una publicación vinculándola

**Soluciones:**
- Establecer estado del slot a `published`
- Crear slot con fecha futura
- Aumentar capacidad del slot por encima de cero
- Verificar que la experiencia está publicada
- Revisar si el aviso mínimo previo no está bloqueando la reserva

### La capacidad no se libera al cancelar

**Síntomas:** La reserva cancelada no libera capacidad del slot.

**Pasos de Diagnóstico:**
1. Verificar que la cancelación ocurrió antes de la hora del slot
2. Verificar si la actualización automática del slot está configurada
3. Revisar flujo de trabajo de cancelación

**Soluciones:**
- Ajustar manualmente la capacidad del slot si la liberación automática falló
- Asegurar que la cancelación ocurrió antes de la hora de inicio del slot
- Verificar que el slot tiene capacidad restante suficiente
- Revisar registros de funciones de Appwrite para errores de actualización de capacidad

## Problemas de Medios

### La carga de imagen falla

**Síntomas:** Las imágenes no cargan al Gestor de Medios.

**Pasos de Diagnóstico:**
1. Verificar que el tamaño del archivo es menor al límite de 10MB
2. Verificar que el formato de archivo es soportado
3. Revisar consola del navegador para errores

**Soluciones:**
- Comprimir imágenes antes de cargar
- Convertir a formato soportado (JPG, PNG, WebP)
- Probar diferente navegador si los errores de consola persisten
- Verificar permisos del bucket de almacenamiento

### La imagen no se muestra

**Síntomas:** La imagen cargada muestra ícono roto o vacío.

**Pasos de Diagnóstico:**
1. Verificar que la carga se completó exitosamente
2. Verificar que la URL de la imagen es correcta
3. Confirmar que el formato de archivo es soportado

**Soluciones:**
- Esperar a que se complete la optimización de imagen
- Verificar que la imagen se cargó al bucket correcto
- Revisar consola del navegador para errores de carga
- Re-intentar carga si el archivo está corrupto

## Problemas del Sistema

### Carga lenta de páginas

**Síntomas:** Las páginas del panel de admin toman tiempo excesivo en cargar.

**Pasos de Diagnóstico:**
1. Verificar conexión a internet
2. Verificar que no hay mantenimiento en curso
3. Revisar estado del servidor de Appwrite
4. Revisar rendimiento del navegador

**Soluciones:**
- Limpiar caché y cookies del navegador
- Revisar página de estado del servidor de Appwrite
- Deshabilitar extensiones del navegador que puedan interferir
- Probar modo incógnito/privado del navegador
- Revisar pestaña de red para llamadas API lentas

### Los datos no se guardan

**Síntomas:** Los envíos de formulario fallan o los datos se revierten.

**Pasos de Diagnóstico:**
1. Revisar consola del navegador para errores de validación
2. Verificar que los campos requeridos están llenos
3. Revisar tiempo de expiración de sesión

**Soluciones:**
- Completar todos los campos requeridos
- Limpiar almacenamiento de sesión del navegador
- Buscar errores de validación mostrados en el formulario
- Verificar que la conexión de Appwrite está activa
- Refrescar página y reintentar envío

### Problemas de autenticación de dos factores

**Síntomas:** No se puede completar la configuración de 2FA o el inicio de sesión.

**Pasos de Diagnóstico:**
1. Verificar que OTP basado en tiempo está sincronizado
2. Verificar si se guardaron los códigos de respaldo
3. Confirmar que la app de autenticador es la correcta

**Soluciones:**
- Usar códigos de respaldo si el dispositivo 2FA no está disponible
- Contactar admin para restablecer 2FA (requiere acceso de admin)
- Verificar que la hora del dispositivo es precisa (OTP es basado en tiempo)
- Asegurar que la cuenta correcta está configurada en la app de autenticador

## Obtener Ayuda Adicional

Si los problemas persisten después de probar estas soluciones:

1. **Revisar logs de Appwrite:** Revisar registros de ejecución de funciones para errores de backend
2. **Verificar dashboard de Stripe:** Buscar problemas específicos de pago allí
3. **Revisar consola del navegador:** Errores de red indican problemas de API
4. **Contactar soporte:** Escalar con mensajes de error específicos y timestamps
5. **Verificar estado del sistema:** Confirmar que todas las integraciones están operacionales