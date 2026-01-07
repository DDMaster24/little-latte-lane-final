-- Fix missing admin policies for restaurant_closures table
-- The 20251007_fix_rls_performance.sql migration dropped the "Admins can manage all closures" policy
-- but only recreated a SELECT policy, leaving INSERT/UPDATE/DELETE policies missing
-- Created: 2026-01-07

-- Add INSERT policy for admins
CREATE POLICY "restaurant_closures_insert_policy"
ON public.restaurant_closures
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Add UPDATE policy for admins
CREATE POLICY "restaurant_closures_update_policy"
ON public.restaurant_closures
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Add DELETE policy for admins
CREATE POLICY "restaurant_closures_delete_policy"
ON public.restaurant_closures
FOR DELETE
TO authenticated
USING (public.is_admin());
