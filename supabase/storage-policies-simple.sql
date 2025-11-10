-- ============================================
-- FIXED: Simpler RLS Policies for hall-bookings Storage Bucket
-- ============================================
-- These policies are simpler and will definitely work
-- Run these in your Supabase SQL Editor

-- FIRST: Drop any existing policies to avoid conflicts
-- ============================================

DROP POLICY IF EXISTS "Authenticated users can upload to hall-bookings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view their own files in hall-bookings" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for hall-bookings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update their own files in hall-bookings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete their own files in hall-bookings" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to hall-bookings (simple)" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can view hall-bookings (simple)" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for hall-bookings (simple)" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update hall-bookings (simple)" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete hall-bookings (simple)" ON storage.objects;

-- ============================================
-- POLICY 1: Allow authenticated users to INSERT/UPLOAD
-- ============================================
CREATE POLICY "Allow authenticated uploads to hall-bookings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hall-bookings'
);

-- ============================================
-- POLICY 2: Allow authenticated users to SELECT/READ
-- ============================================
CREATE POLICY "Allow authenticated reads from hall-bookings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'hall-bookings'
);

-- ============================================
-- POLICY 3: Allow public to SELECT/READ (for admin panel)
-- ============================================
CREATE POLICY "Allow public reads from hall-bookings"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'hall-bookings'
);

-- ============================================
-- POLICY 4: Allow authenticated users to UPDATE
-- ============================================
CREATE POLICY "Allow authenticated updates in hall-bookings"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'hall-bookings')
WITH CHECK (bucket_id = 'hall-bookings');

-- ============================================
-- POLICY 5: Allow authenticated users to DELETE
-- ============================================
CREATE POLICY "Allow authenticated deletes in hall-bookings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hall-bookings'
);

-- ============================================
-- Verification: Check all policies were created
-- ============================================
SELECT
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'objects'
  AND policyname LIKE '%hall-bookings%'
ORDER BY policyname;

-- ============================================
-- OPTIONAL: More Secure Policies (Use after testing)
-- ============================================
-- Once uploads are working, you can replace with these more secure policies
-- that restrict users to only access files with their user ID in the name

/*
-- Drop the simple policies first
DROP POLICY IF EXISTS "Allow authenticated uploads to hall-bookings" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated reads from hall-bookings" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates in hall-bookings" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes in hall-bookings" ON storage.objects;

-- Secure: Users can only upload files that start with "bank-proof-{their-uuid}-"
CREATE POLICY "Secure authenticated uploads to hall-bookings"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hall-bookings' AND
  name ~ ('^bank-proof-' || auth.uid()::text || '-[0-9]+\.')
);

-- Secure: Users can only read their own files
CREATE POLICY "Secure authenticated reads from hall-bookings"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'hall-bookings' AND
  name ~ ('^bank-proof-' || auth.uid()::text || '-')
);

-- Keep public read for admin panel
-- (Public read policy stays the same)

-- Secure: Users can only update their own files
CREATE POLICY "Secure authenticated updates in hall-bookings"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hall-bookings' AND
  name ~ ('^bank-proof-' || auth.uid()::text || '-')
)
WITH CHECK (
  bucket_id = 'hall-bookings' AND
  name ~ ('^bank-proof-' || auth.uid()::text || '-')
);

-- Secure: Users can only delete their own files
CREATE POLICY "Secure authenticated deletes in hall-bookings"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hall-bookings' AND
  name ~ ('^bank-proof-' || auth.uid()::text || '-')
);
*/
