-- ========================================
-- CREATE ADMIN USER FOR LITTLE LATTE LANE
-- ========================================
-- Email: admin@littlelattelane.co.za
-- Access: Full admin and staff privileges
-- Date: August 30, 2025

-- Step 1: Create the user in auth.users table (if not exists)
-- Note: In production, this user should sign up normally first, then run Step 2
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  role,
  aud,
  confirmation_token,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@littlelattelane.co.za',
  crypt('AdminPassword123!', gen_salt('bf')), -- Change this password!
  now(),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"email": "admin@littlelattelane.co.za", "full_name": "System Administrator"}',
  false,
  'authenticated',
  'authenticated',
  '',
  '',
  ''
) ON CONFLICT (email) DO NOTHING;

-- Step 2: Create/Update profile with full admin privileges
-- This will work whether the user exists or not
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  is_admin,
  is_staff,
  role,
  phone,
  address,
  created_at,
  updated_at
) 
SELECT 
  u.id,
  'admin@littlelattelane.co.za',
  'System Administrator',
  true,  -- Full admin access
  true,  -- Staff access as well
  'admin',
  '+27 79 504 1412', -- Default phone
  'Roberts Estate Community Centre, Middelburg', -- Default address
  now(),
  now()
FROM auth.users u 
WHERE u.email = 'admin@littlelattelane.co.za'
ON CONFLICT (id) 
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  is_admin = true,
  is_staff = true,
  role = 'admin',
  phone = COALESCE(profiles.phone, EXCLUDED.phone),
  address = COALESCE(profiles.address, EXCLUDED.address),
  updated_at = now();

-- Step 3: Verify the admin user was created/updated correctly
SELECT 
  p.id,
  p.email,
  p.full_name,
  p.is_admin,
  p.is_staff,
  p.role,
  p.created_at,
  u.email_confirmed_at,
  u.last_sign_in_at
FROM public.profiles p
JOIN auth.users u ON p.id = u.id
WHERE p.email = 'admin@littlelattelane.co.za';

-- ========================================
-- ALTERNATIVE: If user already exists (RECOMMENDED)
-- ========================================
-- If the user has already signed up normally, just run this simpler update:

/*
UPDATE public.profiles 
SET 
  is_admin = true,
  is_staff = true,
  role = 'admin',
  full_name = COALESCE(full_name, 'System Administrator'),
  updated_at = now()
WHERE email = 'admin@littlelattelane.co.za';

-- Verify the update
SELECT 
  id,
  email,
  full_name,
  is_admin,
  is_staff,
  role,
  created_at,
  updated_at
FROM public.profiles 
WHERE email = 'admin@littlelattelane.co.za';
*/

-- ========================================
-- SECURITY NOTES
-- ========================================
-- 1. Change the default password immediately after first login
-- 2. Ensure MFA is enabled for this admin account
-- 3. Use a strong, unique password
-- 4. Consider using a dedicated admin email domain
-- 5. Regularly audit admin access and permissions

-- ========================================
-- ADMIN CAPABILITIES GRANTED
-- ========================================
-- ✅ Full admin panel access (/admin)
-- ✅ Staff panel access (/staff) 
-- ✅ Kitchen view access (/staff/kitchen-view)
-- ✅ Page editor access (/admin/page-editor)
-- ✅ Homepage editor access (/admin/page-editor/homepage)
-- ✅ Carousel editor access (/admin/carousel-editor)
-- ✅ All element editing capabilities
-- ✅ Order management and status updates
-- ✅ User management capabilities
-- ✅ System configuration access
-- ✅ Payment and webhook monitoring
-- ✅ Database management through admin interface

COMMIT;
