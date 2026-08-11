-- Janjez service configuration layer
-- This table holds customer-facing services with KSh selling prices,
-- mapped to a single provider service from provider_services.

-- Add capability flags to provider_services
ALTER TABLE public.provider_services
  ADD COLUMN IF NOT EXISTS supports_drip_feed BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE NOT NULL;

CREATE INDEX IF NOT EXISTS idx_provider_services_active ON public.provider_services(is_active) WHERE is_active = TRUE;

-- Janjez customer-facing services
CREATE TABLE IF NOT EXISTS public.janjez_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  selling_price_ksh DECIMAL(10, 4) NOT NULL CHECK (selling_price_ksh > 0),
  provider_service_id TEXT REFERENCES public.provider_services(id) ON DELETE RESTRICT,
  min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
  max_quantity INTEGER NOT NULL CHECK (max_quantity > 0),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  supports_drip_feed BOOLEAN DEFAULT FALSE NOT NULL,
  supports_refill BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.janjez_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage janjez services" ON public.janjez_services;
CREATE POLICY "Admins can manage janjez services" ON public.janjez_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Public read for active services only (used by customer order flow)
DROP POLICY IF EXISTS "Active services visible to all" ON public.janjez_services;
CREATE POLICY "Active services visible to all" ON public.janjez_services
  FOR SELECT USING ("is_active" = TRUE);

CREATE INDEX IF NOT EXISTS idx_janjez_services_slug ON public.janjez_services(slug);
CREATE INDEX IF NOT EXISTS idx_janjez_services_category ON public.janjez_services(category);
CREATE INDEX IF NOT EXISTS idx_janjez_services_active ON public.janjez_services(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_janjez_services_provider_service ON public.janjez_services(provider_service_id);
CREATE INDEX IF NOT EXISTS idx_janjez_services_display_order ON public.janjez_services(display_order);

-- Track which ORDER_SERVICES catalog id maps to a janjez service
-- This lets the order API resolve the provider mapping server-side
CREATE INDEX IF NOT EXISTS idx_janjez_services_provider_order_id_idx ON public.janjez_services(id);

-- Trigger for updated_at
DROP FUNCTION IF EXISTS public.update_janjez_service_timestamp();
CREATE OR REPLACE FUNCTION public.update_janjez_service_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_janjez_service_updated ON public.janjez_services;
CREATE TRIGGER on_janjez_service_updated
  BEFORE UPDATE ON public.janjez_services
  FOR EACH ROW EXECUTE FUNCTION public.update_janjez_service_timestamp();
