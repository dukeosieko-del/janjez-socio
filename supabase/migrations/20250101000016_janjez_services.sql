-- Janjez canonical service catalogue
-- Run this migration in your Supabase dashboard: SQL Editor

CREATE TABLE IF NOT EXISTS public.janjez_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  deliverable_name TEXT NOT NULL,
  provider_service_id TEXT REFERENCES public.provider_services(id) ON DELETE SET NULL,
  selling_price_ksh DECIMAL(10, 4) NOT NULL,
  provider_rate DECIMAL(10, 5) NOT NULL,
  min_quantity INTEGER NOT NULL DEFAULT 10,
  max_quantity INTEGER NOT NULL DEFAULT 10000,
  display_order INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT TRUE NOT NULL,
  supports_drip_feed BOOLEAN DEFAULT FALSE NOT NULL,
  supports_refill BOOLEAN DEFAULT FALSE NOT NULL,
  supports_cancel BOOLEAN DEFAULT FALSE NOT NULL,
  note TEXT,
  flag TEXT,
  raw JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(platform_id, subcategory, deliverable_name)
);

ALTER TABLE public.janjez_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage janjez services" ON public.janjez_services;
CREATE POLICY "Admins can manage janjez services"
  ON public.janjez_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Public can view published janjez services" ON public.janjez_services;
CREATE POLICY "Public can view published janjez services"
  ON public.janjez_services
  FOR SELECT USING (published = TRUE);

CREATE INDEX IF NOT EXISTS idx_janjez_services_platform ON public.janjez_services(platform_id);
CREATE INDEX IF NOT EXISTS idx_janjez_services_subcategory ON public.janjez_services(subcategory);
CREATE INDEX IF NOT EXISTS idx_janjez_services_published ON public.janjez_services(published) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_janjez_services_display_order ON public.janjez_services(display_order);
CREATE INDEX IF NOT EXISTS idx_janjez_services_provider_service ON public.janjez_services(provider_service_id);

CREATE OR REPLACE FUNCTION public.update_janjez_services_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_janjez_services_updated ON public.janjez_services;
CREATE TRIGGER on_janjez_services_updated
  BEFORE UPDATE ON public.janjez_services
  FOR EACH ROW EXECUTE FUNCTION public.update_janjez_services_timestamp();
