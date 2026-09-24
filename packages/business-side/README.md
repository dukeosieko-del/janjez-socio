# Business Side — API Key Provisioning

This package is the Janjez Business Side monorepo integration surface.
It runs on **Vercel** (`business.janjez.social`) and consumes the main build's
HMAC-protected `/api/business/v1/*` endpoints on **Lightsail**
(`janjez.social`).

## Architecture

```
business.janjez.social (Vercel, edge)
    │
    │ HMAC-signed requests (X-Business-Side-API-Key, X-Timestamp, X-Nonce, X-Signature)
    │
    ▼
janjez.social (Lightsail, PM2)
    ├── /api/business/v1/*          ← server-side API surface
    ├── /api/mpesa/*                ← M-Pesa callbacks
    └── /api/orders/*               ← order execution
```

## Shared Secrets

The two systems share **two secrets** that must match on both sides:

| Secret | Business Side env var | Main Build env var |
|--------|----------------------|-------------------|
| API Key | `JANJEZ_MAIN_API_KEY` | `BUSINESS_SIDE_API_KEY` |
| HMAC Secret | `JANJEZ_MAIN_API_SECRET` | `BUSINESS_SIDE_HMAC_SECRET` |

**These values MUST be identical on both systems.** If they diverge, all
business-side API calls fail with `INVALID_API_KEY` or `INVALID_SIGNATURE`.

## Provisioning Flow

### Step 1: Generate fresh secrets (recommended)

```bash
node scripts/generate-secrets.js
```

This outputs both secrets. Copy them to BOTH systems.

### Step 2: Configure Business Side (Vercel)

```
vercel env add JANJEZ_MAIN_API_KEY
vercel env add JANJEZ_MAIN_API_SECRET
vercel env add HMAC_SECRET
```

### Step 3: Configure Main Build (Lightsail)

**⚠️ Owner action required — do NOT automate.**

Edit `/home/ubuntu/janjez-socio/.env` and add:

```
BUSINESS_SIDE_API_KEY=<same value as JANJEZ_MAIN_API_KEY>
BUSINESS_SIDE_HMAC_SECRET=<same value as JANJEZ_MAIN_API_SECRET>
```

Then restart PM2:

```bash
pm2 restart janjez-app --update-env
```

### Step 4: Verify

```bash
# From business-side (Vercel)
curl https://business.janjez.social/api/health/janjez
# EXPECT: {"janjez":"reachable"} or {"success":true,...}

# From main build (Lightsail)
curl -sI https://janjez.social/api/business/v1/health
# EXPECT: 200 (with valid key) or 401 (without)
```

## Environment Variables

See `.env.example` for the complete list. **Never commit `.env`.**

## Deployment

This package is deployed to Vercel via the existing `ez-business-side` project
(`prj_FfmBcDkGuut9ECg7fDe1oanF6ujW`). The `.vercel/project.json` from the
original repo is preserved.

**Do NOT deploy from this monorepo branch.** Deployment target remains the
separate `ez-business-side` repo on Vercel.