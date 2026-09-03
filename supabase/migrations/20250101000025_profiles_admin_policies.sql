-- Add admin SELECT-all policy to profiles
-- Allows admin-role users to read all profile rows via the anon/authenticated key
-- FIX: Use auth.users instead of profiles to avoid recursive RLS self-reference

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    auth.users.raw_user_meta_data->>'role' = 'admin'
  );

-- Add admin UPDATE-all policy to profiles for support tooling
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    auth.users.raw_user_meta_data->>'role' = 'admin'
  );
