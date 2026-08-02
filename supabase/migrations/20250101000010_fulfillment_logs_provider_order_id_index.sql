-- Add index on fulfillment_logs.provider_order_id for provider order lookups
-- Run this migration in your Supabase dashboard: SQL Editor

CREATE INDEX IF NOT EXISTS idx_fulfillment_logs_provider_order_id ON public.fulfillment_logs(provider_order_id);
