-- Track the last time a low wallet balance notification was emailed to a user
-- Used to debounce LOW_WALLET_BALANCE emails to once per 24 hours.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS last_low_balance_email_at TIMESTAMPTZ;