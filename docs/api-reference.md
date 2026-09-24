# Janjez Business API Reference

Base URL: `https://janjez.social/api/business/v1`

## Authentication

Two methods are supported:

### Bearer JWT (preferred)

```
Authorization: Bearer <jwt-token>
```

Issue keys via `POST /keys`. Tokens embed user, tenant, and scopes.

### Legacy API key

```
x-business-side-api-key: <static-key>
```

Deprecated. Supports the legacy single-key integration only.

## Rate Limiting

Per-key sliding window. Default 60 req/min. Per-key limit set at issuance.

Exceeded limits return `429 Too Many Requests`.

## Scopes

- `orders:read`, `orders:write`
- `services:read`
- `wallet:read`
- `analytics:read`
- `webhooks:read`

## Endpoints

See `docs/openapi.yaml` for the full specification.

### Summary

| Method | Path | Purpose |
|--------|------|---------|
| GET | /health | Health check |
| POST | /oauth/token | OAuth token exchange |
| GET | /services | Service catalogue (paginated) |
| GET | /services/{id} | Service detail |
| GET | /orders | Order list |
| GET | /orders/{id} | Order detail |
| POST | /orders/{id}/cancel | Cancel order |
| POST | /orders/{id}/refill | Refill order |
| GET | /wallet/balance | Wallet balance |
| POST | /wallet/topup | Wallet top-up |
| POST | /webhooks/register | Register webhook |
| GET | /users | User list |
| GET | /analytics | Analytics |
| GET | /affiliates | Affiliate list |
| GET | /commissions | Commission ledger |
| GET | /payouts | Payout list |
| GET | /withdrawals | Withdrawal history |
| GET | /products | Product catalogue |
| GET | /categories | Service categories |
| GET | /catalogue | Full catalogue |
| GET | /webhooks | List webhooks |
| GET | /keys | List API keys |
| POST | /keys | Issue new key |
| GET | /keys/{id} | Key detail |
| DELETE | /keys/{id} | Revoke key |