-- Comprehensive in-app notifications system
-- Adds structured notifications table with audience targeting,
-- severity, pagination, RLS, and realtime publication.

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  audience TEXT NOT NULL DEFAULT 'user'
    CHECK (audience IN ('user', 'admin')),
  category TEXT NOT NULL DEFAULT 'system'
    CHECK (category IN ('order', 'wallet', 'security', 'system', 'admin_alert')),
  title TEXT NOT NULL,
  body TEXT,
  link TEXT,
  severity TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('info', 'success', 'warning', 'error')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read_at
  ON public.notifications (user_id, read_at);

CREATE INDEX IF NOT EXISTS idx_notifications_audience_created_at
  ON public.notifications (audience, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at
  ON public.notifications (user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own_or_admin_audience" ON public.notifications;
CREATE POLICY "notifications_select_own_or_admin_audience"
  ON public.notifications
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR audience = 'admin'
  );

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_admin_select_all" ON public.notifications;
CREATE POLICY "notifications_admin_select_all"
  ON public.notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
CREATE POLICY "notifications_admin_insert"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "notifications_admin_update_all" ON public.notifications;
CREATE POLICY "notifications_admin_update_all"
  ON public.notifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "notifications_admin_delete_all" ON public.notifications;
CREATE POLICY "notifications_admin_delete_all"
  ON public.notifications
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
    OR auth.uid() = user_id
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
      AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  END IF;
END $$;