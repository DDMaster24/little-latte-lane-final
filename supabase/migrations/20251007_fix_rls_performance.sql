-- Fix Performance Advisor RLS Policy Warnings
-- Optimizes Row Level Security policies for better performance
-- Created: 2025-10-07

-- Fix auth.uid() calls by wrapping in SELECT subquery
-- This prevents the function from being re-evaluated for each row

-- Order Items policies
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

-- Notifications policies
DROP POLICY IF EXISTS "Users can insert own notification settings" ON public.notifications;
CREATE POLICY "Users can insert own notification settings" 
ON public.notifications 
FOR INSERT 
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own notification settings" ON public.notifications;
CREATE POLICY "Users can update own notification settings" 
ON public.notifications 
FOR UPDATE 
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own notification settings" ON public.notifications;
CREATE POLICY "Users can view own notification settings" 
ON public.notifications 
FOR SELECT 
USING (user_id = (SELECT auth.uid()));

-- Notification History policies
DROP POLICY IF EXISTS "Users can update own notification status" ON public.notification_history;
CREATE POLICY "Users can update own notification status" 
ON public.notification_history 
FOR UPDATE 
USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own notification history" ON public.notification_history;
CREATE POLICY "Users can view own notification history" 
ON public.notification_history 
FOR SELECT 
USING (user_id = (SELECT auth.uid()));

-- Consolidate duplicate policies to reduce overhead
DROP POLICY IF EXISTS "Staff can view all notification history" ON public.notification_history;
DROP POLICY IF EXISTS "Users can view own notification history" ON public.notification_history;
CREATE POLICY "notification_history_select_policy" 
ON public.notification_history 
FOR SELECT 
USING (
  user_id = (SELECT auth.uid()) 
  OR public.is_staff_or_admin()
);

DROP POLICY IF EXISTS "Staff can view all notification settings" ON public.notifications;
DROP POLICY IF EXISTS "Users can view own notification settings" ON public.notifications;
CREATE POLICY "notifications_select_policy" 
ON public.notifications 
FOR SELECT 
USING (
  user_id = (SELECT auth.uid()) 
  OR public.is_staff_or_admin()
);

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

DROP POLICY IF EXISTS "Admins can manage all closures" ON public.restaurant_closures;
DROP POLICY IF EXISTS "Anyone can view active closures" ON public.restaurant_closures;
CREATE POLICY "restaurant_closures_select_policy" 
ON public.restaurant_closures 
FOR SELECT 
USING (
  is_active = true 
  OR public.is_staff_or_admin()
);
