-- Comprehensive in-app notifications system (v2)
-- Migration 20250101000028 failed previously because the original
-- `notifications` table (from 20250101000006) already exists with a
-- different shape (read BOOLEAN, type, message, no read_at).
--
-- This migration ALTERs the existing table to add the new fields and
-- replaces the legacy RLS policies with audience-aware ones.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'audience'
  ) THEN
    ALTER TABLE public.notifications
      ADD COLUMN audience TEXT NOT NULL DEFAULT 'user';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.notifications
      ADD COLUMN category TEXT NOT NULL DEFAULT 'system';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'severity'
  ) THEN
    ALTER TABLE public.notifications
      ADD COLUMN severity TEXT NOT NULL DEFAULT 'info';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'body'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN body TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'notifications' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE public.notifications ADD COLUMN read_at TIMESTAMPTZ;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_audience_check') THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_audience_check
      CHECK (audience IN ('user', 'admin'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_category_check') THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_category_check
      CHECK (category IN ('order', 'wallet', 'security', 'system', 'admin_alert'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notifications_severity_check') THEN
    ALTER TABLE public.notifications
      ADD CONSTRAINT notifications_severity_check
      CHECK (severity IN ('info', 'success', 'warning', 'error'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_read_at
  ON public.notifications (user_id, read_at);

CREATE INDEX IF NOT EXISTS idx_notifications_audience_created_at
  ON public.notifications (audience, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at
  ON public.notifications (user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service can insert notifications for users" ON public.notifications;
DROP POLICY IF EXISTS "notifications_select_own_or_admin_audience" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_select_all" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_insert" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_update_all" ON public.notifications;
DROP POLICY IF EXISTS "notifications_admin_delete_all" ON public.notifications;

CREATE POLICY "notifications_select_own_or_admin_audience"
  ON public.notifications
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR audience = 'admin'
  );

CREATE POLICY "notifications_update_own"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notifications_admin_select_all"
  ON public.notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

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
