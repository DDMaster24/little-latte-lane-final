-- 🧹 CLEAN SLATE: Clear All Test Orders
-- Execute this in your Supabase SQL Editor to remove all test/draft orders
-- This will give you a fresh start for live operations

-- ⚠️  SAFETY FIRST: This will permanently delete ALL orders
-- Make sure you want to clear everything before running this!

-- Step 1: Clear all order items first (due to foreign key constraints)
DELETE FROM order_items;

-- Step 2: Clear all orders 
DELETE FROM orders;

-- Note: Order numbering will continue from where it left off since there's no order_counters table
-- The next order will be generated based on your application's logic

-- ✅ VERIFICATION QUERIES (run these after to confirm cleanup):
-- Check that all orders are gone:
SELECT COUNT(*) as remaining_orders FROM orders;

-- Check that all order items are gone:
SELECT COUNT(*) as remaining_order_items FROM order_items;

-- 🎯 EXPECTED RESULTS AFTER CLEANUP:
-- - remaining_orders: 0
-- - remaining_order_items: 0  
-- - Order numbering will continue from your app's logic (likely LL1037+)

-- 📋 NOTES:
-- - This clears ALL orders (draft, confirmed, completed, etc.)
-- - Order numbering will continue from where it left off (no counter table to reset)
-- - User accounts and menu items are preserved
-- - Only order data is removed for clean slate
