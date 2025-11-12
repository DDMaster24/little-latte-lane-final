-- ====================================================================
-- SUPABASE PERFORMANCE ADVISOR FIXES
-- Date: October 7, 2025
-- Purpose: Fix 21 performance warnings (7 RLS + 14 policy consolidation)
-- ====================================================================

-- ====================================================================
-- PART 1: FIX AUTH RLS INITIALIZATION PLAN (7 policies)
-- Replace auth.uid() with (SELECT auth.uid()) to prevent per-row evaluation
-- ====================================================================

-- 1. Fix order_items INSERT policy
DROP POLICY IF EXISTS "Users can insert order items for their own orders" ON public.order_items;
CREATE POLICY "Users can insert order items for their own orders" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = order_items.order_id 
    AND user_id = (SELECT auth.uid())
  )
);

-- 2. Fix order_items SELECT policy
DROP POLICY IF EXISTS "Users can view order items for their own orders" ON public.order_items;
CREATE POLICY "Users can view order items for their own orders" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = order_items.order_id 
    AND user_id = (SELECT auth.uid())
  )
);

-- 3. Fix notifications INSERT policy
DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.notifications;
CREATE POLICY "Users can insert own notification settings" 
ON public.notifications 
FOR INSERT 
WITH CHECK (user_id = (SELECT auth.uid()));

-- 4. Fix notifications UPDATE policy
DROP POLICY IF EXISTS "Users can update own notification settings" ON public.notifications;
CREATE POLICY "Users can update own notification settings" 
ON public.notifications 
FOR UPDATE 
USING (user_id = (SELECT auth.uid()));

-- 5. Fix notifications SELECT policy
DROP POLICY IF EXISTS "Users can view own notification settings" ON public.notifications;
CREATE POLICY "Users can view own notification settings" 
ON public.notifications 
FOR SELECT 
USING (user_id = (SELECT auth.uid()));

-- 6. Fix notification_history UPDATE policy
DROP POLICY IF EXISTS "Users can update own notification status" ON public.notification_history;
CREATE POLICY "Users can update own notification status" 
ON public.notification_history 
FOR UPDATE 
USING (user_id = (SELECT auth.uid()));

-- 7. Fix notification_history SELECT policy
DROP POLICY IF EXISTS "Users can view own notification history" ON public.notification_history;
CREATE POLICY "Users can view own notification history" 
ON public.notification_history 
FOR SELECT 
USING (user_id = (SELECT auth.uid()));

-- ====================================================================
-- PART 2: CONSOLIDATE MULTIPLE PERMISSIVE POLICIES (14 warnings)
-- Combine multiple policies into single policies with OR conditions
-- ====================================================================

-- 8. Consolidate notification_history SELECT policies (2 policies → 1)
DROP POLICY IF EXISTS "Staff can view all notification history" ON public.notification_history;
DROP POLICY IF EXISTS "Users can view own notification history" ON public.notification_history;
CREATE POLICY "notification_history_select_policy" 
ON public.notification_history 
FOR SELECT 
USING (
  user_id = (SELECT auth.uid()) 
  OR public.is_staff_or_admin()
);

-- 9. Consolidate notifications SELECT policies (2 policies → 1)
DROP POLICY IF EXISTS "Staff can view all notification settings" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notification settings" ON public.notifications;
CREATE POLICY "notifications_select_policy" 
ON public.notifications 
FOR SELECT 
USING (
  user_id = (SELECT auth.uid()) 
  OR public.is_staff_or_admin()
);

-- 10. Consolidate order_items INSERT policies (2 policies → 1)
DROP POLICY IF EXISTS "Order items insert policy" ON public.order_items;
DROP POLICY IF EXISTS "Users can insert order items for their own orders" ON public.order_items;
CREATE POLICY "order_items_insert_policy" 
ON public.order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = order_items.order_id 
    AND user_id = (SELECT auth.uid())
  )
  OR public.is_staff_or_admin()
);

-- 11. Consolidate order_items SELECT policies (3 policies → 1)
DROP POLICY IF EXISTS "Order items access policy" ON public.order_items;
DROP POLICY IF EXISTS "Staff can view all order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can view order items for their own orders" ON public.order_items;
CREATE POLICY "order_items_select_policy" 
ON public.order_items 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = order_items.order_id 
    AND user_id = (SELECT auth.uid())
  )
  OR public.is_staff_or_admin()
);

-- 12. Consolidate restaurant_closures SELECT policies (2 policies → 1)
DROP POLICY IF EXISTS "Admins can manage all closures" ON public.restaurant_closures;
DROP POLICY IF EXISTS "Anyone can view active closures" ON public.restaurant_closures;
CREATE POLICY "restaurant_closures_select_policy" 
ON public.restaurant_closures 
FOR SELECT 
USING (
  is_active = true 
  OR public.is_staff_or_admin()
);

-- ====================================================================
-- VERIFICATION QUERIES
-- ====================================================================

-- Check policies on affected tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('order_items', 'notifications', 'notification_history', 'restaurant_closures')
ORDER BY tablename, cmd, policyname;

-- ====================================================================
-- EXPECTED RESULTS:
-- ====================================================================
-- ✅ 7 auth.uid() calls now wrapped in SELECT for performance
-- ✅ 14 duplicate policies consolidated into 5 single policies
-- ✅ All 21 performance warnings fixed
-- ====================================================================
