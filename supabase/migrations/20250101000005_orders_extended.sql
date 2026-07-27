-- Extend orders table for order confirmation and logging
-- Run this migration in your Supabase dashboard: SQL Editor

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS sku_id TEXT,
  ADD COLUMN IF NOT EXISTS link_submitted TEXT,
  ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS payment_reference TEXT,
  ADD COLUMN IF NOT EXISTS refill_guarantee TEXT,
  ADD COLUMN IF NOT EXISTS quantity_source TEXT CHECK (quantity_source IN ('preset', 'custom'));

CREATE INDEX IF NOT EXISTS idx_orders_sku_id ON public.orders(sku_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_reference ON public.orders(payment_reference);
