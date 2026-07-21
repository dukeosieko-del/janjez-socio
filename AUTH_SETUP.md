# Authentication System Setup Guide

## Supabase Project

**Project URL:** https://snkgkcdnmhqaejpqftxn.supabase.co  
**Publishable Key:** sb_publishable_9O06_TeEL6LQSFkUhQkBCA_FW1JdW0t  
**Database URL:** postgresql://postgres:[YOUR-PASSWORD]@db.snkgkcdnmhqaejpqftxn.supabase.co:5432/postgres

## Environment Variables

Already configured in `.env.local` for development. For Vercel deployment, add these in your Vercel dashboard:

**Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://snkgkcdnmhqaejpqftxn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9O06_TeEL6LQSFkUhQkBCA_FW1JdW0t
```

**Optional (for M-Pesa):**
```env
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=
MPESA_SHORTCODE=
MPESA_ENV=production
```

## Database Migration

Run this SQL in your Supabase dashboard to create the profiles table:

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste the contents of `supabase/migrations/20250101000000_create_profiles_table.sql`
3. Click **Run** to execute the migration

## Email Configuration

Enable email authentication in Supabase:

1. Go to **Authentication → Providers** in Supabase Dashboard
2. Ensure **Email** is enabled
3. Configure email templates in **Authentication → Email Templates**

## Features Implemented

- ✅ User registration with email/password
- ✅ User login with session management
- ✅ Email verification (Supabase built-in)
- ✅ Password reset functionality
- ✅ Protected routes (middleware + client-side)
- ✅ User session persistence
- ✅ Error handling & user-friendly validation
- ✅ OAuth social login (Google, GitHub - ready to enable in Supabase)
- ✅ Account management dashboard
- ✅ Sign out functionality

## Testing

1. Visit `/auth/sign-up` to create a test account
2. Check your email for verification link
3. Visit `/auth/sign-in` to log in
4. Access `/dashboard` (protected route)
5. Test password reset at `/auth/reset-password`

## Deployment to Vercel

1. Add environment variables in Vercel dashboard (Settings → Environment Variables)
2. The `middleware.ts` will automatically protect routes
3. Enable email provider in Supabase dashboard before production use
