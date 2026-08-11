-- Canonical ordering: orders reference the Janjez service they were purchased against
-- janjez_services.provider_service_id is the authoritative provider link

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS janjez_service_id UUID REFERENCES public.janjez_services(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_janjez_service_id ON public.orders(janjez_service_id);

-- Capability flag for cancel on Janjez services
ALTER TABLE public.janjez_services
  ADD COLUMN IF NOT EXISTS supports_cancel BOOLEAN DEFAULT FALSE NOT NULL;
