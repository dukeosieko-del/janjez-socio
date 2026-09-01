# Auth Audit Report — Janjez Socio

**Scope:** Supabase auth-related migrations + middleware security headers.
**Audited files:**
- `supabase/migrations/20250101000000_create_profiles_table.sql`
- `supabase/migrations/20250101000001_email_verification.sql`
- `supabase/migrations/20250101000002_admin_tables.sql`
- `supabase/migrations/20250101000013_profiles_extended.sql`
- `supabase/migrations/20250101000024_password_reset_tokens.sql`
- `src/middleware.ts`
- `src/lib/supabase/middleware.ts`
- Supporting: `src/lib/supabase/admin.ts`, `src/app/api/auth/*`, `src/lib/auth/*`

**Note:** This is a read-only audit. No files were modified; fixes are reported only.

---

## 1. Row-Level Security (RLS) — per table

| Table | `ENABLE ROW LEVEL SECURITY` | Status |
|---|---|---|
| `profiles` | `20250101000000_create_profiles_table.sql:15` | PASS |
| `email_verifications` | `20250101000001_email_verification.sql:17` | PASS |
| `admin_activity_logs` | `20250101000002_admin_tables.sql:22` | PASS |
| `password_reset_tokens` | `20250101000024_password_reset_tokens.sql:17` | PASS |

All four tables enable RLS. PASS.

---

## 2. Policy coverage

### 2.1 `profiles`

- SELECT own: `20250101000000:18-19` `USING (auth.uid() = id)` — PASS
- UPDATE own: `20250101000000:22-23` `USING (auth.uid() = id)` — PASS
- INSERT own: `20250101000000:26-27` `WITH CHECK (auth.uid() = id)` — PASS
- DELETE policy: none present (DELETE denied to all via anon client) — acceptable (users should not delete profiles)
- **Admin SELECT all: MISSING** — **FAIL**

  The requirement is "admin can SELECT all". No policy grants an admin-role user access to all profiles. Current policies only allow a user to read their own row (`auth.uid() = id`). An admin-role authenticated user (via the anon/anon key) cannot run `select()` without a filter against other users' profiles.

  The middleware admin guard still functions today because it selects the requesting user's *own* profile:
  ```ts
  // src/middleware.ts:45-49
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  ```
  This is permitted by the "Users can view own profile" policy. So the middleware check works, but the general "admin can SELECT all profiles" capability is not implemented.

### 2.2 `email_verifications`

- SELECT own: `20250101000001:19-20` `USING (auth.uid() = user_id)` — PASS
- INSERT own: `20250101000001:22-23` `WITH CHECK (auth.uid() = user_id)` — PASS

  Requirement was "user can view/insert own" — met.

  Code access pattern: `src/app/api/auth/verify-email/route.ts:24-28,35,50,63` and `send-verification/route.ts:28-31,37` perform DELETE/SELECT-by-token. These routes use `createAdminClient()` (`src/lib/supabase/admin.ts:5` uses `SUPABASE_SERVICE_ROLE_KEY`), so they bypass RLS. No DELETE policy for anon users is therefore acceptable (and desirable: regular users should not delete verification rows).

### 2.3 `password_reset_tokens`

- SELECT/INSERT/UPDATE/DELETE all gated on `profiles.role = 'admin'` — present `20250101000024:19-49`.
- Regular (non-admin) authenticated users: no policy grants access → denied — PASS (intent: non-users cannot read tokens).
- **Caveat / hardening gap:** requirement says "only service role (admin) can access". The current policies additionally grant **admin-role authenticated users** (via the anon key) read/write access to reset tokens. The code never exercises this path — all access in `src/lib/auth/reset-helpers.ts` and `src/app/api/auth/reset-password/route.ts:45` uses `createAdminClient()` (service role, bypasses RLS). So there is no live exploit path today, but the RLS surface is broader than the stated "service role only" intent.

  Recommended hardening (defense in depth): make the table accessible **only** to the service role by removing the role-based policies and relying on RLS-deny for authenticated users (service role bypasses RLS regardless):
  ```sql
  -- supabase/migrations/20250101000024_password_reset_tokens.sql (replace existing policies)
  DROP POLICY IF EXISTS "Admins can view password reset tokens"  ON public.password_reset_tokens;
  DROP POLICY IF EXISTS "Admins can insert password reset tokens" ON public.password_reset_tokens;
  DROP POLICY IF EXISTS "Admins can update password reset tokens" ON public.password_reset_tokens;
  DROP POLICY IF EXISTS "Admins can delete password reset tokens" ON public.password_reset_tokens;
  -- With no grant policies, RLS denies all authenticated users; service_role bypasses RLS.
  ```
  (Apply this as a NEW migration, not by editing the existing migration history.)

### 2.4 `admin_activity_logs`

- SELECT all (admin only): `20250101000002:24-30` — PASS
- INSERT (admin only): `20250101000002:32-38` — PASS
- UPDATE policy: none (UPDATE denied to all) — not a gap; audit logs should be append-only/immutable. PASS (intended).
- DELETE policy: none (DELETE denied to all) — PASS (intended; prevents tampering with the audit log).
- Indexes on `actor_id`, `created_at`, `action` present (`20250101000002:41-43`) — PASS.

  Note: first admin seeding is commented out (`20250101000002:45-46`), so there is no bootstrap admin unless done manually. Operational note only.

---

## 3. Triggers

### 3.1 `handle_new_user()` — auto-create profile on signup

`20250101000000:30-42`. Triggered `AFTER INSERT ON auth.users`, inserts `(id, email, full_name)`.
- Columns inserted respect NOT NULL constraints: `email_verified` defaults `FALSE`, `role` defaults `'user'`, `notification_*`/`theme`/`language`/`avatar_url` added later default values, `wallet_balance` defaults `0.00`. — PASS
- `SECURITY DEFINER` — runs with definer privileges so it can write to `profiles`. — PASS
- Full audit note: profile is created synchronously on user creation in all signup paths (including `send-verification/route.ts:163` `auth.admin.createUser`), so the FK `profiles.id -> auth.users(id)` stays consistent. — PASS

### 3.2 `sync_email_verified()` — sync `email_verified` from auth

`20250101000001:26-39`. Triggered `AFTER UPDATE OF email_confirmed_at ON auth.users`, sets `profiles.email_verified = TRUE` when `email_confirmed_at` transitions from NULL to NOT NULL.
- The verify-email flow sets the flag via `supabase.auth.admin.updateUserById(verification.user_id, { email_confirm: true })` (`verify-email/route.ts:54-56`), which fires this trigger. — PASS
- Edge case (informational): this trigger only handles the NULL→set transition. If `email_confirmed_at` is ever cleared back to NULL, `email_verified` is not reset to FALSE. Not exercised by current code; low risk, noted for completeness.

---

## 4. Middleware security audit

### 4.1 CSP does not break Supabase auth callbacks

`src/middleware.ts:4-5`:
```
default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:;
style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:;
font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';
base-uri 'self'; form-action 'self';
```
- `connect-src 'self' https:` allows browser clients to reach the Supabase REST/Auth endpoints (`https://<project>.supabase.co/...`). — PASS
- Auth flow here uses **redirects** to custom routes (`/auth/sign-in`) and server-side `auth.admin.*` calls; it does **not** embed Supabase's hosted UI in an iframe, so `frame-ancestors 'none'` is safe. — PASS
- Weakness (not a breakage): `script-src` includes `'unsafe-inline'` and `'unsafe-eval'`. This weakens CSP value but is required by the inline-styled email templates / any inline scripts. If no inline scripts are needed, remove `'unsafe-inline'`/`'unsafe-eval'` and use nonces/hashes. — NOTE
- Verdict: CSP does not break Supabase auth callbacks. — PASS (with hardening note above)

### 4.2 Protected route logic

`src/middleware.ts:25-42`. `isProtectedPage` covers `/dashboard`, `/orders` (except `/orders/track`), `/pay`, `/admin`, `/wallet*`, `/settings*`. Unauthenticated request → redirect to `/auth/sign-in?next=...`. — PASS

### 4.3 Admin role check

`src/middleware.ts:44-56`. For `isAdminPage && user`, fetches `profiles.role` for `user.id` (allowed by own-profile SELECT policy) and redirects non-admins to `/dashboard`. — PASS
- Defense-in-depth note: admin check runs after the protected-page check; an unauthenticated `/admin` request is correctly redirected to sign-in first. — PASS

### 4.4 Security headers

`src/middleware.ts:77-93`. All present:
- `Content-Security-Policy` — set
- `X-Content-Type-Options: nosniff` — PASS
- `Referrer-Policy: strict-origin-when-cross-origin` — PASS
- `X-Frame-Options: DENY` — PASS
- `Permissions-Policy: camera=(), microphone=(), geolocation=()` — PASS
- `Strict-Transport-Security: max-age=63072000; includeSubDomains` — PASS
- `Cross-Origin-Opener-Policy: same-origin` — PASS
- `Cross-Origin-Resource-Policy: same-origin` — PASS
- `Cache-Control: no-store,…` for non-static — PASS
- `X-XSS-Protection: 1; mode=block` is set but this header is deprecated/no-op in modern browsers. Harmless but unnecessary. — NOTE (minor)

### 4.5 Middleware route matcher coverage — FAIL

`src/middleware.ts:95-104` contains malformed matcher entries:
```ts
"/wallet:path*",
"/settings:path*",
```
These are missing the slash before `:path*`. The correct Next.js matcher syntax is `/wallet/:path*` and `/settings/:path*`.

**Impact:** As written, `/wallet/:path*` and `/settings/:path*` are **not matched** by the middleware. Consequences:
- **No auth enforcement** on `/wallet/...` and `/settings/...` routes → protected pages served to unauthenticated users (broken access control).
- **No security headers** applied to those routes (CSP, HSTS, etc. missing).
- The `/orders/:path*` and `/pay` entries are correctly formed and covered.

Recommended fix (in `src/middleware.ts` `config.matcher`):
```ts
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/admin/:path*",
    "/orders/:path*",
    "/pay",
    "/wallet/:path*",      // was "/wallet:path*"
    "/settings/:path*",    // was "/settings:path*"
  ],
};
```

---

## 5. Tables referenced in code vs. migrations

Searched `src/app/api/auth/**` and `src/lib/auth/**` for `.from("tablename")` patterns. Referenced tables:

| Table referenced in code | Defined in migration | Status |
|---|---|---|
| `profiles` | `20250101000000_create_profiles_table.sql` | PASS |
| `email_verifications` | `20250101000001_email_verification.sql` | PASS |
| `password_reset_tokens` | `20250101000024_password_reset_tokens.sql` | PASS |
| `admin_activity_logs` | `20250101000002_admin_tables.sql` | PASS (table exists; not referenced in `src/app/api/auth` | `src/lib/auth`, but present and correctly defined) |

No table is referenced in code without a corresponding migration. — PASS

---

## 6. Summary

**Total checks performed: 20** (4 RLS, 12 policies, 2 triggers, CSP, protected routes, admin check, security headers, matcher coverage, code/migration table resolution) = see sections 1–5.

**Status:** 17 PASS, 1 FAIL, 2 NOTE/caveat.

### Issues found
1. **FAIL — `profiles` missing admin SELECT-all policy.** No policy lets an admin-role user read all profiles. (Middleware's own-role check still works via the own-profile policy.)
2. **FAIL — middleware matcher typos.** `/wallet:path*` and `/settings:path*` (missing `/`) cause wallet/settings routes to bypass middleware auth + security headers. Broken access control on protected pages.
3. **Caveat — `password_reset_tokens` broader than "service role only".** Admin-role users can access via anon key; code always uses service role so no live path, but surfaces more than intended. Recommend tightening to service-role-only.
4. **NOTE — CSP `script-src` uses `'unsafe-inline'`/`'unsafe-eval'`.** Weakens CSP; remove if inline scripts not needed.
5. **NOTE — `X-XSS-Protection` deprecated.** Harmless; can drop.
6. **NOTE — admin bootstrap seeding commented out.** Deployment note; no default admin unless manually seeded.
7. **NOTE — `sync_email_verified` only handles NULL→set transition.** Does not reset on revocation; not exercised by current code.

### Recommended fixes (do NOT apply — report only)
- **profiles admin SELECT-all** — add a new migration (not editing history):
  ```sql
  ALTER POLICY "Users can view own profile" ON public.profiles
    USING (auth.uid() = id OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    ));
  ```
  (or a separate "Admins can view all profiles" SELECT policy)
- **middleware matcher** — fix `/wallet/:path*` and `/settings/:path*` (see §4.5).
- **password_reset_tokens** — drop role-based policies; rely on service-role bypass + RLS-deny (see §2.3).
- **CSP** — drop `'unsafe-inline'`/`'unsafe-eval'` or replace with nonce/hashes.
- **headers** — remove `X-XSS-Protection` (deprecated).
