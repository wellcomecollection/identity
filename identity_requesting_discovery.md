## Phase 1: Decouple credentials from Sierra (Auth0 native DB)

### Goal

Move credential storage (email + password) out of Sierra and into Auth0's native database. After this phase, Sierra is no longer involved in authentication. This phase does not require Folio to be ready.

### Background: How it works today

Auth0 is configured with a Custom DB connection (`Sierra-Connection`) with `import_mode = false`. This means:
- Auth0 delegates **all** credential operations to Sierra via 7 Custom DB scripts: `login`, `create`, `get_user`, `change_password`, `change_email`, `verify`, `delete`
- Sierra is the canonical store for credentials
- Auth0 never persists user password hashes itself

The connection is used by multiple clients: Identity web app, OpenAthens SAML IDP, IIIF Image API, Identity Lambda API, and Smoke Test.

#### Registration/create flow in detail

Registration currently happens in two stages:

1. **Auth0 Universal Login signup form** — user provides email and password only. Auth0 calls the `create` Custom DB script which:
   - Creates a Sierra patron with placeholder names (`Auth0_Registration_tempFirstName` / `Auth0_Registration_tempLastName`)
   - Assigns a barcode equal to the Sierra record number
   - Handles duplicate detection (Sierra returns "user already exists") and Sierra-specific password validation errors (PIN too trivial, PIN too long)

2. **Post-login redirect to full registration form** — the `redirect_to_full_registration` Auth0 Action fires after signup. It checks whether the user's `given_name`/`family_name` still have the `Auth0_Registration` prefix. If so, it:
   - Encodes a session token containing the user's email
   - Redirects the user to the identity webapp's `/registration` page
   - The user fills in their real first name, last name, and accepts T&Cs
   - The form submits to the Identity API's `PUT /users/:user_id/registration` endpoint, which updates the Sierra patron record with the real name (after verifying the record still has temp names)
   - The webapp redirects back to Auth0's `/continue` endpoint to complete the login flow
   - Auth0 issues tokens and the user is logged in

This two-stage approach exists because Auth0's Custom DB `create` script is the only hook during signup in a Custom DB connection — Auth0 won't consider the signup successful unless it completes. The full registration details (name, T&Cs) are collected separately afterward.

Consequences of this design:
- Abandoned signups leave orphaned Sierra patrons with temp names (require periodic cleanup)
- Two Sierra API calls during signup (create + update barcode), plus a third later (update name)
- The `redirect_to_full_registration` action must fire on every login to check whether registration is complete
- Auth0 can't update `given_name`/`family_name` directly on a Custom DB connection user — names are only refreshed from Sierra on next login (hence the user is logged out after registration to force a refresh)

### Mechanism: Auth0 Automatic Migration

Auth0 has built-in support for gradual migration via the `import_mode` flag in `infra/scoped/auth0-connection.tf`. When set to `true`:

- **On login (existing users):** Auth0 calls the `login` script to validate credentials against Sierra. If successful, Auth0 stores the user + password hash in its own native store. The next time the user logs in, Auth0 validates locally and never calls Sierra again.
- **On signup (new users):** Users are created directly in Auth0's native store. The `create` script is not called.
- **Password/email changes:** For already-migrated users, Auth0 handles natively. For not-yet-migrated users, the custom scripts still proxy to Sierra.

Key insight: Auth0 doesn't copy Sierra's password hash. It receives the plaintext password from the user's login attempt, validates it via Sierra's API, and then stores its own bcrypt hash. **Hash algorithm compatibility is not required.**

### Steps

#### Step 1: Prepare the `login` script for migration tracking

Before enabling import mode, update the `login` DB script (`packages/apps/auth0-database-scripts/src/login.ts`) to:
- Mark the Sierra patron record with a "migrated" flag (e.g. a varField) after successful credential validation
- This enables easy identification of stragglers later (query Sierra for patrons without the flag)

Also consider adding any useful data to `app_metadata` in the `patronRecordToUser` return value (`packages/apps/auth0-database-scripts/src/helpers.ts`). This is already returning `barcode` and `role`. Could add `sierra_record_number` if useful for future Folio correlation.

#### Step 2: Update the registration flow for new users

With `import_mode = true`, new signups go directly into Auth0 — the `create` DB script no longer fires. Since patrons still need a Sierra account to place holds, the Sierra patron creation must move elsewhere.

**Recommended approach:** Keep the existing redirect-to-registration flow (`redirect_to_full_registration` action + `/users/:user_id/registration` endpoint), but change the endpoint from "update existing Sierra patron with real name" to "create a new Sierra patron with full details". This avoids the temp-name pattern entirely.

Alternatively, if Auth0 Universal Login custom signup fields are sufficient for UX needs, the entire registration can happen in a single form (email, password, first name, last name, T&Cs) with patron creation handled by a post-login Action or the Identity API.

#### Step 3: Enable import mode

Flip in Terraform (`infra/scoped/auth0-connection.tf`):
```terraform
import_mode = true
```

From this point:
- Every existing user who logs in is silently migrated (one-time, transparent to user)
- New users are created in Auth0 natively
- Sierra credentials become progressively stale (this is fine — they're no longer read)

#### Step 4: Monitor migration progress

Track:
- Auth0 dashboard: users in native store vs still requiring custom scripts
- Sierra: patrons with vs without the migration flag
- Timeline: how quickly active users are being migrated (most will migrate within weeks based on login frequency)

#### Step 5: Handle stragglers

For users who never log in during the migration window:
- Query Sierra for all patrons **without** the migration flag — this is the straggler list
- Options:
  - **Forced password reset:** Bulk-import users into Auth0 (email + profile only, no password) and trigger password reset emails
  - **Accept dormancy:** If they haven't logged in for months, they can reset when they eventually return
- Decision depends on timeline pressure from Sierra retirement

#### Step 6: Remove Custom DB scripts

Once all users are migrated (or stragglers are handled):
- Set `enabled_database_customization = false` in Terraform
- Remove `custom_scripts` block and Sierra `configuration` from the connection
- Delete `packages/apps/auth0-database-scripts` from the repo
- Remove the `redirect_to_full_registration` action (if registration flow has been simplified)
- Remove the `/users/:user_id/registration` endpoint from the Identity API (if no longer needed)

### What stays working without changes

| Component | Why it's unaffected |
|-----------|-------------------|
| Identity web app login/signup | Auth0 Universal Login handles it natively |
| OpenAthens SAML IDP | Authenticates against Auth0 — doesn't care about backing store |
| IIIF Image API | Same Auth0 login flow |
| API Authorizer Lambda | Validates Auth0 tokens — unrelated to credential store |
| `add_custom_claims` action | Reads from `app_metadata` as before |
| Identity API (get user, change password, change email) | Already calls Auth0 Management API |

### What needs attention

| Component | Change needed |
|-----------|--------------|
| Registration flow | New users don't get auto-created in Sierra — need new creation path |
| `login` script | Add migration flag to Sierra patron on successful validation |
| Identity API `/registration` endpoint | Changes from "update patron" to "create patron" |
| Password policy | Sierra's PIN rules no longer apply — Auth0 config is sole authority (already defined in TF: min 8 chars, no personal info, dictionary check) |
| `verify` script side-effect | Currently marks Sierra patron as verified — moves to Auth0 native email verification |
| Patron Deletion Tracker | Still works (watches Sierra deletions → removes from Auth0), but direction may reverse later |

### Risks and mitigations

| Risk | Mitigation |
|------|-----------|
| Migration flag update fails during login | Non-blocking: user is still migrated in Auth0, just not flagged in Sierra. Log/alert on failure. Straggler count may be slightly inflated. |
| Sierra outage during transition | Only affects not-yet-migrated users (they can't log in). Already-migrated users are unaffected. Same blast radius as today. |
| New user registration fails to create Sierra patron | Same risk as today with the `create` script, but now in your own code where you have better error handling and retry control. |
| Someone accidentally flips import_mode back to false | Add a comment in TF explaining the irreversibility. Once users are in the native store, flipping back would cause "user already exists" conflicts. |

### Outcome

After Phase 1:
- Auth0 is the canonical store for all credentials
- Sierra holds patron profile/hold data only (credentials are stale/irrelevant)
- All 7 Custom DB scripts can be deleted
- The system is ready for Phase 2 (move patron data from Sierra to Folio) without any credential coupling to worry about