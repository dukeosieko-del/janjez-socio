-- Add human-readable order_id column for order references (ORD-XXXX format)
-- This column is populated by the orders API and displayed in the UI

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_id TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id);
