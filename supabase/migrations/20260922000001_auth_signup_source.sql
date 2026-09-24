-- A2: Auth tagging — signup_source across the Business Side ↔ Main Build bridge
--
-- The main build's `profiles` table is the authoritative source of truth for
-- user identity. The business-side's `partners` table mirrors key fields.
-- Both need a `signup_source` column so analytics can distinguish users who
-- originated from the business-side vs the main build.
--
-- This migration is ADDITIVE — no existing data is modified or dropped.

-- 1. Main build profiles: add signup_source (nullable for existing users)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS signup_source TEXT DEFAULT 'main'
  CHECK (signup_source IN ('main', 'business-side', 'reseller', 'child-panel', 'affiliate'));

CREATE INDEX IF NOT EXISTS idx_profiles_signup_source ON public.profiles(signup_source);

-- 2. Business-side partners: add signup_source (nullable for existing partners)
ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS signup_source TEXT DEFAULT 'main'
  CHECK (signup_source IN ('main', 'business-side', 'reseller', 'child-panel', 'affiliate'));

CREATE INDEX IF NOT EXISTS idx_partners_signup_source ON partners(signup_source);

-- 3. Business-side child_users: add signup_source for child panel users
ALTER TABLE child_users
  ADD COLUMN IF NOT EXISTS signup_source TEXT DEFAULT 'child-panel'
  CHECK (signup_source IN ('main', 'business-side', 'reseller', 'child-panel', 'affiliate'));

-- 4. Business-side affiliates: add signup_source for affiliate users
ALTER TABLE affiliates
  ADD COLUMN IF NOT EXISTS signup_source TEXT DEFAULT 'affiliate'
  CHECK (signup_source IN ('main', 'business-side', 'reseller', 'child-panel', 'affiliate'));

-- 5. Backfill existing rows (defensive — should be no-ops if defaults applied)
UPDATE public.profiles SET signup_source = 'main' WHERE signup_source IS NULL;
UPDATE partners SET signup_source = 'main' WHERE signup_source IS NULL;
UPDATE child_users SET signup_source = 'child-panel' WHERE signup_source IS NULL;
UPDATE affiliates SET signup_source = 'affiliate' WHERE signup_source IS NULL;