-- Add absolute_price column to menu_item_variations
-- This allows each size to have its own independent price
-- instead of using price_adjustment

BEGIN;

-- Add the absolute_price column
ALTER TABLE public.menu_item_variations
ADD COLUMN IF NOT EXISTS absolute_price NUMERIC(10, 2);

-- Add comment
COMMENT ON COLUMN public.menu_item_variations.absolute_price IS 'Absolute price for this variation (overrides price_adjustment if set)';

COMMIT;
