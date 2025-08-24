-- Fix Address Field Issues
-- Run this in Supabase SQL Editor

-- 1. First, let's check the current address column type
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
  AND column_name = 'address';

-- 2. If address is not a text field, fix it
-- (Only run if needed based on step 1 results)
ALTER TABLE public.profiles 
ALTER COLUMN address TYPE text;

-- 3. Clean up duplicate phone fields (keep 'phone', remove 'phone_number')
-- Check if both exist first
SELECT 
  column_name, 
  data_type
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
  AND column_name IN ('phone', 'phone_number');

-- 4. If phone_number exists, migrate data and drop it
-- Copy data from phone_number to phone where phone is null
UPDATE public.profiles 
SET phone = phone_number 
WHERE phone IS NULL AND phone_number IS NOT NULL;

-- Drop the duplicate phone_number column
-- ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone_number;

-- 5. Update the handle_new_user function to properly handle address
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    address,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'username'
    ),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'address',  -- This should now work correctly
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- 6. Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Verify the fix
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
