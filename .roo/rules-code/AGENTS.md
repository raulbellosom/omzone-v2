# Project Coding Rules (Non-Obvious Only)

- **Snapshots required:** Orders/tickets MUST store JSON snapshot of price/experience at purchase time. Never rely on live relations for historical data.
- **Sensitive logic in Functions:** Checkout, ticket generation, webhook handling, pass consumption MUST run in Appwrite Functions (not client-side).
- **Phone validation:** Use `isValidPhone()` and `sanitizePhone()` from `src/lib/utils.js` - Appwrite Auth requires `+` prefix with country code (E.164 format).
- **Lazy loading:** All pages except `HomePage` use lazy loading with `lazy(() => import(...))`.
- **Appwrite SDK imports:** Import from `@/lib/appwrite` (exports `account`, `databases`, `storage`, `functions`, `ID`, `Query`).
- **syncLocale():** Call `syncLocale()` from `@/lib/appwrite` before verification/recovery emails so Appwrite picks correct language template.
- **TailwindCSS v4:** Uses CSS-first config with `@tailwindcss/vite` plugin - no tailwind.config.js.
- **Custom cn() utility:** Use `cn()` from `src/lib/utils.js` (wraps clsx + tailwind-merge) instead of plain clsx.