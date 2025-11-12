-- ============================================================================
-- Enhanced Menu Management System with Variations and Add-ons
-- Created: November 11, 2025
-- Purpose: Support item variations (sizes) and add-ons (Boba, toppings, etc.)
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Create menu_item_variations table
-- Stores different sizes/variations of items (Small/Medium/Large, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.menu_item_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Small", "Medium", "Large"
    price_adjustment NUMERIC(10, 2) NOT NULL DEFAULT 0, -- +/- from base price
    is_default BOOLEAN DEFAULT false, -- which variation is selected by default
    display_order INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_variations_menu_item ON public.menu_item_variations(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_variations_available ON public.menu_item_variations(is_available);

-- ============================================================================
-- STEP 2: Create menu_addons table
-- Stores add-ons/modifiers that can be applied to items (Boba, toppings, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.menu_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    category TEXT, -- For grouping add-ons (e.g., "Toppings", "Extras", "Sauces")
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_addons_available ON public.menu_addons(is_available);
CREATE INDEX IF NOT EXISTS idx_addons_category ON public.menu_addons(category);

-- ============================================================================
-- STEP 3: Create menu_item_addons junction table
-- Links add-ons to specific items or categories
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.menu_item_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE CASCADE, -- nullable for category-wide
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE, -- nullable for item-specific
    addon_id UUID NOT NULL REFERENCES public.menu_addons(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false, -- whether customer must select this add-on
    max_quantity INTEGER DEFAULT 1, -- how many of this add-on can be selected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Constraint: must link to either an item OR a category, not both or neither
    CONSTRAINT check_link_type CHECK (
        (menu_item_id IS NOT NULL AND category_id IS NULL) OR
        (menu_item_id IS NULL AND category_id IS NOT NULL)
    )
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_item_addons_menu_item ON public.menu_item_addons(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_item_addons_category ON public.menu_item_addons(category_id);
CREATE INDEX IF NOT EXISTS idx_item_addons_addon ON public.menu_item_addons(addon_id);

-- ============================================================================
-- STEP 4: Update order_items table to support variations and add-ons
-- Add columns to track selected variation and add-ons for each order item
-- ============================================================================

-- Add variation_id column (which size was selected)
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS variation_id UUID REFERENCES public.menu_item_variations(id) ON DELETE SET NULL;

-- Add selected_addons JSONB column to store add-ons for this order item
-- Format: [{"addon_id": "uuid", "quantity": 1, "price": 15}]
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS selected_addons JSONB DEFAULT '[]'::jsonb;

-- ============================================================================
-- STEP 5: Enable Row Level Security (RLS)
-- ============================================================================

ALTER TABLE public.menu_item_variations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_item_addons ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: Create RLS Policies
-- ============================================================================

-- Everyone can view available variations
CREATE POLICY "Public can view available variations"
ON public.menu_item_variations FOR SELECT
USING (is_available = true);

-- Admins can manage variations
CREATE POLICY "Admins can manage variations"
ON public.menu_item_variations FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Everyone can view available add-ons
CREATE POLICY "Public can view available addons"
ON public.menu_addons FOR SELECT
USING (is_available = true);

-- Admins can manage add-ons
CREATE POLICY "Admins can manage addons"
ON public.menu_addons FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Everyone can view item-addon links
CREATE POLICY "Public can view item addon links"
ON public.menu_item_addons FOR SELECT
USING (true);

-- Admins can manage item-addon links
CREATE POLICY "Admins can manage item addon links"
ON public.menu_item_addons FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- ============================================================================
-- STEP 7: Create helper functions
-- ============================================================================

-- Function to get item with all variations and applicable add-ons
CREATE OR REPLACE FUNCTION public.get_menu_item_complete(item_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'item', row_to_json(mi.*),
        'variations', COALESCE(
            (SELECT jsonb_agg(row_to_json(v.*) ORDER BY v.display_order)
             FROM menu_item_variations v
             WHERE v.menu_item_id = item_id AND v.is_available = true),
            '[]'::jsonb
        ),
        'addons', COALESCE(
            (SELECT jsonb_agg(
                jsonb_build_object(
                    'addon', row_to_json(a.*),
                    'is_required', mia.is_required,
                    'max_quantity', mia.max_quantity
                ) ORDER BY a.display_order
            )
             FROM menu_item_addons mia
             JOIN menu_addons a ON a.id = mia.addon_id
             WHERE (mia.menu_item_id = item_id OR mia.category_id = mi.category_id)
             AND a.is_available = true),
            '[]'::jsonb
        )
    ) INTO result
    FROM menu_items mi
    WHERE mi.id = item_id;

    RETURN result;
END;
$$;

-- Function to get all add-ons for a category
CREATE OR REPLACE FUNCTION public.get_category_addons(cat_id UUID)
RETURNS TABLE (
    addon_id UUID,
    addon_name TEXT,
    addon_description TEXT,
    addon_price NUMERIC,
    addon_image_url TEXT,
    addon_category TEXT,
    is_required BOOLEAN,
    max_quantity INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.name,
        a.description,
        a.price,
        a.image_url,
        a.category,
        mia.is_required,
        mia.max_quantity
    FROM menu_item_addons mia
    JOIN menu_addons a ON a.id = mia.addon_id
    WHERE mia.category_id = cat_id
    AND a.is_available = true
    ORDER BY a.display_order, a.name;
END;
$$;

-- ============================================================================
-- STEP 8: Create updated_at triggers
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER handle_variations_updated_at
    BEFORE UPDATE ON public.menu_item_variations
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_addons_updated_at
    BEFORE UPDATE ON public.menu_addons
    FOR EACH ROW
    EXECUTE PROCEDURE public.handle_updated_at();

-- ============================================================================
-- STEP 9: Add comments for documentation
-- ============================================================================

COMMENT ON TABLE public.menu_item_variations IS 'Stores size/variant options for menu items (Small/Medium/Large, etc.)';
COMMENT ON TABLE public.menu_addons IS 'Stores add-ons and modifiers (Boba, pizza toppings, extra cheese, etc.)';
COMMENT ON TABLE public.menu_item_addons IS 'Links add-ons to specific items or entire categories';

COMMENT ON COLUMN public.menu_item_variations.price_adjustment IS 'Amount to add/subtract from base item price for this variation';
COMMENT ON COLUMN public.menu_item_addons.menu_item_id IS 'Links add-on to specific item (NULL for category-wide)';
COMMENT ON COLUMN public.menu_item_addons.category_id IS 'Links add-on to entire category (NULL for item-specific)';
COMMENT ON COLUMN public.order_items.selected_addons IS 'JSONB array of selected add-ons: [{"addon_id": "uuid", "quantity": 1, "price": 15}]';

COMMIT;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ Created menu_item_variations table for size options (Small/Medium/Large)
-- ✅ Created menu_addons table for modifiers (Boba, toppings, etc.)
-- ✅ Created menu_item_addons junction table with flexible linking
-- ✅ Updated order_items to track variations and add-ons
-- ✅ Added RLS policies for security
-- ✅ Created helper functions for querying
-- ✅ Added proper indexes for performance
-- ============================================================================
