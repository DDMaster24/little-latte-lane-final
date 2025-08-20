-- 🚀 EMERGENCY REALTIME PERFORMANCE FIX
-- Target: Reduce realtime.list_changes from 95.4% to <10%
-- Method: Minimal selective publication + essential indexes

-- STEP 1: Remove all realtime publications
DROP PUBLICATION IF EXISTS realtime_selective;
DROP PUBLICATION IF EXISTS supabase_realtime;

-- STEP 2: Create minimal selective publication
CREATE PUBLICATION realtime_selective FOR TABLE 
  public.orders (id, status, payment_status),
  public.order_items (id, order_id),
  public.bookings (id, status, booking_date),
  public.events (id, is_active)
WITH (publish = 'insert, update, delete');

-- STEP 3: Essential indexes for realtime queries
CREATE INDEX IF NOT EXISTS idx_orders_realtime_status 
ON public.orders (status, payment_status) 
WHERE status IN ('confirmed', 'preparing', 'ready');

CREATE INDEX IF NOT EXISTS idx_bookings_realtime_today 
ON public.bookings (booking_date, status) 
WHERE booking_date >= CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_events_realtime_active 
ON public.events (is_active) 
WHERE is_active = true;

-- STEP 4: Materialized view for dashboard stats
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats AS
SELECT 
  COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_orders,
  COUNT(*) FILTER (WHERE status = 'preparing') as preparing_orders,
  COUNT(*) FILTER (WHERE status = 'ready') as ready_orders,
  CURRENT_TIMESTAMP as last_updated
FROM public.orders
WHERE payment_status = 'paid';

-- STEP 5: Refresh function for dashboard stats
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  REFRESH MATERIALIZED VIEW dashboard_stats;
$$;
