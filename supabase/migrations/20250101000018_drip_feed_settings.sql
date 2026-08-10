-- Drip-feed global settings
CREATE TABLE IF NOT EXISTS public.drip_feed_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled BOOLEAN DEFAULT TRUE NOT NULL,
  min_runs INTEGER NOT NULL CHECK (min_runs >= 1),
  max_runs INTEGER NOT NULL CHECK (max_runs >= 1),
  min_interval INTEGER NOT NULL CHECK (min_interval >= 1),
  max_interval INTEGER NOT NULL CHECK (max_interval >= 1),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.drip_feed_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage drip feed settings" ON public.drip_feed_settings;
CREATE POLICY "Admins can manage drip feed settings" ON public.drip_feed_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Public can view drip feed settings" ON public.drip_feed_settings;
CREATE POLICY "Public can view drip feed settings" ON public.drip_feed_settings
  FOR SELECT USING (true);

-- Seed default row if none exists
INSERT INTO public.drip_feed_settings (id, enabled, min_runs, max_runs, min_interval, max_interval)
SELECT gen_random_uuid(), TRUE, 1, 10, 1, 1440
WHERE NOT EXISTS (SELECT 1 FROM public.drip_feed_settings);
