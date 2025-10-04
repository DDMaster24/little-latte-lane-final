-- Add Address Field to handle_new_user() Trigger
-- Fixes issue where address metadata from signup was not being saved to profiles table

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    phone,
    phone_number,
    address,
    role,
    is_admin,
    is_staff,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'phone', NEW.raw_user_meta_data->>'phone_number'),
    COALESCE(NEW.raw_user_meta_data->>'phone_number', NEW.raw_user_meta_data->>'phone'),
    NEW.raw_user_meta_data->>'address', -- ✅ NEW: Extract address from metadata
    'customer',
    false,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    phone = COALESCE(EXCLUDED.phone, profiles.phone),
    phone_number = COALESCE(EXCLUDED.phone_number, profiles.phone_number),
    address = COALESCE(EXCLUDED.address, profiles.address), -- ✅ NEW: Update address on conflict
    updated_at = NOW();
    
  RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates user profile on auth.users insert with address metadata support';
