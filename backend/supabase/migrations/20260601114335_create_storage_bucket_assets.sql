
-- Create public storage bucket for OPA assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('assets', 'assets', true, 10485760, ARRAY['image/png','image/jpeg','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read public assets
CREATE POLICY "public_read_assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'assets');

-- Allow anon to upload assets (for seeding)
CREATE POLICY "anon_upload_assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'assets');

-- Allow anon to update assets
CREATE POLICY "anon_update_assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'assets');
