-- Add delivery zone and fee tracking to orders table
-- Migration: Add Delivery Zone System
-- Date: 2025-10-03

-- Add new columns to orders table for delivery system
ALTER TABLE public.orders 
ADD COLUMN delivery_fee DECIMAL(10,2) DEFAULT NULL,
ADD COLUMN delivery_zone TEXT DEFAULT NULL CHECK (delivery_zone IN ('roberts_estate', 'middleburg', 'outside')),
ADD COLUMN delivery_coordinates JSONB DEFAULT NULL,
ADD COLUMN address_verified BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN public.orders.delivery_fee IS 'Delivery fee charged (R10 for Roberts Estate, R30 for Middleburg)';
COMMENT ON COLUMN public.orders.delivery_zone IS 'Delivery zone: roberts_estate, middleburg, or outside';
COMMENT ON COLUMN public.orders.delivery_coordinates IS 'GPS coordinates {lat, lng} for address verification';
COMMENT ON COLUMN public.orders.address_verified IS 'Whether the address has been validated via Google Maps';

-- Update existing orders to have default values
UPDATE public.orders 
SET 
  delivery_zone = CASE 
    WHEN delivery_method = 'delivery' THEN 'middleburg'
    ELSE NULL 
  END,
  address_verified = FALSE
WHERE delivery_zone IS NULL;

-- Create index for faster delivery zone queries
CREATE INDEX IF NOT EXISTS idx_orders_delivery_zone ON public.orders(delivery_zone);
CREATE INDEX IF NOT EXISTS idx_orders_address_verified ON public.orders(address_verified);