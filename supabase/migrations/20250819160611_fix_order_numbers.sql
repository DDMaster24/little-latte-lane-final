-- Fix Order Number Generation System
-- Creates automatic order numbering with format: LL1000, LL1001, LL1002, etc.

-- Step 1: Create sequence for order numbers starting at 1000
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1000;

-- Step 2: Create function to auto-generate order numbers
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set order_number if it's null (allows manual override if needed)
  IF NEW.order_number IS NULL THEN
    NEW.order_number = 'LL' || nextval('order_number_seq');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create trigger to auto-populate order numbers on INSERT
DROP TRIGGER IF EXISTS set_order_number_trigger ON orders;
CREATE TRIGGER set_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION set_order_number();

-- Step 4: Backfill existing orders with sequential numbers using a subquery approach
WITH numbered_orders AS (
  SELECT id, (1000 + row_number() OVER (ORDER BY created_at)) as new_order_number
  FROM orders 
  WHERE order_number IS NULL
)
UPDATE orders 
SET order_number = 'LL' || numbered_orders.new_order_number
FROM numbered_orders
WHERE orders.id = numbered_orders.id;