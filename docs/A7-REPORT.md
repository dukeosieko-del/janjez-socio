# A7 Final Report — API Key Infrastructure + Missing Routes

## Part 1 — Executive Summary

A7 scope: per-user API key generation (JWT-based) plus the missing `/api/business/v1/*` routes that the business-side integration depends on.

Sub-phases: A7a (schema) through A7h (this report).

Architectural decision: **Option A** — routes live on the main build (`janjez-socio`) against the main Supabase schema (`profiles`, `affiliate_earnings`, `affiliate_withdrawals`, `janjez_services`), not the island schema.

Final state:
- A7a–A7g committed and pushed to `origin/feature/a7-api-keys` (SHA `e676372`)
- A7e held pending owner gate
- Production untouched (PM2 still serving pre-A7d build)

## Part 2 — Sub-Phase Summary

| Sub-phase | Deliverable | Commit SHA | Status |
|-----------|-------------|-----------|--------|
| A7a | `api_keys` table + JWT infrastructure | `e1a437a` | ✅ |
| A7b | Key issuance/list/revocation endpoints | `e1a437a` | ✅ |
| A7c | Per-key rate limiting | `e1a437a` | ✅ |
| A7d | 11 business-side API routes | `e1a437a` | ✅ |
| A7e | `INVALID_API_KEY` fix (production) | — | ⏸️ Held |
| A7f | Dashboard UI for key management | `9e9281a` | ✅ |
| A7g | OpenAPI spec + API reference | `e676372` | ✅ |
| A7h | This report | — | ✅ |

Note: A7a–A7d were committed together in `e1a437a` (single logical commit per the original execution). A7f and A7g were committed separately after the mitigation.

## Part 3 — Endpoints Delivered

23 endpoints documented in `docs/openapi.yaml`:

| Method | Path | Auth | Scope | Consumer |
|--------|------|------|-------|----------|
| GET | /health | Bearer JWT | — | Any |
| POST | /oauth/token | Bearer JWT | — | Any |
| GET | /services | Bearer JWT | services:read | Business |
| GET | /services/{id} | Bearer JWT | services:read | Business |
| GET | /orders | Bearer JWT | orders:read | Business |
| GET | /orders/{id} | Bearer JWT | orders:read | Business |
| POST | /orders/{id}/cancel | Bearer JWT | orders:write | Business |
| POST | /orders/{id}/refill | Bearer JWT | orders:write | Business |
| GET | /wallet/balance | Bearer JWT | wallet:read | Business |
| POST | /wallet/topup | Bearer JWT | orders:write | Business |
| POST | /webhooks/register | Bearer JWT | webhooks:write | Business |
| GET | /users | Bearer JWT | users:read | Admin |
| GET | /analytics | Bearer JWT | analytics:read | Admin |
| GET | /affiliates | Bearer JWT | admin:read | Admin |
| GET | /commissions | Bearer JWT | admin:read | Admin |
| GET | /payouts | Bearer JWT | admin:read | Admin |
| GET | /withdrawals | Bearer JWT | wallet:read | Admin |
| GET | /products | Bearer JWT | services:read | Admin |
| GET | /categories | Bearer JWT | services:read | Admin |
| GET | /catalogue | Bearer JWT | services:read | Admin |
| GET | /webhooks | Bearer JWT | webhooks:read | Admin |
| GET | /keys | Bearer JWT | admin:write | Admin |
| POST | /keys | Bearer JWT | admin:write | Admin |
| GET | /keys/{id} | Bearer JWT | admin:write | Admin |
| DELETE | /keys/{id} | Bearer JWT | admin:write | Admin |

## Part 4 — Verification Evidence

- `tsc --noEmit`: exit 0 for all A7 files (54 pre-existing test-file errors elsewhere, none from A7)
- `next build`: exit 0, 32-37s
- `eslint`: 0 errors across all A7 files (7 pre-existing warnings)
- `vitest` rate-limiter: 8/8 pass
- `openapi.yaml`: valid YAML via `yaml.safe_load`, 23 paths
- Key issuance/revocation: verified via build + route code review (sandbox runtime tests deferred until A7e deploy)

## Part 5 — Migration State

- File: `supabase/migrations/20260919000017_api_keys.sql`
- Applied to sandbox: NO (migration not applied to any DB)
- Applied to live production Supabase: NO (held behind A7e gate)
- Rollback DDL: NO `.down.sql` present (add before A7e deploy)

## Part 6 — Known Gaps / Deferred Items

- A7e pending (production deploy + DB migration + key issuance)
- `/webhooks` returns empty list (no `integration_connections` table in main build)
- Vercel preview deploy status unknown (check Vercel dashboard)

## Part 7 — Additional Defects Found During A7

- `getSupabaseAdmin` → `createAdminClient` rename across 14 files (fixed)
- `]` typo in `api-key-auth.ts:72` (fixed)
- `RateLimitResult` typing (fixed)
- `key`/`keyObj` prop collision in `ApiKeySecretDisplay` (fixed)
- All fixed.

## Part 8 — Security Review

- JWT signing: HS256
- Secret storage: `API_KEY_JWT_SECRET` env var (never printed)
- Key hash: bcrypt (via `generateKeyPair`)
- Revocation: `revoked_at` timestamp, checked at auth time
- Rate limiting: per-key sliding window, default 60 req/min
- Scope enforcement: `hasScope()` check in every route

## Part 9 — Pending Owner Gates

- A7e (production deploy + DB migration + key issuance): `HOLD`
- Push: DONE
- Vercel deploy of A7d routes: pending

## Part 10 — Outstanding Work

- A8 (Phase B deploy gates)
- Blog workstream
- A7e decision from owner