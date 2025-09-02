-- Setup Storage Buckets for Image Upload System
-- Execute this in Supabase SQL Editor: https://supabase.com/dashboard/project/awytuszmunxvthuizyur/sql/new

-- Create storage buckets for different types of images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('images', 'images', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('logos', 'logos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Create storage policies for public access to images
CREATE POLICY "Public read access for images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

CREATE POLICY "Public read access for logos" ON storage.objects
FOR SELECT USING (bucket_id = 'logos');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can upload logos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'logos' AND 
  auth.role() = 'authenticated'
);

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own images" ON storage.objects
FOR UPDATE USING (
  bucket_id IN ('images', 'logos') AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own images" ON storage.objects
FOR DELETE USING (
  bucket_id IN ('images', 'logos') AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Insert default header logo setting if not exists
INSERT INTO public.theme_settings (setting_key, setting_value, page_scope, category)
VALUES ('header-logo', '/images/logo.png', 'global', 'visual')
ON CONFLICT (setting_key, page_scope) DO NOTHING;

-- Verify the setup
SELECT 'Storage buckets created:' as status;
SELECT id, name, public, file_size_limit from storage.buckets WHERE id IN ('images', 'logos');

SELECT 'Storage policies created:' as status;
SELECT schemaname, tablename, policyname from pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

SELECT 'Theme settings verified:' as status;
SELECT setting_key, setting_value, page_scope from public.theme_settings WHERE setting_key = 'header-logo';
