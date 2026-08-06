-- Storage setup for avatars bucket
-- Note: In Supabase, storage buckets may need to be created via Dashboard or CLI first.
-- This migration creates the bucket record and policies.

-- Create avatars bucket (public read, authenticated upload)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
DROP POLICY IF EXISTS "Avatar files are publicly accessible" ON storage.objects;
CREATE POLICY "Avatar files are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
CREATE POLICY "Users can update own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;
CREATE POLICY "Users can delete own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
