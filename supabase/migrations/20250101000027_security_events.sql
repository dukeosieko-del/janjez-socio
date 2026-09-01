-- Security events log for sign-in monitoring and account audit history
-- Idempotent: safe to apply multiple times.

CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('signin', 'password_reset_requested', 'password_reset_completed')),
  ip TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_events_user_id_created_at
  ON public.security_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_security_events_event_type_created_at
  ON public.security_events (event_type, created_at DESC);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "security_events_select_own" ON public.security_events;
CREATE POLICY "security_events_select_own"
  ON public.security_events
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "security_events_service_role_insert" ON public.security_events;
CREATE POLICY "security_events_service_role_insert"
  ON public.security_events
  FOR INSERT
  WITH CHECK (true);