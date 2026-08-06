-- Add catalog_category_id column to orders table for server-side price verification
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS catalog_category_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_catalog_category_id ON public.orders(catalog_category_id);
