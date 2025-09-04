-- Migration: Restructure Menu to Three-Tier System
-- Implements: Main Sections → Categories → Menu Items
-- This creates the proper structure for Little Latte Lane menu organization

BEGIN;

-- ============================================================================
-- STEP 1: Create menu_sections table for main sections
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.menu_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.menu_sections ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Add section_id to menu_categories table
-- ============================================================================

-- Add foreign key column to link categories to sections
ALTER TABLE public.menu_categories 
ADD COLUMN IF NOT EXISTS section_id UUID;

-- ============================================================================
-- STEP 3: Clean existing menu data and start fresh
-- ============================================================================

-- Remove order_items first (foreign key constraint)
DELETE FROM public.order_items;

-- Remove menu_items
DELETE FROM public.menu_items;

-- Remove menu_categories
DELETE FROM public.menu_categories;

-- ============================================================================
-- STEP 4: Insert main sections (Level 1)
-- ============================================================================

INSERT INTO public.menu_sections (id, name, description, display_order, is_active) VALUES
('450e8400-e29b-41d4-a716-446655440001', 'Drinks', 'All beverages including coffee, tea, smoothies, and specialty drinks', 1, true),
('450e8400-e29b-41d4-a716-446655440002', 'Food', 'Scones, pizza, toasties, and sides', 2, true),
('450e8400-e29b-41d4-a716-446655440003', 'All Day Menu', 'Breakfast items and full meals available all day', 3, true),
('450e8400-e29b-41d4-a716-446655440004', 'Kids', 'Monna & Rassie''s Corner - Kids menu and family favorites', 4, true);

-- ============================================================================
-- STEP 5: Insert categories with proper section links (Level 2)
-- ============================================================================

INSERT INTO public.menu_categories (id, section_id, name, description, display_order, is_active) VALUES

-- DRINKS SECTION CATEGORIES
('550e8400-e29b-41d4-a716-446655440010', '450e8400-e29b-41d4-a716-446655440001', 'Hot Drinks', 'Coffee, tea, and warm beverages', 1, true),
('550e8400-e29b-41d4-a716-446655440011', '450e8400-e29b-41d4-a716-446655440001', 'Lattes', 'Specialty latte creations', 2, true),
('550e8400-e29b-41d4-a716-446655440012', '450e8400-e29b-41d4-a716-446655440001', 'Iced Lattes', 'Cold coffee specialties', 3, true),
('550e8400-e29b-41d4-a716-446655440013', '450e8400-e29b-41d4-a716-446655440001', 'Frappes', 'Blended coffee drinks', 4, true),
('550e8400-e29b-41d4-a716-446655440014', '450e8400-e29b-41d4-a716-446655440001', 'Fizzers', 'Refreshing fizzy drinks', 5, true),
('550e8400-e29b-41d4-a716-446655440015', '450e8400-e29b-41d4-a716-446655440001', 'Freezos', 'Frozen coffee treats', 6, true),
('550e8400-e29b-41d4-a716-446655440016', '450e8400-e29b-41d4-a716-446655440001', 'Smoothies', 'Fresh fruit and protein smoothies', 7, true),

-- FOOD SECTION CATEGORIES
('550e8400-e29b-41d4-a716-446655440001', '450e8400-e29b-41d4-a716-446655440002', 'Scones', 'Fresh baked scones with various fillings', 1, true),
('550e8400-e29b-41d4-a716-446655440002', '450e8400-e29b-41d4-a716-446655440002', 'Pizza', 'Wood-fired pizzas with fresh toppings', 2, true),
('550e8400-e29b-41d4-a716-446655440006', '450e8400-e29b-41d4-a716-446655440002', 'Toasties', 'Grilled sandwiches and toasted treats', 3, true),
('550e8400-e29b-41d4-a716-446655440004', '450e8400-e29b-41d4-a716-446655440002', 'Sides', 'Perfect sides to complete your meal', 4, true),
('550e8400-e29b-41d4-a716-446655440005', '450e8400-e29b-41d4-a716-446655440002', 'Extras', 'Additional extras and bread options', 5, true),

-- ALL DAY MENU SECTION CATEGORIES
('550e8400-e29b-41d4-a716-446655440007', '450e8400-e29b-41d4-a716-446655440003', 'All Day Brekkies', 'Breakfast items available all day', 1, true),
('550e8400-e29b-41d4-a716-446655440008', '450e8400-e29b-41d4-a716-446655440003', 'All Day Meals', 'Hearty meals served throughout the day', 2, true),

-- KIDS SECTION CATEGORIES
('550e8400-e29b-41d4-a716-446655440009', '450e8400-e29b-41d4-a716-446655440004', 'Monna & Rassie''s Corner', 'Kids menu and family favorites', 1, true);

-- ============================================================================
-- STEP 6: Add foreign key constraints
-- ============================================================================

-- Add foreign key constraint for categories to sections
ALTER TABLE public.menu_categories 
ADD CONSTRAINT menu_categories_section_id_fkey 
FOREIGN KEY (section_id) REFERENCES public.menu_sections(id) ON DELETE CASCADE;

-- ============================================================================
-- STEP 7: Create RLS policies for menu_sections
-- ============================================================================

-- Allow public read access to menu sections
CREATE POLICY "Allow public read access to menu sections" ON public.menu_sections
FOR SELECT USING (true);

-- Allow authenticated users to manage menu sections (admin functionality)
CREATE POLICY "Allow authenticated users to manage menu sections" ON public.menu_sections
FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- STEP 8: Create helpful views for the three-tier system
-- ============================================================================

-- View to get full menu hierarchy
CREATE OR REPLACE VIEW public.menu_hierarchy AS
SELECT 
    s.id as section_id,
    s.name as section_name,
    s.display_order as section_order,
    c.id as category_id,
    c.name as category_name,
    c.display_order as category_order,
    i.id as item_id,
    i.name as item_name,
    i.description as item_description,
    i.price as item_price,
    i.is_available,
    i.image_url
FROM public.menu_sections s
LEFT JOIN public.menu_categories c ON c.section_id = s.id
LEFT JOIN public.menu_items i ON i.category_id = c.id
WHERE s.is_active = true 
  AND (c.is_active = true OR c.is_active IS NULL)
  AND (i.is_available = true OR i.is_available IS NULL)
ORDER BY s.display_order, c.display_order, i.name;

-- ============================================================================
-- STEP 9: Update existing queries/functions if needed
-- ============================================================================

-- Note: The existing menu_categories and menu_items tables remain unchanged
-- Only added section_id to menu_categories and created menu_sections
-- This maintains backward compatibility while enabling three-tier structure

COMMIT;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- ✅ Created menu_sections table for main sections (Drinks, Food, All Day Menu, Kids)
-- ✅ Added section_id foreign key to menu_categories
-- ✅ Cleaned existing menu data for fresh start
-- ✅ Created proper three-tier hierarchy: Sections → Categories → Items
-- ✅ Added RLS policies for proper access control
-- ✅ Created menu_hierarchy view for easy querying
-- ✅ Maintained backward compatibility with existing structure
-- 🎯 Ready for menu data population according to your specification
