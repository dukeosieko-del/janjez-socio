# janjez.social

Pata Clout Chapchap — Social media growth services platform built with Next.js and Supabase.

Production site: https://janjez.social

## Build State

**Before making any changes, read `JANJEZ_BUILD_STATE.md` for the current operational state, session history, roadmap, and guardrails.**

This file is the authoritative source of truth for the Janjez build/reconciliation process. It records:
- Current branch, HEAD, and working tree state
- PM2/nginx/deployment status
- Supabase project status
- Service architecture status
- Known blockers and outstanding work
- Session history and handoff information

## Repo

This repository is the single source of truth for the production site.  
Vercel deploys `https://github.com/dukeosieko-del/janjez-socio` → `main` branch automatically.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Environment Variables

Copy `.env.example` to `.env.local` and fill in real values.  
Vercel environment variables are configured separately in the Vercel dashboard.

Required:
- `NEXT_PUBLIC_SITE_URL` (e.g. `https://janjez.social`)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:
- `ZEPTOMAIL_SENDMAIL_TOKEN`
- `ZEPTOMAIL_FROM_EMAIL`
- M-Pesa variables for payment integration

## Auth & Email Verification

### Option A: Supabase Dashboard SMTP (Recommended for Production)

1. In your Supabase dashboard, go to **Authentication → Email Templates**
2. Open the **Confirm signup** template
3. Set the sender name to **JANJEZ SOCIO**
4. Set the sender email to `noreply@janjez.social`
5. Under **SMTP Settings**, configure your own SMTP relay (e.g. ZeptoMail) so emails go through your domain

### Option B: Custom Verification Flow (Fully Branded)

This project includes a custom verification flow that sends branded emails via ZeptoMail directly from **JANJEZ SOCIO**.

1. In Supabase dashboard, disable **Confirm email** under **Authentication → Providers → Email**
2. Run the SQL migration `supabase/migrations/20250101000001_email_verification.sql`
3. Set `SUPABASE_SERVICE_ROLE_KEY` in your environment
4. Configure `ZEPTOMAIL_SENDMAIL_TOKEN` and `ZEPTOMAIL_FROM_EMAIL`

The app will now create users via the admin API and send verification emails branded as **JANJEZ SOCIO**.

Verified users land on the dashboard after sign-in or email confirmation. Unverified users are prompted to check their inbox.

## Build

```bash
npm run build
npm start
```

## Tech Stack

- Next.js 16 (App Router)
- React 19
- Supabase Auth + Database
- Tailwind CSS v4
- Vercel Deployment
