-- Migration: Add delivery_method column to orders table
-- Date: August 21, 2025
-- Purpose: Store delivery type (delivery/pickup) for order details modal

-- Add delivery_method column to orders table
ALTER TABLE public.orders 
ADD COLUMN delivery_method TEXT;

-- Add constraint to ensure only valid values
ALTER TABLE public.orders 
ADD CONSTRAINT orders_delivery_method_check 
CHECK (delivery_method IN ('delivery', 'pickup'));

-- Add index for better query performance
CREATE INDEX idx_orders_delivery_method ON public.orders(delivery_method);

-- Update existing orders to set a default value (pickup since no delivery_method was stored previously)
UPDATE public.orders 
SET delivery_method = 'pickup' 
WHERE delivery_method IS NULL;