#!/usr/bin/env bash
# OMZONE — Fix global project variables that were stored with single-quote wrappers
# Cause: push-global-vars.mjs ran via cmd.exe (execSync on Windows), which kept
#        the shell single-quote syntax as literal characters in the stored value.
# Fix:   Delete each quoted variable and recreate it with the clean value from .env
# Usage: bash scripts/fix-global-vars.sh  (from Git Bash in project root)

set -e

ENV_FILE=".env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: .env not found in current directory"
  exit 1
fi

# ── 1. Parse .env into an associative array ───────────────────────────────────
declare -A ENV_VARS
while IFS='=' read -r key rest || [[ -n "$key" ]]; do
  key="${key%%[[:space:]]*}"         # trim trailing whitespace
  [[ -z "$key" || "$key" == \#* ]] && continue
  value="${rest}"
  ENV_VARS["$key"]="$value"
done < "$ENV_FILE"

SKIP_KEYS=("VITE_UNDER_CONSTRUCTION" "VITE_SITE_URL" "APPWRITE_API_KEY")

# ── 2. Fetch all existing project variables (JSON) ───────────────────────────
echo "► Fetching existing project variables..."
VARS_JSON=$(appwrite project list-variables --json 2>/dev/null) || {
  echo "Error: could not list project variables"
  exit 1
}

# ── 3. Process each .env key ─────────────────────────────────────────────────
ok=0; skipped=0; failed=0

for key in "${!ENV_VARS[@]}"; do
  # Skip keys that should not be global vars
  skip=false
  for sk in "${SKIP_KEYS[@]}"; do
    [[ "$key" == "$sk" ]] && skip=true && break
  done
  $skip && continue

  value="${ENV_VARS[$key]}"

  # Get the variable ID for this key using appwrite CLI
  # We re-use the list output to find the variable ID
  VAR_ID=$(appwrite project list-variables 2>/dev/null | grep "│ ${key} " | awk -F'│' '{print $2}' | tr -d ' ')

  if [[ -n "$VAR_ID" ]]; then
    # Check if the stored value has single-quote wrappers by examining listed output
    STORED_VALUE=$(appwrite project list-variables 2>/dev/null | grep "│ ${key} " | awk -F'│' '{print $5}' | tr -d ' ')

    # Delete the old variable
    appwrite project delete-variable --variable-id "$VAR_ID" > /dev/null 2>&1 && {
      # Recreate with clean value (bash handles quoting correctly)
      if appwrite project create-variable --key "$key" --value "$value" --secret false > /dev/null 2>&1; then
        echo "✅  $key"
        ((ok++)) || true
      else
        echo "❌  $key (create failed)"
        ((failed++)) || true
      fi
    } || {
      echo "⚠️   $key (delete failed — trying create/update)"
      ((skipped++)) || true
    }
  else
    # Variable doesn't exist yet — create it
    if appwrite project create-variable --key "$key" --value "$value" --secret false > /dev/null 2>&1; then
      echo "✅  $key (new)"
      ((ok++)) || true
    else
      echo "⏭️   $key (already exists or skipped)"
      ((skipped++)) || true
    fi
  fi
done

echo ""
echo "Done: $ok updated, $skipped skipped, $failed failed"
