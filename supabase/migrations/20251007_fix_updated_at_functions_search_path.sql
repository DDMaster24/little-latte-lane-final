-- Fix Remaining Function Search Path Security Warnings
-- Addresses Supabase Security Advisor warnings for updated_at trigger functions
-- Created: 2025-10-07

-- 1. Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 2. Fix update_carousel_panels_updated_at function
CREATE OR REPLACE FUNCTION public.update_carousel_panels_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 3. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 4. Fix update_restaurant_closures_updated_at function
CREATE OR REPLACE FUNCTION public.update_restaurant_closures_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 5. Fix update_notification_updated_at function
CREATE OR REPLACE FUNCTION public.update_notification_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public, pg_temp
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- Add documentation comments
COMMENT ON FUNCTION public.handle_updated_at() IS 'Auto-updates updated_at timestamp with fixed search_path for security';
COMMENT ON FUNCTION public.update_carousel_panels_updated_at() IS 'Auto-updates carousel_panels updated_at with fixed search_path for security';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Generic updated_at column updater with fixed search_path for security';
COMMENT ON FUNCTION public.update_restaurant_closures_updated_at() IS 'Auto-updates restaurant_closures updated_at with fixed search_path for security';
COMMENT ON FUNCTION public.update_notification_updated_at() IS 'Auto-updates notifications updated_at with fixed search_path for security';
