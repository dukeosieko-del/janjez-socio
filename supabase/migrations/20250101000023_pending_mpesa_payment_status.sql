-- Fix orders payment_status CHECK constraint to support pending_mpesa for anonymous orders

ALTER TABLE public.orders
  DROP CONSTRAINT IF EXISTS orders_payment_status_check;

ALTER TABLE public.orders
  ADD CONSTRAINT orders_payment_status_check
  CHECK (payment_status IN ('unpaid', 'pending_mpesa', 'paid', 'refunded'));
