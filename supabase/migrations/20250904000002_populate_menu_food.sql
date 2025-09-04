-- Migration: Populate Food Section Menu Items
-- Implements: Scones, Pizza, Toasties, Sides, Extras
-- Structure: Food Section → Categories → Menu Items

BEGIN;

-- ===========================================
-- FOOD SECTION MENU ITEMS
-- ===========================================

INSERT INTO public.menu_items (id, category_id, name, description, price, is_available, image_url) VALUES

-- SCONES
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Savory Bacon & Cheese', 'Fresh baked scone with crispy bacon and melted cheese', 43.00, true, '/images/menu/bacon-cheese-scone.jpg'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Cheese & Strawberry Jam', 'Classic scone with cheese and house-made strawberry jam', 43.00, true, '/images/menu/cheese-jam-scone.jpg'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Cream', 'Traditional cream scone with clotted cream', 45.00, true, '/images/menu/cream-scone.jpg'),

-- PIZZA (Base pizzas only - add-ons are modifiers, not standalone items)
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'Regina (Ham & Cheese) (S)', 'Classic ham and cheese pizza - Small', 42.00, true, '/images/menu/regina-small.jpg'),
('650e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'Regina (Ham & Cheese) (L)', 'Classic ham and cheese pizza - Large', 89.00, true, '/images/menu/regina-large.jpg'),
('650e8400-e29b-41d4-a716-446655440006', '550e8400-e29b-41d4-a716-446655440002', 'Margarita (Mozzarella & Basic) (S)', 'Traditional margherita with fresh mozzarella and basil - Small', 35.00, true, '/images/menu/margherita-small.jpg'),
('650e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'Margarita (Mozzarella & Basic) (L)', 'Traditional margherita with fresh mozzarella and basil - Large', 82.00, true, '/images/menu/margherita-large.jpg'),

-- TOASTIES
('650e8400-e29b-41d4-a716-446655440035', '550e8400-e29b-41d4-a716-446655440006', 'Ham, Cheese & Tomato', 'Classic toasted sandwich with ham, cheese and tomato', 52.00, true, '/images/menu/ham-cheese-tomato.jpg'),
('650e8400-e29b-41d4-a716-446655440036', '550e8400-e29b-41d4-a716-446655440006', 'Chicken Mayo', 'Toasted sandwich with chicken and mayo', 67.00, true, '/images/menu/chicken-mayo.jpg'),
('650e8400-e29b-41d4-a716-446655440037', '550e8400-e29b-41d4-a716-446655440006', 'Bacon, Egg & Cheese', 'Hearty toasted sandwich with bacon, egg and cheese', 70.00, true, '/images/menu/bacon-egg-cheese.jpg'),
('650e8400-e29b-41d4-a716-446655440038', '550e8400-e29b-41d4-a716-446655440006', 'Tomato, Cheese & Onion (V)', 'Vegetarian toasted sandwich', 52.00, true, '/images/menu/tomato-cheese-onion.jpg'),

-- SIDES
('650e8400-e29b-41d4-a716-446655440026', '550e8400-e29b-41d4-a716-446655440004', 'Small Chips (350g)', 'Crispy golden chips', 25.00, true, '/images/menu/small-chips.jpg'),
('650e8400-e29b-41d4-a716-446655440027', '550e8400-e29b-41d4-a716-446655440004', 'Large Chips (500g)', 'Crispy golden chips', 47.00, true, '/images/menu/large-chips.jpg'),
('650e8400-e29b-41d4-a716-446655440028', '550e8400-e29b-41d4-a716-446655440004', 'Small Saucy Chips', 'Chips with your choice of sauce', 52.00, true, '/images/menu/saucy-chips.jpg'),
('650e8400-e29b-41d4-a716-446655440029', '550e8400-e29b-41d4-a716-446655440004', 'Large Saucy Chips', 'Chips with your choice of sauce', 65.00, true, '/images/menu/saucy-chips.jpg'),
('650e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440004', 'Side Greek Salad', 'Fresh Greek salad with feta and olives', 75.00, true, '/images/menu/greek-salad.jpg'),

-- EXTRAS
('650e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440005', 'Egg', 'Fresh fried or scrambled egg', 6.00, true, '/images/menu/egg.jpg'),
('650e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440005', 'Cheese', 'Extra cheese for any dish', 10.00, true, '/images/menu/cheese.jpg'),
('650e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440005', 'Avo (Seasonal)', 'Fresh avocado when in season', 10.00, true, '/images/menu/avocado.jpg');

COMMIT;

-- ============================================================================
-- SUMMARY - FOOD SECTION COMPLETE
-- ============================================================================
-- ✅ Scones: 3 items (Savory Bacon & Cheese, Cheese & Strawberry Jam, Cream)
-- ✅ Pizza: 4 base pizzas (Regina S/L, Margarita S/L) 
--    Note: Pizza add-ons stored as modifiers, not individual menu items
-- ✅ Toasties: 4 items (Ham/Cheese/Tomato, Chicken Mayo, Bacon/Egg/Cheese, Tomato/Cheese/Onion)
-- ✅ Sides: 5 items (Small/Large Chips, Small/Large Saucy Chips, Side Greek Salad)
-- ✅ Extras: 3 items (Egg, Cheese, Avo Seasonal)
-- 🎯 Total Food: 19 items across 5 categories in Food section
-- 
-- 📝 Note: Available breads (White, Brown, Ciabatta, Rye & Croissant) 
--    should be handled as modifiers/options, not separate menu items
