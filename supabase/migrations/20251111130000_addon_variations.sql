-- ============================================================================
-- Create addon_variations table for add-on flavor/size options
-- Purpose: Store Boba flavors, Milk sizes, Pistachio single/double, etc.
-- ============================================================================

BEGIN;

-- Create addon_variations table
CREATE TABLE IF NOT EXISTS public.addon_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    addon_id UUID NOT NULL REFERENCES public.menu_addons(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Mango", "Strawberry" for Boba OR "Small", "Medium" for Milks
    price_adjustment NUMERIC(10, 2) DEFAULT 0, -- price difference from base addon price
    absolute_price NUMERIC(10, 2), -- or absolute price (overrides price_adjustment if set)
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_addon_variations_addon ON public.addon_variations(addon_id);
CREATE INDEX IF NOT EXISTS idx_addon_variations_available ON public.addon_variations(is_available);

-- Enable RLS
ALTER TABLE public.addon_variations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can view available addon variations"
ON public.addon_variations FOR SELECT
USING (is_available = true);

CREATE POLICY "Admins can manage addon variations"
ON public.addon_variations FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Add updated_at trigger
CREATE TRIGGER handle_addon_variations_updated_at
    BEFORE UPDATE ON public.addon_variations
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- Comments
COMMENT ON TABLE public.addon_variations IS 'Stores variations for add-ons (Boba flavors, Milk sizes, etc.)';
COMMENT ON COLUMN public.addon_variations.name IS 'Variation name (e.g., "Mango" for Boba, "Small" for Milk)';
COMMENT ON COLUMN public.addon_variations.absolute_price IS 'Full price for this variation (overrides price_adjustment)';

COMMIT;
