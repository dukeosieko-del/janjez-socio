# DIRECTION ORDER — JANJEZ-SOCIO RECOVERY REPAIR & BUILD

**Order ID:** KS-2026-1021-01
**Issued:** 2026-10-21T06:36Z
**Issuer:** Kilo (recovery verification session `ses_ea9a86f13ffdyWNci8INKgfv0S`)
**Executor:** the agent that receives this order
**Objective:** Bring the Janjez build to a **verified, buildable, test-clean state on the recovered candidate lineage**, with every known P0/P1 defect reproduced, repaired, covered by tests, and evidenced — without deploying, without touching the authoritative runtime, and without fabricating verification.

**This order is executable as written. Every step names a command, a file, and a pass criterion. Where a step is blocked by missing access, the executor must stop at that gate and report — not proceed by assumption.**

---

## §0 AUTHORITY, SCOPE, AND MODE

**0.1 Repair baseline (mandatory).** All repairs execute on the **candidate lineage**, commit `896d081c37263cc4c73a13eddf35cacb72029943` ("fix(P0-1,P0-2): anonymous order service resolution + Next.js 16 dynamic params", authored 2026-08-20 19:34:01 UTC by `EC2 Default User <ec2-user@ip-172-31-43-29.eu-north-1.compute.internal>`), reachable as `origin/recovery/checkpoint-ec2-head-20261020` and `origin/kilo-recovery-clean-20260822`.
**Do NOT repair on `origin/main` (`339242d8`).** The main lineage has **no anonymous-order route, no happy-hour route, no reset/set-password routes, no `janjez_services` catalog tables (migrations 00016–00021), and no test files**. Porting the candidate onto main is a separate, later, separately-authorized project (§6.3) — not part of this order.

**0.2 Two-lineage map (verified — see §9 Appendix A).**
| Lineage | SHA | Content | Tests | Migrations |
|---|---|---|---|---|
| **L2 candidate (repair target)** | `896d081` | 35 added / 36 modified / 1 deleted vs main | 11 test files | `20250101000000`–`20250101000021` (22) |
| **L1 main (do not repair)** | `339242d8` | 5,212 catalogue-era code, no guest flow | 0 | `…00000`–`…00015` (16) |

**0.3 Scope — IN:** code repair, test authoring, migration authoring (files only), build/lint/typecheck/test validation, ledger documentation, evidence capture.
**0.4 Scope — OUT (never, under this order):** deploying, restarting PM2/nginx, touching the Lightsail host, changing DNS, applying migrations to any database, editing `.env`/secrets, pushing to `main`, promoting to production, or declaring anything "live/verified/deployed" without direct observation (ledger guardrail G14).

**0.5 Execution mode selection.**
- **MODE A (full)** — the executor has a verified shell on the recovered Lightsail host (`/home/ec2-user/janjez-socio`, and the clean candidate worktree `/home/ec2-user/janjez-socio-clean`). Execute §3–§8 including §7 runtime validation.
- **MODE B (degraded, default if access is not proven)** — execute in an **isolated local worktree** at `896d081`, complete every code-level work item (§3–§6) and produce a complete evidence pack, then **STOP before §5.2 (DB application), §6 (push), and §7 (deploy/runtime validation)**, and file the blocker report per §8.3.
- **Mode is chosen by the executor's own Phase 0 identification, not by assumption.** A tunnel URL that returns HTTP 200 is **not** proof of host access (see §9.1).

---

## §1 GROUND TRUTH (verified 2026-10-21; do not re-derive, do not contradict without new evidence)

**1.1 Hosts.**
| Public IP | PTR | Role | State |
|---|---|---|---|
| `13.48.195.81` | `ec2-13-48-195-81.eu-north-1.compute.amazonaws.com` | **recovered/clean-candidate Lightsail** (user `ec2-user`) | SSH 22 timed out; no HTTP/HTTPS response; port 3000 closed |
| `3.7.231.161` | `ec2-3-7-231-161.ap-south-1.compute.amazonaws.com` | **old staging host** (user `ubuntu`, `/home/ubuntu/janjez-socio`) | DNS target of `janjez.social`; Cloudflare **522** (origin unreachable) |

**1.2 Surfaces.** `https://janjez.social` → **522**. `https://www.janjez.social` → **522**. `https://staging.janjez.social` → **Cloudflare 1016** (tunnel hostname present, tunnel not connected) + public DNS **NXDOMAIN**. `https://vscode.dev/tunnel/janjez-recovery` → **200 but a static VS Code Web shell** (the tunnel name never appears in the body; an invented tunnel name returns the same 200) → **no liveness signal**. Vercel surfaces (`janjez-socio.vercel.app`, `janjez-socio-ihx7kba5t-dukeosieko-dels-projects.vercel.app`) → **200** (not the authoritative staging).

**1.3 Recovered audit state (source of truth for intended scope).** `git show origin/review/janjez-reconciliation-20260822:JANJEZ_BUILD_STATE.md` — guardrails G1–G18, change-control table, historical checkpoints (promoted commit `896d081`, clean candidate branch `clean-rebuild-20260819`, staging baseline `b4274a8`), final state (PM2 `janjez-app` on `:3000`, tests 156, lint 0 errors, build PASS), **remaining blockers** (P0 `pending_mpesa` migration; P1 DripFeed balance $0; P1 ZeptoMail token invalid; P2 10 legacy published services) and next actions. Also `JANJEZ_CURRENT_STATE_RECON_20260826.md` (forensic recon of the old host) and `docs/A8-CONSISTENCY-AUDIT.md` (on `origin/feature/a7-api-keys`, 2026-09-24, with `audit.mjs` — verdict **NOT READY for deployment**).

**1.4 Note the ledger's path/tunnel discrepancy (do not "correct" it silently).** The Aug-2026 ledger documents the **old** host (`/home/ubuntu/janjez-socio`, tunnel `janjez-staging`); the order's target is the **new** eu-north-1 host (`/home/ec2-user/janjez-socio[-clean]`, tunnel `janjez-recovery`). The ledger must be updated to record both, with dates, when §7 succeeds.

---

## §2 RULES OF ENGAGEMENT (binding)

1. **Identify before acting (G6).** Every phase begins by printing repo path, branch, HEAD, and `git status --short`.
2. **One logical change per commit (G2, G3).** No mixed refactors. Each commit must map to exactly one work item in §3.
3. **No deploy because a commit exists (G4).** Deploy is a separate, explicitly authorized stage (§7).
4. **No push to `main` (G5).** `main` is not a target of this order.
5. **Never reset/rebase/merge the staging branch (G7).**
6. **Never modify `.env` speculatively (G8); never log secrets (G9); never alter DNS as a speculative fix (G10).**
7. **Separate commit / push / deploy / promote (G11).** Every deploy carries a **rollback reference (G12)**.
8. **Every claimed verification must carry evidence (G13).** "Fixed", "works", "deployed" are banned without the command output that proves it (G14).
9. **Diagnostic-only stays diagnostic (G16).** Do not silently convert a read task into a modification task.
10. **Record the handoff before any session switch (G17).**
11. **Never modify the EC2/Lightsail runtime from a Cloud Agent workspace (G18)** unless the operator explicitly authorizes MODE A.
12. **Next.js 16 is not the Next.js you know.** Before editing any `src/app/**` route, read the relevant guide in `node_modules/next/dist/docs/` (per `AGENTS.md`). This is mandatory, not advisory — the `params` contract changed in Next 15/16 and is the cause of W3.
13. **Do not trust the reference commit.** `896d081` is the *baseline*, not proof of correctness — see W1, where the baseline itself carries a defect.
14. **No secrets in the repository, in commits, or in the report.**

---

## §3 WORK ITEMS — EXECUTE IN THIS ORDER

### PHASE 0 — IDENTIFY AND PREPARE
**P0.1 Identify the workspace.** Run, and record output verbatim:
```bash
pwd; git rev-parse --show-toplevel; git branch --show-current; git rev-parse HEAD; git status --short; git worktree list
```
**Pass:** HEAD == `896d081c37263cc4c73a13eddf35cacb72029943` and working tree clean. If not, the executor is on the wrong object → **stop, report** (G1/G6).

**P0.2 Create the isolated repair worktree (MODE B) or confirm you are in it (MODE A).**
```bash
git worktree add ../janjez-repair-896d081 896d081c37263cc4c73a13eddf35cacb72029943
cd ../janjez-repair-896d081
```
**Pass:** `git rev-parse HEAD` == `896d081`; `git status --short` empty. Never repair on a dirty tree.

**P0.3 Install dependencies.**
```bash
npm ci
```
**Pass:** exit 0. Record `node -v` and `npm -v`. (Current container has **no** `node_modules`; Next `16.2.10`, React `19.2.4`, Vitest `4.1.10`, TypeScript `5`.)

**P0.4 Read the Next.js 16 guidance (mandatory, before any route edit).**
```bash
ls node_modules/next/dist/docs/
```
Read the pages covering **dynamic route params / `params` as a Promise** and **server/client component boundaries**. Cite the file names you read in the report.

**P0.5 Decide MODE A vs MODE B (as §0.5).** MODE A requires *observed* shell access to the host (proof: `hostname` output and `ls /home/ec2-user/janjez-socio` succeed). A 200 from a tunnel URL is **not** proof.

---

### PHASE 1 — BASELINE: REPRODUCE BEFORE FIXING
**P1.1 Capture the baseline.** Run and record exit codes + counts:
```bash
npm run test:run          # vitest run
npm run lint              # eslint
npx tsc --noEmit          # typecheck (no script exists; use tsc directly)
npm run build             # next build
```
**Pass criterion for the phase:** a **baseline report table** exists with the exact number of failing tests, lint errors/warnings, TS errors, and whether the build succeeds. Baseline numbers are the comparison point for §4. The last recorded state in the ledger (156 tests, 0 lint errors, build PASS) is **not** evidence for this lineage — verify it yourself.

**P1.2 Reproduce each defect named in §3 with a failing test or an exact reproduction command before changing any code.** A defect with no reproduction is not a defect; a fix without a reproduction is not a fix (G13/G14).

---

### PHASE 2 — REPAIR SET

#### W1 — P0 — Service resolver contract is inconsistent; the baseline commit introduced a regression
**Defect.** `resolveJanjezService(skuId?, catalogCategoryId?, janjezServiceId?)` (`src/lib/smm/fulfillment.ts:126`) selects its lookup by **argument position**: 3rd arg → `eq("id", …)`, 1st arg → `eq("slug", …)`. Call sites disagree:

| Call site (L2 @ `896d081`) | Call | Effective lookup | Correct? |
|---|---|---|---|
| `src/app/api/orders/anonymous/route.ts:70` | `resolveJanjezService(janjez_service_id, null, null)` | **slug** (1st arg) | **NO — regression introduced by `896d081`** |
| `src/app/api/orders/route.ts:142` | `resolveJanjezService(janjez_service_id, null, janjez_service_id)` | id (3rd arg) | ambiguous/degenerate |
| `src/lib/smm/fulfillment.ts:192` | `resolveJanjezService(order.janjez_service_id, order.sku_id, order.catalog_category_id)` | **id = `catalog_category_id`** | **NO** |
| `src/lib/smm/fulfillment.ts:310, :364` | `resolveJanjezService(janjezServiceId, null, janjezServiceId)` | id (3rd arg) | degenerate |
| `src/lib/smm/fulfillment.test.ts:349` | `resolveJanjezService("ig-likes", null)` | slug (1st arg) | correct for that intent |

The anonymous route reads the body field `janjez_service_id` and stores it into `orders.janjez_service_id`; `896d081` made the lookup treat that value as a **slug**, so a guest order for a real `janjez_services.id` resolves to `null` → HTTP 404 "Service not found or not available". The existing test file `src/app/api/orders/anonymous/route.test.ts:28` **mocks the whole `@/lib/smm/fulfillment` module**, so the argument-position bug is structurally invisible to the suite.

**Required change.**
1. Replace the positional signature with a **named-argument contract** (no ambiguity, no silent swaps), e.g.
   `resolveJanjezService({ skuId, catalogCategoryId, janjezServiceId }: {...})`, keeping a single, documented precedence rule (`janjezServiceId` → id, else `skuId` → slug, else `catalogCategoryId` → category).
2. Update **all five** call sites to the named form, each passing the semantically correct field (`order.janjez_service_id` → `janjezServiceId`; `order.sku_id` → `skuId`; `order.catalog_category_id` → `catalogCategoryId`).
3. Keep the `is_active = true` filter and the `provider_service_id` presence check on every path.

**Tests (mandatory, non-mocked).** Add `src/lib/smm/fulfillment.resolver.test.ts`: stub the Supabase admin client with a query builder that **records the `.eq()` filters**, then assert, for each input combination, exactly which column is filtered (`id` vs `slug` vs `category`). Also add a route-level test that the anonymous handler passes the **id** to the resolver (assert on the mock's call arguments — `expect(resolveJanjezService).toHaveBeenCalledWith(expect.objectContaining({ janjezServiceId: "<uuid>" }))`).

**Acceptance.** No call site passes the same value in two positions; resolver tests are green; the anonymous route test asserts argument identity; `npm run test:run` shows no regression against the P1.1 baseline.

#### W2 — P0 — `orders.payment_status` CHECK constraint rejects `'pending_mpesa'` (guest checkout hard-fails)
**Defect.** `supabase/migrations/20250101000003_orders_table.sql:14` defines inline `payment_status TEXT DEFAULT 'unpaid' NOT NULL CHECK (payment_status IN ('unpaid','paid','refunded'))` → auto-named constraint **`orders_payment_status_check`**. The code writes a value outside that set: `src/app/api/orders/anonymous/route.ts:117` (`payment_status: "pending_mpesa"`) and reads it at `src/lib/mpesa/client.ts:233` (`.eq("payment_status", "pending_mpesa")`). Any guest order that reaches the insert raises a check-constraint violation → 500. This is ledger blocker **P0 "pending_mpesa DB migration NOT applied"**.

**Required change.**
1. New migration `supabase/migrations/20250101000022_orders_payment_status_pending_mpesa.sql`:
   `DROP CONSTRAINT IF EXISTS public.orders_payment_status_check;` then re-add `CHECK (payment_status IN ('unpaid','paid','refunded','pending_mpesa'))` — preserving `NOT NULL` and the `'unpaid'` default. Use `IF EXISTS`/`IF NOT EXISTS` semantics so it is re-runnable.
2. **Matching rollback** `supabase/migrations/20250101000022_orders_payment_status_pending_mpesa.down.sql` restoring the original three-value constraint (W5).
3. Verify no other enum-like CHECK on `orders.status` needs `'pending_mpesa'` (it does not — `payment_status` and `status` are distinct columns; do not "fix" `status`).
4. **Do not apply the migration to any database in this order** (see §5).

**Tests.** A static test that asserts the migration file exists, is idempotent, and its constraint list is a superset of the values written by the codebase (parse `route.ts` / `mpesa/client.ts` for the literal set and compare). **Acceptance:** migration + rollback committed; the literal set in code is contained in the constraint; no DB mutation performed.

#### W3 — P0 — Next.js 16 `params` contract broken in 14 dynamic routes (L2 baseline)
**Defect.** In Next 15/16, `params` in a **server** component page is a `Promise`. `896d081` fixed only `src/app/services/[platform]/page.tsx`; **14 files still use the synchronous contract** in server components:
`src/app/order/{whatsapp,whatsapp-channel-auto-future-post-reactions,whatsapp-channel-followers,whatsapp-channel-post-reactions-cheap-slow-server,whatsapp-channel-post-reactions-instant-server-complete-in-1-minute,whatsapp-poll-votes,x,youtube-ai-generated-comment-boost-ranking-amp-interaction,youtube-likes,youtube-subscribers-2,youtube-views,youtube-watch-time}/[serviceId]/page.tsx` (each `:5`), plus `src/app/services/[platform]/[subcategory]/page.tsx:17` and `src/app/services/[platform]/[subcategory]/[microcategory]/page.tsx:17`.
Symptom: `params.serviceId` is `undefined` at runtime → the fulfilment client receives no service id (500/blank page), and the 12 near-identical `order/**` pages break identically.

**Required change.** Per file: type `params` as `Promise<{ … }>`, `await` it in the component, and thread the value down. Consolidate the 12 duplicated `[serviceId]` pages into one shared implementation **only if** it does not change routes, params, or metadata — otherwise patch each file identically.

**Tests.** (a) A static test that **no** server-component page under `src/app` declares `params: {` (allow `Promise<…>` only) — this is the regression guard. (b) `npm run build` must complete and emit routes for all 14 paths. **Acceptance:** grep-clean sweep + successful production build listing the affected routes.

#### W4 — P0 (from A8) — Island→main auth bridge endpoint missing; `profiles.signup_source` column missing
**Defect.** `docs/A8-CONSISTENCY-AUDIT.md` (Check 1 / Check 4) records: the island build (`packages/business-side`) calls `POST ${NEXT_PUBLIC_SITE_URL}/api/auth/sync` with `{ janjez_user_id, email, full_name, phone, signup_source }`, but **the main build has no such route** (`src/app/api/auth/` contains only `send-verification` and `verify-email`) **and no `signup_source` column on `profiles`**. Severity HIGH: `signup_source` tagging (island signups) can never reach the main build.

**Required change.**
1. Migration `20250101000023_profiles_signup_source.sql`: add `profiles.signup_source TEXT` with a CHECK over `('main','business-side','reseller','affiliate','child-panel')`, nullable, plus index if it will be filtered; include rollback DDL (W5).
2. New route `src/app/api/auth/sync/route.ts`: validate the body against that enum, resolve the target profile by `email` (or `janjez_user_id` → `profiles.id` mapping — state which you used and why), upsert `full_name`/`phone`/`signup_source`, be **idempotent** (repeat calls are no-ops), require a service-role/admin client (never the anon key), and return `{ ok: true, id }` / `4xx` on validation failure. Add the route to `src/middleware.ts` **auth exclusion** only if the island call is unauthenticated — and if it is, require a shared secret header instead of leaving it open.
3. Tests: valid payload → 200 + persisted column; invalid `signup_source` → 400; missing fields → 400; unauthenticated/forbidden caller → 401/403; repeat call → idempotent.

**Acceptance:** route + migration + rollback exist; new tests green; no change to existing auth flows (`send-verification`, `verify-email`, `reset-password`, `set-password`) beyond the exclusion.

#### W5 — P1 — Rollback DDL missing for the Phase-B migrations (A8 finding)
**Defect.** A8: "Migrations ⚠️ Rollback DDL missing". L2 adds `20250101000016`–`20250101000021` (drip-feed columns, `janjez_services` table, `janjez_service_order_link`, `platform_settings`, anonymous orders, password-reset tokens) with **no** `.down.sql` counterparts.

**Required change.** For each of `20250101000016`–`20250101000023` (W2, W4 included), author a `<name>.down.sql` that reverses it in dependency-safe order. Each `.down.sql` must be listed in the report with the DDL it will run. **Do not execute any `.down.sql`.**

#### W6 — P1 — ZeptoMail token invalid (auth-dependent flows broken)
**Defect (ledger blocker).** `ZEPTOMAIL_SENDMAIL_TOKEN` invalid → password-reset and verification emails do not send.
**Required change.** Code change: **none, or minimal and defensive** — the repair is to (a) add a typed transport abstraction if one is missing so the failure is logged with a clear reason (`src/lib/email*` / `src/lib/server/…` — locate it), and (b) make the send path fail loudly and non-fatally (do not break the order flow on email failure). **Never** edit, print, rotate or commit the token. **Acceptance:** a failing send is logged with a non-secret reason and the request still returns a controlled response; report states the operator action (rotate the token in the provider dashboard + secret store) as **operator-executed, not agent-executed**.

#### W7 — P1 — DripFeed provider balance `$0.00` (no order can succeed)
**Defect (ledger blocker).** Provider account unfunded.
**Required change.** **Out of agent scope — no code change.** Verify only that the order path *reads* the balance and surfaces a controlled error rather than a 500 (report the file/line that reads it). Record the operator action (fund the provider account) in the report. **Acceptance:** report contains the code path, the observed handling, and the operator action; zero commits for this item unless a defect in error handling is found.

#### W8 — P2 — 10 legacy published services remain published / misclassified
**Defect (ledger blocker).** 5,202 imported services are unpublished; 10 legacy ones are still published with some misclassified categories.
**Required change.** Produce a **read-only diagnostic report** of the 10 rows (id, name, category, subcategory, price, published flag) and the **proposed** classification; author the corrective SQL as a **file** under `supabase/` (e.g. `scripts/ops/fix_legacy_service_categories.sql`) with an explicit "NOT APPLIED — operator approval required" header. **Do not execute it.** **Acceptance:** the report + the SQL file exist; the database is untouched.

#### W9 — P1 — TypeScript errors (A8: 54 pre-existing, test files only)
**Required change.** `npx tsc --noEmit` at the P1.1 baseline. Fix errors in **production** code outright. For test files: fix what is genuinely broken; where a fix requires changing the type contract, prefer fixing the test's typing over weakening `tsconfig`. If any exclusion is added to `tsconfig.json`, it must be narrow, commented with the reason, and reported as a deliberate deviation. **Acceptance:** `npx tsc --noEmit` exits 0 **or** the report lists every remaining error with file, line, cause, and disposition — zero unexamined errors.

#### W10 — P1 — Recovery/continuity ledger must be brought current
**Required change.** Append to `JANJEZ_BUILD_STATE.md` (from `origin/review/janjez-reconciliation-20260822`): a new session entry with this order's ID, the two host identities (`13.48.195.81` eu-north-1 / `3.7.231.161` ap-south-1), the candidate baseline SHA, the §3 work items and their outcomes, the P1.1 baseline and the §4 post-repair numbers, the migration files authored (not applied), the DNS/Cloudflare observations (§1.2), and the open operator actions (W6/W7/W8, DNS repair for `staging.janjez.social`, restore tunnel). **Append; do not rewrite history.** Do not record secrets (G9).

---

## §4 VALIDATION GATE (all must pass before §6)
```bash
npm run test:run      # every test green; no test deleted or skipped to get green
npm run lint          # 0 errors; new warnings explained in the report
npx tsc --noEmit      # 0 unexplained errors (see W9)
npm run build         # production build succeeds
```
**Pass:** all four green, with a before/after table against the P1.1 baseline. **A test may not be deleted, skipped, or weakened to reach green** — a defective assertion is a defect to fix, and a fix must be reported as a repair, not a cleanup. If any gate cannot be run (e.g. no network for `npm ci`), report it as unvalidated — do not infer.

---

## §5 MIGRATIONS: AUTHOR FILES, DO NOT APPLY
**5.1** All migrations and `.down.sql` files are authored in the repository only.
**5.2 Applying any migration to any database is **out of scope** and requires a **separate, explicit operator authorization** naming the project ref, the file, and the operator who will run it. Until then, report them as *authored, not applied*.
**5.3** When authorization does arrive, the application sequence is: apply in filename order → verify constraint/column state → run the guest-order path end-to-end → record the result in the ledger. Never apply a `.down.sql` outside an incident.

---

## §6 COMMIT / PUSH
**6.1** One commit per work item: `W1`, `W2`, `W3`, `W4`, `W5`, `W6` (code part), `W9`, `W10`. Message format: `fix(Wn): <what changed> — <observable symptom removed>`; tests and migrations ride with their work item.
**6.2** Push target: a **new** branch off `896d081` (e.g. `recovery/repair-20261021`), never `main` (G5), never the staging branch (G7).
**6.3** Porting the candidate lineage onto `main` is explicitly **not** in this order; it may be proposed in the report as a follow-up with its own risk note.
**6.4** Each commit must pass §4 for the work items it contains.

---

## §7 DEPLOY & RUNTIME VALIDATION (authorization-gated; MODE A only)
**7.1** Precondition: the recovered host is reachable and the operator has authorized deployment. Evidence of reachability must be **observed shell output** (`hostname`, `ls /home/ec2-user/janjez-socio`, `pm2 list`), never a tunnel URL's HTTP status.
**7.2** Confirm identity before touching anything: repo path, branch, HEAD, `pm2 list` (expect `janjez-app` on `:3000`), `nginx -t`, and the current deployed commit — then **record the rollback reference** (the commit/BUILD_ID currently live) before any change (G12).
**7.3** Deploy sequence (each step separately authorized, separately evidenced): build on host → restart PM2 app only (`pm2 restart janjez-app`) → health check → route checks.
**7.4** Runtime validation checklist: `/` 200; the 12 `/order/**` fulfilment routes 200 with a resolved `serviceId`; `/services/[platform]` 200 with correct canonical; guest order created with `user_id NULL`; `payment_status='pending_mpesa'` accepted (requires W2 applied); email flows logged (token still invalid until W6); `pm2 list` shows no new restarts.
**7.5** On any regression: roll back to the recorded reference commit, verify, and report. Do not iterate live against production.

---

## §8 REPORTING (final deliverable)
**8.1** A single markdown report containing, in order: environment identification (Phase 0 output), the P1.1 baseline table, per-work-item results (defect, files changed, diff summary, test evidence), the §4 before/after validation table, the migration inventory (authored vs applied), the commit list with SHAs, the runtime-validation evidence (MODE A) or the blocker report (MODE B), and the open operator actions.
**8.2** Every claim must be backed by the command output that produced it (G13/G14). Cite file:line for every defect and every fix.
**8.3 MODE B blocker report must state: which of the three blockers apply (tunnel unreachable / host unreachable / no shell path), the exact evidence (command + output), what was verified about the tunnel URL (that a 200 is not proof), and precisely what access is required to continue.
**8.4** Update `JANJEZ_BUILD_STATE.md` per W10 and commit it with the work items it documents.

---

## §9 STOP CONDITIONS (halt and report — do not improvise)
- HEAD is not `896d081` (or the operator names a different baseline) → stop.
- `npm ci` fails / no network → report; do not hand-patch `node_modules`.
- A work item's reproduction cannot be demonstrated → do not "fix" speculatively; report it.
- A fix requires credentials, secrets, DNS, provider accounts, or a live database → stop at that item, author the artifact (migration/SQL/diagnostic), and hand the action to the operator.
- Any instruction conflicts with guardrails G1–G18 → the guardrail wins; report the conflict.
- The Next.js 16 docs in `node_modules/next/dist/docs/` contradict this order's assumptions about `params` → the docs win; follow them and report the deviation.

---

### APPENDIX A — Verified facts (2026-10-21, reproducible)
| # | Fact | Evidence |
|---|---|---|
| A1 | Tunnel URL returns a static shell; invented tunnel name returns the same 200; tunnel name absent from body | `curl` both, byte-compare, `grep -c janjez-recovery` = 0 |
| A2 | Dev tunnels service needs the tunnel owner's GitHub auth | `/tunnels?global=true…` → 401 anon; 502 "GitHub authorization unavailable" with the repo PAT; `/tunnels/<name>` → 404 both names |
| A3 | WebSocket egress blocked in this environment | `wss://echo.websocket.org`, `wss://api.github.com` → ERROR; tunnel WS → TIMEOUT |
| A4 | `janjez.social` origin down | Cloudflare **522** (also `www`), DNS `3.7.231.161` |
| A5 | Staging tunnel hostname dead | `staging.janjez.social` → **1016** + NXDOMAIN (DoH) |
| A6 | Neither host accepts SSH | `ssh -o BatchMode=yes` to `3.7.231.161`/`13.48.195.81` → timeout; `git@github.com` control reached the SSH server |
| A7 | Direct-IP "open" ports are a sandbox egress-proxy artifact | `http://13.48.195.81/` with `Host: example.com` returned example.com; `http://3.7.231.161/` returned a Cloudflare 403 |
| A8 | Host identities | PTR `ec2-3-7-231-161.ap-south-1…`, `ec2-13-48-195-81.eu-north-1…`; commit authorship `ec2-user@ip-172-31-43-29.eu-north-1…` vs `ubuntu@ip-172-26-5-201.ap-south-1…` |
| A9 | Candidate baseline content | `896d081` = 35 added / 36 modified / 1 deleted vs `main`; 11 test files; migrations `…00000`–`…00021` |
| A10 | `clean-rebuild-20260819` exists in **no** ref | absent from `packed-refs`/`refs`/reflog; carried instead by `origin/kilo-recovery-clean-20260822` and `origin/recovery/*-ec2-head-20261020` |
| A11 | L1 main lacks the guest flow | `src/app/api/orders/` in `339242d8` = `route.ts` only; no `anonymous/`, no `happy-hour/`, no `reset-password/`, no `set-password/` |
| A12 | `pending_mpesa` violates an existing CHECK | `20250101000003_orders_table.sql:14` (`unpaid,paid,refunded`) vs `anonymous/route.ts:117`, `mpesa/client.ts:233` |
| A13 | A8's `/api/auth/sync` + `profiles.signup_source` gap is real in L2 | `src/app/api/auth/` = `send-verification`, `verify-email` only |
| A14 | Next 16 `params` still broken in 14 L2 server pages | `git grep "params: {" 896d081 -- src/app` → 14 files, all server components |
| A15 | The existing anonymous-route test mocks the resolver module | `anonymous/route.test.ts:28` `vi.mock("@/lib/smm/fulfillment", …)` → argument-position bugs are invisible |
| A16 | No new remote artifacts since 2026-10-20 | `git ls-remote --heads origin` → 28 branches, unchanged; GitHub: 1 closed PR, 0 issues |

### APPENDIX B — Command quick reference
```bash
# identity
git rev-parse --show-toplevel && git branch --show-current && git rev-parse HEAD && git status --short
# baseline
npm ci && npm run test:run && npm run lint && npx tsc --noEmit && npm run build
# target files
git show 896d081:src/lib/smm/fulfillment.ts | sed -n '120,205p'      # resolver
git show 896d081:src/app/api/orders/anonymous/route.ts | sed -n '60,130p'
git show 896d081:src/app/api/orders/route.ts | sed -n '130,155p'
git show 896d081:supabase/migrations/20250101000003_orders_table.sql
git show 896d081:supabase/migrations/20250101000020_anonymous_orders.sql
# ledgers
git show origin/review/janjez-reconciliation-20260822:JANJEZ_BUILD_STATE.md
git show origin/review/janjez-reconciliation-20260822:JANJEZ_CURRENT_STATE_RECON_20260826.md
git show origin/feature/a7-api-keys:docs/A8-CONSISTENCY-AUDIT.md
# Next.js 16 rules (mandatory read)
ls node_modules/next/dist/docs/
```

### APPENDIX C — File index for the executor (L2 @ `896d081`)
| Path | Role |
|---|---|
| `src/lib/smm/fulfillment.ts` | `resolveJanjezService` (W1), `fulfillOrder` call site (W1) |
| `src/app/api/orders/anonymous/route.ts` | guest order handler; `payment_status: "pending_mpesa"` (W2); resolver call (W1) |
| `src/app/api/orders/route.ts` | authenticated order handler; resolver call (W1) |
| `src/lib/mpesa/client.ts` | M-Pesa client; `payment_status` query (W2) |
| `src/app/order/**/[serviceId]/page.tsx` (12 files) | Next 16 `params` (W3) |
| `src/app/services/[platform]/**/page.tsx` (3 files) | Next 16 `params` (W3) |
| `src/app/api/auth/` (2 routes today) | W4 target: add `sync/` |
| `src/middleware.ts` | W4 exclusion (only if the island call is unauthenticated) |
| `supabase/migrations/20250101000003_orders_table.sql` | the constraint to widen (W2) |
| `supabase/migrations/20250101000016`–`00021` | Phase-B migrations needing `.down.sql` (W5) |
| `src/lib/smm/fulfillment.test.ts`, `src/app/api/orders/anonymous/route.test.ts` | existing coverage; mocking limits (W1) |
| `JANJEZ_BUILD_STATE.md`, `JANJEZ_CURRENT_STATE_RECON_20260826.md` (on `origin/review/janjez-reconciliation-20260822`) | ledgers to append (W10) |

---

**End of order. Execute §3 in order. Report per §8. Never deploy without explicit authorization.**
