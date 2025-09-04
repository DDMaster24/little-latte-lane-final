-- =====================================================
-- CRITICAL PRODUCTION FIX: Order Items RLS Policy
-- This fixes the critical issue where order items can't be created
-- =====================================================

-- Enable RLS on order_items (if not already enabled)
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert order items for their own orders" ON order_items;
DROP POLICY IF EXISTS "Users can view order items for their own orders" ON order_items;
DROP POLICY IF EXISTS "Staff can view all order items" ON order_items;
DROP POLICY IF EXISTS "Staff can update order items" ON order_items;

-- =====================================================
-- ORDER ITEMS POLICIES
-- =====================================================

-- 1. INSERT: Users can insert order items for their own orders
CREATE POLICY "Users can insert order items for their own orders" ON order_items
FOR INSERT
TO authenticated, anon
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- 2. SELECT: Users can view order items for their own orders
CREATE POLICY "Users can view order items for their own orders" ON order_items
FOR SELECT
TO authenticated, anon
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- 3. SELECT: Staff can view all order items
CREATE POLICY "Staff can view all order items" ON order_items
FOR SELECT
TO authenticated
USING (
  public.is_staff_or_admin()
);

-- 4. UPDATE: Staff can update order items
CREATE POLICY "Staff can update order items" ON order_items
FOR UPDATE
TO authenticated
USING (
  public.is_staff_or_admin()
)
WITH CHECK (
  public.is_staff_or_admin()
);

-- 5. DELETE: Only admins can delete order items
CREATE POLICY "Admins can delete order items" ON order_items
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.is_admin = true
  )
);

-- =====================================================
-- TEST THE POLICIES
-- =====================================================

-- Verify policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'order_items'
ORDER BY policyname;
