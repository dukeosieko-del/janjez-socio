# Authentication System Setup Guide

## Source of Truth

All Supabase configuration lives in this repo:  
https://github.com/dukeosieko-del/janjez-socio

The Vercel production deployment is connected to this repo.  
All code, config, and env variables must be managed from here.

## Environment Variables

Set these in **Vercel Dashboard → Settings → Environment Variables** for this project.  
Do NOT hard-code live credentials in files committed to git.

**Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
```

**Optional (for email via Brevo):**
```env
BREVO_API_KEY=
BREVO_FROM_EMAIL=
```

**Optional (for M-Pesa):**
```env
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
MPESA_ENV=production
```

Local development can use `.env.local` (gitignored).  
Copy from `.env.example` and fill in real values for your Supabase project.

## Database Migration

Run this SQL in your Supabase dashboard to create the profiles table:

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste the contents of `supabase/migrations/20250101000000_create_profiles_table.sql`
3. Click **Run** to execute the migration

## Supabase Auth Settings

1. Go to **Authentication → Providers** in Supabase Dashboard
2. Ensure **Email** is enabled
3. Configure email templates in **Authentication → Email Templates**
4. Enable **Google** under **Authentication → Providers → Google**
   - Paste the Google OAuth `client_id` and `client_secret` from Google Cloud Console
5. In **Authentication → URL Configuration**:
   - Site URL: `https://janjez.social`
   - Redirect URLs:
     - `https://janjez.social/auth/callback`
     - `https://janjez.social/auth/sign-in`
     - `https://janjez.social/auth/reset-password`
   - Redirect URLs (Local dev):
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/sign-in`
     - `http://localhost:3000/auth/reset-password`

## Google OAuth Setup

1. Go to **Google Cloud Console** → APIs & Services → Credentials
2. Create an **OAuth 2.0 Client ID** (or use the existing one)
3. Add these **Authorized redirect URIs**:
   - `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. Save the `client_id` and `client_secret`
5. In the **Supabase Dashboard → Authentication → Providers → Google**, enable Google and paste the credentials
6. The Google sign-in button appears automatically on the sign-in and register modals

## Brevo Email Transport

This project uses **Brevo** (formerly Sendinblue) for transactional email (verification,
password reset, contact form). The legacy ZeptoMail transport was moved to
`archived/zeptomail/` (excluded from the build).

1. Go to **Brevo Dashboard** → Settings → SMTP / API Keys → API Keys
2. Create an API key with **`emailSmtp.access:write`** scope (or full access)
3. In your environment / Vercel secrets set:
   - `BREVO_API_KEY` — the Brevo API key (required)
   - `BREVO_FROM_EMAIL` — sender address, e.g. `noreply@janjez.social` (required)

## Deploy to Vercel

This repo is connected to Vercel. To deploy:

1. Push changes to the `main` branch of this repo
2. Vercel will auto-deploy
3. Confirm environment variables are set in Vercel dashboard
4. Enable Google provider in Supabase dashboard before production use
5. Add `BREVO_API_KEY` and `BREVO_FROM_EMAIL` to Vercel environment variables
