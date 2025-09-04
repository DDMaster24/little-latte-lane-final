-- =====================================================
-- REFINED RLS POLICY FIX FOR ORDER ITEMS
-- This ensures authenticated users can insert order items
-- =====================================================

-- Drop the current policy and create a better one
DROP POLICY IF EXISTS "Users can insert order items for their own orders" ON order_items;

-- Create a more permissive INSERT policy for authenticated users
CREATE POLICY "Authenticated users can insert order items for their orders" ON order_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);

-- Also create a policy for anon users (for guest checkout if needed)
CREATE POLICY "Anon users can insert order items for any order" ON order_items
FOR INSERT
TO anon
WITH CHECK (true);

-- Test the policies by checking what exists
SELECT 
  policyname,
  roles,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'order_items' 
AND cmd = 'INSERT'
ORDER BY policyname;
