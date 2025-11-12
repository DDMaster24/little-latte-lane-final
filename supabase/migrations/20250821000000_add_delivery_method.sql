-- Migration: Add delivery_method column to orders table
-- This enables tracking whether orders are for delivery or pickup

BEGIN;

-- Add delivery_method column to orders table (only if it doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'delivery_method') THEN
        ALTER TABLE public.orders ADD COLUMN delivery_method TEXT;
    END IF;
END $$;

-- Add constraint to ensure only valid values (only if it doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'orders_delivery_method_check') THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT orders_delivery_method_check 
        CHECK (delivery_method IN ('delivery', 'pickup'));
    END IF;
END $$;

-- Add index for better query performance (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_orders_delivery_method ON public.orders(delivery_method);

-- Set default value for existing orders (assuming they were pickup since no address was required before)
UPDATE public.orders 
SET delivery_method = 'pickup' 
WHERE delivery_method IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.delivery_method IS 'Order fulfillment method: delivery or pickup';

COMMIT;
