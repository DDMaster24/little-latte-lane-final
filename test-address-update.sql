-- STEP 1: Quick Test - Manually Update Address for Existing User
-- Run this first to test if address field works

-- Update the current user's address manually 
UPDATE public.profiles 
SET address = '123 Test Street, Test City, Test Province'
WHERE email = 'ddmaster124@gmail.com';

-- Check if it worked
SELECT 
  email,
  full_name,
  phone,
  address,
  address IS NULL as address_is_null,
  length(address) as address_length
FROM public.profiles 
WHERE email = 'ddmaster124@gmail.com';
