-- ============================================
-- MAKE ddmaster124@gmail.com SUPERUSER
-- Run this in Supabase SQL Editor
-- ============================================

-- Method 1: If the user already exists, just update their profile
UPDATE public.profiles 
SET 
  is_admin = true,
  is_staff = true,
  updated_at = NOW()
WHERE email = 'ddmaster124@gmail.com';

-- Method 2: If user doesn't exist yet, first sign up normally through the app,
-- then run this update query above

-- Verify the change worked
SELECT 
  id,
  email,
  full_name,
  is_admin,
  is_staff,
  created_at,
  updated_at
FROM public.profiles 
WHERE email = 'ddmaster124@gmail.com';

-- ============================================
-- EXPECTED RESULT AFTER RUNNING:
-- ============================================
-- The user ddmaster124@gmail.com should show:
-- - is_admin: true
-- - is_staff: true
-- - All other data preserved
-- ============================================
