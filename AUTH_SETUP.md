# Authentication System Setup Guide

## Supabase Project Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or use your existing one
3. Navigate to **Settings → API**
4. Copy your **Project URL** and **anon/public** key

## Environment Variables

Add these to your Vercel project environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Or create a `.env.local` file in the root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Database Migration

Run the SQL migration in your Supabase dashboard:

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy and paste the contents of `supabase/migrations/20250101000000_create_profiles_table.sql`
3. Click **Run** to execute the migration

This creates:
- `profiles` table linked to `auth.users`
- Automatic profile creation on user signup
- RLS policies for profile access

## Email Configuration

Enable email authentication in Supabase:

1. Go to **Authentication → Providers**
2. Ensure **Email** is enabled
3. Configure email templates in **Authentication → Email Templates**

## Features Implemented

- ✅ User registration with email/password
- ✅ User login with session management
- ✅ Email verification (Supabase built-in)
- ✅ Password reset functionality
- ✅ Protected routes (middleware + client-side)
- ✅ User session persistence
- ✅ Error handling & validation
- ✅ OAuth social login (Google, GitHub - ready to enable in Supabase)
- ✅ Account management dashboard
- ✅ Sign out functionality

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   ├── sign-up/page.tsx
│   │   ├── verify-email/page.tsx
│   │   └── reset-password/page.tsx
│   ├── dashboard/page.tsx (protected)
│   └── api/auth/ (ready for webhooks)
├── components/
│   ├── auth/
│   │   ├── SignInForm.tsx
│   │   ├── SignUpForm.tsx
│   │   └── ResetPasswordForm.tsx
│   ├── ui/LoadingSpinner.tsx
│   ├── AuthContext.tsx
│   └── AuthModal.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts (browser)
│   │   ├── server.ts (server-side)
│   │   └── middleware.ts
│   └── auth/
│       └── protected-route.tsx
└── middleware.ts (route protection)

supabase/
└── migrations/
    └── create_profiles_table.sql
```

## Testing

After setting up Supabase:

1. Visit `/auth/sign-up` to create a test account
2. Check your email for verification link
3. Visit `/auth/sign-in` to log in
4. Access `/dashboard` (protected route)
5. Test password reset at `/auth/reset-password`

## Deployment to Vercel

1. Add environment variables in Vercel dashboard
2. The `middleware.ts` will automatically protect routes
3. Build passes without Supabase env vars (graceful degradation)
