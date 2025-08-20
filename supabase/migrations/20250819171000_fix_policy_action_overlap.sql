-- Migration: Fix Policy Action Overlap - Final Resolution
-- The issue: FOR ALL policies overlap with FOR SELECT policies
-- The fix: Use specific actions for each policy

BEGIN;

-- ============================================================================
-- EVENTS table - Fix action overlap
-- ============================================================================

DROP POLICY IF EXISTS "Events modify policy" ON "public"."events";

-- Replace with specific action policies (no FOR ALL)
CREATE POLICY "Events insert policy" ON "public"."events"
FOR INSERT WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "Events update policy" ON "public"."events"
FOR UPDATE USING (public.is_staff_or_admin());

CREATE POLICY "Events delete policy" ON "public"."events"
FOR DELETE USING (public.is_staff_or_admin());

-- ============================================================================
-- MENU_CATEGORIES table - Fix action overlap
-- ============================================================================

DROP POLICY IF EXISTS "Categories modify policy" ON "public"."menu_categories";

-- Replace with specific action policies
CREATE POLICY "Categories insert policy" ON "public"."menu_categories"
FOR INSERT WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "Categories update policy" ON "public"."menu_categories"
FOR UPDATE USING (public.is_staff_or_admin());

CREATE POLICY "Categories delete policy" ON "public"."menu_categories"
FOR DELETE USING (public.is_staff_or_admin());

-- ============================================================================
-- MENU_ITEMS table - Fix action overlap
-- ============================================================================

DROP POLICY IF EXISTS "Items modify policy" ON "public"."menu_items";

-- Replace with specific action policies
CREATE POLICY "Items insert policy" ON "public"."menu_items"
FOR INSERT WITH CHECK (public.is_staff_or_admin());

CREATE POLICY "Items update policy" ON "public"."menu_items"
FOR UPDATE USING (public.is_staff_or_admin());

CREATE POLICY "Items delete policy" ON "public"."menu_items"
FOR DELETE USING (public.is_staff_or_admin());

-- ============================================================================
-- ORDER_ITEMS table - Fix action overlap
-- ============================================================================

DROP POLICY IF EXISTS "Order items modify policy" ON "public"."order_items";

-- Replace with specific action policies
CREATE POLICY "Order items insert policy" ON "public"."order_items"
FOR INSERT WITH CHECK (
  (public.is_staff_or_admin()) OR 
  (EXISTS ( SELECT 1
    FROM "public"."orders"
    WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = (SELECT auth.uid())) AND ("orders"."status" = ANY (ARRAY['draft'::text, 'pending'::text])))))
);

CREATE POLICY "Order items update policy" ON "public"."order_items"
FOR UPDATE USING (
  (public.is_staff_or_admin()) OR 
  (EXISTS ( SELECT 1
    FROM "public"."orders"
    WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = (SELECT auth.uid())) AND ("orders"."status" = ANY (ARRAY['draft'::text, 'pending'::text])))))
);

CREATE POLICY "Order items delete policy" ON "public"."order_items"
FOR DELETE USING (
  (public.is_staff_or_admin()) OR 
  (EXISTS ( SELECT 1
    FROM "public"."orders"
    WHERE (("orders"."id" = "order_items"."order_id") AND ("orders"."user_id" = (SELECT auth.uid())) AND ("orders"."status" = ANY (ARRAY['draft'::text, 'pending'::text])))))
);

-- ============================================================================
-- PROFILES table - Fix action overlap (most complex case)
-- ============================================================================

DROP POLICY IF EXISTS "Profiles service policy" ON "public"."profiles";

-- Replace the ALL policy with specific INSERT/DELETE policies for service role
CREATE POLICY "Profiles insert policy" ON "public"."profiles"
FOR INSERT WITH CHECK ((SELECT auth.role()) = 'service_role'::text);

CREATE POLICY "Profiles delete policy" ON "public"."profiles"
FOR DELETE USING ((SELECT auth.role()) = 'service_role'::text);

COMMIT;

-- This should eliminate ALL remaining multiple permissive policy warnings
-- by ensuring no policy overlaps with another for the same action
