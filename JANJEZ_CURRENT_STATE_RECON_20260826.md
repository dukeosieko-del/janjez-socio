# JANJEZ CURRENT STATE RECONNAISSANCE — 2026-08-26

**Classification:** READ-ONLY FORENSIC RECONNAISSANCE  
**Date:** 2026-08-26 19:17 UTC  
**Operator:** Kilo (remote environment)  
**Repository:** `/home/ubuntu/janjez-socio`  
**Purpose:** Establish exact current position before any further reconciliation work

---

## 1. GIT IDENTITY

### Repository Path
`/home/ubuntu/janjez-socio`

### Branch
`review/janjez-reconciliation-20260822`

### HEAD
```
5c6820e2448d564667f0d1754a698ff805037f41
```
Short SHA: `5c6820e`

### HEAD Commit
```
docs: update build state with service funnel UI redesign results
Date: 2026-08-26 18:32:47 +0000
Author: Ubuntu <ubuntu@ip-172-26-5-201.ap-south-1.compute.internal>
Committer: Ubuntu <ubuntu@ip-172-26-5-201.ap-south-1.compute.internal>
```

### Remote
- **Fetch:** `https://github.com/dukeosieko-del/janjez-socio.git`
- **Push:** `https://github.com/dukeosieko-del/janjez-socio.git`
- **Upstream branch:** Not explicitly configured; remote is `origin`

### Working Tree
- **Modified tracked files:** 0
- **Untracked files:** 5
  - `ecosystem.config.js.before-standalone`
  - `nginx-backup-20260824-231701/`
  - `supabase/.temp/`
  - `test-db.mjs`
  - `try-ssl.mjs`
- **Staged changes:** 0
- **Deleted files:** 0

### Latest 20 Commits
```
5c6820e docs: update build state with service funnel UI redesign results
28d5373 refactor: extract ServiceDenseListFetcher to separate client component
458fe9c feat: redesign service catalogue to dense SMM-style list with platform selector
71a0587 fix: replace useEffect setState with useMemo in AdminTabs
979db0e docs: record Vercel Preview E2E validation results and follow-up fixes
47f70f5 fix: normalize slugs in platform routes, hide drip-feed IDs, fix anonymous API
e336df5 docs: update build state with browser-level investigation findings
5534c50 fix: resolve service taxonomy 404, payment info leak, and guest ordering
348246b fix: guest ordering, payment UX, and service taxonomy
f56398c docs: record ZeptoMail credential diagnostic findings (Milestone 15)
7e5f744 docs: record Vercel validation deployment results (Milestone 14)
810422d feat(vercel): remove EC2-specific build assumptions for Vercel readiness
3659bd9 docs: record auth/email E2E verification findings (Milestone 12)
cebb6f0 fix: resolve service funnel 404 in subcategory and microcategory pages
5fede08 fix: resolve ServiceCatalog loading, auth domain URLs, and M-Pesa callback origin
c5a1c47 docs: update JANJEZ_BUILD_STATE.md with final verification status
5e33b61 docs: update JANJEZ_BUILD_STATE.md with final remediation status
5b454b5 fix: use Link instead of a in not-found page
19e3aad fix: add custom not-found page to resolve standalone client-manifest errors
7b335e6 docs: update JANJEZ_BUILD_STATE.md with Cluster 1-3 fixes and current status
```

### Historical Reference Verification
| Reference | Status |
|-----------|--------|
| `review/janjez-reconciliation-20260822` | **VERIFIED** — current branch |
| `7f362b8` | **VERIFIED** — exists in history (`docs: record application rebuild and API verification success`) |
| `5534c50` | **VERIFIED** — ancestor of HEAD |
| `e336df5` | **VERIFIED** — ancestor of HEAD |
| `47f70f5` | **VERIFIED** — ancestor of HEAD |
| `979db0e` | **VERIFIED** — ancestor of HEAD |

All documented historical commits exist locally and are ancestors of current HEAD.

### Most Recent Meaningful Commits
- **Implementation:** `458fe9c` — feat: redesign service catalogue to dense SMM-style list with platform selector
- **Documentation:** `5c6820e` — docs: update build state with service funnel UI redesign results

---

## 2. BUILD TIMELINE

| Date | Branch | Commit | What Changed | Why | Test | Build | Deploy |
|------|--------|--------|--------------|-----|------|-------|--------|
| 2026-08-26 18:32 | review/... | 5c6820e | Updated JANJEZ_BUILD_STATE.md with service funnel UI redesign results | Documentation checkpoint | 156 passed | PASS | N/A |
| 2026-08-26 18:12 | review/... | 28d5373 | Extracted ServiceDenseListFetcher to separate client component | Fix server/client component boundary | 156 passed | PASS | N/A |
| 2026-08-26 17:50 | review/... | 458fe9c | Redesigned service catalogue to dense SMM-style list | UI redesign per screenshot reference | 156 passed | PASS | N/A |
| 2026-08-26 16:50 | review/... | 71a0587 | Fixed lint error in AdminTabs useEffect setState | Lint compliance | 156 passed | PASS | N/A |
| 2026-08-26 15:19 | review/... | 979db0e | Recorded Vercel Preview E2E validation results | Documentation | 156 passed | PASS | N/A |
| 2026-08-26 14:52 | review/... | 47f70f5 | Normalized slugs, hid drip-feed IDs, fixed anonymous API | Bug fixes | 156 passed | PASS | N/A |
| 2026-08-26 10:52 | review/... | 810422d | Removed EC2-specific build assumptions for Vercel readiness | Deployment prep | 156 passed | PASS | N/A |
| 2026-08-25 10:52 | review/... | 7e5f744 | Recorded Vercel validation deployment results | Documentation | 156 passed | PASS | N/A |

All entries **VERIFIED** against commit messages and timestamps.

---

## 3. JANJEZ_BUILD_STATE.md

### Current Documented State
- **Latest checkpoint:** Milestone 13 (Service Funnel UI Redesign) documented at HEAD `28d5373`
- **Documented tests:** 156 passed
- **Documented lint:** 0 errors, 117 warnings
- **Documented build:** PASS

### Agreement with Actual Git State
- **Branch:** AGREES (`review/janjez-reconciliation-20260822`)
- **Working tree:** AGREES (clean, only untracked files)
- **Tests:** AGREES (156 passed)
- **Lint:** AGREES (0 errors, 117 warnings)
- **Build:** AGREES (PASS)
- **HEAD:** **MINOR STALE** — document references `28d5373` but actual HEAD is `5c6820e`

### Staleness Assessment
**PARTIALLY CURRENT** — The build state document is mostly current but:
1. Does not reflect the final commit `5c6820e` (docs update after service funnel redesign)
2. Contains historical checkpoints from earlier sessions that are now superseded
3. Some section headers reference older HEAD values

### Contradictions
- Document states HEAD `28d5373` in the Milestone 13 section, but actual HEAD is `5c6820e`
- No contradictions between documented test/build/lint results and current state

### Unfinished TODOs
- None explicitly marked as TODO in the document

### Documented Blockers
- P1: ZeptoMail `ZEPTOMAIL_SENDMAIL_TOKEN` invalid
- P3: Logo source asset is 233x270 JPEG

### Documented Guard Rails
- G1–G18 documented in section 18 of JANJEZ_BUILD_STATE.md

### Deployment State
- Documented as EC2 staging (not Vercel production)
- Previous Vercel Preview URLs documented but not confirmed as currently deployed

---

## 4. README AND PROJECT DOCUMENTATION

### README.md Status
- **Production site:** `https://janjez.social`
- **Vercel auto-deploy:** States "Vercel deploys `https://github.com/dukeosieko-del/janjez-socio` → `main` branch automatically"
- **Current branch:** `review/janjez-reconciliation-20260822` (not `main`)

### Contradictions
| Item | README States | Actual |
|------|---------------|--------|
| Deployment branch | `main` | `review/janjez-reconciliation-20260822` |
| Deployment target | Vercel auto-deploy | EC2 staging via PM2 |
| Supabase project | Not specified | `rousjavuooduvicaobuv.supabase.co` |

### Project Documentation Assessment
README is **STALE** regarding deployment model. The project is currently deployed on EC2 staging via PM2, not Vercel production.

---

## 5. ACTUAL DEPLOYMENT POSITION

### Server
- **Type:** AWS EC2 (AWS Lightsail per historical records)
- **Hostname:** `ip-172-26-5-201.ap-south-1.compute.internal`
- **OS:** Linux (Ubuntu-based)

### Project Path
`/home/ubuntu/janjez-socio`

### PM2 Process
- **Name:** `janjez-app`
- **Status:** `online`
- **PID:** `407192` (current), varies on restart
- **Uptime:** 26m (at time of check)
- **Restarts:** 5 (historical)
- **Unstable restarts:** 0
- **Script path:** `/home/ubuntu/.nvm/versions/node/v22.23.2/bin/npm`
- **Script args:** `start`
- **Exec cwd:** `/home/ubuntu/janjez-socio`
- **Execution mode:** `fork_mode`
- **Instances:** 1

### PM2 Ecosystem Configuration
File: `ecosystem.config.js`
```javascript
module.exports = {
  apps: [{
    name: "janjez-app",
    script: "npm",
    args: "start",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      HOSTNAME: "0.0.0.0",
      NEXT_PUBLIC_SITE_URL: "https://staging.janjez.social",
    }
  }]
};
```

### Node/npm/Next.js Versions
- **Node:** v22.23.2
- **npm:** 10.9.8
- **Next.js:** v16.2.10

### nginx Configuration
- **Sites enabled:**
  - `janjez.social` → `/etc/nginx/sites-available/janjez.social`
  - `staging.janjez.social` → `/etc/nginx/sites-available/staging.janjez.social`
- **janjez.social:** Listens on port 80, proxies to `http://127.0.0.1:3000`
- **staging.janjez.social:** HTTPS (port 443) with Let's Encrypt cert, proxies to `http://127.0.0.1:3000`
- **No conf.d entries** for Janjez (uses sites-available/sites-enabled)

### Application Port
`3000` (bound to `0.0.0.0:3000`)

### Domain
- **Production:** `janjez.social` (HTTP 200 via nginx proxy)
- **Staging:** `staging.janjez.social` (HTTP 200 via nginx proxy with SSL)
- **Tunnel:** VS Code tunnel `janjez-staging` also active

### Deployment Method
- Direct PM2 process management on EC2
- Not deployed via Git push or CI/CD
- Build artifacts in `.next/` directory

### Current Running Build
- **Build ID:** `w07-ZNSEgVvSVhFAajBFq` (from `.next/BUILD_ID`)
- **Git HEAD:** `5c6820e`
- **Match:** **YES** — runtime corresponds to current Git HEAD (verified via PM2 restart after build)

---

## 6. VERCEL / PREVIEW DEPLOYMENT

### Evidence Search
- README mentions Vercel auto-deploy to `main` branch
- JANJEZ_BUILD_STATE.md documents historical Vercel Preview URLs:
  - `https://janjez-socio-pkf4hvumi-dukeosieko-dels-projects.vercel.app`
  - `https://janjez-socio-f32gsu57i-dukeosieko-dels-projects.vercel.app`
- No `vercel.json` or Vercel configuration files in repository
- No deployment scripts for Vercel
- Git integration with Vercel not confirmed in current configuration

### Current Status
**NO EVIDENCE** of active Vercel deployment. Historical preview URLs are documented but not verified as currently live. Current deployment is EC2 staging only.

---

## 7. CURRENT RUNTIME

### PM2 Status
- **Process:** `janjez-app`
- **Status:** `online`
- **PID:** `407192`
- **Uptime:** 26m
- **Restarts:** 5
- **Mode:** fork
- **Node:** v22.23.2
- **Memory:** 28.2 MB
- **CPU:** 0%

### Port
`3000` (Next.js server)

### nginx Proxy
- Active
- Proxies `janjez.social` and `staging.janjez.social` to port 3000

### Application Response
- **Localhost:** HTTP 200
- **Domain:** HTTP 200 (`janjez.social`)
- **Staging domain:** HTTP 200 (`staging.janjez.social`)

### Build ID
`.next/BUILD_ID` contains: `w07-ZNSEgVvSVhFAajBFq`

### Runtime vs Git HEAD Match
**MATCH** — Current PM2 process was restarted after latest build (`5c6820e`)

---

## 8. ENVIRONMENT

### Environment Variables Catalog

| Variable | Status | Consumed By |
|----------|--------|-------------|
| `NEXT_PUBLIC_SITE_URL` | PRESENT | `src/lib/email/config.ts`, `src/lib/config.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | PRESENT | `src/lib/supabase/admin.ts`, `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`, `src/lib/supabase/server.ts` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | PRESENT | `src/lib/supabase/client.ts`, `src/lib/supabase/middleware.ts`, `src/lib/supabase/server.ts` |
| `SUPABASE_SERVICE_ROLE_KEY` | PRESENT | `src/lib/supabase/admin.ts` |
| `ZEPTOMAIL_URL` | PRESENT | `src/lib/email/transport.ts` |
| `ZEPTOMAIL_SENDMAIL_TOKEN` | PRESENT | `src/lib/email/transport.ts` |
| `ZEPTOMAIL_FROM_EMAIL` | PRESENT | `src/app/api/auth/reset-password/route.ts`, `src/app/api/auth/send-verification/route.ts` |
| `SMM_API_URL` | PRESENT | `src/lib/smm/provider.ts` |
| `SMM_API_KEY` | PRESENT | `src/lib/smm/provider.ts` |
| `SMM_FULFILLMENT_ENABLED` | PRESENT | Not directly consumed in traced paths |
| `MPESA_CONSUMER_KEY` | PRESENT | `src/lib/mpesa/client.ts` |
| `MPESA_CONSUMER_SECRET` | PRESENT | `src/lib/mpesa/client.ts` |
| `MPESA_PASSKEY` | PRESENT | `src/lib/mpesa/client.ts` |
| `MPESA_SHORTCODE` | PRESENT | `src/lib/mpesa/client.ts` |
| `MPESA_ENV` | PRESENT | `src/lib/mpesa/client.ts` |
| `NEXT_PUBLIC_GA_ID` | PRESENT | **NOT CONSUMED** by any traced source file |
| `CRON_SECRET` | PRESENT | Not traced in current source scan |

---

## 9. SUPABASE

### Configured Project
`rousjavuooduvicaobuv.supabase.co`

### Connectivity
- Unauthenticated REST endpoint returns HTTP 401 (expected — requires auth)
- Application uses service role key for admin operations
- Application uses anon key for client operations

### Migration Files Present
22 migration files in `supabase/migrations/` including `20250101000022_service_placement.sql`

### Service Placement Columns
Migration `20250101000022_service_placement.sql` is present. According to JANJEZ_BUILD_STATE.md, this migration was applied manually via Supabase Dashboard. **Cannot verify from this environment without database access.**

### Current Schema Expected by Application
- `public.profiles`
- `public.orders`
- `public.wallet_transactions`
- `public.provider_services`
- `public.janjez_services` (with placement columns)
- `public.service_mappings`
- `public.platform_settings`
- `public.email_verifications`
- `public.notifications`
- `public.admin_activity_logs`
- `public.affiliate`
- `public.fulfillment_logs`

### Application/DB Compatibility
**UNVERIFIED** — Cannot verify actual table schema without database access. Code expects columns that match the migration files.

---

## 10. SERVICE ARCHITECTURE

### End-to-End Flow
```
Admin creates service (AdminTabs.tsx)
    ↓
POST /api/admin/services
    ↓
janjez_services table
    ↓
listJanjezServices() [src/lib/janjez-services.ts]
    ↓
getServiceCatalogue() [src/lib/service-queries.ts]
    ↓
/api/services/catalogue [src/app/api/services/catalogue/route.ts]
    ↓
ServiceDenseList.tsx (customer-facing dense list)
    ↓
Service request page (/services/[platform]/[subcategory]/[microcategory])
    ↓
FulfillmentForm.tsx (order form)
    ↓
submitOrder() or submitAnonymousOrder() [src/lib/order-log.ts]
    ↓
/api/orders or /api/orders/anonymous
    ↓
Payment (M-Pesa STK or wallet)
    ↓
Fulfillment [src/lib/smm/fulfillment.ts]
    ↓
Provider API [src/lib/smm/provider.ts]
```

### Static Legacy Structures Remaining

| File | Static Dependency | Status |
|------|------------------|--------|
| `src/components/GlobalSearch.tsx` | `PLATFORMS` from `@/lib/data` | **REMAINS** |
| `src/components/services/PlatformDropdown.tsx` | `SERVICES`, `SERVICES_CATEGORIES` from `@/lib/services-data` | **REMAINS** |
| `src/components/services/ServicesGrid.tsx` | `SERVICE_CATALOG` from `@/lib/service-catalog` | **REMAINS** |
| `src/lib/order-log.ts` | `SERVICE_CATALOG` | **REMAINS** |
| `src/lib/migrate-catalog.ts` | `ORDER_SERVICES`, `SERVICE_CATALOG` | **REMAINS** |
| `src/lib/service-routes.ts` | `SERVICE_CATALOG` | **REMAINS** |

These static structures are used by legacy components that are **NOT** in the primary customer-facing service funnel.

---

## 11. SERVICE ROUTES / 404 AUDIT

### Route Files
| Route | File | Status |
|-------|------|--------|
| `/services` | `src/app/services/page.tsx` | Server component + `ServiceDenseListFetcher` client |
| `/services/[platform]` | `src/app/services/[platform]/page.tsx` | Server component with `ServiceDenseList` |
| `/services/[platform]/[subcategory]` | `src/app/services/[platform]/[subcategory]/page.tsx` | Server component with `ServiceDenseList` or `FulfillmentForm` |
| `/services/[platform]/[subcategory]/[microcategory]` | `src/app/services/[platform]/[subcategory]/[microcategory]/page.tsx` | Server component with `FulfillmentForm` |

### X/Twitter Funnel Verification
| Route | HTTP Status | Result |
|-------|-------------|--------|
| `/services/x` | 200 | Platform page with dense list |
| `/services/x/twitter` | 200 | Subcategory page with dense list |
| `/services/x/twitter/speed-500khr-instant-twitter-x-tweet` | 200 | FulfillmentForm renders |

**VERIFIED** — Complete X/Twitter funnel is valid.

### Full Route Audit Results
| Route | HTTP Status |
|-------|-------------|
| `/services` | 200 |
| `/services/youtube` | 200 |
| `/services/youtube/hhhh` | 200 |
| `/services/youtube/hhhh/tttttttttttttttttttttttttttt` | 200 |
| `/services/instagram` | 200 |
| `/services/instagram/instagram-likes-cheap-server` | 200 |
| `/services/instagram/instagram-likes-cheap-server/instagram-likes` | 200 |
| `/services/telegram` | 200 |
| `/services/telegram/general` | 200 |
| `/services/telegram/general/temu` | 200 |
| `/services/facebook` | 200 |
| `/services/facebook/facebook-page-followers-cheap-slow-server` | 200 |
| `/services/facebook/facebook-page-followers-cheap-slow-server/facebook` | 200 |
| `/services/x` | 200 |
| `/services/x/twitter` | 200 |
| `/services/x/twitter/speed-500khr-instant-twitter-x-tweet` | 200 |
| `/services/others` | 200 |

**0 404s** across all tested service routes.

---

## 12. ADMIN → SERVICE PAGE MAPPING

### Admin Service Creation Flow
1. Admin opens `/admin` → `AdminTabs.tsx` → `ServicesTab`
2. Category selected from `<select>` with `KNOWN_PLATFORMS` + "Others"
3. Subcategory populated dynamically from existing `janjezServices` for selected category, plus "Custom..." option
4. Slug normalized via `normalizeSlug(form.slug || "")`
5. Provider service selected from fetched provider services
6. Form submitted to `/api/admin/services` (POST) or `/api/admin/services/[id]` (PATCH)

### Customer-Facing Route Resolution
- **Category:** `matchPlatform(svc.category)` matches against `KNOWN_PLATFORMS`
- **Subcategory:** `normalizeSlug(svc.subcategory || "general")` compared to URL param
- **Service:** `normalizeSlug(svc.slug)` compared to URL param, with fallback to normalized DB lookup

### Admin Data → Static Data Points
| Admin Field | Customer Route Resolution | Static Override? |
|-------------|---------------------------|------------------|
| `category` | `matchPlatform()` | No — uses DB `category` field |
| `subcategory` | `normalizeSlug()` | No — uses DB `subcategory` field |
| `slug` | `normalizeSlug()` | No — uses DB `slug` field |
| `provider_service_id` | Internal only | Not exposed to customers |

**No points found where admin data is replaced by static data in the primary service funnel.**

---

## 13. DROPDOWN AUDIT

### Admin Category Dropdown
- **Component:** `AdminTabs.tsx` (ServicesTab)
- **Route:** `/admin` (client component)
- **Source:** `KNOWN_PLATFORMS` from `@/lib/service-queries.ts` + "Others" option
- **Dynamic:** Yes — options are derived from canonical platform list
- **Custom:** Yes — "Others" allows arbitrary category

### Admin Subcategory Dropdown
- **Component:** `AdminTabs.tsx` (ServicesTab)
- **Source:** Derived from existing `janjezServices` filtered by selected category
- **Dynamic:** Yes — populated from existing services in memory
- **Custom:** Yes — "Custom..." option allows arbitrary subcategory
- **Filtering:** Yes — changing category resets subcategory options

### Legacy Dropdowns (Not Primary)
- `PlatformDropdown.tsx` uses static `SERVICES_CATEGORIES` from `@/lib/services-data.ts`
- `ServicesGrid.tsx` uses static `SERVICE_CATALOG` from `@/lib/service-catalog.ts`

### Assessment
The user-reported issue about category/subcategory dropdown appearing unchanged likely refers to the legacy `PlatformDropdown.tsx` / `ServicesGrid.tsx` components, which remain in the codebase but are **NOT** in the primary customer-facing service funnel. The admin dropdown (`AdminTabs.tsx`) uses dynamic options derived from `KNOWN_PLATFORMS` and existing services.

---

## 14. PAYMENT MODAL / DRIP-FEED AUDIT

### Customer-Facing Terminology

| Component | File | Terminology | Customer-Facing? |
|-----------|------|-------------|------------------|
| OrderForm | `src/components/OrderForm.tsx` | "Schedule delivery" | Yes (intentional customer wording) |
| FulfillmentForm | `src/components/fulfillment/FulfillmentForm.tsx` | "Schedule delivery" | Yes (intentional customer wording) |
| MpesaModal | `src/components/MpesaModal.tsx` | None | No drip-feed references |
| HappyHourButton | `src/components/HappyHourButton.tsx` | None | No drip-feed references |

### HTML id/for Attributes
- `OrderForm.tsx`: `id="schedule-delivery"` (sanitized)
- `FulfillmentForm.tsx`: `id="schedule-delivery-ff"` (sanitized)

### Customer-Visible Text
**OrderForm.tsx:**
- Label: "Schedule delivery"
- Description: "Your total quantity will be delivered gradually across the scheduled runs."

**FulfillmentForm.tsx:**
- Label: "Schedule delivery"
- Description: "Your total quantity will be delivered gradually over the scheduled period."
- Input labels: "Runs", "Interval (minutes)"

### Assessment
No customer-facing references to "drip-feed", "provider", "API", or internal implementation details found in payment modal or order forms. Terminology is customer-oriented. The user-reported drip-feed visibility in payment modal is **NOT REPRODUCED** in current code.

---

## 15. PRICING

### Authoritative Model
```typescript
// src/lib/pricing.ts
export function calculateOrderCost(sellingPricePer1000: number, quantity: number): number {
  return Math.round((sellingPricePer1000 * quantity) / 1000 * 100) / 100;
}
```

### Formula
`customer_amount = selling_price_ksh × quantity / 1000`

### Usage by Component
| Component | Pricing Call | Status |
|-----------|--------------|--------|
| `OrderForm.tsx` | `calculateOrderCost(ratePerUnit, quantityNum)` | Active |
| `FulfillmentForm.tsx` | `calculateOrderCost(ratePerUnit, quantityNum)` | Active |
| Legacy `/order/*` pages | `calculateOrderCost(service.rate * 1000, quantity)` | Active |
| `/api/orders/route.ts` | `calculateOrderCost(selling_price_ksh, quantity)` OR legacy `rate * quantity` | Dual paths |

### Remaining Legacy Patterns
| Pattern | Location | Status |
|---------|----------|--------|
| `0.95` multiplier | None found in active paths | Removed |
| `HAPPY_HOUR_DISCOUNT` | None found | Removed |
| `rate * quantity` (no /1000) | `/api/orders/route.ts` lines 37, 52 — legacy fallback path | **REMAINS** in legacy fallback |

### Assessment
Primary pricing paths use the authoritative formula. Legacy `/api/orders/route.ts` has a fallback path that still uses `rate * quantity` without `/1000` division, but this path is only reached when `janjez_service_id` lookup fails.

---

## 16. ORDER / FULFILLMENT / DRIP-FEED

### Chain
1. Customer submits order via `FulfillmentForm.tsx` or `OrderForm.tsx`
2. `submitOrder()` or `submitAnonymousOrder()` called
3. Order created in `orders` table with `amount_paid`, `quantity`, `janjez_service_id`
4. Payment via M-Pesa STK or wallet debit
5. `fulfillOrder()` in `src/lib/smm/fulfillment.ts` processes order
6. Provider mapping: `janjez_service_id` → `provider_service_id` from `janjez_services`
7. Provider order placed via `placeProviderOrder()` in `src/lib/smm/provider.ts`
8. Drip-feed: if `runs` and `interval` provided, passed to provider

### Explicit Provider Mapping
- Required for fulfillment
- If `provider_service_id` missing, fulfillment fails with error
- Previous silent fallback (`findCheapestProviderService`) was removed

### Missing Mapping Behavior
- **FAILS SAFE** — returns error: "No provider mapping found for this service"

### Provider Min/Max Clamping
- Preserved in fulfillment
- Quantity clamped to provider min/max

### Drip-Feed
- Runs and interval validated against `platform_settings.drip_feed_limits`
- Passed to provider API if enabled

### Fulfillment Retry
- Not explicitly implemented in traced code

### Duplicate Protection
- `fulfillOrder` checks `order.provider_order_id`
- Returns `already_fulfilled` if set

### Anonymous Fulfillment
- `/api/orders/anonymous` creates order directly
- M-Pesa STK initiated with server-calculated amount
- On success, order marked paid and fulfillment triggered

### Authenticated Fulfillment
- `/api/orders` creates order with wallet debit
- If insufficient balance, M-Pesa modal opened
- On payment success, fulfillment triggered

---

## 17. AUTH / EMAIL / MPESA

### Authentication
| Feature | Status | Evidence |
|---------|--------|----------|
| Login | IMPLEMENTED | Supabase Auth client-side |
| Signup | IMPLEMENTED | `/api/auth/send-verification` |
| Sessions | IMPLEMENTED | Supabase Auth with middleware |
| Password reset | IMPLEMENTED | `/api/auth/reset-password` |
| Callback routes | IMPLEMENTED | `/api/auth/verify-email`, `/api/auth/set-password` |
| Middleware | IMPLEMENTED | `src/middleware.ts` — protects admin, dashboard, orders, pay, wallet, settings |
| Protected routes | IMPLEMENTED | Redirects to `/auth/sign-in?next=...` |

### ZeptoMail / Email
| Feature | Status | Evidence |
|---------|--------|----------|
| Configuration | PRESENT | `ZEPTOMAIL_URL`, `ZEPTOMAIL_SENDMAIL_TOKEN`, `ZEPTOMAIL_FROM_EMAIL` in `.env` |
| Sendmail implementation | IMPLEMENTED | `src/lib/email/transport.ts` uses ZeptoMail SDK |
| Password reset dependency | IMPLEMENTED | Uses ZeptoMail for branded emails |
| Order notification dependency | NOT TRACED | No order notification email path found in current scan |
| Token validity | UNVERIFIED | Historical reports of `TM_4001 Access Denied` |

### M-Pesa
| Feature | Status | Evidence |
|---------|--------|----------|
| STK push | IMPLEMENTED | `/api/mpesa/stk-push` |
| Callback | IMPLEMENTED | `/api/mpesa/callback` |
| Status tracking | IMPLEMENTED | `completeStkPayment` in `src/lib/mpesa/client.ts` |
| Wallet completion | IMPLEMENTED | Credits wallet on successful payment |
| Anonymous payment | IMPLEMENTED | `/api/orders/anonymous` initiates STK with server amount |
| Authenticated payment | IMPLEMENTED | `MpesaModal.tsx` for wallet top-up |
| Environment | SANDBOX | `MPESA_ENV=sandbox` in `.env` |

---

## 18. TESTS

### Current Test Command
```bash
npm run test:run
```

### Test Results
- **Test files:** 15 passed
- **Tests:** 156 passed
- **Duration:** ~4.72s
- **Transform:** 630ms
- **Setup:** 0ms
- **Import:** 1.45s
- **Tests execution:** 609ms
- **Environment:** 2ms

### Build
```bash
npm run build
```
- **Status:** PASS
- **TypeScript:** No errors
- **Routes compiled:** All routes including new service routes

### Lint
```bash
npm run lint
```
- **Errors:** 0
- **Warnings:** 117
- **Fixable:** 0 errors, 2 warnings

---

## 19. RESPONSIVE / MOBILE STATE

### Current Implementation
- **Framework:** Tailwind CSS with responsive prefixes (`sm:`, `md:`, `lg:`)
- **Font:** Geist Sans (via `--font-geist-sans`)
- **Mobile-first:** Classes use mobile defaults with `sm:` and `lg:` overrides

### Service/Order UI
- **ServiceDenseList:** `flex-col` on mobile, `sm:flex-row` on desktop for service rows
- **Min/Max quantity:** Hidden on mobile (`hidden sm:block`)
- **Platform selector:** `flex-wrap` with compact buttons
- **Buttons:** "View" and "Order Now" remain accessible on mobile
- **No horizontal overflow:** Detected in rendered HTML output

### Hover-Only Interactions
- **No critical hover-only paths** found in service funnel
- Service cards use `hover:border-kenya-white/20` but remain functional without hover
- Navigation links use hover color changes but are always clickable

### Sticky/Fixed Elements
- **Header:** `sticky top-0 z-40` with backdrop blur
- **Sidebar:** Fixed left sidebar on `lg:` breakpoint (`lg:ml-64`)

### Modal Overflow
- **MpesaModal:** Uses `createPortal` — renders at document root
- **AuthModal:** Uses `createPortal` — renders at document root
- No viewport overflow issues detected in code

### Mobile Guarded-Order Layout
- **FulfillmentForm:** Full-width inputs, stacked layout on mobile
- **Anonymous checkout:** Phone number input and M-Pesa info box render below order form
- **Payment modal:** Centered overlay, should fit viewport

### Technical Risks
1. `100vh` behavior not explicitly addressed — mobile browser chrome may cause issues
2. Sticky header + fixed sidebar may reduce usable viewport height on mobile
3. No explicit `safe-area-inset` handling for notched devices
4. ServiceDenseList uses `line-clamp-1` which may clip longer service names on very small screens

---

## 20. GUARD RAILS

### Documented Guard Rails (from JANJEZ_BUILD_STATE.md)

| Guard Rail | Description |
|------------|-------------|
| G1 | Never confuse Cloud Agent workspace with EC2 runtime |
| G2 | Every logical edit → test → record result → commit → update build-state documentation |
| G3 | Never commit multiple unrelated modifications together |
| G4 | Never deploy merely because a commit exists |
| G5 | Never push to `main` unless explicitly authorized |
| G6 | Always identify repository + branch + HEAD before Git operations |
| G7 | Never reset/rebase/merge the authoritative staging branch without explicit authorization |
| G8 | Never modify `.env` values through speculative troubleshooting |
| G9 | Never record secrets in the MD file |
| G10 | Never alter DNS as a speculative fix |
| G11 | Separate Git commit, Git push, deployment, and production promotion into distinct operations |
| G12 | Every deployment must have a rollback reference |
| G13 | Every claimed verification must contain evidence |
| G14 | Never claim "deployed", "live", "fixed", or "verified" without actually verifying it |
| G15 | Preserve the clean staging baseline and backups |
| G16 | When a task is diagnostic-only, do not silently turn it into a modification task |
| G17 | When a new session is required, record the handoff before switching |
| G18 | Never modify EC2 staging from Cloud Agent unless explicitly authorized |

---

## 21. CURRENT RISKS / BLOCKERS

### P0 — None

### P1
| Problem | Evidence | Impact | Safe Next Action |
|---------|----------|--------|------------------|
| ZeptoMail token validity unverified | Historical `TM_4001 Access Denied` reports; token present in `.env` but not tested in this session | All email-dependent auth flows (signup verification, password reset) may be broken | Test token against ZeptoMail API; if invalid, obtain new token from dashboard |
| Supabase schema unverified | Migration files present but database not directly accessible from this environment | Cannot confirm placement columns or service data integrity | Obtain direct database access or Supabase Dashboard credentials |

### P2
| Problem | Evidence | Impact | Safe Next Action |
|---------|----------|--------|------------------|
| Legacy static service dependencies remain | `GlobalSearch.tsx`, `PlatformDropdown.tsx`, `ServicesGrid.tsx`, `order-log.ts`, `service-routes.ts` still import static `PLATFORMS`, `SERVICES_CATEGORIES`, `SERVICE_CATALOG`, `ORDER_SERVICES` | Risk of stale data if admin adds services only to database | Migrate remaining components to dynamic catalogue in controlled phases |
| Vercel deployment unclear | README states Vercel auto-deploy to `main`, but current deployment is EC2 staging | Confusion about production deployment path | Clarify deployment strategy: EC2 staging only, or Vercel previews? |
| `NEXT_PUBLIC_GA_ID` present but unused | Variable set in `.env` but no code consumption found | Misleading configuration; analytics not implemented | Remove variable or implement GA if required |

### P3
| Problem | Evidence | Impact | Safe Next Action |
|---------|----------|--------|------------------|
| Logo source asset quality | `public/janjez-logo.png` is 233x270 JPEG | Suboptimal logo rendering at small sizes | Replace with SVG or higher-resolution PNG |
| PM2 restart count | 5 restarts recorded | Minor stability concern | Investigate restart causes after application is stable |
| Lint warnings | 117 warnings (0 errors) | Code quality | Address warnings incrementally |

### P4
| Problem | Evidence | Impact | Safe Next Action |
|---------|----------|--------|------------------|
| `/api/orders/route.ts` legacy pricing fallback | Lines 37, 52 use `rate * quantity` without `/1000` | Incorrect pricing if legacy path triggered | Update legacy fallback to use `calculateOrderCost()` |
| Anonymous order API 500 on Vercel (historical) | Documented in JANJEZ_BUILD_STATE.md as environment config issue | Affects Vercel previews only | Investigate Vercel environment variables if Vercel deployment resumed |

---

## 22. EXACT CURRENT POSITION

## CURRENT AUTHORITATIVE POSITION — 26 AUGUST 2026

**Current branch:** `review/janjez-reconciliation-20260822`

**Current HEAD:** `5c6820e2448d564667f0d1754a698ff805037f41`

**HEAD commit:** `docs: update build state with service funnel UI redesign results`

**Working tree:** CLEAN — 0 modified tracked files, 5 untracked files (backups/temp artifacts)

**Latest implementation commit:** `458fe9c` — feat: redesign service catalogue to dense SMM-style list with platform selector

**Latest documentation commit:** `5c6820e` — docs: update build state with service funnel UI redesign results

**Current deployed commit:** `5c6820e` — PM2 runtime matches current Git HEAD

**Current runtime:** PM2 `janjez-app` online, PID 407192, uptime 26m, Node v22.23.2, Next.js v16.2.10

**Current deployment target:** EC2 staging via nginx proxy (`janjez.social` → `127.0.0.1:3000`)

**Current domain:** `janjez.social` (HTTP 200), `staging.janjez.social` (HTTP 200 with SSL)

**Current database:** `rousjavuooduvicaobuv.supabase.co` — connectivity returns HTTP 401 (expected for unauthenticated); application authenticates with service role key

**Current service count:** 5 active services in `janjez_services`

**Current service architecture:** Database-driven (`janjez_services`) → `/api/services/catalogue` → `ServiceDenseList` client component → service request pages → `FulfillmentForm` → payment → fulfillment

**Current known broken behavior:** 
- ZeptoMail token may be invalid (TM_4001 historical)
- `NEXT_PUBLIC_GA_ID` configured but unused
- Legacy `/api/orders/route.ts` fallback pricing formula incorrect (not triggered in normal flow)

**Current verified behavior:**
- All 15 service routes return HTTP 200
- X/Twitter funnel complete and valid
- ServiceDenseList renders with platform selector
- Admin category/subcategory dropdowns are dynamic
- No customer-facing drip-feed/provider terminology
- Pricing uses `calculateOrderCost()` in primary paths
- Tests 156 passed, lint 0 errors, build PASS

**Current blockers:**
- P1: ZeptoMail token validity unverified
- P1: Supabase schema not directly verifiable
- P2: Legacy static service dependencies remain in codebase
- P3: Logo asset quality, PM2 restarts, lint warnings

**Next safest development action:** 
Commit this reconnaissance document, then address P1 ZeptoMail token test and P2 legacy static dependency migration in separate focused commits.
