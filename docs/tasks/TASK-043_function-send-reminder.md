# TASK-043: Function send-reminder — recordatorio de próximo evento

## Objetivo

Crear la Appwrite Function `send-reminder` que se ejecuta de forma programada (diariamente) y envía emails de recordatorio a los clientes con tickets activos para slots que inician dentro de las próximas 24-48 horas. Al completar esta tarea, los clientes reciben un recordatorio automático antes de su experiencia con detalles prácticos (fecha, hora, ubicación, ticket code).

## Contexto

- **Fase:** 13 — Notificaciones
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 13
- **Documento maestro:** Secciones:
  - **RF-10:** Órdenes — confirmación y recordatorio
  - RNF-07: Trazabilidad
- **Modelo de datos:** `docs/architecture/01_data-model.md` — `slots` (4.1), `tickets` (6.4), `bookings` (5.1), `notification_templates` (8.2), `user_profiles` (7.1), `experiences` (2.1), `locations` (5.3)
- **ADR relacionados:** ADR-005 (Lógica sensible en Functions)

Depende de TASK-042 que establece la infraestructura de envío de email y uso de templates.

## Alcance

Lo que SÍ incluye esta tarea:

1. Crear Appwrite Function `send-reminder` con trigger Schedule (CRON daily).
2. Query de slots con `startDatetime` dentro de las próximas 24-48 horas y `status === "available"`.
3. Para cada slot encontrado:
   - Query tickets con `slotId` y `status === "active"`
   - Agrupar por `userId`
4. Para cada usuario con tickets en slots próximos:
   - Leer datos del perfil (`user_profiles`) para idioma y nombre
   - Leer datos de la experiencia (`experiences`) para nombre público
   - Leer datos de la ubicación/location si aplica
5. Componer email de recordatorio:
   - Leer template `event-reminder` de `notification_templates`
   - Placeholders: `{{customerName}}`, `{{experienceName}}`, `{{date}}`, `{{time}}`, `{{location}}`, `{{ticketCode}}`
   - ES/EN según preferencia de idioma del usuario
6. Enviar email:
   - Mismo mecanismo que `send-confirmation` (TASK-042)
   - Si el envío falla: loguear error, continuar con el siguiente usuario
7. Tracking de recordatorios enviados:
   - Usa `admin_activity_logs` o campo auxiliar para registrar que el recordatorio fue enviado para evitar duplicados en caso de re-ejecución
   - Key: `reminder-sent-{ticketId}-{slotId}`
8. Crear template seed:
   - Insertar documento `notification_templates` con key `event-reminder`, type `email`, body EN y ES

## Fuera de alcance

- Preferencias de recordatorio del usuario (optar por no recibir).
- Ventanas de recordatorio configurables (ej: 72h, 12h, 1h antes).
- Recordatorios por SMS o WhatsApp.
- Recordatorios para pases consumibles sin slot asociado.
- Notificaciones push.

## Dominio

- [x] Agenda (slots, recursos, capacidad)
- [x] Transaccional (órdenes, pagos, tickets, reembolsos)
- [x] Configuración (settings, templates)

## Entidades / tablas implicadas

| Tabla | Operación | Notas |
|---|---|---|
| `slots` | leer | Query de slots próximos (24-48h) |
| `tickets` | leer | Tickets activos para los slots encontrados |
| `experiences` | leer | Nombre de experiencia para el email |
| `locations` | leer | Ubicación del slot (si aplica) |
| `user_profiles` | leer | Idioma y nombre del usuario |
| `notification_templates` | leer | Template `event-reminder` |
| `admin_activity_logs` | crear / leer | Tracking de recordatorios enviados |

## Atributos nuevos o modificados

N/A — se leen atributos existentes. Se crea documento seed en `notification_templates` con key `event-reminder`.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `send-reminder` | crear | Function con trigger Schedule (CRON daily, e.g. `0 8 * * *`) |

## Buckets / Storage implicados

Ninguno.

## Componentes frontend implicados

Ninguno — esta tarea es backend-only.

## Hooks implicados

N/A.

## Rutas implicadas

N/A — la Function se ejecuta por schedule, no tiene endpoint público.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Recibir recordatorio | — | — | — | ✅ | — |
| Function ejecuta automáticamente | — | — | — | — | — |

Nota: La Function se ejecuta por CRON sin invocar por usuario. Usa API key server-side.

## Flujo principal

1. CRON trigger ejecuta `send-reminder` diariamente (e.g. 8:00 AM UTC).
2. Function calcula ventana: `now + 24h` hasta `now + 48h`.
3. Query: slots con `startDatetime` dentro de la ventana y `status === "available"`.
4. Para cada slot:
   - Query tickets con `slotId` y `status === "active"`.
   - Para cada ticket:
     - Verificar si ya se envió recordatorio (check `admin_activity_logs`).
     - Si ya se envió → skip.
     - Si no:
       - Leer perfil del usuario (idioma, nombre).
       - Leer experiencia (nombre público).
       - Leer location del slot (si hay).
       - Componer email con template `event-reminder`.
       - Enviar email al usuario.
       - Registrar envío en `admin_activity_logs`.
5. Log resumen: X recordatorios enviados, Y fallos.

## Criterios de aceptación

- [ ] La Function `send-reminder` existe como Appwrite Function con trigger Schedule.
- [ ] La Function se ejecuta diariamente según el CRON configurado.
- [ ] La Function identifica correctamente slots que inician dentro de las próximas 24-48 horas.
- [ ] La Function envía email de recordatorio a cada usuario con ticket activo para esos slots.
- [ ] El email incluye: nombre de experiencia, fecha, hora, ubicación (si aplica), ticket code.
- [ ] El email usa template `event-reminder` de `notification_templates` con placeholders reemplazados.
- [ ] Si el usuario tiene `language: "es"`, se usa versión ES del template.
- [ ] La Function no envía recordatorios duplicados (verifica envío previo antes de enviar).
- [ ] Si el envío de un email falla, el error se loguea y la Function continúa con el siguiente usuario.
- [ ] Se registra cada recordatorio enviado en `admin_activity_logs` para trazabilidad.
- [ ] Existe documento seed en `notification_templates` con key `event-reminder`, body EN y ES.
- [ ] Las credenciales de email se leen de environment variables.

## Validaciones de seguridad

- [ ] La Function usa API key server-side, no JWT de usuario.
- [ ] Los emails se envían solo a direcciones almacenadas en tickets/orders, no a input externo.
- [ ] Las credenciales de email están en environment variables, nunca hardcodeadas.
- [ ] La Function no expone datos de otros usuarios en los emails (cada email es individual).
- [ ] El CRON schedule está configurado de forma que no ejecute múltiples veces en la misma ventana.

## Dependencias

- **TASK-042:** Function send-confirmation — provee infraestructura de envío de email y uso de templates.
- **TASK-005:** Schema agenda — provee tabla `slots`.

## Bloquea a

Ninguna directamente.

## Riesgos y notas

- **Volumen de emails:** Dependiendo de la cantidad de slots y tickets, la Function puede necesitar enviar muchos emails en una ejecución. Los proveedores de email tienen rate limits (ej: SendGrid 100 emails/segundo). Si el volumen crece, implementar batching.
- **Timezone:** Los slots tienen `timezone` y `startDatetime` en UTC. La ventana de 24-48h se calcula en UTC. El recordatorio debe mostrar la hora en la timezone del slot, no en UTC.
- **Duplicados:** El mecanismo de tracking via `admin_activity_logs` requiere query antes de cada envío. Alternativa: agregar campo `reminderSentAt` en tickets (pero eso modifica schema). Para v1, usar activity logs.
- **Slots sin tickets:** Si un slot tiene capacidad pero no tiene tickets vendidos, no se envían recordatorios. Esto es correcto.
- **Function cold start:** Con CRON diario, la Function tendrá cold start cada ejecución. Acceptable para un job diario.
- **Re-ejecución segura:** Si la Function se ejecuta dos veces en el mismo día (error de CRON o manual retry), el tracking de duplicados evita enviar recordatorios repetidos.
