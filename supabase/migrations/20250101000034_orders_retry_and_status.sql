-- Add retry tracking columns to orders
-- Run this migration in your Supabase dashboard: SQL Editor

-- Add retry tracking columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0 NOT NULL,
  ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP WITH TIME ZONE;

-- Add distinct status for disabled fulfillment
-- Update CHECK constraint to include new statuses
ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_fulfillment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_fulfillment_status_check
  CHECK (fulfillment_status IN ('pending', 'processing', 'fulfilled', 'failed', 'cancelled', 'refunded', 'fulfillment_disabled', 'retry_pending'));

CREATE INDEX IF NOT EXISTS idx_orders_retry_count ON public.orders(retry_count);
CREATE INDEX IF NOT EXISTS idx_orders_next_retry_at ON public.orders(next_retry_at) WHERE next_retry_at IS NOT NULL;