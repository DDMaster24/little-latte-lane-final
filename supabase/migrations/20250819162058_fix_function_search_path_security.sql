-- Fix Function Search Path Security Warnings
-- Sets explicit search_path for all functions to prevent security vulnerabilities

-- 1. Fix get_user_role function
CREATE OR REPLACE FUNCTION public.get_user_role()
 RETURNS text
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_role')::text,
    'customer'
  );
$function$;

-- 2. Fix handle_new_user function  
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
    updated_at = NOW();
    
  RETURN NEW;
END;
$function$;

-- 3. Fix is_admin function
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT public.get_user_role() = 'admin';
$function$;

-- 4. Fix is_staff_or_admin function
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
 RETURNS boolean
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path = public
AS $function$
  SELECT public.get_user_role() IN ('staff', 'admin');
$function$;

-- 5. Fix set_order_number function
CREATE OR REPLACE FUNCTION public.set_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Only set order_number if it's null (allows manual override if needed)
  IF NEW.order_number IS NULL THEN
    NEW.order_number = 'LL' || nextval('order_number_seq');
  END IF;
  RETURN NEW;
END;
$function$;

-- Add comment for documentation
COMMENT ON FUNCTION public.get_user_role() IS 'Returns user role from JWT with fixed search_path for security';
COMMENT ON FUNCTION public.handle_new_user() IS 'Auto-creates user profile on auth.users insert with fixed search_path for security';
COMMENT ON FUNCTION public.is_admin() IS 'Checks if current user is admin with fixed search_path for security';
COMMENT ON FUNCTION public.is_staff_or_admin() IS 'Checks if current user is staff or admin with fixed search_path for security';
COMMENT ON FUNCTION public.set_order_number() IS 'Auto-generates order numbers with fixed search_path for security';