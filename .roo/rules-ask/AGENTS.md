# Project Documentation Rules (Non-Obvious Only)

- **Domain separation:** System has 5 distinct domains (Editorial, Commercial, Agenda, Transactional, User) - see `docs/architecture/00_domain-map.md` for boundaries.
- **ADR documents:** Design decisions are documented in `docs/architecture/ADR-*.md` files.
- **Task docs:** Detailed implementation tasks in `docs/tasks/TASK-*.md`.
- **Seeding utilities:** `scripts/seed-*.mjs` files for development data population.
- **Functions:** Appwrite cloud functions in `functions/` directory, documented separately.
- **i18n structure:** Translations in `src/i18n/{en,es}/*.json` by module (admin, checkout, common, landing, portal).
- **Copilot instructions:** Extensive AI guidance in `.github/copilot-instructions.md`.
- **Agent bundles:** Specialized agents in `.github/agents/*.agent.md` for backend, frontend, functions, etc.