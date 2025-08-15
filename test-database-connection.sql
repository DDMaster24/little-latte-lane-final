-- Test Database Connection Queries
-- Run these to verify your database setup is working correctly

-- Test 1: Check if we can connect and see basic schema
SELECT current_database(), current_user, version();

-- Test 2: Verify menu categories are populated
SELECT 
  id, 
  name, 
  description, 
  display_order 
FROM menu_categories 
ORDER BY display_order;

-- Test 3: Count menu items by category
SELECT 
  mc.name as category_name,
  COUNT(mi.id) as total_items,
  COUNT(CASE WHEN mi.available = true THEN 1 END) as available_items
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id
GROUP BY mc.id, mc.name
ORDER BY mc.display_order;

-- Test 4: Sample of menu items with pricing
SELECT 
  mi.name,
  mi.price,
  mc.name as category,
  mi.available
FROM menu_items mi
JOIN menu_categories mc ON mi.category_id = mc.id
ORDER BY mc.display_order, mi.name
LIMIT 10;

-- Test 5: Check if profiles table is accessible
SELECT COUNT(*) as total_profiles FROM profiles;

-- Test 6: Check orders table structure (should be empty or have test data)
SELECT 
  COUNT(*) as total_orders,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
FROM orders;

-- Test 7: Verify RLS policies are working (this should not error)
SELECT 
  schemaname,
  tablename,
  hasrls
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
