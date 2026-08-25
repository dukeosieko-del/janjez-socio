-- Service placement controls for customer-facing surfaces
-- These flags control where active janjez_services are exposed without affecting fulfillment.

ALTER TABLE public.janjez_services
  ADD COLUMN IF NOT EXISTS show_sidebar BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS show_landing BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS show_guarded BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN IF NOT EXISTS show_anonymous BOOLEAN DEFAULT TRUE NOT NULL,
  ADD COLUMN IF NOT EXISTS show_catalogue BOOLEAN DEFAULT TRUE NOT NULL;

CREATE INDEX IF NOT EXISTS idx_janjez_services_show_sidebar ON public.janjez_services(show_sidebar) WHERE show_sidebar = TRUE;
CREATE INDEX IF NOT EXISTS idx_janjez_services_show_landing ON public.janjez_services(show_landing) WHERE show_landing = TRUE;
CREATE INDEX IF NOT EXISTS idx_janjez_services_show_guarded ON public.janjez_services(show_guarded) WHERE show_guarded = TRUE;
CREATE INDEX IF NOT EXISTS idx_janjez_services_show_anonymous ON public.janjez_services(show_anonymous) WHERE show_anonymous = TRUE;
CREATE INDEX IF NOT EXISTS idx_janjez_services_show_catalogue ON public.janjez_services(show_catalogue) WHERE show_catalogue = TRUE;
