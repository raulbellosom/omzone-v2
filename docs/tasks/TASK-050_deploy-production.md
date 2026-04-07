# TASK-050: Deploy — variables de entorno, dominio, SSL, Appwrite producción

## Objetivo

Preparar y ejecutar el deploy de OMZONE a producción: configurar variables de entorno de producción, desplegar schema y Functions con Appwrite CLI, build y deploy del frontend, configurar dominio y SSL, configurar Stripe production keys, y ejecutar smoke test completo. Al completar esta tarea, OMZONE está en producción y accesible públicamente con un flujo funcional de punta a punta.

## Contexto

- **Fase:** 15 — QA, responsive y deploy
- **Plan maestro:** `docs/core/01_plan_maestro_fases.md` — Fase 15
- **Documento maestro:** Secciones:
  - **RNF-01:** Arquitectura escalable
  - **RNF-03:** Seguridad
- **ADR relacionados:** Todos — el deploy consolida todas las decisiones arquitectónicas.

El deploy de OMZONE involucra múltiples componentes: Appwrite schema (colecciones, buckets), Appwrite Functions, frontend build, dominio DNS, SSL y configuración de Stripe.

## Alcance

Lo que SÍ incluye esta tarea:

1. Variables de entorno de producción:
   - Appwrite: `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`
   - Stripe: `STRIPE_SECRET_KEY` (production), `STRIPE_WEBHOOK_SECRET` (production)
   - Email: `EMAIL_PROVIDER`, `EMAIL_API_KEY`, `EMAIL_FROM`
   - Frontend: `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID`
   - Documentar todas las variables en `.env.example`
2. Appwrite production setup:
   - Verificar que el proyecto `omzone-dev` es el correcto para producción O crear proyecto `omzone-prod`
   - Decisión: usar el mismo proyecto con settings de producción o separar
3. Deploy schema via Appwrite CLI:
   - `appwrite login --endpoint https://aprod.racoondevs.com/v1`
   - `appwrite deploy` para colecciones, buckets, indices, permisos
   - Verificar que todas las 33 colecciones se despliegan correctamente
   - Verificar permisos de cada colección post-deploy
4. Deploy Functions via Appwrite CLI:
   - `appwrite deploy` para Functions: create-checkout, stripe-webhook, generate-ticket, validate-ticket, consume-pass, assign-user-label, send-confirmation, send-reminder
   - Configurar environment variables de cada Function en producción
   - Verificar que cada Function responde correctamente post-deploy
5. Frontend build:
   - `npm run build` con variables de entorno de producción
   - Verificar que el build no tiene errores
   - Verificar que las rutas funcionan (SPA fallback to index.html)
6. Frontend deploy:
   - Deploy via Appwrite Sites O hosting externo (Vercel, Netlify, custom server)
   - Configurar SPA routing (todas las rutas → index.html)
7. Dominio y DNS:
   - Configurar dominio apuntando al frontend
   - Configurar subdomain si aplica (api.domain resuelve a Appwrite)
8. SSL:
   - Verificar que SSL está activo (Let's Encrypt o manual)
   - Forzar HTTPS redirect
9. Stripe production:
   - Configurar keys de producción en Functions
   - Configurar webhook endpoint de producción en Stripe Dashboard
   - Verificar webhook secret
10. Smoke test post-deploy:
    - Crear una experiencia → publicar
    - Crear slot para la experiencia
    - Acceder al sitio público → ver experiencia
    - Completar checkout (Stripe production test o real)
    - Verificar ticket generado
    - Verificar email de confirmación
    - Login como admin → ver orden en dashboard
11. Documentación del proceso de deploy:
    - Documento con pasos reproducibles
    - Comandos exactos de deploy
    - Checklist de verificación post-deploy

## Fuera de alcance

- CI/CD pipeline (GitHub Actions, etc.).
- Monitoring y alerting (Sentry, UptimeRobot, etc.).
- Backup strategy y disaster recovery.
- Auto-scaling.
- Blue/green deployment.
- Database migration scripts.
- CDN configuration.

## Dominio

- [x] Infraestructura

## Entidades / tablas implicadas

Todas las 33 colecciones se despliegan.

## Atributos nuevos o modificados

N/A — se despliegan los atributos existentes definidos en `appwrite.json`.

## Functions implicadas

| Function | Operación | Notas |
|---|---|---|
| `create-checkout` | deploy | Deploy a producción con env vars |
| `stripe-webhook` | deploy | Deploy con Stripe production webhook secret |
| `generate-ticket` | deploy | Deploy |
| `validate-ticket` | deploy | Deploy |
| `consume-pass` | deploy | Deploy |
| `assign-user-label` | deploy | Deploy |
| `send-confirmation` | deploy | Deploy con email provider config |
| `send-reminder` | deploy | Deploy con CRON schedule |

## Buckets / Storage implicados

| Bucket | Operación | Notas |
|---|---|---|
| Todos (6 buckets) | deploy | Verificar permisos post-deploy |

## Componentes frontend implicados

N/A — el frontend se buildea como un todo.

## Hooks implicados

N/A.

## Rutas implicadas

Todas — se verifica que el SPA routing funciona en producción.

## Permisos y labels involucrados

| Acción | root | admin | operator | client | anónimo |
|---|---|---|---|---|---|
| Deploy | ✅ | ❌ | ❌ | ❌ | ❌ |

Nota: El deploy es una operación técnica realizada por root/devops, no por usuarios del sistema.

## Flujo principal

1. Configurar variables de entorno de producción en archivo `.env.production`.
2. Login en Appwrite CLI: `appwrite login --endpoint https://aprod.racoondevs.com/v1`.
3. Deploy schema: `appwrite deploy --all` o selectivo.
4. Verificar colecciones, buckets y permisos en Appwrite Console.
5. Deploy Functions con variables de entorno de producción.
6. Build del frontend: `npm run build`.
7. Deploy frontend a hosting (Appwrite Sites o externo).
8. Configurar dominio DNS y SSL.
9. Configurar Stripe production webhook.
10. Ejecutar smoke test completo.
11. Documentar proceso.

## Criterios de aceptación

- [ ] Todas las variables de entorno de producción están documentadas en `.env.example`.
- [ ] Todas las 33 colecciones están desplegadas con atributos, índices y permisos correctos.
- [ ] Todos los 6 buckets de Storage están desplegados con permisos correctos.
- [ ] Todas las Functions están desplegadas y responden a requests.
- [ ] Las Functions tienen sus variables de entorno de producción configuradas.
- [ ] El frontend build se completa sin errores.
- [ ] El frontend está accesible en el dominio de producción con HTTPS.
- [ ] Las rutas del SPA funcionan correctamente (deep link a `/experiences/:slug` retorna la app).
- [ ] El Stripe webhook está configurado con la URL de producción y el secret correcto.
- [ ] Smoke test: crear experiencia → crear slot → publicar → ver en público → checkout → pagar → recibir ticket (flujo completo).
- [ ] Smoke test: login como admin → ver orden en dashboard → ver ticket generado.
- [ ] Smoke test: email de confirmación se recibe después de la compra.
- [ ] SSL activo: todas las URLs se acceden via HTTPS.
- [ ] No HTTP (redirect a HTTPS).
- [ ] El proceso de deploy está documentado con pasos reproducibles.
- [ ] No hay API keys, secrets ni credenciales hardcodeados en el código fuente o frontend build.

## Validaciones de seguridad

- [ ] Stripe production keys son diferentes de las test keys y están solo en environment variables.
- [ ] El APPWRITE_API_KEY no está expuesto en el frontend build (solo en Functions).
- [ ] Las variables `VITE_*` del frontend no contienen secrets (solo endpoint y project ID, que son públicos).
- [ ] El webhook endpoint de Stripe verifica firma HMAC con el production webhook secret.
- [ ] No hay console.log con datos sensibles en el frontend build de producción.
- [ ] El archivo `.env` (con secrets reales) está en `.gitignore` y NO en el repositorio.
- [ ] CORS está configurado para permitir solo el dominio de producción.
- [ ] Las Functions no tienen `console.log` de API keys o payment data.

## Dependencias

- Depende de que TODAS las tareas anteriores (TASK-001 a TASK-049) estén completadas.

## Bloquea a

Ninguna — esta es la tarea final del proyecto.

## Riesgos y notas

- **Stripe production vs test:** Al cambiar a Stripe production keys, asegurarse de que el webhook secret también se actualiza. Un mismatch entre keys causa que los webhooks fallen silenciosamente.
- **DNS propagation:** Los cambios de DNS pueden tardar hasta 48 horas en propagarse. Planificar el cambio de DNS con anticipación.
- **Appwrite CLI deploy:** El comando `appwrite deploy` puede fallar si hay conflictos entre el schema local (`appwrite.json`) y el estado actual del proyecto. Hacer backup antes de deployar.
- **SPA routing:** El hosting debe estar configurado para servir `index.html` para todas las rutas (no 404 en deep links). En Appwrite Sites, configurar rewrite rules. En Nginx, usar `try_files $uri /index.html`.
- **Primer usuario admin:** Después del deploy, crear manualmente el primer usuario con label `admin` via Appwrite Console o CLI. Documentar este paso.
- **Seeds de datos:** Los templates de notificaciones (TASK-042, TASK-043) y site_settings deben crearse post-deploy. Incluir en el checklist.
- **Rollback plan:** Si algo falla en producción, documentar cómo hacer rollback: revertir Functions, restaurar schema, apuntar DNS de vuelta. No implementar un sistema de rollback, solo documentar los pasos manuales.
