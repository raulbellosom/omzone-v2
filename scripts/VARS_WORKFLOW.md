# OMZONE variables workflow

This folder has multiple scripts for different moments. Use this quick map:

## 1) Push globals from env file (create-only)

- Script: `scripts/push-global-vars.mjs`
- Purpose: create global project vars, skip existing keys
- Uses: `.env` by default, or pass env file as arg

Commands:

- `node scripts/push-global-vars.mjs`
- `node scripts/push-global-vars.mjs .env.prod`

## 2) Full prod sync (create/update + cleanup bad function vars)

- Script: `scripts/sync-prod-vars.mjs`
- Purpose: synchronize prod globals from `.env.prod` and remove known bad function-level overrides
- Uses: `.env.prod` only

Command:

- `node scripts/sync-prod-vars.mjs`

## 3) Fix quote-wrapped values already stored in Appwrite

- Scripts: `scripts/fix-global-vars.mjs`, `scripts/fix-global-vars.sh`
- Purpose: repair values like `'omzone_db'` and recreate clean values
- Requires existing variables list first

Commands:

- `appwrite project list-variables --json > temp_vars_list.json`
- `node scripts/fix-global-vars.mjs`
- `node scripts/fix-global-vars.mjs .env.prod temp_prod_vars_list.json`
- `bash scripts/fix-global-vars.sh`
- `bash scripts/fix-global-vars.sh .env.prod`

## 4) Compare/check helper scripts

- `scripts/check-missing-vars.cjs` -> checks `.env` against `temp_vars_list.json`
- `scripts/compare-prod-vars.cjs` -> checks `.env.prod` against `temp_prod_vars_compare.json`

## Notes

- All global vars should be created with `--secret false`.
- Skip list normally excludes:
  - `APPWRITE_API_KEY`
  - `VITE_UNDER_CONSTRUCTION`
  - `VITE_SITE_URL`
- If API calls fail with `missing scopes (["project.read"]|["project.write"])`, the blocker is auth/scopes, not env file selection.
