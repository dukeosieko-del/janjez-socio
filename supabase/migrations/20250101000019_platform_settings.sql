-- Global platform settings: drip-feed schedule constraints
-- Enforced alongside per-service capability flags

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_settings_key_idx ON public.platform_settings(key);

-- Seed default drip-feed constraints
INSERT INTO public.platform_settings (key, value)
VALUES (
  'drip_feed_limits',
  '{"enabled": true, "min_runs": 1, "max_runs": 20, "min_interval": 10, "max_interval": 1440}'::jsonb
)
ON CONFLICT (key) DO NOTHING;
