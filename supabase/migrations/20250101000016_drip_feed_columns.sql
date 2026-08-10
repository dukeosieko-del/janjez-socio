-- Drip-feed configuration columns
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS runs INTEGER CHECK (runs > 0),
  ADD COLUMN IF NOT EXISTS interval INTEGER CHECK (interval > 0);

CREATE INDEX IF NOT EXISTS idx_orders_runs ON public.orders(runs);
CREATE INDEX IF NOT EXISTS idx_orders_interval ON public.orders(interval);
