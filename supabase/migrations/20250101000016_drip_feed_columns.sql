-- Drip-feed support on orders
-- runs = number of delivery runs (provider-native schedule)
-- interval = interval in minutes between runs
-- Both nullable. NULL means a normal instant order.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS "runs" INTEGER CHECK ("runs" > 0),
  ADD COLUMN IF NOT EXISTS "interval" INTEGER CHECK ("interval" > 0);

CREATE INDEX IF NOT EXISTS idx_orders_runs ON public.orders("runs") WHERE "runs" IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_interval ON public.orders("interval") WHERE "interval" IS NOT NULL;
