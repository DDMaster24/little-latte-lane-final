-- ============================================================================
-- FULL DATABASE AUDIT - Shows EVERYTHING currently in the database
-- Run this and paste ALL results back
-- ============================================================================

-- PART 1: All Categories
SELECT '=== CATEGORIES ===' as section;
SELECT
    id,
    name,
    display_order,
    is_active
FROM menu_categories
ORDER BY display_order, name;

-- PART 2: All Menu Items (grouped by category)
SELECT '=== MENU ITEMS BY CATEGORY ===' as section;
SELECT
    c.name as category,
    mi.id as item_id,
    mi.name as item_name,
    mi.price,
    mi.is_available
FROM menu_items mi
LEFT JOIN menu_categories c ON c.id = mi.category_id
ORDER BY c.display_order, c.name, mi.name;

-- PART 3: Count of items per category
SELECT '=== ITEM COUNT BY CATEGORY ===' as section;
SELECT
    c.name as category,
    COUNT(mi.id) as item_count
FROM menu_categories c
LEFT JOIN menu_items mi ON mi.category_id = c.id
GROUP BY c.id, c.name, c.display_order
ORDER BY c.display_order;

-- PART 4: All Menu Item Variations
SELECT '=== ALL MENU ITEM VARIATIONS ===' as section;
SELECT
    mi.name as item_name,
    v.name as variation_name,
    v.absolute_price,
    v.price_adjustment,
    v.is_default,
    v.display_order
FROM menu_item_variations v
JOIN menu_items mi ON mi.id = v.menu_item_id
ORDER BY mi.name, v.display_order;

-- PART 5: All Add-ons
SELECT '=== ALL ADD-ONS ===' as section;
SELECT
    id,
    name,
    description,
    price,
    category,
    display_order,
    is_available
FROM menu_addons
ORDER BY category, display_order, name;

-- PART 6: All Add-on Variations
SELECT '=== ALL ADD-ON VARIATIONS ===' as section;
SELECT
    a.name as addon_name,
    v.name as variation_name,
    v.absolute_price,
    v.price_adjustment,
    v.is_default,
    v.display_order
FROM addon_variations v
JOIN menu_addons a ON a.id = v.addon_id
ORDER BY a.name, v.display_order;

-- PART 7: Add-on Links (what's linked where)
SELECT '=== ADD-ON LINKS ===' as section;
SELECT
    a.name as addon_name,
    c.name as linked_to_category,
    mi.name as linked_to_item
FROM menu_item_addons mal
JOIN menu_addons a ON a.id = mal.addon_id
LEFT JOIN menu_categories c ON c.id = mal.category_id
LEFT JOIN menu_items mi ON mi.id = mal.menu_item_id
ORDER BY a.name, c.name, mi.name;

-- PART 8: Summary Stats
SELECT '=== SUMMARY STATISTICS ===' as section;
SELECT
    (SELECT COUNT(*) FROM menu_categories) as total_categories,
    (SELECT COUNT(*) FROM menu_items) as total_menu_items,
    (SELECT COUNT(*) FROM menu_item_variations) as total_item_variations,
    (SELECT COUNT(*) FROM menu_addons) as total_addons,
    (SELECT COUNT(*) FROM addon_variations) as total_addon_variations,
    (SELECT COUNT(*) FROM menu_item_addons) as total_addon_links;

-- PART 9: Items with NO variations (should have sizes but don't)
SELECT '=== ITEMS WITHOUT VARIATIONS ===' as section;
SELECT
    c.name as category,
    mi.name,
    mi.price
FROM menu_items mi
LEFT JOIN menu_categories c ON c.id = mi.category_id
LEFT JOIN menu_item_variations v ON v.menu_item_id = mi.id
WHERE v.id IS NULL
ORDER BY c.name, mi.name
LIMIT 50;

-- PART 10: Duplicate items (same name, different IDs)
SELECT '=== DUPLICATE ITEMS ===' as section;
SELECT
    name,
    COUNT(*) as duplicate_count,
    STRING_AGG(id::text, ', ') as ids,
    STRING_AGG(price::text, ', ') as prices
FROM menu_items
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC, name;
