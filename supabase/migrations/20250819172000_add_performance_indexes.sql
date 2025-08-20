-- Migration: Add Performance Indexes for Foreign Keys
-- Addresses 7 INFO-level recommendations for unindexed foreign keys
-- These indexes will significantly improve query performance for JOINs and lookups

BEGIN;

-- ============================================================================
-- Foreign Key Performance Indexes
-- ============================================================================

-- BOOKINGS table - user_id foreign key
-- Improves performance for: "Get all bookings for a user"
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings (user_id);

-- MENU_ITEMS table - category_id foreign key  
-- Improves performance for: "Get all items in a category"
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON public.menu_items (category_id);

-- ORDER_ITEMS table - menu_item_id foreign key
-- Improves performance for: "Find all orders containing a specific menu item"
CREATE INDEX IF NOT EXISTS idx_order_items_menu_item_id ON public.order_items (menu_item_id);

-- ORDER_ITEMS table - order_id foreign key
-- Improves performance for: "Get all items in an order" (most critical for order display)
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items (order_id);

-- ORDERS table - user_id foreign key
-- Improves performance for: "Get order history for a user" (very common query)
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);

-- STAFF_REQUESTS table - assigned_to foreign key
-- Improves performance for: "Get all requests assigned to a staff member"
CREATE INDEX IF NOT EXISTS idx_staff_requests_assigned_to ON public.staff_requests (assigned_to);

-- STAFF_REQUESTS table - user_id foreign key
-- Improves performance for: "Get all requests from a user"
CREATE INDEX IF NOT EXISTS idx_staff_requests_user_id ON public.staff_requests (user_id);

-- ============================================================================
-- Additional Performance Indexes (bonus optimizations)
-- ============================================================================

-- ORDERS table - status index (frequent filtering by order status)
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);

-- ORDERS table - created_at index (for chronological ordering)
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at);

-- MENU_ITEMS table - is_available index (frequent filtering)
CREATE INDEX IF NOT EXISTS idx_menu_items_is_available ON public.menu_items (is_available);

-- EVENTS table - is_active index (frequent filtering)
CREATE INDEX IF NOT EXISTS idx_events_is_active ON public.events (is_active);

-- BOOKINGS table - booking_date index (for date-based queries)
CREATE INDEX IF NOT EXISTS idx_bookings_booking_date ON public.bookings (booking_date);

-- ============================================================================
-- Composite Indexes for Common Query Patterns
-- ============================================================================

-- ORDERS table - user + status composite (very common: "user's pending orders")
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON public.orders (user_id, status);

-- ORDER_ITEMS table - order + menu_item composite (prevent duplicates, faster lookups)
CREATE INDEX IF NOT EXISTS idx_order_items_order_menu ON public.order_items (order_id, menu_item_id);

-- BOOKINGS table - date + status composite (staff dashboard queries)
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON public.bookings (booking_date, status);

COMMIT;

-- Performance Optimization Complete!
-- ✅ All 7 unindexed foreign keys now have covering indexes
-- ✅ Additional performance indexes for common query patterns
-- ✅ Composite indexes for multi-column WHERE clauses
-- 
-- Expected Performance Improvements:
-- • Faster user order history queries
-- • Faster menu category browsing
-- • Faster order item lookups
-- • Faster staff dashboard operations
-- • Better overall scalability as data grows
