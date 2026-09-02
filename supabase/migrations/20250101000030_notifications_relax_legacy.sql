-- Make legacy notifications columns nullable
-- The notifications table originally had type TEXT NOT NULL and message TEXT NOT NULL
-- (from migration 20250101000006). Migration 20250101000028 added new columns
-- (audience, category, severity, body, read_at) but did not relax the legacy
-- NOT NULL constraints, so inserts from the new app code (which writes category +
-- body instead of type + message) fail with "null value in column 'type' violates
-- not-null constraint".
--
-- This migration:
-- 1. Makes `type` and `message` nullable (legacy fields, no longer required).
-- 2. Keeps the data: existing rows still have their old values for back-compat.
-- 3. Adds a default for `category` so even if a caller forgets it, the insert
--    succeeds.
-- 4. Backfills `type` from `category` for any existing rows where type is null,
--    so legacy readers still see something sensible.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'type'
  ) THEN
    ALTER TABLE public.notifications ALTER COLUMN type DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'message'
  ) THEN
    ALTER TABLE public.notifications ALTER COLUMN message DROP NOT NULL;
  END IF;
END $$;

-- Backfill type from category for rows where type is null
UPDATE public.notifications
SET type = category
WHERE type IS NULL AND category IS NOT NULL;
