-- Extend provider_services with additional fields for service management
ALTER TABLE public.provider_services
  ADD COLUMN IF NOT EXISTS provider_name TEXT DEFAULT 'DripFeedPanel',
  ADD COLUMN IF NOT EXISTS subcategory TEXT,
  ADD COLUMN IF NOT EXISTS supports_drip_feed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

CREATE INDEX IF NOT EXISTS idx_provider_services_provider_name ON public.provider_services(provider_name);
CREATE INDEX IF NOT EXISTS idx_provider_services_is_active ON public.provider_services(is_active);
CREATE INDEX IF NOT EXISTS idx_provider_services_subcategory ON public.provider_services(subcategory);

-- Janjez customer-facing service catalog
CREATE TABLE IF NOT EXISTS public.janjez_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  selling_price_ksh DECIMAL(10, 2) NOT NULL CHECK (selling_price_ksh >= 0),
  provider_service_id TEXT NOT NULL REFERENCES public.provider_services(id) ON DELETE RESTRICT,
  min_quantity INTEGER NOT NULL CHECK (min_quantity > 0),
  max_quantity INTEGER NOT NULL CHECK (max_quantity > 0),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  supports_drip_feed BOOLEAN DEFAULT FALSE NOT NULL,
  supports_refill BOOLEAN DEFAULT FALSE NOT NULL,
  supports_cancel BOOLEAN DEFAULT FALSE NOT NULL,
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

DROP POLICY IF EXISTS "Public can view active janjez services" ON public.janjez_services;
CREATE POLICY "Public can view active janjez services" ON public.janjez_services
  FOR SELECT USING (is_active = TRUE);

CREATE INDEX IF NOT EXISTS idx_janjez_services_category ON public.janjez_services(category);
CREATE INDEX IF NOT EXISTS idx_janjez_services_subcategory ON public.janjez_services(subcategory);
CREATE INDEX IF NOT EXISTS idx_janjez_services_is_active ON public.janjez_services(is_active);
CREATE INDEX IF NOT EXISTS idx_janjez_services_display_order ON public.janjez_services(display_order);
CREATE INDEX IF NOT EXISTS idx_janjez_services_provider_service ON public.janjez_services(provider_service_id);

-- Add janjez_service_id to orders for new service catalog
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS janjez_service_id UUID REFERENCES public.janjez_services(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_orders_janjez_service_id ON public.orders(janjez_service_id);

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
