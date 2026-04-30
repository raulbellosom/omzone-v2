# OMZONE — Email templates (Appwrite Auth)

Custom HTML for the Auth emails sent by Appwrite. These cannot be deployed via `appwrite.json` or the MCP API — they must be pasted manually in the Appwrite Console.

## Where to paste

1. Appwrite Console → Project `omzone-dev` → **Auth** → **Templates**.
2. Open the template you want to update (e.g. **Verification**).
3. Select **Template language** (`es` or `en`) — repeat for each.
4. Set **Subject**, paste the **Message** HTML, click **Update**.
5. Make sure a **custom SMTP server** is configured (Project → Settings → SMTP). Appwrite's built-in SMTP ignores custom templates by design.

## Allowed variables (Appwrite 1.9)

| Variable        | Meaning                                  |
| --------------- | ---------------------------------------- |
| `{{user}}`      | Recipient name                           |
| `{{redirect}}`  | Action URL (verify / recover / invite)   |
| `{{project}}`   | Project name (`OMZONE`)                  |
| `{{team}}`      | Team name (only for team invites)        |

> ⚠️ `{{name}}` is **not** valid. If used, Appwrite renders it literally (`{{name}}`).

## Files

| File                   | Template          | Language | Suggested subject                      |
| ---------------------- | ----------------- | -------- | -------------------------------------- |
| `verification.es.html` | Verification      | es       | `Confirma tu correo en OMZONE`         |
| `verification.en.html` | Verification      | en       | `Confirm your email at OMZONE`         |

## Locale

The frontend calls `syncLocale()` (see `src/lib/appwrite.js`) before triggering verification, so Appwrite picks the matching language template based on the user's locale.
