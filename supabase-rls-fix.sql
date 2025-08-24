-- RLS Policy Fix for theme_settings table
-- Execute this in Supabase SQL Editor

-- 1. First check current policies
SELECT 
    schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'theme_settings';

-- 2. Drop existing restrictive policies if any
DROP POLICY IF EXISTS "theme_settings_policy" ON public.theme_settings;
DROP POLICY IF EXISTS "Users can view theme settings" ON public.theme_settings;
DROP POLICY IF EXISTS "Users can insert theme settings" ON public.theme_settings;
DROP POLICY IF EXISTS "Users can update theme settings" ON public.theme_settings;
DROP POLICY IF EXISTS "Users can delete theme settings" ON public.theme_settings;

-- 3. Create comprehensive policies for all operations
-- Allow authenticated users to SELECT
CREATE POLICY "theme_settings_select" 
ON public.theme_settings FOR SELECT 
TO authenticated 
USING (true);

-- Allow authenticated users to INSERT (for visual editor saves)
CREATE POLICY "theme_settings_insert" 
ON public.theme_settings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to UPDATE their own records
CREATE POLICY "theme_settings_update" 
ON public.theme_settings FOR UPDATE 
TO authenticated 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow authenticated users to DELETE their own records
CREATE POLICY "theme_settings_delete" 
ON public.theme_settings FOR DELETE 
TO authenticated 
USING (auth.uid() IS NOT NULL);

-- 4. Ensure RLS is enabled
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;

-- 5. Grant necessary permissions
GRANT ALL ON public.theme_settings TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- 6. Verify policies are created
SELECT 
    schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'theme_settings';
