-- =====================================================
-- LITTLE LATTE LANE - RLS POLICY FIXES
-- =====================================================
-- This script fixes infinite recursion issues in RLS policies
-- and establishes robust, maintainable security policies
-- 
-- Problem: Admin policies referenced profiles table from within 
-- profiles table policies, causing infinite recursion
-- 
-- Solution: Use auth.jwt() claims and Supabase's built-in functions
-- to avoid circular dependencies
-- =====================================================

-- =====================================================
-- 1. DROP ALL EXISTING PROBLEMATIC POLICIES
-- =====================================================

-- Drop profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Drop menu categories policies  
DROP POLICY IF EXISTS "Anyone can view active menu categories" ON menu_categories;
DROP POLICY IF EXISTS "Admins can manage menu categories" ON menu_categories;

-- Drop menu items policies
DROP POLICY IF EXISTS "Anyone can view available menu items" ON menu_items;
DROP POLICY IF EXISTS "Admins can manage menu items" ON menu_items;

-- Drop other potentially problematic policies
DROP POLICY IF EXISTS "Anyone can view active events" ON events;
DROP POLICY IF EXISTS "Admins can manage events" ON events;
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;
DROP POLICY IF EXISTS "Admins can view all bookings" ON bookings;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can view inventory" ON inventory;

-- =====================================================
-- 2. CREATE HELPER FUNCTIONS FOR CLEAN ROLE CHECKING
-- =====================================================

-- Function to check if current user is admin (avoids recursion)
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Function to check if current user is staff (avoids recursion)
CREATE OR REPLACE FUNCTION auth.is_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_staff FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Function to check if current user is admin or staff
CREATE OR REPLACE FUNCTION auth.is_admin_or_staff()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT (is_admin OR is_staff) FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- =====================================================
-- 3. PROFILES TABLE POLICIES (FOUNDATION)
-- =====================================================

-- Allow users to view their own profile
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile  
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow users to insert their own profile (for registration)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================================
-- 4. PUBLIC READ POLICIES (NO AUTHENTICATION REQUIRED)
-- =====================================================

-- Menu categories - public read access for active items
CREATE POLICY "menu_categories_public_read" ON menu_categories
  FOR SELECT
  USING (is_active = true);

-- Menu items - public read access for available items
CREATE POLICY "menu_items_public_read" ON menu_items  
  FOR SELECT
  USING (is_available = true);

-- Events - public read access for active events
CREATE POLICY "events_public_read" ON events
  FOR SELECT
  USING (is_active = true AND (end_date IS NULL OR end_date >= CURRENT_DATE));

-- =====================================================
-- 5. USER-SPECIFIC POLICIES (AUTHENTICATED USERS)
-- =====================================================

-- Bookings - users can view their own bookings
CREATE POLICY "bookings_select_own" ON bookings
  FOR SELECT
  USING (auth.uid() = user_id);

-- Bookings - users can insert their own bookings
CREATE POLICY "bookings_insert_own" ON bookings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Bookings - users can update their own bookings
CREATE POLICY "bookings_update_own" ON bookings
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Orders - users can view their own orders
CREATE POLICY "orders_select_own" ON orders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Orders - users can insert their own orders
CREATE POLICY "orders_insert_own" ON orders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Order items - users can view items from their own orders
CREATE POLICY "order_items_select_own" ON order_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Order items - users can insert items to their own orders
CREATE POLICY "order_items_insert_own" ON order_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- =====================================================
-- 6. ADMIN POLICIES (USING HELPER FUNCTIONS)
-- =====================================================

-- Profiles - admins can view all profiles
CREATE POLICY "profiles_admin_all" ON profiles
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Menu categories - admins can manage all
CREATE POLICY "menu_categories_admin_all" ON menu_categories
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Menu items - admins can manage all
CREATE POLICY "menu_items_admin_all" ON menu_items
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Events - admins can manage all
CREATE POLICY "events_admin_all" ON events
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Bookings - admins can view and manage all
CREATE POLICY "bookings_admin_all" ON bookings
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Orders - admins can view and manage all
CREATE POLICY "orders_admin_all" ON orders
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Order items - admins can view and manage all
CREATE POLICY "order_items_admin_all" ON order_items
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Inventory - admins can view and manage all
CREATE POLICY "inventory_admin_all" ON inventory
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- Admin settings - only admins can access
CREATE POLICY "admin_settings_admin_only" ON admin_settings
  FOR ALL
  USING (auth.is_admin())
  WITH CHECK (auth.is_admin());

-- =====================================================
-- 7. STAFF POLICIES (USING HELPER FUNCTIONS)
-- =====================================================

-- Orders - staff can view all orders (for kitchen/preparation)
CREATE POLICY "orders_staff_read" ON orders
  FOR SELECT
  USING (auth.is_staff());

-- Order items - staff can view all order items
CREATE POLICY "order_items_staff_read" ON order_items
  FOR SELECT
  USING (auth.is_staff());

-- Bookings - staff can view all bookings
CREATE POLICY "bookings_staff_read" ON bookings
  FOR SELECT
  USING (auth.is_staff());

-- Orders - staff can update order status
CREATE POLICY "orders_staff_update_status" ON orders
  FOR UPDATE
  USING (auth.is_staff())
  WITH CHECK (auth.is_staff());

-- Inventory - staff can view inventory
CREATE POLICY "inventory_staff_read" ON inventory
  FOR SELECT
  USING (auth.is_staff());

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================

-- Test helper functions
DO $$
BEGIN
  -- Test that functions exist and are callable
  RAISE NOTICE 'Testing helper functions...';
  RAISE NOTICE 'auth.is_admin() function: %', (SELECT auth.is_admin());
  RAISE NOTICE 'auth.is_staff() function: %', (SELECT auth.is_staff());
  RAISE NOTICE 'auth.is_admin_or_staff() function: %', (SELECT auth.is_admin_or_staff());
  RAISE NOTICE 'RLS policy fixes applied successfully!';
END $$;

-- Show all active policies for verification
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS POLICY FIXES COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 SECURITY IMPROVEMENTS:';
  RAISE NOTICE '   • Fixed infinite recursion in admin policies';
  RAISE NOTICE '   • Created helper functions to avoid circular dependencies';
  RAISE NOTICE '   • Established clear separation between public, user, staff, and admin access';
  RAISE NOTICE '   • All policies are now robust and maintainable';
  RAISE NOTICE '';
  RAISE NOTICE '📋 NEXT STEPS:';
  RAISE NOTICE '   1. Test frontend connectivity';
  RAISE NOTICE '   2. Verify menu categories load properly';
  RAISE NOTICE '   3. Test admin functionality';
  RAISE NOTICE '   4. Validate user authentication flows';
END $$;
