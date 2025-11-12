-- ============================================
-- RLS Policies for hall-bookings Storage Bucket
-- ============================================
-- This file contains all the Row Level Security policies needed for the hall-bookings storage bucket
-- Run these in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- ============================================
-- 1. Allow authenticated users to UPLOAD files to hall-bookings bucket
-- ============================================
-- This allows logged-in users to upload bank proof and other booking-related files
-- Files are named with user ID, so users can only upload files with their own user ID in the name

CREATE POLICY "Authenticated users can upload to hall-bookings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hall-bookings' AND
  (storage.foldername(name))[1] = '' AND
  (auth.uid())::text = (regexp_match(name, 'bank-proof-([a-f0-9-]+)-'))[1]
);

-- ============================================
-- 2. Allow authenticated users to READ their own files
-- ============================================
-- Users can view files that contain their user ID in the filename

CREATE POLICY "Authenticated users can view their own files in hall-bookings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'hall-bookings' AND
  (auth.uid())::text = (regexp_match(name, 'bank-proof-([a-f0-9-]+)-'))[1]
);

-- ============================================
-- 3. Allow public READ access to hall-bookings (since bucket is public)
-- ============================================
-- This allows anyone to view files if they have the direct URL
-- Useful for admins viewing bank proof in admin panel

CREATE POLICY "Public read access for hall-bookings"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'hall-bookings');

-- ============================================
-- 4. Allow authenticated users to UPDATE their own files
-- ============================================
-- Users can update/replace files that contain their user ID

CREATE POLICY "Authenticated users can update their own files in hall-bookings"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hall-bookings' AND
  (auth.uid())::text = (regexp_match(name, 'bank-proof-([a-f0-9-]+)-'))[1]
)
WITH CHECK (
  bucket_id = 'hall-bookings' AND
  (auth.uid())::text = (regexp_match(name, 'bank-proof-([a-f0-9-]+)-'))[1]
);

-- ============================================
-- 5. Allow authenticated users to DELETE their own files
-- ============================================
-- Users can delete files that contain their user ID
-- Useful if they uploaded wrong file and need to re-upload

CREATE POLICY "Authenticated users can delete their own files in hall-bookings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hall-bookings' AND
  (auth.uid())::text = (regexp_match(name, 'bank-proof-([a-f0-9-]+)-'))[1]
);

-- ============================================
-- ALTERNATIVE: Simpler policies (if above regex approach causes issues)
-- ============================================
-- Comment out the above policies and use these instead if needed:

/*
-- Simple: Allow all authenticated users to upload
CREATE POLICY "Authenticated users can upload to hall-bookings (simple)"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hall-bookings');

-- Simple: Allow authenticated users to view all files in bucket
CREATE POLICY "Authenticated users can view hall-bookings (simple)"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'hall-bookings');

-- Simple: Public read access
CREATE POLICY "Public read access for hall-bookings (simple)"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'hall-bookings');

-- Simple: Allow authenticated users to update any file
CREATE POLICY "Authenticated users can update hall-bookings (simple)"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'hall-bookings')
WITH CHECK (bucket_id = 'hall-bookings');

-- Simple: Allow authenticated users to delete any file
CREATE POLICY "Authenticated users can delete hall-bookings (simple)"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'hall-bookings');
*/

-- ============================================
-- Verification Queries
-- ============================================
-- Run these to verify your policies were created successfully:

-- Check all policies for the hall-bookings bucket
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%hall-bookings%'
ORDER BY policyname;

-- Check if RLS is enabled on storage.objects table
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';
