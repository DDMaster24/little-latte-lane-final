-- Fix Profile Creation RLS Policy
-- Allow users to insert their own profile during signup

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Profiles insert policy" ON "public"."profiles";

-- Create a proper insert policy that allows:
-- 1. Service role (for admin operations)
-- 2. Users creating their own profile (auth.uid() = id)
CREATE POLICY "Profiles insert policy" ON "public"."profiles"
FOR INSERT WITH CHECK (
  (SELECT auth.role()) = 'service_role'::text OR 
  (SELECT auth.uid()) = id
);
