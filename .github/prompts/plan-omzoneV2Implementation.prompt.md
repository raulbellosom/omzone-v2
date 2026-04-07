## Plan: OMZONE v2 — Implementación Completa (50 Tasks, 16 Fases)

**TL;DR:** omzone-v2 está vacío (solo docs). El proyecto previo `omzone-plasmic-complete` tiene ~95 archivos React reutilizables. La estrategia es copiar lo que sirve, adaptar al nuevo schema/endpoint (`aprod.racoondevs.com/v1` + `omzone-dev`), y ejecutar secuencialmente validando cada task antes de avanzar.

---

### FASE 0 — Setup (2 tasks)

**1. TASK-001: Scaffold React + Vite + Tailwind + Appwrite SDK**

- Copiar de plasmic-complete: `package.json`, `vite.config.js`, `index.html`, `src/main.jsx`, `src/lib/appwrite.js`, `src/lib/utils.js`, `src/config/env.js`, `src/styles/globals.css`, `src/components/ui/*` (14 componentes Radix UI)
- Adaptar: endpoint → `aprod.racoondevs.com/v1`, project → `omzone-dev`
- Crear: PublicLayout, AdminLayout, PortalLayout (shells con `<Outlet/>`), 6 páginas placeholder, `.env.example`
- **Validación:** `npm run dev` sin errores, Tailwind clases aplicándose, 6 rutas navegables, SDK exports ok

**2. TASK-002: Auth flow — login, registro, guards**

- Copiar: `useAuth.jsx`, `guards.jsx`, `roles.js`, `routes.js`, `auth.service.js`, `LoginPage.jsx`, `RegisterPage.jsx`, `AuthSidePanel.jsx`
- Adaptar: labels (root/admin/operator/client), nuevo endpoint
- **Validación:** Login + register funcionales, sesión persiste, guards redirigen por label

---

### FASE 1 — Schema Appwrite (5 tasks, _parallelizables_)

Crear colecciones via **MCP appwrite-api-omzone-dev** según `docs/architecture/01_data-model.md`:

**3. TASK-003:** Editorial → `experiences`, `publications`, `publication_sections`, `publication_media`, `tags`, `experience_tags`
**4. TASK-004:** Comercial → `experience_editions`, `pricing_tiers`, `pricing_rules`, `addons`, `addon_assignments`, `packages`, `package_items`, `passes`
**5. TASK-005:** Agenda → `slots`, `slot_resources`, `resources`
**6. TASK-006:** Transaccional → `orders`, `order_items`, `payments`, `tickets`, `ticket_redemptions`, `pass_consumptions`, `refunds`, `booking_requests`
**7. TASK-007:** Usuario/config → `user_profiles`, `user_preferences`, `admin_activity_logs`, `site_settings`

- **Validación por task:** Colecciones visibles en Appwrite console, atributos/tipos correctos, índices creados, permisos match documento maestro

---

### FASE 2 — Auth y Roles (2 tasks)

**8. TASK-008:** Function `assign-user-label` — auto-crea perfil + asigna label `client` al registrarse
**9. TASK-009:** Route guards refinados — operator con acceso limitado, root invisible

- Referencia: `appwrite/functions/create-user-profile/` de plasmic-complete
- **Skill requerida:** `appwrite-function-builder`
- **Validación:** Nuevo usuario → label + perfil automáticos. Rutas protegidas por label.

---

### FASE 3 — CRUD Admin (6 tasks, secuenciales)

**10. TASK-010:** Admin layout — Reuso: `AdminLayout`, `AdminSidebar`, `AdminTopbar`
**11. TASK-011:** CRUD experiencias — Reuso parcial: `AdminOfferingsPage`, adaptado a nuevo schema
**12. TASK-012:** CRUD ediciones + pricing tiers
**13. TASK-013:** CRUD addons + assignments — Nuevo
**14. TASK-014:** CRUD slots/agenda — Reuso: `AdminSchedulesPage`
**15. TASK-015:** CRUD resources/locations — Nuevo

- **Validación por task:** Admin crea/edita/lista/archiva. Datos persisten en Appwrite.

---

### FASE 4 — Catálogo Público (3 tasks)

**16. TASK-016:** Public layout — Reuso: `MainLayout`, `Navbar`, `Footer`
**17. TASK-017:** Listado experiencias + filtros — Reuso parcial: `OfferingsPage`
**18. TASK-018:** Detalle experiencia (editorial + comercial + agenda)

---

### FASE 5 — Checkout (2 tasks)

**19. TASK-019:** Function `create-checkout-session` (Stripe) — **Skills:** `checkout-flow-validator`, `appwrite-function-builder`
**20. TASK-020:** UI checkout — Reuso parcial: `CheckoutPage`, `BookingWizardPage`

---

### FASE 6 — Webhooks (2 tasks)

**21. TASK-021:** Function `stripe-webhook` — **Skill:** `stripe-webhook-validator`
**22. TASK-022:** Reconciliación de órdenes (status update, payment record)

---

### FASE 7 — Tickets (3 tasks)

**23. TASK-023:** Function `generate-ticket` — **Skill:** `ticketing-flow-tester`
**24. TASK-024:** Function `validate-ticket` (QR scan + check-in)
**25. TASK-025:** Confirmación + ticket display — Reuso: `CheckoutConfirmationPage`

---

### FASE 8 — Pases/Paquetes (4 tasks)

**26. TASK-026:** CRUD pases admin
**27. TASK-027:** Function `consume-pass`
**28. TASK-028:** CRUD paquetes admin
**29. TASK-029:** Checkout adaptado para pases/paquetes

---

### FASE 9 — Portal Cliente (5 tasks)

**30. TASK-030:** Portal layout + dashboard — Crear `PortalLayout` (no existía en plasmic)
**31. TASK-031:** Mis órdenes — Reuso: `CustomerPurchasesPage`
**32. TASK-032:** Mis tickets
**33. TASK-033:** Mis pases
**34. TASK-034:** Perfil — Reuso: `UserProfileSettingsForm`

---

### FASES 10-15 (16 tasks restantes)

| Fase                | Tasks   | Descripción                                          |
| ------------------- | ------- | ---------------------------------------------------- |
| 10 — CMS            | 035-036 | CRUD publications admin + render público             |
| 11 — Media          | 037-038 | Buckets storage + MediaPicker (reuso `MediaUpload`)  |
| 12 — Venta asistida | 039-041 | Orden manual + booking requests + dashboard métricas |
| 13 — Notificaciones | 042-043 | Functions email confirmación + recordatorio          |
| 14 — SEO/i18n       | 044-046 | Meta tags, performance, ES/EN (reuso `locales/`)     |
| 15 — QA/Deploy      | 047-050 | Responsive audit, permisos QA, flows QA, deploy prod |

---

### Mapa de Dependencias

```
TASK-001 → TASK-002 → TASK-003..007 (parallel) → TASK-008 → TASK-009
                                                       ↓
                                               TASK-010 → 011..015 (sequential)
                                                       ↓
                                               TASK-016..018 → TASK-019..020
                                                                     ↓
                                               TASK-021..022 → TASK-023..025
                                                                     ↓
                                               TASK-026..029 ∥ TASK-030..034
                                                       ↓              ↓
                                               TASK-035..038 → 039..041
                                                                     ↓
                                               TASK-042..043 → 044..046 → 047..050
```

---

### Herramientas que usaremos (del AI Kit en `.github/`)

| Herramienta                       | Fases donde aplica                                |
| --------------------------------- | ------------------------------------------------- |
| MCP `appwrite-api-omzone-dev`     | Fase 1, 2, y todas las que creen colecciones/docs |
| MCP `appwrite-docs`               | Consulta docs Appwrite 1.9 cuando se necesite     |
| Skill `appwrite-function-builder` | T-008, 019, 021, 023, 024, 027, 042, 043          |
| Skill `checkout-flow-validator`   | T-019, 020                                        |
| Skill `stripe-webhook-validator`  | T-021                                             |
| Skill `ticketing-flow-tester`     | T-023, 024, 025                                   |
| Skill `qa-tester`                 | T-048, 049                                        |
| Skill `responsive-auditor`        | T-047                                             |
| Instruction `appwrite-schema`     | T-003 a 007                                       |
| Instruction `react-components`    | Todo frontend                                     |
| Instruction `functions`           | Todas las Functions                               |

---

### Decisiones

1. **Copiar > reescribir**: Reusar máximo de plasmic-complete, adaptar config/schema. No reinventar.
2. **Validar antes de avanzar**: Cada task se valida con sus criterios de aceptación antes de ir a la siguiente.
3. **Endpoint**: Siempre `https://aprod.racoondevs.com/v1` + project `omzone-dev`. Nunca cloud.
4. **Schema first**: Fase 1 crea colecciones reales en Appwrite via MCP, no solo appwrite.json.
5. **Functions en Node.js**: Con `node-appwrite` SDK server-side.

---

### Scope Exclusions

- TypeScript (proyecto usa JavaScript)
- Tests unitarios/e2e formales (se valida funcionalmente task por task)
- Deploy a producción (hasta Fase 15)
- Integración con Plasmic framework (solo reuso de código fuente)

---

### Open Questions

1. **Config de colecciones de plasmic-complete**: ¿Comparar las colecciones del proyecto viejo vs el nuevo data model para detectar gaps, o guiarnos 100% por el nuevo `01_data-model.md`?
2. **Stripe keys**: Necesitaremos test keys de Stripe para Fase 5. ¿Ya están disponibles o las configuramos cuando lleguemos?
3. **Functions deploy**: ¿Deploy de Functions directamente con Appwrite CLI desde el proyecto, o prefieres otra vía?
