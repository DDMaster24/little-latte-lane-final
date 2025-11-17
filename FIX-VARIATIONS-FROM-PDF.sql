-- ============================================================================
-- FIX VARIATIONS TO MATCH PDF EXACTLY
-- Deletes all incorrect variations and rebuilds from PDF menu
-- ============================================================================

BEGIN;

-- STEP 1: Delete ALL existing variations (they're corrupted)
DELETE FROM menu_item_variations;

-- STEP 2: Rebuild variations based on EXACT PDF data

-- HOT DRINKS
-- Espresso: Single (R25), Double (R29)
INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
SELECT id, 'Single', 25.00, true, 1 FROM menu_items WHERE name = 'Espresso'
UNION ALL
SELECT id, 'Double', 29.00, false, 2 FROM menu_items WHERE name = 'Espresso';

-- Americano: S (R29), M (R37), L (R48)
INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
SELECT id, 'Small', 29.00, true, 1 FROM menu_items WHERE name = 'Americano'
UNION ALL
SELECT id, 'Medium', 37.00, false, 2 FROM menu_items WHERE name = 'Americano'
UNION ALL
SELECT id, 'Large', 48.00, false, 3 FROM menu_items WHERE name = 'Americano';

-- Cappuccino: S (R36), M (R42), L (R53)
INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
SELECT id, 'Small', 36.00, true, 1 FROM menu_items WHERE name = 'Cappuccino'
UNION ALL
SELECT id, 'Medium', 42.00, false, 2 FROM menu_items WHERE name = 'Cappuccino'
UNION ALL
SELECT id, 'Large', 53.00, false, 3 FROM menu_items WHERE name = 'Cappuccino';

-- Mochachino: S (R42), M (R48), L (R58)
INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
SELECT id, 'Small', 42.00, true, 1 FROM menu_items WHERE name = 'Mochachino'
UNION ALL
SELECT id, 'Medium', 48.00, false, 2 FROM menu_items WHERE name = 'Mochachino'
UNION ALL
SELECT id, 'Large', 58.00, false, 3 FROM menu_items WHERE name = 'Mochachino';

-- Hot Chocolate: S (R39), M (R46), L (R56)
INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
SELECT id, 'Small', 39.00, true, 1 FROM menu_items WHERE name = 'Hot Chocolate'
UNION ALL
SELECT id, 'Medium', 46.00, false, 2 FROM menu_items WHERE name = 'Hot Chocolate'
UNION ALL
SELECT id, 'Large', 56.00, false, 3 FROM menu_items WHERE name = 'Hot Chocolate';

-- Hot Coco-Chocolate: S (R45), M (R52), L (R62)
INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
SELECT id, 'Small', 45.00, true, 1 FROM menu_items WHERE name = 'Hot Coco-Chocolate'
UNION ALL
SELECT id, 'Medium', 52.00, false, 2 FROM menu_items WHERE name = 'Hot Coco-Chocolate'
UNION ALL
SELECT id, 'Large', 62.00, false, 3 FROM menu_items WHERE name = 'Hot Coco-Chocolate';

-- Red Cappuccino: S (R39), M (R45), L (R57)
INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
SELECT id, 'Small', 39.00, true, 1 FROM menu_items WHERE name = 'Red Cappuccino'
UNION ALL
SELECT id, 'Medium', 45.00, false, 2 FROM menu_items WHERE name = 'Red Cappuccino'
UNION ALL
SELECT id, 'Large', 57.00, false, 3 FROM menu_items WHERE name = 'Red Cappuccino';

-- 5 Roses Tea: S (R30), M (R35) - ONLY 2 SIZES!
INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
SELECT id, 'Small', 30.00, true, 1 FROM menu_items WHERE name = '5 Roses Tea'
UNION ALL
SELECT id, 'Medium', 35.00, false, 2 FROM menu_items WHERE name = '5 Roses Tea';

-- Rooibos Tea: S (R30), M (R35)
INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
SELECT id, 'Small', 30.00, true, 1 FROM menu_items WHERE name = 'Rooibos Tea'
UNION ALL
SELECT id, 'Medium', 35.00, false, 2 FROM menu_items WHERE name = 'Rooibos Tea';

-- Steamers: S (R38), M (R47), L (R57)
INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
SELECT id, 'Small', 38.00, true, 1 FROM menu_items WHERE name = 'Steamers'
UNION ALL
SELECT id, 'Medium', 47.00, false, 2 FROM menu_items WHERE name = 'Steamers'
UNION ALL
SELECT id, 'Large', 57.00, false, 3 FROM menu_items WHERE name = 'Steamers';

-- Flat White: Base (R40), M (R47) - NOTE: Flat White doesn't have S/M/L, just base + M
INSERT INTO menu_item_variations (menu_item_id, name, absolute_price, is_default, display_order)
SELECT id, 'Regular', 40.00, true, 1 FROM menu_items WHERE name = 'Flat White'
UNION ALL
SELECT id, 'Medium', 47.00, false, 2 FROM menu_items WHERE name = 'Flat White';

COMMIT;

-- Verification
SELECT
    mi.name,
    COUNT(v.id) as size_count,
    STRING_AGG(v.name || ' (R' || v.absolute_price || ')', ', ' ORDER BY v.display_order) as sizes
FROM menu_items mi
INNER JOIN menu_item_variations v ON v.menu_item_id = mi.id
WHERE mi.name IN ('5 Roses Tea', 'Americano', 'Cappuccino', 'Espresso', 'Flat White')
GROUP BY mi.id, mi.name
ORDER BY mi.name;
