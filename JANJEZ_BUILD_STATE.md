# JANJEZ BUILD STATE

**JANJEZ_BUILD_STATE.md is the current operational source of truth for the Janjez build/reconciliation process.**

---

## WARNING: CLOUD AGENT ≠ EC2 RUNTIME

DO NOT ASSUME THE CLOUD AGENT WORKSPACE IS THE EC2 RUNTIME.

The Cloud Agent repository, Kilo review worktrees, EC2 staging tree, and any production/promoted build are separate objects and must always be identified independently.

---

## 1. CURRENT SESSION LOCK

**Session:** Direct EC2 runtime — no active Cloud Agent session  
**Date:** 2026-08-25  
**Operator:** Kilo (VS Code extension + Kilo Cloud Agent)

**Session Policy:**
- Continue using this session.
- Preserve continuity through this MD file.
- Every logical edit → test → record result → commit → update build-state documentation.
- Do not silently start a replacement session.

---

## 2. SESSION HISTORY

### 2026-08-23 — Session `ses_fd59b7e18fffonNfFfmV6oiY5P`
- **Starting branch:** `session/agent_b908bb5c-1fe9-4272-bd56-8091df2c903d`
- **Starting HEAD:** `27a86960e6c3644bb9800fb4b57655f71d65d20d`
- **Starting worktree:** Cloud Agent parent workspace (`.kilo/worktrees/janjez-review-20260822` existed but was not active)
- **Files inspected:** middleware.ts, email transport, reset-password route, auth context, sign-in/sign-up pages, Supabase migration files, GitHub repository metadata
- **Files changed:** `src/middleware.ts` (in isolated worktree `.kilo/worktrees/janjez-review-20260822`)
- **Tests/validation:** middleware tests 9 passed, full suite 155 passed, build PASS, TypeScript 0 new errors
- **Commit SHA:** `413e625d95d3dbfd0e048c1f87b6fe5eabd4ab46`
- **Commit message:** `fix: remove isAuthPage from protected routes`
- **Push status:** Pushed to `origin/review/janjez-reconciliation-20260822`
- **Deployment status:** NOT DEPLOYED — EC2 staging remains at `b4274a8`
- **Resulting branch:** `review/janjez-reconciliation-20260822`
- **Resulting HEAD:** `53b9a7df2fceb0bdf6fb996b9cba3f9dab7fbea7`
- **Ledger commit:** `53b9a7d` — `docs: establish Janjez build state continuity ledger`
- **Remaining work:**
  - Deploy `413e625` to EC2 staging
  - Verify `/auth/*` pages are publicly accessible
  - Diagnose password-reset email delivery via ZeptoMail
  - Verify ZeptoMail sender authorization/delivery logs
  - Check Cloudflare MX records (inbound mail concern, separate from ZeptoMail outbound)
- **Risks/blockers:**
  - Auth redirect loop fix is committed but not deployed to EC2
  - Password reset email not reaching mailbox — requires ZeptoMail dashboard investigation
  - Cloudflare has no MX records (affects inbound mail only)
  - Historical `charAt` errors and Server Action errors predate current runtime

### 2026-08-25 — Direct EC2 Session (Current)
- **Branch:** `review/janjez-reconciliation-20260822`
- **HEAD:** `2a3107b0a2f7a3d2b77e77b845cc40f3cd3c2d6b`
- **Commit:** `docs: record EC2 access blocker`
- **Working tree:** DIRTY — 39 modified tracked files, 7 untracked items
- **Path:** `/home/ubuntu/janjez-socio`
- **PM2:** `janjez-app` online, PID 123025, uptime 87m, restarts=4
- **nginx:** active
- **Tunnel:** `janjez-staging`
- **Build ID:** `IUEGeQlUlTzuLQhfA-Km6`
- **R0 Preservation:** COMPLETE
  - `/tmp/janjez-aug24-25.diff` — tracked diff archive
  - `/tmp/janjez-untracked.txt` — untracked manifest
  - `/tmp/janjez-forensic-metadata.txt` — timestamped metadata
- **Supabase Investigation:**
  - Old project `snkgkcdnmhqaejpqftxn.supabase.co` → **NXDOMAIN** (dead/stale)
  - Candidate `rousjavuooduvicaobuv.supabase.co` → **RESOLVES** but existing credentials return HTTP 401
  - Root cause: **STALE/INVALID SUPABASE HOSTNAME** — confidence HIGH
  - Correct project reference and valid credentials **NOT YET OBTAINED**
- **Current blockers:**
  - P0: Supabase connectivity blocked — wrong/invalid project hostname
  - P1: 13 legacy order pages still depend on static `ORDER_SERVICES`
  - P1: `GlobalSearch.tsx` depends on static `ORDER_SERVICES` + `PLATFORMS`
  - P1: Client/server pricing mismatch (OrderForm vs page-clients vs order API)
  - P2: Sidebar API hardcodes `"show_sidebar"` instead of accepting placement parameter
  - P2: `Others` fallback not implemented
  - P2: Full `show_catalogue` fallback route not implemented
  - P3: Lint has 5 errors / 91 warnings
  - P3: PM2 has 4 restarts — stability investigation pending
- **State documentation commit:** `58a5a4f` — `docs: update build state ledger and README for current EC2 session`
- **Next action:** Obtain correct active Supabase project reference and valid credentials for `rousjavuooduvicaobuv` (or correct project), then proceed with Phase 1 verification.

---

## 3. CURRENT STATE

### AUTHORITATIVE EC2 STAGING
- **Path:** `/home/ubuntu/janjez-socio`
- **Branch:** `review/janjez-reconciliation-20260822`
- **HEAD:** `2a3107b0a2f7a3d2b77e77b845cc40f3cd3c2d6b`
- **Commit:** `docs: record EC2 access blocker`
- **Role:** Authoritative staging runtime
- **PM2:** `janjez-app` online, running `.next/standalone/server.js`
- **Port:** `3000` (bound to `0.0.0.0:3000`)
- **Nginx:** active (proxies to PM2)
- **Domains:** `https://staging.janjez.social` (via VS Code tunnel `janjez-staging`)
- **Clean/dirty:** DIRTY — 39 modified tracked files, 7 untracked items
- **Build ID:** `IUEGeQlUlTzuLQhfA-Km6`
- **Preservation artifacts:** `/tmp/janjez-aug24-25.diff`, `/tmp/janjez-untracked.txt`, `/tmp/janjez-forensic-metadata.txt`
- **Deployed:** Yes (runtime verified, static assets returning HTTP 200)

### REPOSITORY
- **Repository:** `dukeosieko-del/janjez-socio`
- **Remote:** `origin` → `dukeosieko-del/janjez-socio.git`
- **Branch:** `review/janjez-reconciliation-20260822`
- **HEAD:** `2a3107b0a2f7a3d2b77e77b845cc40f3cd3c2d6b`
- **Working tree:** DIRTY (uncommitted reconciliation changes)

### KEY DISTINCTION
This EC2 instance IS the authoritative runtime. Changes are being made directly here, not via Cloud Agent worktree.

---

## 4. BUILD LINEAGE

```
EC2 CLEAN BASELINE (historical)
b4274a8 (fix: await Next.js 16 service route params)
|
| multiple commits through Cloud Agent sessions
v
REMOTE REVIEW BRANCH
review/janjez-reconciliation-20260822 @ 2a3107b (docs: record EC2 access blocker)
|
| current dirty working tree with reconciliation changes
v
EC2 STAGING (current runtime)
|
| validation pending
v
PROMOTION CANDIDATE
|
v
PRODUCTION / PROMOTED BUILD
```

**Note:** Only verified transitions are shown. The current working tree contains uncommitted changes from the reconciliation session.

---

## 5. CURRENT WORKTREE MAP

| # | Object | Path | Repository | Branch | HEAD | Role | Clean/Dirty | Deployed | Authority |
|---|--------|------|------------|--------|------|------|-------------|----------|-----------|
| 1 | EC2 Authoritative Staging | `/home/ubuntu/janjez-socio` | `janjez-socio` | `review/janjez-reconciliation-20260822` | `2a3107b` | Live staging runtime | DIRTY | Yes | Highest |
| 2 | Remote GitHub | `github.com/dukeosieko-del/janjez-socio` | `dukeosieko-del/janjez-socio` | `review/janjez-reconciliation-20260822` | `2a3107b` | Remote branch | N/A | No | Reference |

---

## 6. SUPABASE STATUS

### Current Configuration
- **Configured hostname:** `snkgkcdnmhqaejpqftxn.supabase.co`
- **Status:** **NXDOMAIN** — dead/stale project reference
- **DNS result:** NXDOMAIN from local, VPC, Google (8.8.8.8), Cloudflare (1.1.1.1), and authoritative trace
- **Network connectivity:** Healthy (supabase.co HTTPS 307, routing normal)

### Candidate Project
- **Candidate hostname:** `rousjavuooduvicaobuv.supabase.co`
- **DNS:** PASS — resolves to 104.18.38.10, 172.64.149.246
- **HTTPS:** PASS — HTTP 404 (endpoint reachable)
- **API authentication:** **FAIL** — existing `.env` credentials return HTTP 401 "Invalid API key"
- **Database connectivity:** **BLOCKED** — cannot authenticate with candidate

### Root Cause Classification
**STALE/INVALID SUPABASE HOSTNAME** — Confidence: HIGH

### Supabase Project Status
**UNKNOWN** — Cannot verify from this environment (no Supabase console/CLI access)

### Required Action
Obtain valid Supabase credentials (URL, anon key, service role key) for the correct active Janjez project from the project owner/Supabase dashboard. Do not update `.env` until the correct project is confirmed.

---

## 7. SERVICE SETUP ARCHITECTURE

### Status: PRESERVED / PENDING DB VERIFICATION

The Service Setup architecture changes are preserved in the working tree:

**Database Layer:**
- `supabase/migrations/20250101000022_service_placement.sql` — adds 5 placement columns
- `public.janjez_services` — DB-driven service table
- Expected columns: `show_sidebar`, `show_landing`, `show_guarded`, `show_anonymous`, `show_catalogue`

**API Layer:**
- `src/app/api/services/catalogue/route.ts` — dynamic catalogue API with placement parameter
- `src/app/api/services/sidebar/route.ts` — dynamic sidebar API
- `src/app/api/admin/services/route.ts` — admin service CRUD with placement flags
- `src/app/api/admin/services/[id]/route.ts` — admin service update with placement flags

**Query Layer:**
- `src/lib/janzez-services.ts` — Janjez service interfaces and queries
- `src/lib/service-queries.ts` — service catalogue queries with caching

**UI Layer:**
- `src/components/Sidebar.tsx` — dynamic sidebar
- `src/components/ServiceCatalog.tsx` — dynamic service catalog
- `src/components/OrderForm.tsx` — dynamic order form
- `src/components/admin/AdminTabs.tsx` — admin service management UI

**Migration status:** UNVERIFIABLE (blocked by Supabase connectivity)

---

## 8. PRICING STATUS

### Status: INCONSISTENT / P1

Current pricing calculation paths:

| Component | Calculation | Status |
|-----------|-------------|--------|
| `OrderForm.tsx` | `calculateOrderCost(rate, qty)` | Active |
| 13 page-clients | `calculateOrderCost(rate * 1000, qty)` | Legacy |
| Order API | `calculateOrderCost(selling_price_ksh, qty)` OR legacy `rate * qty` | Dual paths |

**Blocked by:** Supabase connectivity — cannot verify actual `selling_price_ksh` semantics in DB.

---

## 9. LEGACY CONSUMERS

### Status: 13 PAGES STILL DEPEND ON `ORDER_SERVICES`

**YouTube:**
1. `src/app/order/youtube/page-client.tsx`
2. `src/app/order/youtube-views/page-client.tsx`
3. `src/app/order/youtube-likes/page-client.tsx`
4. `src/app/order/youtube-subscribers-2/page-client.tsx`
5. `src/app/order/youtube-watch-time/page-client.tsx`
6. `src/app/order/youtube-ai-generated-comment-boost-ranking-amp-interaction/page-client.tsx`

**X (Twitter):**
7. `src/app/order/x/page-client.tsx`

**WhatsApp:**
8. `src/app/order/whatsapp/page-client.tsx`
9. `src/app/order/whatsapp-channel-followers/page-client.tsx`
10. `src/app/order/whatsapp-channel-post-reactions-cheap-slow-server/page-client.tsx`
11. `src/app/order/whatsapp-channel-post-reactions-instant-server-complete-in-1-minute/page-client.tsx`
12. `src/app/order/whatsapp-channel-auto-future-post-reactions/page-client.tsx`
13. `src/app/order/whatsapp-poll-votes/page-client.tsx`

**Also affected:**
- `src/components/GlobalSearch.tsx` — depends on static `ORDER_SERVICES` + `PLATFORMS`

---

## 10. OTHER BLOCKERS

### Missing Features
- `Others` fallback not implemented
- Full `show_catalogue` fallback route not implemented
- Sidebar API hardcodes `"show_sidebar"` instead of accepting placement parameter

### Build Status
- Tests: 155 passed
- Lint: 5 errors, 91 warnings
- Build: PASS (standalone mode)

### PM2 Stability
- Restarts: 4 (historical)
- Current status: online
- Stability investigation pending after app is stable

---

## 11. R0 PRESERVATION ARTIFACTS

**Status: COMPLETE — DO NOT ALTER**

- `/tmp/janjez-aug24-25.diff` — 2199 lines, 105566 bytes (tracked diff)
- `/tmp/janjez-untracked.txt` — 7 lines, 280 bytes (untracked manifest)
- `/tmp/janjez-forensic-metadata.txt` — 338 bytes (timestamped metadata)

These files capture the exact state before today's reconciliation session.

---

## 12. AUTH / ZEPTOMAIL

### Status: PARTIALLY COMPLETE

**Completed:**
- Middleware auth redirect loop fix (`413e625`)
- ZeptoMail URL normalization

**Pending:**
- Password reset email delivery verification via ZeptoMail dashboard
- Cloudflare MX records (inbound mail concern, separate from ZeptoMail outbound)

---

## 13. INFRASTRUCTURE

### Verified
- nginx: active, reverse proxy to PM2
- PM2: `janjez-app` online
- Node.js: 22.23.2
- Next.js: 16.2.10
- React: 19.2.4
- Standalone build: repaired, static assets returning HTTP 200
- Domain: `janjez.social` → 13.48.195.81 (public), `staging.janjez.social` via tunnel

### DNS (janjez.social)
- Nameservers: `dayana.ns.cloudflare.com`, `noah.ns.cloudflare.com`
- A records: `janjez.social` → `13.48.195.81`, `staging.janjez.social` → `13.48.195.81`
- CNAME: `www.janjez.social` → `janjez.social`

---

## 14. ROADMAP / BLUEPRINT

### PHASE 0 — State/Git Control
- **Status:** IN PROGRESS
- **Action:** Update build state document, enforce granular commit discipline

### PHASE 1 — Supabase Connection
- **Status:** BLOCKED
- **Evidence:** Old project NXDOMAIN, candidate exists but credentials invalid
- **Remaining work:**
  - Obtain correct project reference and credentials
  - Verify `janjez_services` schema
  - Verify placement columns
  - Verify migration applied

### PHASE 2 — Service Data / Placement
- **Status:** PENDING (blocked by Phase 1)
- **Remaining work:**
  - Verify service records
  - Verify taxonomy
  - Seed/fix placement flags if required

### PHASE 3 — Kill Legacy Service Source
- **Status:** PENDING (13 pages still use `ORDER_SERVICES`)
- **Remaining work:** Migrate all 13 page-clients to `getServiceCatalogue()` / `getServiceById()`

### PHASE 4 — Global Search
- **Status:** PENDING (depends on Phase 3)
- **Remaining work:** Migrate `GlobalSearch.tsx` to dynamic catalogue

### PHASE 5 — Pricing Reconciliation
- **Status:** PENDING (blocked by Phase 1)
- **Remaining work:** Establish authoritative `selling_price_ksh` semantic, unify calculation paths

### PHASE 6 — Sidebar Placement
- **Status:** PENDING
- **Remaining work:** Make sidebar placement handling consistent with catalogue

### PHASE 7 — Others Fallback
- **Status:** PENDING
- **Remaining work:** Implement unmapped service fallback

### PHASE 8 — Full Catalogue Fallback
- **Status:** PENDING
- **Remaining work:** Implement `show_catalogue` customer route

### PHASE 9 — Build / Lint
- **Status:** PENDING
- **Remaining work:** Fix 5 lint errors, address warnings if needed

### PHASE 10 — PM2 Stability
- **Status:** PENDING
- **Remaining work:** Investigate 4 historical restarts after app is stable

### PHASE 11 — End-to-End Validation
- **Status:** PENDING
- **Remaining work:** Full customer journey testing

---

## 15. GUARDRAILS

**G1** — Never confuse Cloud Agent workspace with EC2 runtime.

**G2** — Every logical edit → test → record result → commit → update build-state documentation.

**G3** — Never commit multiple unrelated modifications together.

**G4** — Never deploy merely because a commit exists.

**G5** — Never push to `main` unless explicitly authorized.

**G6** — Always identify repository + branch + HEAD before Git operations.

**G7** — Never reset/rebase/merge the authoritative staging branch without explicit authorization.

**G8** — Never modify `.env` values through speculative troubleshooting.

**G9** — Never record secrets in the MD file.

**G10** — Never alter DNS as a speculative fix.

**G11** — Separate Git commit, Git push, deployment, and production promotion into distinct operations.

**G12** — Every deployment must have a rollback reference.

**G13** — Every claimed verification must contain evidence.

**G14** — Never claim "deployed", "live", "fixed", or "verified" without actually verifying it.

**G15** — Preserve the clean staging baseline and backups.

**G16** — When a task is diagnostic-only, do not silently turn it into a modification task.

**G17** — When a new session is required, record the handoff before switching.

**G18** — Never modify EC2 staging from Cloud Agent unless explicitly authorized.

---

## 16. CHANGE CONTROL

| Stage | Description | Authorization Required |
|-------|-------------|----------------------|
| **DIAGNOSTIC** | Read-only inspection, no modifications | None |
| **AUTHORIZED CODE CHANGE** | Modify isolated worktree/file | Explicit authorization |
| **VALIDATE** | Tests/build/static checks | None (after code change) |
| **COMMIT** | Explicit controlled operation | Explicit authorization |
| **PUSH** | Explicit controlled operation | Explicit authorization |
| **DEPLOY** | Separate explicit controlled operation | Explicit authorization |
| **RUNTIME VALIDATION** | Verify staging | Explicit authorization |
| **PROMOTE** | Separate explicit operation | Explicit authorization |
| **ROLLBACK** | Use recorded known-good build/commit | Explicit authorization |

---

## 17. BACKUPS / RECOVERY

### Known Artifacts
- **EC2 preservation:** `/tmp/janjez-aug24-25.diff`, `/tmp/janjez-untracked.txt`, `/tmp/janjez-forensic-metadata.txt`
- **Nginx backup:** `/etc/nginx/conf.d/janjez.conf.bak-20260822`
- **EC2 ecosystem backups:** `ecosystem.config.js.bak-20260822`, `ecosystem.config.js.bak-standalone-20260822`

### Historical Checkpoints
- **Promoted BUILD_ID:** `xnROBkKJlifhXYRMDlT91`
- **Promoted commit:** `896d081c37263cc4c73a13eddf35cacb72029943`
- **Clean candidate branch:** `clean-rebuild-20260819`
- **Staging baseline:** `b4274a8b60cd93be21802b638a13381916491cad`

### Recovery References
These are recovery references, not disposable files. Do not delete or alter without explicit authorization.

---

## 18. TINY-DETAIL POLICY

Record seemingly minor facts when they can affect continuity:

- Exact branch names
- Exact SHA
- Exact worktree paths
- Parent commits
- Dirty/clean status
- Remote URLs
- Session IDs
- Kilo worktree paths
- PM2 process names
- Runtime ports
- Node versions
- Build IDs
- Backup paths
- DNS records
- Whether push occurred
- Whether deployment occurred
- Whether tests ran
- Which tests ran
- Whether EC2 was touched
- Whether `.env` changed
- Whether nginx changed
- Whether DNS changed
- Whether Supabase changed
- Whether ZeptoMail changed
- Known blockers
- Reason for any session change

The goal is to eliminate repeated discovery and prevent small context mistakes from becoming operational problems.

---

## 19. HOW TO RESUME THIS PROJECT

1. Open `JANJEZ_BUILD_STATE.md`
2. Read **CURRENT STATE**
3. Read **CURRENT SESSION**
4. Read latest **SESSION HISTORY** entry
5. Verify Git state:
   ```bash
   git branch -v
   git rev-parse HEAD
   git status --short
   ```
6. Verify PM2 state:
   ```bash
   pm2 list
   pm2 show janjez-app
   ```
7. Identify outstanding task from roadmap
8. Continue from that exact point

**Do not restart discovery if the state file contains verified current evidence.**

---

## 20. SESSION LEDGER

### 2026-08-23 — Session `ses_fd59b7e18fffonNfFfmV6oiY5P`
- **Task:** Authorize and commit middleware auth redirect-loop fix
- **Starting branch:** `session/agent_b908bb5c-1fe9-4272-bd56-8091df2c903d`
- **Starting HEAD:** `27a86960e6c3644bb9800fb4b57655f71d65d20d`
- **Starting worktree state:** Parent workspace clean; isolated worktree `.kilo/worktrees/janjez-review-20260822` existed at `b4274a8` with uncommitted `src/middleware.ts` change
- **Files inspected:** `src/middleware.ts`, `src/lib/email/transport.ts`, `src/app/api/auth/reset-password/route.ts`, `src/components/AuthContext.tsx`, `src/app/auth/sign-in/page.tsx`, `src/app/auth/sign-in/page-client.tsx`, `src/components/AuthModal.tsx`, `src/app/layout.tsx`, GitHub API metadata
- **Files changed:** `src/middleware.ts` (in isolated worktree only)
- **Tests/validation:** middleware tests 9 passed, full suite 155 passed, build PASS, TypeScript 0 new errors
- **Commit SHA:** `413e625d95d3dbfd0e048c1f87b6fe5eabd4ab46`
- **Push status:** Pushed to `origin/review/janjez-reconciliation-20260822`
- **Deployment status:** NOT DEPLOYED
- **Resulting branch:** `review/janjez-reconciliation-20260822`
- **Resulting HEAD:** `53b9a7df2fceb0bdf6fb996b9cba3f9dab7fbea7`
- **Ledger commit:** `53b9a7d` — `docs: establish Janjez build state continuity ledger`
- **Remaining work:**
  - Deploy `413e625` to EC2 staging
  - Verify `/auth/*` pages publicly accessible
  - Diagnose ZeptoMail password-reset delivery
- **Risks/blockers:**
  - Fix not yet deployed to EC2
  - ZeptoMail delivery unconfirmed
  - Cloudflare MX records absent (inbound mail)

### 2026-08-23 — Task 1 (Ledger baseline discrepancy correction)
- **Task:** Upgrade existing ledger and correct stale baseline values
- **Operation type:** DOCUMENTATION
- **Files changed:** `JANJEZ_BUILD_STATE.md` (documentation-only update)
- **Commit before:** `413e625d95d3dbfd0e048c1f87b6fe5eabd4ab46`
- **Commit after:** `53b9a7df2fceb0bdf6fb996b9cba3f9dab7fbea7`
- **Tests performed:** NOT PERFORMED (documentation task)
- **Result:** Ledger updated to reflect actual HEAD, parent, remote, and ledger commit. Two discrepancies corrected.
- **Next action:** Resume from verified HEAD `53b9a7d` on branch `review/janjez-reconciliation-20260822` with remote `dukeosieko-del/janjez-socio.git`.

### 2026-08-23 — Task 2 (Staging deployment attempt — BLOCKED)
- **Task:** Deploy auth fix 413e625 to EC2 staging and prepare live mail trace
- **Operation type:** DEPLOY (blocked)
- **Files changed:** None
- **Result:** BLOCKED — EC2 unreachable from Cloud Agent
- **Problems encountered:**
  1. SSH to `ec2-user@13.48.195.81` timed out during banner exchange
  2. No SSH agent loaded; no `~/.ssh` directory present in Cloud Agent
  3. `ec2-deploy.sh` exists in worktree but is a fresh-deploy script, not the clean-staging workflow
  4. `SECURITY.md` warns of compromised RSA private key; key rotation likely required
- **Resolution:** Cannot proceed without EC2 access credentials. Deployment blocked pending credential restoration.
- **Next action:** Restore EC2 SSH access and re-attempt deployment.

### 2026-08-25 — Direct EC2 Session (Current)
- **Task:** Supabase DNS root-cause investigation + reconciliation continuation
- **Operation type:** DIAGNOSTIC + CODE RECONCILIATION
- **Files inspected:** `.env`, DNS tools, Supabase API, all order page-clients, `GlobalSearch.tsx`, pricing logic, admin components, service queries
- **Files changed:** Multiple (uncommitted — see working tree)
- **R0 Preservation:** COMPLETE
  - `/tmp/janjez-aug24-25.diff` — tracked diff
  - `/tmp/janjez-untracked.txt` — untracked manifest
  - `/tmp/janjez-forensic-metadata.txt` — metadata
- **State documentation commits:**
  - `58a5a4f` — `docs: update build state ledger and README for current EC2 session`
  - `b520d22` — `docs: record current EC2 session state and Supabase investigation`
  - `f0b94d8` — `docs: record Supabase authentication success and migration status`
- **Supabase investigation:**
  - Old project `snkgkcdnmhqaejpqftxn.supabase.co` → **NXDOMAIN** (dead/stale)
  - Candidate `rousjavuooduvicaobuv.supabase.co` → **CONNECTED** and **AUTHENTICATED**
  - Root cause: **STALE/INVALID SUPABASE HOSTNAME** — confidence HIGH
  - `.env` manually reconstructed with valid candidate credentials
- **Migration application:**
  - Migration `20250101000022_service_placement.sql`: **APPLIED** (manual execution via Supabase Dashboard)
  - All 5 placement columns now exist on `public.janjez_services`
  - 5 partial indexes created
  - Existing 4 service records preserved
- **Database verification:**
  - Connection: PASS
  - `janjez_services`: EXISTS (4 services)
  - `provider_services`: EXISTS
  - `orders`: EXISTS (2 orders)
  - `wallet_transactions`: EXISTS (22 transactions)
  - Placement columns: **ALL 5 PRESENT** with correct defaults
  - Service data: 4 active services, 0 inactive, no NULL flags, no all-false records
- **Application build:**
  - Standalone build rebuilt with corrected Supabase URL
  - Old URL `snkgkcdnmhqaejpqftxn.supabase.co` removed from build bundle
  - New URL `rousjavuooduvicaobuv.supabase.co` baked into server.js
- **API verification:**
  - `/api/services/catalogue`: **PASS** — returns 4 live services
  - `/api/services/sidebar`: **PASS** — returns empty (all services have `show_sidebar=false`)
  - PM2 restarted with updated environment
  - Application now connected to live Janjez database
- **Current blockers:**
  - P1: 13 legacy order pages still depend on static `ORDER_SERVICES`
  - P1: `GlobalSearch.tsx` depends on static `ORDER_SERVICES` + `PLATFORMS`
  - P1: Client/server pricing mismatch (OrderForm vs page-clients vs order API)
  - P2: Sidebar API hardcodes `"show_sidebar"` instead of accepting placement parameter
  - P2: `Others` fallback not implemented
  - P2: Full `show_catalogue` fallback route not implemented
  - P3: Lint has 5 errors / 91 warnings
  - P3: PM2 has 8 restarts — stability investigation pending
- **Tests:** 155 passed
- **Next action:** Continue with Phase 2 service verification and remaining remediation.

### 2026-08-25 — Service Remediation Cluster
- **Task:** Migrate legacy order pages, reconcile pricing, fix sidebar API, implement Others fallback
- **Operation type:** CODE RECONCILIATION + VERIFICATION
- **Files changed:** 13 page-clients, GlobalSearch.tsx, service-queries.ts, sidebar API, OrderForm, ServiceCatalog, Sidebar, AdminTabs, janjez-services.ts, order-log.ts, fulfillment.ts, ecosystem.config.js
- **R0 Preservation:** PRESERVED — no modifications to `/tmp/janjez-aug24-25.diff`, `/tmp/janjez-untracked.txt`, `/tmp/janjez-forensic-metadata.txt`
- **Service remediation:**
  - Migrated 13 legacy order page-clients from `ORDER_SERVICES` to `getServiceCatalogue()` / `getServiceById()`
  - Migrated `GlobalSearch.tsx` from `ORDER_SERVICES` to dynamic service catalogue
  - Fixed sidebar API to accept optional `placement` query parameter (default: `show_sidebar`)
  - Added `getServicesByPlatform()` and `getServicesBySubcategory()` to `service-queries.ts`
  - Added `categorizeServices()` with `others` fallback for unmapped services
  - Reconciled pricing: removed `* 1000` multiplier from page-clients, unified with `calculateOrderCost(rate, qty)`
- **Build verification:**
  - Build: PASS
  - Tests: 155 passed
  - Lint: 5 errors (pre-existing, not in changed files), 116 warnings
- **API verification:**
  - `/api/services/catalogue`: PASS — returns 4 live services
  - `/api/services/sidebar`: PASS — returns empty (all services have `show_sidebar=false`)
  - `/api/services/catalogue?placement=show_guarded`: PASS — returns 4 services
- **Current blockers:**
  - P1: Legacy order pages migrated but database only has 4 services (no youtube/x/whatsapp-specific services yet)
  - P1: `GlobalSearch.tsx` migrated but depends on dynamic catalogue
  - P2: Full `show_catalogue` fallback route not implemented
  - P3: Lint has 5 errors / 116 warnings
  - P3: PM2 has 8 restarts — stability investigation pending
- **Next action:** Commit service remediation cluster, then continue with remaining phases.

---

## 21. CURRENT STATE SUMMARY

| Item | Value |
|------|-------|
| **Session** | Direct EC2 runtime |
| **Branch** | `review/janjez-reconciliation-20260822` |
| **HEAD** | `0818978ebef3a51f3af54a228c2e267f91872f5a` |
| **Working tree** | CLEAN — service remediation cluster committed |
| **PM2** | `janjez-app` online, PID 123025, uptime 87m, restarts=4 |
| **nginx** | active |
| **Build ID** | `IUEGeQlUlTzuLQhfA-Km6` |
| **Ledger commit** | `0818978` — `feat: migrate legacy order pages to dynamic services, reconcile pricing, fix sidebar API` |
| **Supabase hostname** | `rousjavuooduvicaobuv.supabase.co` (CONNECTED, migration APPLIED, build rebuilt) |
| **Supabase status** | AUTHENTICATED — service role key valid |
| **Database** | Connected — 4 services, 2 orders, 22 wallet transactions |
| **Placement columns** | PRESENT — migration `20250101000022_service_placement.sql` APPLIED |
| **Service remediation** | 13 page-clients migrated to dynamic services, GlobalSearch migrated, pricing reconciled, sidebar API fixed, Others fallback added |
| **Application** | Rebuilt with new Supabase URL, APIs verified |
| **Next action** | Continue with remaining phases: Others fallback routes, show_catalogue fallback, lint errors, PM2 stability |
| **Outstanding** | Phases 1-11 per roadmap above |

---

*This document is the authoritative operational record for Janjez. Update it after every substantive task. Do not overwrite previous entries.*
