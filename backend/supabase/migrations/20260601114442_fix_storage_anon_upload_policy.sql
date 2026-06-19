
-- Drop old policies and recreate with explicit roles
DROP POLICY IF EXISTS "anon_upload_assets" ON storage.objects;
DROP POLICY IF EXISTS "anon_update_assets" ON storage.objects;

CREATE POLICY "anon_upload_assets" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'assets');

CREATE POLICY "anon_update_assets" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'assets');
