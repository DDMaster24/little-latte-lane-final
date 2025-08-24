-- FIX THEME_SETTINGS RLS POLICIES FOR VISUAL EDITOR
-- Run this script in Supabase SQL Editor to fix the Row Level Security issues

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "theme_settings_read_policy" ON public.theme_settings;
DROP POLICY IF EXISTS "theme_settings_admin_policy" ON public.theme_settings;

-- Create a more permissive read policy (allows everyone to read theme settings)
CREATE POLICY "theme_settings_read_policy" ON public.theme_settings
    FOR SELECT USING (true);

-- Create admin policy that allows authenticated users to manage theme settings
-- This is more permissive for testing - in production you might want to restrict to admins only
CREATE POLICY "theme_settings_admin_policy" ON public.theme_settings
    FOR ALL USING (
        -- Allow if user is authenticated (for testing)
        auth.uid() IS NOT NULL
    );

-- Alternative: If you want to restrict to admin users only, use this instead:
-- CREATE POLICY "theme_settings_admin_policy" ON public.theme_settings
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM public.profiles 
--             WHERE id = auth.uid() AND is_admin = true
--         )
--     );

-- Grant additional permissions to ensure access
GRANT SELECT ON public.theme_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.theme_settings TO authenticated;
GRANT ALL ON public.theme_settings TO service_role;

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'theme_settings';
