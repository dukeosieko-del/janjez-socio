-- Add admin SELECT-all policy to profiles
-- Allows admin-role users to read all profile rows via the anon/authenticated key
-- FIX: Use subquery against auth.users to avoid recursive RLS self-reference
-- (original policy queried profiles from within a policy ON profiles)

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );

-- Add admin UPDATE-all policy on profiles for support tooling
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()) = 'admin'
  );
