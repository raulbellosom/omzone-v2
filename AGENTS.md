# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview

OMZONE is a wellness lifestyle platform for booking experiences (sessions, immersions, retreats, stays, private events). The system combines subscription passes, time-based reservations, and personalized wellness programs.

## Stack

- **Frontend:** React 19 + Vite 6 + JavaScript (no TypeScript)
- **Styling:** TailwindCSS v4 (CSS-first config with `@tailwindcss/vite` plugin)
- **Backend:** Appwrite self-hosted 1.9.0 at `https://aprod.racoondevs.com/v1`, project `omzone-dev`
- **Database:** Appwrite Databases (no Prisma)
- **Auth:** Appwrite Auth with labels-based permissions (`root`, `admin`, `operator`, `client`)
- **Payments:** Stripe (checkout via Appwrite Functions, not client-side)
- **State:** TanStack React Query v5
- **Routing:** React Router v7

## Build Commands

```
npm run dev      # Dev server on port 5173
npm run build    # Production build
npm run preview  # Preview production build
npm run analyze  # Build with bundle analyzer
```

## Key Conventions

### Naming
- Collections/tables: `snake_case`
- Attributes/fields: `camelCase`
- Functions: `kebab-case`
- Components: `PascalCase`
- Hooks: `useCamelCase`

### Architecture (Domain Separation)
1. **Editorial** - `experiences`, `publications`, `tags` (narrative, SEO, no pricing)
2. **Commercial** - `editions`, `pricing_tiers`, `addons`, `packages`, `passes` (pricing, no narrative)
3. **Agenda** - `slots`, `resources`, `locations` (when, capacity, resources)
4. **Transactional** - `orders`, `tickets`, `pass_consumptions` (immutable with JSON snapshots)
5. **User** - `user_profiles`, `admin_activity_logs`

### Critical Rules
- **Snapshots required:** Orders/tickets MUST store JSON snapshot of price/experience at purchase time. Never rely on live relations for historical data.
- **Sensitive logic in Functions:** Checkout, ticket generation, webhook handling, pass consumption MUST run in Appwrite Functions (not client-side).
- **Root user is invisible:** Use `excludeGhostUsers()` from `src/constants/roles.js` to filter root from all listings. Display role as "Admin" never "Root".
- **Admin labels:** `root`, `admin`, `operator` for panel access; `client` for portal access.

### Environment Variables
- Prefix with `APPWRITE_` or `VITE_` for frontend exposure
- `APPWRITE_` vars are also exposed as `VITE_APPWRITE_*` via vite.config.js mapping
- Vite env prefix is disabled (`__OMZONE_ENV_DISABLED__`) - all env vars available

### File Structure
- `@/` alias points to `src/`
- Lazy loading for all pages except `HomePage`
- All admin pages under `/admin/*`, portal under `/portal/*`
- `scripts/` contains seeding utilities for development
- `functions/` contains Appwrite cloud functions
- `docs/architecture/` contains ADR documents explaining design decisions

### Phone Validation
- Use `isValidPhone()` and `sanitizePhone()` from `src/lib/utils.js`
- Appwrite Auth requires `+` prefix with country code (E.164 format)
- Valid: `+52 55 1234 5678`, Invalid: `5512345678`

### Appwrite SDK
- Import from `@/lib/appwrite` (exports `account`, `databases`, `storage`, `functions`, `ID`, `Query`)
- Call `syncLocale()` before verification/recovery emails so Appwrite picks correct language template

### SEO
- Every public page must use `<SEOHead>` component with title, description, canonical
- Local focus: Puerto Vallarta, Bahía de Banderas, Riviera Nayarit
- English primary, Spanish secondary for public content

## Important Files

- `appwrite.json` - Database schema (collections, attributes, indexes, permissions)
- `src/lib/appwrite.js` - Appwrite client initialization and syncLocale()
- `src/constants/roles.js` - Role definitions and excludeGhostUsers() utility
- `src/routes/guards.jsx` - Route protection components (RequireAuth, RequireLabel, ProtectedRoute)
- `vite.config.js` - Alias `@` → `src/`, env mapping, build chunk splitting
- `docs/architecture/00_domain-map.md` - Domain boundaries and entity relationships
- `.github/copilot-instructions.md` - Project instructions for AI assistants