-- 🔧 DATABASE SCHEMA FIX - Notification System
-- Adds missing columns for order status notifications

-- Fix 1: Add estimated_ready_time column to orders table
ALTER TABLE orders 
ADD COLUMN estimated_ready_time TEXT;

-- Fix 2: Add completed_at column to orders table  
ALTER TABLE orders 
ADD COLUMN completed_at TIMESTAMPTZ;

-- Verify the changes were applied successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('estimated_ready_time', 'completed_at')
ORDER BY column_name;

-- Add some sample data to test the columns
UPDATE orders 
SET estimated_ready_time = '15 minutes'
WHERE status = 'preparing' 
AND estimated_ready_time IS NULL
LIMIT 1;

-- Verify the update worked
SELECT id, status, estimated_ready_time, completed_at, updated_at
FROM orders 
WHERE estimated_ready_time IS NOT NULL
LIMIT 5;

-- Show current orders table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders'
ORDER BY ordinal_position;
