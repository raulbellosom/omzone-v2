# Project Architecture Rules (Non-Obvious Only)

- **Snapshots for historical integrity:** Transactional domain (orders, tickets, passes) stores JSON snapshots to avoid dependence on live relations. Prices/features at purchase time are frozen.
- **Domain boundaries:** Editorial has no pricing, Commercial has no narrative. These must stay separated.
- **Sensitive logic in Functions:** Checkout, ticket generation, webhook handling, pass consumption MUST run server-side in Appwrite Functions.
- **Experience-first design:** System sells experiences, not rooms or slots. Slots are occurrences; passes are consumable balance.
- **Root as ghost user:** Root label is technically powerful but completely invisible in UI. Use `excludeGhostUsers()` and `isRoot` from `src/constants/roles.js`.
- **Permissions on two layers:** Both UI guards (RequireAuth, RequireLabel, ProtectedRoute) AND Appwrite collection permissions.
- **Appwrite self-hosted 1.9.0:** Endpoint `https://aprod.racoondevs.com/v1` - never cloud.
- **Hybrid data model:** Live relations for present (catalog, agenda), JSON snapshots for past (transactions, history).