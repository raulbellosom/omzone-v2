# TASK-042: Function send-confirmation — email post-compra

## Objetivo

Crear la Appwrite Function `send-confirmation` que envía un email de confirmación al cliente después de que sus tickets son generados (post-pago). Al completar esta tarea, el cliente recibe por email un resumen de su compra con número de orden, experiencia, fecha/hora, ticket codes y monto pagado, en español o inglés según su preferencia de idioma.

## Contexto

- **Fase:** 13 — Notificaciones
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 13
- **Documento maestro:** Secciones:
  - **RF-10:** Órdenes — confirmación post-compra
  - RNF-07: Trazabilidad
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `orders` (6.1), `order_items` (6.2), `tickets` (6.4), `notification_templates` (8.2), `user_profiles` (7.1)
- **ADR relacionados:** ADR-005 (Lógica sensible en Functions) — el envío de email no debe bloquear el flujo transaccional; los fallos se loguean pero no retrocedan la orden.

Esta Function se invoca después de `generate-ticket` (TASK-023). El trigger puede ser directo (llamada desde generate-ticket) o event-based (on ticket creation).

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear Appwrite Function `send-confirmation` con trigger HTTP o Event.
2. Leer datos de la orden por `orderId`:
   - `orderNumber`, `totalAmount`, `currency`, `customerName`, `customerEmail`
3. Leer order items:
   - Nombre de experiencia, tier, slot datetime, addons
4. Leer tickets generados para la orden:
   - `ticketCode` de cada ticket
5. Leer preferencia de idioma del usuario:
   - Desde `user_profiles.language` si el usuario está autenticado
   - Default: `en`
6. Leer template de email:
   - Desde `notification_templates` con `key: "order-confirmation"`, `type: "email"`
   - Template tiene placeholders: `{{orderNumber}}`, `{{customerName}}`, `{{experienceName}}`, `{{date}}`, `{{time}}`, `{{ticketCodes}}`, `{{totalAmount}}`, `{{currency}}`
7. Componer email:
   - Usar template ES o EN según idioma del usuario
   - Reemplazar placeholders con datos reales
   - Subject y body desde template
8. Enviar email:
   - Vía proveedor SMTP/API configurado (Appwrite Messaging o proveedor externo como Resend, SendGrid, AWS SES)
   - Configurar credenciales via environment variables
9. Error handling:
   - Si el envío falla: loguear error, NO bloquear el flujo de la orden
   - No reintentar automáticamente (la orden y tickets ya están generados)
   - Registrar resultado en logs
10. Crear template de confirmación seed:
    - Insertar documento `notification_templates` con key `order-confirmation`
    - Body EN y ES con placeholders

## Fuera de alcance

- SMS.
- Push notifications.
- Marketing emails.
- Emails transaccionales de booking request status changes (futuro).
- Email templates WYSIWYG editor en admin.
- Attachments (PDF de ticket — TASK-014 futuro).
- Email de cancelación o reembolso.

## Dominio

- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Configuración (settings, templates)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `orders` | leer | Datos de la orden (number, amount, customer) |
| `order_items` | leer | Items de la orden para detallar en email |
| `tickets` | leer | Ticket codes generados |
| `notification_templates` | leer | Template de email con placeholders |
| `user_profiles` | leer | Preferencia de idioma del usuario |

## Atributos nuevos o modificados

N/A — se leen atributos existentes. Se crea un documento seed en `notification_templates`.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `send-confirmation` | crear | Function que compone y envía email de confirmación |
| `generate-ticket` | modificar (trigger) | Invocar `send-confirmation` tras generar tickets |

## Buckets / Storage implicados

Ninguno.

## Componentes frontend implicados

Ninguno — esta tarea es backend-only.

## Hooks implicados

N/A.

## Rutas implicadas

N/A — la Function tiene endpoint HTTP interno o se invoca via event.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Recibir email de confirmación | — | — | — | ✅ | ✅ (si compró como guest) |
| Invocar función (server-to-server) | ✅ | ✅ | ❌ | ❌ | ❌ |

Nota: La Function se invoca server-side desde `generate-ticket`, no directamente por el usuario.

## Flujo principal

1. `generate-ticket` completa generación de tickets para una orden.
2. `generate-ticket` invoca `send-confirmation` con `orderId`.
3. `send-confirmation` lee la orden, order items y tickets.
4. Lee preferencia de idioma del usuario (o default EN).
5. Lee template `order-confirmation` de `notification_templates`.
6. Selecciona body ES o EN según idioma.
7. Reemplaza placeholders con datos reales.
8. Envía email al `customerEmail` de la orden.
9. Si envío exitoso → log success.
10. Si envío falla → log error, no bloquea el flujo.

## Criterios de aceptación

- [ ] La Function `send-confirmation` existe como Appwrite Function.
- [ ] La Function recibe `orderId` y lee todos los datos necesarios de la orden.
- [ ] El email incluye: número de orden, nombre del cliente, nombre de experiencia, fecha/hora del slot (si aplica), ticket codes, monto total y moneda.
- [ ] El email usa el template de `notification_templates` con key `order-confirmation`.
- [ ] Los placeholders del template se reemplazan correctamente con datos reales.
- [ ] Si el usuario tiene `language: "es"` en su perfil, se usa el body ES del template.
- [ ] Si el usuario no tiene perfil o `language` está vacío, se usa el body EN.
- [ ] El email se envía al `customerEmail` de la orden.
- [ ] Si el envío falla, el error se loguea pero la orden y tickets NO se ven afectados.
- [ ] Existe un documento seed en `notification_templates` con key `order-confirmation`, type `email`, body EN y body ES.
- [ ] Las credenciales de email (SMTP o API key) se leen de environment variables.
- [ ] La Function no expone credenciales de email en logs o respuestas.

## Validaciones de seguridad

- [ ] La Function valida que el `orderId` existe y la orden tiene `status` de pago confirmado antes de enviar.
- [ ] El `customerEmail` se valida como email válido antes de intentar envío.
- [ ] Las credenciales de envío (API key, SMTP password) están en environment variables, nunca hardcodeadas.
- [ ] La Function no acepta `email` como input del caller — siempre lee el email de la orden en DB.
- [ ] Los errores de la Function no se propagan al cliente final.
- [ ] El template no permite inyección de HTML/scripts vía placeholders — los valores se escapan.

## Dependencias

- **TASK-021:** Function stripe-webhook — dispara el flujo de pago confirmado.
- **TASK-023:** Function generate-ticket — invoca send-confirmation tras generar tickets.

## Bloquea a

- **TASK-043:** Function send-reminder — reutiliza la infraestructura de envío de email y templates.

## Riesgos y notas

- **Proveedor de email:** Appwrite 1.9.0 incluye Messaging. Verificar si es estable para envío transaccional. Si no, usar proveedor externo (Resend, SendGrid, AWS SES). La Function debe ser agnóstica al proveedor: leer config de env vars.
- **Template management:** En v1, los templates se crean como documentos seed en `notification_templates`. No hay UI para editarlos. Admin edita directamente en la DB o se agrega CRUD de templates en futuro.
- **Rate limiting de email:** Los proveedores de email tienen rate limits. Para v1 con volumen bajo, no es problema. Si escala, implementar cola de envío.
- **Email de venta asistida:** Si la orden es de tipo `assisted`, también debe enviar confirmación. El flujo es el mismo (generate-ticket → send-confirmation).
- **Fallback de idioma:** Si el template ES está vacío, usar EN. Nunca enviar email con placeholders sin resolver.
