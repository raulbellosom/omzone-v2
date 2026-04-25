# Project Debug Rules (Non-Obvious Only)

- **Root user is invisible:** Use `excludeGhostUsers()` from `src/constants/roles.js` to filter root from all listings. Root should never appear in any user-facing UI.
- **API key auth:** Appwrite Functions use server-side API key, not client auth. Debug API calls via MCP or direct API.
- **Build ID in version.json:** Vite plugin generates `dist/version.json` with buildId - check here if you suspect stale builds.
- **Stripe webhooks:** Run locally with Stripe CLI: `stripe listen --forward-to localhost:5173/webhooks/stripe`
- **Appwrite self-hosted:** Endpoint is `https://aprod.racoondevs.com/v1` NOT the cloud endpoint.
- **MCP Appwrite tools:** Use `appwrite-api-omzone-dev` MCP for direct database/storage/functions operations during debugging.