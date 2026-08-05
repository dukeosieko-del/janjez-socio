-- Extend profiles table with UI and settings columns
-- Run this migration in your Supabase dashboard: SQL Editor

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS notification_email BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN IF NOT EXISTS notification_sms BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark' NOT NULL,
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' NOT NULL;

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_profile_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profile_timestamp();
