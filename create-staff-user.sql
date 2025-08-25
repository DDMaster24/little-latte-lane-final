-- ============================================================================
-- SQL to create staff@littlelattelane.co.za as staff user
-- ============================================================================
-- Run these commands in Supabase SQL Editor
-- NOTE: This user must sign up through your app first, then run this SQL

-- Step 1: Verify the user exists in auth.users
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email = 'staff@littlelattelane.co.za';

-- Step 2: Update their profile to staff status
UPDATE profiles 
SET 
  is_staff = true,
  is_admin = false,
  updated_at = NOW()
WHERE email = 'staff@littlelattelane.co.za';

-- Step 3: Verify the staff promotion worked
SELECT 
  id,
  email,
  full_name,
  is_staff,
  is_admin,
  phone,
  created_at,
  updated_at,
  CASE 
    WHEN is_admin THEN 'Full Admin Access'
    WHEN is_staff THEN 'Staff Access (Kitchen View Only)'
    ELSE 'Customer Access'
  END as access_level
FROM profiles 
WHERE email = 'staff@littlelattelane.co.za';

-- ============================================================================
-- ALTERNATIVE: Create profile manually if user signed up but no profile exists
-- ============================================================================

-- First, get the auth user ID:
-- SELECT id FROM auth.users WHERE email = 'staff@littlelattelane.co.za';

-- Then create profile with that auth user ID:
-- INSERT INTO profiles (id, email, full_name, is_staff, is_admin, created_at, updated_at)
-- VALUES (
--   'REPLACE_WITH_AUTH_USER_ID',
--   'staff@littlelattelane.co.za',
--   'Kitchen Staff',
--   true,
--   false,
--   NOW(),
--   NOW()
-- );

-- ============================================================================
-- STAFF ACCESS VALIDATION QUERIES
-- ============================================================================

-- Check what permissions this staff user has:
SELECT 
  p.email,
  p.is_staff,
  p.is_admin,
  CASE 
    WHEN public.is_staff_or_admin() THEN 'Can access staff functions'
    ELSE 'No staff access'
  END as rls_test
FROM profiles p
WHERE p.email = 'staff@littlelattelane.co.za'
  AND p.id = auth.uid();

-- Verify staff can see orders (RLS test):
SELECT COUNT(*) as accessible_orders
FROM orders
WHERE public.is_staff_or_admin();

-- ============================================================================
-- KITCHEN-ONLY STAFF ROLE NOTES
-- ============================================================================
-- Based on updated requirements, staff users should:
-- 1. Be redirected to /staff/kitchen-view on login
-- 2. NOT have access to admin dashboard functions
-- 3. Only see kitchen workflow: order queue, status updates
-- 4. Have tablet-optimized interface for kitchen use
-- ============================================================================
