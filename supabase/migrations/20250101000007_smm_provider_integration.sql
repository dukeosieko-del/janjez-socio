-- SMM Provider Integration tables
-- Run this migration in your Supabase dashboard: SQL Editor

-- Provider service catalog cache
CREATE TABLE IF NOT EXISTS public.provider_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  category TEXT,
  rate DECIMAL(10, 5) NOT NULL,
  min INTEGER NOT NULL,
  max INTEGER NOT NULL,
  refill BOOLEAN DEFAULT FALSE,
  cancel BOOLEAN DEFAULT FALSE,
  raw JSONB,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.provider_services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage provider services" ON public.provider_services;
CREATE POLICY "Admins can manage provider services" ON public.provider_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_provider_services_category ON public.provider_services(category);
CREATE INDEX IF NOT EXISTS idx_provider_services_rate ON public.provider_services(rate);
CREATE INDEX IF NOT EXISTS idx_provider_services_fetched_at ON public.provider_services(fetched_at DESC);

-- Service mappings: janjez service -> provider service
CREATE TABLE IF NOT EXISTS public.service_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_id TEXT NOT NULL,
  subcategory_name TEXT NOT NULL,
  deliverable_name TEXT NOT NULL,
  provider_service_id TEXT NOT NULL REFERENCES public.provider_services(id) ON DELETE CASCADE,
  match_reason TEXT DEFAULT 'cheapest' CHECK (match_reason IN ('cheapest', 'manual', 'alias')),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(platform_id, subcategory_name, deliverable_name)
);

ALTER TABLE public.service_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage service mappings" ON public.service_mappings;
CREATE POLICY "Admins can manage service mappings" ON public.service_mappings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_service_mappings_platform ON public.service_mappings(platform_id);
CREATE INDEX IF NOT EXISTS idx_service_mappings_provider_service ON public.service_mappings(provider_service_id);
CREATE INDEX IF NOT EXISTS idx_service_mappings_active ON public.service_mappings(is_active) WHERE is_active = TRUE;

-- Provider order references
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS provider_service_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_order_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_status TEXT,
  ADD COLUMN IF NOT EXISTS provider_start_count TEXT,
  ADD COLUMN IF NOT EXISTS provider_remains TEXT,
  ADD COLUMN IF NOT EXISTS provider_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS provider_charge DECIMAL(10, 5),
  ADD COLUMN IF NOT EXISTS fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'fulfilled', 'failed', 'cancelled', 'refunded')),
  ADD COLUMN IF NOT EXISTS fulfillment_error TEXT,
  ADD COLUMN IF NOT EXISTS fulfilled_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_orders_fulfillment_status ON public.orders(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_orders_provider_order_id ON public.orders(provider_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_provider_service_id ON public.orders(provider_service_id);

-- Fulfillment logs
CREATE TABLE IF NOT EXISTS public.fulfillment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  provider_order_id TEXT,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  request_payload JSONB,
  response_payload JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.fulfillment_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view fulfillment logs" ON public.fulfillment_logs;
CREATE POLICY "Admins can view fulfillment logs" ON public.fulfillment_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "System can insert fulfillment logs" ON public.fulfillment_logs;
CREATE POLICY "System can insert fulfillment logs" ON public.fulfillment_logs
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_fulfillment_logs_order_id ON public.fulfillment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_logs_created_at ON public.fulfillment_logs(created_at DESC);

-- Trigger for updated_at
DROP FUNCTION IF EXISTS public.update_service_mapping_timestamp();
CREATE OR REPLACE FUNCTION public.update_service_mapping_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_service_mapping_updated ON public.service_mappings;
CREATE OR REPLACE TRIGGER on_service_mapping_updated
  BEFORE UPDATE ON public.service_mappings
  FOR EACH ROW EXECUTE FUNCTION public.update_service_mapping_timestamp();
