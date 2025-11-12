-- Migration: Populate All Day Menu and Kids Sections
-- Implements: All Day Brekkies, All Day Meals, Monna & Rassie's Corner
-- Structure: Main Sections → Categories → Menu Items

BEGIN;

-- ===========================================
-- ALL DAY MENU SECTION
-- ===========================================

INSERT INTO public.menu_items (id, category_id, name, description, price, is_available, image_url) VALUES

-- ALL DAY BREKKIES
('650e8400-e29b-41d4-a716-446655440039', '550e8400-e29b-41d4-a716-446655440007', 'Yogurt & Granold (V)', 'Greek yogurt with house-made granola', 65.00, true, '/images/menu/yogurt-granola.jpg'),
('650e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440007', 'Brekkie Roll (Bacon & Egg)', 'Fresh roll with bacon and egg', 45.00, true, '/images/menu/brekkie-roll.jpg'),
('650e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440007', 'Cheese Griller Brekkie', 'Grilled cheese with breakfast sides', 80.00, true, '/images/menu/cheese-griller.jpg'),
('650e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440007', 'Avo on Toast (V)', 'Smashed avocado on artisan toast', 45.00, true, '/images/menu/avo-toast.jpg'),

-- ALL DAY MEALS
('650e8400-e29b-41d4-a716-446655440043', '550e8400-e29b-41d4-a716-446655440008', 'Chicken Wrap (Chips or Salad)', 'Grilled chicken wrap with choice of side', 115.00, true, '/images/menu/chicken-wrap.jpg'),
('650e8400-e29b-41d4-a716-446655440044', '550e8400-e29b-41d4-a716-446655440008', 'Halloumi Wrap (V) / With Chips', 'Grilled halloumi wrap with or without chips', 87.00, true, '/images/menu/halloumi-wrap.jpg'),
('650e8400-e29b-41d4-a716-446655440046', '550e8400-e29b-41d4-a716-446655440008', 'Chicken Burger / With Chips', 'Grilled chicken burger with or without chips', 87.00, true, '/images/menu/chicken-burger.jpg'),
('650e8400-e29b-41d4-a716-446655440048', '550e8400-e29b-41d4-a716-446655440008', 'Beef Burger / With Chips', 'Juicy beef burger with or without chips', 87.00, true, '/images/menu/beef-burger.jpg'),
('650e8400-e29b-41d4-a716-446655440050', '550e8400-e29b-41d4-a716-446655440008', 'Boujee Bowl', 'Signature bowl with fresh ingredients', 116.00, true, '/images/menu/boujee-bowl.jpg'),
('650e8400-e29b-41d4-a716-446655440051', '550e8400-e29b-41d4-a716-446655440008', 'Pie & Gravy', 'Traditional pie with rich gravy', 75.00, true, '/images/menu/pie-gravy.jpg'),

-- ===========================================
-- KIDS SECTION
-- ===========================================

-- MONNA & RASSIE'S CORNER
('650e8400-e29b-41d4-a716-446655440052', '550e8400-e29b-41d4-a716-446655440009', 'Chicken Strips', 'Crispy chicken strips perfect for kids', 77.00, true, '/images/menu/chicken-strips.jpg'),
('650e8400-e29b-41d4-a716-446655440053', '550e8400-e29b-41d4-a716-446655440009', 'Vienna & Chips', 'Vienna sausage with chips', 75.00, true, '/images/menu/vienna-chips.jpg'),
('650e8400-e29b-41d4-a716-446655440054', '550e8400-e29b-41d4-a716-446655440009', 'Small Margarita Pizza', 'Kid-sized margherita pizza', 36.00, true, '/images/menu/small-margherita.jpg');

COMMIT;

-- ============================================================================
-- SUMMARY - ALL DAY MENU & KIDS SECTIONS COMPLETE
-- ============================================================================
-- 
-- ALL DAY MENU SECTION:
-- ✅ All Day Brekkies: 4 items (Yogurt & Granold, Brekkie Roll, Cheese Griller, Avo on Toast)
-- ✅ All Day Meals: 6 items (Chicken Wrap, Halloumi Wrap, Chicken/Beef Burgers, Boujee Bowl, Pie & Gravy)
-- 
-- KIDS SECTION:
-- ✅ Monna & Rassie's Corner: 3 items (Chicken Strips, Vienna & Chips, Small Margarita Pizza)
-- 
-- 🎯 Total All Day Menu: 10 items across 2 categories
-- 🎯 Total Kids: 3 items across 1 category
-- 
-- 📝 Notes:
-- - Burger/wrap pricing includes option for with or without chips
-- - Halloumi wrap shows as R87 base price (chips option handled via modifiers)
-- - All items properly categorized within their respective sections
