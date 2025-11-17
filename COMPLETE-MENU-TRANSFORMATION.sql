-- ============================================================================
-- LITTLE LATTE LANE - COMPLETE MENU TRANSFORMATION
-- Date: November 11, 2025
-- Purpose: Transform 308 messy items into clean structure with add-ons & variations
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: CREATE ADD-ONS
-- ============================================================================

-- 1A. BOBA (with flavor variations using item_variations)
INSERT INTO menu_addons (id, name, description, price, category, display_order, is_available)
VALUES
  (gen_random_uuid(), 'Boba (Bubble Popping)', 'Add a pop to your day with a bobalicious touch!', 20.00, 'Drink Enhancers', 1, true)
RETURNING id AS boba_id \gset

-- Store boba_id for later use (we'll need to manually insert variations after getting the ID)

-- 1B. PISTACHIO ADD-ON (with Single/Double variations)
INSERT INTO menu_addons (id, name, description, price, category, display_order, is_available)
VALUES
  (gen_random_uuid(), 'Pistachio Shot', 'Premium pistachio flavor boost', 15.00, 'Drink Enhancers', 2, true);

-- 1C. MILK ALTERNATIVES (4 types, each with S/M variations)
INSERT INTO menu_addons (id, name, description, price, category, display_order, is_available)
VALUES
  (gen_random_uuid(), 'Soya Milk', 'Dairy-free soya milk alternative', 12.00, 'Milk Alternatives', 10, true),
  (gen_random_uuid(), 'Almond Milk', 'Dairy-free almond milk alternative', 12.00, 'Milk Alternatives', 11, true),
  (gen_random_uuid(), 'Oat Milk', 'Dairy-free oat milk alternative', 12.00, 'Milk Alternatives', 12, true),
  (gen_random_uuid(), 'Macadamia Nut Milk', 'Premium dairy-free macadamia milk', 12.00, 'Milk Alternatives', 13, true);

-- 1D. PIZZA TOPPINGS (11 items, each with S/L variations)
INSERT INTO menu_addons (id, name, description, price, category, display_order, is_available)
VALUES
  (gen_random_uuid(), 'Salami', 'Pizza topping', 15.00, 'Pizza Toppings', 20, true),
  (gen_random_uuid(), 'Ham', 'Pizza topping', 10.00, 'Pizza Toppings', 21, true),
  (gen_random_uuid(), 'Chicken', 'Pizza topping', 15.00, 'Pizza Toppings', 22, true),
  (gen_random_uuid(), 'Russian', 'Pizza topping', 10.00, 'Pizza Toppings', 23, true),
  (gen_random_uuid(), 'Avo', 'Pizza topping', 15.00, 'Pizza Toppings', 24, true),
  (gen_random_uuid(), 'Pineapple', 'Pizza topping', 10.00, 'Pizza Toppings', 25, true),
  (gen_random_uuid(), 'Figs', 'Pizza topping', 15.00, 'Pizza Toppings', 26, true),
  (gen_random_uuid(), 'Olives', 'Pizza topping', 10.00, 'Pizza Toppings', 27, true),
  (gen_random_uuid(), 'Mushrooms', 'Pizza topping', 15.00, 'Pizza Toppings', 28, true),
  (gen_random_uuid(), 'Garlic', 'Pizza topping', 5.00, 'Pizza Toppings', 29, true),
  (gen_random_uuid(), 'Feta Cheese', 'Pizza topping', 15.00, 'Pizza Toppings', 30, true);

-- 1E. MEAL EXTRAS (3 items, single price)
INSERT INTO menu_addons (id, name, description, price, category, display_order, is_available)
VALUES
  (gen_random_uuid(), 'Extra Egg', 'Add egg to your meal', 15.00, 'Meal Extras', 40, true),
  (gen_random_uuid(), 'Extra Cheese', 'Add cheese to your meal', 10.00, 'Meal Extras', 41, true),
  (gen_random_uuid(), 'Seasonal Avo', 'Add avocado to your meal (seasonal)', 18.00, 'Meal Extras', 42, true);

-- ============================================================================
-- STEP 2: CREATE ADDON VARIATIONS
-- ============================================================================

-- We need to manually add Boba flavors as variations
-- This requires the addon ID from step 1A - we'll do this in a separate transaction

-- For now, let's prepare the structure
COMMENT ON TABLE menu_addons IS 'Add-ons can have variations (flavors, sizes) stored in a separate table';

-- ============================================================================
-- STEP 3: LINK ADD-ONS TO CATEGORIES
-- ============================================================================

-- 3A. Link BOBA to drink categories (Freezos, Frappes, Smoothies, Iced Lattes, Fizzers)
INSERT INTO menu_item_addons (addon_id, category_id)
SELECT
  a.id as addon_id,
  c.id as category_id
FROM menu_addons a
CROSS JOIN menu_categories c
WHERE a.name = 'Boba (Bubble Popping)'
AND c.name IN ('Freezos', 'Frappes', 'Smoothies', 'Iced Lattes', 'Fizzers');

-- 3B. Link PISTACHIO to all drink categories
INSERT INTO menu_item_addons (addon_id, category_id)
SELECT
  a.id as addon_id,
  c.id as category_id
FROM menu_addons a
CROSS JOIN menu_categories c
WHERE a.name = 'Pistachio Shot'
AND c.name IN ('Hot Drinks', 'Lattes', 'Iced Lattes', 'Frappes', 'Freezos', 'Smoothies', 'Fizzers');

-- 3C. Link MILK ALTERNATIVES to coffee/latte categories
INSERT INTO menu_item_addons (addon_id, category_id)
SELECT
  a.id as addon_id,
  c.id as category_id
FROM menu_addons a
CROSS JOIN menu_categories c
WHERE a.category = 'Milk Alternatives'
AND c.name IN ('Hot Drinks', 'Lattes', 'Iced Lattes');

-- 3D. Link PIZZA TOPPINGS to Pizza category
INSERT INTO menu_item_addons (addon_id, category_id)
SELECT
  a.id as addon_id,
  c.id as category_id
FROM menu_addons a
CROSS JOIN menu_categories c
WHERE a.category = 'Pizza Toppings'
AND c.name = 'Pizza';

-- 3E. Link MEAL EXTRAS to meal categories
INSERT INTO menu_item_addons (addon_id, category_id)
SELECT
  a.id as addon_id,
  c.id as category_id
FROM menu_addons a
CROSS JOIN menu_categories c
WHERE a.category = 'Meal Extras'
AND c.name IN ('All Day Brekkies', 'All Day Meals', 'Toasties');

-- ============================================================================
-- STEP 4: CONSOLIDATE SIZE VARIATIONS
-- This is the BIG ONE - consolidate 185 items into ~60 base items with variations
-- ============================================================================

-- NOTE: This step is complex and needs to be done carefully item by item
-- We'll create a separate script for this that handles each category
-- For safety, we'll do this in a follow-up transaction

COMMIT;

-- ============================================================================
-- SUMMARY OF WHAT WAS CREATED:
-- ============================================================================
-- ✅ 1 Boba add-on (needs 5 flavor variations added separately)
-- ✅ 1 Pistachio add-on (needs Single/Double variations added separately)
-- ✅ 4 Milk Alternative add-ons (need S/M variations added separately)
-- ✅ 11 Pizza Topping add-ons (need S/L variations added separately)
-- ✅ 3 Meal Extra add-ons (single price, no variations)
-- ✅ All add-ons linked to appropriate categories
--
-- TOTAL: 20 add-ons created
-- NEXT STEP: Add variations to add-ons, then consolidate menu items
-- ============================================================================
