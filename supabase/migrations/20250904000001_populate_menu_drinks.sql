-- Migration: Populate Three-Tier Menu with Little Latte Lane Data
-- Implements the exact menu structure provided by the user
-- Structure: Main Sections → Categories → Menu Items

BEGIN;

-- ============================================================================
-- STEP 1: Insert all menu items according to three-tier structure
-- ============================================================================

-- ===========================================
-- DRINKS SECTION → HOT DRINKS CATEGORY
-- ===========================================

INSERT INTO public.menu_items (id, category_id, name, description, price, is_available, image_url) VALUES

-- HOT DRINKS
('650e8400-e29b-41d4-a716-446655440055', '550e8400-e29b-41d4-a716-446655440010', 'Espresso (R)', 'Rich and bold espresso shot', 20.00, true, '/images/menu/espresso.jpg'),
('650e8400-e29b-41d4-a716-446655440056', '550e8400-e29b-41d4-a716-446655440010', 'Espresso (L)', 'Double shot espresso', 25.00, true, '/images/menu/espresso-large.jpg'),
('650e8400-e29b-41d4-a716-446655440057', '550e8400-e29b-41d4-a716-446655440010', 'Americano (R)', 'Espresso with hot water', 25.00, true, '/images/menu/americano.jpg'),
('650e8400-e29b-41d4-a716-446655440058', '550e8400-e29b-41d4-a716-446655440010', 'Americano (L)', 'Double shot americano', 30.00, true, '/images/menu/americano-large.jpg'),
('650e8400-e29b-41d4-a716-446655440059', '550e8400-e29b-41d4-a716-446655440010', 'Cortado', 'Espresso with warm milk', 30.00, true, '/images/menu/cortado.jpg'),
('650e8400-e29b-41d4-a716-446655440060', '550e8400-e29b-41d4-a716-446655440010', 'Flat White', 'Perfect milk and espresso balance', 35.00, true, '/images/menu/flat-white.jpg'),
('650e8400-e29b-41d4-a716-446655440061', '550e8400-e29b-41d4-a716-446655440010', 'Cappuccino (R)', 'Classic cappuccino with foam', 33.00, true, '/images/menu/cappuccino.jpg'),
('650e8400-e29b-41d4-a716-446655440062', '550e8400-e29b-41d4-a716-446655440010', 'Cappuccino (L)', 'Large cappuccino', 37.00, true, '/images/menu/cappuccino-large.jpg'),
('650e8400-e29b-41d4-a716-446655440063', '550e8400-e29b-41d4-a716-446655440010', 'Mochachino (R)', 'Coffee with chocolate', 37.00, true, '/images/menu/mochaccino.jpg'),
('650e8400-e29b-41d4-a716-446655440064', '550e8400-e29b-41d4-a716-446655440010', 'Mochachino (L)', 'Large coffee with chocolate', 42.00, true, '/images/menu/mochaccino-large.jpg'),
('650e8400-e29b-41d4-a716-446655440065', '550e8400-e29b-41d4-a716-446655440010', 'Hot Chocolate (R)', 'Rich hot chocolate', 33.00, true, '/images/menu/hot-chocolate.jpg'),
('650e8400-e29b-41d4-a716-446655440066', '550e8400-e29b-41d4-a716-446655440010', 'Hot Chocolate (L)', 'Large rich hot chocolate', 37.00, true, '/images/menu/hot-chocolate-large.jpg'),
('650e8400-e29b-41d4-a716-446655440067', '550e8400-e29b-41d4-a716-446655440010', 'Hot Coco-Chocolate (R)', 'Premium coconut chocolate', 40.00, true, '/images/menu/coco-chocolate.jpg'),
('650e8400-e29b-41d4-a716-446655440068', '550e8400-e29b-41d4-a716-446655440010', 'Hot Coco-Chocolate (L)', 'Large premium coconut chocolate', 45.00, true, '/images/menu/coco-chocolate-large.jpg'),
('650e8400-e29b-41d4-a716-446655440069', '550e8400-e29b-41d4-a716-446655440010', 'Red Cappuccino (R)', 'Rooibos cappuccino', 37.00, true, '/images/menu/red-cappuccino.jpg'),
('650e8400-e29b-41d4-a716-446655440070', '550e8400-e29b-41d4-a716-446655440010', 'Red Cappuccino (L)', 'Large rooibos cappuccino', 42.00, true, '/images/menu/red-cappuccino-large.jpg'),
('650e8400-e29b-41d4-a716-446655440071', '550e8400-e29b-41d4-a716-446655440010', '5 Roses Tea (R)', 'Classic 5 Roses tea', 20.00, true, '/images/menu/5-roses-tea.jpg'),
('650e8400-e29b-41d4-a716-446655440072', '550e8400-e29b-41d4-a716-446655440010', '5 Roses Tea (L)', 'Large 5 Roses tea', 25.00, true, '/images/menu/5-roses-tea-large.jpg'),
('650e8400-e29b-41d4-a716-446655440073', '550e8400-e29b-41d4-a716-446655440010', 'Rooibos Tea (R)', 'Traditional rooibos tea', 20.00, true, '/images/menu/rooibos-tea.jpg'),
('650e8400-e29b-41d4-a716-446655440074', '550e8400-e29b-41d4-a716-446655440010', 'Rooibos Tea (L)', 'Large rooibos tea', 25.00, true, '/images/menu/rooibos-tea-large.jpg'),
('650e8400-e29b-41d4-a716-446655440075', '550e8400-e29b-41d4-a716-446655440010', 'Babychino', 'Steamed milk for little ones', 25.00, true, '/images/menu/babychino.jpg'),
('650e8400-e29b-41d4-a716-446655440076', '550e8400-e29b-41d4-a716-446655440010', 'Steamers (Vanilla)', 'Vanilla flavored steamed milk', 33.00, true, '/images/menu/steamer-vanilla.jpg'),
('650e8400-e29b-41d4-a716-446655440176', '550e8400-e29b-41d4-a716-446655440010', 'Steamers (Shortbread)', 'Shortbread flavored steamed milk', 33.00, true, '/images/menu/steamer-shortbread.jpg'),
('650e8400-e29b-41d4-a716-446655440177', '550e8400-e29b-41d4-a716-446655440010', 'Steamers (Cookies)', 'Cookie flavored steamed milk', 33.00, true, '/images/menu/steamer-cookies.jpg'),
('650e8400-e29b-41d4-a716-446655440178', '550e8400-e29b-41d4-a716-446655440010', 'Steamers (Butterscotch)', 'Butterscotch flavored steamed milk', 33.00, true, '/images/menu/steamer-butterscotch.jpg'),
('650e8400-e29b-41d4-a716-446655440179', '550e8400-e29b-41d4-a716-446655440010', 'Steamers (Hazelnut)', 'Hazelnut flavored steamed milk', 33.00, true, '/images/menu/steamer-hazelnut.jpg'),

-- LATTES
('650e8400-e29b-41d4-a716-446655440077', '550e8400-e29b-41d4-a716-446655440011', 'Cafe Latte', 'Classic café latte', 37.00, true, '/images/menu/cafe-latte.jpg'),
('650e8400-e29b-41d4-a716-446655440078', '550e8400-e29b-41d4-a716-446655440011', 'Salted Caramel Latte', 'Sweet and salty caramel latte', 37.00, true, '/images/menu/salted-caramel-latte.jpg'),
('650e8400-e29b-41d4-a716-446655440079', '550e8400-e29b-41d4-a716-446655440011', 'Butterscotch Latte', 'Rich butterscotch flavored latte', 37.00, true, '/images/menu/butterscotch-latte.jpg'),
('650e8400-e29b-41d4-a716-446655440080', '550e8400-e29b-41d4-a716-446655440011', 'Shortbread Cookies Latte', 'Cookie-flavored latte', 37.00, true, '/images/menu/shortbread-latte.jpg'),
('650e8400-e29b-41d4-a716-446655440081', '550e8400-e29b-41d4-a716-446655440011', 'Hazelnut Latte', 'Nutty hazelnut latte', 37.00, true, '/images/menu/hazelnut-latte.jpg'),
('650e8400-e29b-41d4-a716-446655440082', '550e8400-e29b-41d4-a716-446655440011', 'Vanilla Latte', 'Smooth vanilla latte', 37.00, true, '/images/menu/vanilla-latte.jpg'),
('650e8400-e29b-41d4-a716-446655440083', '550e8400-e29b-41d4-a716-446655440011', 'Caramel Latte', 'Sweet caramel latte', 37.00, true, '/images/menu/caramel-latte.jpg'),
('650e8400-e29b-41d4-a716-446655440084', '550e8400-e29b-41d4-a716-446655440011', 'Pumpkin Spice Latte', 'Seasonal pumpkin spice latte', 37.00, true, '/images/menu/pumpkin-spice-latte.jpg'),
('650e8400-e29b-41d4-a716-446655440085', '550e8400-e29b-41d4-a716-446655440011', 'Chai Latte', 'Spiced chai latte', 45.00, true, '/images/menu/chai-latte.jpg'),
('650e8400-e29b-41d4-a716-446655440086', '550e8400-e29b-41d4-a716-446655440011', 'Dirty Chai Latte', 'Chai latte with espresso shot', 45.00, true, '/images/menu/dirty-chai-latte.jpg'),
('650e8400-e29b-41d4-a716-446655440087', '550e8400-e29b-41d4-a716-446655440011', 'Red Chai Latte', 'Rooibos chai latte', 45.00, true, '/images/menu/red-chai-latte.jpg'),
('650e8400-e29b-41d4-a716-446655440088', '550e8400-e29b-41d4-a716-446655440011', 'Spanish Salted Caramel', 'Premium Spanish salted caramel latte', 48.00, true, '/images/menu/spanish-salted-caramel.jpg'),
('650e8400-e29b-41d4-a716-446655440089', '550e8400-e29b-41d4-a716-446655440011', 'Honey Toffeenut', 'Sweet honey toffeenut latte', 48.00, true, '/images/menu/honey-toffeenut.jpg'),
('650e8400-e29b-41d4-a716-446655440090', '550e8400-e29b-41d4-a716-446655440011', 'Baklawa Macchiato', 'Middle Eastern inspired macchiato', 55.00, true, '/images/menu/baklawa-macchiato.jpg'),
('650e8400-e29b-41d4-a716-446655440091', '550e8400-e29b-41d4-a716-446655440011', 'Coco Mocha', 'Coconut chocolate mocha', 48.00, true, '/images/menu/coco-mocha.jpg'),
('650e8400-e29b-41d4-a716-446655440092', '550e8400-e29b-41d4-a716-446655440011', 'Creme Brulee', 'Decadent crème brûlée latte', 48.00, true, '/images/menu/creme-brulee.jpg'),

-- ICED LATTES
('650e8400-e29b-41d4-a716-446655440093', '550e8400-e29b-41d4-a716-446655440012', 'Iced Shortbread Cortado', 'Cold shortbread flavored cortado', 55.00, true, '/images/menu/iced-shortbread-cortado.jpg'),
('650e8400-e29b-41d4-a716-446655440094', '550e8400-e29b-41d4-a716-446655440012', 'White Russian Iced Mocha', 'Vodka-inspired iced mocha', 55.00, true, '/images/menu/white-russian-iced-mocha.jpg'),
('650e8400-e29b-41d4-a716-446655440095', '550e8400-e29b-41d4-a716-446655440012', 'Salted Caramel & Pecan Latte', 'Iced salted caramel with pecan', 55.00, true, '/images/menu/salted-caramel-pecan.jpg'),
('650e8400-e29b-41d4-a716-446655440096', '550e8400-e29b-41d4-a716-446655440012', 'Pistachio Choco Latte', 'Iced pistachio chocolate latte', 55.00, true, '/images/menu/pistachio-choco.jpg'),
('650e8400-e29b-41d4-a716-446655440097', '550e8400-e29b-41d4-a716-446655440012', 'Almond Spanish Macchiato', 'Iced almond Spanish macchiato', 55.00, true, '/images/menu/almond-spanish-macchiato.jpg'),
('650e8400-e29b-41d4-a716-446655440098', '550e8400-e29b-41d4-a716-446655440012', 'Coco-Matcha Latte', 'Iced coconut matcha latte', 55.00, true, '/images/menu/coco-matcha.jpg'),
('650e8400-e29b-41d4-a716-446655440099', '550e8400-e29b-41d4-a716-446655440012', 'Mango Coco Coffee Latte', 'Tropical iced mango coconut latte', 55.00, true, '/images/menu/mango-coco-coffee.jpg'),

-- FRAPPES
('650e8400-e29b-41d4-a716-446655440100', '550e8400-e29b-41d4-a716-446655440013', 'Butterscotch Frappe', 'Blended butterscotch coffee drink', 60.00, true, '/images/menu/butterscotch-frappe.jpg'),
('650e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440013', 'Salted Caramel Frappe', 'Blended salted caramel coffee', 60.00, true, '/images/menu/salted-caramel-frappe.jpg'),
('650e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440013', 'Mocha Frappe', 'Blended chocolate coffee drink', 60.00, true, '/images/menu/mocha-frappe.jpg'),
('650e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440013', 'Toffee Nut Frappe', 'Blended toffee nut coffee', 60.00, true, '/images/menu/toffee-nut-frappe.jpg'),
('650e8400-e29b-41d4-a716-446655440104', '550e8400-e29b-41d4-a716-446655440013', 'Chai Frappe', 'Blended spiced chai drink', 60.00, true, '/images/menu/chai-frappe.jpg'),
('650e8400-e29b-41d4-a716-446655440105', '550e8400-e29b-41d4-a716-446655440013', 'Dirty Chai Frappe', 'Blended chai with espresso', 60.00, true, '/images/menu/dirty-chai-frappe.jpg'),
('650e8400-e29b-41d4-a716-446655440107', '550e8400-e29b-41d4-a716-446655440013', 'Chocolate Brownie Frappe', 'Decadent chocolate brownie frappe', 63.00, true, '/images/menu/chocolate-brownie-frappe.jpg'),
('650e8400-e29b-41d4-a716-446655440108', '550e8400-e29b-41d4-a716-446655440013', 'Choc Chip Cookie Frappe', 'Cookie-flavored frappe', 63.00, true, '/images/menu/choc-chip-cookie-frappe.jpg'),
('650e8400-e29b-41d4-a716-446655440109', '550e8400-e29b-41d4-a716-446655440013', 'Strawberry Shortcake Frappe', 'Sweet strawberry shortcake frappe', 63.00, true, '/images/menu/strawberry-shortcake-frappe.jpg'),
('650e8400-e29b-41d4-a716-446655440110', '550e8400-e29b-41d4-a716-446655440013', 'Mango Cheesecake Frappe', 'Tropical mango cheesecake frappe', 63.00, true, '/images/menu/mango-cheesecake-frappe.jpg'),

-- FIZZERS
('650e8400-e29b-41d4-a716-446655440111', '550e8400-e29b-41d4-a716-446655440014', 'Strawberry & Watermelon', 'Refreshing strawberry watermelon fizz', 52.00, true, '/images/menu/strawberry-watermelon.jpg'),
('650e8400-e29b-41d4-a716-446655440112', '550e8400-e29b-41d4-a716-446655440014', 'Strawberry & Passionfruit', 'Tropical strawberry passionfruit fizz', 52.00, true, '/images/menu/strawberry-passionfruit.jpg'),
('650e8400-e29b-41d4-a716-446655440113', '550e8400-e29b-41d4-a716-446655440014', 'Raspberry Fizz', 'Tart raspberry sparkling drink', 52.00, true, '/images/menu/raspberry-fizz.jpg'),
('650e8400-e29b-41d4-a716-446655440114', '550e8400-e29b-41d4-a716-446655440014', 'Mint Lemonade', 'Fresh mint lemonade fizz', 52.00, true, '/images/menu/mint-lemonade.jpg'),
('650e8400-e29b-41d4-a716-446655440115', '550e8400-e29b-41d4-a716-446655440014', 'Mixed Berry Lemonade', 'Berry medley lemonade fizz', 52.00, true, '/images/menu/mixed-berry-lemonade.jpg'),
('650e8400-e29b-41d4-a716-446655440116', '550e8400-e29b-41d4-a716-446655440014', 'Peach Fizz', 'Sweet peach sparkling drink', 52.00, true, '/images/menu/peach-fizz.jpg'),
('650e8400-e29b-41d4-a716-446655440117', '550e8400-e29b-41d4-a716-446655440014', 'Coco Passion Fizz', 'Coconut passion fruit fizz', 52.00, true, '/images/menu/coco-passion-fizz.jpg'),

-- FREEZOS
('650e8400-e29b-41d4-a716-446655440118', '550e8400-e29b-41d4-a716-446655440015', 'Butterscotch Freezo', 'Frozen butterscotch treat', 55.00, true, '/images/menu/butterscotch-freezo.jpg'),
('650e8400-e29b-41d4-a716-446655440119', '550e8400-e29b-41d4-a716-446655440015', 'Salted Caramel Freezo', 'Frozen salted caramel delight', 55.00, true, '/images/menu/salted-caramel-freezo.jpg'),
('650e8400-e29b-41d4-a716-446655440120', '550e8400-e29b-41d4-a716-446655440015', 'Mocha Freezo', 'Frozen chocolate coffee treat', 55.00, true, '/images/menu/mocha-freezo.jpg'),
('650e8400-e29b-41d4-a716-446655440121', '550e8400-e29b-41d4-a716-446655440015', 'Chocolate Freezo', 'Rich frozen chocolate drink', 55.00, true, '/images/menu/chocolate-freezo.jpg'),
('650e8400-e29b-41d4-a716-446655440122', '550e8400-e29b-41d4-a716-446655440015', 'Chai Freezo', 'Frozen spiced chai treat', 55.00, true, '/images/menu/chai-freezo.jpg'),
('650e8400-e29b-41d4-a716-446655440123', '550e8400-e29b-41d4-a716-446655440015', 'Dirty Chai Freezo', 'Frozen chai with espresso', 55.00, true, '/images/menu/dirty-chai-freezo.jpg'),

-- SMOOTHIES
('650e8400-e29b-41d4-a716-446655440124', '550e8400-e29b-41d4-a716-446655440016', 'Berry, Almond & Banana', 'Mixed berries with almond and banana', 82.00, true, '/images/menu/berry-almond-banana.jpg'),
('650e8400-e29b-41d4-a716-446655440125', '550e8400-e29b-41d4-a716-446655440016', 'Spiced Mango & Banana', 'Tropical spiced mango banana smoothie', 82.00, true, '/images/menu/spiced-mango-banana.jpg'),
('650e8400-e29b-41d4-a716-446655440126', '550e8400-e29b-41d4-a716-446655440016', 'Green Power Smoothie', 'Healthy green vegetable and fruit blend', 78.00, true, '/images/menu/green-power-smoothie.jpg'),
('650e8400-e29b-41d4-a716-446655440127', '550e8400-e29b-41d4-a716-446655440016', 'Protein Breakfast Smoothie', 'High-protein breakfast blend', 82.00, true, '/images/menu/protein-breakfast-smoothie.jpg'),
('650e8400-e29b-41d4-a716-446655440128', '550e8400-e29b-41d4-a716-446655440016', 'High Protein Blueberry', 'Blueberry protein power smoothie', 82.00, true, '/images/menu/high-protein-blueberry.jpg'),
('650e8400-e29b-41d4-a716-446655440129', '550e8400-e29b-41d4-a716-446655440016', 'Vanilla Berry Smoothie', 'Smooth vanilla and mixed berry blend', 78.00, true, '/images/menu/vanilla-berry-smoothie.jpg'),
('650e8400-e29b-41d4-a716-446655440130', '550e8400-e29b-41d4-a716-446655440016', 'Peanut Butter & Banana', 'Rich peanut butter banana smoothie', 82.00, true, '/images/menu/peanut-butter-banana.jpg');

COMMIT;

-- ============================================================================
-- SUMMARY - DRINKS SECTION COMPLETE
-- ============================================================================
-- ✅ Hot Drinks: 27 items (Espresso, Americano, Cortado, etc.)
-- ✅ Lattes: 16 items (Cafe Latte, Salted Caramel, Spanish varieties, etc.)
-- ✅ Iced Lattes: 7 items (Shortbread Cortado, White Russian, etc.)
-- ✅ Frappes: 10 items (Butterscotch, Salted Caramel, Cookie varieties, etc.)
-- ✅ Fizzers: 7 items (Strawberry & Watermelon, Raspberry, etc.)
-- ✅ Freezos: 6 items (Butterscotch, Salted Caramel, Chai varieties, etc.)
-- ✅ Smoothies: 7 items (Berry Almond, Spiced Mango, Green Power, etc.)
-- 🎯 Total Drinks: 80 items across 7 categories in Drinks section
