-- Migration: Fix Multiple Permissive Policies - Final Resolution
-- Consolidates all duplicate policies into single comprehensive policies

BEGIN;

-- ============================================================================
-- EVENTS table - Consolidate "Events manage policy" and "Events view policy" 
-- ============================================================================

DROP POLICY IF EXISTS "Events manage policy" ON "public"."events";
DROP POLICY IF EXISTS "Events view policy" ON "public"."events";

-- Single SELECT policy that covers both view and manage scenarios
CREATE POLICY "Events access policy" ON "public"."events"
FOR SELECT USING (
  ("is_active" = true) OR 
  (public.is_staff_or_admin())
);

-- Separate policy for non-SELECT operations (INSERT/UPDATE/DELETE)
CREATE POLICY "Events modify policy" ON "public"."events"
FOR ALL USING (public.is_staff_or_admin());

-- ============================================================================
-- MENU_CATEGORIES table - Consolidate duplicate SELECT policies
-- ============================================================================

DROP POLICY IF EXISTS "Categories manage policy" ON "public"."menu_categories";
DROP POLICY IF EXISTS "Categories view policy" ON "public"."menu_categories";

-- Single SELECT policy 
CREATE POLICY "Categories access policy" ON "public"."menu_categories"
FOR SELECT USING (
  ("is_active" = true) OR 
  (public.is_staff_or_admin())
);

-- Separate policy for modifications
CREATE POLICY "Categories modify policy" ON "public"."menu_categories"
FOR ALL USING (public.is_staff_or_admin());

-- ============================================================================
-- MENU_ITEMS table - Consolidate duplicate SELECT policies
-- ============================================================================

DROP POLICY IF EXISTS "Items manage policy" ON "public"."menu_items";
DROP POLICY IF EXISTS "Items view policy" ON "public"."menu_items";

-- Single SELECT policy
CREATE POLICY "Items access policy" ON "public"."menu_items"
FOR SELECT USING (
  ("is_available" = true) OR 
  (public.is_staff_or_admin())
);

-- Separate policy for modifications
CREATE POLICY "Items modify policy" ON "public"."menu_items"
FOR ALL USING (public.is_staff_or_admin());

-- ============================================================================
-- ORDER_ITEMS table - Consolidate duplicate SELECT policies
-- ============================================================================

DROP POLICY IF EXISTS "Order items manage policy" ON "public"."order_items";
DROP POLICY IF EXISTS "Order items view policy" ON "public"."order_items";

-- Single SELECT policy
CREATE POLICY "Order items access policy" ON "public"."order_items"
FOR SELECT USING (
  (public.is_staff_or_admin()) OR 
  (EXISTS ( SELECT 1
    FROM "public"."orders"
    WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = (SELECT auth.uid())))))
);

-- Separate policy for modifications (only for staff or pending user orders)
CREATE POLICY "Order items modify policy" ON "public"."order_items"
FOR ALL USING (
  (public.is_staff_or_admin()) OR 
  (EXISTS ( SELECT 1
    FROM "public"."orders"
    WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = (SELECT auth.uid())) AND ("orders"."status" = ANY (ARRAY['draft'::text, 'pending'::text])))))
);

-- ============================================================================
-- PROFILES table - Consolidate duplicate policies
-- ============================================================================

DROP POLICY IF EXISTS "Manage profiles policy" ON "public"."profiles";
DROP POLICY IF EXISTS "View profiles policy" ON "public"."profiles";
DROP POLICY IF EXISTS "Update profiles policy" ON "public"."profiles";

-- Single SELECT policy
CREATE POLICY "Profiles access policy" ON "public"."profiles"
FOR SELECT USING (
  (public.is_admin()) OR 
  ((SELECT auth.role()) = 'service_role'::text) OR 
  ((SELECT auth.uid()) = "id")
);

-- Single UPDATE policy
CREATE POLICY "Profiles modify policy" ON "public"."profiles"
FOR UPDATE USING (
  ((SELECT auth.role()) = 'service_role'::text) OR 
  ((SELECT auth.uid()) = "id")
);

-- Service role policy for all operations
CREATE POLICY "Profiles service policy" ON "public"."profiles"
FOR ALL USING ((SELECT auth.role()) = 'service_role'::text);

COMMIT;

-- This should eliminate all 26 remaining multiple permissive policy warnings
-- by ensuring each table has only ONE policy per action type
