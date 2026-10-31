# JANJEZ.SOCIAL — INDEPENDENT PRODUCTION-READINESS AUDIT

**Audit Type:** Read-Only Independent Review  
**Auditor:** Glyph Cluster (External Reviewer)  
**Date:** 2026-10-31  
**Scope:** Full repository inspection of janjez.social platform  
**Engagement:** Strictly read-only as specified  

---

## PART A — EXECUTIVE ASSESSMENT

### Overall Production-Readiness: **MEDIUM-HIGH RISK**

The platform has a solid foundation with Next.js 16, React 19, Supabase auth, custom email verification, wallet system, and SMM provider integration. However, there are several critical issues that could impact production stability and security.

### Critical Risks
1. **Authentication flow complexity** - Custom email verification flow with dual auth patterns (Supabase Auth + custom token table) creates potential for inconsistency
2. **Missing Google OAuth implementation** - Despite being mentioned in reported issues, no Google OAuth code exists in the codebase
3. **Email delivery via ZeptoMail** - Entirely dependent on external API keys; no fallback or proper error handling visibility
4. **In-memory rate limiting** - Will not work correctly in multi-instance/serverless deployments (Vercel) 
5. **Service role key usage** - Many API routes use admin client with service role key; need to ensure proper authorization

### Authentication Health: **CONCERNING**
- Custom verification flow is implemented but adds complexity
- Supabase SSR setup looks reasonable
- Middleware has good protection patterns
- No OAuth providers implemented despite being reported issue

### API Health: **MODERATE**
- 21 API routes identified
- Generally good validation and rate limiting
- Some routes use service role key directly
- Price verification in orders is good practice

### External Integration Health: **MIXED**
- M-Pesa integration appears well-structured with token caching
- SMM provider integration present
- ZeptoMail (email) is used but appears untested without keys
- Supabase dependencies are correct versions

---

## PART B — FINDINGS REGISTER

| Finding ID | Severity | Category | Component | File and Location | Description | Evidence | Reproduction | Impact | Root Cause | Recommendation | Verification | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| F-001 | High | Auth | Middleware | `src/middleware.ts:10-21` | In production, if Supabase client creation fails, middleware returns 500 for ALL protected routes, blocking entire site | Middleware checks if supabase is null and in production returns 500 JSON | Missing `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` in prod | Complete site outage for auth-protected routes | Fail-safe but too aggressive | Return redirect to error page or allow degraded mode with better error handling | Test with missing env vars in prod mode | High |
| F-002 | High | Auth | Google OAuth | Entire codebase | No Google OAuth/signInWithOAuth implementation found despite reported issue | Grepped for `signInWithOAuth`, `google` auth - none found in auth flows | Attempt Google login - no UI option exists | Reported issue cannot be fixed as feature doesn't exist | Feature not implemented or removed | Either implement Google OAuth via Supabase or remove expectation; configure in Supabase dashboard | Check Supabase auth providers config vs code | High |
| F-003 | High | Auth | Custom Verification | `src/app/api/auth/send-verification/route.ts:47-52` | Lists ALL users to check if email exists - inefficient and may have permission issues | `supabase.auth.admin.listUsers()` called on every signup | Create account with existing email | Performance issue, potential data exposure, could fail with large userbase | Using admin API to check existence inefficiently | Query profiles table or handle duplicate error from createUser | Test with existing email | High |
| F-004 | High | SMTP/Email | ZeptoMail | `src/lib/email/transport.ts:15` | Throws error if token missing; no graceful degradation | Hard throw in getMailClient() | Missing ZEPTOMAIL_SENDMAIL_TOKEN | Email sending fails silently in catch blocks but throws from getMailClient | No fallback mechanism | Add graceful fallback or better error handling; make email sending optional in dev | Test without token configured | High |
| F-005 | Medium | Auth | Session Management | `src/components/AuthContext.tsx:88` | When loading profile, passes fake user object `{id: userId, email: "", user_metadata:{}}` to ensureProfile | Line 88 constructs incomplete User object | Profile load after session init | Could cause issues if ensureProfile logic changes | Lazy implementation | Pass actual user or adjust ensureProfile to not require full User object | Trace ensureProfile usage | High |
| F-006 | Medium | Auth | Middleware | `src/middleware.ts:27` | Protects routes starting with `/services` requiring auth - may be too broad | Line 27 includes pathname.startsWith("/services") in isProtectedPage | Access /services without auth redirects to sign-in | Blocks browsing services without login | Overly restrictive protection | Review if services listing should be public or require auth | Test unauthenticated access to /services | High |
| F-007 | Medium | API | Rate Limiting | `src/lib/server/rate-limiter.ts:8-43` | In-memory Map store - lost on restart, doesn't work across multiple instances | Global Map in module scope | Deploy to multiple instances/serverless | Rate limits not enforced in production scale | Simple implementation for single instance | Use Redis/Upstash or Vercel KV for distributed rate limiting | Check deployment topology (PM2 single instance per README) | High |
| F-008 | Medium | Auth | Password Reset | `src/components/auth/ResetPasswordForm.tsx:35` | Uses `window.location.origin` for redirectTo - could be manipulated in some contexts | Client-side origin usage | Password reset flow | Generally okay but relies on correct origin | Uses browser origin | Ensure site URL is correctly configured; consider using env var | Test redirect URL in different environments | Medium |
| F-009 | Medium | API | Orders | `src/app/api/orders/route.ts:133-157` | Complex wallet debit flow with RPC; on failure does notification but doesn't rollback other state | Uses debit_wallet RPC, checks result | Insufficient balance scenario | Race conditions possible; if RPC not atomic properly | Depends on DB function implementation | Ensure debit_wallet is atomic with proper locking | Review wallet_atomic_functions migration | High |
| F-010 | Medium | Security | CSP | `src/middleware.ts:4-5` | Very permissive CSP with 'unsafe-inline' and 'unsafe-eval' and wildcard https: | CSP header allows unsafe directives | Any XSS would be easier to exploit | Reduces XSS protection effectiveness | Convenience for development/compatibility | Tighten CSP in production, use nonces/hashes | Security review | High |
| F-011 | Medium | API | Admin Auth | `src/lib/server/auth-helpers.ts:19-46` | getUserFromRequest expects Bearer token in Authorization header and validates via supabase.auth.getUser(token) using service role key | Uses service role to verify tokens | API calls with Bearer tokens | Works but mixes auth patterns; service role has broad access | Alternative auth method | Document this pattern; ensure tokens are properly validated | Review usage patterns | Medium |
| F-012 | Low | DB | Migrations | Multiple migration files | Migrations added incrementally; orders table schema evolved across multiple files | See migration history | Schema consistency check | Potential for missed migrations in fresh setup | Incremental development | Ensure migration order is correct and all applied | Check migration 00003-00012 consistency | Medium |
| F-013 | Low | Config | Environment | `.env.example:15-16` | NEXT_PUBLIC_SUPABASE_URL shows example project URL in .env.example | Hardcoded example URL in example file | Developer setup | Not a bug but could cause confusion | Example values | Use placeholder like `https://your-project.supabase.co` | Review .env.example | Low |
| F-014 | Medium | Auth | Sign Up Flow | `src/components/AuthContext.tsx:186-202` | customSignUp calls API route; signUp method also exists but different flow | Dual signup methods | Using different signup paths | Confusion in auth flows | Multiple approaches implemented | Document which flow is canonical; remove unused code | Review all signup paths | Medium |


## PART C — AUTHENTICATION DEEP-DIVE

### Google OAuth
**Status:** NOT IMPLEMENTED / MISSING  
**Findings:**
- No `signInWithOAuth` calls found anywhere in codebase
- No Google OAuth UI buttons in auth forms
- No Google provider configuration code
- Supabase callback route exists at `/auth/callback` and handles code exchange correctly
- Issue reports mention Google OAuth problems - this suggests either (1) feature was planned but not implemented, (2) implemented in Supabase dashboard only without code changes, or (3) removed
- Expected Supabase callback: `https://rousjavuooduvicaobuv.supabase.co/auth/v1/callback` (per audit spec) - cannot verify from code
- App callback: `https://janjez.social/auth/callback` exists and is properly implemented

**Recommendation:** If Google OAuth is required, implement using `supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: ... } })` and add UI button. Otherwise clarify it's not supported.

### Supabase Sessions
**Status:** MOSTLY CORRECT with concerns  
**Flow Analysis:**
1. **Client init** (`src/lib/supabase/client.ts`): Creates browser client if env vars present, returns null otherwise
2. **Server init** (`src/lib/supabase/server.ts`): Uses SSR pattern with cookie getAll/setAll correctly
3. **Middleware init** (`src/lib/supabase/middleware.ts`): Similar SSR pattern, catches errors and returns null
4. **AuthContext** (`src/components/AuthContext.tsx`): 
   - Gets initial session via `getSession()` 
   - Sets up `onAuthStateChange` listener
   - Loads profile on auth change
   - **Issue F-005**: Passes incomplete user object to loadProfile in some cases

**Concerns:**
- AuthContext creates client at module level (`const supabase = createClient()`) and also stores error state separately
- Multiple places handle missing supabase client (returns null) - inconsistent error messages
- Profile creation/ensuring logic exists but could have race conditions

### Sign-out
**Status:** IMPLEMENTED  
- `signOut()` in AuthContext calls `supabase.auth.signOut()` - correct
- No explicit cleanup of local state beyond what onAuthStateChange handles
- onAuthStateChange will fire with null session and clear profile - correct

### Registration
**Status:** CUSTOM FLOW IMPLEMENTED  
**Flow:**
1. User fills form in SignUpForm → calls `customSignUp()` in AuthContext
2. AuthContext calls `/api/auth/send-verification` POST
3. API uses service role admin client to create user with `email_confirm: false`
4. Generates token, stores in `email_verifications` table
5. Sends email via ZeptoMail
6. User clicks link → `/api/auth/verify-email` verifies token, confirms email via admin API, deletes token, redirects to sign-in with `verified=1`
7. User can sign in after verification

**Issues:**
- F-003: Lists all users to check existence (inefficient)
- Email sending failure is caught and logged but doesn't prevent success response
- If email fails to send, user is created but can't verify easily

### Email Verification
**Status:** IMPLEMENTED with custom flow  
- Table `email_verifications` created in migration 00001
- Token expiry 24 hours
- RLS policies on email_verifications table
- Trigger to sync `email_verified` in profiles when auth.users.email_confirmed_at changes
- Proper cleanup of tokens after use/expiry

### Password Recovery
**Status:** USES SUPABASE BUILT-IN  
- ResetPasswordForm calls `supabase.auth.resetPasswordForEmail()` with redirect to `/auth/reset-password`
- Uses Supabase's built-in password reset flow (not custom)
- Different from custom verification flow - could cause confusion
- Redirect URL constructed with `window.location.origin` (F-008)

### Middleware
**Status:** FUNCTIONAL with issues  
- Protects `/dashboard/*`, `/services/*`, `/auth/*`, `/admin/*` (line 73)
- F-006: Protects `/services/*` requiring auth - may be business logic issue
- Admin check queries profiles table for role
- F-001: Fails hard in production if no supabase client
- Good security headers applied
- CSP is very permissive (F-010)

### Protected APIs
**Status:** MIXED PATTERNS  
- Some APIs use `getUserFromRequest()` which expects Bearer token (auth-helpers.ts)
- Most APIs like orders use `getUserFromRequest()` from auth-helpers
- Admin APIs use `requireAdmin()` which also uses Bearer token pattern
- Some APIs use service role directly (createAdminClient)
- Auth patterns are inconsistent across API routes

### Profiles and Wallets
**Status:** IMPLEMENTED  
- Profile created on first auth via `ensureProfile()` in AuthContext
- Wallet balance stored in profiles.wallet_balance
- Wallet operations use RPC `debit_wallet` (migration 00011)
- Orders debit wallet atomically via RPC
- Profile sync on auth state changes

### Blog Comments and Ratings
**Status:** NOT FOUND IN AUDITED SCOPE  
- Searched for blog/comment/rating - found blog references in README but no implementation in src/app or API routes found
- May be planned or in different location


## PART D — BREVO SMTP REPORT

**Note:** Codebase uses **ZeptoMail** (not Brevo/Sendinblue), despite the audit mentioning "Brevo SMTP" in the assignment. The actual implementation uses ZeptoMail SDK.

### Mailer Architecture
- **Transport:** `src/lib/email/transport.ts` - Uses `zeptomail` npm package v8.0.1
- **Config:** `src/lib/email/config.ts` - Site/domain/email alias configuration
- **Templates:** `src/lib/email/templates.ts` exists (not fully read but present)
- **Client Pattern:** Singleton pattern for SendMailClient

### Configuration Dependencies
**Required Environment Variables:**
- `ZEPTOMAIL_SENDMAIL_TOKEN` (required - throws if missing)
- `ZEPTOMAIL_URL` (optional, defaults to `api.zeptomail.com`)
- `ZEPTOMAIL_FROM_EMAIL` (used in send-verification as fallback)
- `NEXT_PUBLIC_SITE_URL` (used for building verification URLs)

### Calling Routes
1. **`src/app/api/auth/send-verification/route.ts:108-121`** - Sends email verification
   - From: `noreply@{domain}` or `ZEPTOMAIL_FROM_EMAIL`
   - To: User's email
   - Subject: "Verify your email — {SITE_NAME}"
   - HTML + text body with verification link
   - Errors caught and logged, but don't fail the request

### Failure Paths
- If `ZEPTOMAIL_SENDMAIL_TOKEN` missing: `getMailClient()` throws Error (F-004)
- In send-verification route, mail sending is in try/catch - failures are logged but response still returns success (line 119-121)
- No retry logic
- No delivery confirmation tracking visible

### Security Considerations
- Verification tokens are 32 bytes hex (crypto.randomBytes) - good entropy
- Tokens stored in DB with expiry
- Tokens deleted after use
- Verification links go to app routes, not direct auth
- No email content injection visible (uses template strings with controlled values)

### Required External Verification
Cannot verify without credentials:
1. ZeptoMail account configuration and domain verification
2. SMTP/API key validity
3. Sender email verification (SPF/DKIM/DMARC)
4. Email deliverability/reputation
5. Rate limits on ZeptoMail account
6. Whether emails actually arrive in inboxes (vs spam)

### Observations
- Uses ZeptoMail API (not SMTP) via SDK
- Track clicks/opens enabled (line 42-43 in transport)
- Client reference included for tracking
- Reply-to not used in verification emails
- Email aliases configured for forwarding (config.ts) but not obviously used in sending


## PART E — API INVENTORY

Total API routes discovered: **21**

| Route | Method | Purpose | Auth Required | Auth Pattern | Validation | DB Deps | External Deps | Rate Limit | Status | Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| `/api/admin/fulfillment-logs` | GET | View fulfillment logs | Admin (Bearer) | `requireAdmin()` + `getUserFromRequest()` | None visible | fulfillment_logs table | None | Admin rate limit (60/min) | OK | Uses service role |
| `/api/admin/ledger` | GET | View ledger/wallet transactions | Admin (Bearer) | requireAdmin() | None visible | wallet_transactions/profiles | None | Admin rate limit | OK | Admin only |
| `/api/admin/logs` | GET | View system logs | Admin (Bearer) | requireAdmin() | None visible | Unknown table | None | Admin rate limit | OK | Needs inspection |
| `/api/admin/orders` | GET | List all orders | Admin (Bearer) | requireAdmin() | Pagination params | orders, profiles | None | Admin rate limit | OK | Joins profiles, good implementation |
| `/api/admin/stats` | GET | Dashboard stats | Admin (Bearer) | requireAdmin() | None visible | Multiple tables | None | Admin rate limit | OK | Aggregation queries |
| `/api/admin/users` | GET/POST/PUT | User management | Admin (Bearer) | requireAdmin() | None visible | profiles, auth.users | None | Admin rate limit | OK | Likely uses service role |
| `/api/auth/send-verification` | POST | Custom signup with email verification | No | Public | Email/password validation, sanitization | email_verifications, profiles, auth.users (admin) | ZeptoMail | 10/min (rate limited) | OK with issues | F-003, F-004 issues |
| `/api/auth/verify-email` | GET | Verify email token | No | Public | Token validation | email_verifications, profiles, auth.users (admin) | None | 60/min | OK | Proper cleanup |
| `/api/contact` | POST | Contact form submission | No | Public | None visible | Unknown | Email? | Default rate limit (120/min) | Needs review | Unknown implementation |
| `/api/cron/smm-sync` | GET/POST | Cron job to sync SMM orders | Cron secret | `requireCronSecret()` checks header | Cron auth | orders, SMM provider | SMM API | Cron rate limit (60/min) | OK | Properly secured with secret |
| `/api/mpesa/callback` | POST | M-Pesa payment callback | No (webhook) | Public webhook | None visible | orders, wallet_transactions, profiles | None | Default | Critical | Needs security review - webhook validation? |
| `/api/mpesa/check-status` | POST | Check STK push status | Authenticated? | Uses getUserFromRequest? | Unknown | Unknown | M-Pesa API | Default | Needs review | May need auth |
| `/api/mpesa/stk-push` | POST | Initiate M-Pesa payment | Authenticated? | Uses getUserFromRequest? | Unknown | Unknown | M-Pesa API | Default | Needs review | Payment initiation |
| `/api/notifications` | GET/POST/PUT | User notifications | Authenticated | getUserFromRequest? | Unknown | notifications | None | Default | Needs review | User-specific |
| `/api/orders` | GET/POST | Create/list orders | Authenticated (POST needs auth) | getUserFromRequest() | Extensive validation | orders, profiles, notifications | SMM provider (fulfillment) | 30/min POST, 60/min GET | OK with concerns | F-009, price verification good |
| `/api/smm/balance` | GET | Check SMM provider balance | Authenticated? | Unknown | None | None | SMM API | Default | Needs review | Provider balance |
| `/api/smm/cancel` | POST | Cancel SMM order | Authenticated? | Unknown | None | orders | SMM API | Default | Needs review | Order modification |
| `/api/smm/catalog` | GET | Get SMM services catalog | Public? | Unknown | None | May cache | SMM API | Default | Needs review | Catalog sync |
| `/api/smm/fulfill` | POST | Manually fulfill order | Authenticated/Admin? | Unknown | None | orders | SMM API | Default | Needs review | Fulfillment trigger |
| `/api/smm/refill` | POST | Refill SMM order | Authenticated? | Unknown | None | orders | SMM API | Default | Needs review | Order modification |
| `/api/smm/sync-status` | GET/POST | Sync order status from provider | Cron or auth? | Unknown | None | orders | SMM API | Default | Needs review | Status sync |

**Notes on API patterns:**
- Inconsistent authentication: some use Bearer tokens via getUserFromRequest(), others may rely on different patterns
- Admin routes properly protected with requireAdmin()
- Cron route has secret-based auth
- Many routes missing detailed inspection in this audit pass


## PART F — DATABASE AND INFRASTRUCTURE

### Database Schema
**Provider:** Supabase (Postgres)  
**Migrations:** 16 migration files (00000-00015)

**Key Tables (from migrations):**
- `profiles` - User profiles with wallet_balance, role, email_verified
- `orders` - Orders with extensive fields added over time (evolved schema)
- `email_verifications` - Custom verification tokens
- `wallet_transactions` - Transaction history
- `notifications` - User notifications
- `admin_*` tables (referenced)
- `fulfillment_logs` - Fulfillment tracking
- Storage bucket for avatars (migration 00014)

**Schema Evolution Concerns:**
- Orders table schema built incrementally across migrations 00003, 00005, 00008, 00009, 00012
- Columns added with IF NOT EXISTS (good for safety)
- Some columns like `order_id` backfilled (migration 00009)
- Schema is flexible but could have inconsistencies

### Row Level Security (RLS)
- Enabled on orders, email_verifications
- Policies allow users to view/insert/update own records
- Admins can view/update all orders
- email_verifications has policies for users to view/insert own records
- Service role key bypasses RLS (used in admin client) - expected

### Database Functions
- `debit_wallet(p_user_id, p_amount)` - Used for atomic wallet debits (F-009)
- `update_order_timestamp()` - Trigger for orders
- `sync_email_verified()` - Trigger to sync email confirmation
- Migration 00011 has `wallet_atomic_functions.sql`

### Migration Risks
- F-012: Incremental migrations could cause issues in fresh deployments
- Some migrations reference columns added in later migrations conceptually
- Need to ensure all migrations run in order

### Infrastructure
**Deployment:**
- Next.js 16 with App Router, output: "standalone" (next.config.ts)
- PM2 configured (ecosystem.config.js, janjez-socio.service)
- Nginx configs present
- Docker support (Dockerfile, docker-compose.yml)
- Deployed to EC2 (per deploy scripts)
- Vercel mentioned in README as alternative deployment

**Rate Limiting (F-007):**
- In-memory implementation using Map
- Resets on process restart
- Not shared across instances
- With PM2 cluster mode or multiple instances, each has separate limits
- On serverless (Vercel), each function instance has separate limits
- Critical issue for production scale

**Security Headers (middleware):**
- CSP, X-Content-Type-Options, Referrer-Policy, X-Frame-Options, Permissions-Policy, X-XSS-Protection, HSTS, COOP, CORP
- CSP is permissive (F-010)

**Static Assets:**
- Images use remotePatterns allowing all https hosts (wide open)
- Multiple icon/image files in root
- Standalone build should include necessary files


## PART G — TESTING EVIDENCE

### Commands Executed (Read-Only)
```bash
git -C /workspace/app log --oneline -5
git -C /workspace/app branch -a
find /workspace/app/src/app/api -name "route.ts" | wc -l && find ... | sort
grep -rn "signInWithOAuth\|Google\|google" /workspace/app/src
grep -rn "brevo\|Brevo" /workspace/app/src
find /workspace/app -name "*.test.*" -o -name "*.spec.*"
cat package.json, next.config.ts, src/middleware.ts
cat src/lib/supabase/*.ts
cat src/components/AuthContext.tsx
cat src/components/auth/*.tsx
cat src/app/auth/*/page*.tsx, src/app/auth/callback/route.ts
cat src/app/api/auth/*/route.ts
cat src/lib/email/*.ts
cat src/app/api/orders/route.ts
cat src/lib/server/*.ts
cat src/app/api/admin/orders/route.ts
cat src/lib/mpesa/client.ts
cat supabase/migrations/*.sql (key ones)
cat README.md, AUTH_SETUP.md, SECURITY.md, .env.example
```

### Tests Found
- `src/lib/smm/fulfillment.test.ts` exists
- `src/lib/server/validation.test.ts` exists  
- `src/lib/server/rate-limiter.test.ts` exists
- `src/lib/mpesa/client.test.ts` exists
- Vitest configured in package.json and vitest.config.mts

**Note:** Did not run tests (read-only audit; tests might have side effects or require env vars). Test files exist indicating some test coverage.

### Routes Inspected
- All 21 API routes identified and catalogued
- Auth routes fully inspected
- Orders API fully inspected
- Admin orders API inspected
- Middleware inspected

### Files Read
Extensive read-only inspection of auth system, API routes, email system, database migrations, configuration files.

### Checks Not Performed (Requiring External/Mutating Access)
- Live production endpoint testing (would require network calls; avoided to be safe)
- Database schema inspection against live Supabase (no credentials access)
- Actual email delivery testing (would require sending emails)
- M-Pesa payment flow testing (would trigger real/external flows)
- Google OAuth configuration verification in Supabase/Google Cloud
- ZeptoMail API key validation
- Running test suite (to avoid environment issues/mutations)
- TypeScript compilation check
- Build verification


## PART H — REMEDIATION ROADMAP

### P0: Security or Production-Critical Defects (Fix Immediately)

| Finding | Issue | Action | Priority | Notes |
|---|---|---|---|---|
| F-001 | Middleware fails hard in production if Supabase misconfigured | Add better error handling - redirect to maintenance page or return graceful error | P0 | Could cause total site outage |
| F-007 | In-memory rate limiting doesn't work at scale | Implement Redis/KV-based rate limiting before scaling to multiple instances | P0 | Critical for production security/stability |
| F-010 | Overly permissive CSP | Tighten CSP, remove unsafe-inline/unsafe-eval where possible, use nonces | P0 | Security hardening |
| F-003 | Listing all users to check existence | Query profiles table or use proper duplicate detection | P0 | Performance and potential issues |

### P1: Authentication and Critical User Journeys (Fix Soon)

| Finding | Issue | Action | Priority | Notes |
|---|---|---|---|---|
| F-002 | Google OAuth missing | Implement if required, or remove from user expectations/configure properly | P1 | Reported issue - needs clarification on requirement |
| F-006 | /services requires auth | Clarify business requirement - should browsing be public? | P1 | May block legitimate users |
| F-009 | Wallet debit flow needs verification | Ensure debit_wallet RPC is atomic with proper row locking | P1 | Financial transactions must be correct |
| Email verification flow | Test end-to-end | Verify token generation, storage, expiry, cleanup work correctly | P1 | Critical user journey |
| Password reset | Test flow | Verify Supabase password reset works with correct redirect URLs | P1 | Account recovery |

### P2: API and Integration Reliability (Fix Next)

| Finding | Issue | Action | Priority | Notes |
|---|---|---|---|---|
| F-004 | ZeptoMail errors not handled gracefully | Add better error handling, logging, fallbacks | P2 | Email delivery issues |
| M-Pesa callback | Security review needed | Verify callback signature/authentication if possible, add idempotency | P2 | Payment webhooks need protection |
| API auth patterns | Inconsistent | Standardize auth approach across APIs | P2 | Maintainability and security |
| Admin APIs | Review all endpoints | Ensure proper authorization on all admin routes | P2 | Already using requireAdmin() but worth reviewing |

### P3: Architecture, Performance and Maintainability (Planned)

| Finding | Issue | Action | Priority | Notes |
|---|---|---|---|---|
| F-005 | Incomplete user object in loadProfile | Fix to pass proper user or refactor | P3 | Code quality |
| F-014 | Dual signup methods | Consolidate to single flow | P3 | Reduce confusion |
| F-012 | Migration history | Document/apply properly, consider migration squashing if needed | P3 | Deployment safety |
| Schema evolution | Orders table complexity | Consider migration to cleaner schema if possible | P3 | Technical debt |

### P4: Minor UI and Technical Debt (Backlog)

| Finding | Issue | Action | Priority | Notes |
|---|---|---|---|---|
| F-008 | Using window.location.origin | Consider using NEXT_PUBLIC_SITE_URL | P4 | Minor issue |
| F-013 | Example env values | Use placeholders | P4 | Documentation |
| F-010 | CSP hardening | Long-term improvement | P4 | Defense in depth |
| Code cleanup | Remove unused code | Review and clean up | P4 | Maintainability |

### Recommended Correction Order
1. **Fix P0 security/stability issues** first (rate limiting, middleware, CSP basics)
2. **Address authentication flows** (especially if Google OAuth is actually needed - clarify requirement)
3. **Verify financial flows** (wallet, orders, M-Pesa)
4. **Harden email delivery** and external integrations
5. **Clean up architecture and technical debt**

### Dependencies
- Rate limiting (F-007): Needs infrastructure decision (Redis/KV provider)
- Google OAuth (F-002): Needs clarification from product owner on requirement
- ZeptoMail (F-004): Needs valid API keys for testing
- M-Pesa: Needs credentials for full testing
- All changes should be tested in staging before production

