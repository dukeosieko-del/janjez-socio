-- Contact messages table for admin fulfillment tracking
-- Migration for janjez.social contact form persistence

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  department TEXT DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'read', 'in_progress', 'resolved', 'spam')),
  source TEXT DEFAULT 'contact_form',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Indexes for admin queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_department ON public.contact_messages(department);

-- RLS: public can insert, only admin can read/update
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON public.contact_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin read" ON public.contact_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Allow admin update" ON public.contact_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
