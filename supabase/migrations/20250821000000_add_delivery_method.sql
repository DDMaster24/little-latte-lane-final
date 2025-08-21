-- Migration: Add delivery_method column to orders table
-- This enables tracking whether orders are for delivery or pickup

BEGIN;

-- Add delivery_method column to orders table
ALTER TABLE public.orders 
ADD COLUMN delivery_method TEXT;

-- Add constraint to ensure only valid values
ALTER TABLE public.orders 
ADD CONSTRAINT orders_delivery_method_check 
CHECK (delivery_method IN ('delivery', 'pickup'));

-- Add index for better query performance
CREATE INDEX idx_orders_delivery_method ON public.orders(delivery_method);

-- Set default value for existing orders (assuming they were pickup since no address was required before)
UPDATE public.orders 
SET delivery_method = 'pickup' 
WHERE delivery_method IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.delivery_method IS 'Order fulfillment method: delivery or pickup';

COMMIT;
