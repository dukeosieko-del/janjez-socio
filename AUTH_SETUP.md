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
4. In **Authentication → URL Configuration**:
   - Site URL: `https://janjez.social`
   - Redirect URLs: 
     - `https://janjez.social/auth/callback`
     - `https://janjez.social/auth/sign-in`
     - `https://janjez.social/auth/reset-password`

## Deploy to Vercel

This repo is connected to Vercel. To deploy:

1. Push changes to the `main` branch of this repo
2. Vercel will auto-deploy
3. Confirm environment variables are set in Vercel dashboard
4. Enable email provider in Supabase dashboard before production use
