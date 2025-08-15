-- =====================================================
-- LITTLE LATTE LANE - Menu Data Population
-- =====================================================
-- Run this AFTER running database-setup.sql
-- This populates all menu categories and items

BEGIN;

-- =====================================================
-- INSERT MENU CATEGORIES
-- =====================================================

INSERT INTO menu_categories (name, description, display_order, is_active) VALUES 
    ('Hot Drinks', 'Freshly brewed espresso-based drinks and teas', 1, true),
    ('Lattes', 'Specialty lattes with artisan syrups and flavors', 2, true),
    ('Iced Lattes', 'Cold specialty coffee drinks perfect for warm days', 3, true),
    ('Frappes', 'Blended iced coffee drinks with decadent flavors', 4, true),
    ('Fizzers', 'Refreshing sparkling drinks and sodas', 5, true),
    ('Freezos', 'Frozen coffee and specialty drinks', 6, true),
    ('Smoothies', 'Healthy fruit and protein smoothies', 7, true),
    ('Scones', 'Freshly baked scones with sweet and savory options', 8, true),
    ('Pizza', 'Wood-fired artisan pizzas made to order', 9, true),
    ('Pizza Add-ons', 'Extra toppings to customize your pizza', 10, true),
    ('Toasties', 'Grilled sandwiches with fresh ingredients', 11, true),
    ('All Day Brekkies', 'Breakfast options available all day long', 12, true),
    ('All Day Meals', 'Hearty meals perfect for lunch or dinner', 13, true),
    ('Sides', 'Perfect accompaniments to your main meal', 14, true),
    ('Extras', 'Add-ons to enhance your meal', 15, true),
    ('Monna & Rassies Corner', 'Kid-friendly options for our younger guests', 16, true);

-- =====================================================
-- INSERT HOT DRINKS
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Espresso Regular', 'Single shot of our signature espresso blend', 20.00, 5, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Espresso Large', 'Double shot of our signature espresso blend', 25.00, 5, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Americano Regular', 'Rich espresso with hot water', 25.00, 8, 3),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Americano Large', 'Double shot americano with hot water', 30.00, 8, 4),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Cortado', 'Equal parts espresso and warm milk', 30.00, 10, 5),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Flat White', 'Rich espresso with microfoamed milk', 35.00, 10, 6),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Cappuccino', 'Classic espresso with steamed milk and foam', 37.00, 10, 7),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Mochachino', 'Espresso with chocolate and steamed milk', 37.00, 12, 8),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Hot Chocolate', 'Rich hot chocolate with marshmallows', 33.00, 10, 9),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Hot Coco-Chocolate Regular', 'Premium coconut hot chocolate', 40.00, 12, 10),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Hot Coco-Chocolate Large', 'Large premium coconut hot chocolate', 45.00, 12, 11),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Red Cappuccino', 'South African rooibos cappuccino', 37.00, 10, 12),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), '5 Roses Tea Regular', 'Traditional black tea', 20.00, 5, 13),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), '5 Roses Tea Large', 'Large traditional black tea', 25.00, 5, 14),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Rooibos Tea Regular', 'Caffeine-free South African red bush tea', 20.00, 5, 15),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Rooibos Tea Large', 'Large caffeine-free red bush tea', 25.00, 5, 16),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Babychino', 'Steamed milk with cocoa powder - perfect for little ones', 25.00, 5, 17),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Steamers', 'Hot steamed milk with your choice of syrup', 33.00, 8, 18),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Vanilla/Shortbread/Butterscotch Steamer', 'Flavored steamed milk', 33.00, 8, 19),
    ((SELECT id FROM menu_categories WHERE name = 'Hot Drinks'), 'Hazelnut Steamer', 'Steamed milk with hazelnut syrup', 33.00, 8, 20);

-- =====================================================
-- INSERT LATTES
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Cafe Latte', 'Classic espresso with steamed milk', 37.00, 12, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Salted Caramel Latte', 'Rich caramel with a hint of sea salt', 37.00, 12, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Butterscotch Latte', 'Sweet butterscotch flavored latte', 37.00, 12, 3),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Shortbread Cookies Latte', 'Buttery shortbread cookie flavored latte', 37.00, 12, 4),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Hazelnut Latte', 'Smooth hazelnut flavored latte', 37.00, 12, 5),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Vanilla Latte', 'Classic vanilla bean latte', 37.00, 12, 6),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Caramel Latte', 'Sweet caramel flavored latte', 37.00, 12, 7),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Pumpkin Spice Latte', 'Seasonal spiced latte with warming flavors', 37.00, 12, 8),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Chai Latte', 'Spiced tea latte with aromatic spices', 45.00, 15, 9),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Dirty Chai Latte', 'Chai latte with an espresso shot', 45.00, 15, 10),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Red Chai Latte', 'Rooibos-based spiced latte', 45.00, 15, 11),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Spanish Salted Caramel Latte', 'Premium Spanish caramel with sea salt', 48.00, 15, 12),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Honey Toffeenut Latte', 'Sweet honey and toffee nut combination', 48.00, 15, 13),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Baklawa Macchiato', 'Middle Eastern inspired honey and nut latte', 55.00, 18, 14),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Coco Mocha Latte', 'Coconut and chocolate combination', 48.00, 15, 15),
    ((SELECT id FROM menu_categories WHERE name = 'Lattes'), 'Creme Brulee Latte', 'Rich custard and caramelized sugar flavors', 48.00, 15, 16);

-- =====================================================
-- INSERT ICED LATTES
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Iced Lattes'), 'Iced Shortbread Cortado', 'Cold cortado with shortbread cookie flavor', 55.00, 15, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Iced Lattes'), 'White Russian Iced Mocha', 'Coffee cocktail inspired iced mocha', 55.00, 15, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Iced Lattes'), 'Salted Caramel & Pecan Latte', 'Iced latte with caramel and pecan flavors', 55.00, 15, 3),
    ((SELECT id FROM menu_categories WHERE name = 'Iced Lattes'), 'Pistachio Choco Latte', 'Iced latte with pistachio and chocolate', 55.00, 15, 4),
    ((SELECT id FROM menu_categories WHERE name = 'Iced Lattes'), 'Almond Spanish Macchiato', 'Iced macchiato with Spanish almond flavor', 55.00, 15, 5),
    ((SELECT id FROM menu_categories WHERE name = 'Iced Lattes'), 'Coco-Matcha Latte', 'Coconut and matcha green tea iced latte', 55.00, 15, 6),
    ((SELECT id FROM menu_categories WHERE name = 'Iced Lattes'), 'Mango Coco Coffee Latte', 'Tropical mango and coconut iced coffee', 55.00, 15, 7);

-- =====================================================
-- INSERT FRAPPES
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Frappes'), 'Butterscotch Frappe', 'Blended iced coffee with butterscotch', 60.00, 12, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Frappes'), 'Salted Caramel Frappe', 'Blended caramel frappe with sea salt', 60.00, 12, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Frappes'), 'Mocha Frappe', 'Rich chocolate and coffee frappe', 60.00, 12, 3),
    ((SELECT id FROM menu_categories WHERE name = 'Frappes'), 'Toffee Nut Frappe', 'Sweet toffee and nut flavored frappe', 60.00, 12, 4),
    ((SELECT id FROM menu_categories WHERE name = 'Frappes'), 'Chai Frappe', 'Spiced tea frappe', 60.00, 12, 5),
    ((SELECT id FROM menu_categories WHERE name = 'Frappes'), 'Dirty Chai Frappe', 'Spiced chai frappe with espresso', 60.00, 12, 6),
    ((SELECT id FROM menu_categories WHERE name = 'Frappes'), 'Chocolate Brownie Frappe', 'Decadent brownie flavored frappe', 63.00, 15, 7),
    ((SELECT id FROM menu_categories WHERE name = 'Frappes'), 'Choc Chip Cookie Frappe', 'Cookie-inspired chocolate chip frappe', 63.00, 15, 8),
    ((SELECT id FROM menu_categories WHERE name = 'Frappes'), 'Strawberry-Shortcake Frappe', 'Dessert-inspired strawberry frappe', 63.00, 15, 9),
    ((SELECT id FROM menu_categories WHERE name = 'Frappes'), 'Mango Cheesecake Frappe', 'Tropical mango cheesecake frappe', 63.00, 15, 10);

-- =====================================================
-- INSERT FIZZERS
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Fizzers'), 'Strawberry & Watermelon Fizzer', 'Refreshing fruit fizzer', 52.00, 8, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Fizzers'), 'Strawberry & Passionfruit Fizzer', 'Tropical fruit combination', 52.00, 8, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Fizzers'), 'Raspberry Fizz', 'Tart and sweet raspberry fizzer', 52.00, 8, 3),
    ((SELECT id FROM menu_categories WHERE name = 'Fizzers'), 'Mint Lemonade', 'Fresh mint and lemon fizzer', 52.00, 8, 4),
    ((SELECT id FROM menu_categories WHERE name = 'Fizzers'), 'Mixed Berry Lemonade', 'Berry medley with lemon fizzer', 52.00, 8, 5),
    ((SELECT id FROM menu_categories WHERE name = 'Fizzers'), 'Peach Fizz', 'Sweet peach flavored fizzer', 52.00, 8, 6),
    ((SELECT id FROM menu_categories WHERE name = 'Fizzers'), 'Coco Passion Fizz', 'Coconut and passionfruit fizzer', 52.00, 8, 7);

-- =====================================================
-- INSERT FREEZOS
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Freezos'), 'Butterscotch Freezo', 'Frozen butterscotch coffee drink', 55.00, 10, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Freezos'), 'Salted Caramel Freezo', 'Frozen salted caramel coffee drink', 55.00, 10, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Freezos'), 'Mocha Freezo', 'Frozen chocolate coffee drink', 55.00, 10, 3),
    ((SELECT id FROM menu_categories WHERE name = 'Freezos'), 'Chocolate Freezo', 'Rich frozen chocolate drink', 55.00, 10, 4),
    ((SELECT id FROM menu_categories WHERE name = 'Freezos'), 'Chai Freezo', 'Frozen spiced chai drink', 55.00, 10, 5),
    ((SELECT id FROM menu_categories WHERE name = 'Freezos'), 'Dirty Chai Freezo', 'Frozen chai with espresso', 55.00, 10, 6);

-- =====================================================
-- INSERT SMOOTHIES
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order, allergens) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Smoothies'), 'Berry, Almond & Banana Smoothie', 'Mixed berries with almond and banana', 82.00, 8, 1, ARRAY['nuts']),
    ((SELECT id FROM menu_categories WHERE name = 'Smoothies'), 'Spiced Mango and Banana Smoothie', 'Tropical mango with warming spices', 82.00, 8, 2, NULL),
    ((SELECT id FROM menu_categories WHERE name = 'Smoothies'), 'Green Power Smoothie', 'Nutrient-packed green vegetable smoothie', 78.00, 8, 3, NULL),
    ((SELECT id FROM menu_categories WHERE name = 'Smoothies'), 'Protein Breakfast Smoothie', 'High-protein morning boost smoothie', 82.00, 8, 4, ARRAY['dairy']),
    ((SELECT id FROM menu_categories WHERE name = 'Smoothies'), 'High Protein Blueberry Smoothie', 'Protein-rich blueberry smoothie', 82.00, 8, 5, ARRAY['dairy']),
    ((SELECT id FROM menu_categories WHERE name = 'Smoothies'), 'Vanilla Berry Smoothie', 'Sweet vanilla with mixed berries', 78.00, 8, 6, ARRAY['dairy']),
    ((SELECT id FROM menu_categories WHERE name = 'Smoothies'), 'Peanut Butter & Banana Smoothie', 'Creamy peanut butter and banana blend', 82.00, 8, 7, ARRAY['nuts', 'dairy']);

-- =====================================================
-- INSERT SCONES
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Scones'), 'Savory Bacon & Cheese Scone', 'Freshly baked with crispy bacon and cheese', 43.00, 0, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Scones'), 'Cheese & Strawberry Jam Scone', 'Sweet and savory combination', 43.00, 0, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Scones'), 'Cream Scone', 'Traditional scone served with cream', 45.00, 0, 3);

-- =====================================================
-- INSERT PIZZA
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Pizza'), 'Regina Pizza Small', 'Ham and cheese on wood-fired base', 42.00, 25, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza'), 'Regina Pizza Large', 'Ham and cheese on wood-fired base', 98.00, 30, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza'), 'Margarita Pizza Small', 'Fresh mozzarella and basil', 35.00, 25, 3),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza'), 'Margarita Pizza Large', 'Fresh mozzarella and basil', 82.00, 30, 4);

-- =====================================================
-- INSERT PIZZA ADD-ONS
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Salami Small', 'Premium salami topping', 10.00, 0, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Salami Large', 'Premium salami topping', 15.00, 0, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Ham Small', 'Quality ham topping', 7.00, 0, 3),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Ham Large', 'Quality ham topping', 12.00, 0, 4),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Avo Small', 'Fresh avocado slices', 10.00, 0, 5),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Avo Large', 'Fresh avocado slices', 15.00, 0, 6),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Pineapple Small', 'Sweet pineapple chunks', 7.00, 0, 7),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Pineapple Large', 'Sweet pineapple chunks', 12.00, 0, 8),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Figs Small', 'Fresh fig slices', 12.00, 0, 9),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Figs Large', 'Fresh fig slices', 17.00, 0, 10),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Olives Small', 'Mediterranean olives', 8.00, 0, 11),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Olives Large', 'Mediterranean olives', 17.00, 0, 12),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Mushrooms Small', 'Fresh mushroom slices', 12.00, 0, 13),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Mushrooms Large', 'Fresh mushroom slices', 17.00, 0, 14),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Garlic Small', 'Fresh garlic pieces', 5.00, 0, 15),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Garlic Large', 'Fresh garlic pieces', 10.00, 0, 16),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Feta Small', 'Crumbled feta cheese', 10.00, 0, 17),
    ((SELECT id FROM menu_categories WHERE name = 'Pizza Add-ons'), 'Feta Large', 'Crumbled feta cheese', 15.00, 0, 18);

-- =====================================================
-- INSERT TOASTIES
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Toasties'), 'Ham, Cheese & Tomato Toastie', 'Classic grilled sandwich combination', 52.00, 12, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Toasties'), 'Chicken Mayo Toastie', 'Grilled chicken with creamy mayo', 67.00, 12, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Toasties'), 'Bacon, Egg & Cheese Toastie', 'Hearty breakfast toastie', 70.00, 15, 3),
    ((SELECT id FROM menu_categories WHERE name = 'Toasties'), 'Tomato, Cheese & Onion Toastie', 'Vegetarian grilled sandwich', 52.00, 12, 4);

-- =====================================================
-- INSERT ALL DAY BREKKIES
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'All Day Brekkies'), 'Yogurt and Granola', 'Greek yogurt with house-made granola', 65.00, 5, 1),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Brekkies'), 'Brekkie Roll (Bacon & Egg)', 'Fresh roll with bacon and egg', 45.00, 12, 2),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Brekkies'), 'Cheese Griller Brekkie', 'Grilled cheese sausage with sides', 80.00, 15, 3),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Brekkies'), 'Avo on Toast', 'Fresh avocado on artisan toast', 45.00, 8, 4);

-- =====================================================
-- INSERT ALL DAY MEALS
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'All Day Meals'), 'Chicken Wrap with Chips', 'Grilled chicken wrap with chips', 115.00, 18, 1),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Meals'), 'Chicken Wrap with Salad', 'Grilled chicken wrap with side salad', 115.00, 18, 2),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Meals'), 'Halloumi Wrap', 'Grilled halloumi cheese wrap', 87.00, 15, 3),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Meals'), 'Halloumi Wrap with Chips', 'Halloumi wrap served with chips', 115.00, 18, 4),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Meals'), 'Chicken Burger', 'Grilled chicken burger', 87.00, 20, 5),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Meals'), 'Chicken Burger with Chips', 'Chicken burger served with chips', 97.00, 22, 6),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Meals'), 'Beef Burger', 'Premium beef burger', 87.00, 20, 7),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Meals'), 'Beef Burger with Chips', 'Beef burger served with chips', 97.00, 22, 8),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Meals'), 'Boujee Bowl', 'Our signature healthy bowl', 116.00, 15, 9),
    ((SELECT id FROM menu_categories WHERE name = 'All Day Meals'), 'Pie & Gravy', 'Traditional pie with rich gravy', 75.00, 12, 10);

-- =====================================================
-- INSERT SIDES
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Sides'), 'Small Chips (350g)', 'Crispy golden chips', 25.00, 8, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Sides'), 'Large Chips (500g)', 'Large portion of crispy chips', 47.00, 10, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Sides'), 'Small Saucy Chips', 'Chips with your choice of sauce', 52.00, 10, 3),
    ((SELECT id FROM menu_categories WHERE name = 'Sides'), 'Large Saucy Chips', 'Large saucy chips with choice of sauce', 65.00, 12, 4),
    ((SELECT id FROM menu_categories WHERE name = 'Sides'), 'Side Greek Salad', 'Fresh Greek salad with feta and olives', 75.00, 8, 5);

-- =====================================================
-- INSERT EXTRAS
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Extras'), 'Extra Egg', 'Add a fried or scrambled egg', 6.00, 3, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Extras'), 'Extra Cheese', 'Add cheese to any dish', 10.00, 0, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Extras'), 'Extra Avo (Seasonal)', 'Fresh avocado slices', 10.00, 2, 3);

-- =====================================================
-- INSERT MONNA & RASSIES CORNER (KIDS)
-- =====================================================

INSERT INTO menu_items (category_id, name, description, price, preparation_time, display_order) VALUES 
    ((SELECT id FROM menu_categories WHERE name = 'Monna & Rassies Corner'), 'Chicken Strips', 'Crispy chicken strips perfect for kids', 77.00, 15, 1),
    ((SELECT id FROM menu_categories WHERE name = 'Monna & Rassies Corner'), 'Vienna and Chips', 'Vienna sausage with chips', 75.00, 12, 2),
    ((SELECT id FROM menu_categories WHERE name = 'Monna & Rassies Corner'), 'Small Margarita Pizza', 'Kid-sized margarita pizza', 35.00, 20, 3);

-- =====================================================
-- UPDATE ADMIN SETTINGS WITH RESTAURANT INFO
-- =====================================================

UPDATE admin_settings SET setting_value = '{
    "name": "Little Latte Lane",
    "phone": "+27823456789",
    "email": "orders@littlelattlane.com",
    "address": "Little Latte Lane Restaurant, South Africa",
    "website": "www.littlelattlane.com"
}'::jsonb WHERE setting_key = 'restaurant_info';

UPDATE admin_settings SET setting_value = '{
    "min_delivery_amount": 50.00,
    "delivery_fee": 25.00,
    "estimated_prep_time": 20,
    "max_daily_orders": 100,
    "order_cutoff_time": "21:00"
}'::jsonb WHERE setting_key = 'order_settings';

COMMIT;

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify all data was inserted correctly

SELECT 
    mc.name as category,
    COUNT(mi.id) as item_count,
    MIN(mi.price) as min_price,
    MAX(mi.price) as max_price
FROM menu_categories mc
LEFT JOIN menu_items mi ON mc.id = mi.category_id
WHERE mc.is_active = true
GROUP BY mc.name, mc.display_order
ORDER BY mc.display_order;
