# OMZONE — Pendientes del Proyecto

> Última actualización: 2025-07-26
> Estado: Fases 0–15 + A–E completadas (excepto TASK-029 y TASK-050)

---

## 1. Tasks completadas (fases 0–15)

Las fases 0–15 se consideran completadas salvo dos excepciones:

| Task | Título | Estado | Nota |
|---|---|---|---|
| TASK-001 a TASK-028 | Fases 0–8 completas | ✅ | — |
| TASK-029 | Checkout adaptado para pases/paquetes | ⏭️ Saltada | Requiere Stripe test keys configuradas |
| TASK-030 a TASK-049 | Fases 9–14 + QA completas | ✅ | — |
| TASK-050 | Deploy a producción | ⏳ Pendiente | Requiere configuración Stripe y deploy final |

---

## 2. Tasks — Fases A–E (post-fase 15)

### Fase A — Páginas públicas (landing, about, contact)

| Task | Título | Estado |
|---|---|---|
| TASK-051 | Landing page completa (hero, secciones, CTA) | ✅ Completada |
| TASK-052 | About page completa (misión, ubicación, filosofía) | ✅ Completada |
| TASK-053 | Contact page completa (formulario + collection) | ✅ Completada |

### Fase B — Experiencias editorial redesign

| Task | Título | Estado |
|---|---|---|
| TASK-054 | Catálogo de experiencias: rediseño editorial vertical (sin precios visibles) | ✅ Completada |

### Fase C — Admin: secciones faltantes

| Task | Título | Estado |
|---|---|---|
| TASK-055 | Admin — Tickets: listado + detalle | ✅ Completada |
| TASK-056 | Admin — Clientes: listado + detalle (user_profiles + Auth) | ✅ Completada |
| TASK-057 | Admin — Media manager: explorador por bucket | ✅ Completada |
| TASK-058 | Admin — Settings: templates + system info | ✅ Completada |

### Fase D — Datos de demostración y QA

| Task | Título | Estado |
|---|---|---|
| TASK-059 | Seed: experiencias, ediciones, publicaciones, media de demostración | ✅ Completada |
| TASK-060 | QA integral: flujos completos, permisos, responsive, edge cases | ✅ Completada |
| TASK-061 | Responsive audit: verificación y correcciones 375/768/1024/1280 | ✅ Completada |

### Fase E — Limpieza y cierre

| Task | Título | Estado |
|---|---|---|
| TASK-062 | Limpieza: eliminar placeholders, rutas redundantes, actualizar docs | ✅ Completada |

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

## 5. Frontend — estado actual

### Admin

✅ Todas las secciones del panel admin están implementadas. No quedan placeholders.

Rutas redundantes `/admin/editions` y `/admin/pricing` eliminadas en TASK-062 (ediciones y precios se gestionan por experiencia).

### Público

| Página | Estado |
|---|---|
| Landing (HomePage) | ✅ Completada (TASK-051) |
| About | ✅ Completada (TASK-052) |
| Contact | ✅ Completada (TASK-053) |
| Experiences listing (rediseño) | ✅ Completada (TASK-054) |
| Privacy | Pendiente (fuera de alcance actual) |
| Terms | Pendiente (fuera de alcance actual) |

---

## 6. Deploy — checklist pre-producción

- [ ] Variables de entorno configuradas (sección 3)
- [ ] Stripe keys y webhook registrados (sección 2)
- [ ] Buckets faltantes agregados al schema (sección 4)
- [ ] `appwrite deploy` de colecciones
- [ ] `appwrite deploy function` de las 3 functions
- [ ] Frontend build y deploy vía Appwrite Sites o servicio externo
- [x] Responsive audit (TASK-061)
- [x] QA de permisos (TASK-060)
- [x] QA de flujos transaccionales (TASK-060)
- [ ] Verificar `payments` collection: evaluar agregar `receiptUrl`
- [x] Contenido editorial en Landing, About, Contact, Catálogo
- [ ] Contenido real en Privacy, Terms
- [x] SEO, meta tags, sitemap (TASK-044)
- [x] Limpieza de placeholders y rutas redundantes (TASK-062)
