# 11 — Janjez API Extensions

## Purpose

This document describes the **Janjez Main Build API** — the REST surface that the
Business Side island (`business.janjez.social`) consumes to integrate with the
main Janjez platform. It is the human-readable companion to the machine-readable
contract in `docs/openapi.yaml`.

**Audience:** Business Side integrators, reseller/affiliate operators, and
anyone building against the Janjez API.

**Scope:** Every endpoint under `/api/business/v1/*` plus the auth bridge
endpoints (`/oauth/token`, `/auth/verify`, `/api/auth/sync`) that the island
depends on.

---

## Base URL

| Environment | URL |
|-------------|-----|
| Production | `https://janjez.social/api/business/v1` |
| Local dev | `http://localhost:3000/api/business/v1` |

The island build reads the production URL from `JANJEZ_MAIN_API_URL`.

---

## Authentication

All endpoints under `/api/business/v1/*` require authentication. Two methods
exist; the island uses **HMAC** for server-to-server calls and **Bearer JWT**
for dashboard-originated calls.

### 1. HMAC (server-to-server)

Used by the island's backend routes (`app/auth/callback/route.ts`,
`app/api/auth/check/route.ts`, `packages/business-side/src/lib/auth/verify.ts`).
Never used in browser code.

**Headers:**

| Header | Value |
|--------|-------|
| `X-Business-Side-API-Key` | The shared static API key (`BUSINESS_SIDE_API_KEY`) |
| `X-Timestamp` | Unix seconds of request time (must be within ±300s) |
| `X-Nonce` | Random UUID, unique per request (replay-protected for 10 min) |
| `X-Signature` | `HMAC-SHA256` of `<METHOD>\n<path>\n<body_hash>\n<timestamp>\n<nonce>` |

**Body hash:** `HMAC-SHA256(secret, raw_body)` — sign the raw bytes, not the
parsed object. The secret is `BUSINESS_SIDE_HMAC_SECRET` (falls back to
`JANJEZ_MAIN_API_SECRET`).

**Verification:** `src/lib/business-side/auth.ts:authenticateBusinessSideRequest`
checks the API key with constant-time comparison, validates the timestamp
window, rejects reused nonces, and verifies the signature.

**Failure responses:**

| Condition | Error code | Status |
|-----------|-----------|--------|
| Missing/invalid API key | `INVALID_API_KEY` | 401 |
| Timestamp outside ±5 min | `INVALID_TIMESTAMP` | 401 |
| Missing/blank nonce | `INVALID_NONCE` | 401 |
| Bad signature | `INVALID_SIGNATURE` | 401 |
| Replayed nonce | `INVALID_NONCE` | 401 |

### 2. Bearer JWT (dashboard)

Used by admin dashboard routes and the API key management surface
(`/dashboard/api-keys`, `POST /api/business/v1/keys`).

```
Authorization: Bearer <jwt>
```

Keys are issued via `POST /api/business/v1/keys` with an `admin:write` scope.
The token carries scopes; each endpoint checks its required scope and returns
`INSUFFICIENT_SCOPE` (403) when missing.

**Scopes:**

| Scope | Grants |
|-------|--------|
| `users:read` | `GET /users` |
| `orders:write` | `POST /orders`, cancel, refill |
| `keys:read` | `GET /keys`, `GET /keys/{id}` |
| `keys:write` | `POST /keys`, `DELETE /keys/{id}` |
| `admin:write` | Key issuance |

---

## Rate Limits

Per-key rate limiting is enforced by `src/lib/business-side/rate-limit.ts`.
The default limit is applied per API key; exceeded requests receive:

```
Retry-After: <seconds>
```

with body `{ error: "RATE_LIMITED", ... }` (429).

The island's HMAC path is additionally protected by nonce replay rejection
(10-minute TTL), which is separate from the rate limit.

---

## Error Envelope

All endpoints return a consistent envelope on failure:

```json
{
  "success": false,
  "data": null,
  "error": { "code": "<CODE>", "message": "<detail>" },
  "request_id": "<uuid>",
  "timestamp": "<ISO-8601>"
}
```

Success responses use the same shape with `error: null`.

---## Endpoints

### Auth bridge

These are **not** under `/api/business/v1`. They live at the site root and are
called by the island's auth flows.

#### `POST /oauth/token`

Exchange a JWT authorization code for user info.

- **Auth:** HMAC (static API key)
- **Body:** `{ "code": "<jwt>" }`
- **Response:** `{ success: true, data: { user_id, email, return_to } }`
- **Errors:** 400 on invalid code

Called by `app/auth/callback/route.ts:70` during SSO login.

#### `POST /auth/verify`

Verify a session code and return the user's identity + `signup_source`.

- **Auth:** HMAC (static API key)
- **Body:** `{ "code": "<session_code>", "client_id": "ez-business-side" }`
- **Response:** `{ success: true, data: { janjez_user_id, email, full_name, phone, signup_source } }`
- **Errors:** 401 on invalid/expired code

Called by `packages/business-side/src/lib/auth/verify.ts:verifyJanjezSession` from
`app/api/auth/check/route.ts:35`.

**`signup_source` values:** `main`, `business-side`, `reseller`,
`child-panel`, `affiliate`. Defaults to `business-side` when the field is
absent.

#### `POST /api/auth/sync`

Push identity + `signup_source` from the island to the main build.

- **Auth:** HMAC (static API key)
- **Body:**

| Field | Required | Type | Notes |
|-------|----------|------|-------|
| `janjez_user_id` | yes | string | Maps to `profiles.id` |
| `email` | yes | string | |
| `full_name` | no | string | Defaults to email local-part |
| `phone` | no | string | Defaults to `""` |
| `signup_source` | no | string | Validated against the union; defaults to `main` |

- **Response:** `{ success: true, partner: { id, janjez_user_id, janjez_email, display_name, phone, status, onboarding_state, signup_source } }`
- **Errors:** 400 missing fields / invalid JSON; 401 auth; 500 sync failure

**Idempotent:** uses `upsert` on `profiles` with `onConflict: 'id'`, so a
failed callback can be retried safely. Updates `signup_source` on every call,
so the tag always reflects the latest claim.

Called by:
- `app/auth/callback/route.ts:28` (SSO login)
- `app/api/auth/check/route.ts:46` (session check)

**Schema dependency:** `public.profiles.signup_source` (added by
`20260922000001_auth_signup_source.sql`, CHECK-constrained to the 5-value
union).

---

### Business API (`/api/business/v1/*`)

All require Bearer JWT unless noted. Responses use the standard envelope.

#### `GET /health`

Service health check. **No auth required.**

Returns `{ status: "ok", service: "janjez-main-business-api", version: "v1", timestamp }`.

#### `GET /services`

Paginated catalogue of active services.

- **Query:** `page`, `page_size` (max 200), `category`, `search`
- **Response:** array of `Service` + `pagination`
- **Errors:** 401

#### `GET /services/{id}`

Get a single service by ID.

- **Response:** `Service`
- **Errors:** 401, 404

#### `POST /orders`

Place an idempotent order. Requires `Idempotency-Key` header.

- **Body:** `Order` (`service_name`, `link`, `quantity`, `amount`, etc.)
- **Response:** `{ order, fulfillment, replayed }`
- **Errors:** 400, 401

#### `GET /orders/{id}`

Get an order by ID.

- **Errors:** 401, 404

#### `POST /orders/{id}/cancel`

Cancel an order.

- **Errors:** 400, 401

#### `POST /orders/{id}/refill`

Request a refill on an order.

- **Errors:** 400, 401

#### `GET /wallet/balance`

Get the caller's wallet balance.

- **Response:** `Wallet` (`balance`, `currency`)
- **Errors:** 401

#### `POST /wallet/topup`

Top up wallet via M-Pesa.

- **Body:** `{ amount: number, phoneNumber: string }`
- **Errors:** 400, 401

#### `POST /webhooks/register`

Register a webhook. **Stub — returns 501.** Webhook registration is scheduled
for a future release.

---#### `GET /users`

Paginated user directory scoped to the caller's tenant.

- **Scope:** `users:read`
- **Query:** `page`, `page_size` (max 200)
- **Response:** array of user objects + `pagination`

Each user object maps the main-build `profiles` table to the island's `partners`
shape:

| Main build (`profiles`) | API response |
|--------------------------|--------------|
| `id` | `id`, `janjez_user_id` |
| `email` | `janjez_email` |
| `full_name` | `display_name` |
| `phone` | `phone` |
| `wallet_balance` | `wallet_balance` |
| `role` | `role` |
| `created_at` | `created_at` |

- **Errors:** 401

#### `GET /analytics`

Usage analytics for the caller's tenant.

- **Scope:** tenant-scoped
- **Query:** `period` (`day` | `week` | `month`)
- **Response:** `{ user, total_orders, open_orders, completed_orders, wallet_balance, total_commission, pending_commission, generated_at }`
- **Errors:** 401

#### `GET /affiliates`

Paginated affiliate list.

- **Response:** array of `{ id, janjez_user_id, affiliate_code, total_earned, total_pending, total_paid, status, display_name, created_at }` + `pagination`
- **Errors:** 401

#### `GET /commissions`

Paginated commission ledger.

- **Response:** array of `{ id, affiliate_id, order_id, amount, status, created_at }` + `pagination`
- **Errors:** 401

#### `GET /payouts`

Paginated payout list.

- **Response:** array of `{ id, affiliate_id, amount, status, created_at }` + `pagination`
- **Errors:** 401

#### `GET /withdrawals`

Paginated withdrawal history.

- **Response:** array of `{ id, partner_id, amount, status, created_at }` + `pagination`
- **Errors:** 401

#### `GET /products`

Product catalogue (alias for the service catalogue).

- **Response:** array of `Service` + `pagination`
- **Errors:** 401

#### `GET /categories`

Service categories.

- **Response:** `{ categories: object, flat: Service[] }`
- **Errors:** 401

#### `GET /catalogue`

Full catalogue with pagination.

- **Response:** array of `Service` + `pagination`
- **Errors:** 401

#### `GET /webhooks`

List registered webhooks.

- **Response:** array of `{ id, name, webhook_url, is_active, last_triggered_at, created_at }`
- **Errors:** 401

#### `GET /keys`

List API keys (secrets masked).

- **Scope:** `keys:read`
- **Response:** array of `ApiKey`
- **Errors:** 401

#### `POST /keys`

Issue a new API key. The secret is shown **once** and never stored.

- **Scope:** `admin:write`
- **Body:** `{ name: string, scopes: string[], rate_limit: number, expires_in_days: number }` (default 365)
- **Response:** `CreatedKey` (extends `ApiKey` with `token` + `secret`)
- **Errors:** 401, 403

#### `GET /keys/{id}`

Get key detail.

- **Scope:** `keys:read`
- **Errors:** 401, 404

#### `DELETE /keys/{id}`

Revoke a key.

- **Scope:** `keys:write`
- **Response:** 204 on success
- **Errors:** 401, 404

---

## Consumer Guide

### How the Business Side integrates

The island (`business.janjez.social`) is a **consumer** of this API. It never
calls these endpoints from the browser — all calls originate from server
routes or server-side helpers.

**1. SSO login** (`app/auth/callback/route.ts`)

```
GET /auth/callback?code=<jwt>&janjez_user_id=...&janjez_email=...
  → POST /oauth/token (HMAC) to exchange the code
  → POST /api/auth/sync (HMAC) to push identity to main build
  → create island session → redirect to /dashboard
```

**2. Session check** (`app/api/auth/check/route.ts`)

```
GET /api/auth/check
  → verify island session cookie
  → if absent: POST /auth/verify (HMAC) to validate session code
  → POST /api/auth/sync (HMAC) to refresh identity + signup_source
  → return { authenticated: true, partner }
```

**3. Identity verification** (`packages/business-side/src/lib/auth/verify.ts`)

Thin wrapper around `POST /auth/verify`. Returns `{ valid, user? }`.

**4. Business API calls** (future / dashboard-originated)

Dashboard routes use Bearer JWT. HMAC is reserved for server-to-server.

### Schema mapping

The main build stores users in `public.profiles`. The island stores partners in
`partners`. The API translates on the way out so callers see a stable shape:

| Concept | Main build | Island |
|---------|-----------|--------|
| User record | `profiles` | `partners` |
| User ID | `profiles.id` | `partners.janjez_user_id` |
| Wallet | `profiles.wallet_balance` | `partners.wallet_balance` |
| Auth tag | `profiles.signup_source` | `partners.signup_source` |

### Versioning

The API is versioned under `/api/business/v1`. Breaking changes require a new
version path (`/api/business/v2`); the v1 path is frozen once v2 ships.
Additive changes (new endpoints, new optional fields) are backward-compatible
within v1.

---

## OpenAPI Companion

The machine-readable contract lives in `docs/openapi.yaml`. This document
explains the contract; the YAML is the reference for tooling. Keep both in
sync — every endpoint documented here must appear in the spec.