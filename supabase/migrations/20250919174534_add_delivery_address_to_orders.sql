-- Add delivery_address column to orders table
-- This allows kitchen staff to see delivery addresses for delivery orders

ALTER TABLE public.orders 
ADD COLUMN delivery_address TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.orders.delivery_address IS 'Customer delivery address for delivery orders (null for pickup orders)';
