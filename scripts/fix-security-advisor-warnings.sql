-- ====================================================================
-- SUPABASE SECURITY ADVISOR FIXES
-- Date: October 7, 2025
-- Purpose: Address all 7 security warnings from Supabase Security Advisor
-- ====================================================================

-- ====================================================================
-- PART 1: FIX FUNCTION SEARCH_PATH WARNINGS (5 functions)
-- ====================================================================

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

-- ====================================================================
-- PART 2: LEAKED PASSWORD PROTECTION (Manual Dashboard Action Required)
-- ====================================================================
-- ⚠️ WARNING: This setting CANNOT be enabled via SQL
-- 
-- TO ENABLE LEAKED PASSWORD PROTECTION:
-- 1. Go to: https://supabase.com/dashboard/project/awytuszmunxvthuizyur/auth/providers
-- 2. Scroll to "Password Settings" section
-- 3. Enable "Leaked Password Protection"
-- 4. This will check passwords against HaveIBeenPwned.org database
--
-- Reference: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
-- ====================================================================

-- ====================================================================
-- PART 3: POSTGRES VERSION UPGRADE (Manual Dashboard Action Required)
-- ====================================================================
-- ⚠️ WARNING: Postgres upgrades MUST be done through Supabase Dashboard
--
-- TO UPGRADE POSTGRES:
-- 1. Go to: https://supabase.com/dashboard/project/awytuszmunxvthuizyur/settings/infrastructure
-- 2. Look for "Database Version" section
-- 3. Click "Upgrade" if available
-- 4. Follow the upgrade wizard (includes automatic backups)
--
-- Current Version: supabase-postgres-17.4.1.074
-- Action: Apply latest security patches
--
-- Reference: https://supabase.com/docs/guides/platform/upgrading
-- ====================================================================

-- ====================================================================
-- VERIFICATION QUERIES
-- ====================================================================

-- Check if functions have search_path set (should show 'public, pg_temp')
SELECT 
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  CASE 
    WHEN p.proconfig IS NULL THEN 'NOT SET ❌'
    ELSE array_to_string(p.proconfig, ', ') 
  END as search_path_config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN (
    'handle_updated_at',
    'update_carousel_panels_updated_at', 
    'update_updated_at_column',
    'update_restaurant_closures_updated_at',
    'update_notification_updated_at'
  )
ORDER BY p.proname;

-- ====================================================================
-- EXPECTED OUTPUT AFTER RUNNING THIS SCRIPT:
-- ====================================================================
-- ✅ 5/7 warnings fixed automatically (function search_path)
-- ⚠️ 1/7 requires manual action (leaked password protection - dashboard only)
-- ⚠️ 1/7 requires manual action (postgres upgrade - dashboard only)
-- 
-- TOTAL: 5 automated fixes + 2 manual dashboard actions = 7 warnings addressed
-- ====================================================================
