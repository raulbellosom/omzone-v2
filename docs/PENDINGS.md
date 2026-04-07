# OMZONE — Pendientes del Proyecto

> Última actualización: 2025-07-24
> Estado: Fases 0–10 completadas · TASK-035 completada (Fase 10 parcial)

---

## 1. Tasks pendientes

### Fase 7 — Tickets y reservas (completada)

Todas las tasks de esta fase han sido completadas (TASK-023 a TASK-025).

### Fase 8 — Pases y paquetes

| Task | Título | Estado |
|---|---|---|
| TASK-026 | CRUD pases consumibles (admin) | ✅ Completada |
| TASK-027 | Function consume-pass | ✅ Completada |
| TASK-028 | CRUD paquetes de experiencia (admin) | ✅ Completada |
| TASK-029 | Checkout adaptado para pases/paquetes | ⏭️ Saltada — requiere Stripe keys configuradas. Se retomará cuando se configuren las API keys y webhook en Stripe Dashboard. Ver sección "Configuración Stripe". |

### Fase 9 — Portal de cliente

| Task | Título | Prioridad |
|---|---|---|
| TASK-030 | Portal layout + dashboard | ✅ Completada |
| TASK-031 | Mis órdenes y detalle | ✅ Completada |
| TASK-032 | Mis tickets + descarga | ✅ Completada |
| TASK-033 | Mis pases y consumos | ✅ Completada |
| TASK-034 | Perfil del cliente | ✅ Completada |

### Fase 10 — CMS / publicaciones

| Task | Título | Prioridad |
|---|---|---|
| TASK-035 | CRUD publicaciones y secciones (admin) | ✅ Completada |
| TASK-036 | Renderizado público de publicaciones | 🟢 Después de TASK-035 |

### Fase 11 — Media y storage

| Task | Título | Prioridad |
|---|---|---|
| TASK-037 | Buckets, permisos, upload (admin) | 🟢 Independiente |
| TASK-038 | Media picker / galería reutilizable | 🟢 Después de TASK-037 |

### Fase 12 — Venta asistida y operaciones

| Task | Título | Prioridad |
|---|---|---|
| TASK-039 | Venta asistida (orden manual desde admin) | 🟢 Independiente |
| TASK-040 | Booking requests: solicitud → cotización → orden | 🟡 Enhancement |
| TASK-041 | Dashboard admin: métricas de ventas/ocupación | 🟢 Independiente |

### Sin fase asignada (previstas)

| Task | Título | Prioridad |
|---|---|---|
| TASK-042 | Function send-confirmation (email post-compra) | 🟡 Enhancement |
| TASK-043 | Function send-reminder (recordatorio evento) | 🟡 Enhancement |
| TASK-044 | SEO: meta tags, OG, sitemap, structured data | 🟢 Pre-deploy |
| TASK-045 | Performance: lazy loading, image optimization | 🟢 Pre-deploy |
| TASK-046 | i18n: soporte bilingüe ES/EN | 🟢 Pre-deploy |
| TASK-047 | Responsive audit completo | 🔴 Pre-deploy |
| TASK-048 | QA: permisos y label × acciones | 🔴 Pre-deploy |
| TASK-049 | QA: flujos transaccionales end-to-end | 🔴 Pre-deploy |
| TASK-050 | Deploy a producción | 🔴 Task final |

---

## 2. Configuración Stripe

| Elemento | Estado |
|---|---|
| Test API keys (`sk_test_`, `pk_test_`) | ❌ No configurados |
| Live API keys (`sk_live_`, `pk_live_`) | ❌ No configurados |
| Webhook URL registrada en Stripe Dashboard | ❌ Pendiente — URL esperada: `https://aprod.racoondevs.com/v1/functions/stripe-webhook/executions` |
| Webhook signing secret (`whsec_`) | ❌ Se genera al registrar el endpoint |
| Event subscriptions | ❌ Configurar: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.succeeded`, `payment_intent.payment_failed` |

---

## 3. Variables de entorno pendientes

### Appwrite Functions (project-level globals)

Estas variables deben configurarse en el panel Appwrite → Settings → Global Variables para que las 3 functions las hereden:

| Variable | Valor esperado |
|---|---|
| `APPWRITE_DATABASE_ID` | `omzone_db` |
| `APPWRITE_COLLECTION_ORDERS` | `orders` |
| `APPWRITE_COLLECTION_ORDER_ITEMS` | `order_items` |
| `APPWRITE_COLLECTION_PAYMENTS` | `payments` |
| `APPWRITE_COLLECTION_TICKETS` | `tickets` |
| `APPWRITE_COLLECTION_EXPERIENCES` | `experiences` |
| `APPWRITE_COLLECTION_PRICING_TIERS` | `pricing_tiers` |
| `APPWRITE_COLLECTION_ADDONS` | `addons` |
| `APPWRITE_COLLECTION_ADDON_ASSIGNMENTS` | `addon_assignments` |
| `APPWRITE_COLLECTION_SLOTS` | `slots` |
| `APPWRITE_COLLECTION_USER_PROFILES` | `user_profiles` |
| `STRIPE_SECRET_KEY` | `sk_test_...` o `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (tras registrar endpoint) |
| `FRONTEND_URL` | URL del frontend desplegado |

### Frontend (.env)

Las variables `VITE_APPWRITE_*` ya están configuradas localmente. Pendiente para deploy:

| Variable | Estado |
|---|---|
| `VITE_STRIPE_PUBLISHABLE_KEY` | ❌ No configurada |

---

## 4. Schema — gaps conocidos

| Issue | Ubicación | Impacto |
|---|---|---|
| `receiptUrl` falta en `payments` | appwrite.json | 🟡 Bajo — data model lo menciona, schema no lo tiene. Agregar cuando se implemente la vista de recibo. |
| Buckets `publication_media`, `user_avatars`, `documents` | appwrite.json | 🟡 Medio — referenciados en data model pero ausentes. Crear en TASK-037. |

---

## 5. Frontend — placeholders activos

### Admin (rutas con `AdminPlaceholder`)

| Ruta | Placeholder | Task que lo reemplaza |
|---|---|---|
| `/admin/editions` | "Ediciones" | TASK-012 (parcial, revisar) |
| `/admin/pricing` | "Precios" | TASK-012 |
| `/admin/packages` | ~~"Paquetes"~~ | ✅ TASK-028 (PackageListPage, Create, Edit) |
| `/admin/passes` | ~~"Pases"~~ | ✅ TASK-026 (PassListPage, Create, Edit) |
| `/admin/orders` | ~~"Órdenes"~~ | ✅ TASK-022 (OrderListPage, Detail) |
| `/admin/tickets` | "Tickets" | TASK-025+ (check-in wired, list still placeholder) |
| `/admin/check-in` | — | ✅ TASK-025 (CheckInPage implemented) |
| `/admin/clients` | "Clientes" | Sin task asignada |
| `/admin/publications` | "Publicaciones" | TASK-035 |
| `/admin/media` | "Media" | TASK-037/038 |
| `/admin/settings` | "Configuración" | Sin task asignada |

### Público (contenido placeholder)

| Página | Texto pendiente |
|---|---|
| About | "Full content coming soon." |
| Contact | "Location coming soon" / "Full contact form coming soon." |
| Privacy | "Full policy coming soon." |
| Terms | "Full terms coming soon." |

---

## 6. Deploy — checklist pre-producción

- [ ] Variables de entorno configuradas (sección 3)
- [ ] Stripe keys y webhook registrados (sección 2)
- [ ] Buckets faltantes agregados al schema (sección 4)
- [ ] `appwrite deploy` de colecciones
- [ ] `appwrite deploy function` de las 3 functions
- [ ] Frontend build y deploy vía Appwrite Sites o servicio externo
- [ ] Responsive audit (TASK-047)
- [ ] QA de permisos (TASK-048)
- [ ] QA de flujos transaccionales (TASK-049)
- [ ] Verificar `payments` collection: evaluar agregar `receiptUrl`
- [ ] Contenido real en About, Contact, Privacy, Terms
- [ ] SEO, meta tags, sitemap (TASK-044)
