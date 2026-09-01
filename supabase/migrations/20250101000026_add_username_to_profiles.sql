-- Add username column to profiles table
-- Case-insensitive unique index, length/format check constraint

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

DROP INDEX IF EXISTS profiles_username_lower_unique_idx;
CREATE UNIQUE INDEX profiles_username_lower_unique_idx
  ON public.profiles (LOWER(username))
  WHERE username IS NOT NULL;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_username_format_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_username_format_check
  CHECK (
    username IS NULL
    OR (
      char_length(username) >= 3
      AND char_length(username) <= 30
      AND username ~ '^[a-z0-9_]+$'
    )
  );

DROP POLICY IF EXISTS "Users can update own profile username" ON public.profiles;
CREATE POLICY "Users can update own profile username" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated users can view usernames" ON public.profiles;
CREATE POLICY "Authenticated users can view usernames" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');
