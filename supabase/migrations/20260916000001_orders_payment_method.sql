-- Business Side integration — payment method tracking on orders
-- Additive only, nullable, no default. Existing orders remain valid.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

COMMENT ON COLUMN public.orders.payment_method IS
  'Payment source for Business Side orders: wallet, mpesa, manual. NULL for direct customer orders.';