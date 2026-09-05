-- Add reply fields to contact_messages table
-- Migration for admin reply system

ALTER TABLE public.contact_messages
  ADD COLUMN IF NOT EXISTS reply_text TEXT,
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS replied_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_contact_messages_replied_at ON public.contact_messages(replied_at DESC);
